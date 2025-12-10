<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Block;
use App\Models\Match;
use App\Models\UserMatch;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class BlockController extends Controller
{
    /**
     * Bloquer un utilisateur
     */
    public function block(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'blocked_user_id' => 'required|exists:users,id',
            'reason' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        // Vérifier que l'utilisateur ne se bloque pas lui-même
        if ($user->id === $request->blocked_user_id) {
            return response()->json(['message' => 'Vous ne pouvez pas vous bloquer vous-même'], 400);
        }

        // Vérifier si déjà bloqué
        $existingBlock = Block::where('blocker_user_id', $user->id)
            ->where('blocked_user_id', $request->blocked_user_id)
            ->first();

        if ($existingBlock) {
            return response()->json(['message' => 'Utilisateur déjà bloqué'], 400);
        }

        // Créer le blocage
        $block = Block::create([
            'blocker_user_id' => $user->id,
            'blocked_user_id' => $request->blocked_user_id,
            'reason' => $request->reason,
            'blocked_at' => Carbon::now()
        ]);

        // Mettre à jour le statut du match s'il existe
        UserMatch::where(function($query) use ($user, $request) {
                $query->where('user_id', $user->id)->where('matched_user_id', $request->blocked_user_id);
            })
            ->orWhere(function($query) use ($user, $request) {
                $query->where('user_id', $request->blocked_user_id)->where('matched_user_id', $user->id);
            })
            ->update(['status' => 'blocked']);

        return response()->json(['message' => 'Utilisateur bloqué avec succès'], 200);
    }

    /**
     * Débloquer un utilisateur
     */
    public function unblock(Request $request, $blockedUserId)
    {
        $user = $request->user();

        $block = Block::where('blocker_user_id', $user->id)
            ->where('blocked_user_id', $blockedUserId)
            ->first();

        if (!$block) {
            return response()->json(['message' => 'Blocage non trouvé'], 404);
        }

        $block->delete();

        return response()->json(['message' => 'Utilisateur débloqué'], 200);
    }

    /**
     * Liste des utilisateurs bloqués
     */
    public function index(Request $request)
    {
        $blocks = $request->user()->blocks()
            ->with('blocked.profile')
            ->orderBy('blocked_at', 'desc')
            ->get();

        return response()->json(['blocked_users' => $blocks], 200);
    }
    
}
