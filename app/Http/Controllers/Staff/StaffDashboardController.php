<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Room;
use App\Models\User;
use App\Models\MaintenanceRequest;
use App\Models\StaffSchedule;
use App\Models\RoomAssignment;
use App\Models\StaffTask;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class StaffDashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        return match($user->role) {
            'front_desk' => app(FrontDeskController::class)->index(),
            'housekeeping' => app(HousekeepingController::class)->index(),
            'maintenance' => app(MaintenanceController::class)->index(),
            'security' => app(SecurityController::class)->index(),
            default => app(GeneralStaffController::class)->index(),
        };
    }
}