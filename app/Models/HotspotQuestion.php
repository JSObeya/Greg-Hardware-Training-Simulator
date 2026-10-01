<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['lab_id', 'label', 'x_coord', 'y_coord', 'radius'])]
class HotspotQuestion extends Model
{
    protected function casts(): array
    {
        return [
            'x_coord' => 'double',
            'y_coord' => 'double',
            'radius' => 'double',
        ];
    }

    public function lab()
    {
        return $this->belongsTo(Lab::class);
    }
}
