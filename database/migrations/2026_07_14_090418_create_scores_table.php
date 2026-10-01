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
        Schema::create('scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trainee_attempt_id')->constrained('trainee_attempts')->onDelete('cascade');
            $table->double('component_score')->default(0);
            $table->double('assembly_score')->default(0);
            $table->double('diagnosis_score')->default(0);
            $table->double('safety_score')->default(0);
            $table->double('report_score')->default(0);
            $table->double('total_score')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scores');
    }
};
