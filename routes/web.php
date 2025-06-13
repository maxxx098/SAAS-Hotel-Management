<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Client\BookingController;
use App\Http\Controllers\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Admin\RoomController as AdminRoomController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Staff\DashboardController as StaffDashboardController;
use App\Http\Controllers\Auth\GoogleAuthController;
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

// Public room routes 
Route::get('/rooms', [RoomController::class, 'index'])->name('rooms.index');
Route::get('/rooms/{room}', [RoomController::class, 'show'])->name('rooms.show');

Route::post('/auth/google', [GoogleAuthController::class, 'handleGoogleLogin'])->name('google.login');

Route::middleware(['auth', 'verified'])->group(function () {
    
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Dashboard API routes - accessible to both roles
    Route::get('/dashboard/stats', [DashboardController::class, 'stats'])->name('dashboard.stats');
    Route::get('/dashboard/recent-bookings', [DashboardController::class, 'recentBookings'])->name('dashboard.recent-bookings');
    Route::get('/dashboard/monthly-revenue', [DashboardController::class, 'monthlyRevenue'])->name('dashboard.monthly-revenue');
    Route::get('/dashboard/room-distribution', [DashboardController::class, 'roomTypeDistribution'])->name('dashboard.room-distribution');
    
    // User/Client bookings routes
    Route::get('/bookings', [BookingController::class, 'index'])->name('bookings');
    Route::post('/bookings', [BookingController::class, 'store'])->name('bookings.store'); 
    Route::get('/bookings/{booking}', [BookingController::class, 'show'])->name('bookings.show');
    Route::patch('/bookings/{booking}/status', [BookingController::class, 'updateStatus'])->name('bookings.update-status');
    Route::get('/bookings/stats/dashboard', [BookingController::class, 'stats'])->name('bookings.stats');
    Route::get('/bookings/{booking}/confirmation', [BookingController::class, 'confirmation'])->name('bookings.confirmation');
    Route::post('/bookings/check-availability', [BookingController::class, 'checkAvailability'])->name('bookings.check-availability');
    Route::delete('/bookings/{booking}', [BookingController::class, 'destroy'])->name('bookings.destroy');

    // Staff routes - for staff members only
    Route::middleware(['staff'])->prefix('staff')->name('staff.')->group(function () {
        Route::get('/dashboard', [StaffDashboardController::class, 'index'])->name('dashboard');
        Route::get('/dashboard/stats', [StaffDashboardController::class, 'stats'])->name('dashboard.stats');
        Route::get('/dashboard/today-tasks', [StaffDashboardController::class, 'todayTasks'])->name('dashboard.today-tasks');
        Route::get('/dashboard/assigned-rooms', [StaffDashboardController::class, 'assignedRooms'])->name('dashboard.assigned-rooms');
        Route::get('/dashboard/maintenance-requests', [StaffDashboardController::class, 'maintenanceRequests'])->name('dashboard.maintenance-requests');
        Route::post('/dashboard/update-task-status', [StaffDashboardController::class, 'updateTaskStatus'])->name('dashboard.update-task-status');
    });
    
    // Admin-only routes
    Route::middleware(['admin'])->prefix('admin')->name('admin.')->group(function () {

        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
        // Dashboard API routes - accessible to both roles
        Route::get('/dashboard/stats', [DashboardController::class, 'stats'])->name('dashboard.stats');
        Route::get('/dashboard/recent-bookings', [DashboardController::class, 'recentBookings'])->name('dashboard.recent-bookings');
        Route::get('/dashboard/monthly-revenue', [DashboardController::class, 'monthlyRevenue'])->name('dashboard.monthly-revenue');
        Route::get('/dashboard/room-distribution', [DashboardController::class, 'roomTypeDistribution'])->name('dashboard.room-distribution');
        // Admin bookings routes
        Route::get('/bookings', [AdminBookingController::class, 'index'])->name('bookings');
        Route::get('/bookings/{booking}', [AdminBookingController::class, 'show'])->name('bookings.show');
        Route::patch('/bookings/{booking}/status', [AdminBookingController::class, 'updateStatus'])->name('bookings.update-status');
        Route::get('/bookings/stats', [AdminBookingController::class, 'stats'])->name('bookings.stats');
        
        // Admin rooms resource routes
        Route::resource('rooms', AdminRoomController::class);
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';