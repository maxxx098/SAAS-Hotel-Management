<?php
// app/Http/Controllers/RoomController.php
namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\Booking;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class RoomController extends Controller
{
    /**
     * Display available rooms for public viewing
     */
        public function index(Request $request): Response
        {
            $query = Room::where('is_active', true);

            // Search
            if ($request->filled('search')) {
                $query->where(function ($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('type', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%');
                });
            }

            // Filter by type
            if ($request->filled('type')) {
                $query->where('type', $request->type);
            }

            // Filter by availability
            if ($request->filled('availability')) {
                if ($request->availability === 'available') {
                    $query->where('is_available', true);
                } elseif ($request->availability === 'unavailable') {
                    $query->where('is_available', false);
                }
            }

            // 🔥 Filter by popularity
            if ($request->filled('popular') && $request->popular === 'true') {
                $query->where('is_popular', true);
            }

            // Ordering (popular first, then availability, then newest)
            $rooms = $query->orderBy('is_popular', 'desc')
                        ->orderBy('is_available', 'desc')
                        ->orderBy('created_at', 'desc')
                        ->paginate(12)
                        ->withQueryString();

            return Inertia::render('public/rooms/index', [
                'rooms' => $rooms,
                'filters' => $request->only(['search', 'type', 'availability', 'popular']),
                'roomTypes' => ['single', 'double', 'suite', 'family', 'deluxe'],
            ]);
        }

    /**
     * Display a specific room with booking availability
     */
    public function show(Room $room): Response
    {
        // Only show active rooms to the public
        if (!$room->is_active) {
            abort(404);
        }

        // Get related rooms
        $relatedRooms = Room::where('is_active', true)
            ->where('type', $room->type)
            ->where('id', '!=', $room->id)
            ->limit(3)
            ->get(['id', 'name', 'price_per_night', 'images', 'type']);

        // Get unavailable dates for the next 6 months
        $unavailableDates = Booking::where('room_id', $room->id)
            ->whereIn('status', ['confirmed', 'pending'])
            ->where('check_out', '>=', now())
            ->where('check_in', '<=', now()->addMonths(6))
            ->get(['check_in', 'check_out'])
            ->map(function ($booking) {
                $dates = [];
                $current = Carbon::parse($booking->check_in);
                $end = Carbon::parse($booking->check_out);
                
                while ($current->lt($end)) {
                    $dates[] = $current->format('Y-m-d');
                    $current->addDay();
                }
                
                return $dates;
            })
            ->flatten()
            ->unique()
            ->values();

        return Inertia::render('public/rooms/show', [
            'room' => $room,
            'relatedRooms' => $relatedRooms,
            'unavailableDates' => $unavailableDates,
        ]);
    }
}