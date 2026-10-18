<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Find all assignments that have duplicate attempt rows
        $assignments = DB::table('trainee_attempts')
            ->select('lab_assignment_id')
            ->groupBy('lab_assignment_id')
            ->havingRaw('count(*) > 1')
            ->pluck('lab_assignment_id');

        foreach ($assignments as $assignmentId) {
            // Keep the best attempt: prioritizing graded/submitted status, highest score, then most recent
            $bestAttempt = DB::table('trainee_attempts')
                ->where('lab_assignment_id', $assignmentId)
                ->orderByRaw("CASE WHEN status = 'graded' THEN 1 WHEN status = 'submitted' THEN 2 ELSE 3 END")
                ->orderByDesc('score')
                ->orderByDesc('completed_at')
                ->orderByDesc('id')
                ->first();

            if ($bestAttempt) {
                // Delete duplicate attempts for this assignment
                DB::table('trainee_attempts')
                    ->where('lab_assignment_id', $assignmentId)
                    ->where('id', '!=', $bestAttempt->id)
                    ->delete();
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No reversal needed
    }
};
