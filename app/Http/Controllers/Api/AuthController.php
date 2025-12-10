<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Profile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use App\Mail\OtpMail;
use Carbon\Carbon;

class AuthController extends Controller
{
    /**
     * Inscription
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8|confirmed',
            'username' => 'required|unique:users|min:3',
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'date_of_birth' => 'required|date|before:-18 years',
            'gender' => 'required|in:male,female,other',
            'phone_number' => 'nullable|string',
            'nationality' => 'nullable|string',
            'current_country' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Générer OTP
        $otp = rand(1000, 9999);
        $otpExpiry = Carbon::now()->addMinutes(10);

        $user = User::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'username' => $request->username,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'date_of_birth' => $request->date_of_birth,
            'gender' => $request->gender,
            'phone_number' => $request->phone_number,
            'nationality' => $request->nationality,
            'current_country' => $request->current_country,
            'otp' => $otp,
            'otp_expired_at' => $otpExpiry,
            'role_id' => 2, // user par défaut
        ]);

        // Créer le profil vide
        Profile::create(['user_id' => $user->id]);

        // Envoyer l'OTP par email
        Mail::to($user->email)->send(new OtpMail($otp, $user->first_name));

        return response()->json([
            'message' => 'Inscription réussie. Vérifiez votre email pour le code OTP.',
            'email' => $user->email,
        ], 201);
    }

    /**
     * Vérification OTP
     */
    public function verifyOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|digits:4',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if ($user->otp !== $request->otp) {
            return response()->json(['message' => 'Code OTP invalide'], 400);
        }

        if (Carbon::now()->gt($user->otp_expired_at)) {
            return response()->json(['message' => 'Code OTP expiré'], 400);
        }

        $user->update([
            'is_verified' => true,
            'otp' => null,
            'otp_expired_at' => null,
        ]);

        return response()->json(['message' => 'Email vérifié avec succès'], 200);
    }

    /**
     * Connexion
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Identifiants invalides'], 401);
        }

        if (!$user->is_verified) {
            return response()->json(['message' => 'Email non vérifié'], 403);
        }

        if (!$user->is_active) {
            return response()->json(['message' => 'Compte désactivé'], 403);
        }

        $user->update(['last_login' => Carbon::now()]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie',
            'token' => $token,
            'user' => $user->load('profile', 'photos')
        ], 200);
    }

    /**
     * Déconnexion
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnexion réussie'], 200);
    }

    /**
     * Renvoyer OTP
     */
    public function resendOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if ($user->is_verified) {
            return response()->json(['message' => 'Email déjà vérifié'], 400);
        }

        $otp = rand(1000, 9999);
        $otpExpiry = Carbon::now()->addMinutes(10);

        $user->update([
            'otp' => $otp,
            'otp_expired_at' => $otpExpiry,
        ]);

        // Envoyer le nouveau code OTP
        Mail::to($user->email)->send(new OtpMail($otp, $user->first_name));

        return response()->json([
            'message' => 'Nouveau code OTP envoyé',
        ], 200);
    }

    /**
     * Mot de passe oublié - Envoi de l'OTP
     */
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        // Générer OTP
        $otp = rand(1000, 9999);
        $otpExpiry = Carbon::now()->addMinutes(10);

        $user->update([
            'otp' => $otp,
            'otp_expired_at' => $otpExpiry,
        ]);

        // Envoyer l'OTP pour réinitialisation de mot de passe
        Mail::to($user->email)->send(new OtpMail($otp, $user->first_name));

        return response()->json([
            'message' => 'Code OTP envoyé à votre email',
        ], 200);
    }

    /**
     * Réinitialisation du mot de passe
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|digits:4',
            'password' => 'required|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if ($user->otp !== $request->otp) {
            return response()->json(['message' => 'Code OTP invalide'], 400);
        }

        if (Carbon::now()->gt($user->otp_expired_at)) {
            return response()->json(['message' => 'Code OTP expiré'], 400);
        }

        $user->update([
            'password' => Hash::make($request->password),
            'otp' => null,
            'otp_expired_at' => null,
        ]);

        return response()->json(['message' => 'Mot de passe réinitialisé avec succès'], 200);
    }
}
