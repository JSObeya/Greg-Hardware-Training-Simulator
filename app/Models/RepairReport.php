<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RepairReport extends Model
{
    protected $fillable = [
        'trainee_attempt_id',
        'fault_reported',
        'symptoms_observed',
        'diagnostic_steps',
        'findings',
        'corrective_action',
        'parts_replaced',
        'safety_precautions',
        'recommendations'
    ];

    public function traineeAttempt()
    {
        return $this->belongsTo(TraineeAttempt::class);
    }
}
