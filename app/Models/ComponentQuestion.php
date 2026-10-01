<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['lab_id', 'image_path', 'correct_name', 'correct_function', 'options', 'function_options'])]
class ComponentQuestion extends Model
{
    protected function casts(): array
    {
        return [
            'options' => 'array',
            'function_options' => 'array',
        ];
    }

    public function lab()
    {
        return $this->belongsTo(Lab::class);
    }
}
