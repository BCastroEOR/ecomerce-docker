<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'store']);
Route::post('/login', [AuthController::class, 'login']);

// Catálogo público: listado y detalle de productos no requieren autenticación.
Route::apiResource('products', ProductController::class)->only(['index', 'show']);

Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::apiResource('products', ProductController::class)
        ->except(['index', 'show'])
        ->middleware('admin');
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::get('/orders/{order}/payments', [PaymentController::class, 'index']);
    Route::post('/orders/{order}/payments', [PaymentController::class, 'store']);
});

Route::post('/payments/stripe/webhook', [PaymentController::class, 'webhook']);
