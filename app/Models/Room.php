<?php
// app/Models/Room.php
// Create with: php artisan make:model Room

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Room extends Model
{
    use HasFactory;

    protected $fillable = [
        'number',
        'name',
        'description',
        'type',
        'price_per_night',
        'capacity',
        'beds',
        'size',
        'amenities',
        'images',
        'is_available',
        'is_active',
        'is_popular',
    ];

    protected $casts = [
        'amenities' => 'array',
        'images' => 'array',
        'price_per_night' => 'decimal:2',
        'size' => 'decimal:2',
        'is_available' => 'boolean',
        'is_active' => 'boolean',
        'is_popular' => 'boolean',
    ];

    // Accessor for formatted price
    protected function formattedPrice(): Attribute
    {
        return Attribute::make(
            get: fn () => '$' . number_format($this->price_per_night, 2)
        );
    }

    // Scope for active rooms
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Scope for available rooms
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }
}