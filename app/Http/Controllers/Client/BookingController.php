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

        return Inertia::render('public/rooms/index', [
            'booking' => $booking,
        ]);
    }

   /**
 * Store a new booking
 */
public function store(Request $request)
{
    $user = Auth::user();

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

    $notificationEmail = $user ? $user->email : $request->guest_email;

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

    // FIXED: Check for conflicting bookings with correct date overlap logic
    $checkIn = Carbon::parse($request->check_in);
    $checkOut = Carbon::parse($request->check_out);
    
    $conflictingBookings = Booking::where('room_id', $request->room_id)
        ->whereIn('status', ['confirmed', 'pending'])
        ->where(function ($query) use ($checkIn, $checkOut) {
            // Case 1: New booking starts during existing booking
            $query->where(function ($q) use ($checkIn, $checkOut) {
                $q->where('check_in', '<', $checkIn)
                  ->where('check_out', '>', $checkIn);
            })
            // Case 2: New booking ends during existing booking
            ->orWhere(function ($q) use ($checkIn, $checkOut) {
                $q->where('check_in', '<', $checkOut)
                  ->where('check_out', '>', $checkOut);
            })
            // Case 3: New booking completely contains existing booking
            ->orWhere(function ($q) use ($checkIn, $checkOut) {
                $q->where('check_in', '>=', $checkIn)
                  ->where('check_out', '<=', $checkOut);
            })
            // Case 4: Existing booking completely contains new booking
            ->orWhere(function ($q) use ($checkIn, $checkOut) {
                $q->where('check_in', '<=', $checkIn)
                  ->where('check_out', '>=', $checkOut);
            });
        })
        ->exists();

    if ($conflictingBookings) {
        return back()->withErrors(['dates' => 'Room is not available for the selected dates.']);
    }

    // Calculate total amount
    $nights = $checkIn->diffInDays($checkOut);
    if ($nights <= 0) {
        return back()->withErrors(['dates' => 'Check-out date must be after check-in date.']);
    }
    
    $totalAmount = $nights * $room->price_per_night;

    try {
        DB::beginTransaction();

        $booking = Booking::create([
            'user_id' => Auth::id(),
            'room_id' => $request->room_id,
            'guest_name' => $request->guest_name,
            'guest_email' => $request->guest_email,
            'guest_phone' => $request->guest_phone,
            'check_in' => $checkIn->format('Y-m-d'),
            'check_out' => $checkOut->format('Y-m-d'),
            'adults' => $request->adults,
            'children' => $request->children ?? 0,
            'room_type' => $room->type,
            'room_price' => $room->price_per_night,
            'total_amount' => $totalAmount,
            'status' => 'pending',
            'special_requests' => $request->special_requests,
            'booking_source' => 'website',
            'notification_email' => $notificationEmail,
        ]);

        DB::commit();

        // Redirect to confirmation page
        return redirect()->route('bookings.confirmation', $booking);

    } catch (\Exception $e) {
        DB::rollBack();
        
        // Log the error for debugging
        \Log::error('Booking creation failed: ' . $e->getMessage(), [
            'request_data' => $request->all(),
            'user_id' => Auth::id(),
            'error' => $e->getTraceAsString()
        ]);
        
        return back()->withErrors(['error' => 'Failed to create booking. Please try again.']);
    }
}

public function confirmation(Booking $booking): Response
{
    // Ensure user can only view their own booking confirmation
    if ($booking->user_id !== Auth::id()) {
        abort(403);
    }

    $booking->load('room:id,name,type,images');

    return Inertia::render('confirmation/booking/index', [
        'booking' => $booking,
    ]);
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

    $checkIn = Carbon::parse($request->check_in);
    $checkOut = Carbon::parse($request->check_out);

    $conflictingBookings = Booking::where('room_id', $request->room_id)
        ->whereIn('status', ['confirmed', 'pending'])
        ->where(function ($query) use ($checkIn, $checkOut) {
            // Case 1: New booking starts during existing booking
            $query->where(function ($q) use ($checkIn, $checkOut) {
                $q->where('check_in', '<', $checkIn)
                  ->where('check_out', '>', $checkIn);
            })
            // Case 2: New booking ends during existing booking
            ->orWhere(function ($q) use ($checkIn, $checkOut) {
                $q->where('check_in', '<', $checkOut)
                  ->where('check_out', '>', $checkOut);
            })
            // Case 3: New booking completely contains existing booking
            ->orWhere(function ($q) use ($checkIn, $checkOut) {
                $q->where('check_in', '>=', $checkIn)
                  ->where('check_out', '<=', $checkOut);
            })
            // Case 4: Existing booking completely contains new booking
            ->orWhere(function ($q) use ($checkIn, $checkOut) {
                $q->where('check_in', '<=', $checkIn)
                  ->where('check_out', '>=', $checkOut);
            });
        })
        ->exists();

    return response()->json([
        'available' => !$conflictingBookings,
        'message' => $conflictingBookings ? 'Room is not available for selected dates' : 'Room is available'
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
    /**
 * Cancel a booking
 */
public function destroy(Booking $booking)
{
    // Ensure user can only cancel their own bookings
    if ($booking->user_id !== Auth::id()) {
        abort(403);
    }

    // Check if booking can be cancelled
    if (!in_array($booking->status, ['pending', 'confirmed'])) {
        return back()->withErrors(['error' => 'This booking cannot be cancelled.']);
    }

    // Check if check-in date is in the future
    if (Carbon::parse($booking->check_in)->isPast()) {
        return back()->withErrors(['error' => 'Cannot cancel booking after check-in date.']);
    }

    try {
        $booking->update(['status' => 'cancelled']);
        
        return redirect()->route('bookings.index')->with('success', 'Booking cancelled successfully.');
    } catch (\Exception $e) {
        \Log::error('Booking cancellation failed: ' . $e->getMessage());
        return back()->withErrors(['error' => 'Failed to cancel booking. Please try again.']);
    }
}
}