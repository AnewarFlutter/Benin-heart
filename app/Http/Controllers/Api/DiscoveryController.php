<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class DiscoveryController extends Controller
{
     /**
     * Découvrir des profils
     */
    public function discover(Request $request)
    {
        $user = $request->user(); // 

        // IDs des utilisateurs déjà swipés
        $swipedUserIds = $user->swipesGiven()->pluck('to_user_id')->toArray();

        // IDs des utilisateurs bloqués
        $blockedUserIds = $user->blocks()->pluck('blocked_user_id')->toArray();

        // IDs des utilisateurs qui ont bloqué l'utilisateur courant
        $blockedByUserIds = $user->blockedBy()->pluck('blocker_user_id')->toArray();

        // Récupérer les profils disponibles
        $profiles = User::with(['profile', 'photos'])
            ->where('id', '!=', $user->id)
            ->where('is_verified', true)
            ->where('is_active', true)
            ->whereNotIn('id', $swipedUserIds)
            ->whereNotIn('id', $blockedUserIds)
            ->whereNotIn('id', $blockedByUserIds)
            ->whereHas('profile', function($query) {
                $query->where('is_profile_complete', true);
            })
            ->inRandomOrder()
            ->limit(20)
            ->get();

        // Calculer l'âge et formater les données
        $profiles = $profiles->map(function($profile) {
            return [
                'id' => $profile->id,
                'username' => $profile->username,
                'first_name' => $profile->first_name,
                'age' => \Carbon\Carbon::parse($profile->date_of_birth)->age,
                'profile' => $profile->profile,
                'photos' => $profile->photos->sortBy('order_position')->values()
            ];
        });

        return response()->json([
            'profiles' => $profiles,
            'count' => $profiles->count()
        ], 200);
    }
}
