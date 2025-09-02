<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Client\BookingController;
use App\Http\Controllers\Client\ClientDashboardController;
use App\Http\Controllers\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Admin\RoomController as AdminRoomController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\StaffController;

// Updated Staff Controllers
use App\Http\Controllers\Staff\StaffDashboardController;
use App\Http\Controllers\Staff\FrontDeskController;
use App\Http\Controllers\Staff\HousekeepingController;
use App\Http\Controllers\Staff\MaintenanceController;
use App\Http\Controllers\Staff\SecurityController;
use App\Http\Controllers\Staff\GeneralStaffController;

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
        Route::post('/staff', [StaffController::class, 'store'])->name('staff.store');
        Route::get('/staff/create', [StaffController::class, 'create'])->name('staff.create');
        Route::get('/staff/{staff}', [StaffController::class, 'show'])->name('staff.show');
        Route::get('/staff/{staff}/edit', [StaffController::class, 'edit'])->name('staff.edit');
        Route::get('staff/tasks', [StaffController::class, 'tasks'])->name('staff.tasks');
        Route::post('staff/tasks', [StaffController::class, 'storeTask'])->name('staff.tasks.store');
        Route::put('staff/tasks/{task}', [StaffController::class, 'updateTask'])->name('staff.tasks.update');
        Route::delete('staff/tasks/{task}', [StaffController::class, 'destroyTask'])->name('staff.tasks.destroy');
        Route::patch('staff/tasks/{task}/status', [StaffController::class, 'updateTaskStatus'])->name('staff.tasks.status');

        // Admin task management routes
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

    // Staff routes - organized by role
    Route::middleware(['staff'])->prefix('staff')->name('staff.')->group(function () {
        
        // Main staff dashboard (routes to role-specific controller)
        Route::get('/dashboard', [StaffDashboardController::class, 'index'])->name('dashboard');
        
        // Front Desk Staff Routes
        Route::prefix('front-desk')->name('front-desk.')->group(function () {
            Route::get('/dashboard', [FrontDeskController::class, 'index'])->name('dashboard');
            Route::get('/stats', [FrontDeskController::class, 'stats'])->name('stats');
            Route::post('/check-in', [FrontDeskController::class, 'checkIn'])->name('check-in');
            Route::post('/check-out', [FrontDeskController::class, 'checkOut'])->name('check-out');
            Route::get('/bookings/today', [FrontDeskController::class, 'todaysBookings'])->name('bookings.today');
        });
        
        // Housekeeping Staff Routes
        Route::prefix('housekeeping')->name('housekeeping.')->group(function () {
            Route::get('/dashboard', [HousekeepingController::class, 'index'])->name('dashboard');
            Route::get('/stats', [HousekeepingController::class, 'stats'])->name('stats');
            Route::get('/assigned-rooms', [HousekeepingController::class, 'getAssignedRooms'])->name('assigned-rooms');
            Route::post('/room-status', [HousekeepingController::class, 'updateRoomStatus'])->name('room-status');
            Route::post('/maintenance-report', [HousekeepingController::class, 'reportMaintenance'])->name('maintenance-report');
        });
        
        // Maintenance Staff Routes
        Route::prefix('maintenance')->name('maintenance.')->group(function () {
            Route::get('/dashboard', [MaintenanceController::class, 'index'])->name('dashboard');
            Route::get('/stats', [MaintenanceController::class, 'stats'])->name('stats');
            Route::get('/requests', [MaintenanceController::class, 'getMaintenanceRequests'])->name('requests');
            Route::post('/request-status', [MaintenanceController::class, 'updateRequestStatus'])->name('request-status');
            Route::post('/complete-request', [MaintenanceController::class, 'completeRequest'])->name('complete-request');
        });
        
        // Security Staff Routes
        Route::prefix('security')->name('security.')->group(function () {
            Route::get('/dashboard', [SecurityController::class, 'index'])->name('dashboard');
            Route::get('/stats', [SecurityController::class, 'stats'])->name('stats');
            Route::post('/incident-report', [SecurityController::class, 'reportIncident'])->name('incident-report');
            Route::post('/patrol-complete', [SecurityController::class, 'completePatrol'])->name('patrol-complete');
            Route::get('/patrols/today', [SecurityController::class, 'todaysPatrols'])->name('patrols.today');
        });
        
        // General Staff Routes
        Route::prefix('general')->name('general.')->group(function () {
            Route::get('/dashboard', [GeneralStaffController::class, 'index'])->name('dashboard');
            Route::get('/stats', [GeneralStaffController::class, 'stats'])->name('stats');
            Route::get('/tasks', [GeneralStaffController::class, 'getTasks'])->name('tasks');
        });
        
        // Common staff routes (available to all staff roles)

            // Task management (all staff can update their tasks)
            Route::patch('/tasks/{task}/status', function($task) {
                $user = auth()->user();
                return match($user->role) {
                    'front_desk' => app(FrontDeskController::class)->updateTaskStatus($task),
                    'housekeeping' => app(HousekeepingController::class)->updateTaskStatus($task),
                    'maintenance' => app(MaintenanceController::class)->updateTaskStatus($task),
                    'security' => app(SecurityController::class)->updateTaskStatus($task),
                    default => app(GeneralStaffController::class)->updateTaskStatus($task),
                };
            })->name('tasks.update-status');
            
            // Profile and schedule routes (common to all staff)
            Route::get('/schedule', function() {
                $user = auth()->user();
                return match($user->role) {
                    'front_desk' => app(FrontDeskController::class)->getSchedule(),
                    'housekeeping' => app(HousekeepingController::class)->getSchedule(),
                    'maintenance' => app(MaintenanceController::class)->getSchedule(),
                    'security' => app(SecurityController::class)->getSchedule(),
                    default => app(GeneralStaffController::class)->getSchedule(),
                };
            })->name('schedule');
        });
        
        // Backward compatibility routes (redirect to new structure)
        Route::get('/dashboard/stats', function() {
            $user = auth()->user();
            return redirect()->route('staff.' . str_replace('_', '-', $user->role) . '.stats');
        });
        
        Route::get('/dashboard/today-tasks', function() {
            $user = auth()->user();
            $roleRoute = match($user->role) {
                'front_desk' => 'front-desk.bookings.today',
                'housekeeping' => 'housekeeping.assigned-rooms',
                'maintenance' => 'maintenance.requests',
                'security' => 'security.patrols.today',
                default => 'general.tasks',
            };
            return redirect()->route('staff.' . $roleRoute);
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