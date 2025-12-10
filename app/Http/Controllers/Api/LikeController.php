<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Like;
use App\Models\UserMatch;
use App\Mail\MatchNotificationMail;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;
use Illuminate\Http\Request;
class LikeController extends Controller
{
    /**
     * Récupérer les demandes reçues
     */
    public function received(Request $request)
    {
        $likes = Like::where('to_user_id', $request->user()->id)
            ->where('status', 'pending')
            ->with('fromUser.profile', 'fromUser.photos')
            ->orderBy('liked_at', 'desc')
            ->get();

        return response()->json(['likes' => $likes], 200);
    }

    /**
     * Récupérer les demandes envoyées
     */
    public function sent(Request $request)
    {
        $likes = Like::where('from_user_id', $request->user()->id)
            ->with('toUser.profile', 'toUser.photos')
            ->orderBy('liked_at', 'desc')
            ->get();

        return response()->json(['likes' => $likes], 200);
    }

    /**
     * Accepter une demande
     */
    public function accept(Request $request, $likeId)
    {
        $like = Like::where('id', $likeId)
            ->where('to_user_id', $request->user()->id)
            ->where('status', 'pending')
            ->first();

        if (!$like) {
            return response()->json(['message' => 'Demande non trouvée'], 404);
        }

        // Mettre à jour le like
        $like->update([
            'status' => 'accepted',
            'responded_at' => Carbon::now()
        ]);

        // Créer le match
        $match = UserMatch::create([
            'user_id' => $like->from_user_id < $like->to_user_id ? $like->from_user_id : $like->to_user_id,
            'matched_user_id' => $like->from_user_id < $like->to_user_id ? $like->to_user_id : $like->from_user_id,
            'like_id' => $like->id,
            'status' => 'active',
            'matched_at' => Carbon::now()
        ]);

        // Charger les relations
        $match->load('user.profile', 'matchedUser.profile');

        // Envoyer un e-mail de notification aux deux utilisateurs
        $fromUser = $like->fromUser;
        $toUser = $like->toUser;

        // Email à l'utilisateur qui a envoyé la demande
        Mail::to($fromUser->email)->send(new MatchNotificationMail($toUser, $fromUser->first_name));

        // Email à l'utilisateur qui a accepté la demande
        Mail::to($toUser->email)->send(new MatchNotificationMail($fromUser, $toUser->first_name));

        return response()->json([
            'message' => 'Demande acceptée ! Vous avez un nouveau match',
            'match' => $match
        ], 200);
    }

    /**
     * Refuser une demande
     */
    public function reject(Request $request, $likeId)
    {
        $like = Like::where('id', $likeId)
            ->where('to_user_id', $request->user()->id)
            ->where('status', 'pending')
            ->first();

        if (!$like) {
            return response()->json(['message' => 'Demande non trouvée'], 404);
        }

        $like->update([
            'status' => 'rejected',
            'responded_at' => Carbon::now()
        ]);

        return response()->json(['message' => 'Demande refusée'], 200);
    }
}