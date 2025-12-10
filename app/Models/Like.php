<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Like extends Model
{
    use HasFactory;

    protected $fillable = [
        'from_user_id',
        'to_user_id',
        'status',
        'is_super_like',
        'liked_at',
        'responded_at'
    ];

    protected $casts = [
        'is_super_like' => 'boolean',
        'liked_at' => 'datetime',
        'responded_at' => 'datetime',
    ];

    public function fromUser()
    {
        return $this->belongsTo(User::class, 'from_user_id');
    }

    public function toUser()
    {
        return $this->belongsTo(User::class, 'to_user_id');
    }

    public function match()
    {
        return $this->hasOne(UserMatch::class);
    }
}
