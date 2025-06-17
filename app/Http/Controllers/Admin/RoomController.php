<?php
// app/Http/Controllers/Admin/RoomController.php
// Create with: php artisan make:controller Admin/RoomController --resource

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;

class RoomController extends Controller
{
    /**
     * Display a listing of rooms
     */
    public function index(Request $request): Response
    {
        $query = Room::query();

        // Search functionality
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('type', 'like', '%' . $request->search . '%')
                  ->orWhere('number', 'like', '%' . $request->search . '%');
        }

        // Filter by type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Filter by availability
        if ($request->filled('availability')) {
            $query->where('is_available', $request->availability === 'available');
        }

        $rooms = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('dashboard/admin/rooms/index', [
            'rooms' => $rooms,
            'filters' => $request->only(['search', 'type', 'availability']),
            'roomTypes' => ['single', 'double', 'suite', 'family', 'deluxe'],
        ]);
    }

    /**
     * Show the form for creating a new room
     */
    public function create(): Response
    {
        return Inertia::render('dashboard/admin/rooms/create', [
            'roomTypes' => ['single', 'double', 'suite', 'family', 'deluxe'],
            'amenitiesOptions' => [
                'wifi' => 'Wi-Fi',
                'ac' => 'Air Conditioning',
                'tv' => 'Television',
                'mini_bar' => 'Mini Bar',
                'balcony' => 'Balcony',
                'room_service' => 'Room Service',
                'safe' => 'Safe',
                'hair_dryer' => 'Hair Dryer',
                'bathtub' => 'Bathtub',
                'shower' => 'Shower',
            ],
        ]);
    }

    /**
     * Store a newly created room
     */
   public function store(Request $request): RedirectResponse
{
    $validated = $request->validate([
        'number' => 'required|string|max:255|unique:rooms',
        'name' => 'required|string|max:255|unique:rooms',
        'description' => 'nullable|string',
        'type' => 'required|string|in:single,double,suite,family,deluxe',
        'price_per_night' => 'required|numeric|min:0',
        'capacity' => 'required|integer|min:1|max:10',
        'beds' => 'required|integer|min:1|max:5',
        'size' => 'nullable|numeric|min:0',
        'amenities' => 'nullable|array',
        'amenities.*' => 'string',
        'images' => 'nullable|array',
        'images.*' => 'string|url',
        'is_available' => 'boolean',
        'is_active' => 'boolean',
    ]);

   $validated['images'] = $validated['images'] ?? [];

    Room::create($validated);

    return redirect()->route('admin.rooms.index')
        ->with('success', 'Room created successfully.');
}

    /**
     * Display the specified room
     */
    public function show(Room $room): Response
    {
        return Inertia::render('Admin/Rooms/Show', [
            'room' => $room,
        ]);
    }

    /**
     * Show the form for editing the specified room
     */
    public function edit(Room $room): Response
    {
        return Inertia::render('dashboard/admin/rooms/edit', [
            'room' => $room,
            'roomTypes' => ['single', 'double', 'suite', 'family', 'deluxe'],
            'amenitiesOptions' => [
                'wifi' => 'Wi-Fi',
                'ac' => 'Air Conditioning',
                'tv' => 'Television',
                'mini_bar' => 'Mini Bar',
                'balcony' => 'Balcony',
                'room_service' => 'Room Service',
                'safe' => 'Safe',
                'hair_dryer' => 'Hair Dryer',
                'bathtub' => 'Bathtub',
                'shower' => 'Shower',
            ],
        ]);
    }

    /**
     * Update the specified room
     */
    public function update(Request $request, Room $room): RedirectResponse
    {
        $validated = $request->validate([
            'number' => ['required', 'string', 'max:255', Rule::unique('rooms')->ignore($room->id)],
            'name' => ['required', 'string', 'max:255', Rule::unique('rooms')->ignore($room->id)],
            'description' => 'nullable|string',
            'type' => 'required|string|in:single,double,suite,family,deluxe',
            'price_per_night' => 'required|numeric|min:0',
            'capacity' => 'required|integer|min:1|max:10',
            'beds' => 'required|integer|min:1|max:5',
            'size' => 'nullable|numeric|min:0',
            'amenities' => 'nullable|array',
            'amenities.*' => 'string',
            'images' => 'nullable|array',
            'images.*' => 'string|url',
            'is_available' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $room->update($validated);

        return redirect()->route('admin.rooms.index')
            ->with('success', 'Room updated successfully.');
    }

    /**
     * Remove the specified room
     */
    public function destroy(Room $room): RedirectResponse
    {
        $room->delete();

        return redirect()->route('admin.rooms.index')
            ->with('success', 'Room deleted successfully.');
    }
}