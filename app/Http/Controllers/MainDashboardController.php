<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use App\Models\User;

class MainDashboardController extends Controller
{
    /**
     * Redirect users to their appropriate dashboard based on role
     */
    public function index(): RedirectResponse
    {
        $user = auth()->user();
        
        // Check if user is admin
        if ($this->isAdmin($user)) {
            return redirect()->route('admin.dashboard');
        }
        
        // Check if user is staff
        if ($this->isStaff($user)) {
            return redirect()->route('staff.dashboard');
        }
        
        // Default to client dashboard
        return redirect()->route('client.dashboard');
    }
    
    /**
     * Check if user is admin
     */
    private function isAdmin($user): bool
    {
        return $user && ($user->role === 'admin' || $user->is_admin);
    }
    
    /**
     * Check if user is staff
     */
    private function isStaff($user): bool
    {
        // Use the User model's isStaff() method or check against all staff roles
        if ($user && method_exists($user, 'isStaff')) {
            return $user->isStaff();
        }
        
        // Fallback: check against all staff roles defined in User model
        return $user && in_array($user->role, User::STAFF_ROLES ?? [
            'staff',
            'front_desk', 
            'housekeeping', 
            'maintenance', 
            'security'
        ]);
    }
}