<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'username', // Added username field
        'password',
        'role',
        'department',
        'employee_id',
        'phone', // Added phone field
        'google_id', // Add this for Google OAuth
        'hire_date', // Add hire_date field
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'google_id', // Hide Google ID from JSON responses
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'hire_date' => 'date',
        ];
    }

    /**
     * Available user roles
     */
    public const ROLES = [
        'admin' => 'Administrator',
        'front_desk' => 'Front Desk',
        'housekeeping' => 'Housekeeping',
        'maintenance' => 'Maintenance',
        'general_staff' => 'General Staff',
        'security' => 'Security',
        'staff' => 'General Staff',
        'user' => 'Guest',
    ];

    /**
     * Staff roles (excluding admin and regular users)
     */
    public const STAFF_ROLES = [
        'front_desk',
        'housekeeping',
        'maintenance',
        'security',
        'staff',
        'general_staff',
    ];

    /**
     * Check if user is admin
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is staff (any staff role)
     */
    public function isStaff(): bool
    {
        return in_array($this->role, self::STAFF_ROLES) || $this->isAdmin();
    }

    /**
     * Check if user has specific role
     */
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    /**
     * Check if user has any of the given roles
     */
    public function hasAnyRole(array $roles): bool
    {
        return in_array($this->role, $roles);
    }

    /**
     * Get user role display name
     */
    public function getRoleDisplayName(): string
    {
        return self::ROLES[$this->role] ?? 'Unknown';
    }

    /**
     * Check if user can access staff dashboard
     */
    public function canAccessStaffDashboard(): bool
    {
        return $this->isStaff();
    }

    /**
     * Check if user can access admin panel
     */
    public function canAccessAdminPanel(): bool
    {
        return $this->isAdmin();
    }

    /**
     * Get staff department
     */
    public function getDepartment(): string
    {
        // Return custom department if set, otherwise map from role
        return $this->department ?? match($this->role) {
            'front_desk' => 'Front Desk',
            'general_staff' => 'General Staff',
            'housekeeping' => 'Housekeeping',
            'maintenance' => 'Maintenance',
            'security' => 'Security',
            'staff' => 'General Staff',
            'admin' => 'Administration',
            default => 'General',
        };
    }

    /**
     * Check if user has Google account linked
     */
    public function hasGoogleAccount(): bool
    {
        return !is_null($this->google_id);
    }

    /**
     * Check if user can unlink Google account
     * (only if they have a password set)
     */
    public function canUnlinkGoogle(): bool
    {
        return $this->hasGoogleAccount() && !is_null($this->password);
    }

    /**
     * Override findForPassport to allow login with username OR employee_id
     * This is used by Laravel Passport, but also works for regular authentication
     */
    public function findForPassport($username)
    {
        return $this->where('username', $username)
                   ->orWhere('employee_id', $username)
                   ->first();
    }

    /**
     * Get user's login identifier (username or employee_id)
     */
    public function getLoginIdentifier(): string
    {
        return $this->username ?? $this->employee_id ?? $this->email;
    }

    /**
     * Get the user's activity logs.
     */
    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }

    /**
     * Log an activity for this user.
     */
    public function logActivity(string $type, string $title, string $description = null, array $data = null): ActivityLog
    {
        return ActivityLog::create([
            'user_id' => $this->id,
            'type' => $type,
            'title' => $title,
            'description' => $description,
            'data' => $data,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    /**
     * Get recent activity logs for this user.
     */
    public function getRecentActivities(int $limit = 10): \Illuminate\Database\Eloquent\Collection
    {
        return $this->activityLogs()
                   ->orderBy('created_at', 'desc')
                   ->limit($limit)
                   ->get();
    }

    /**
     * Get activity logs by type.
     */
    public function getActivitiesByType(string $type, int $limit = null): \Illuminate\Database\Eloquent\Collection
    {
        $query = $this->activityLogs()->where('type', $type)->orderBy('created_at', 'desc');
        
        if ($limit) {
            $query->limit($limit);
        }
        
        return $query->get();
    }

    /**
     * Scope to get only staff users
     */
    public function scopeStaff($query)
    {
        return $query->whereIn('role', self::STAFF_ROLES);
    }

    /**
     * Scope to get users by department
     */
    public function scopeByDepartment($query, string $department)
    {
        return $query->where('department', $department)
                    ->orWhere('role', array_search($department, [
                        'front_desk' => 'Front Desk',
                        'general_staff' => 'General Staff',
                        'housekeeping' => 'Housekeeping',
                        'maintenance' => 'Maintenance',
                        'security' => 'Security',
                    ]));
    }

    /**
     * Scope to get users by role
     */
    public function scopeByRole($query, string $role)
    {
        return $query->where('role', $role);
    }

    /**
     * Scope to find user by username or employee_id
     */
    public function scopeByUsernameOrEmployeeId($query, string $identifier)
    {
        return $query->where('username', $identifier)
                    ->orWhere('employee_id', $identifier);
    }
}