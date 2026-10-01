<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TraineeAttempt extends Model
{
    protected $fillable = [
        'lab_assignment_id',
        'trainee_id',
        'started_at',
        'completed_at',
        'score',
        'status'
    ];

    public function assignment()
    {
        return $this->belongsTo(LabAssignment::class, 'lab_assignment_id');
    }

    public function trainee()
    {
        return $this->belongsTo(User::class, 'trainee_id');
    }

    public function repairReport()
    {
        return $this->hasOne(RepairReport::class);
    }

    public function answers()
    {
        return $this->hasMany(TraineeAnswer::class);
    }

    public function feedbacks()
    {
        return $this->hasMany(Feedback::class);
    }

    public function scores()
    {
        return $this->hasMany(Score::class);
    }

    public function score()
    {
        return $this->hasOne(Score::class);
    }
}
