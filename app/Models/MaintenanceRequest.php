<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceRequest extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'description',
        'priority',
        'status',
        'location',
        'room_id',
        'reported_by',
        'assigned_to',
        'estimated_time',
        'completed_at',
        'notes',
        'category',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'completed_at' => 'datetime',
        'estimated_time' => 'integer',
    ];

    /**
     * Available maintenance request statuses
     */
    public const STATUSES = [
        'pending' => 'Pending',
        'in_progress' => 'In Progress',
        'completed' => 'Completed',
        'cancelled' => 'Cancelled',
        'on_hold' => 'On Hold',
    ];

    /**
     * Available maintenance request priorities
     */
    public const PRIORITIES = [
        'low' => 'Low',
        'medium' => 'Medium',
        'high' => 'High',
        'urgent' => 'Urgent',
    ];

    /**
     * Available maintenance categories
     */
    public const CATEGORIES = [
        'plumbing' => 'Plumbing',
        'electrical' => 'Electrical',
        'hvac' => 'HVAC',
        'carpentry' => 'Carpentry',
        'painting' => 'Painting',
        'cleaning' => 'Cleaning',
        'appliance' => 'Appliance',
        'furniture' => 'Furniture',
        'security' => 'Security',
        'other' => 'Other',
    ];

    /**
     * Get the room that this maintenance request belongs to.
     */
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    /**
     * Get the user who reported this maintenance request.
     */
    public function reportedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by');
    }

    /**
     * Get the staff member assigned to this maintenance request.
     */
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Check if the maintenance request is pending
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if the maintenance request is in progress
     */
    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    /**
     * Check if the maintenance request is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Check if the maintenance request is high priority or urgent
     */
    public function isHighPriority(): bool
    {
        return in_array($this->priority, ['high', 'urgent']);
    }

    /**
     * Get the status display name
     */
    public function getStatusDisplayName(): string
    {
        return self::STATUSES[$this->status] ?? 'Unknown';
    }

    /**
     * Get the priority display name
     */
    public function getPriorityDisplayName(): string
    {
        return self::PRIORITIES[$this->priority] ?? 'Unknown';
    }

    /**
     * Get the category display name
     */
    public function getCategoryDisplayName(): string
    {
        return self::CATEGORIES[$this->category] ?? 'Other';
    }

    /**
     * Mark the maintenance request as completed
     */
    public function markAsCompleted(): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }

    /**
     * Assign the maintenance request to a staff member
     */
    public function assignTo(User $user): void
    {
        $this->update([
            'assigned_to' => $user->id,
            'status' => $this->status === 'pending' ? 'in_progress' : $this->status,
        ]);
    }

    /**
     * Scope to get pending requests
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope to get in progress requests
     */
    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    /**
     * Scope to get completed requests
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope to get high priority requests
     */
    public function scopeHighPriority($query)
    {
        return $query->whereIn('priority', ['high', 'urgent']);
    }

    /**
     * Scope to get requests assigned to a specific user
     */
    public function scopeAssignedTo($query, $userId)
    {
        return $query->where('assigned_to', $userId);
    }

    /**
     * Scope to get requests for a specific room
     */
    public function scopeForRoom($query, $roomId)
    {
        return $query->where('room_id', $roomId);
    }

    /**
     * Scope to get requests by category
     */
    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope to get recent requests (within last 30 days)
     */
    public function scopeRecent($query)
    {
        return $query->where('created_at', '>=', now()->subDays(30));
    }

    /**
     * Scope to get overdue requests (created more than 24 hours ago and still pending/in progress)
     */
    public function scopeOverdue($query)
    {
        return $query->whereIn('status', ['pending', 'in_progress'])
                    ->where('created_at', '<', now()->subHours(24));
    }
}