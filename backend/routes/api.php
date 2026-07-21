<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\TicketResponseController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public authentication routes (rate limited)
|--------------------------------------------------------------------------
*/
Route::middleware('throttle:auth')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
});

/*
|--------------------------------------------------------------------------
| Authenticated routes (Sanctum bearer token)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/tickets', [TicketController::class, 'index']);
    Route::post('/tickets', [TicketController::class, 'store']);
    Route::get('/tickets/{ticket}', [TicketController::class, 'show']);
    Route::patch('/tickets/{ticket}/status', [TicketController::class, 'updateStatus']);
    Route::post('/tickets/{ticket}/responses', [TicketResponseController::class, 'store']);
});
