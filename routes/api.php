<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BlockController;
use App\Http\Controllers\Api\DiscoveryController;
use App\Http\Controllers\Api\LikeController;
use App\Http\Controllers\Api\MatchController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\PhotoController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SwipeController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Routes d'authentification
Route::prefix('auth')->group(function () {
    // Routes publiques
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('/resend-otp', [AuthController::class, 'resendOtp']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);

    // Routes protégées
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});


 // ========== ROUTES PROTÉGÉES (Sanctum) ==========
Route::middleware('auth:sanctum')->group(function () {

        // ========== PROFIL ==========
        Route::prefix('profile')->group(function () {
            Route::get('/', [ProfileController::class, 'show']);
            Route::put('/', [ProfileController::class, 'update']);
        });

        // ========== PHOTOS ==========
        Route::prefix('photos')->group(function () {
            Route::get('/', [PhotoController::class, 'index']);
            Route::post('/', [PhotoController::class, 'store']);
            Route::post('/{photoId}/set-primary', [PhotoController::class, 'setPrimary']);
            Route::delete('/{photoId}', [PhotoController::class, 'destroy']);
        });

        // ========== DÉCOUVERTE ==========
        Route::get('/discover', [DiscoveryController::class, 'discover']);

        // ========== SWIPES ==========
        Route::prefix('swipes')->group(function () {
            Route::post('/', [SwipeController::class, 'swipe']);
            Route::get('/history', [SwipeController::class, 'history']);
        });

        // ========== LIKES (Demandes de connexion) ==========
        Route::prefix('likes')->group(function () {
            Route::get('/received', [LikeController::class, 'received']);
            Route::get('/sent', [LikeController::class, 'sent']);
            Route::post('/{likeId}/accept', [LikeController::class, 'accept']);
            Route::post('/{likeId}/reject', [LikeController::class, 'reject']);
        });

        // ========== MATCHES ==========
        Route::prefix('matches')->group(function () {
            Route::get('/', [MatchController::class, 'index']);
            Route::get('/{matchId}', [MatchController::class, 'show']);
            Route::delete('/{matchId}', [MatchController::class, 'unmatch']);
        });

        // ========== MESSAGES ==========
        Route::prefix('matches/{matchId}/messages')->group(function () {
            Route::get('/', [MessageController::class, 'index']);
            Route::post('/', [MessageController::class, 'store']);
        });

        // ========== BLOCAGES ==========
        Route::prefix('blocks')->group(function () {
            Route::get('/', [BlockController::class, 'index']);
            Route::post('/', [BlockController::class, 'block']);
            Route::delete('/{blockedUserId}', [BlockController::class, 'unblock']);
        });

        // ========== SIGNALEMENTS ==========
        Route::prefix('reports')->group(function () {
            Route::post('/', [ReportController::class, 'store']);
            Route::get('/', [ReportController::class, 'index']); // Admin/Moderator seulement
            Route::put('/{reportId}/status', [ReportController::class, 'updateStatus']); // Admin/Moderator
        });
    });