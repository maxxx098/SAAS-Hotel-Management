<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

/**
 * Base Staff Dashboard Controller
 * Handles common staff functionality
 */
abstract class BaseStaffController extends Controller
{
    /**
     * Common staff data that all roles need
     */
    protected function getBaseStaffData($user): array
    {
        return [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'department' => $user->department,
                'employee_id' => $user->employee_id,
            ],
            'lastUpdated' => now()->toISOString(),
        ];
    }

    /**
     * Common task completion count
     */
    protected function getCompletedTasksCount($userId, $date): int
    {
        return \App\Models\StaffTask::where('assigned_to', $userId)
            ->where('status', 'completed')
            ->whereDate('completed_at', $date)
            ->count() ?? 0;
    }

    /**
     * Each role controller must implement these methods
     */
    abstract public function index(): \Inertia\Response;
    abstract public function stats(): JsonResponse;
    abstract protected function getRoleSpecificStats($user): array;
    abstract protected function getRoleSpecificTasks($user): array;
}
