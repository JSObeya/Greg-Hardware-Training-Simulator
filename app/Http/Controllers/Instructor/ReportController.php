<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\TraineeAttempt;
use App\Models\Lab;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Inertia\Inertia;

class ReportController extends Controller
{
    /**
     * Universal Multi-Lab Custom Report Builder & Cohorts Analytics.
     */
    public function index(Request $request)
    {
        $courseId = $request->query('course_id', 'all');
        $labId = $request->query('lab_id', 'all');
        $cohort = $request->query('cohort', 'all');
        $status = $request->query('status', 'all');
        $dateFrom = $request->query('date_from');
        $dateTo = $request->query('date_to');
        $search = $request->query('search', '');

        $query = TraineeAttempt::with([
            'assignment.lab.module.course',
            'trainee',
            'score',
            'repairReport'
        ])->whereHas('assignment.lab')->whereHas('trainee');

        // Apply Course filter
        if ($courseId !== 'all') {
            $query->whereHas('assignment.lab.module', function ($q) use ($courseId) {
                $q->where('course_id', $courseId);
            });
        }

        // Apply Lab filter
        if ($labId !== 'all') {
            $query->whereHas('assignment', function ($q) use ($labId) {
                $q->where('lab_id', $labId);
            });
        }

        // Apply Cohort filter
        if ($cohort !== 'all') {
            $query->whereHas('trainee', function ($q) use ($cohort) {
                $q->where('cohort', $cohort);
            });
        }

        // Apply Status filter
        if ($status !== 'all') {
            if ($status === 'passed') {
                $query->whereIn('status', ['submitted', 'graded'])
                      ->whereHas('assignment.lab', function ($q) {
                          // Score >= passing_score
                      })->where('score', '>=', 70);
            } elseif ($status === 'failed') {
                $query->whereIn('status', ['submitted', 'graded'])
                      ->where('score', '<', 70);
            } else {
                $query->where('status', $status);
            }
        }

        // Apply Date Range
        if (!empty($dateFrom)) {
            $query->whereDate('started_at', '>=', $dateFrom);
        }
        if (!empty($dateTo)) {
            $query->whereDate('started_at', '<=', $dateTo);
        }

        // Apply Search (Trainee Name or Email)
        if (!empty($search)) {
            $query->whereHas('trainee', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $allAttempts = (clone $query)->orderBy('completed_at', 'desc')->get();

        // Calculate Aggregate KPIs
        $totalAttempts = $allAttempts->count();
        $completedAttempts = $allAttempts->whereIn('status', ['submitted', 'graded']);
        $uniqueTrainees = $allAttempts->pluck('trainee_id')->unique()->count();

        $avgScore = $completedAttempts->count() > 0 ? round($completedAttempts->avg('score'), 1) : 0;
        
        $passedCount = 0;
        $totalDurationMinutes = 0;
        $durationCount = 0;
        $safetySum = 0;
        $safetyCount = 0;

        $attemptsFormatted = [];

        foreach ($allAttempts as $att) {
            $lab = $att->assignment->lab ?? null;
            $passingScore = $lab->passing_score ?? 70;
            $isPassed = ($att->score !== null && $att->score >= $passingScore);
            if ($isPassed) {
                $passedCount++;
            }

            // Calculate duration
            $durationMins = null;
            if ($att->started_at && $att->completed_at) {
                $durationMins = round($att->started_at->diffInMinutes($att->completed_at));
                $totalDurationMinutes += $durationMins;
                $durationCount++;
            }

            $safetyScore = $att->score_data->safety_score ?? ($att->score ? $att->score->safety_score : 100);
            if ($safetyScore !== null) {
                $safetySum += $safetyScore;
                $safetyCount++;
            }

            $attemptsFormatted[] = [
                'id' => $att->id,
                'trainee_name' => $att->trainee->name ?? 'Unknown',
                'trainee_email' => $att->trainee->email ?? 'N/A',
                'cohort' => $att->trainee->cohort ?? 'Cohort 2026-A',
                'course_title' => $lab->module->course->title ?? 'N/A',
                'module_title' => $lab->module->title ?? 'N/A',
                'lab_title' => $lab->title ?? 'N/A',
                'lab_type' => $lab->type ?? 'hardware_lab',
                'is_practice' => (bool) ($lab->is_practice ?? false),
                'score' => $att->score !== null ? round($att->score, 1) : null,
                'safety_score' => $safetyScore,
                'passing_score' => $passingScore,
                'is_passed' => $isPassed,
                'status' => $att->status,
                'duration_minutes' => $durationMins,
                'started_at' => $att->started_at ? $att->started_at->format('M d, Y H:i') : null,
                'completed_at' => $att->completed_at ? $att->completed_at->format('M d, Y H:i') : 'Incomplete',
            ];
        }

        $passRate = $completedAttempts->count() > 0 ? round(($passedCount / $completedAttempts->count()) * 100, 1) : 0;
        $avgDuration = $durationCount > 0 ? round($totalDurationMinutes / $durationCount, 1) : 0;
        $avgSafety = $safetyCount > 0 ? round($safetySum / $safetyCount, 1) : 100;

        // Query filter options
        $courses = Course::select('id', 'title')->orderBy('title')->get();
        $labs = Lab::select('id', 'title', 'type', 'is_practice')->orderBy('title')->get();
        
        $cohorts = User::whereHas('role', fn($q) => $q->where('name', 'trainee'))
            ->whereNotNull('cohort')
            ->distinct()
            ->pluck('cohort')
            ->values();

        if ($cohorts->isEmpty()) {
            $cohorts = collect(['Cohort 2026-A', 'Cohort 2026-B', 'Accelerated Bootcamp']);
        }

        return Inertia::render('Instructor/Reports', [
            'attempts' => $attemptsFormatted,
            'kpis' => [
                'total_attempts' => $totalAttempts,
                'unique_trainees' => $uniqueTrainees,
                'avg_score' => $avgScore,
                'pass_rate' => $passRate,
                'avg_duration_minutes' => $avgDuration,
                'avg_safety_score' => $avgSafety,
            ],
            'filters' => [
                'course_id' => $courseId,
                'lab_id' => $labId,
                'cohort' => $cohort,
                'status' => $status,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'search' => $search,
            ],
            'filterOptions' => [
                'courses' => $courses,
                'labs' => $labs,
                'cohorts' => $cohorts,
            ]
        ]);
    }

    /**
     * Export Universal Multi-Lab Report to CSV.
     */
    public function exportCsv(Request $request): StreamedResponse
    {
        $courseId = $request->query('course_id', 'all');
        $labId = $request->query('lab_id', 'all');
        $cohort = $request->query('cohort', 'all');
        $status = $request->query('status', 'all');
        $dateFrom = $request->query('date_from');
        $dateTo = $request->query('date_to');
        $search = $request->query('search', '');

        $query = TraineeAttempt::with([
            'assignment.lab.module.course',
            'trainee',
            'score'
        ])->whereHas('assignment.lab')->whereHas('trainee');

        if ($courseId !== 'all') {
            $query->whereHas('assignment.lab.module', fn($q) => $q->where('course_id', $courseId));
        }
        if ($labId !== 'all') {
            $query->whereHas('assignment', fn($q) => $q->where('lab_id', $labId));
        }
        if ($cohort !== 'all') {
            $query->whereHas('trainee', fn($q) => $q->where('cohort', $cohort));
        }
        if (!empty($dateFrom)) {
            $query->whereDate('started_at', '>=', $dateFrom);
        }
        if (!empty($dateTo)) {
            $query->whereDate('started_at', '<=', $dateTo);
        }
        if (!empty($search)) {
            $query->whereHas('trainee', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $attempts = $query->orderBy('completed_at', 'desc')->get();
        $filename = 'hardware_lab_report_' . date('Y-m-d_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        return response()->stream(function () use ($attempts) {
            $handle = fopen('php://output', 'w');
            
            // UTF-8 BOM for Excel compatibility
            fputs($handle, "\xEF\xBB\xBF");

            // CSV Columns Header
            fputcsv($handle, [
                'Attempt ID',
                'Trainee Name',
                'Trainee Email',
                'Cohort / Batch',
                'Course Title',
                'Module',
                'Lab Title',
                'Lab Type',
                'Evaluation Mode',
                'Score (%)',
                'Passing Threshold (%)',
                'Evaluation Outcome',
                'Safety Score (%)',
                'Status',
                'Duration (Mins)',
                'Started At',
                'Completed At',
            ]);

            foreach ($attempts as $att) {
                $lab = $att->assignment->lab ?? null;
                $passingScore = $lab->passing_score ?? 70;
                $isPassed = ($att->score !== null && $att->score >= $passingScore);
                $mode = ($lab && $lab->is_practice) ? 'Practice (Self-Study)' : 'Graded Exam';
                
                $duration = '';
                if ($att->started_at && $att->completed_at) {
                    $duration = round($att->started_at->diffInMinutes($att->completed_at));
                }

                $safety = $att->score ? $att->score->safety_score : 100;

                fputcsv($handle, [
                    $att->id,
                    $att->trainee->name ?? 'Unknown',
                    $att->trainee->email ?? 'N/A',
                    $att->trainee->cohort ?? 'Cohort 2026-A',
                    $lab->module->course->title ?? 'N/A',
                    $lab->module->title ?? 'N/A',
                    $lab->title ?? 'N/A',
                    $lab->type ?? 'N/A',
                    $mode,
                    $att->score !== null ? round($att->score, 1) : 'N/A',
                    $passingScore,
                    $isPassed ? 'PASSED' : ($att->score !== null ? 'FAILED' : 'PENDING'),
                    $safety,
                    strtoupper($att->status),
                    $duration,
                    $att->started_at ? $att->started_at->format('Y-m-d H:i:s') : '',
                    $att->completed_at ? $att->completed_at->format('Y-m-d H:i:s') : '',
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }
}
