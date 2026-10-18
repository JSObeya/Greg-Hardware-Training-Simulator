<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\TraineeAttempt;
use App\Models\Lab;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Carbon\Carbon;
use App\Services\DocumentExportService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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
        $trash = $request->query('trash', 'active'); // 'active' or 'trashed'
        $perPageInput = $request->query('per_page', '25');

        // Determine if viewing trashed or active records
        $isTrashView = ($trash === 'trashed');
        $baseQuery = $isTrashView ? TraineeAttempt::onlyTrashed() : TraineeAttempt::query();

        // Build filtered query
        $query = $baseQuery->whereHas('assignment.lab')->whereHas('trainee');

        // Course filter
        if ($courseId !== 'all' && !empty($courseId)) {
            $query->whereHas('assignment.lab.module', function ($q) use ($courseId) {
                $q->where('course_id', $courseId);
            });
        }

        // Lab filter
        if ($labId !== 'all' && !empty($labId)) {
            $query->whereHas('assignment', function ($q) use ($labId) {
                $q->where('lab_id', $labId);
            });
        }

        // Cohort filter
        if ($cohort !== 'all' && !empty($cohort)) {
            $query->whereHas('trainee', function ($q) use ($cohort) {
                $q->where('cohort', $cohort);
            });
        }

        // Status filter
        if ($status !== 'all' && !empty($status)) {
            if ($status === 'passed') {
                $query->whereIn('status', ['submitted', 'graded'])
                      ->where('score', '>=', 70);
            } elseif ($status === 'failed') {
                $query->whereIn('status', ['submitted', 'graded'])
                      ->where('score', '<', 70);
            } else {
                $query->where('status', $status);
            }
        }

        // Date Range
        if (!empty($dateFrom)) {
            $query->whereDate('started_at', '>=', $dateFrom);
        }
        if (!empty($dateTo)) {
            $query->whereDate('started_at', '<=', $dateTo);
        }

        // Search trainee name or email
        if (!empty($search)) {
            $query->whereHas('trainee', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // --- Fast SQL KPI Aggregations (zero model hydration overhead) ---
        $kpiQuery = clone $query;
        $totalAttempts = (clone $kpiQuery)->count();
        $uniqueTrainees = (clone $kpiQuery)->distinct('trainee_id')->count('trainee_id');

        $scoredQuery = (clone $kpiQuery)->whereIn('status', ['submitted', 'graded'])->whereNotNull('score');
        $scoredCount = (clone $scoredQuery)->count();
        $avgScore = $scoredCount > 0 ? round((float) (clone $scoredQuery)->avg('score'), 1) : 0;
        
        $passedCount = (clone $scoredQuery)->where('score', '>=', 70)->count();
        $passRate = $scoredCount > 0 ? round(($passedCount / $scoredCount) * 100, 1) : 0;

        // Trashed and active counts for tab badges
        $trashedCount = TraineeAttempt::onlyTrashed()->count();
        $activeCount = TraineeAttempt::count();

        // Average duration calculation
        $avgDuration = 0;
        try {
            $durationResult = (clone $kpiQuery)
                ->whereNotNull('started_at')
                ->whereNotNull('completed_at')
                ->selectRaw('AVG(TIMESTAMPDIFF(MINUTE, started_at, completed_at)) as avg_dur')
                ->first();
            if ($durationResult && $durationResult->avg_dur !== null) {
                $avgDuration = max(0, round((float) $durationResult->avg_dur, 1));
            }
        } catch (\Throwable $e) {
            $avgDuration = 0;
        }

        // Average safety score
        $avgSafety = 100;
        try {
            $safetyAvg = DB::table('scores')
                ->whereIn('trainee_attempt_id', (clone $kpiQuery)->select('id'))
                ->avg('safety_score');
            if ($safetyAvg !== null) {
                $avgSafety = round((float) $safetyAvg, 1);
            }
        } catch (\Throwable $e) {
            $avgSafety = 100;
        }

        // --- Paginate Results Efficiently ---
        $perPage = ($perPageInput === 'all') ? 1000 : max(10, min(100, (int) $perPageInput));

        $paginatedAttempts = $query->with([
            'assignment:id,lab_id,trainee_id',
            'assignment.lab:id,module_id,title,type,passing_score,is_practice',
            'assignment.lab.module:id,course_id,title',
            'assignment.lab.module.course:id,title',
            'trainee:id,name,email,cohort',
            'scoreRecord:id,trainee_attempt_id,safety_score'
        ])
        ->orderBy('completed_at', 'desc')
        ->orderBy('id', 'desc')
        ->paginate($perPage)
        ->withQueryString();

        // Transform paginated collection
        $paginatedAttempts->through(function ($att) {
            $lab = $att->assignment->lab ?? null;
            $passingScore = $lab->passing_score ?? 70;
            $numericScore = is_numeric($att->score) ? (float) $att->score : null;
            $isPassed = ($numericScore !== null && $numericScore >= $passingScore);

            $durationMins = null;
            if (!empty($att->started_at) && !empty($att->completed_at)) {
                try {
                    $start = $att->started_at instanceof \Carbon\CarbonInterface 
                        ? $att->started_at 
                        : Carbon::parse($att->started_at);
                    $end = $att->completed_at instanceof \Carbon\CarbonInterface 
                        ? $att->completed_at 
                        : Carbon::parse($att->completed_at);
                    $durationMins = max(0, round($start->diffInMinutes($end)));
                } catch (\Throwable $e) {
                    $durationMins = null;
                }
            }

            $safetyScore = $att->scoreRecord->safety_score ?? 100;

            $startedFormatted = null;
            if (!empty($att->started_at)) {
                try {
                    $dt = $att->started_at instanceof \Carbon\CarbonInterface ? $att->started_at : Carbon::parse($att->started_at);
                    $startedFormatted = $dt->format('M d, Y H:i');
                } catch (\Throwable $e) {
                    $startedFormatted = (string) $att->started_at;
                }
            }

            $completedFormatted = 'Incomplete';
            if (!empty($att->completed_at)) {
                try {
                    $dt = $att->completed_at instanceof \Carbon\CarbonInterface ? $att->completed_at : Carbon::parse($att->completed_at);
                    $completedFormatted = $dt->format('M d, Y H:i');
                } catch (\Throwable $e) {
                    $completedFormatted = (string) $att->completed_at;
                }
            }

            $deletedFormatted = null;
            if (!empty($att->deleted_at)) {
                try {
                    $dt = $att->deleted_at instanceof \Carbon\CarbonInterface ? $att->deleted_at : Carbon::parse($att->deleted_at);
                    $deletedFormatted = $dt->format('M d, Y H:i');
                } catch (\Throwable $e) {
                    $deletedFormatted = (string) $att->deleted_at;
                }
            }

            return [
                'id' => $att->id,
                'trainee_id' => $att->trainee_id,
                'trainee_name' => $att->trainee->name ?? 'Unknown',
                'trainee_email' => $att->trainee->email ?? 'N/A',
                'cohort' => $att->trainee->cohort ?? 'Cohort 2026-A',
                'lab_id' => $lab->id ?? null,
                'course_title' => $lab->module->course->title ?? 'N/A',
                'module_title' => $lab->module->title ?? 'N/A',
                'lab_title' => $lab->display_title ?? ($lab->title ?? 'N/A'),
                'lab_type' => $lab->type ?? 'hardware_lab',
                'is_practice' => (bool) ($lab->is_practice ?? false),
                'score' => $numericScore !== null ? round($numericScore, 1) : null,
                'safety_score' => is_numeric($safetyScore) ? round((float) $safetyScore, 1) : 100,
                'passing_score' => $passingScore,
                'is_passed' => $isPassed,
                'status' => $att->status,
                'duration_minutes' => $durationMins,
                'started_at' => $startedFormatted,
                'completed_at' => $completedFormatted,
                'deleted_at' => $deletedFormatted,
            ];
        });

        // Fast Filter Options (select only id, title)
        $courses = Course::select('id', 'title')->orderBy('title')->get();
        $labs = Lab::select('id', 'title', 'type', 'is_practice')->orderBy('id')->get();
        
        $cohorts = User::whereNotNull('cohort')
            ->distinct()
            ->pluck('cohort')
            ->filter()
            ->values();

        if ($cohorts->isEmpty()) {
            $cohorts = collect(['Cohort 2026-A', 'Cohort 2026-B', 'Accelerated Bootcamp']);
        }

        return Inertia::render('Instructor/Reports', [
            'attempts' => $paginatedAttempts,
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
                'trash' => $trash,
                'per_page' => $perPageInput,
            ],
            'filterOptions' => [
                'courses' => $courses,
                'labs' => $labs,
                'cohorts' => $cohorts,
            ],
            'trashCount' => $trashedCount,
            'activeCount' => $activeCount,
        ]);
    }

    /**
     * Export Universal Multi-Lab Report to CSV.
     * Supports exporting specific selected IDs or all filtered records.
     */
    public function exportCsv(Request $request): StreamedResponse
    {
        $attemptIds = $request->input('attempt_ids', $request->query('attempt_ids'));
        if (is_string($attemptIds) && !empty($attemptIds)) {
            $attemptIds = array_filter(explode(',', $attemptIds));
        }

        $query = TraineeAttempt::with([
            'assignment.lab.module.course',
            'trainee',
            'scoreRecord'
        ])->whereHas('assignment.lab')->whereHas('trainee');

        if (!empty($attemptIds) && is_array($attemptIds)) {
            $query->whereIn('id', $attemptIds);
        } else {
            $courseId = $request->query('course_id', 'all');
            $labId = $request->query('lab_id', 'all');
            $cohort = $request->query('cohort', 'all');
            $status = $request->query('status', 'all');
            $dateFrom = $request->query('date_from');
            $dateTo = $request->query('date_to');
            $search = $request->query('search', '');

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
                $numericScore = is_numeric($att->score) ? (float) $att->score : null;
                $isPassed = ($numericScore !== null && $numericScore >= $passingScore);
                $mode = ($lab && $lab->is_practice) ? 'Practice (Self-Study)' : 'Graded Exam';
                
                $duration = '';
                if (!empty($att->started_at) && !empty($att->completed_at)) {
                    try {
                        $start = $att->started_at instanceof \Carbon\CarbonInterface ? $att->started_at : Carbon::parse($att->started_at);
                        $end = $att->completed_at instanceof \Carbon\CarbonInterface ? $att->completed_at : Carbon::parse($att->completed_at);
                        $duration = max(0, round($start->diffInMinutes($end)));
                    } catch (\Throwable $e) {
                        $duration = '';
                    }
                }

                $safety = $att->scoreRecord->safety_score ?? 100;

                $startedStr = '';
                if (!empty($att->started_at)) {
                    try {
                        $dt = $att->started_at instanceof \Carbon\CarbonInterface ? $att->started_at : Carbon::parse($att->started_at);
                        $startedStr = $dt->format('Y-m-d H:i:s');
                    } catch (\Throwable $e) {
                        $startedStr = (string) $att->started_at;
                    }
                }

                $completedStr = '';
                if (!empty($att->completed_at)) {
                    try {
                        $dt = $att->completed_at instanceof \Carbon\CarbonInterface ? $att->completed_at : Carbon::parse($att->completed_at);
                        $completedStr = $dt->format('Y-m-d H:i:s');
                    } catch (\Throwable $e) {
                        $completedStr = (string) $att->completed_at;
                    }
                }

                fputcsv($handle, [
                    $att->id,
                    $att->trainee->name ?? 'Unknown',
                    $att->trainee->email ?? 'N/A',
                    $att->trainee->cohort ?? 'Cohort 2026-A',
                    $lab->module->course->title ?? 'N/A',
                    $lab->module->title ?? 'N/A',
                    $lab->display_title ?? ($lab->title ?? 'N/A'),
                    $lab->type ?? 'N/A',
                    $mode,
                    $numericScore !== null ? round($numericScore, 1) : 'N/A',
                    $passingScore,
                    $isPassed ? 'PASSED' : ($numericScore !== null ? 'FAILED' : 'PENDING'),
                    is_numeric($safety) ? round((float) $safety, 1) : 100,
                    strtoupper($att->status),
                    $duration,
                    $startedStr,
                    $completedStr,
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }

    /**
     * Batch export filtered or selected labs to Word (.docx) or PDF format with custom grouping.
     */
    public function batchExport(Request $request, DocumentExportService $exporter)
    {
        $format = strtolower($request->input('format', $request->query('format', 'pdf')));
        $groupBy = strtolower($request->input('group_by', $request->query('group_by', 'trainee')));
        $attemptIds = $request->input('attempt_ids', $request->query('attempt_ids'));
        
        if (is_string($attemptIds) && !empty($attemptIds)) {
            $attemptIds = array_filter(explode(',', $attemptIds));
        }

        $query = TraineeAttempt::with([
            'assignment.lab.module.course',
            'trainee',
            'scoreRecord'
        ])->whereHas('assignment.lab')->whereHas('trainee');

        // If specific attempts selected, filter directly by their IDs
        if (!empty($attemptIds) && is_array($attemptIds)) {
            $query->whereIn('id', $attemptIds);
        } else {
            // Apply standard filters
            $courseId = $request->input('course_id', $request->query('course_id', 'all'));
            $labId = $request->input('lab_id', $request->query('lab_id', 'all'));
            $cohort = $request->input('cohort', $request->query('cohort', 'all'));
            $status = $request->input('status', $request->query('status', 'all'));
            $dateFrom = $request->input('date_from', $request->query('date_from'));
            $dateTo = $request->input('date_to', $request->query('date_to'));
            $search = $request->input('search', $request->query('search', ''));

            if ($courseId !== 'all' && !empty($courseId)) {
                $query->whereHas('assignment.lab.module', fn($q) => $q->where('course_id', $courseId));
            }
            if ($labId !== 'all' && !empty($labId)) {
                $query->whereHas('assignment', fn($q) => $q->where('lab_id', $labId));
            }
            if ($cohort !== 'all' && !empty($cohort)) {
                $query->whereHas('trainee', fn($q) => $q->where('cohort', $cohort));
            }
            if ($status !== 'all' && !empty($status)) {
                if ($status === 'passed') {
                    $query->where('status', 'graded')->where('score', '>=', 70);
                } elseif ($status === 'failed') {
                    $query->where('status', 'graded')->where('score', '<', 70);
                } else {
                    $query->where('status', $status);
                }
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
        }

        $attempts = $query->orderBy('completed_at', 'desc')->get();

        if ($format === 'csv') {
            return $this->exportCsv($request);
        }

        $title = 'Consolidated Institutional Multi-Lab Report';
        $meta = [
            'instructor' => Auth::user()->name ?? 'Technical Instructor',
            'groupBy' => $groupBy,
        ];

        if ($format === 'docx' || $format === 'word') {
            return $exporter->exportDocx($title, $attempts, $groupBy, $meta);
        }

        return $exporter->exportPdf($title, $attempts, $groupBy, $meta);
    }

    /**
     * Soft delete a single attempt.
     */
    public function destroy(TraineeAttempt $attempt)
    {
        $id = $attempt->id;
        $attempt->delete();

        return back()->with('success', "Submission #{$id} has been moved to trash (soft deleted).");
    }

    /**
     * Bulk soft delete selected attempts.
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:trainee_attempts,id',
        ]);

        $count = TraineeAttempt::whereIn('id', $request->ids)->delete();

        return back()->with('success', "Successfully moved {$count} submission(s) to trash.");
    }

    /**
     * Restore a soft-deleted attempt.
     */
    public function restore($id)
    {
        $attempt = TraineeAttempt::onlyTrashed()->findOrFail($id);
        $attempt->restore();

        return back()->with('success', "Submission #{$id} has been restored successfully.");
    }

    /**
     * Bulk restore selected soft-deleted attempts.
     */
    public function bulkRestore(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer',
        ]);

        $count = TraineeAttempt::onlyTrashed()->whereIn('id', $request->ids)->restore();

        return back()->with('success', "Successfully restored {$count} submission(s).");
    }

    /**
     * Permanently delete a soft-deleted attempt.
     */
    public function forceDelete($id)
    {
        $attempt = TraineeAttempt::onlyTrashed()->findOrFail($id);
        $attempt->forceDelete();

        return back()->with('success', "Submission #{$id} permanently removed from system.");
    }

    /**
     * Bulk permanently delete selected soft-deleted attempts.
     */
    public function bulkForceDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer',
        ]);

        $count = TraineeAttempt::onlyTrashed()->whereIn('id', $request->ids)->forceDelete();

        return back()->with('success', "Permanently removed {$count} submission(s) from system.");
    }
}
