<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('trainee_attempts', function (Blueprint $table) {
            if (!Schema::hasColumn('trainee_attempts', 'deleted_at')) {
                $table->softDeletes()->after('status');
            }

            // Performance indexes for fast querying, filtering, and reporting
            $table->index('status', 'idx_trainee_attempts_status');
            $table->index('completed_at', 'idx_trainee_attempts_completed_at');
            $table->index('started_at', 'idx_trainee_attempts_started_at');
            $table->index('score', 'idx_trainee_attempts_score');
            $table->index(['status', 'score'], 'idx_trainee_attempts_status_score');
            $table->index(['lab_assignment_id', 'trainee_id'], 'idx_trainee_attempts_assignment_trainee');
        });

        Schema::table('lab_assignments', function (Blueprint $table) {
            $table->index(['lab_id', 'trainee_id'], 'idx_lab_assignments_lab_trainee');
            $table->index('status', 'idx_lab_assignments_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('trainee_attempts', function (Blueprint $table) {
            $table->dropIndex('idx_trainee_attempts_status');
            $table->dropIndex('idx_trainee_attempts_completed_at');
            $table->dropIndex('idx_trainee_attempts_started_at');
            $table->dropIndex('idx_trainee_attempts_score');
            $table->dropIndex('idx_trainee_attempts_status_score');
            $table->dropIndex('idx_trainee_attempts_assignment_trainee');

            if (Schema::hasColumn('trainee_attempts', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
        });

        Schema::table('lab_assignments', function (Blueprint $table) {
            $table->dropIndex('idx_lab_assignments_lab_trainee');
            $table->dropIndex('idx_lab_assignments_status');
        });
    }
};
