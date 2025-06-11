<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use App\Mail\BookingConfirmed;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Exception;

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
                    'room_price' => (float) $booking->room_price,
                    'nights' => $booking->check_in->diffInDays($booking->check_out),
                    'total_amount' => (float) $booking->total_amount,
                    'status' => $booking->status,
                    'booking_date' => $booking->created_at->format('Y-m-d'),
                    'special_requests' => $booking->special_requests,
                    'booking_source' => $booking->booking_source ?? 'website',
                ];
            });

        // Calculate statistics with proper data types
        $confirmedBookings = $bookings->where('status', 'confirmed');
        $totalRevenue = $confirmedBookings->sum('total_amount');
        $avgBookingValue = $confirmedBookings->count() > 0 ? $totalRevenue / $confirmedBookings->count() : 0;

        $stats = [
            'totalBookings' => $bookings->count(),
            'pendingBookings' => $bookings->where('status', 'pending')->count(),
            'confirmedBookings' => $confirmedBookings->count(),
            'rejectedBookings' => $bookings->where('status', 'rejected')->count(),
            'totalRevenue' => (float) $totalRevenue,
            'avgBookingValue' => (float) $avgBookingValue,
            'todayRequests' => $bookings->where('booking_date', now()->format('Y-m-d'))->count(),
            'todayProcessed' => $bookings->whereIn('status', ['confirmed', 'rejected'])
                ->where('booking_date', now()->format('Y-m-d'))->count(),
        ];

        return Inertia::render('dashboard/admin/bookings/index', [
            'bookings' => $bookings->values(),
            'stats' => $stats,
        ]);
    }

    /**
     * Update booking status.
     */
    public function updateStatus(Request $request, Booking $booking): JsonResponse
    {
        try {
            // Validate the request
            $validated = $request->validate([
                'status' => 'required|in:pending,confirmed,rejected',
            ]);

            // Log the attempt
            Log::info('Attempting to update booking status', [
                'booking_id' => $booking->id,
                'old_status' => $booking->status,
                'new_status' => $validated['status'],
                'user_id' => auth()->id(),
            ]);

            // Start a database transaction
            DB::beginTransaction();

            // Update the booking
            $booking->update([
                'status' => $validated['status'],
                'updated_at' => now(),
            ]);

            // Send confirmation email if status is confirmed
           if ($validated['status'] === 'confirmed') {
                try {
                    // Better email priority logic
                    $emailAddress = null;
                    
                    // If user exists and has an email, use that (Google auth email)
                    if ($booking->user && $booking->user->email) {
                        $emailAddress = $booking->user->email;
                        $emailSource = 'user_account';
                    } 
                    // Otherwise fall back to guest email
                    else if ($booking->guest_email) {
                        $emailAddress = $booking->guest_email;
                        $emailSource = 'guest_form';
                    }
                    
                    if ($emailAddress) {
                        Log::info('Sending confirmation email', [
                            'booking_id' => $booking->id,
                            'email' => $emailAddress,
                            'email_source' => $emailSource,
                            'user_id' => $booking->user_id,
                            'user_google_id' => $booking->user->google_id ?? null,
                        ]);
                        
                        // Verify email format before sending
                        if (!filter_var($emailAddress, FILTER_VALIDATE_EMAIL)) {
                            Log::error('Invalid email format', [
                                'booking_id' => $booking->id,
                                'email' => $emailAddress,
                            ]);
                            throw new \Exception('Invalid email format: ' . $emailAddress);
                        }
                        
                        // Send the email
                        Mail::to($emailAddress)->send(new BookingConfirmed($booking));
                        
                        Log::info('Email sent successfully', [
                            'booking_id' => $booking->id,
                            'email' => $emailAddress,
                            'email_source' => $emailSource,
                        ]);
                    } else {
                        Log::warning('No valid email address found for booking', [
                            'booking_id' => $booking->id,
                            'user_id' => $booking->user_id,
                            'guest_email' => $booking->guest_email,
                            'user_email' => $booking->user->email ?? 'N/A',
                        ]);
                    }
                } catch (Exception $e) {
                    Log::error('Failed to send confirmation email', [
                        'booking_id' => $booking->id,
                        'email' => $emailAddress ?? 'unknown',
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString(),
                    ]);
                    // Don't fail the booking update if email fails
                }
            }

            // Commit the transaction
            DB::commit();

            Log::info('Booking status updated successfully', [
                'booking_id' => $booking->id,
                'new_status' => $booking->status,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Booking status updated successfully',
                'csrf_token' => csrf_token(), 
                'booking' => [
                    'id' => $booking->id,
                    'status' => $booking->status,
                    'updated_at' => $booking->updated_at->toISOString(),
                ],
            ], 200);


        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Invalid status provided',
                'errors' => $e->errors(),
            ], 422);

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Failed to update booking status', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update booking status. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Get booking details.
     */
    public function show(Booking $booking): JsonResponse
    {
        try {
            $booking->load(['user', 'room']);
            
            return response()->json([
                'success' => true,
                'booking' => [
                    'id' => $booking->id,
                    'guest_name' => $booking->user->name ?? $booking->guest_name,
                    'guest_email' => $booking->user->email ?? $booking->guest_email,
                    'guest_phone' => $booking->guest_phone,
                    'check_in' => $booking->check_in->format('Y-m-d'),
                    'check_out' => $booking->check_out->format('Y-m-d'),
                    'adults' => $booking->adults,
                    'children' => $booking->children,
                    'room_type' => $booking->room->name ?? $booking->room_type,
                    'room_price' => (float) $booking->room_price,
                    'nights' => $booking->check_in->diffInDays($booking->check_out),
                    'total_amount' => (float) $booking->total_amount,
                    'status' => $booking->status,
                    'booking_date' => $booking->created_at->format('Y-m-d'),
                    'special_requests' => $booking->special_requests,
                    'booking_source' => $booking->booking_source ?? 'website',
                ],
            ]);
        } catch (Exception $e) {
            Log::error('Failed to fetch booking details', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch booking details',
            ], 500);
        }
    }

    /**
     * Get dashboard statistics.
     */
    public function stats(): JsonResponse
    {
        try {
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
                'success' => true,
                'stats' => [
                    'totalBookings' => (int) $stats->total_bookings,
                    'pendingBookings' => (int) $stats->pending_bookings,
                    'confirmedBookings' => (int) $stats->confirmed_bookings,
                    'rejectedBookings' => (int) $stats->rejected_bookings,
                    'totalRevenue' => (float) ($stats->total_revenue ?? 0),
                    'avgBookingValue' => (float) ($stats->avg_booking_value ?? 0),
                    'todayRequests' => (int) $stats->today_requests,
                    'todayProcessed' => (int) $stats->today_processed,
                ],
            ]);
        } catch (Exception $e) {
            Log::error('Failed to fetch booking statistics', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics',
            ], 500);
        }
    }
}