<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Admin\RoomController as AdminRoomController; // Fixed: Use AdminRoomController alias
use App\Http\Controllers\RoomController; // Main RoomController (no alias needed)
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('home');

// Public room routes (use main RoomController)
Route::get('/rooms', [RoomController::class, 'index'])->name('rooms.index');
Route::get('/rooms/{room}', [RoomController::class, 'show'])->name('rooms.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    
    // User/Client bookings route (for all regular users including clients)
    Route::get('bookings', [BookingController::class, 'index'])->name('bookings');
    
    // Admin routes
    Route::middleware(['admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('dashboard', function () {
            return Inertia::render('admin/dashboard');
        })->name('dashboard');
        
        // Static bookings page
        Route::get('bookings', [AdminBookingController::class, 'index'])->name('bookings');
        
        // Admin rooms resource routes (use AdminRoomController)
        Route::resource('rooms', AdminRoomController::class);
    });
    
    // Client routes can be added here if needed in the future
    // Since clients are users, they use the main bookings route above
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';