<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['lab_id', 'trainee_id', 'assigned_by', 'status', 'due_at'])]
class LabAssignment extends Model
{
    use SoftDeletes;

    protected function casts(): array
    {
        return [
            'due_at' => 'datetime',
        ];
    }

    public function lab()
    {
        return $this->belongsTo(Lab::class);
    }

    public function trainee()
    {
        return $this->belongsTo(User::class, 'trainee_id');
    }

    public function assigner()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function attempts()
    {
        return $this->hasMany(TraineeAttempt::class);
    }
}
