<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use App\Models\Lab;
use App\Models\LabAssignment;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class TraineeController extends Controller
{
    private function getStoredCohorts(): array
    {
        $defaultCohorts = ['Cohort 2026-A', 'Cohort 2026-B', 'Accelerated Bootcamp'];
        $path = storage_path('app/cohorts.json');
        
        $saved = [];
        if (file_exists($path)) {
            $content = @file_get_contents($path);
            $saved = json_decode($content, true) ?: [];
        }
        
        $dbCohorts = User::whereNotNull('cohort')
            ->where('cohort', '!=', '')
            ->distinct()
            ->pluck('cohort')
            ->toArray();

        return array_values(array_unique(array_filter(array_merge($defaultCohorts, $saved, $dbCohorts))));
    }

    private function saveStoredCohorts(array $cohorts): void
    {
        $path = storage_path('app/cohorts.json');
        $dir = dirname($path);
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
        @file_put_contents($path, json_encode(array_values(array_unique(array_filter($cohorts))), JSON_PRETTY_PRINT));
    }

    public function index(Request $request)
    {
        $tab = $request->query('tab', 'active'); // 'active' or 'trash'
        $search = $request->query('search');
        $cohort = $request->query('cohort', 'all');

        $query = User::whereHas('role', function ($query) {
            $query->where('name', 'trainee');
        })->withCount([
            'assignments',
            'attempts' => function ($q) {
                $q->whereIn('trainee_attempts.status', ['submitted', 'graded']);
            }
        ]);

        if ($tab === 'trash') {
            $query->onlyTrashed();
        } else {
            $query->withoutTrashed();
        }

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($cohort !== 'all' && !empty($cohort)) {
            if ($cohort === 'Cohort 2026-A') {
                $query->where(function ($q) {
                    $q->where('cohort', 'Cohort 2026-A')->orWhereNull('cohort')->orWhere('cohort', '');
                });
            } else {
                $query->where('cohort', $cohort);
            }
        }

        $trainees = $query->orderBy('name')->paginate(20)->withQueryString();

        $activeCount = User::whereHas('role', fn($q) => $q->where('name', 'trainee'))->withoutTrashed()->count();
        $trashedCount = User::whereHas('role', fn($q) => $q->where('name', 'trainee'))->onlyTrashed()->count();

        // Cohort summaries for Training Cohorts & Enrolments Cards
        $allCohorts = $this->getStoredCohorts();

        $cohortsSummary = collect($allCohorts)->map(function ($cName) {
            $isDefaultA = ($cName === 'Cohort 2026-A');
            $userQuery = User::whereHas('role', fn($q) => $q->where('name', 'trainee'))->withoutTrashed();
            if ($isDefaultA) {
                $userQuery->where(function ($q) use ($cName) {
                    $q->where('cohort', $cName)->orWhereNull('cohort')->orWhere('cohort', '');
                });
            } else {
                $userQuery->where('cohort', $cName);
            }

            $total = (clone $userQuery)->count();
            $active = (clone $userQuery)->where('is_active', 1)->count();
            $suspended = (clone $userQuery)->where('is_active', 0)->count();

            $attemptQuery = \App\Models\TraineeAttempt::whereHas('trainee', function ($q) use ($cName, $isDefaultA) {
                if ($isDefaultA) {
                    $q->where('cohort', $cName)->orWhereNull('cohort')->orWhere('cohort', '');
                } else {
                    $q->where('cohort', $cName);
                }
            });

            $submissions = (clone $attemptQuery)->count();
            $passed = (clone $attemptQuery)->where('score', '>=', 70)->count();
            $passRate = $submissions > 0 ? round(($passed / $submissions) * 100) : 0;

            return [
                'name' => $cName,
                'total_trainees' => $total,
                'active_trainees' => $active,
                'suspended_trainees' => $suspended,
                'submissions_count' => $submissions,
                'pass_rate' => $passRate,
            ];
        });

        return Inertia::render('Instructor/Trainees', [
            'trainees' => $trainees,
            'tab' => $tab,
            'search' => $search,
            'selectedCohort' => $cohort,
            'cohortsSummary' => $cohortsSummary,
            'allCohorts' => $allCohorts,
            'counts' => [
                'active' => $activeCount,
                'trash' => $trashedCount,
            ]
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|max:30',
            'cohort' => 'nullable|string|max:100',
            'password' => ['required', Rules\Password::defaults()],
            'is_active' => 'boolean',
        ]);

        $traineeRole = Role::where('name', 'trainee')->firstOrFail();

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'cohort' => $request->input('cohort', 'Cohort 2026-A'),
            'password' => Hash::make($request->password),
            'role_id' => $traineeRole->id,
            'is_active' => $request->input('is_active', true),
        ]);

        // Auto-assign existing labs to this newly registered trainee
        $labs = Lab::all();
        foreach ($labs as $lab) {
            LabAssignment::firstOrCreate([
                'lab_id' => $lab->id,
                'trainee_id' => $user->id,
            ], [
                'assigned_by' => auth()->id() ?? 1,
                'status' => 'pending'
            ]);
        }

        AuditLog::create([
            'user_id' => auth()->id() ?? 1,
            'action' => 'TRAINEE_CREATE',
            'details' => "Registered trainee: {$user->name} ({$user->email}) [Cohort: {$user->cohort}]",
            'ip_address' => $request->ip(),
        ]);

        return redirect()->route('instructor.trainees.index')->with('success', 'Trainee registered successfully!');
    }

    public function update(Request $request, User $trainee)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $trainee->id,
            'phone' => 'nullable|string|max:30',
            'cohort' => 'nullable|string|max:100',
            'is_active' => 'boolean',
        ]);

        $trainee->update([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'cohort' => $request->input('cohort', $trainee->cohort ?? 'Cohort 2026-A'),
            'is_active' => $request->input('is_active', true),
        ]);

        AuditLog::create([
            'user_id' => auth()->id() ?? 1,
            'action' => 'TRAINEE_UPDATE',
            'details' => "Updated trainee profile: {$trainee->name} ({$trainee->email})",
            'ip_address' => $request->ip(),
        ]);

        return redirect()->back()->with('success', 'Trainee profile updated successfully.');
    }

    public function toggleStatus(Request $request, User $trainee)
    {
        $trainee->is_active = !$trainee->is_active;
        $trainee->save();

        $statusText = $trainee->is_active ? 'Activated' : 'Suspended';

        AuditLog::create([
            'user_id' => auth()->id() ?? 1,
            'action' => $trainee->is_active ? 'TRAINEE_ACTIVATE' : 'TRAINEE_SUSPEND',
            'details' => "{$statusText} trainee account: {$trainee->name} ({$trainee->email})",
            'ip_address' => $request->ip(),
        ]);

        return redirect()->back()->with('success', "Trainee account {$statusText} successfully.");
    }

    public function resetPassword(Request $request, User $trainee)
    {
        $request->validate([
            'password' => ['required', Rules\Password::defaults()],
        ]);

        $trainee->password = Hash::make($request->password);
        $trainee->save();

        AuditLog::create([
            'user_id' => auth()->id() ?? 1,
            'action' => 'TRAINEE_PASSWORD_RESET',
            'details' => "Reset password for trainee: {$trainee->name} ({$trainee->email})",
            'ip_address' => $request->ip(),
        ]);

        return redirect()->back()->with('success', "Password for {$trainee->name} reset successfully.");
    }

    public function destroy(User $trainee)
    {
        $name = $trainee->name;
        $email = $trainee->email;

        $trainee->delete(); // Soft delete

        AuditLog::create([
            'user_id' => auth()->id() ?? 1,
            'action' => 'TRAINEE_SOFT_DELETE',
            'details' => "Moved trainee account to Trash: {$name} ({$email})",
            'ip_address' => request()->ip(),
        ]);

        return redirect()->back()->with('success', 'Trainee moved to Trash.');
    }

    public function restore(int $id)
    {
        $trainee = User::onlyTrashed()->findOrFail($id);
        $trainee->restore();

        AuditLog::create([
            'user_id' => auth()->id() ?? 1,
            'action' => 'TRAINEE_RESTORE',
            'details' => "Restored trainee account from Trash: {$trainee->name} ({$trainee->email})",
            'ip_address' => request()->ip(),
        ]);

        return redirect()->back()->with('success', "Trainee '{$trainee->name}' restored successfully.");
    }

    public function forceDelete(int $id)
    {
        $trainee = User::onlyTrashed()->findOrFail($id);
        $name = $trainee->name;
        $email = $trainee->email;

        $trainee->forceDelete();

        AuditLog::create([
            'user_id' => auth()->id() ?? 1,
            'action' => 'TRAINEE_FORCE_DELETE',
            'details' => "Permanently destroyed trainee account: {$name} ({$email})",
            'ip_address' => request()->ip(),
        ]);

        return redirect()->back()->with('success', "Trainee '{$name}' permanently deleted.");
    }

    public function bulkStore(Request $request)
    {
        $request->validate([
            'trainees' => 'required|array|min:1',
            'trainees.*.name' => 'required|string|max:255',
            'trainees.*.email' => 'required|string|email|max:255',
            'trainees.*.phone' => 'nullable|string|max:30',
            'trainees.*.password' => 'nullable|string|min:6',
        ]);

        $traineeRole = Role::where('name', 'trainee')->firstOrFail();
        $labs = Lab::all();

        $createdCount = 0;
        $skippedCount = 0;
        $skippedEmails = [];

        foreach ($request->trainees as $row) {
            $email = trim(strtolower($row['email']));
            $name = trim($row['name']);
            $phone = !empty($row['phone']) ? trim($row['phone']) : null;
            $password = !empty($row['password']) ? $row['password'] : 'Password@123';

            if (empty($name) || empty($email)) {
                continue;
            }

            // Check duplicate
            if (User::withTrashed()->where('email', $email)->exists()) {
                $skippedCount++;
                $skippedEmails[] = $email;
                continue;
            }

            $cohort = !empty($row['cohort']) ? trim($row['cohort']) : 'Cohort 2026-A';

            $user = User::create([
                'name' => $name,
                'email' => $email,
                'phone' => $phone,
                'cohort' => $cohort,
                'password' => Hash::make($password),
                'role_id' => $traineeRole->id,
                'is_active' => true,
            ]);

            // Auto-assign all active labs
            foreach ($labs as $lab) {
                LabAssignment::firstOrCreate([
                    'lab_id' => $lab->id,
                    'trainee_id' => $user->id,
                ], [
                    'assigned_by' => auth()->id() ?? 1,
                    'status' => 'pending'
                ]);
            }

            $createdCount++;
        }

        AuditLog::create([
            'user_id' => auth()->id() ?? 1,
            'action' => 'BULK_TRAINEE_CREATE',
            'details' => "Bulk registered {$createdCount} trainees. Skipped: {$skippedCount}",
            'ip_address' => $request->ip(),
        ]);

        $message = "Successfully created {$createdCount} trainee account(s).";
        if ($skippedCount > 0) {
            $message .= " {$skippedCount} existing account(s) skipped: " . implode(', ', array_slice($skippedEmails, 0, 3)) . ($skippedCount > 3 ? '...' : '');
        }

        return redirect()->route('instructor.trainees.index')->with('success', $message);
    }

    /**
     * Rename an existing cohort across all enrolled trainees.
     */
    public function updateCohort(Request $request)
    {
        $request->validate([
            'old_cohort' => 'required|string|max:100',
            'new_cohort' => 'required|string|max:100',
        ]);

        $oldName = trim($request->old_cohort);
        $newName = trim($request->new_cohort);

        // Update trainees in database
        $query = User::where('cohort', $oldName);
        if ($oldName === 'Cohort 2026-A' || $oldName === 'Unassigned') {
            $query->orWhereNull('cohort')->orWhere('cohort', '');
        }
        $affected = $query->update(['cohort' => $newName]);

        // Update stored list
        $cohorts = $this->getStoredCohorts();
        $cohorts = array_map(fn($c) => $c === $oldName ? $newName : $c, $cohorts);
        if (!in_array($newName, $cohorts)) {
            $cohorts[] = $newName;
        }
        $this->saveStoredCohorts($cohorts);

        AuditLog::create([
            'user_id' => auth()->id() ?? 1,
            'action' => 'COHORT_RENAME',
            'details' => "Renamed cohort '{$oldName}' to '{$newName}' ({$affected} trainees updated)",
            'ip_address' => $request->ip(),
        ]);

        return redirect()->back()->with('success', "Cohort updated to '{$newName}'. {$affected} enrolled trainee(s) updated successfully.");
    }

    /**
     * Store/create a new cohort.
     */
    public function storeCohort(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
        ]);

        $cohortName = trim($request->name);
        $cohorts = $this->getStoredCohorts();
        if (!in_array($cohortName, $cohorts)) {
            $cohorts[] = $cohortName;
            $this->saveStoredCohorts($cohorts);
        }

        AuditLog::create([
            'user_id' => auth()->id() ?? 1,
            'action' => 'COHORT_CREATE',
            'details' => "Established new training cohort: '{$cohortName}'",
            'ip_address' => $request->ip(),
        ]);

        return redirect()->back()->with('success', "Training Cohort '{$cohortName}' created and ready for student enrolments.");
    }

    /**
     * Delete or merge a cohort, reassigning students.
     */
    public function deleteCohort(Request $request)
    {
        $request->validate([
            'cohort' => 'required|string',
            'transfer_to' => 'nullable|string',
        ]);

        $cohort = trim($request->cohort);
        $targetCohort = trim($request->input('transfer_to', 'Cohort 2026-A'));

        $query = User::where('cohort', $cohort);
        if ($cohort === 'Cohort 2026-A') {
            $query->orWhereNull('cohort')->orWhere('cohort', '');
        }
        $affected = $query->update(['cohort' => $targetCohort]);

        $cohorts = array_values(array_filter($this->getStoredCohorts(), fn($c) => $c !== $cohort));
        if (!in_array($targetCohort, $cohorts)) {
            $cohorts[] = $targetCohort;
        }
        $this->saveStoredCohorts($cohorts);

        AuditLog::create([
            'user_id' => auth()->id() ?? 1,
            'action' => 'COHORT_DELETE',
            'details' => "Deleted cohort '{$cohort}', {$affected} trainees reassigned to '{$targetCohort}'",
            'ip_address' => $request->ip(),
        ]);

        return redirect()->back()->with('success', "Cohort '{$cohort}' removed. {$affected} trainee(s) reassigned to '{$targetCohort}'.");
    }
}
