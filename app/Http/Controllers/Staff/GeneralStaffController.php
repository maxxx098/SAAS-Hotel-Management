<?php

namespace App\Http\Controllers\Staff;

use App\Models\StaffTask;
use App\Models\StaffSchedule;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * General Staff Controller
 * Handles general staff members and default staff role
 */
class GeneralStaffController extends BaseStaffController
{
    public function index(): Response
    {
        $user = auth()->user();
        $dashboardData = $this->getGeneralStaffDashboardData($user);

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

        $tasksAssigned = StaffTask::where('assigned_to', $user->id)
            ->whereDate('scheduled_at', $today)
            ->count() ?? 0;

        $tasksCompleted = StaffTask::where('assigned_to', $user->id)
            ->whereDate('scheduled_at', $today)
            ->where('status', 'completed')
            ->count() ?? 0;

        $tasksPending = StaffTask::where('assigned_to', $user->id)
            ->whereDate('scheduled_at', $today)
            ->where('status', 'pending')
            ->count() ?? 0;

        $hoursWorked = $this->calculateHoursWorked($user, $today);
        $shiftStatus = $this->getShiftStatus($user, $today);
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

    protected function getRoleSpecificTasks($user): array
    {
        $today = Carbon::today();

        return StaffTask::with(['room', 'booking'])
            ->where('assigned_to', $user->id)
            ->whereDate('scheduled_at', $today) 
            ->where('status', '!=', 'completed')
            ->orderBy('priority', 'desc')
            ->get()
            ->map(function ($task) {
                return [
                    'id' => $task->id,
                    'type' => $task->type,
                    'title' => $task->title,
                    'description' => $task->description,
                    'time' => $task->scheduled_at ? $task->scheduled_at->format('H:i') : 'TBD',
                    'priority' => $task->priority,
                    'status' => $task->status,
                    'room_number' => $task->room->number ?? null,
                    'estimated_duration' => $task->estimated_duration,
                ];
            })->toArray();
    }

    private function getGeneralStaffDashboardData($user): array
    {
        return [
            'todayStats' => $this->getRoleSpecificStats($user),
            'todayTasks' => $this->getRoleSpecificTasks($user),
            'schedule' => $this->getStaffSchedule($user),
        ];
    }

    /**
     * General staff specific methods
     */
    public function getTasks($user = null): array
    {
        if (!$user) $user = auth()->user();
        return $this->getRoleSpecificTasks($user);
    }

    public function updateTaskStatus(Request $request): JsonResponse
    {
        $request->validate([
            'task_id' => 'required|integer',
            'status' => 'required|string|in:pending,in_progress,completed',
        ]);

        $user = auth()->user();
        
        StaffTask::where('id', $request->task_id)
            ->where('assigned_to', $user->id)
            ->update([
                'status' => $request->status,
                'completed_at' => $request->status === 'completed' ? now() : null,
                'updated_at' => now(),
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Task status updated successfully',
        ]);
    }

    public function getSchedule($user = null): array
    {
        if (!$user) $user = auth()->user();
        return $this->getStaffSchedule($user);
    }

    private function calculateHoursWorked($user, $date): float
    {
        try {
            $schedule = StaffSchedule::where('staff_id', $user->id)
                ->whereDate('date', $date)
                ->first();

            if (!$schedule || !$schedule->shift_start || !$schedule->shift_end) {
                return 0;
            }

            $start = Carbon::parse($schedule->shift_start);
            $end = Carbon::parse($schedule->shift_end);
            $now = Carbon::now();

            if ($now->lt($start)) {
                return 0;
            }

            $workEnd = $now->gt($end) ? $end : $now;
            return round($start->diffInHours($workEnd, true), 1);
        } catch (\Exception $e) {
            \Log::warning('Error calculating hours worked', [
                'error' => $e->getMessage(),
                'user_id' => $user->id
            ]);
            return 0;
        }
    }

    private function getShiftStatus($user, $date): string
    {
        try {
            $schedule = StaffSchedule::where('staff_id', $user->id)
                ->whereDate('date', $date)
                ->first();

            if (!$schedule || !$schedule->shift_start || !$schedule->shift_end) {
                return 'off_duty';
            }

            $now = Carbon::now();
            $shiftStart = Carbon::parse($schedule->shift_start);
            $shiftEnd = Carbon::parse($schedule->shift_end);

            if ($now->between($shiftStart, $shiftEnd)) {
                return 'on_duty';
            } elseif ($now->lt($shiftStart)) {
                return 'scheduled';
            } else {
                return 'shift_ended';
            }
        } catch (\Exception $e) {
            return 'off_duty';
        }
    }

    private function getStaffSchedule($user): array
    {
        $today = Carbon::today();
        
        try {
            $schedule = StaffSchedule::where('staff_id', $user->id)
                ->whereDate('date', $today)
                ->first();

            if (!$schedule) {
                return [
                    'scheduled' => false,
                    'shift_start' => null,
                    'shift_end' => null,
                    'status' => 'off_duty',
                    'break_time' => null,
                ];
            }

            return [
                'scheduled' => true,
                'shift_start' => $schedule->shift_start ? Carbon::parse($schedule->shift_start)->format('H:i') : null,
                'shift_end' => $schedule->shift_end ? Carbon::parse($schedule->shift_end)->format('H:i') : null,
                'status' => $this->getShiftStatus($user, $today),
                'break_time' => $schedule->break_time ? Carbon::parse($schedule->break_time)->format('H:i') : null,
                'notes' => $schedule->notes,
            ];
        } catch (\Exception $e) {
            return [
                'scheduled' => false,
                'shift_start' => null,
                'shift_end' => null,
                'status' => 'off_duty',
                'break_time' => null,
            ];
        }
    }
}