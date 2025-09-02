<?php

namespace App\Http\Controllers\Staff;

use App\Models\MaintenanceRequest;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Maintenance Staff Controller
 * Handles maintenance requests, repairs
 */
class MaintenanceController extends BaseStaffController
{
    public function index(): \Inertia\Response
    {
        $user = auth()->user();
        $dashboardData = $this->getMaintenanceDashboardData($user);

        return Inertia::render('dashboard/staff/maintenance/index', [
            'dashboardData' => $dashboardData,
            ...$this->getBaseStaffData($user)
        ]);
    }

    public function stats(): JsonResponse
    {
        $user = auth()->user();
        return response()->json([
            'success' => true,
            'stats'   => $this->getRoleSpecificStats($user),
        ]);
    }

    protected function getRoleSpecificStats($user): array
    {
        $today = Carbon::today();

        $assignedRequests = MaintenanceRequest::where('assigned_to', $user->id)->count();
        
        $completedToday = MaintenanceRequest::where('assigned_to', $user->id)
            ->where('status', 'completed')
            ->whereDate('updated_at', $today)
            ->count();

        $urgentRequests = MaintenanceRequest::where('assigned_to', $user->id)
            ->where('priority', 'high')
            ->where('status', '!=', 'completed')
            ->count();

        return [
            'assignedRequests' => $assignedRequests,
            'completedToday'   => $completedToday,
            'urgentRequests'   => $urgentRequests,
            'tasksCompleted'   => $this->getCompletedTasksCount($user->id, $today),
        ];
    }

    protected function getRoleSpecificTasks($user): array
    {
        return MaintenanceRequest::with(['room', 'reportedBy'])
            ->where('assigned_to', $user->id)
            ->whereIn('status', ['pending', 'in_progress'])
            ->orderBy('priority', 'desc')
            ->get()
            ->map(function ($request) {
                return [
                    'id'          => $request->id,
                    'type'        => 'maintenance_request',
                    'title'       => $request->title,
                    'description' => $request->description,
                    'priority'    => $request->priority,
                    'status'      => $request->status,
                    'room_number' => $request->room->number ?? 'N/A',
                ];
            })->toArray();
    }

    private function getMaintenanceDashboardData($user): array
    {
        return [
            'todayStats'          => $this->getRoleSpecificStats($user),
            'maintenanceRequests' => $this->getRoleSpecificTasks($user),
        ];
    }

    /**
     * Maintenance specific methods
     */
    public function updateRequestStatus(Request $request): JsonResponse
    {
        // TODO: Handle maintenance request status updates
        return response()->json(['message' => 'Request status updated successfully']);
    }
}
