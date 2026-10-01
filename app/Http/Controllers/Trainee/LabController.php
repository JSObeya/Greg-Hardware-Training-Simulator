<?php

namespace App\Http\Controllers\Trainee;

use App\Http\Controllers\Controller;
use App\Models\LabAssignment;
use App\Models\TraineeAttempt;
use App\Models\TraineeAnswer;
use App\Models\Score;
use App\Models\RepairReport;
use App\Models\ComponentQuestion;
use App\Models\HotspotQuestion;
use App\Models\AssemblyStep;
use App\Models\TroubleshootingScenario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Inertia\Inertia;

class LabController extends Controller
{
    public function dashboard()
    {
        $traineeId = Auth::id();

        $assignments = LabAssignment::where('trainee_id', $traineeId)
            ->with(['lab.module.course', 'attempts.score'])
            ->get();

        return Inertia::render('Trainee/Dashboard', [
            'assignments' => $assignments
        ]);
    }

    public function show(LabAssignment $assignment)
    {
        // Abort if not assigned to this trainee
        if ($assignment->trainee_id !== Auth::id()) {
            abort(403, 'Unauthorized access to this lab assignment.');
        }

        $lab = $assignment->lab->load([
            'module.course',
            'assets',
            'componentQuestions',
            'hotspotQuestions',
            'assemblySteps',
            'troubleshootingScenarios',
        ]);

        $isExpired = $lab->isExpired();
        $isAvailable = $lab->isAvailable();

        // Find or check for an active attempt
        $activeAttempt = TraineeAttempt::where('lab_assignment_id', $assignment->id)
            ->where('status', 'started')
            ->first();

        // Get completed attempts
        $completedAttempts = TraineeAttempt::where('lab_assignment_id', $assignment->id)
            ->whereIn('status', ['submitted', 'graded'])
            ->with('score')
            ->get();

        return Inertia::render('Trainee/LabSandbox', [
            'assignment' => $assignment,
            'lab' => $lab,
            'isAvailable' => $isAvailable,
            'isExpired' => $isExpired,
            'activeAttempt' => $activeAttempt,
            'completedAttempts' => $completedAttempts,
        ]);
    }

