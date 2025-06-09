<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    /**
     * Display the bookings management page with data.
     */
    public function index(): Response
    {
        $bookings = Booking::with(['user', 'room'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'guest_name' => $booking->user->name ?? $booking->guest_name,
                    'guest_email' => $booking->user->email ?? $booking->guest_email,
                    'guest_phone' => $booking->guest_phone,
                    'check_in' => $booking->check_in->format('Y-m-d'),
                    'check_out' => $booking->check_out->format('Y-m-d'),
                    'adults' => $booking->adults,
                    'children' => $booking->children,
                    'room_type' => $booking->room->name ?? $booking->room_type,
                    'room_price' => $booking->room_price,
                    'nights' => $booking->check_in->diffInDays($booking->check_out),
                    'total_amount' => $booking->total_amount,
                    'status' => $booking->status,
                    'booking_date' => $booking->created_at->format('Y-m-d'),
                    'special_requests' => $booking->special_requests,
                    'booking_source' => $booking->booking_source ?? 'website',
                ];
            });

        // Calculate statistics
        $stats = [
            'totalBookings' => $bookings->count(),
            'pendingBookings' => $bookings->where('status', 'pending')->count(),
            'confirmedBookings' => $bookings->where('status', 'confirmed')->count(),
            'rejectedBookings' => $bookings->where('status', 'rejected')->count(),
            'totalRevenue' => $bookings->where('status', 'confirmed')->sum('total_amount'),
            'avgBookingValue' => $bookings->where('status', 'confirmed')->avg('total_amount') ?? 0,
        ];

        return Inertia::render('dashboard/admin/bookings/index', [
            'bookings' => $bookings,
            'stats' => $stats,
        ]);
    }

    /**
     * Update booking status.
     */
    public function updateStatus(Request $request, Booking $booking): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,rejected',
        ]);

        $booking->update([
            'status' => $request->status,
            'updated_at' => now(),
        ]);

        // You might want to send notifications here
        // if ($request->status === 'confirmed') {
        //     // Send confirmation email
        // } elseif ($request->status === 'rejected') {
        //     // Send rejection email
        // }

        return response()->json([
            'message' => 'Booking status updated successfully',
            'booking' => [
                'id' => $booking->id,
                'status' => $booking->status,
            ],
        ]);
    }

    /**
     * Get booking details.
     */
    public function show(Booking $booking): JsonResponse
    {
        $booking->load(['user', 'room']);
        
        return response()->json([
            'id' => $booking->id,
            'guest_name' => $booking->user->name ?? $booking->guest_name,
            'guest_email' => $booking->user->email ?? $booking->guest_email,
            'guest_phone' => $booking->guest_phone,
            'check_in' => $booking->check_in->format('Y-m-d'),
            'check_out' => $booking->check_out->format('Y-m-d'),
            'adults' => $booking->adults,
            'children' => $booking->children,
            'room_type' => $booking->room->name ?? $booking->room_type,
            'room_price' => $booking->room_price,
            'nights' => $booking->check_in->diffInDays($booking->check_out),
            'total_amount' => $booking->total_amount,
            'status' => $booking->status,
            'booking_date' => $booking->created_at->format('Y-m-d'),
            'special_requests' => $booking->special_requests,
            'booking_source' => $booking->booking_source ?? 'website',
        ]);
    }

    /**
     * Get dashboard statistics.
     */
    public function stats(): JsonResponse
    {
        $stats = DB::table('bookings')
            ->selectRaw('
                COUNT(*) as total_bookings,
                SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending_bookings,
                SUM(CASE WHEN status = "confirmed" THEN 1 ELSE 0 END) as confirmed_bookings,
                SUM(CASE WHEN status = "rejected" THEN 1 ELSE 0 END) as rejected_bookings,
                SUM(CASE WHEN status = "confirmed" THEN total_amount ELSE 0 END) as total_revenue,
                AVG(CASE WHEN status = "confirmed" THEN total_amount ELSE NULL END) as avg_booking_value,
                COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today_requests,
                COUNT(CASE WHEN DATE(updated_at) = CURDATE() AND status != "pending" THEN 1 END) as today_processed
            ')
            ->first();

        return response()->json([
            'totalBookings' => $stats->total_bookings,
            'pendingBookings' => $stats->pending_bookings,
            'confirmedBookings' => $stats->confirmed_bookings,
            'rejectedBookings' => $stats->rejected_bookings,
            'totalRevenue' => $stats->total_revenue ?? 0,
            'avgBookingValue' => $stats->avg_booking_value ?? 0,
            'todayRequests' => $stats->today_requests,
            'todayProcessed' => $stats->today_processed,
        ]);
    }
}