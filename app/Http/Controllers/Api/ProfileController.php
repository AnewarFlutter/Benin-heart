<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
  
    /**
     * Afficher le profil de l'utilisateur connecté
     */
    public function show(Request $request)
    {
        $user = $request->user()->load('profile', 'photos', 'role');

        return response()->json(['user' => $user], 200);
    }

    /**
     * Mettre à jour le profil
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'bio' => 'nullable|string|max:500',
            'location_city' => 'nullable|string',
            'location_country' => 'nullable|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'height' => 'nullable|integer|min:100|max:250',
            'occupation' => 'nullable|string',
            'education_level' => 'nullable|string',
            'relationship_status' => 'nullable|string',
            'looking_for' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $profile = $request->user()->profile;
        $profile->update($request->only([
            'bio',
            'location_city',
            'location_country',
            'latitude',
            'longitude',
            'height',
            'occupation',
            'education_level',
            'relationship_status',
            'looking_for'
        ]));

        // Vérifier si le profil est complet
        $this->checkProfileCompletion($profile);

        return response()->json([
            'message' => 'Profil mis à jour avec succès',
            'profile' => $profile
        ], 200);
    }

    /**
     * Vérifier si le profil est complet
     */
    private function checkProfileCompletion($profile)
    {
        $requiredFields = [
            'bio',
            'location_city',
            'location_country',
            'height',
            'occupation',
            'looking_for'
        ];

        $isComplete = true;
        foreach ($requiredFields as $field) {
            if (empty($profile->$field)) {
                $isComplete = false;
                break;
            }
        }

        // Vérifier qu'il y a au moins une photo
        if ($profile->user->photos()->count() === 0) {
            $isComplete = false;
        }

        $profile->update(['is_profile_complete' => $isComplete]);
    }
}
