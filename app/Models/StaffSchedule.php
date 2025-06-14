<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class StaffSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'staff_id',
        'date',
        'shift_start',
        'shift_end',
        'break_start',
        'break_end',
        'status',
        'clock_in_time',
        'clock_out_time',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'shift_start' => 'datetime:H:i',
        'shift_end' => 'datetime:H:i',
        'break_start' => 'datetime:H:i',
        'break_end' => 'datetime:H:i',
        'clock_in_time' => 'datetime',
        'clock_out_time' => 'datetime',
    ];

    const STATUSES = [
        'scheduled' => 'Scheduled',
        'on_duty' => 'On Duty',
        'on_break' => 'On Break',
        'off_duty' => 'Off Duty',
        'absent' => 'Absent',
    ];

    // Relationships
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
        return $query->whereDate('date', Carbon::today());
    }

    public function scopeForDate($query, $date)
    {
        return $query->whereDate('date', $date);
    }

    public function scopeThisWeek($query)
    {
        return $query->whereBetween('date', [
            Carbon::now()->startOfWeek(),
            Carbon::now()->endOfWeek()
        ]);
    }

    // Methods
    public function clockIn()
    {
        $this->update([
            'status' => 'on_duty',
            'clock_in_time' => now(),
        ]);
    }

    public function clockOut()
    {
        $this->update([
            'status' => 'off_duty',
            'clock_out_time' => now(),
        ]);
    }

    public function startBreak()
    {
        $this->update(['status' => 'on_break']);
    }

    public function endBreak()
    {
        $this->update(['status' => 'on_duty']);
    }

    public function getTotalHoursAttribute(): float
    {
        if ($this->clock_in_time && $this->clock_out_time) {
            return $this->clock_in_time->diffInHours($this->clock_out_time);
        }

        if ($this->clock_in_time) {
            return $this->clock_in_time->diffInHours(now());
        }

        return 0;
    }
}