<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['lab_id', 'step_number', 'instruction', 'hint', 'is_safety_critical'])]
class AssemblyStep extends Model
{
    protected function casts(): array
    {
        return [
            'is_safety_critical' => 'boolean',
            'step_number' => 'integer',
        ];
    }

    public function lab()
    {
        return $this->belongsTo(Lab::class);
    }
}
