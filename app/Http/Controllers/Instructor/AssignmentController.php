<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\LabAssignment;
use App\Models\Lab;
use App\Models\User;
use App\Models\TraineeAttempt;
use App\Models\Feedback;
use App\Models\Score;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class AssignmentController extends Controller
{
    public function index()
    {
        $assignments = LabAssignment::with(['lab.module.course', 'trainee', 'assigner'])->get();
        $labs = Lab::with('module.course')->get();
        $trainees = User::whereHas('role', function ($q) {
            $q->where('name', 'trainee');
        })->get();

        return Inertia::render('Instructor/Assignments', [
            'assignments' => $assignments,
            'labs' => $labs,
            'trainees' => $trainees,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'lab_id' => 'required|exists:labs,id',
            'trainee_ids' => 'required|array',
            'trainee_ids.*' => 'exists:users,id',
            'due_at' => 'nullable|date',
        ]);

        foreach ($request->trainee_ids as $traineeId) {
            LabAssignment::updateOrCreate([
                'lab_id' => $request->lab_id,
                'trainee_id' => $traineeId,
            ], [
                'assigned_by' => Auth::id(),
                'status' => 'pending',
                'due_at' => $request->due_at,
            ]);
        }

        return redirect()->route('instructor.assignments.index')->with('success', 'Labs assigned successfully!');
    }

    public function destroy(LabAssignment $assignment)
    {
        $assignment->delete();
        return redirect()->route('instructor.assignments.index')->with('success', 'Assignment retracted successfully!');
    }

    public function submissions()
    {
        $attempts = TraineeAttempt::with(['assignment.lab', 'trainee'])
            ->whereIn('status', ['submitted', 'graded'])
            ->orderBy('completed_at', 'desc')
            ->get();

        return Inertia::render('Instructor/Submissions', [
            'attempts' => $attempts
        ]);
    }

    public function reviewAttempt(TraineeAttempt $attempt)
    {
        $attempt->load([
            'assignment.lab.module.course',
            'trainee',
            'repairReport',
            'answers',
            'scores',
            'feedbacks.instructor'
        ]);

        return Inertia::render('Instructor/ReviewAttempt', [
            'attempt' => $attempt
        ]);
    }

    public function gradeAttempt(Request $request, TraineeAttempt $attempt)
    {
        $request->validate([
            'score' => 'required|numeric|min:0|max:100',
            'comments' => 'nullable|string'
        ]);

        $attempt->update([
            'score' => $request->score,
            'status' => 'graded'
        ]);

        Feedback::updateOrCreate([
            'trainee_attempt_id' => $attempt->id,
            'instructor_id' => Auth::id()
        ], [
            'comments' => $request->comments,
            'graded_at' => now()
        ]);

        Score::updateOrCreate([
            'trainee_attempt_id' => $attempt->id
        ], [
            'report_score' => $request->score,
            'total_score' => $request->score
        ]);

        return redirect()->route('instructor.submissions.index')->with('success', 'Trainee attempt graded and feedback logged successfully.');
    }

    public function exportPdf(TraineeAttempt $attempt)
    {
        $attempt->load([
            'assignment.lab.module.course',
            'trainee',
            'repairReport',
            'feedbacks.instructor'
        ]);

        $pdf = Pdf::loadView('pdf.report', compact('attempt'));
        return $pdf->download('Service-Report-Attempt-' . $attempt->id . '.pdf');
    }
}
