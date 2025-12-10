<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Like;
use App\Models\Swipe;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;

class SwipeController extends Controller
{
 
    /**
     * Effectuer un swipe
     */
    public function swipe(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'to_user_id' => 'required|exists:users,id',
            'direction' => 'required|in:left,right'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        // Vérifier que l'utilisateur n'a pas déjà swipé
        $existingSwipe = Swipe::where('from_user_id', $user->id)
            ->where('to_user_id', $request->to_user_id)
            ->first();

        if ($existingSwipe) {
            return response()->json(['message' => 'Vous avez déjà swipé sur ce profil'], 400);
        }

        // Créer le swipe
        $swipe = Swipe::create([
            'from_user_id' => $user->id,
            'to_user_id' => $request->to_user_id,
            'swipe_direction' => $request->direction,
            'swiped_at' => Carbon::now()
        ]);

        // Si swipe right, créer un like (demande de connexion)
        if ($request->direction === 'right') {
            $like = Like::create([
                'from_user_id' => $user->id,
                'to_user_id' => $request->to_user_id,
                'status' => 'pending',
                'liked_at' => Carbon::now()
            ]);

            // TODO: Envoyer une notification à l'utilisateur ciblé

            //Email,
            return response()->json([
                'message' => 'Demande de connexion envoyée',
                'swipe' => $swipe,
                'like' => $like
            ], 201);
        }

        return response()->json([
            'message' => 'Swipe enregistré',
            'swipe' => $swipe
        ], 201);
    }

    /**
     * Historique des swipes
     */
    public function history(Request $request)
    {
        $swipes = $request->user()->swipesGiven()
            ->with('toUser.profile', 'toUser.photos')
            ->orderBy('swiped_at', 'desc')
            ->paginate(20);

        return response()->json(['swipes' => $swipes], 200);
        
    }

}
