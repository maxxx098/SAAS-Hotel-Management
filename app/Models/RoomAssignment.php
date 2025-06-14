<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class RoomAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_id',
        'staff_id',
        'assigned_date',
        'status',
        'cleaning_type',
        'started_at',
        'completed_at',
        'notes',
        'checklist_items',
    ];

    protected $casts = [
        'assigned_date' => 'date',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'checklist_items' => 'array',
    ];

    const STATUSES = [
        'assigned' => 'Assigned',
        'in_progress' => 'In Progress',
        'completed' => 'Completed',
        'skipped' => 'Skipped',
    ];

    const CLEANING_TYPES = [
        'checkout' => 'Post-Checkout Cleaning',
        'maintenance' => 'Maintenance Cleaning',
        'deep_clean' => 'Deep Cleaning',
        'inspection' => 'Inspection',
    ];

    // Relationships
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function staff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'staff_id');
    }

    // Scopes
    public function scopeForStaff($query, $staffId)
    {
        return $query->where('staff_id', $staffId);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('assigned_date', Carbon::today());
    }

    public function scopeForDate($query, $date)
    {
        return $query->whereDate('assigned_date', $date);
    }

    // Methods
    public function start()
    {
        $this->update([
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        // Update room status
        $this->room->update(['cleaning_status' => 'in_progress']);
    }

    public function complete($notes = null, $checklistItems = null)
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
            'notes' => $notes,
            'checklist_items' => $checklistItems,
        ]);

        // Update room status
        $this->room->update([
            'cleaning_status' => 'clean',
            'last_cleaned' => now(),
            'last_cleaned_by' => $this->staff_id,
        ]);
    }
}