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
        Schema::create('troubleshooting_scenarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lab_id')->constrained('labs')->onDelete('cascade');
            $table->string('title');
            $table->text('scenario_text');
            $table->json('symptoms'); // List of symptoms
            $table->json('steps'); // List of checklist items and findings
            $table->text('correct_conclusion');
            $table->json('variants')->nullable(); // Option variants for dynamic options
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('troubleshooting_scenarios');
    }
};
