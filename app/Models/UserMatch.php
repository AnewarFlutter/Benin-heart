<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserMatch extends Model
{
    use HasFactory;
    protected $table = 'matches';


    protected $fillable = [
        'user_id',
        'matched_user_id',
        'like_id',
        'status',
        'matched_at'
    ];

    protected $casts = [
        'matched_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function matchedUser()
    {
        return $this->belongsTo(User::class, 'matched_user_id');
    }

    public function like()
    {
        return $this->belongsTo(Like::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class, 'match_id');
    }
}
