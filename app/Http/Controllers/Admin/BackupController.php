<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\DatabaseBackupService;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Exception;

class BackupController extends Controller
{
    protected DatabaseBackupService $backupService;

    public function __construct(DatabaseBackupService $backupService)
    {
        $this->backupService = $backupService;
    }

    public function index()
    {
        $backups = $this->backupService->listBackups();
        $dbName = config('database.connections.' . config('database.default') . '.database');

        return Inertia::render('Admin/Backups', [
            'backups' => $backups,
            'dbInfo' => [
                'database' => $dbName,
                'driver' => config('database.default'),
                'backup_path' => storage_path('app/backups'),
            ]
        ]);
    }

    public function create(Request $request)
    {
        try {
            $backup = $this->backupService->createBackup();

            AuditLog::create([
                'user_id' => auth()->id(),
                'action' => 'DB_BACKUP_CREATE',
                'details' => "Generated on-demand database backup: {$backup['filename']} ({$backup['size']} bytes)",
                'ip_address' => $request->ip(),
            ]);

            return redirect()->route('admin.backups.index')->with('success', "Database backup '{$backup['filename']}' created successfully!");
        } catch (Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Backup creation failed: ' . $e->getMessage()]);
        }
    }

    public function download(string $filename)
    {
        $path = $this->backupService->getBackupPath($filename);
        if (!$path) {
            return redirect()->back()->withErrors(['error' => 'Backup file not found.']);
        }

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'DB_BACKUP_DOWNLOAD',
            'details' => "Downloaded database backup archive: {$filename}",
            'ip_address' => request()->ip(),
        ]);

        return response()->download($path);
    }

    public function destroy(string $filename)
    {
        $success = $this->backupService->deleteBackup($filename);
        if ($success) {
            AuditLog::create([
                'user_id' => auth()->id(),
                'action' => 'DB_BACKUP_DELETE',
                'details' => "Deleted database backup archive: {$filename}",
                'ip_address' => request()->ip(),
            ]);

            return redirect()->route('admin.backups.index')->with('success', "Backup '{$filename}' deleted successfully.");
        }

        return redirect()->back()->withErrors(['error' => 'Could not delete backup file.']);
    }

    public function restore(Request $request, string $filename)
    {
        try {
            $this->backupService->restoreBackup($filename);

            AuditLog::create([
                'user_id' => auth()->id(),
                'action' => 'DB_BACKUP_RESTORE',
                'details' => "Restored full database from backup archive: {$filename}",
                'ip_address' => $request->ip(),
            ]);

            return redirect()->route('admin.backups.index')->with('success', "Database restored successfully from backup '{$filename}'!");
        } catch (Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Database restore failed: ' . $e->getMessage()]);
        }
    }
}
