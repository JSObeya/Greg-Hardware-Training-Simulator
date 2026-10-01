<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    protected $table = 'feedback';

    protected $fillable = [
        'trainee_attempt_id',
        'instructor_id',
        'comments',
        'graded_at'
    ];

    public function traineeAttempt()
    {
        return $this->belongsTo(TraineeAttempt::class);
    }

    public function instructor()
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }
}
