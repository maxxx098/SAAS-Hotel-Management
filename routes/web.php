<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Client\BookingController;
use App\Http\Controllers\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Admin\RoomController as AdminRoomController;
use App\Http\Controllers\RoomController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('public/welcome', [
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
    Route::get('dashboard/index', function () {
        return Inertia::render('dashboard/index');
    })->name('dashboard');
    
    // User/Client bookings routes
    Route::get('/bookings', [BookingController::class, 'index'])->name('bookings.index');
    Route::post('/bookings', [BookingController::class, 'store'])->name('bookings.store'); // ADDED: Missing POST route
    Route::get('/bookings/{booking}', [BookingController::class, 'show'])->name('bookings.show');
    Route::patch('/bookings/{booking}/status', [BookingController::class, 'updateStatus'])->name('bookings.update-status');
    Route::get('/bookings/stats/dashboard', [BookingController::class, 'stats'])->name('bookings.stats');
    
    // Additional booking utility routes
    Route::post('/bookings/check-availability', [BookingController::class, 'checkAvailability'])->name('bookings.check-availability');
    
    // Admin routes
    Route::middleware(['admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('dashboard', function () {
            return Inertia::render('dashboard/admin/index');
        })->name('dashboard');
        
        // Admin bookings routes
        Route::get('bookings', [AdminBookingController::class, 'index'])->name('bookings');
        Route::get('bookings/{booking}', [AdminBookingController::class, 'show'])->name('bookings.show');
        Route::patch('bookings/{booking}/status', [AdminBookingController::class, 'updateStatus'])->name('bookings.update-status');
        Route::get('bookings/stats', [AdminBookingController::class, 'stats'])->name('bookings.stats');
        
        // Admin rooms resource routes (use AdminRoomController)
        Route::resource('rooms', AdminRoomController::class);
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';