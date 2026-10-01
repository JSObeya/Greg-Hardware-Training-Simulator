<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function (\Illuminate\Http\Request $request) {
    $role = $request->user()->role->name ?? '';
    if ($role === 'admin') {
        return redirect()->route('admin.dashboard');
    } elseif ($role === 'instructor') {
        return redirect()->route('instructor.dashboard');
    }
    return redirect()->route('trainee.dashboard');
})->middleware(['auth'])->name('dashboard');

// Admin Routes
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [App\Http\Controllers\Admin\AdminController::class, 'dashboard'])->name('dashboard');
    
    // User & Trainee Management
    Route::get('/users', [App\Http\Controllers\Admin\AdminController::class, 'users'])->name('users.index');
    Route::post('/users', [App\Http\Controllers\Admin\AdminController::class, 'storeUser'])->name('users.store');
    Route::put('/users/{user}', [App\Http\Controllers\Admin\AdminController::class, 'updateUser'])->name('users.update');
    Route::post('/users/{user}/toggle-status', [App\Http\Controllers\Admin\AdminController::class, 'toggleUserStatus'])->name('users.toggle-status');
    Route::post('/users/{user}/reset-password', [App\Http\Controllers\Admin\AdminController::class, 'resetUserPassword'])->name('users.reset-password');
    Route::post('/users/bulk', [App\Http\Controllers\Admin\AdminController::class, 'bulkStoreUsers'])->name('users.bulk');
    Route::delete('/users/{user}', [App\Http\Controllers\Admin\AdminController::class, 'destroyUser'])->name('users.destroy');
    Route::post('/users/{id}/restore', [App\Http\Controllers\Admin\AdminController::class, 'restoreUser'])->name('users.restore');
    Route::delete('/users/{id}/force', [App\Http\Controllers\Admin\AdminController::class, 'forceDeleteUser'])->name('users.force-delete');

    // Database Backups
    Route::get('/backups', [App\Http\Controllers\Admin\BackupController::class, 'index'])->name('backups.index');
    Route::post('/backups/create', [App\Http\Controllers\Admin\BackupController::class, 'create'])->name('backups.create');
    Route::get('/backups/{filename}/download', [App\Http\Controllers\Admin\BackupController::class, 'download'])->name('backups.download');
    Route::delete('/backups/{filename}', [App\Http\Controllers\Admin\BackupController::class, 'destroy'])->name('backups.destroy');
    Route::post('/backups/{filename}/restore', [App\Http\Controllers\Admin\BackupController::class, 'restore'])->name('backups.restore');

    // System Audit Logs
    Route::get('/logs', [App\Http\Controllers\Admin\AdminController::class, 'logs'])->name('logs.index');
});

// Instructor Routes
Route::middleware(['auth', 'role:admin,instructor'])->prefix('instructor')->name('instructor.')->group(function () {
    Route::get('/dashboard', [App\Http\Controllers\Instructor\CourseController::class, 'dashboard'])->name('dashboard');

    // Trainee Management
    Route::get('/trainees', [App\Http\Controllers\Instructor\TraineeController::class, 'index'])->name('trainees.index');
    Route::post('/trainees', [App\Http\Controllers\Instructor\TraineeController::class, 'store'])->name('trainees.store');
    Route::put('/trainees/{trainee}', [App\Http\Controllers\Instructor\TraineeController::class, 'update'])->name('trainees.update');
    Route::post('/trainees/{trainee}/toggle-status', [App\Http\Controllers\Instructor\TraineeController::class, 'toggleStatus'])->name('trainees.toggle-status');
    Route::post('/trainees/{trainee}/reset-password', [App\Http\Controllers\Instructor\TraineeController::class, 'resetPassword'])->name('trainees.reset-password');
    Route::delete('/trainees/{trainee}', [App\Http\Controllers\Instructor\TraineeController::class, 'destroy'])->name('trainees.destroy');
    Route::post('/trainees/{id}/restore', [App\Http\Controllers\Instructor\TraineeController::class, 'restore'])->name('trainees.restore');
    Route::delete('/trainees/{id}/force', [App\Http\Controllers\Instructor\TraineeController::class, 'forceDelete'])->name('trainees.force-delete');
    Route::post('/trainees/bulk', [App\Http\Controllers\Instructor\TraineeController::class, 'bulkStore'])->name('trainees.bulk');

    // Courses & Modules
    Route::resource('courses', App\Http\Controllers\Instructor\CourseController::class);
    Route::post('modules', [App\Http\Controllers\Instructor\CourseController::class, 'storeModule'])->name('modules.store');
    Route::delete('modules/{module}', [App\Http\Controllers\Instructor\CourseController::class, 'destroyModule'])->name('modules.destroy');

    // Labs & Config
    Route::resource('labs', App\Http\Controllers\Instructor\LabController::class);
    Route::post('labs/{lab}/toggle-status', [App\Http\Controllers\Instructor\LabController::class, 'toggleStatus'])->name('labs.toggle-status');
    Route::post('labs/{lab}/set-expiration', [App\Http\Controllers\Instructor\LabController::class, 'setExpiration'])->name('labs.set-expiration');
    Route::post('labs/{id}/restore', [App\Http\Controllers\Instructor\LabController::class, 'restore'])->name('labs.restore');
    Route::delete('labs/{id}/force', [App\Http\Controllers\Instructor\LabController::class, 'forceDelete'])->name('labs.force-delete');
    Route::post('labs/{lab}/config', [App\Http\Controllers\Instructor\LabController::class, 'saveConfig'])->name('labs.config');
    Route::post('labs/{lab}/upload-asset', [App\Http\Controllers\Instructor\LabController::class, 'uploadAsset'])->name('labs.upload-asset');

    // Assignments
    Route::get('/assignments', [App\Http\Controllers\Instructor\AssignmentController::class, 'index'])->name('assignments.index');
    Route::post('/assignments', [App\Http\Controllers\Instructor\AssignmentController::class, 'store'])->name('assignments.store');
    Route::delete('/assignments/{assignment}', [App\Http\Controllers\Instructor\AssignmentController::class, 'destroy'])->name('assignments.destroy');

    // Submissions and Grading
    Route::get('/submissions', [App\Http\Controllers\Instructor\AssignmentController::class, 'submissions'])->name('submissions.index');
    Route::get('/submissions/{attempt}', [App\Http\Controllers\Instructor\AssignmentController::class, 'reviewAttempt'])->name('submissions.review');
    Route::post('/submissions/{attempt}/grade', [App\Http\Controllers\Instructor\AssignmentController::class, 'gradeAttempt'])->name('submissions.grade');
    Route::get('/submissions/{attempt}/pdf', [App\Http\Controllers\Instructor\AssignmentController::class, 'exportPdf'])->name('submissions.pdf');
});

// Trainee Routes
Route::middleware(['auth', 'role:trainee'])->prefix('trainee')->name('trainee.')->group(function () {
    Route::get('/dashboard', [App\Http\Controllers\Trainee\LabController::class, 'dashboard'])->name('dashboard');
    Route::get('/labs/{assignment}', [App\Http\Controllers\Trainee\LabController::class, 'show'])->name('labs.show');
    Route::post('/labs/{assignment}/start', [App\Http\Controllers\Trainee\LabController::class, 'start'])->name('labs.start');
    Route::post('/labs/{attempt}/submit', [App\Http\Controllers\Trainee\LabController::class, 'submit'])->name('labs.submit');
});

// User Profile Routes
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
