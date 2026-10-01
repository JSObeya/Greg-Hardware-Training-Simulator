<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use App\Models\Lab;
use App\Models\TraineeAttempt;
use App\Models\AuditLog;
use App\Models\LabAssignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminController extends Controller
{
    public function dashboard()
    {
        $traineesCount = User::whereHas('role', function ($q) {
            $q->where('name', 'trainee');
        })->count();

        $instructorsCount = User::whereHas('role', function ($q) {
            $q->where('name', 'instructor');
        })->count();

        $activeLabsCount = Lab::where('is_active', true)->count();
        $totalLabsCount = Lab::count();

        $submissionsCount = TraineeAttempt::where('status', 'submitted')->count();
        $recentLogs = AuditLog::with('user.role')->orderBy('created_at', 'desc')->take(10)->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'trainees' => $traineesCount,
                'instructors' => $instructorsCount,
                'active_labs' => $activeLabsCount,
                'total_labs' => $totalLabsCount,
                'submissions' => $submissionsCount,
            ],
            'recentLogs' => $recentLogs
        ]);
    }

    public function users(Request $request)
    {
        $tab = $request->query('tab', 'active'); // 'active' or 'trash'
        $roleFilter = $request->query('role');
        $search = $request->query('search');

        $query = User::with('role');

        if ($tab === 'trash') {
            $query->onlyTrashed();
        } else {
            $query->withoutTrashed();
        }

        if (!empty($roleFilter)) {
            $query->whereHas('role', fn($q) => $q->where('name', $roleFilter));
        }

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('name')->paginate(20)->withQueryString();
        $roles = Role::all();

        $activeCount = User::withoutTrashed()->count();
        $trashedCount = User::onlyTrashed()->count();

        return Inertia::render('Admin/Users', [
            'users' => $users,
            'roles' => $roles,
            'tab' => $tab,
            'filters' => [
                'role' => $roleFilter,
                'search' => $search,
            ],
            'counts' => [
                'active' => $activeCount,
                'trash' => $trashedCount,
            ]
        ]);
    }

    public function storeUser(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|max:30',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id',
            'is_active' => 'boolean',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role_id' => $request->role_id,
            'is_active' => $request->input('is_active', true),
        ]);

        $roleName = Role::find($request->role_id)->name ?? 'Unknown';

        // Auto-assign active labs if trainee
        if ($roleName === 'trainee') {
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
        }

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'USER_CREATE',
            'details' => "Created user account: {$user->name} ({$user->email}) with role: {$roleName}",
            'ip_address' => $request->ip(),
        ]);

        return redirect()->route('admin.users.index')->with('success', 'User created successfully!');
    }

    public function updateUser(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:30',
            'role_id' => 'required|exists:roles,id',
            'is_active' => 'boolean',
        ]);

        $oldName = $user->name;
        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'role_id' => $request->role_id,
            'is_active' => $request->input('is_active', true),
        ]);

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'USER_UPDATE',
            'details' => "Updated user profile: {$user->name} ({$user->email})",
            'ip_address' => $request->ip(),
        ]);

        return redirect()->back()->with('success', 'User profile updated successfully.');
    }

    public function toggleUserStatus(Request $request, User $user)
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()->withErrors(['error' => 'You cannot deactivate your own account.']);
        }

        $user->is_active = !$user->is_active;
        $user->save();

        $statusText = $user->is_active ? 'Activated' : 'Suspended';

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => $user->is_active ? 'USER_ACTIVATE' : 'USER_SUSPEND',
            'details' => "{$statusText} user account: {$user->name} ({$user->email})",
            'ip_address' => $request->ip(),
        ]);

        return redirect()->back()->with('success', "User account {$statusText} successfully.");
    }

    public function resetUserPassword(Request $request, User $user)
    {
        $request->validate([
            'password' => ['required', Rules\Password::defaults()],
        ]);

        $user->password = Hash::make($request->password);
        $user->save();

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'USER_PASSWORD_RESET',
            'details' => "Administrative password reset for user: {$user->name} ({$user->email})",
            'ip_address' => $request->ip(),
        ]);

        return redirect()->back()->with('success', "Password for {$user->name} reset successfully.");
    }

    public function bulkStoreUsers(Request $request)
    {
        $request->validate([
            'users' => 'required|array|min:1',
            'users.*.name' => 'required|string|max:255',
            'users.*.email' => 'required|string|email|max:255',
            'users.*.phone' => 'nullable|string|max:30',
            'users.*.password' => 'nullable|string|min:6',
            'users.*.role_id' => 'nullable|exists:roles,id',
            'default_role_id' => 'nullable|exists:roles,id',
        ]);

        $defaultRoleId = $request->default_role_id;
        if (!$defaultRoleId) {
            $traineeRole = Role::where('name', 'trainee')->first();
            $defaultRoleId = $traineeRole ? $traineeRole->id : Role::first()->id;
        }

        $traineeRoleId = Role::where('name', 'trainee')->value('id');
        $labs = Lab::all();

        $createdCount = 0;
        $skippedCount = 0;
        $skippedEmails = [];

        foreach ($request->users as $row) {
            $email = trim(strtolower($row['email']));
            $name = trim($row['name']);
            $phone = !empty($row['phone']) ? trim($row['phone']) : null;
            $password = !empty($row['password']) ? $row['password'] : 'Password@123';
            $roleId = !empty($row['role_id']) ? $row['role_id'] : $defaultRoleId;

            if (empty($name) || empty($email)) {
                continue;
            }

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
                'role_id' => $roleId,
                'is_active' => true,
            ]);

            if ($roleId == $traineeRoleId) {
                foreach ($labs as $lab) {
                    LabAssignment::firstOrCreate([
                        'lab_id' => $lab->id,
                        'trainee_id' => $user->id,
                    ], [
                        'assigned_by' => auth()->id() ?? 1,
                        'status' => 'pending'
                    ]);
                }
            }

            $createdCount++;
        }

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'BULK_USER_CREATE',
            'details' => "Bulk created {$createdCount} user accounts. Skipped: {$skippedCount}",
            'ip_address' => $request->ip(),
        ]);

        $message = "Successfully created {$createdCount} user account(s).";
        if ($skippedCount > 0) {
            $message .= " {$skippedCount} existing account(s) skipped: " . implode(', ', array_slice($skippedEmails, 0, 3)) . ($skippedCount > 3 ? '...' : '');
        }

        return redirect()->route('admin.users.index')->with('success', $message);
    }

    public function destroyUser(User $user)
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()->withErrors(['error' => 'You cannot delete your own admin account.']);
        }

        $userName = $user->name;
        $userEmail = $user->email;
        $userRoleName = $user->role->name ?? 'Unknown';

        $user->delete(); // Soft delete

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'USER_SOFT_DELETE',
            'details' => "Moved user account to Trash: {$userName} ({$userEmail}) with role: {$userRoleName}",
            'ip_address' => request()->ip(),
        ]);

        return redirect()->back()->with('success', 'User moved to Trash.');
    }

    public function restoreUser(int $id)
    {
        $user = User::onlyTrashed()->findOrFail($id);
        $user->restore();

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'USER_RESTORE',
            'details' => "Restored user account from Trash: {$user->name} ({$user->email})",
            'ip_address' => request()->ip(),
        ]);

        return redirect()->back()->with('success', "User account '{$user->name}' restored successfully.");
    }

    public function forceDeleteUser(int $id)
    {
        $user = User::onlyTrashed()->findOrFail($id);
        $userName = $user->name;
        $userEmail = $user->email;

        $user->forceDelete();

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'USER_FORCE_DELETE',
            'details' => "Permanently destroyed user account: {$userName} ({$userEmail})",
            'ip_address' => request()->ip(),
        ]);

        return redirect()->back()->with('success', "User '{$userName}' permanently deleted.");
    }

    public function logs(Request $request)
    {
        $search = $request->query('search');
        $actionFilter = $request->query('action');
        $userId = $request->query('user_id');
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $query = AuditLog::with('user.role');

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('details', 'like', "%{$search}%")
                  ->orWhere('action', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%");
            });
        }

        if (!empty($actionFilter)) {
            $query->where('action', 'like', "%{$actionFilter}%");
        }

        if (!empty($userId)) {
            $query->where('user_id', $userId);
        }

        if (!empty($startDate)) {
            $query->whereDate('created_at', '>=', $startDate);
        }

        if (!empty($endDate)) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        // Export to CSV requested
        if ($request->query('export') === 'csv') {
            return $this->exportLogsCsv($query);
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate(30)->withQueryString();
        $usersList = User::select('id', 'name', 'email')->orderBy('name')->get();

        return Inertia::render('Admin/Logs', [
            'logs' => $logs,
            'usersList' => $usersList,
            'filters' => [
                'search' => $search,
                'action' => $actionFilter,
                'user_id' => $userId,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]
        ]);
    }

    protected function exportLogsCsv($query): StreamedResponse
    {
        $filename = 'audit_logs_' . date('Y_m_d_His') . '.csv';

        return response()->streamDownload(function () use ($query) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['ID', 'Timestamp', 'Actor Name', 'Actor Email', 'Role', 'Action', 'Details', 'IP Address']);

            $query->orderBy('created_at', 'desc')->chunk(200, function ($logs) use ($handle) {
                foreach ($logs as $log) {
                    fputcsv($handle, [
                        $log->id,
                        $log->created_at->format('Y-m-d H:i:s'),
                        $log->user->name ?? 'System',
                        $log->user->email ?? 'N/A',
                        $log->user->role->name ?? 'N/A',
                        $log->action,
                        $log->details,
                        $log->ip_address ?? 'N/A',
                    ]);
                }
            });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
