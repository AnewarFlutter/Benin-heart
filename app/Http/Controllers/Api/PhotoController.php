<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Photo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class PhotoController extends Controller
{
    
    /**
     * Lister toutes les photos de l'utilisateur
     */
    public function index(Request $request)
    {
        $photos = $request->user()->photos()->orderBy('order_position')->get();

        return response()->json(['photos' => $photos], 200);
    }

    /**
     * Uploader une photo
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'photo' => 'required|image|mimes:jpeg,png,jpg|max:5120', // 5MB max
            'is_primary' => 'boolean',
            'order_position' => 'integer|min:1|max:6'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        // Vérifier le nombre de photos (max 6)
        if ($user->photos()->count() >= 6) {
            return response()->json(['message' => 'Vous avez atteint le maximum de 6 photos'], 400);
        }

        // Uploader la photo
        $path = $request->file('photo')->store('photos', 'public');
        $photoUrl = Storage::url($path);

        // Si c'est la première photo, la définir comme principale
        $isPrimary = $request->is_primary ?? ($user->photos()->count() === 0);

        // Si cette photo doit être principale, retirer le statut des autres
        if ($isPrimary) {
            $user->photos()->update(['is_primary' => false]);
        }

        $photo = Photo::create([
            'user_id' => $user->id,
            'photo_url' => $photoUrl,
            'is_primary' => $isPrimary,
            'order_position' => $request->order_position ?? ($user->photos()->count() + 1)
        ]);

        // Mettre à jour l'URL de la photo de profil
        if ($isPrimary) {
            $user->profile->update(['profile_picture_url' => $photoUrl]);
        }

        return response()->json([
            'message' => 'Photo uploadée avec succès',
            'photo' => $photo
        ], 201);
    }

    /**
     * Définir une photo comme principale
     */
    public function setPrimary(Request $request, $photoId)
    {
        $user = $request->user();
        $photo = Photo::where('id', $photoId)->where('user_id', $user->id)->first();

        if (!$photo) {
            return response()->json(['message' => 'Photo non trouvée'], 404);
        }

        // Retirer le statut principal de toutes les photos
        $user->photos()->update(['is_primary' => false]);

        // Définir cette photo comme principale
        $photo->update(['is_primary' => true]);
        $user->profile->update(['profile_picture_url' => $photo->photo_url]);

        return response()->json(['message' => 'Photo principale mise à jour'], 200);
    }

    /**
     * Supprimer une photo
     */
    public function destroy(Request $request, $photoId)
    {
        $user = $request->user();
        $photo = Photo::where('id', $photoId)->where('user_id', $user->id)->first();

        if (!$photo) {
            return response()->json(['message' => 'Photo non trouvée'], 404);
        }

        // Supprimer le fichier
        $path = str_replace('/storage/', '', $photo->photo_url);
        Storage::disk('public')->delete($path);

        $wasPrimary = $photo->is_primary;
        $photo->delete();

        // Si c'était la photo principale, définir une autre photo comme principale
        if ($wasPrimary && $user->photos()->count() > 0) {
            $newPrimary = $user->photos()->first();
            $newPrimary->update(['is_primary' => true]);
            $user->profile->update(['profile_picture_url' => $newPrimary->photo_url]);
        } elseif ($user->photos()->count() === 0) {
            $user->profile->update(['profile_picture_url' => null]);
        }

        return response()->json(['message' => 'Photo supprimée avec succès'], 200);
    }
}
