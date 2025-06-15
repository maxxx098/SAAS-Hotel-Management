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
    /**
     * Display the staff dashboard.
     */
    public function index(): Response
    {
        try {
            $user = auth()->user();
            $dashboardData = $this->getStaffDashboardData($user);

            return Inertia::render('dashboard/staff/index', [
                'dashboardData' => $dashboardData,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone ?? null,
                    'role' => $user->role,
                    'department' => $user->department ?? $this->getDepartmentFromRole($user->role),
                    'employee_id' => $user->employee_id ?? $this->generateEmployeeId($user->id),
                    'hire_date' => $user->hire_date ? $user->hire_date->format('Y-m-d') : $user->created_at->format('Y-m-d'),
                ],
                'userRole' => $user->role ?? 'staff',
                'isStaff' => true,
            ]);
        } catch (\Exception $e) {
            Log::error('Staff dashboard data fetch error', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);

            return Inertia::render('dashboard/staff/index', [
                'dashboardData' => $this->getEmptyStaffDashboardData(),
                'user' => auth()->user(),
                'userRole' => auth()->user()->role ?? 'staff',
                'isStaff' => true,
                'error' => 'Failed to load dashboard data',
            ]);
        }
    }

    /**
     * Get staff dashboard statistics.
     */
    public function stats(): JsonResponse
    {
        try {
            $user = auth()->user();
            $stats = $this->getStaffStats($user);
            
            return response()->json([
                'success' => true,
                'stats' => $stats,
                'userRole' => $user->role ?? 'staff',
                'isStaff' => true,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch staff dashboard statistics', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard statistics',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Get today's tasks for staff.
     */
    public function todayTasks(): JsonResponse
    {
        try {
            $user = auth()->user();
            $tasks = $this->getTodayTasksData($user);
            
            return response()->json([
                'success' => true,
                'tasks' => $tasks,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch today tasks', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch tasks',
            ], 500);
        }
    }

    /**
     * Get assigned rooms for housekeeping staff.
     */
    public function assignedRooms(): JsonResponse
    {
        try {
            $user = auth()->user();
            $rooms = $this->getAssignedRoomsData($user);
            
            return response()->json([
                'success' => true,
                'rooms' => $rooms,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch assigned rooms', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch assigned rooms',
            ], 500);
        }
    }

    /**
     * Get maintenance requests assigned to staff.
     */
    public function maintenanceRequests(): JsonResponse
    {
        try {
            $user = auth()->user();
            $requests = $this->getMaintenanceRequestsData($user);
            
            return response()->json([
                'success' => true,
                'requests' => $requests,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch maintenance requests', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch maintenance requests',
            ], 500);
        }
    }

    /**
     * Update task status.
     */
    public function updateTaskStatus(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'task_id' => 'required|integer',
                'status' => 'required|string|in:pending,in_progress,completed',
                'task_type' => 'required|string|in:room_cleaning,maintenance,check_in,check_out,guest_service,general',
            ]);

            $user = auth()->user();
            $taskType = $request->task_type;
            $taskId = $request->task_id;
            $status = $request->status;

            switch ($taskType) {
                case 'room_cleaning':
                    $this->updateRoomCleaningStatus($taskId, $status, $user->id);
                    break;
                    
                case 'maintenance':
                    MaintenanceRequest::where('id', $taskId)
                        ->where('assigned_to', $user->id)
                        ->update([
                            'status' => $status,
                            'updated_at' => now(),
                        ]);
                    break;
                    
                case 'check_in':
                case 'check_out':
                    $this->updateBookingStatus($taskId, $status, $taskType);
                    break;
                    
                case 'general':
                case 'guest_service':
                    StaffTask::where('id', $taskId)
                        ->where('assigned_to', $user->id)
                        ->update([
                            'status' => $status,
                            'completed_at' => $status === 'completed' ? now() : null,
                            'updated_at' => now(),
                        ]);
                    break;
            }

            // Log the activity
            $user->logActivity(
                'task_' . $status,
                ucfirst($status) . ' task',
                "Task #{$taskId} status updated to {$status}",
                ['task_id' => $taskId, 'task_type' => $taskType, 'status' => $status]
            );

            return response()->json([
                'success' => true,
                'message' => 'Task status updated successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update task status', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
                'request_data' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update task status',
            ], 500);
        }
    }

    /**
     * Get staff dashboard data.
     */
    private function getStaffDashboardData($user): array
    {
        $todayStats = $this->getTodayStaffStats($user);
        $todayTasks = $this->getTodayTasksData($user);
        $assignedRooms = $this->getAssignedRoomsData($user);
        $maintenanceRequests = $this->getMaintenanceRequestsData($user);
        $recentActivities = $this->getRecentActivitiesData($user);
        $schedule = $this->getStaffScheduleData($user);

        return [
            'todayStats' => $todayStats,
            'todayTasks' => $todayTasks,
            'assignedRooms' => $assignedRooms,
            'maintenanceRequests' => $maintenanceRequests,
            'recentActivities' => $recentActivities,
            'schedule' => $schedule,
            'lastUpdated' => now()->toISOString(),
        ];
    }

    /**
     * Get today's staff statistics.
     */
    private function getTodayStaffStats($user): array
    {
        try {
            $today = Carbon::today();
            $role = $user->role ?? 'staff';

            switch ($role) {
                case 'front_desk':
                    return $this->getFrontDeskStats($user, $today);
                    
                case 'housekeeping':
                    return $this->getHousekeepingStats($user, $today);
                    
                case 'maintenance':
                    return $this->getMaintenanceStats($user, $today);
                    
                case 'security':
                    return $this->getSecurityStats($user, $today);
                    
                default:
                    return $this->getGeneralStaffStats($user, $today);
            }
        } catch (\Exception $e) {
            Log::error('Error getting staff stats', ['error' => $e->getMessage(), 'user_id' => $user->id]);
            return $this->getEmptyStaffStats();
        }
    }

    /**
     * Get front desk statistics - REAL DATA
     */
    private function getFrontDeskStats($user, $today): array
    {
        $stats = DB::selectOne("
            SELECT 
                COUNT(CASE WHEN DATE(check_in) = ? AND status = 'confirmed' THEN 1 END) as check_ins_today,
                COUNT(CASE WHEN DATE(check_out) = ? AND status = 'checked_in' THEN 1 END) as check_outs_today,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
                COUNT(CASE WHEN DATE(created_at) = ? THEN 1 END) as new_bookings_today
            FROM bookings
            WHERE deleted_at IS NULL
        ", [$today->format('Y-m-d'), $today->format('Y-m-d'), $today->format('Y-m-d')]);

        $tasksCompleted = $this->getCompletedTasksCount($user->id, $today);
        
        // Get guest complaints from maintenance requests or a separate complaints table
        $guestComplaints = MaintenanceRequest::whereDate('created_at', $today)
            ->where('type', 'complaint')
            ->count();

        return [
            'checkInsToday' => (int) ($stats->check_ins_today ?? 0),
            'checkOutsToday' => (int) ($stats->check_outs_today ?? 0),
            'pendingBookings' => (int) ($stats->pending_bookings ?? 0),
            'newBookingsToday' => (int) ($stats->new_bookings_today ?? 0),
            'tasksCompleted' => $tasksCompleted,
            'guestComplaints' => $guestComplaints,
        ];
    }

    /**
     * Get housekeeping statistics - REAL DATA
     */
    private function getHousekeepingStats($user, $today): array
    {
        // Get actual room assignments
        $assignedRooms = RoomAssignment::where('staff_id', $user->id)
            ->whereDate('date', $today)
            ->count();

        $cleanedRooms = RoomAssignment::where('staff_id', $user->id)
            ->whereDate('date', $today)
            ->where('status', 'completed')
            ->count();

        $pendingRooms = $assignedRooms - $cleanedRooms;

        $maintenanceReports = MaintenanceRequest::where('reported_by', $user->id)
            ->whereDate('created_at', $today)
            ->count();

        $tasksCompleted = $this->getCompletedTasksCount($user->id, $today);

        return [
            'assignedRooms' => $assignedRooms,
            'cleanedRooms' => $cleanedRooms,
            'pendingRooms' => max(0, $pendingRooms),
            'maintenanceReports' => $maintenanceReports,
            'tasksCompleted' => $tasksCompleted,
            'efficiency' => $assignedRooms > 0 ? round(($cleanedRooms / $assignedRooms) * 100) : 0,
        ];
    }

    /**
     * Get maintenance statistics - REAL DATA
     */
    private function getMaintenanceStats($user, $today): array
    {
        $assignedRequests = MaintenanceRequest::where('assigned_to', $user->id)->count();
        
        $completedToday = MaintenanceRequest::where('assigned_to', $user->id)
            ->where('status', 'completed')
            ->whereDate('updated_at', $today)
            ->count();

        $inProgress = MaintenanceRequest::where('assigned_to', $user->id)
            ->where('status', 'in_progress')
            ->count();

        $urgentRequests = MaintenanceRequest::where('assigned_to', $user->id)
            ->where('priority', 'high')
            ->where('status', '!=', 'completed')
            ->count();

        $tasksCompleted = $this->getCompletedTasksCount($user->id, $today);

        // Calculate average response time
        $avgResponseTime = MaintenanceRequest::where('assigned_to', $user->id)
            ->where('status', 'completed')
            ->whereNotNull('started_at')
            ->selectRaw('AVG(TIMESTAMPDIFF(MINUTE, created_at, started_at)) as avg_minutes')
            ->value('avg_minutes');

        $avgResponseTimeFormatted = $avgResponseTime ? 
            round($avgResponseTime / 60, 1) . ' hours' : 'N/A';

        return [
            'assignedRequests' => $assignedRequests,
            'completedToday' => $completedToday,
            'inProgress' => $inProgress,
            'urgentRequests' => $urgentRequests,
            'tasksCompleted' => $tasksCompleted,
            'avgResponseTime' => $avgResponseTimeFormatted,
        ];
    }

    /**
     * Get security statistics - REAL DATA
     */
    private function getSecurityStats($user, $today): array
    {
        $incidentsToday = ActivityLog::where('user_id', $user->id)
            ->where('type', 'incident')
            ->whereDate('created_at', $today)
            ->count();

        $patrolsCompleted = StaffTask::where('assigned_to', $user->id)
            ->where('type', 'patrol')
            ->where('status', 'completed')
            ->whereDate('completed_at', $today)
            ->count();

        $guestAssistance = ActivityLog::where('user_id', $user->id)
            ->where('type', 'guest_assistance')
            ->whereDate('created_at', $today)
            ->count();

        $keyCardIssues = MaintenanceRequest::where('assigned_to', $user->id)
            ->where('type', 'keycard')
            ->whereDate('created_at', $today)
            ->count();

        $tasksCompleted = $this->getCompletedTasksCount($user->id, $today);

        $currentSchedule = StaffSchedule::where('staff_id', $user->id)
            ->whereDate('date', $today)
            ->first();

        $shiftStatus = $this->determineShiftStatus($currentSchedule);

        return [
            'incidentsToday' => $incidentsToday,
            'patrolsCompleted' => $patrolsCompleted,
            'guestAssistance' => $guestAssistance,
            'keyCardIssues' => $keyCardIssues,
            'tasksCompleted' => $tasksCompleted,
            'shiftStatus' => $shiftStatus,
        ];
    }

    /**
     * Get general staff statistics - REAL DATA
     */
    private function getGeneralStaffStats($user, $today): array
    {
        $tasksAssigned = StaffTask::where('assigned_to', $user->id)
            ->whereDate('scheduled_date', $today)
            ->count();

        $tasksCompleted = $this->getCompletedTasksCount($user->id, $today);

        $tasksPending = StaffTask::where('assigned_to', $user->id)
            ->whereDate('scheduled_date', $today)
            ->where('status', 'pending')
            ->count();

        $hoursWorked = $this->calculateHoursWorked($user, $today);

        $currentSchedule = StaffSchedule::where('staff_id', $user->id)
            ->whereDate('date', $today)
            ->first();

        $shiftStatus = $this->determineShiftStatus($currentSchedule);

        $performance = $tasksAssigned > 0 ? round(($tasksCompleted / $tasksAssigned) * 100) : 0;

        return [
            'tasksAssigned' => $tasksAssigned,
            'tasksCompleted' => $tasksCompleted,
            'tasksPending' => $tasksPending,
            'hoursWorked' => $hoursWorked,
            'shiftStatus' => $shiftStatus,
            'performance' => $performance,
        ];
    }

    /**
     * Get today's tasks for staff - REAL DATA
     */
    private function getTodayTasksData($user): array
    {
        $today = Carbon::today();
        $role = $user->role ?? 'staff';
        $tasks = [];

        switch ($role) {
            case 'front_desk':
                $tasks = $this->getFrontDeskTasks($user, $today);
                break;
                
            case 'housekeeping':
                $tasks = $this->getHousekeepingTasks($user, $today);
                break;
                
            case 'maintenance':
                $tasks = $this->getMaintenanceTasks($user, $today);
                break;
                
            case 'security':
                $tasks = $this->getSecurityTasks($user, $today);
                break;
                
            default:
                $tasks = $this->getGeneralTasks($user, $today);
                break;
        }

        return $tasks;
    }

    /**
     * Get front desk tasks - REAL DATA
     */
    private function getFrontDeskTasks($user, $today): array
    {
        $tasks = [];

        // Check-ins
        $checkIns = Booking::with(['user', 'room'])
            ->where('check_in', $today)
            ->where('status', 'confirmed')
            ->limit(10)
            ->get();

        foreach ($checkIns as $booking) {
            $tasks[] = [
                'id' => $booking->id,
                'type' => 'check_in',
                'title' => 'Check-in: ' . ($booking->user->name ?? 'Guest'),
                'description' => 'Room ' . ($booking->room->number ?? 'TBD') . ' - ' . ($booking->room->type ?? 'Standard'),
                'time' => '14:00',
                'priority' => 'medium',
                'status' => 'pending',
                'guest_name' => $booking->user->name ?? 'Guest',
                'room_number' => $booking->room->number ?? 'TBD',
                'booking_id' => $booking->id,
            ];
        }

        // Check-outs
        $checkOuts = Booking::with(['user', 'room'])
            ->where('check_out', $today)
            ->where('status', 'checked_in')
            ->limit(10)
            ->get();

        foreach ($checkOuts as $booking) {
            $tasks[] = [
                'id' => $booking->id,
                'type' => 'check_out',
                'title' => 'Check-out: ' . ($booking->user->name ?? 'Guest'),
                'description' => 'Room ' . ($booking->room->number ?? 'TBD'),
                'time' => '11:00',
                'priority' => 'medium',
                'status' => 'pending',
                'guest_name' => $booking->user->name ?? 'Guest',
                'room_number' => $booking->room->number ?? 'TBD',
                'booking_id' => $booking->id,
            ];
        }

        // Add general staff tasks
        $generalTasks = StaffTask::with(['room', 'booking'])
            ->where('assigned_to', $user->id)
            ->whereDate('scheduled_date', $today)
            ->where('status', '!=', 'completed')
            ->get();

        foreach ($generalTasks as $task) {
            $tasks[] = [
                'id' => $task->id,
                'type' => $task->type,
                'title' => $task->title,
                'description' => $task->description,
                'time' => $task->scheduled_time ? Carbon::parse($task->scheduled_time)->format('H:i') : 'TBD',
                'priority' => $task->priority,
                'status' => $task->status,
                'estimated_duration' => $task->estimated_duration,
            ];
        }

        return $tasks;
    }

    /**
     * Get housekeeping tasks - REAL DATA
     */
    private function getHousekeepingTasks($user, $today): array
    {
        $tasks = [];

        // Room assignments
        $roomAssignments = RoomAssignment::with('room')
            ->where('staff_id', $user->id)
            ->whereDate('date', $today)
            ->where('status', '!=', 'completed')
            ->get();

        foreach ($roomAssignments as $assignment) {
            $tasks[] = [
                'id' => $assignment->id,
                'type' => 'room_cleaning',
                'title' => 'Clean Room ' . $assignment->room->number,
                'description' => ucfirst($assignment->cleaning_type) . ' cleaning',
                'time' => $assignment->scheduled_time ? Carbon::parse($assignment->scheduled_time)->format('H:i') : 'TBD',
                'priority' => $assignment->priority,
                'status' => $assignment->status,
                'room_number' => $assignment->room->number,
                'estimated_duration' => $assignment->estimated_duration ?? 45,
                'cleaning_type' => $assignment->cleaning_type,
            ];
        }

        // General housekeeping tasks
        $generalTasks = StaffTask::with(['room'])
            ->where('assigned_to', $user->id)
            ->whereDate('scheduled_date', $today)
            ->where('status', '!=', 'completed')
            ->get();

        foreach ($generalTasks as $task) {
            $tasks[] = [
                'id' => $task->id,
                'type' => $task->type,
                'title' => $task->title,
                'description' => $task->description,
                'time' => $task->scheduled_time ? Carbon::parse($task->scheduled_time)->format('H:i') : 'TBD',
                'priority' => $task->priority,
                'status' => $task->status,
                'room_number' => $task->room->number ?? null,
                'estimated_duration' => $task->estimated_duration,
            ];
        }

        return $tasks;
    }

    /**
     * Get maintenance tasks - REAL DATA
     */
    private function getMaintenanceTasks($user, $today): array
{
    $tasks = [];

    // Get StaffTask records for maintenance staff (from admin assignments)
    $staffTasks = StaffTask::with(['room'])
        ->where('assigned_to', $user->id)
        ->whereIn('status', ['pending', 'in_progress'])
        ->orderBy('priority', 'desc')
        ->orderBy('created_at', 'asc')
        ->limit(10)
        ->get();

    foreach ($staffTasks as $task) {
        $tasks[] = [
            'id' => $task->id,
            'type' => 'staff_task', // Distinguish from maintenance requests
            'title' => $task->title,
            'description' => $task->description ?? 'No description',
            'time' => $task->scheduled_at ? Carbon::parse($task->scheduled_at)->format('H:i') : 'TBD',
            'priority' => $task->priority ?? 'medium',
            'status' => $task->status ?? 'pending',
            'room_number' => $task->room->number ?? 'N/A',
            'estimated_duration' => $task->estimated_duration ?? 60,
            'task_type' => $task->type,
        ];
    }

    // Also get actual MaintenanceRequest records (if you have them)
    $maintenanceRequests = MaintenanceRequest::with(['room', 'reportedBy'])
        ->where('assigned_to', $user->id)
        ->whereIn('status', ['pending', 'in_progress'])
        ->orderBy('priority', 'desc')
        ->orderBy('created_at', 'asc')
        ->limit(10)
        ->get();

    foreach ($maintenanceRequests as $request) {
        $tasks[] = [
            'id' => $request->id,
            'type' => 'maintenance_request', // Distinguish from staff tasks
            'title' => $request->title ?? 'Maintenance Request',
            'description' => $request->description ?? 'No description',
            'time' => $request->created_at->format('H:i'),
            'priority' => $request->priority ?? 'medium',
            'status' => $request->status ?? 'pending',
            'room_number' => $request->room->number ?? 'N/A',
            'location' => $request->location ?? 'Room',
            'reported_by' => $request->reportedBy->name ?? 'System',
            'estimated_duration' => $request->estimated_duration ?? 60,
        ];
    }

    // Sort all tasks by priority and creation time
    usort($tasks, function($a, $b) {
        $priorityOrder = ['urgent' => 4, 'high' => 3, 'medium' => 2, 'low' => 1];
        $aPriority = $priorityOrder[$a['priority']] ?? 1;
        $bPriority = $priorityOrder[$b['priority']] ?? 1;
        
        if ($aPriority === $bPriority) {
            return 0;
        }
        return $aPriority > $bPriority ? -1 : 1;
    });

    return $tasks;
}

    /**
     * Get security tasks - REAL DATA
     */
    private function getSecurityTasks($user, $today): array
    {
        $tasks = [];

        $securityTasks = StaffTask::where('assigned_to', $user->id)
            ->whereDate('scheduled_date', $today)
            ->where('status', '!=', 'completed')
            ->orderBy('scheduled_time')
            ->get();

        foreach ($securityTasks as $task) {
            $tasks[] = [
                'id' => $task->id,
                'type' => $task->type,
                'title' => $task->title,
                'description' => $task->description,
                'time' => $task->scheduled_time ? Carbon::parse($task->scheduled_time)->format('H:i') : 'TBD',
                'priority' => $task->priority,
                'status' => $task->status,
                'location' => $task->location ?? 'Various',
                'estimated_duration' => $task->estimated_duration,
            ];
        }

        return $tasks;
    }

    /**
     * Get general tasks - REAL DATA
     */
    private function getGeneralTasks($user, $today): array
    {
        $tasks = [];

        $staffTasks = StaffTask::with(['room', 'booking'])
            ->where('assigned_to', $user->id)
            ->whereDate('scheduled_date', $today)
            ->where('status', '!=', 'completed')
            ->orderBy('priority', 'desc')
            ->orderBy('scheduled_time')
            ->get();

        foreach ($staffTasks as $task) {
            $tasks[] = [
                'id' => $task->id,
                'type' => $task->type,
                'title' => $task->title,
                'description' => $task->description,
                'time' => $task->scheduled_time ? Carbon::parse($task->scheduled_time)->format('H:i') : 'TBD',
                'priority' => $task->priority,
                'status' => $task->status,
                'estimated_duration' => $task->estimated_duration,
                'location' => $task->location,
            ];
        }

        return $tasks;
    }

    /**
     * Get assigned rooms data - REAL DATA
     */
    private function getAssignedRoomsData($user): array
    {
        if ($user->role !== 'housekeeping') {
            return [];
        }

        $assignments = RoomAssignment::with('room')
            ->where('staff_id', $user->id)
            ->whereDate('date', today())
            ->where('status', '!=', 'completed')
            ->get();

        return $assignments->map(function ($assignment) {
            return [
                'id' => $assignment->room->id,
                'assignment_id' => $assignment->id,
                'number' => $assignment->room->number,
                'type' => $assignment->room->type,
                'status' => $assignment->status,
                'cleaning_type' => $assignment->cleaning_type,
                'scheduled_time' => $assignment->scheduled_time,
                'priority' => $assignment->priority,
                'estimated_time' => $assignment->estimated_duration ?? 45,
                'notes' => $assignment->notes,
            ];
        })->toArray();
    }

    /**
     * Get maintenance requests data - REAL DATA
     */
    private function getMaintenanceRequestsData($user): array
    {
        if ($user->role !== 'maintenance') {
            return [];
        }

        $requests = MaintenanceRequest::with(['room', 'reportedBy'])
            ->where('assigned_to', $user->id)
            ->whereIn('status', ['pending', 'in_progress'])
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'asc')
            ->limit(15)
            ->get();

        return $requests->map(function ($request) {
            return [
                'id' => $request->id,
                'title' => $request->title ?? 'Maintenance Request',
                'description' => $request->description ?? 'No description',
                'priority' => $request->priority ?? 'medium',
                'status' => $request->status ?? 'pending',
                'room_number' => $request->room->number ?? 'N/A',
                'location' => $request->location ?? 'Room',
                'reported_by' => $request->reportedBy->name ?? 'System',
                'created_at' => $request->created_at->format('Y-m-d H:i:s'),
                'estimated_time' => $request->estimated_duration ?? 60,
                'type' => $request->type,
            ];
        })->toArray();
    }

    /**
     * Get recent activities data - REAL DATA
     */
    private function getRecentActivitiesData($user): array
    {
        $activities = ActivityLog::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return $activities->map(function ($activity) {
            return [
                'id' => $activity->id,
                'type' => $activity->type,
                'title' => $activity->title,
                'description' => $activity->description,
                'timestamp' => $activity->created_at->format('Y-m-d H:i:s'),
                'created_at' => $activity->created_at->diffForHumans(),
            ];
        })->toArray();
    }

    /**
     * Get staff schedule data - REAL DATA
     */
    private function getStaffScheduleData($user): array
    {
        $today = Carbon::today();
        $schedule = StaffSchedule::where('staff_id', $user->id)
            ->whereDate('date', $today)
            ->first();

        if (!$schedule) {
            return [
                'hasSchedule' => false,
                'shift_start' => null,
                'shift_end' => null,
                'break_start' => null,
                'break_end' => null,
                'status' => 'not_scheduled',
                'department' => $user->department ?? $this->getDepartmentFromRole($user->role),
            ];
        }

        return [
            'hasSchedule' => true,
            'shift_start' => $schedule->shift_start,
            'shift_end' => $schedule->shift_end,
            'break_start' => $schedule->break_start,
            'break_end' => $schedule->break_end,
            'status' => $this->determineShiftStatus($schedule),
            'department' => $schedule->department ?? $user->department ?? $this->getDepartmentFromRole($user->role),
            'location' => $schedule->location,
            'notes' => $schedule->notes,
        ];
    }

    /**
     * Get staff statistics - REAL DATA
     */
    private function getStaffStats($user): array
    {
        $today = Carbon::today();
        $thisWeek = Carbon::now()->startOfWeek();
        $thisMonth = Carbon::now()->startOfMonth();

        return [
            'today' => $this->getTodayStaffStats($user),
            'week' => $this->getWeekStaffStats($user, $thisWeek),
            'month' => $this->getMonthStaffStats($user, $thisMonth),
        ];
    }

    /**
     * Get week staff statistics
     */
    private function getWeekStaffStats($user, $weekStart): array
    {
        $tasksCompleted = StaffTask::where('assigned_to', $user->id)
            ->where('status', 'completed')
            ->whereBetween('completed_at', [$weekStart, $weekStart->copy()->endOfWeek()])
            ->count();

        $hoursWorked = StaffSchedule::where('staff_id', $user->id)
            ->whereBetween('date', [$weekStart, $weekStart->copy()->endOfWeek()])
            ->sum(DB::raw('TIMESTAMPDIFF(HOUR, shift_start, shift_end)'));

        $activitiesLogged = ActivityLog::where('user_id', $user->id)
            ->whereBetween('created_at', [$weekStart, $weekStart->copy()->endOfWeek()])
            ->count();

        return [
            'tasksCompleted' => $tasksCompleted,
            'hoursWorked' => round($hoursWorked, 1),
            'activitiesLogged' => $activitiesLogged,
        ];
    }

    /**
     * Get month staff statistics
     */
    private function getMonthStaffStats($user, $monthStart): array
    {
        $tasksCompleted = StaffTask::where('assigned_to', $user->id)
            ->where('status', 'completed')
            ->whereBetween('completed_at', [$monthStart, $monthStart->copy()->endOfMonth()])
            ->count();

        $hoursWorked = StaffSchedule::where('staff_id', $user->id)
            ->whereBetween('date', [$monthStart, $monthStart->copy()->endOfMonth()])
            ->sum(DB::raw('TIMESTAMPDIFF(HOUR, shift_start, shift_end)'));

        $activitiesLogged = ActivityLog::where('user_id', $user->id)
            ->whereBetween('created_at', [$monthStart, $monthStart->copy()->endOfMonth()])
            ->count();

        $performance = $this->calculateMonthlyPerformance($user, $monthStart);

        return [
            'tasksCompleted' => $tasksCompleted,
            'hoursWorked' => round($hoursWorked, 1),
            'activitiesLogged' => $activitiesLogged,
            'performance' => $performance,
        ];
    }

    /**
     * Helper methods
     */
    private function getCompletedTasksCount($userId, $date): int
    {
        return StaffTask::where('assigned_to', $userId)
            ->where('status', 'completed')
            ->whereDate('completed_at', $date)
            ->count();
    }

    private function calculateHoursWorked($user, $date): float
    {
        $schedule = StaffSchedule::where('staff_id', $user->id)
            ->whereDate('date', $date)
            ->first();

        if (!$schedule) {
            return 0;
        }

        $start = Carbon::parse($schedule->shift_start);
        $end = Carbon::parse($schedule->shift_end);
        
        return round($start->diffInMinutes($end) / 60, 1);
    }

    private function determineShiftStatus($schedule): string
    {
        if (!$schedule) {
            return 'not_scheduled';
        }

        $now = Carbon::now();
        $shiftStart = Carbon::parse($schedule->shift_start);
        $shiftEnd = Carbon::parse($schedule->shift_end);

        if ($now->lt($shiftStart)) {
            return 'upcoming';
        } elseif ($now->between($shiftStart, $shiftEnd)) {
            return 'active';
        } else {
            return 'completed';
        }
    }

    private function calculateMonthlyPerformance($user, $monthStart): int
    {
        $totalTasks = StaffTask::where('assigned_to', $user->id)
            ->whereBetween('scheduled_date', [$monthStart, $monthStart->copy()->endOfMonth()])
            ->count();

        $completedTasks = StaffTask::where('assigned_to', $user->id)
            ->where('status', 'completed')
            ->whereBetween('completed_at', [$monthStart, $monthStart->copy()->endOfMonth()])
            ->count();

        return $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100) : 0;
    }

    private function getDepartmentFromRole($role): string
    {
        $departments = [
            'front_desk' => 'Front Office',
            'housekeeping' => 'Housekeeping',
            'maintenance' => 'Maintenance',
            'security' => 'Security',
            'management' => 'Management',
            'food_service' => 'Food & Beverage',
        ];

        return $departments[$role] ?? 'General';
    }

    private function generateEmployeeId($userId): string
    {
        return 'EMP' . str_pad($userId, 4, '0', STR_PAD_LEFT);
    }

    private function updateRoomCleaningStatus($assignmentId, $status, $userId): void
    {
        RoomAssignment::where('id', $assignmentId)
            ->where('staff_id', $userId)
            ->update([
                'status' => $status,
                'completed_at' => $status === 'completed' ? now() : null,
                'updated_at' => now(),
            ]);
    }

    private function updateBookingStatus($bookingId, $status, $taskType): void
    {
        $statusMap = [
            'check_in' => ['completed' => 'checked_in'],
            'check_out' => ['completed' => 'completed'],
        ];

        if (isset($statusMap[$taskType][$status])) {
            Booking::where('id', $bookingId)->update([
                'status' => $statusMap[$taskType][$status],
                'updated_at' => now(),
            ]);
        }
    }

    private function getEmptyStaffDashboardData(): array
    {
        return [
            'todayStats' => $this->getEmptyStaffStats(),
            'todayTasks' => [],
            'assignedRooms' => [],
            'maintenanceRequests' => [],
            'recentActivities' => [],
            'schedule' => [
                'hasSchedule' => false,
                'status' => 'not_scheduled',
            ],
            'lastUpdated' => now()->toISOString(),
        ];
    }

    private function getEmptyStaffStats(): array
    {
        return [
            'tasksAssigned' => 0,
            'tasksCompleted' => 0,
            'tasksPending' => 0,
            'hoursWorked' => 0,
            'shiftStatus' => 'not_scheduled',
            'performance' => 0,
        ];
    }
}