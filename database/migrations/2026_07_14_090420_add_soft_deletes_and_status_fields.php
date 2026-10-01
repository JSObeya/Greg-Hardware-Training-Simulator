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
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'deleted_at')) {
                $table->softDeletes();
            }
            if (!Schema::hasColumn('users', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('role_id');
            }
            if (!Schema::hasColumn('users', 'phone')) {
                $table->string('phone')->nullable()->after('email');
            }
        });

        Schema::table('labs', function (Blueprint $table) {
            if (!Schema::hasColumn('labs', 'deleted_at')) {
                $table->softDeletes();
            }
            if (!Schema::hasColumn('labs', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('time_limit');
            }
            if (!Schema::hasColumn('labs', 'expires_at')) {
                $table->dateTime('expires_at')->nullable()->after('is_active');
            }
            if (!Schema::hasColumn('labs', 'activated_at')) {
                $table->dateTime('activated_at')->nullable()->after('expires_at');
            }
        });

        Schema::table('courses', function (Blueprint $table) {
            if (!Schema::hasColumn('courses', 'deleted_at')) {
                $table->softDeletes();
            }
            if (!Schema::hasColumn('courses', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('description');
            }
        });

        Schema::table('modules', function (Blueprint $table) {
            if (!Schema::hasColumn('modules', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        Schema::table('lab_assignments', function (Blueprint $table) {
            if (!Schema::hasColumn('lab_assignments', 'deleted_at')) {
                $table->softDeletes();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropColumn(['is_active', 'phone']);
        });

        Schema::table('labs', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropColumn(['is_active', 'expires_at', 'activated_at']);
        });

        Schema::table('courses', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropColumn(['is_active']);
        });

        Schema::table('modules', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('lab_assignments', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
