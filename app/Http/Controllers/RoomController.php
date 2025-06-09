<?php
// app/Http/Controllers/RoomController.php
// This is for the public-facing rooms page

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RoomController extends Controller
{
    /**
     * Display available rooms for public viewing
     */
    public function index(Request $request): Response
    {
        $query = Room::where('is_active', true);

        // Search functionality
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

        // Default to showing available rooms first
        $rooms = $query->orderBy('is_available', 'desc')
                      ->orderBy('created_at', 'desc')
                      ->paginate(12)
                      ->withQueryString();

        return Inertia::render('rooms', [
            'rooms' => $rooms,
            'filters' => $request->only(['search', 'type', 'availability']),
            'roomTypes' => ['single', 'double', 'suite', 'family', 'deluxe'],
        ]);
    }

    /**
     * Display a specific room
     */
    public function show(Room $room): Response
    {
        // Only show active rooms to the public
        if (!$room->is_active) {
            abort(404);
        }

        return Inertia::render('Rooms/Show', [
            'room' => $room,
            'relatedRooms' => Room::where('is_active', true)
                ->where('type', $room->type)
                ->where('id', '!=', $room->id)
                ->limit(3)
                ->get(),
        ]);
    }
}