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
    public function index(Request $request)
    {
        $tab = $request->query('tab', 'active'); // 'active' or 'trash'
        $search = $request->query('search');

        $query = User::whereHas('role', function ($query) {
            $query->where('name', 'trainee');
        })->withCount([
            'assignments',
            'attempts' => function ($q) {
                $q->where('status', 'submitted')->orWhere('status', 'graded');
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

        $trainees = $query->orderBy('name')->paginate(20)->withQueryString();

        $activeCount = User::whereHas('role', fn($q) => $q->where('name', 'trainee'))->withoutTrashed()->count();
        $trashedCount = User::whereHas('role', fn($q) => $q->where('name', 'trainee'))->onlyTrashed()->count();

        return Inertia::render('Instructor/Trainees', [
            'trainees' => $trainees,
            'tab' => $tab,
            'search' => $search,
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
            'password' => ['required', Rules\Password::defaults()],
            'is_active' => 'boolean',
        ]);

        $traineeRole = Role::where('name', 'trainee')->firstOrFail();

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
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
            'details' => "Registered trainee: {$user->name} ({$user->email})",
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
            'is_active' => 'boolean',
        ]);

        $trainee->update([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
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

            $user = User::create([
                'name' => $name,
                'email' => $email,
                'phone' => $phone,
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
}
