<?php

use App\Http\Controllers\AdminPortalController;
use App\Http\Controllers\AdmissionController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EnquiryController;
use App\Http\Controllers\StudentPortalController;
use Illuminate\Support\Facades\Route;

$registerRoutes = function () {
    Route::get('/health', fn () => response()->json(['status' => 'ok', 'message' => 'Laravel API is working']));
    Route::post('/auth/signup', [AuthController::class, 'signup'])->middleware('throttle:10,1');
    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
    Route::post('/enquiries', [EnquiryController::class, 'store'])->middleware('throttle:10,1');

    Route::middleware('auth.token')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::post('/admissions', [AdmissionController::class, 'store'])->middleware('throttle:20,1');
        Route::get('/student/dashboard', [StudentPortalController::class, 'dashboard']);

        Route::prefix('admin')->middleware('admin')->group(function () {
            Route::get('/applications', [AdminPortalController::class, 'index']);
            Route::get('/applications/{admission}', [AdminPortalController::class, 'show']);
            Route::patch('/applications/{admission}/status', [AdminPortalController::class, 'status']);
            Route::post('/applications/{admission}/messages', [AdminPortalController::class, 'message']);
            Route::get('/applications/{admission}/pdf', [AdminPortalController::class, 'pdf']);
            Route::get('/applications/{admission}/documents/{type}', [AdminPortalController::class, 'document']);
        });
    });
};

$registerRoutes();

// Fallback alias to protect against accidental duplicate /api/api prefix
Route::prefix('api')->group($registerRoutes);
