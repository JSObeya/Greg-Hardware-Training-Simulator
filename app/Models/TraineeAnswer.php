<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TraineeAnswer extends Model
{
    protected $fillable = [
        'trainee_attempt_id',
        'question_type',
        'question_id',
        'answer_data',
        'is_correct',
        'score_awarded',
    ];

    protected function casts(): array
    {
        return [
            'answer_data' => 'array',
            'is_correct' => 'boolean',
            'score_awarded' => 'double',
        ];
    }

    public function attempt()
    {
        return $this->belongsTo(TraineeAttempt::class, 'trainee_attempt_id');
    }
}
