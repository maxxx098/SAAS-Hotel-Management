<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\StaffTask; 
use App\Models\Room; 
use App\Models\Booking;
use App\Models\MaintenanceRequest;
use App\Models\StaffSchedule;
use App\Models\RoomAssignment;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StaffController extends Controller
{
    /**
     * Display a listing of staff members.
     */
    public function index(Request $request): Response
    {
        $query = User::staff()
            ->select('id', 'name', 'email', 'role', 'department', 'employee_id', 'username', 'phone', 'created_at')
            ->orderBy('created_at', 'desc');

        // Filter by role if provided
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        // Filter by department if provided
        if ($request->filled('department')) {
            $query->where('department', $request->department);
        }

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('employee_id', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%");
            });
        }

        $staff = $query->paginate(10)->withQueryString();

        return Inertia::render('dashboard/admin/staff/index', [
            'staff' => $staff,
            'filters' => $request->only(['role', 'department', 'search']),
            'availableRoles' => User::STAFF_ROLES,
            'roleLabels' => User::ROLES,
        ]);
    }

    /**
     * Show the form for creating a new staff member.
     */
    public function create(): Response
    {
        return Inertia::render('dashboard/admin/staff/create', [
            'availableRoles' => User::STAFF_ROLES,
            'roleLabels' => User::ROLES,
        ]);
    }

    /**
     * Store a newly created staff member.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'username' => 'required|string|max:255|unique:users|alpha_dash',
            'password' => 'required|string|min:8|confirmed',
            'role' => ['required', Rule::in(User::STAFF_ROLES)],
            'department' => 'nullable|string|max:255',
            'employee_id' => 'nullable|string|max:50|unique:users',
            'phone' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            $staff = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'username' => $request->username,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'department' => $request->department ?: $this->getDepartmentFromRole($request->role),
                'employee_id' => $request->employee_id ?: $this->generateEmployeeId(),
                'phone' => $request->phone,
            ]);

            return redirect()->route('admin.staff.index')
                ->with('success', 'Staff member created successfully. They can login using either their username or employee ID with their password.');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to create staff member. Please try again.'])->withInput();
        }
    }

    /**
     * Display the specified staff member.
     */
    public function show(User $staff): Response
    {
        if (!$staff->isStaff()) {
            abort(404);
        }

        return Inertia::render('dashboard/admin/staff/show', [
            'staff' => $staff->only(['id', 'name', 'email', 'username', 'role', 'department', 'employee_id', 'phone', 'created_at']),
            'roleLabel' => $staff->getRoleDisplayName(),
        ]);
    }

    /**
     * Show the form for editing the specified staff member.
     */
    public function edit(User $staff): Response
    {
        if (!$staff->isStaff()) {
            abort(404);
        }

        return Inertia::render('dashboard/admin/staff/edit', [
            'staff' => $staff->only(['id', 'name', 'email', 'username', 'role', 'department', 'employee_id', 'phone']),
            'availableRoles' => User::STAFF_ROLES,
            'roleLabels' => User::ROLES,
        ]);
    }

    /**
     * Update the specified staff member.
     */
    public function update(Request $request, User $staff)
    {
        if (!$staff->isStaff()) {
            abort(404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($staff->id)],
            'username' => ['required', 'string', 'max:255', 'alpha_dash', Rule::unique('users')->ignore($staff->id)],
            'password' => 'nullable|string|min:8|confirmed',
            'role' => ['required', Rule::in(User::STAFF_ROLES)],
            'department' => 'nullable|string|max:255',
            'employee_id' => ['nullable', 'string', 'max:50', Rule::unique('users')->ignore($staff->id)],
            'phone' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            $updateData = [
                'name' => $request->name,
                'email' => $request->email,
                'username' => $request->username,
                'role' => $request->role,
                'department' => $request->department ?: $this->getDepartmentFromRole($request->role),
                'employee_id' => $request->employee_id,
                'phone' => $request->phone,
            ];

            if ($request->filled('password')) {
                $updateData['password'] = Hash::make($request->password);
            }

            $staff->update($updateData);

            return redirect()->route('admin.staff.index')
                ->with('success', 'Staff member updated successfully.');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update staff member. Please try again.'])->withInput();
        }
    }

    /**
     * Remove the specified staff member.
     */
    public function destroy(User $staff)
    {
        if (!$staff->isStaff()) {
            abort(404);
        }

        try {
            $staff->delete();

            return redirect()->route('admin.staff.index')
                ->with('success', 'Staff member deleted successfully.');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete staff member. Please try again.']);
        }
    }

    // ===== TASK MANAGEMENT METHODS =====

    /**
     * Display task assignment page
     */
