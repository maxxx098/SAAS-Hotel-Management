<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Client\BookingController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

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
    });

    // Client routes can be added here if needed in the future
    // Since clients are users, they use the main bookings route above
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';