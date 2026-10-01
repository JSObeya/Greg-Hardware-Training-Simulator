<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['module_id', 'title', 'description', 'type', 'passing_score', 'time_limit', 'is_active', 'expires_at', 'activated_at'])]
class Lab extends Model
{
    use SoftDeletes;

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'expires_at' => 'datetime',
            'activated_at' => 'datetime',
            'passing_score' => 'integer',
            'time_limit' => 'integer',
        ];
    }

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function assets()
    {
        return $this->hasMany(LabAsset::class);
    }

    public function assignments()
    {
        return $this->hasMany(LabAssignment::class);
    }

    public function componentQuestions()
    {
        return $this->hasMany(ComponentQuestion::class);
    }

    public function hotspotQuestions()
    {
        return $this->hasMany(HotspotQuestion::class);
    }

    public function assemblySteps()
    {
        return $this->hasMany(AssemblyStep::class)->orderBy('step_number');
    }

    public function troubleshootingScenarios()
    {
        return $this->hasMany(TroubleshootingScenario::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && now()->greaterThan($this->expires_at);
    }

    public function isAvailable(): bool
    {
        return $this->is_active && !$this->isExpired();
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeAvailable($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            });
    }
}
