<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Client\BookingController;
use App\Http\Controllers\Client\ClientDashboardController;
use App\Http\Controllers\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Admin\RoomController as AdminRoomController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\StaffController;
use App\Http\Controllers\Staff\StaffDashboardController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\MainDashboardController; 
use App\Http\Controllers\Auth\StaffAuthenticatedSessionController;
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

Route::middleware('guest')->group(function () {
    Route::get('/staff/login', [StaffAuthenticatedSessionController::class, 'create'])
        ->name('staff.login');
        
    Route::post('/staff/login', [StaffAuthenticatedSessionController::class, 'store']);
});

Route::middleware(['auth', 'verified'])->group(function () {
    
    // Main dashboard route - redirects based on user role
    Route::get('/dashboard', [MainDashboardController::class, 'index'])->name('dashboard');
    
    // Admin-only routes
    Route::middleware(['admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
        
        // Admin Dashboard API routes
        Route::get('/dashboard/stats', [AdminDashboardController::class, 'stats'])->name('dashboard.stats');
        Route::get('/dashboard/recent-bookings', [AdminDashboardController::class, 'recentBookings'])->name('dashboard.recent-bookings');
        Route::get('/dashboard/monthly-revenue', [AdminDashboardController::class, 'monthlyRevenue'])->name('dashboard.monthly-revenue');
        Route::get('/dashboard/room-distribution', [AdminDashboardController::class, 'roomTypeDistribution'])->name('dashboard.room-distribution');

        // Admin staff routes
        Route::get('/staff', [StaffController::class, 'index'])->name('staff.index');
        Route::get('/staff/create', [StaffController::class, 'create'])->name('staff.create');
        Route::get('/staff/{staff}', [StaffController::class, 'show'])->name('staff.show');
        Route::get('/staff/{staff}/edit', [StaffController::class, 'edit'])->name('staff.edit');
        Route::get('staff/tasks', [StaffController::class, 'tasks'])->name('staff.tasks');
        Route::post('staff/tasks', [StaffController::class, 'storeTask'])->name('staff.tasks.store');
        Route::put('staff/tasks/{task}', [StaffController::class, 'updateTask'])->name('staff.tasks.update');
        Route::delete('staff/tasks/{task}', [StaffController::class, 'destroyTask'])->name('staff.tasks.destroy');
        Route::patch('staff/tasks/{task}/status', [StaffController::class, 'updateTaskStatus'])->name('staff.tasks.status');

        // NEW: Admin task management routes
        Route::get('/tasks', [StaffController::class, 'tasks'])->name('tasks.index');
        Route::post('/tasks', [StaffController::class, 'storeTask'])->name('tasks.store');
        Route::put('/tasks/{task}', [StaffController::class, 'updateTask'])->name('tasks.update');
        Route::delete('/tasks/{task}', [StaffController::class, 'destroyTask'])->name('tasks.destroy');
        Route::patch('/tasks/{task}/status', [StaffController::class, 'updateTaskStatus'])->name('tasks.update-status');

        // Admin bookings routes
        Route::get('/bookings', [AdminBookingController::class, 'index'])->name('bookings');
        Route::get('/bookings/{booking}', [AdminBookingController::class, 'show'])->name('bookings.show');
        Route::patch('/bookings/{booking}/status', [AdminBookingController::class, 'updateStatus'])->name('bookings.update-status');
        Route::get('/bookings/stats', [AdminBookingController::class, 'stats'])->name('bookings.stats');
        
        // Admin rooms resource routes
        Route::resource('rooms', AdminRoomController::class);
    });

    // Staff routes - for staff members only
    Route::middleware(['staff'])->prefix('staff')->name('staff.')->group(function () {
        Route::get('/dashboard', [StaffDashboardController::class, 'index'])->name('dashboard');
        Route::get('/dashboard/stats', [StaffDashboardController::class, 'stats'])->name('dashboard.stats');
        Route::get('/dashboard/today-tasks', [StaffDashboardController::class, 'todayTasks'])->name('dashboard.today-tasks');
        Route::get('/dashboard/assigned-rooms', [StaffDashboardController::class, 'assignedRooms'])->name('dashboard.assigned-rooms');
        Route::get('/dashboard/maintenance-requests', [StaffDashboardController::class, 'maintenanceRequests'])->name('dashboard.maintenance-requests');
        Route::post('/dashboard/update-task-status', [StaffDashboardController::class, 'updateTaskStatus'])->name('dashboard.update-task-status');
        Route::get('/dashboard/monthly-revenue', [StaffDashboardController::class, 'monthlyRevenue'])->name('dashboard.monthly-revenue');
        Route::get('/dashboard/recent-bookings', [StaffDashboardController::class, 'recentBookings'])->name('dashboard.recent-bookings');
        Route::get('/dashboard/room-distribution', [StaffDashboardController::class, 'roomTypeDistribution'])->name('dashboard.room-distribution');
        
        // NEW: Staff task routes (for staff to view and update their own tasks)
        Route::patch('/tasks/{task}/status', [StaffController::class, 'updateTaskStatus'])->name('tasks.update-status');
    });
    
    // Client dashboard routes - for regular users/clients
    Route::prefix('client')->name('client.')->group(function () {
        Route::get('/dashboard', [ClientDashboardController::class, 'index'])->name('dashboard');
        Route::get('/dashboard/stats', [ClientDashboardController::class, 'stats'])->name('dashboard.stats');
        Route::get('/dashboard/recent-bookings', [ClientDashboardController::class, 'recentBookings'])->name('dashboard.recent-bookings');
        Route::get('/dashboard/monthly-revenue', [ClientDashboardController::class, 'monthlyRevenue'])->name('dashboard.monthly-revenue');
        Route::get('/dashboard/room-distribution', [ClientDashboardController::class, 'roomTypeDistribution'])->name('dashboard.room-distribution');
    });
    
    // User/Client bookings routes (available to all authenticated users)
    Route::get('/bookings', [BookingController::class, 'index'])->name('bookings');
    Route::post('/bookings', [BookingController::class, 'store'])->name('bookings.store'); 
    Route::get('/bookings/{booking}', [BookingController::class, 'show'])->name('bookings.show');
    Route::patch('/bookings/{booking}/status', [BookingController::class, 'updateStatus'])->name('bookings.update-status');
    Route::get('/bookings/stats/dashboard', [BookingController::class, 'stats'])->name('bookings.stats');
    Route::get('/bookings/{booking}/confirmation', [BookingController::class, 'confirmation'])->name('bookings.confirmation');
    Route::post('/bookings/check-availability', [BookingController::class, 'checkAvailability'])->name('bookings.check-availability');
    Route::delete('/bookings/{booking}', [BookingController::class, 'destroy'])->name('bookings.destroy');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';