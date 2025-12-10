<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;
    
     protected $fillable = [
        'reporter_user_id',
        'reported_user_id',
        'reason',
        'description',
        'status',
        'reported_at'
    ];

    protected $casts = [
        'reported_at' => 'datetime',
    ];

    public function reporter()
    {
        return $this->belongsTo(User::class, 'reporter_user_id');
    }

    public function reported()
    {
        return $this->belongsTo(User::class, 'reported_user_id');
    }
}
