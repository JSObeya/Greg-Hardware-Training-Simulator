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
        Schema::create('repair_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trainee_attempt_id')->constrained('trainee_attempts')->onDelete('cascade');
            $table->text('fault_reported');
            $table->text('symptoms_observed');
            $table->text('diagnostic_steps');
            $table->text('findings');
            $table->text('corrective_action');
            $table->text('parts_replaced')->nullable();
            $table->text('safety_precautions');
            $table->text('recommendations')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('repair_reports');
    }
};
