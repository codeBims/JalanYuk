<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\ItineraryController;
use App\Http\Controllers\API\TouristAttractionController;
use App\Http\Controllers\API\ReviewController;
use App\Http\Controllers\API\RecommendationController;
use App\Http\Controllers\API\PasswordResetController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [PasswordResetController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [PasswordResetController::class, 'resetPassword']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
      'user']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    
    // Itineraries
    Route::apiResource('itineraries', ItineraryController::class);
    
    // Tourist Attractions
    Route::get('/tourist-attractions', [TouristAttractionController::class, 'index']);
    Route::get('/tourist-attractions/{id}', [TouristAttractionController::class, 'show']);
    
    // Reviews
    Route::apiResource('reviews', ReviewController::class);
    Route::get('/tourist-attractions/{id}/reviews', [ReviewController::class, 'getByAttraction']);
    
    // Recommendations
    Route::get('/recommendations', [RecommendationController::class, 'getRecommendations']);
    Route::post('/recommendations/generate-itinerary', [RecommendationController::class, 'generateItinerary']);
});

// Public tourist attractions
Route::get('/tourist-attractions', [TouristAttractionController::class, 'index']);
Route::get('/tourist-attractions/{id}', [TouristAttractionController::class, 'show']);
