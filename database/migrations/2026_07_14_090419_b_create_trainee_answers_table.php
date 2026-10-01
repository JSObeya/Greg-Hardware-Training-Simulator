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
        Schema::create('trainee_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trainee_attempt_id')->constrained('trainee_attempts')->onDelete('cascade');
            $table->string('question_type'); // component, hotspot, assembly, troubleshooting
            $table->unsignedBigInteger('question_id');
            $table->json('answer_data');
            $table->boolean('is_correct');
            $table->double('score_awarded')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trainee_answers');
    }
};
