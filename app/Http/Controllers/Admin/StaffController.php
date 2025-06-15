<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\StaffTask; 
use App\Models\Room; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

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
        ->orderBy('created_at', 'desc') // Changed from scheduled_date to created_at since scheduled_date doesn't exist
        ->orderBy('priority', 'desc');

    if ($request->filled('department')) {
            $query->whereHas('assignedStaff', function ($q) use ($request) {
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
                  ->orWhereHas('assignedStaff', function ($staffQuery) use ($search) {
                      $staffQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $tasks = $query->get();

    return Inertia::render('dashboard/admin/staff/tasks', [
        'tasks' => $tasks,
        'staff' => User::staff()->select('id', 'name', 'role', 'department', 'employee_id')->get(),
        'rooms' => Room::select('id', 'number', 'type', 'status')->get(),
        'taskTypes' => $this->getTaskTypes(),
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
        'type' => 'required|string|in:' . implode(',', array_keys(StaffTask::TYPES)), // Use the actual task types from the model
        'priority' => 'required|string|in:low,medium,high,urgent',
        'assigned_to' => 'required|exists:users,id',
        'room_id' => 'nullable|exists:rooms,id',
        'scheduled_at' => 'nullable|date|after_or_equal:today', // Changed to match model field
        'estimated_duration' => 'nullable|integer|min:15',
    ]);

    if ($validator->fails()) {
        return back()->withErrors($validator)->withInput();
    }

    try {
        StaffTask::create([
            'title' => $request->title,
            'description' => $request->description,
            'type' => $request->type,
            'priority' => $request->priority,
            'status' => 'pending',
            'assigned_to' => $request->assigned_to,
            'room_id' => $request->room_id,
            'scheduled_at' => $request->scheduled_at,
            'estimated_duration' => $request->estimated_duration,
            'created_by' => auth()->id(),
        ]);

        return back()->with('success', 'Task assigned successfully.');

    } catch (\Exception $e) {
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
        'type' => 'required|string|in:' . implode(',', array_keys(StaffTask::TYPES)),
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
        return [
            'cleaning',
            'maintenance',
            'inspection',
            'delivery',
            'setup',
            'security_check',
            'guest_request',
            'inventory',
            'training',
            'other',
        ];
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
}