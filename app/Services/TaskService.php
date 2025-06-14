<?php
// app/Services/TaskService.php

namespace App\Services;

use App\Models\StaffTask;
use App\Models\RoomAssignment;
use App\Models\User;
use App\Models\Room;
use App\Models\Booking;
use App\Models\MaintenanceRequest;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TaskService
{
    /**
     * Create a new task
     */
    public function createTask(array $data): StaffTask
    {
        return StaffTask::create([
            'assigned_to' => $data['assigned_to'],
            'created_by' => $data['created_by'] ?? auth()->id(),
            'type' => $data['type'],
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'priority' => $data['priority'] ?? 'medium',
            'room_id' => $data['room_id'] ?? null,
            'booking_id' => $data['booking_id'] ?? null,
            'maintenance_request_id' => $data['maintenance_request_id'] ?? null,
            'scheduled_at' => $data['scheduled_at'] ?? now(),
            'estimated_duration' => $data['estimated_duration'] ?? null,
            'metadata' => $data['metadata'] ?? null,
            'notes' => $data['notes'] ?? null,
        ]);
    }

    /**
     * Auto-generate tasks from bookings
     */
    public function generateTasksFromBookings(Carbon $date = null): int
    {
        $date = $date ?? Carbon::today();
        $tasksCreated = 0;

        try {
            DB::beginTransaction();

            // Generate check-in tasks
            $checkIns = Booking::with(['user', 'room'])
                ->whereDate('check_in', $date)
                ->where('status', 'confirmed')
                ->whereDoesntHave('tasks', function ($query) {
                    $query->where('type', 'check_in');
                })
                ->get();

            foreach ($checkIns as $booking) {
                // Assign to front desk staff
                $frontDeskStaff = $this->getAvailableFrontDeskStaff($date);
                if ($frontDeskStaff) {
                    $this->createTask([
                        'assigned_to' => $frontDeskStaff->id,
                        'type' => 'check_in',
                        'title' => 'Check-in: ' . ($booking->user->name ?? 'Guest'),
                        'description' => 'Room ' . ($booking->room->number ?? 'TBD') . ' - Check-in at 14:00',
                        'priority' => 'medium',
                        'booking_id' => $booking->id,
                        'room_id' => $booking->room_id,
                        'scheduled_at' => $date->copy()->setTime(14, 0),
                        'estimated_duration' => 15,
                        'metadata' => [
                            'guest_name' => $booking->user->name ?? 'Guest',
                            'room_number' => $booking->room->number ?? 'TBD',
                            'booking_reference' => $booking->id,
                        ],
                    ]);
                    $tasksCreated++;
                }
            }

            // Generate check-out tasks
            $checkOuts = Booking::with(['user', 'room'])
                ->whereDate('check_out', $date)
                ->where('status', 'checked_in')
                ->whereDoesntHave('tasks', function ($query) {
                    $query->where('type', 'check_out');
                })
                ->get();

            foreach ($checkOuts as $booking) {
                $frontDeskStaff = $this->getAvailableFrontDeskStaff($date);
                if ($frontDeskStaff) {
                    $this->createTask([
                        'assigned_to' => $frontDeskStaff->id,
                        'type' => 'check_out',
                        'title' => 'Check-out: ' . ($booking->user->name ?? 'Guest'),
                        'description' => 'Room ' . ($booking->room->number ?? 'TBD') . ' - Check-out by 11:00',
                        'priority' => 'medium',
                        'booking_id' => $booking->id,
                        'room_id' => $booking->room_id,
                        'scheduled_at' => $date->copy()->setTime(11, 0),
                        'estimated_duration' => 10,
                        'metadata' => [
                            'guest_name' => $booking->user->name ?? 'Guest',
                            'room_number' => $booking->room->number ?? 'TBD',
                            'booking_reference' => $booking->id,
                        ],
                    ]);
                    $tasksCreated++;
                }
            }

            // Generate room cleaning tasks after checkouts
            $roomsNeedingCleaning = Booking::with(['room'])
                ->whereDate('check_out', $date)
                ->where('status', 'checked_in')
                ->get()
                ->pluck('room')
                ->unique('id');

            foreach ($roomsNeedingCleaning as $room) {
                $housekeepingStaff = $this->getAvailableHousekeepingStaff($date);
                if ($housekeepingStaff) {
                    // Create room assignment
                    RoomAssignment::create([
                        'room_id' => $room->id,
                        'staff_id' => $housekeepingStaff->id,
                        'assigned_date' => $date,
                        'cleaning_type' => 'checkout',
                    ]);

                    // Create task
                    $this->createTask([
                        'assigned_to' => $housekeepingStaff->id,
                        'type' => 'room_cleaning',
                        'title' => 'Clean Room ' . $room->number,
                        'description' => 'Post-checkout cleaning required',
                        'priority' => 'high',
                        'room_id' => $room->id,
                        'scheduled_at' => $date->copy()->setTime(12, 0), // After checkout time
                        'estimated_duration' => 45,
                        'metadata' => [
                            'room_number' => $room->number,
                            'cleaning_type' => 'checkout',
                        ],
                    ]);
                    $tasksCreated++;
                }
            }

            DB::commit();
            return $tasksCreated;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to generate tasks from bookings', [
                'error' => $e->getMessage(),
                'date' => $date->format('Y-m-d'),
            ]);
            throw $e;
        }
    }

    /**
     * Generate maintenance tasks
     */
    public function generateMaintenanceTasks(): int
    {
        $tasksCreated = 0;

        try {
            $pendingRequests = MaintenanceRequest::with(['room'])
                ->where('status', 'pending')
                ->whereNull('assigned_to')
                ->get();

            foreach ($pendingRequests as $request) {
                $maintenanceStaff = $this->getAvailableMaintenanceStaff();
                if ($maintenanceStaff) {
                    // Update maintenance request
                    $request->update([
                        'assigned_to' => $maintenanceStaff->id,
                        'status' => 'assigned',
                        'assigned_at' => now(),
                    ]);

                    // Create task
                    $this->createTask([
                        'assigned_to' => $maintenanceStaff->id,
                        'type' => 'maintenance',
                        'title' => $request->title ?? 'Maintenance Request',
                        'description' => $request->description ?? 'No description provided',
                        'priority' => $request->priority ?? 'medium',
                        'room_id' => $request->room_id,
                        'maintenance_request_id' => $request->id,
                        'scheduled_at' => now(),
                        'estimated_duration' => $request->estimated_duration ?? 60,
                        'metadata' => [
                            'room_number' => $request->room->number ?? 'N/A',
                            'location' => $request->location ?? 'Room',
                            'request_type' => $request->type ?? 'general',
                        ],
                    ]);
                    $tasksCreated++;
                }
            }

            return $tasksCreated;

        } catch (\Exception $e) {
            Log::error('Failed to generate maintenance tasks', [
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Update task status
     */
    public function updateTaskStatus(int $taskId, string $status, ?string $notes = null): bool
    {
        try {
            $task = StaffTask::findOrFail($taskId);
            
            // Ensure the task belongs to the authenticated user
            if ($task->assigned_to !== auth()->id()) {
                throw new \Exception('Unauthorized to update this task');
            }

            switch ($status) {
                case 'in_progress':
                    $task->start();
                    break;
                    
                case 'completed':
                    $task->complete($notes);
                    $this->handleTaskCompletion($task);
                    break;
                    
                case 'cancelled':
                    $task->cancel($notes);
                    break;
                    
                default:
                    $task->update(['status' => $status]);
            }

            return true;

        } catch (\Exception $e) {
            Log::error('Failed to update task status', [
                'task_id' => $taskId,
                'status' => $status,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Handle specific actions when a task is completed
     */
    private function handleTaskCompletion(StaffTask $task): void
    {
        switch ($task->type) {
            case 'check_in':
                if ($task->booking) {
                    $task->booking->update([
                        'status' => 'checked_in',
                        'actual_check_in' => now(),
                        'checked_in_by' => $task->assigned_to,
                        'check_in_completed' => true,
                    ]);
                }
                break;

            case 'check_out':
                if ($task->booking) {
                    $task->booking->update([
                        'status' => 'checked_out',
                        'actual_check_out' => now(),
                        'checked_out_by' => $task->assigned_to,
                        'check_out_completed' => true,
                    ]);
                    
                    // Mark room as dirty for cleaning
                    if ($task->room) {
                        $task->room->update(['cleaning_status' => 'dirty']);
                        }
                }
                break;

            case 'room_cleaning':
                if ($task->room) {
                    $task->room->update([
                        'cleaning_status' => 'clean',
                        'last_cleaned' => now(),
                        'cleaned_by' => $task->assigned_to,
                    ]);
                    
                    // Update room assignment status
                    RoomAssignment::where('room_id', $task->room_id)
                        ->where('staff_id', $task->assigned_to)
                        ->whereDate('assigned_date', $task->scheduled_at->toDateString())
                        ->update([
                            'status' => 'completed',
                            'completed_at' => now(),
                        ]);
                }
                break;

            case 'maintenance':
                if ($task->maintenanceRequest) {
                    $task->maintenanceRequest->update([
                        'status' => 'completed',
                        'completed_at' => now(),
                        'completion_notes' => $task->notes,
                    ]);
                    
                    // If room maintenance, update room status
                    if ($task->room) {
                        $task->room->update([
                            'maintenance_status' => 'operational',
                            'last_maintenance' => now(),
                        ]);
                    }
                }
                break;
        }
    }

    /**
     * Get available front desk staff for a given date
     */
    private function getAvailableFrontDeskStaff(Carbon $date): ?User
    {
        return User::where('role', 'front_desk')
            ->where('is_active', true)
            ->whereDoesntHave('tasks', function ($query) use ($date) {
                $query->whereDate('scheduled_at', $date)
                    ->whereIn('status', ['pending', 'in_progress']);
            })
            ->inRandomOrder()
            ->first();
    }

    /**
     * Get available housekeeping staff for a given date
     */
    private function getAvailableHousekeepingStaff(Carbon $date): ?User
    {
        return User::where('role', 'housekeeping')
            ->where('is_active', true)
            ->whereHas('schedule', function ($query) use ($date) {
                $query->where('date', $date->toDateString())
                    ->where('is_working', true);
            })
            ->whereDoesntHave('roomAssignments', function ($query) use ($date) {
                $query->where('assigned_date', $date->toDateString())
                    ->whereIn('status', ['pending', 'in_progress']);
            })
            ->inRandomOrder()
            ->first();
    }

    /**
     * Get available maintenance staff
     */
    private function getAvailableMaintenanceStaff(): ?User
    {
        return User::where('role', 'maintenance')
            ->where('is_active', true)
            ->whereHas('tasks', function ($query) {
                $query->whereIn('status', ['pending', 'in_progress']);
            }, '<', 3) // Limit to staff with less than 3 active tasks
            ->inRandomOrder()
            ->first();
    }

    /**
     * Get tasks for a specific staff member
     */
    public function getStaffTasks(int $staffId, ?Carbon $date = null): \Illuminate\Database\Eloquent\Collection
    {
        $query = StaffTask::with(['room', 'booking', 'maintenanceRequest'])
            ->where('assigned_to', $staffId);

        if ($date) {
            $query->whereDate('scheduled_at', $date);
        }

        return $query->orderBy('scheduled_at')->get();
    }

    /**
     * Get daily task summary
     */
    public function getDailyTaskSummary(Carbon $date): array
    {
        $tasks = StaffTask::whereDate('scheduled_at', $date)->get();

        return [
            'total' => $tasks->count(),
            'pending' => $tasks->where('status', 'pending')->count(),
            'in_progress' => $tasks->where('status', 'in_progress')->count(),
            'completed' => $tasks->where('status', 'completed')->count(),
            'cancelled' => $tasks->where('status', 'cancelled')->count(),
            'by_type' => $tasks->groupBy('type')->map->count(),
            'by_priority' => $tasks->groupBy('priority')->map->count(),
        ];
    }

    /**
     * Reassign task to different staff member
     */
    public function reassignTask(int $taskId, int $newStaffId, ?string $reason = null): bool
    {
        try {
            $task = StaffTask::findOrFail($taskId);
            
            // Check if task can be reassigned
            if (in_array($task->status, ['completed', 'cancelled'])) {
                throw new \Exception('Cannot reassign completed or cancelled tasks');
            }

            $oldStaffId = $task->assigned_to;
            
            $task->update([
                'assigned_to' => $newStaffId,
                'reassigned_at' => now(),
                'reassigned_by' => auth()->id(),
                'reassignment_reason' => $reason,
            ]);

            // Log the reassignment
            Log::info('Task reassigned', [
                'task_id' => $taskId,
                'from_staff' => $oldStaffId,
                'to_staff' => $newStaffId,
                'reason' => $reason,
                'reassigned_by' => auth()->id(),
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('Failed to reassign task', [
                'task_id' => $taskId,
                'new_staff_id' => $newStaffId,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Get overdue tasks
     */
    public function getOverdueTasks(): \Illuminate\Database\Eloquent\Collection
    {
        return StaffTask::with(['assignedStaff', 'room', 'booking'])
            ->where('scheduled_at', '<', now())
            ->whereIn('status', ['pending', 'in_progress'])
            ->orderBy('scheduled_at')
            ->get();
    }

    /**
     * Calculate staff workload for a given date
     */
    public function calculateStaffWorkload(int $staffId, Carbon $date): array
    {
        $tasks = $this->getStaffTasks($staffId, $date);
        
        $totalDuration = $tasks->sum('estimated_duration') ?? 0;
        $completedTasks = $tasks->where('status', 'completed');
        $pendingTasks = $tasks->whereIn('status', ['pending', 'in_progress']);

        return [
            'total_tasks' => $tasks->count(),
            'completed_tasks' => $completedTasks->count(),
            'pending_tasks' => $pendingTasks->count(),
            'estimated_duration' => $totalDuration,
            'completion_rate' => $tasks->count() > 0 ? ($completedTasks->count() / $tasks->count()) * 100 : 0,
            'workload_status' => $this->getWorkloadStatus($totalDuration),
        ];
    }

    /**
     * Determine workload status based on estimated duration
     */
    private function getWorkloadStatus(int $totalMinutes): string
    {
        $hours = $totalMinutes / 60;
        
        if ($hours <= 4) return 'light';
        if ($hours <= 6) return 'moderate';
        if ($hours <= 8) return 'heavy';
        
        return 'overloaded';
    }
}