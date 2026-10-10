<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Score extends Model
{
    protected $fillable = [
        'trainee_attempt_id',
        'component_score',
        'assembly_score',
        'diagnosis_score',
        'safety_score',
        'report_score',
        'total_score'
    ];

    public function attempt()
    {
        return $this->belongsTo(TraineeAttempt::class, 'trainee_attempt_id');
    }
}
