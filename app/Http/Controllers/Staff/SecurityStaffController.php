<?php

namespace App\Http\Controllers\Staff;

use App\Models\ActivityLog;
use App\Models\StaffTask;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Security Staff Controller
 * Handles security patrols, incidents, access control
 */
class SecurityController extends BaseStaffController
{
    public function index(): Response
    {
        $user = auth()->user();
        $dashboardData = $this->getSecurityDashboardData($user);

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

        $incidentsToday = ActivityLog::where('user_id', $user->id)
            ->where('type', 'incident')
            ->whereDate('created_at', $today)
            ->count() ?? 0;

        $patrolsCompleted = StaffTask::where('assigned_to', $user->id)
            ->where('type', 'patrol')
            ->where('status', 'completed')
            ->whereDate('completed_at', $today)
            ->count() ?? 0;

        $guestAssistance = ActivityLog::where('user_id', $user->id)
            ->where('type', 'guest_assistance')
            ->whereDate('created_at', $today)
            ->count() ?? 0;

        return [
            'incidentsToday' => $incidentsToday,
            'patrolsCompleted' => $patrolsCompleted,
            'guestAssistance' => $guestAssistance,
            'tasksCompleted' => $this->getCompletedTasksCount($user->id, $today),
            'shiftStatus' => $this->getShiftStatus($user, $today),
        ];
    }

    protected function getRoleSpecificTasks($user): array
    {
        $today = Carbon::today();

        return StaffTask::where('assigned_to', $user->id)
            ->whereDate('scheduled_at', $today)
            ->where('status', '!=', 'completed')
            ->orderBy('priority', 'desc')
            ->get()
            ->map(function ($task) {
                return [
                    'id' => $task->id,
                    'type' => $task->type,
                    'title' => $task->title ?? 'Security Task',
                    'description' => $task->description ?? 'Security-related task',
                    'time' => $task->scheduled_at ? $task->scheduled_at->format('H:i') : 'TBD',
                    'priority' => $task->priority ?? 'medium',
                    'status' => $task->status,
                    'estimated_duration' => $task->estimated_duration ?? 30,
                ];
            })->toArray();
    }

    private function getSecurityDashboardData($user): array
    {
        return [
            'todayStats' => $this->getRoleSpecificStats($user),
            'todayTasks' => $this->getRoleSpecificTasks($user),
            'todaysPatrols' => $this->getTodaysPatrols($user),
        ];
    }

    /**
     * Security specific methods
     */
    public function getTodaysPatrols($user): array
    {
        $today = Carbon::today();
        
        return StaffTask::where('assigned_to', $user->id)
            ->where('type', 'patrol')
            ->whereDate('scheduled_at', $today)
            ->get()
            ->map(function ($patrol) {
                return [
                    'id' => $patrol->id,
                    'title' => $patrol->title ?? 'Security Patrol',
                    'location' => $patrol->location ?? 'Property grounds',
                    'scheduled_time' => $patrol->scheduled_at ? $patrol->scheduled_at->format('H:i') : 'TBD',
                    'status' => $patrol->status,
                    'estimated_duration' => $patrol->estimated_duration ?? 30,
                ];
            })->toArray();
    }

    public function reportIncident(Request $request): JsonResponse
    {
        // Handle incident reporting
        $user = auth()->user();
        
        ActivityLog::create([
            'user_id' => $user->id,
            'type' => 'incident',
            'title' => $request->title,
            'description' => $request->description,
            'properties' => json_encode($request->properties ?? []),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Incident reported successfully',
        ]);
    }

    public function completePatrol(Request $request): JsonResponse
    {
        // Handle patrol completion
        $user = auth()->user();
        
        StaffTask::where('id', $request->patrol_id)
            ->where('assigned_to', $user->id)
            ->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Patrol completed successfully',
        ]);
    }

    private function getShiftStatus($user, $date): string
    {
        // Reuse the shift status logic from GeneralStaffController
        return app(GeneralStaffController::class)->getShiftStatus($user, $date) ?? 'off_duty';
    }
}

