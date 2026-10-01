<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['course_id', 'title', 'description', 'order_index'])]
class Module extends Model
{
    use SoftDeletes;

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function labs()
    {
        return $this->hasMany(Lab::class);
    }
}
