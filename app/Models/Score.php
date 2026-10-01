<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['trainee_attempt_id', 'component_score', 'assembly_score', 'diagnosis_score', 'safety_score', 'report_score', 'total_score'])]
class Score extends Model
{
    public function attempt()
    {
        return $this->belongsTo(TraineeAttempt::class, 'trainee_attempt_id');
    }
}
