<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
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
            'username' => 'required|string|max:255|unique:users|alpha_dash', // Added username validation
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
                'username' => $request->username, // Added username
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
        // Ensure we're only showing staff members
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
            'username' => ['required', 'string', 'max:255', 'alpha_dash', Rule::unique('users')->ignore($staff->id)], // Added username validation
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
                'username' => $request->username, // Added username
                'role' => $request->role,
                'department' => $request->department ?: $this->getDepartmentFromRole($request->role),
                'employee_id' => $request->employee_id,
                'phone' => $request->phone,
            ];

            // Only update password if provided
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