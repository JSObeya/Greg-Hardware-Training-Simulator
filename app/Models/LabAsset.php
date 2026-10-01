<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['lab_id', 'file_path', 'asset_type'])]
class LabAsset extends Model
{
    public function lab()
    {
        return $this->belongsTo(Lab::class);
    }
}