    public function start(LabAssignment $assignment)
    {
        if ($assignment->trainee_id !== Auth::id()) {
            abort(403);
        }

        $lab = $assignment->lab;

        if (!$lab->is_active) {
            return redirect()->back()->withErrors(['error' => 'This simulation lab is currently deactivated by the instructor.']);
        }

        if ($lab->isExpired()) {
            $expiryDate = $lab->expires_at ? $lab->expires_at->format('M d, Y H:i') : 'Unknown';
            return redirect()->back()->withErrors(['error' => "This simulation lab expired on {$expiryDate} and is no longer accessible."]);
        }

        // Close any stale started attempts
        TraineeAttempt::where('lab_assignment_id', $assignment->id)
            ->where('status', 'started')
            ->update([
                'status' => 'submitted',
                'completed_at' => Carbon::now(),
            ]);

        $attempt = TraineeAttempt::create([
            'lab_assignment_id' => $assignment->id,
            'trainee_id' => Auth::id(),
            'started_at' => Carbon::now(),
            'status' => 'started',
        ]);

        // Update assignment status
        $assignment->update(['status' => 'in_progress']);

        \App\Models\AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'LAB_START',
            'details' => "Started attempt for lab: {$lab->title}",
            'ip_address' => request()->ip(),
        ]);

        return redirect()->route('trainee.labs.show', $assignment->id);
    }

    public function submit(Request $request, TraineeAttempt $attempt)
    {
        if ($attempt->trainee_id !== Auth::id()) {
            abort(403);
        }

        $lab = $attempt->labAssignment->lab;
        $answers = $request->input('answers', []);
        
        $totalEarned = 0;
        $componentScore = 0;
        $assemblyScore = 0;
        $diagnosisScore = 0;
        $safetyScore = 100; // start with full safety, deduct for violations
        $reportScore = 0;

        // Auto grading based on simulator type
        if ($lab->type === 'component_id') {
            $questions = ComponentQuestion::where('lab_id', $lab->id)->get();
            $correctCount = 0;

            foreach ($questions as $q) {
                // Trainee answer is expected to have name and function
                $userAns = $answers[$q->id] ?? null;
                $isCorrectName = isset($userAns['name']) && strtolower($userAns['name']) === strtolower($q->correct_name);
                $isCorrectFunc = isset($userAns['function']) && strtolower($userAns['function']) === strtolower($q->correct_function);

                $isCorrect = $isCorrectName && $isCorrectFunc;
                $scoreAwarded = 0;
                if ($isCorrect) {
                    $scoreAwarded = 10; // 10 points for fully correct
                    $correctCount++;
                } elseif ($isCorrectName || $isCorrectFunc) {
                    $scoreAwarded = 5; // half points for partial
                }

                TraineeAnswer::create([
                    'trainee_attempt_id' => $attempt->id,
                    'question_type' => 'component',
                    'question_id' => $q->id,
                    'answer_data' => $userAns,
                    'is_correct' => $isCorrect,
                    'score_awarded' => $scoreAwarded,
                ]);

                $componentScore += $scoreAwarded;
            }

            $maxScore = max(1, count($questions) * 10);
            $totalEarned = ($componentScore / $maxScore) * 100;

        } elseif ($lab->type === 'motherboard_hotspot') {
            $hotspots = HotspotQuestion::where('lab_id', $lab->id)->get();
            $correctCount = 0;

            foreach ($hotspots as $h) {
                // Trainee click coordinates
                $userClick = $answers[$h->id] ?? null; // e.g. ['x' => 45, 'y' => 60]
                $isCorrect = false;

                if ($userClick) {
                    // distance formula
                    $dx = $userClick['x'] - $h->x_coord;
                    $dy = $userClick['y'] - $h->y_coord;
                    $distance = sqrt($dx * $dx + $dy * $dy);

                    // If user click is within radius threshold (default 5% + tolerance)
                    if ($distance <= ($h->radius + 3)) {
                        $isCorrect = true;
                        $correctCount++;
                    }
                }

                TraineeAnswer::create([
                    'trainee_attempt_id' => $attempt->id,
                    'question_type' => 'hotspot',
                    'question_id' => $h->id,
                    'answer_data' => $userClick,
                    'is_correct' => $isCorrect,
                    'score_awarded' => $isCorrect ? 10 : 0,
                ]);
            }

            $maxScore = max(1, count($hotspots) * 10);
            $totalEarned = ($correctCount / count($hotspots)) * 100;

        } elseif ($lab->type === 'assembly_sequence' || $lab->type === 'drag_drop_build' || $lab->type === 'preventive_maintenance') {
            $steps = AssemblyStep::where('lab_id', $lab->id)->orderBy('step_number')->get();
            
            // answers is expected to be list of step IDs in sorted order e.g. [4, 1, 3, 2]
            $submittedSequence = $answers; 
            $correctCount = 0;
            $safetyViolations = 0;

            foreach ($steps as $idx => $step) {
                // Check if the step placed at this index is the correct step ID
                $submittedStepId = $submittedSequence[$idx] ?? null;
                $isCorrect = ($submittedStepId == $step->id);

                if ($isCorrect) {
                    $correctCount++;
                }

                // Safety violation check: e.g. if a safety-critical step is not positioned early
                // or if safety critical steps are skipped/wrongly positioned
                if ($step->is_safety_critical) {
                    // Find where this safety step was placed
                    $placedPosition = array_search($step->id, $submittedSequence);
                    // If not placed, or placed after non-safety tasks, deduct safety
                    if ($placedPosition === false || $placedPosition > $idx) {
                        $safetyViolations++;
                    }
                }
            }

            // Calculate safety score
            $safetyScore = max(0, 100 - ($safetyViolations * 25));
            $assemblyScore = (count($steps) > 0) ? ($correctCount / count($steps)) * 100 : 0;
            
            // Overall score is weighted: 70% sequence, 30% safety
            $totalEarned = ($assemblyScore * 0.7) + ($safetyScore * 0.3);

            TraineeAnswer::create([
                'trainee_attempt_id' => $attempt->id,
                'question_type' => 'assembly',
                'question_id' => $lab->id,
                'answer_data' => $submittedSequence,
                'is_correct' => ($correctCount === count($steps)),
                'score_awarded' => $assemblyScore,
            ]);

        } elseif ($lab->type === 'troubleshooting') {
            $scenario = TroubleshootingScenario::where('lab_id', $lab->id)->first();
            
            // Trainee answer contains steps checked, finding conclusions
            // e.g. ['checked_steps' => [0,1,3], 'conclusion' => 'faulty PSU', 'symptoms' => ...]
            $userTrouble = $answers;
            $conclusionCorrect = false;

            if ($scenario && isset($userTrouble['conclusion'])) {
                $conclusionCorrect = (strtolower(trim($userTrouble['conclusion'])) === strtolower(trim($scenario->correct_conclusion)));
            }

            // Safety check: Troubleshooting safety-critical steps sequence
            $checkedSteps = $userTrouble['checked_steps'] ?? [];
            $safetyViolations = 0;

            // In troubleshooting scenarios, safety steps (like check wall socket / unplug first)
            // must be done before opening the case.
            if ($scenario) {
                $scenarioSteps = $scenario->steps;
                foreach ($scenarioSteps as $idx => $step) {
                    if (isset($step['is_safety_critical']) && $step['is_safety_critical']) {
                        // Check if the trainee performed this step
                        $stepIndexInUser = array_search($step['name'], $checkedSteps);
                        if ($stepIndexInUser === false) {
                            $safetyViolations++;
                        }
                    }
                }
            }

            $safetyScore = max(0, 100 - ($safetyViolations * 25));
            $diagnosisScore = $conclusionCorrect ? 100 : 0;
            
            // Overall score: 60% diagnosis accuracy, 40% safety compliance
            $totalEarned = ($diagnosisScore * 0.6) + ($safetyScore * 0.4);

        } elseif ($lab->type === 'bios_config') {
            // answers contains: boot_priority, xmp_enabled, fan_profile, secure_boot
            $userBios = $answers;
            $points = 0;
            $maxPoints = 100;

            // 1. Boot Priority check (e.g. UEFI USB or NVMe first)
            $firstBoot = $userBios['boot_priority'][0] ?? ($userBios['first_boot_device'] ?? '');
            if (str_contains(strtolower($firstBoot), 'usb') || str_contains(strtolower($firstBoot), 'nvme') || str_contains(strtolower($firstBoot), 'windows boot manager')) {
                $points += 35;
            }

            // 2. XMP / DOCP Profile check (Enabled)
            if (!empty($userBios['xmp_enabled']) || ($userBios['xmp_profile'] ?? '') === 'Profile 1') {
                $points += 25;
            }

            // 3. Fan Profile / Thermal management check
            if (!empty($userBios['fan_profile']) && $userBios['fan_profile'] !== 'Disabled') {
                $points += 20;
            }

            // 4. Secure Boot or UEFI Mode setting
            if (isset($userBios['secure_boot']) && ($userBios['secure_boot'] === true || $userBios['secure_boot'] === 'Enabled')) {
                $points += 20;
            }

            $totalEarned = min(100, max(0, $points));
            $diagnosisScore = $totalEarned;

            TraineeAnswer::create([
                'trainee_attempt_id' => $attempt->id,
                'question_type' => 'bios_config',
                'question_id' => $lab->id,
                'answer_data' => $userBios,
                'is_correct' => ($totalEarned >= 70),
                'score_awarded' => $totalEarned,
            ]);

        } elseif ($lab->type === 'cable_pinout') {
            // answers contains mapped cable headers e.g. { 'atx_24pin': 'atx_24pin_hdr', 'eps_8pin': 'eps_cpu_hdr', ... }
            $mappings = $answers['mappings'] ?? $answers;
            $correctPairs = [
                'atx_24pin' => 'atx_24pin_hdr',
                'eps_8pin' => 'eps_cpu_hdr',
                'pcie_8pin' => 'gpu_pcie_hdr',
                'sata_power' => 'sata_ssd_hdr',
                'pwr_sw' => 'fp_pwr_sw',
                'reset_sw' => 'fp_reset_sw',
                'hdd_led' => 'fp_hdd_led',
            ];

            $correctCount = 0;
            $totalExpected = count($correctPairs);

            foreach ($correctPairs as $cableKey => $expectedHeader) {
                if (isset($mappings[$cableKey]) && $mappings[$cableKey] === $expectedHeader) {
                    $correctCount++;
                }
            }

            $totalEarned = $totalExpected > 0 ? ($correctCount / $totalExpected) * 100 : 100;
            $componentScore = $totalEarned;

            TraineeAnswer::create([
                'trainee_attempt_id' => $attempt->id,
                'question_type' => 'cable_pinout',
                'question_id' => $lab->id,
                'answer_data' => $mappings,
                'is_correct' => ($correctCount === $totalExpected),
                'score_awarded' => $totalEarned,
            ]);

        } elseif ($lab->type === 'beep_code_diagnostic') {
            // answers contains diagnostic conclusions for POST hex/beep questions
            $userDiagnostics = $answers;
            $correctAnswers = [
                'post_code_55' => 'Memory (RAM) not detected or initialization error',
                'post_code_00' => 'CPU Processor failure or improper seating',
                'post_code_d6' => 'No console output / GPU graphics card not detected',
                'post_code_a2' => 'SATA / IDE device detection in progress',
                'beep_1long_2short' => 'GPU / Display Adapter Error',
                'beep_continuous' => 'RAM Memory Failure or unseated DIMM'
            ];

            $matched = 0;
            $totalQuestions = count($correctAnswers);

            foreach ($correctAnswers as $qKey => $expectedVal) {
                $userAns = $userDiagnostics[$qKey] ?? '';
                if (strtolower(trim($userAns)) === strtolower(trim($expectedVal))) {
                    $matched++;
                }
            }

            $totalEarned = ($matched / $totalQuestions) * 100;
            $diagnosisScore = $totalEarned;

            TraineeAnswer::create([
                'trainee_attempt_id' => $attempt->id,
                'question_type' => 'beep_code_diagnostic',
                'question_id' => $lab->id,
                'answer_data' => $userDiagnostics,
                'is_correct' => ($matched >= ($totalQuestions * 0.7)),
                'score_awarded' => $totalEarned,
            ]);

        } elseif ($lab->type === 'repair_report') {
            // Repair report lab submissions are graded by instructors
            $reportData = $request->input('report', []);
            
            RepairReport::create([
                'trainee_attempt_id' => $attempt->id,
                'fault_reported' => $reportData['fault_reported'] ?? '',
                'symptoms_observed' => $reportData['symptoms_observed'] ?? '',
                'diagnostic_steps' => $reportData['diagnostic_steps'] ?? '',
                'findings' => $reportData['findings'] ?? '',
                'corrective_action' => $reportData['corrective_action'] ?? '',
                'parts_replaced' => $reportData['parts_replaced'] ?? null,
                'safety_precautions' => $reportData['safety_precautions'] ?? '',
                'recommendations' => $reportData['recommendations'] ?? null,
            ]);

            // Marked as submitted but score is pending instructor review
            $attempt->update([
                'status' => 'submitted',
                'completed_at' => Carbon::now(),
            ]);

            $attempt->labAssignment->update(['status' => 'completed']);

            return redirect()->route('trainee.labs.show', $attempt->lab_assignment_id)->with('success', 'Repair report submitted for instructor review.');
        }

        // Save attempts stats
        $attempt->update([
            'status' => 'graded',
            'completed_at' => Carbon::now(),
            'score' => $totalEarned,
        ]);

        Score::create([
            'trainee_attempt_id' => $attempt->id,
            'component_score' => $componentScore,
            'assembly_score' => $assemblyScore,
            'diagnosis_score' => $diagnosisScore,
            'safety_score' => $safetyScore,
            'report_score' => $reportScore,
            'total_score' => $totalEarned,
        ]);

        // Complete assignment status
        $attempt->labAssignment->update(['status' => 'completed']);

        \App\Models\AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'LAB_SUBMIT',
            'details' => "Completed lab '{$lab->title}' with score: " . round($totalEarned, 1) . "%",
            'ip_address' => request()->ip(),
        ]);

        return redirect()->route('trainee.labs.show', $attempt->lab_assignment_id)->with('success', 'Lab completed! Your score: ' . round($totalEarned, 1) . '%');
    }
}
