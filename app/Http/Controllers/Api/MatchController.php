<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Like;
use App\Models\User;
use App\Models\UserMatch ;
use Illuminate\Http\Request;

class MatchController extends Controller
{
       /**
     * Lister tous les matchs de l'utilisateur
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $matches = UserMatch::where(function($query) use ($user) {
                $query->where('user_id', $user->id)
                      ->orWhere('matched_user_id', $user->id);
            })
            ->where('status', 'active')
            ->with(['user.profile', 'user.photos', 'matchedUser.profile', 'matchedUser.photos'])
            ->orderBy('matched_at', 'desc')
            ->get();

        // Formater les données pour renvoyer l'autre utilisateur
        $matches = $matches->map(function($match) use ($user) {
            $otherUser = $match->user_id === $user->id ? $match->matchedUser : $match->user;

            return [
                'match_id' => $match->id,
                'matched_at' => $match->matched_at,
                'user' => [
                    'id' => $otherUser->id,
                    'username' => $otherUser->username,
                    'first_name' => $otherUser->first_name,
                    'age' => \Carbon\Carbon::parse($otherUser->date_of_birth)->age,
                    'profile' => $otherUser->profile,
                    'photos' => $otherUser->photos
                ]
            ];
        });

        return response()->json(['matches' => $matches], 200);
    }

    /**
     * Détails d'un match
     */
    public function show(Request $request, $matchId)
    {
        $user = $request->user();

        $match = UserMatch::where('id', $matchId)
            ->where(function($query) use ($user) {
                $query->where('user_id', $user->id)
                      ->orWhere('matched_user_id', $user->id);
            })
            ->with(['user.profile', 'user.photos', 'matchedUser.profile', 'matchedUser.photos', 'messages'])
            ->first();

        if (!$match) {
            return response()->json(['message' => 'Match non trouvé'], 404);
        }

        return response()->json(['match' => $match], 200);
    }

    /**
     * Supprimer un match (unmatch)
     */
    public function unmatch(Request $request, $matchId)
    {
        $user = $request->user();

        $match = UserMatch::where('id', $matchId)
            ->where(function($query) use ($user) {
                $query->where('user_id', $user->id)
                      ->orWhere('matched_user_id', $user->id);
            })
            ->first();

        if (!$match) {
            return response()->json(['message' => 'Match non trouvé'], 404);
        }

        $match->update(['status' => 'unmatched']);

        return response()->json(['message' => 'Match supprimé'], 200);
    }
}
