<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */

    protected $fillable = [
        'email',
        'password',
        'username',
        'first_name',
        'last_name',
        'date_of_birth',
        'gender',
        'phone_number',
        'nationality',
        'current_country',
        'role_id',
        'is_active',
        'is_verified',
        'otp',
        'otp_expired_at',
        'last_login'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
   

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */

     protected $hidden = [
        'password',
        'otp',
        'remember_token',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'is_active' => 'boolean',
        'is_verified' => 'boolean',
        'otp_expired_at' => 'datetime',
        'last_login' => 'datetime',
        'email_verified_at' => 'datetime',
    ];

    // Relations
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function profile()
    {
        return $this->hasOne(Profile::class);
    }

    public function photos()
    {
        return $this->hasMany(Photo::class);
    }

    public function swipesGiven()
    {
        return $this->hasMany(Swipe::class, 'from_user_id');
    }

    public function swipesReceived()
    {
        return $this->hasMany(Swipe::class, 'to_user_id');
    }

    public function likesSent()
    {
        return $this->hasMany(Like::class, 'from_user_id');
    }

    public function likesReceived()
    {
        return $this->hasMany(Like::class, 'to_user_id');
    }

    public function matches()
    {
        return $this->hasMany(UserMatch::class, 'user_id');
    }

    public function matchedWith()
    {
        return $this->hasMany(UserMatch::class, 'matched_user_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function blocks()
    {
        return $this->hasMany(Block::class, 'blocker_user_id');
    }

    public function blockedBy()
    {
        return $this->hasMany(Block::class, 'blocked_user_id');
    }

    public function reportsGiven()
    {
        return $this->hasMany(Report::class, 'reporter_user_id');
    }

    public function reportsReceived()
    {
        return $this->hasMany(Report::class, 'reported_user_id');
    }
}
