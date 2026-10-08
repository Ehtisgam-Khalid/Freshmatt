<?php

use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ShopController;
use Illuminate\Support\Facades\Route;

Route::get('/categories', [ShopController::class, 'categories']);
Route::get('/products', [ShopController::class, 'products']);
Route::get('/settings', [ShopController::class, 'settings']);
Route::post('/orders', [OrderController::class, 'store'])->middleware('throttle:20,1');
Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);
