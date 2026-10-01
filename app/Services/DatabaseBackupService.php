<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Exception;

class DatabaseBackupService
{
    protected string $backupDir;

    public function __construct()
    {
        $this->backupDir = storage_path('app/backups');
        if (!File::exists($this->backupDir)) {
            File::makeDirectory($this->backupDir, 0755, true);
        }
    }

    /**
     * Generate an on-demand SQL dump backup of the database
     */
    public function createBackup(): array
    {
        $filename = 'backup_' . date('Y_m_d_His') . '.sql';
        $filepath = $this->backupDir . DIRECTORY_SEPARATOR . $filename;

        $connection = config('database.default');
        $dbName = config("database.connections.{$connection}.database");

        $sqlContent = "-- Hardware Training Simulator Database Backup\n";
        $sqlContent .= "-- Generated at: " . date('Y-m-d H:i:s') . "\n";
        $sqlContent .= "-- Database: " . $dbName . "\n";
        $sqlContent .= "-- --------------------------------------------------------\n\n";
        $sqlContent .= "SET FOREIGN_KEY_CHECKS=0;\n\n";

        $pdo = DB::connection()->getPdo();

        // Get all tables
        $tables = [];
        $driver = DB::connection()->getDriverName();

        if ($driver === 'mysql') {
            $rows = DB::select('SHOW TABLES');
            $keyName = "Tables_in_{$dbName}";
            foreach ($rows as $row) {
                $tables[] = $row->$keyName ?? reset($row);
            }
        } elseif ($driver === 'sqlite') {
            $rows = DB::select("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
            foreach ($rows as $row) {
                $tables[] = $row->name;
            }
        }

        foreach ($tables as $table) {
            $sqlContent .= "-- --------------------------------------------------------\n";
            $sqlContent .= "-- Table structure for `{$table}`\n";
            $sqlContent .= "-- --------------------------------------------------------\n";
            $sqlContent .= "DROP TABLE IF EXISTS `{$table}`;\n";

            if ($driver === 'mysql') {
                $createTableRes = DB::select("SHOW CREATE TABLE `{$table}`");
                $createTableSql = $createTableRes[0]->{'Create Table'} ?? '';
                $sqlContent .= $createTableSql . ";\n\n";
            }

            // Dump data
            $rows = DB::table($table)->get();
            if ($rows->count() > 0) {
                $sqlContent .= "-- Dumping data for table `{$table}`\n";
                foreach ($rows as $row) {
                    $rowArray = (array) $row;
                    $columns = array_map(fn($col) => "`{$col}`", array_keys($rowArray));
                    $values = array_map(function ($val) use ($pdo) {
                        if ($val === null) {
                            return 'NULL';
                        }
                        return $pdo->quote($val);
                    }, array_values($rowArray));

                    $sqlContent .= "INSERT INTO `{$table}` (" . implode(', ', $columns) . ") VALUES (" . implode(', ', $values) . ");\n";
                }
                $sqlContent .= "\n";
            }
        }

        $sqlContent .= "SET FOREIGN_KEY_CHECKS=1;\n";

        File::put($filepath, $sqlContent);

        return [
            'filename' => $filename,
            'filepath' => $filepath,
            'size' => File::size($filepath),
            'created_at' => date('Y-m-d H:i:s'),
        ];
    }

    /**
     * List all existing backup files
     */
    public function listBackups(): array
    {
        $files = File::files($this->backupDir);
        $backups = [];

        foreach ($files as $file) {
            if ($file->getExtension() === 'sql' || $file->getExtension() === 'zip') {
                $backups[] = [
                    'filename' => $file->getFilename(),
                    'size' => $file->getSize(),
                    'size_formatted' => $this->formatBytes($file->getSize()),
                    'created_at' => date('Y-m-d H:i:s', $file->getMTime()),
                    'timestamp' => $file->getMTime(),
                ];
            }
        }

        // Sort latest first
        usort($backups, fn($a, $b) => $b['timestamp'] <=> $a['timestamp']);

        return $backups;
    }

    /**
     * Get absolute path of a backup file
     */
    public function getBackupPath(string $filename): ?string
    {
        $safeName = basename($filename);
        $filepath = $this->backupDir . DIRECTORY_SEPARATOR . $safeName;
        return File::exists($filepath) ? $filepath : null;
    }

    /**
     * Delete a backup file
     */
    public function deleteBackup(string $filename): bool
    {
        $path = $this->getBackupPath($filename);
        if ($path) {
            return File::delete($path);
        }
        return false;
    }

    /**
     * Restore database from an SQL file
     */
    public function restoreBackup(string $filename): bool
    {
        $path = $this->getBackupPath($filename);
        if (!$path) {
            throw new Exception("Backup file '{$filename}' not found.");
        }

        $sql = File::get($path);
        DB::unprepared($sql);
        return true;
    }

    protected function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
