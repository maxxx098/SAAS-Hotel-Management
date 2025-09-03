<?php

namespace App\Http\Controllers\Staff;

use App\Models\RoomAssignment;
use App\Models\MaintenanceRequest;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Housekeeping Staff Controller
 * Handles room cleaning, maintenance reports
 */
class HousekeepingController extends BaseStaffController
{
    public function index(): \Inertia\Response
    {
        $user = auth()->user();
        $dashboardData = $this->getHousekeepingDashboardData($user);

        return Inertia::render('dashboard/staff/index', [
            'dashboardData' => $dashboardData,
            ...$this->getBaseStaffData($user)
        ]);
    }

    public function stats(): JsonResponse
    {
        $user = auth()->user();
        return response()->json([
            'success' => true,
            'stats' => $this->getRoleSpecificStats($user),
        ]);
    }

    protected function getRoleSpecificStats($user): array
    {
        $today = Carbon::today();

        $assignedRooms = RoomAssignment::where('staff_id', $user->id)
            ->whereDate('assigned_date', $today) // ✅ fixed
            ->count();

        $cleanedRooms = RoomAssignment::where('staff_id', $user->id)
            ->whereDate('assigned_date', $today) // ✅ fixed
            ->where('status', 'completed')
            ->count();

        return [
            'assignedRooms' => $assignedRooms,
            'cleanedRooms'  => $cleanedRooms,
            'pendingRooms'  => $assignedRooms - $cleanedRooms,
            'efficiency'    => $assignedRooms > 0 ? round(($cleanedRooms / $assignedRooms) * 100) : 0,
        ];
    }

    protected function getRoleSpecificTasks($user): array
    {
        $today = Carbon::today();

        return RoomAssignment::with('room')
            ->where('staff_id', $user->id)
            ->whereDate('assigned_date', $today) // ✅ fixed
            ->where('status', '!=', 'completed')
            ->get()
            ->map(function ($assignment) {
                return [
                    'id'          => $assignment->id,
                    'type'        => 'room_cleaning',
                    'title'       => 'Clean Room ' . $assignment->room->number,
                    'description' => ucfirst($assignment->cleaning_type) . ' cleaning',
                    'priority'    => $assignment->priority,
                    'status'      => $assignment->status,
                ];
            })->toArray();
    }

    private function getHousekeepingDashboardData($user): array
    {
        return [
            'todayStats'    => $this->getRoleSpecificStats($user),
            'assignedRooms' => $this->getAssignedRooms($user),
            'todayTasks'    => $this->getRoleSpecificTasks($user),
        ];
    }

    /**
     * Housekeeping specific methods
     */
    public function getAssignedRooms($user): array
    {
        $today = Carbon::today();
        
        return RoomAssignment::with('room')
            ->where('staff_id', $user->id)
            ->whereDate('assigned_date', $today) // ✅ fixed
            ->get()
            ->map(function ($assignment) {
                return [
                    'id'             => $assignment->id,
                    'room_number'    => $assignment->room->number,
                    'status'         => $assignment->status,
                    'cleaning_type'  => $assignment->cleaning_type,
                    'scheduled_time' => $assignment->scheduled_time,
                ];
            })->toArray();
    }

    public function updateRoomStatus(Request $request): JsonResponse
    {
        // TODO: Implement room status update logic
        return response()->json(['message' => 'Room status updated successfully']);
    }
}
