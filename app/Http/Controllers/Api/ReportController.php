<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * Signaler un utilisateur
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'reported_user_id' => 'required|exists:users,id',
            'reason' => 'required|string',
            'description' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        // Vérifier que l'utilisateur ne se signale pas lui-même
        if ($user->id === $request->reported_user_id) {
            return response()->json(['message' => 'Vous ne pouvez pas vous signaler vous-même'], 400);
        }

        $report = Report::create([
            'reporter_user_id' => $user->id,
            'reported_user_id' => $request->reported_user_id,
            'reason' => $request->reason,
            'description' => $request->description,
            'reported_at' => Carbon::now()
        ]);

        // TODO: Notifier les modérateurs

        return response()->json([
            'message' => 'Signalement envoyé. Nos modérateurs vont l\'examiner.',
            'report' => $report
        ], 201);
    }

    /**
     * Liste des signalements (pour les modérateurs/admins)
     */
    public function index(Request $request)
    {
        // Vérifier que l'utilisateur est admin ou modérateur
        if (!in_array($request->user()->role->name, ['admin', 'moderator'])) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $reports = Report::with(['reporter', 'reported'])
            ->orderBy('reported_at', 'desc')
            ->paginate(20);

        return response()->json(['reports' => $reports], 200);
    }

    /**
     * Mettre à jour le statut d'un signalement
     */
    public function updateStatus(Request $request, $reportId)
    {
        // Vérifier que l'utilisateur est admin ou modérateur
        if (!in_array($request->user()->role->name, ['admin', 'moderator'])) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,reviewed,resolved'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $report = Report::find($reportId);

        if (!$report) {
            return response()->json(['message' => 'Signalement non trouvé'], 404);
        }

        $report->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Statut du signalement mis à jour',
            'report' => $report
        ], 200);
    }
}