public function tasks(Request $request): Response
    {
        $query = StaffTask::with(['assignedTo:id,name,role,department', 'room:id,number,type'])
            ->orderBy('created_at', 'desc')
            ->orderBy('priority', 'desc');

        if ($request->filled('department')) {
            $query->whereHas('assignedTo', function ($q) use ($request) {
                $q->where('department', $request->department);
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('assignedTo', function ($staffQuery) use ($search) {
                      $staffQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $tasks = $query->get()->map(function ($task) {
            return [
                'id' => $task->id,
                'title' => $task->title,
                'description' => $task->description,
                'type' => $task->type,
                'priority' => $task->priority,
                'status' => $task->status,
                'assigned_to' => $task->assigned_to,
                'assigned_staff' => $task->assignedTo ? [
                    'id' => $task->assignedTo->id,
                    'name' => $task->assignedTo->name,
                    'role' => $task->assignedTo->role,
                    'department' => $task->assignedTo->department,
                ] : null,
                'room_id' => $task->room_id,
                'room' => $task->room ? [
                    'id' => $task->room->id,
                    'number' => $task->room->number,
                    'type' => $task->room->type,
                ] : null,
                'scheduled_date' => $task->scheduled_at ? Carbon::parse($task->scheduled_at)->format('Y-m-d') : null,
                'scheduled_time' => $task->scheduled_at ? Carbon::parse($task->scheduled_at)->format('H:i') : null,
                'estimated_duration' => $task->estimated_duration ?? 60,
                'location' => $task->location,
                'created_at' => $task->created_at,
                'updated_at' => $task->updated_at,
            ];
        });

        return Inertia::render('dashboard/admin/staff/tasks', [
            'tasks' => $tasks,
            'staff' => User::staff()->select('id', 'name', 'role', 'department', 'employee_id')->get()->map(function ($staff) {
                return [
                    'id' => $staff->id,
                    'name' => $staff->name,
                    'role' => $staff->role,
                    'department' => $staff->department,
                    'employee_id' => $staff->employee_id,
                    'status' => 'active', // Add default status
                ];
            }),
            'rooms' => Room::select('id', 'number', 'type', 'status')->get(),
            'taskTypes' => $this->getTaskTypes(), // This should return an array of strings
            'departments' => $this->getDepartments(),
            'filters' => $request->only(['department', 'status', 'priority', 'search']),
        ]);
    }

    /**
     * Store a new task assignment
     */
    public function storeTask(Request $request) 
    {     
        $validator = Validator::make($request->all(), [         
            'title' => 'required|string|max:255',         
            'description' => 'nullable|string',         
            'type' => 'required|string|in:' . implode(',', $this->getTaskTypes()),         
            'priority' => 'required|string|in:low,medium,high,urgent',         
            'assigned_to' => 'required|exists:users,id',         
            'room_id' => 'nullable|exists:rooms,id',         
            'scheduled_at' => 'nullable|date|after_or_equal:today',         
            'estimated_duration' => 'nullable|integer|min:15',     
        ]);      

        if ($validator->fails()) {         
            return back()->withErrors($validator)->withInput();     
        }      

        try {         
            // Get the assigned staff member to determine their role
            $assignedStaff = User::find($request->assigned_to);
            $taskType = $request->type;
            
            // Create the main StaffTask record
            $task = StaffTask::create([
                'title' => $request->title,
                'description' => $request->description,
                'type' => $request->type,
                'priority' => $request->priority,
                'status' => 'pending',
                'assigned_to' => $request->assigned_to,
                'room_id' => $request->room_id,
                'scheduled_at' => $request->scheduled_at,
                'estimated_duration' => $request->estimated_duration ?? 60,
                'created_by' => auth()->id(),
            ]);

            // Create additional records based on staff role and task type
            $this->createAdditionalTaskRecords($assignedStaff, $taskType, $request, $task);

            // Log the activity
            ActivityLog::create([
                'user_id' => auth()->id(),
                'type' => 'task_assigned',
                'title' => 'Task Assigned',
                'description' => "Assigned task '{$request->title}' to {$assignedStaff->name}",
                'properties' => json_encode([
                    'task_title' => $request->title,
                    'assigned_to' => $request->assigned_to,
                    'assigned_to_name' => $assignedStaff->name,
                    'task_type' => $request->type,
                    'priority' => $request->priority,
                ]),
            ]);

            return back()->with('success', 'Task assigned successfully.');      

        } catch (\Exception $e) {         
            Log::error('Failed to store task', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all(),
                'admin_id' => auth()->id(),
            ]);
            
            return back()->withErrors(['error' => 'Failed to assign task. Please try again.']);     
        } 
    }

    /**
     * Update an existing task
     */
   public function updateTask(Request $request, StaffTask $task)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|string|in:' . implode(',', $this->getTaskTypes()),
            'priority' => 'required|string|in:low,medium,high,urgent',
            'assigned_to' => 'required|exists:users,id',
            'room_id' => 'nullable|exists:rooms,id',
            'scheduled_at' => 'nullable|date',
            'estimated_duration' => 'nullable|integer|min:15',
            'status' => 'nullable|string|in:pending,in_progress,completed,cancelled',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            $task->update([
                'title' => $request->title,
                'description' => $request->description,
                'type' => $request->type,
                'priority' => $request->priority,
                'status' => $request->status ?? $task->status,
                'assigned_to' => $request->assigned_to,
                'room_id' => $request->room_id,
                'scheduled_at' => $request->scheduled_at,
                'estimated_duration' => $request->estimated_duration,
            ]);

            return back()->with('success', 'Task updated successfully.');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update task. Please try again.']);
        }
    }
    /**
     * Delete a task
     */
    public function destroyTask(StaffTask $task)
    {
        try {
            $task->delete();
            return back()->with('success', 'Task deleted successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete task. Please try again.']);
        }
    }

    /**
     * Update task status (for staff to update their own tasks)
     */
    public function updateTaskStatus(Request $request, StaffTask $task)
    {
        $request->validate([
            'status' => 'required|string|in:pending,in_progress,completed,cancelled',
        ]);

        try {
            $task->update([
                'status' => $request->status,
                'completed_at' => $request->status === 'completed' ? now() : null,
            ]);

            return back()->with('success', 'Task status updated successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update task status.']);
        }
    }

    // ===== HELPER METHODS =====

    /**
     * Get department name from role
     */
    private function getDepartmentFromRole(string $role): string
    {
        return match($role) {
            'front_desk' => 'Front Desk',
            'housekeeping' => 'Housekeeping',
            'maintenance' => 'Maintenance',
            'security' => 'Security',
            'staff' => 'General',
            default => 'General',
        };
    }

    /**
     * Get all available departments
     */
    private function getDepartments(): array
    {
        return [
            'Front Desk',
            'Housekeeping',
            'Maintenance',
            'Security',
            'General',
        ];
    }

    /**
     * Get all available task types
     */
        private function getTaskTypes(): array 
        {
            return array_keys(StaffTask::TYPES); // Return just the keys
        }

            /**
     * Create additional task records based on staff role and task type
     */
    private function createAdditionalTaskRecords($assignedStaff, $taskType, $request, $task)
    {
        switch ($assignedStaff->role) {
            case 'housekeeping':
                if (in_array($taskType, ['room_cleaning', 'cleaning', 'deep_cleaning', 'checkout_cleaning'])) {
                    RoomAssignment::create([
                        'staff_id' => $request->assigned_to,
                        'room_id' => $request->room_id,
                        'date' => $request->scheduled_at ? Carbon::parse($request->scheduled_at)->toDateString() : Carbon::today()->toDateString(),
                        'scheduled_time' => $request->scheduled_at ? Carbon::parse($request->scheduled_at)->toTimeString() : '09:00:00',
                        'cleaning_type' => $this->determineCleaningType($taskType),
                        'priority' => $request->priority,
                        'status' => 'pending',
                        'estimated_duration' => $request->estimated_duration ?? 45,
                        'notes' => $request->description,
                        'assigned_by' => auth()->id(),
                        'staff_task_id' => $task->id, // Link to the main task
                    ]);
                }
                break;
                
            case 'maintenance':
                if (in_array($taskType, ['maintenance', 'repair', 'inspection', 'plumbing', 'electrical', 'hvac'])) {
                    MaintenanceRequest::create([
                        'title' => $request->title,
                        'description' => $request->description,
                        'type' => $this->mapTaskTypeToMaintenanceType($taskType),
                        'priority' => $request->priority,
                        'status' => 'pending',
                        'room_id' => $request->room_id,
                        'location' => $request->room_id ? 'Room' : 'General',
                        'assigned_to' => $request->assigned_to,
                        'reported_by' => auth()->id(),
                        'estimated_duration' => $request->estimated_duration ?? 60,
                        'scheduled_at' => $request->scheduled_at,
                        'staff_task_id' => $task->id, // Link to the main task
                    ]);
                }
                break;
        }
    }

    /**
     * Generate unique employee ID
     */
    private function generateEmployeeId(): string
    {
        do {
            $employeeId = 'EMP-' . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
        } while (User::where('employee_id', $employeeId)->exists());

        return $employeeId;
    }

    /**
 * Helper method to determine cleaning type based on task type
 */
 private function determineCleaningType($taskType): string
    {
        $cleaningTypes = [
            'room_cleaning' => 'standard',
            'deep_cleaning' => 'deep',
            'checkout_cleaning' => 'checkout',
            'maintenance_cleaning' => 'maintenance',
            'cleaning' => 'standard',
        ];
        
        return $cleaningTypes[$taskType] ?? 'standard';
    }

/**
 * Helper method to map task types to maintenance request types
 */
private function mapTaskTypeToMaintenanceType($taskType): string
    {
        $maintenanceTypes = [
            'maintenance' => 'general',
            'repair' => 'repair',
            'inspection' => 'inspection',
            'plumbing' => 'plumbing',
            'electrical' => 'electrical',
            'hvac' => 'hvac',
            'cleaning' => 'cleaning',
        ];
        
        return $maintenanceTypes[$taskType] ?? 'general';
    }

}