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
        Schema::create('trainee_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lab_assignment_id')->constrained('lab_assignments')->onDelete('cascade');
            $table->foreignId('trainee_id')->constrained('users')->onDelete('cascade');
            $table->dateTime('started_at');
            $table->dateTime('completed_at')->nullable();
            $table->double('score')->nullable();
            $table->string('status')->default('started'); // started, submitted, graded
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trainee_attempts');
    }
};
