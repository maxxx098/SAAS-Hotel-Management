<?php
// app/Http/Controllers/Client/BookingController.php
namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class BookingController extends Controller
{
    /**
     * Display user's bookings
     */
    public function index(Request $request): Response
    {
        $query = Booking::with('room:id,name,type,images')
            ->where('user_id', Auth::id());

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $bookings = $query->orderBy('created_at', 'desc')
                         ->paginate(10)
                         ->withQueryString();

        return Inertia::render('dashboard/user/bookings/index', [
            'bookings' => $bookings,
            'filters' => $request->only(['status']),
        ]);
    }

    /**
     * Show booking details
     */
    public function show(Booking $booking): Response
    {
        // Ensure user can only view their own bookings
        if ($booking->user_id !== Auth::id()) {
            abort(403);
        }

        $booking->load('room:id,name,type,description,images,amenities');

        return Inertia::render('bookings/show', [
            'booking' => $booking,
        ]);
    }

   /**
 * Store a new booking
 */
public function store(Request $request)
{
    $request->validate([
        'room_id' => 'required|exists:rooms,id',
        'check_in' => 'required|date|after:today',
        'check_out' => 'required|date|after:check_in',
        'adults' => 'required|integer|min:1|max:10',
        'children' => 'nullable|integer|min:0|max:10',
        'guest_name' => 'required|string|max:255',
        'guest_email' => 'required|email|max:255',
        'guest_phone' => 'required|string|max:20',
        'special_requests' => 'nullable|string|max:1000',
    ]);

    $room = Room::findOrFail($request->room_id);

    // Check if room is available
    if (!$room->is_available || !$room->is_active) {
        return back()->withErrors(['room' => 'Room is not available for booking.']);
    }

    // Check room capacity
    $totalGuests = $request->adults + ($request->children ?? 0);
    if ($totalGuests > $room->capacity) {
        return back()->withErrors(['capacity' => 'Number of guests exceeds room capacity.']);
    }

    // Check for conflicting bookings
    $conflictingBookings = Booking::where('room_id', $request->room_id)
        ->whereIn('status', ['confirmed', 'pending'])
        ->where(function ($query) use ($request) {
            $query->whereBetween('check_in', [$request->check_in, $request->check_out])
                  ->orWhereBetween('check_out', [$request->check_in, $request->check_out])
                  ->orWhere(function ($q) use ($request) {
                      $q->where('check_in', '<=', $request->check_in)
                        ->where('check_out', '>=', $request->check_out);
                  });
        })
        ->exists();

    if ($conflictingBookings) {
        return back()->withErrors(['dates' => 'Room is not available for the selected dates.']);
    }

    // Calculate total amount
    $checkIn = Carbon::parse($request->check_in);
    $checkOut = Carbon::parse($request->check_out);
    $nights = $checkIn->diffInDays($checkOut);
    $totalAmount = $nights * $room->price_per_night;

    try {
        DB::beginTransaction();

        $booking = Booking::create([
            'user_id' => Auth::id(),
            'room_id' => $request->room_id,
            'guest_name' => $request->guest_name,
            'guest_email' => $request->guest_email,
            'guest_phone' => $request->guest_phone,
            'check_in' => $request->check_in,
            'check_out' => $request->check_out,
            'adults' => $request->adults,
            'children' => $request->children ?? 0,
            'room_type' => $room->type,
            'room_price' => $room->price_per_night,
            'total_amount' => $totalAmount,
            'status' => 'pending',
            'special_requests' => $request->special_requests,
            'booking_source' => 'website',
        ]);

        DB::commit();

        // For Inertia.js, use redirect with route name
        return redirect()->route('bookings.show', $booking)
                       ->with('success', 'Booking submitted successfully! We will confirm your reservation shortly.');

    } catch (\Exception $e) {
        DB::rollBack();
        return back()->withErrors(['error' => 'Failed to create booking. Please try again.']);
    }
}
    /**
     * Check room availability for given dates
     */
    public function checkAvailability(Request $request)
    {
        $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'check_in' => 'required|date|after:today',
            'check_out' => 'required|date|after:check_in',
        ]);

        $conflictingBookings = Booking::where('room_id', $request->room_id)
            ->whereIn('status', ['confirmed', 'pending'])
            ->where(function ($query) use ($request) {
                $query->whereBetween('check_in', [$request->check_in, $request->check_out])
                      ->orWhereBetween('check_out', [$request->check_in, $request->check_out])
                      ->orWhere(function ($q) use ($request) {
                          $q->where('check_in', '<=', $request->check_in)
                            ->where('check_out', '>=', $request->check_out);
                      });
            })
            ->exists();

        return response()->json([
            'available' => !$conflictingBookings,
        ]);
    }

    /**
     * Get booking statistics for dashboard
     */
    public function stats()
    {
        $userId = Auth::id();
        
        $stats = [
            'total_bookings' => Booking::where('user_id', $userId)->count(),
            'confirmed_bookings' => Booking::where('user_id', $userId)->where('status', 'confirmed')->count(),
            'pending_bookings' => Booking::where('user_id', $userId)->where('status', 'pending')->count(),
            'upcoming_bookings' => Booking::where('user_id', $userId)
                ->where('status', 'confirmed')
                ->where('check_in', '>', now())
                ->count(),
        ];

        return response()->json($stats);
    }
}