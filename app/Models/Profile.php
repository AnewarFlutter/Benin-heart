<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'user_id',
        'bio',
        'location_city',
        'location_country',
        'latitude',
        'longitude',
        'height',
        'occupation',
        'education_level',
        'relationship_status',
        'looking_for',
        'profile_picture_url',
        'is_profile_complete'
    ];

    protected $casts = [
        'is_profile_complete' => 'boolean',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
