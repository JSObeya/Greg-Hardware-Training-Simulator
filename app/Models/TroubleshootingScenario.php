<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['lab_id', 'title', 'scenario_text', 'symptoms', 'steps', 'correct_conclusion', 'variants'])]
class TroubleshootingScenario extends Model
{
    protected function casts(): array
    {
        return [
            'symptoms' => 'array',
            'steps' => 'array',
            'variants' => 'array',
        ];
    }

    public function lab()
    {
        return $this->belongsTo(Lab::class);
    }
}
