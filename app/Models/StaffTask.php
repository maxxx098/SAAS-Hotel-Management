<?php
// app/Models/StaffTask.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class StaffTask extends Model
{
    use HasFactory;

    protected $fillable = [
        'assigned_to',
        'created_by',
        'type',
        'title',
        'description',
        'priority',
        'status',
        'room_id',
        'booking_id',
        'maintenance_request_id',
        'scheduled_at',
        'started_at',
        'completed_at',
        'estimated_duration',
        'actual_duration',
        'metadata',
        'notes',
        'completion_notes',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'metadata' => 'array',
    ];

    const TYPES = [
        // General
        'general' => 'General Task',
        
        // Housekeeping
        'room_cleaning' => 'Room Cleaning',
        'cleaning' => 'General Cleaning',
        'laundry' => 'Laundry Service',
        'maintenance_request' => 'Maintenance Request',
        
        // Maintenance
        'maintenance' => 'Maintenance',
        'repair' => 'Repair Work',
        'inspection' => 'Inspection',
        'preventive_maintenance' => 'Preventive Maintenance',
        
        // Front Desk
        'guest_service' => 'Guest Service',
        'check_in' => 'Guest Check-in',
        'check_out' => 'Guest Check-out',
        'booking_management' => 'Booking Management',
        
        // Security
        'security_check' => 'Security Check',
        'patrol' => 'Security Patrol',
        'incident_report' => 'Incident Report',
        'access_control' => 'Access Control',
    ];

    const PRIORITIES = [
        'low' => 'Low',
        'medium' => 'Medium',
        'high' => 'High',
        'urgent' => 'Urgent',
    ];

    const STATUSES = [
        'pending' => 'Pending',
        'in_progress' => 'In Progress',
        'completed' => 'Completed',
        'cancelled' => 'Cancelled',
    ];

    // Relationships
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function maintenanceRequest(): BelongsTo
    {
        return $this->belongsTo(MaintenanceRequest::class);
    }

    // Scopes
    public function scopeForStaff($query, $staffId)
    {
        return $query->where('assigned_to', $staffId);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('scheduled_at', Carbon::today())
            ->orWhere(function ($q) {
                $q->whereNull('scheduled_at')
                  ->whereDate('created_at', Carbon::today());
            });
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeOverdue($query)
    {
        return $query->where('scheduled_at', '<', now())
            ->whereIn('status', ['pending', 'in_progress']);
    }

    // Methods
    public function start()
    {
        $this->update([
            'status' => 'in_progress',
            'started_at' => now(),
        ]);
    }

    public function complete($notes = null)
    {
        $duration = null;
        if ($this->started_at) {
            $duration = $this->started_at->diffInMinutes(now());
        }

        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
            'actual_duration' => $duration,
            'completion_notes' => $notes,
        ]);
    }

    public function cancel($reason = null)
    {
        $this->update([
            'status' => 'cancelled',
            'completion_notes' => $reason,
        ]);
    }

    public function isOverdue(): bool
    {
        return $this->scheduled_at && 
               $this->scheduled_at->isPast() && 
               in_array($this->status, ['pending', 'in_progress']);
    }

    public function getDurationAttribute(): ?int
    {
        if ($this->completed_at && $this->started_at) {
            return $this->started_at->diffInMinutes($this->completed_at);
        }
        
        if ($this->started_at) {
            return $this->started_at->diffInMinutes(now());
        }

        return null;
    }

    public function getTypeDisplayNameAttribute(): string
    {
        return self::TYPES[$this->type] ?? ucfirst($this->type);
    }

    public function getPriorityDisplayNameAttribute(): string
    {
        return self::PRIORITIES[$this->priority] ?? ucfirst($this->priority);
    }

    public function getStatusDisplayNameAttribute(): string
    {
        return self::STATUSES[$this->status] ?? ucfirst($this->status);
    }
}