<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\UserMatch;
use App\Mail\NewMessageMail;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MessageController extends Controller
{
    /**
     * Récupérer les messages d'un match
     */
    public function index(Request $request, $matchId)
    {
        $user = $request->user();

        // Vérifier que l'utilisateur fait partie du match
        $match = UserMatch::where('id', $matchId)
            ->where(function($query) use ($user) {
                $query->where('user_id', $user->id)
                      ->orWhere('matched_user_id', $user->id);
            })
            ->where('status', 'active')
            ->first();

        if (!$match) {
            return response()->json(['message' => 'Match non trouvé ou inactif'], 404);
        }

        $messages = Message::where('match_id', $matchId)
            ->with('sender')
            ->orderBy('sent_at', 'asc')
            ->get();

        // Marquer les messages reçus comme lus
        Message::where('match_id', $matchId)
            ->where('sender_id', '!=', $user->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => Carbon::now()
            ]);

        return response()->json(['messages' => $messages], 200);
    }

    /**
     * Envoyer un message
     */
    public function store(Request $request, $matchId)
    {
        $validator = Validator::make($request->all(), [
            'message_text' => 'required|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        // Vérifier que l'utilisateur fait partie du match
        $match = UserMatch::where('id', $matchId)
            ->where(function($query) use ($user) {
                $query->where('user_id', $user->id)
                      ->orWhere('matched_user_id', $user->id);
            })
            ->where('status', 'active')
            ->first();

        if (!$match) {
            return response()->json(['message' => 'Match non trouvé ou inactif'], 404);
        }

        
        $message = Message::create([
            'match_id' => $matchId,
            'sender_id' => $user->id,
            'message_text' => $request->message_text,
            'sent_at' => Carbon::now()
        ]);

        // Déterminer l'autre utilisateur du match
        $recipientId = $match->user_id === $user->id ? $match->matched_user_id : $match->user_id;
        $recipient = \App\Models\User::find($recipientId);

        // Envoyer un e-mail de notification à l'autre utilisateur
        if ($recipient) {
            $messagePreview = strlen($request->message_text) > 100
                ? substr($request->message_text, 0, 100) . '...'
                : $request->message_text;

            Mail::to($recipient->email)->send(
                new NewMessageMail($user->first_name, $messagePreview, $recipient->first_name)
            );
        }

        return response()->json([
            'message' => 'Message envoyé',
            'data' => $message->load('sender')
        ], 201);
    }
}
