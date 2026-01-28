<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class RoomAvailabilityController extends Controller
{
    /**
     * Check room availability for given dates
     */
    public function checkAvailability(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
            'room_type' => 'nullable|string|in:single,double,suite,family,deluxe',
            'adults' => 'required|integer|min:1',
            'children' => 'nullable|integer|min:0',
        ]);

        $checkIn = Carbon::parse($validated['check_in']);
        $checkOut = Carbon::parse($validated['check_out']);

        // Get all rooms, optionally filtered by type
        $query = Room::where('is_active', true)
                     ->where('is_available', true);

        if (!empty($validated['room_type'])) {
            $query->where('type', $validated['room_type']);
        }

        // Filter by capacity
        $totalGuests = $validated['adults'] + ($validated['children'] ?? 0);
        $query->where('capacity', '>=', $totalGuests);

        $rooms = $query->get();

        // Check which rooms are available
        $availableRooms = $rooms->filter(function ($room) use ($checkIn, $checkOut) {
            return $this->isRoomAvailable($room->id, $checkIn, $checkOut);
        });

        return response()->json([
            'success' => true,
            'available' => $availableRooms->count() > 0,
            'available_rooms_count' => $availableRooms->count(),
            'rooms' => $availableRooms->map(function ($room) use ($checkIn, $checkOut) {
                $nights = $checkIn->diffInDays($checkOut);
                return [
                    'id' => $room->id,
                    'name' => $room->name,
                    'type' => $room->type,
                    'number' => $room->number,
                    'capacity' => $room->capacity,
                    'beds' => $room->beds,
                    'size' => $room->size,
                    'price_per_night' => (float) $room->price_per_night,
                    'total_price' => (float) ($room->price_per_night * $nights),
                    'nights' => $nights,
                    'amenities' => $room->amenities,
                    'images' => $room->images,
                    'description' => $room->description,
                ];
            })->values(),
        ]);
    }

    /**
     * Check if a specific room is available for the given dates
     */
    private function isRoomAvailable(int $roomId, Carbon $checkIn, Carbon $checkOut): bool
    {
        // Check for overlapping bookings
        $overlappingBookings = Booking::where('room_id', $roomId)
            ->whereIn('status', ['confirmed', 'pending']) // Only check confirmed/pending bookings
            ->where(function ($query) use ($checkIn, $checkOut) {
                // Check for any overlap
                $query->where(function ($q) use ($checkIn, $checkOut) {
                    // New booking starts during existing booking
                    $q->whereBetween('check_in', [$checkIn, $checkOut->subDay()])
                      ->orWhereBetween('check_out', [$checkIn->addDay(), $checkOut]);
                })
                ->orWhere(function ($q) use ($checkIn, $checkOut) {
                    // New booking completely contains existing booking
                    $q->where('check_in', '>=', $checkIn)
                      ->where('check_out', '<=', $checkOut);
                })
                ->orWhere(function ($q) use ($checkIn, $checkOut) {
                    // Existing booking completely contains new booking
                    $q->where('check_in', '<=', $checkIn)
                      ->where('check_out', '>=', $checkOut);
                });
            })
            ->exists();

        return !$overlappingBookings;
    }

    /**
     * Get available room types for given dates
     */
    public function getAvailableRoomTypes(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
        ]);

        $checkIn = Carbon::parse($validated['check_in']);
        $checkOut = Carbon::parse($validated['check_out']);

        $roomTypes = ['single', 'double', 'suite', 'family', 'deluxe'];
        $availability = [];

        foreach ($roomTypes as $type) {
            $rooms = Room::where('type', $type)
                        ->where('is_active', true)
                        ->where('is_available', true)
                        ->get();

            $availableCount = $rooms->filter(function ($room) use ($checkIn, $checkOut) {
                return $this->isRoomAvailable($room->id, $checkIn, $checkOut);
            })->count();

            if ($availableCount > 0) {
                $availability[] = [
                    'type' => $type,
                    'available_count' => $availableCount,
                    'min_price' => (float) $rooms->min('price_per_night'),
                ];
            }
        }

        return response()->json([
            'success' => true,
            'room_types' => $availability,
        ]);
    }
    /**
 * Get all booked dates within a date range
 */
public function getBookedDates(Request $request): JsonResponse
{
    $validated = $request->validate([
        'start_date' => 'required|date',
        'end_date' => 'required|date|after_or_equal:start_date',
    ]);

    $startDate = Carbon::parse($validated['start_date']);
    $endDate = Carbon::parse($validated['end_date']);

    // Get all bookings in the date range
    $bookings = Booking::whereIn('status', ['confirmed', 'pending'])
        ->where(function ($query) use ($startDate, $endDate) {
            $query->whereBetween('check_in', [$startDate, $endDate])
                  ->orWhereBetween('check_out', [$startDate, $endDate])
                  ->orWhere(function ($q) use ($startDate, $endDate) {
                      $q->where('check_in', '<=', $startDate)
                        ->where('check_out', '>=', $endDate);
                  });
        })
        ->get();

    // Generate all booked dates
    $bookedDates = [];
    foreach ($bookings as $booking) {
        $current = Carbon::parse($booking->check_in);
        $checkOut = Carbon::parse($booking->check_out);
        
        while ($current->lte($checkOut)) {
            $bookedDates[] = $current->format('Y-m-d');
            $current->addDay();
        }
    }

    return response()->json([
        'success' => true,
        'booked_dates' => array_unique($bookedDates),
    ]);
}
}