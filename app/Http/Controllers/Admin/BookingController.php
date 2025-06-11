<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Resend\Laravel\Facades\Resend;
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
                        Log::info('Sending confirmation email via Resend', [
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
                        
                        // Send email using Resend
                        $this->sendBookingConfirmationEmail($booking, $emailAddress);
                        
                        Log::info('Email sent successfully via Resend', [
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
                    Log::error('Failed to send confirmation email via Resend', [
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
     * Send booking confirmation email using Resend
     */
    private function sendBookingConfirmationEmail(Booking $booking, string $emailAddress): void
    {
        // Load relationships if not already loaded
        $booking->load(['user', 'room']);
        
        // Get guest name for display
        $guestName = $booking->user->name ?? $booking->guest_name ?? 'Guest';
        
        // Format dates for display
        $checkInDate = $booking->check_in->format('F j, Y');
        $checkOutDate = $booking->check_out->format('F j, Y');
        $nights = $booking->check_in->diffInDays($booking->check_out);
        
        // Build email HTML content
        $emailHtml = $this->buildConfirmationEmailHtml($booking, $guestName, $checkInDate, $checkOutDate, $nights);
        
        // Send email via Resend
        $result = Resend::emails()->send([
            'from' => config('mail.from.address', 'bookings@yourhotel.com'),
            'to' => [$emailAddress],
            'subject' => 'Booking Confirmation - Your Reservation is Confirmed!',
            'html' => $emailHtml,
            'reply_to' => config('mail.from.address', 'bookings@yourhotel.com'),
            'tags' => [
                ['name' => 'category', 'value' => 'booking_confirmation'],
                ['name' => 'booking_id', 'value' => (string) $booking->id]
            ]
        ]);
        
        Log::info('Resend API response', [
            'booking_id' => $booking->id,
            'email' => $emailAddress,
            'resend_id' => $result['id'] ?? 'unknown'
        ]);
    }

    /**
     * Build HTML content for booking confirmation email
     */
    private function buildConfirmationEmailHtml(Booking $booking, string $guestName, string $checkInDate, string $checkOutDate, int $nights): string
    {
        $roomType = $booking->room->name ?? $booking->room_type ?? 'Room';
        $totalAmount = number_format($booking->total_amount, 2);
        $bookingId = $booking->id;

        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Booking Confirmation</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #ffffff; padding: 30px 20px; border: 1px solid #e0e0e0; }
                .booking-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
                .detail-label { font-weight: bold; color: #555; }
                .detail-value { color: #333; }
                .highlight { background: #e8f5e8; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0; border-radius: 4px; }
                .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>🎉 Booking Confirmed!</h1>
                    <p>Thank you for choosing us, {$guestName}!</p>
                </div>
                
                <div class='content'>
                    <div class='highlight'>
                        <strong>✅ Your booking has been confirmed!</strong><br>
                        Booking Reference: <strong>#{$bookingId}</strong>
                    </div>
                    
                    <h3>📋 Booking Details</h3>
                    <div class='booking-details'>
                        <div class='detail-row'>
                            <span class='detail-label'>Guest Name:</span>
                            <span class='detail-value'>{$guestName}</span>
                        </div>
                        <div class='detail-row'>
                            <span class='detail-label'>Room Type:</span>
                            <span class='detail-value'>{$roomType}</span>
                        </div>
                        <div class='detail-row'>
                            <span class='detail-label'>Check-in Date:</span>
                            <span class='detail-value'>{$checkInDate}</span>
                        </div>
                        <div class='detail-row'>
                            <span class='detail-label'>Check-out Date:</span>
                            <span class='detail-value'>{$checkOutDate}</span>
                        </div>
                        <div class='detail-row'>
                            <span class='detail-label'>Number of Nights:</span>
                            <span class='detail-value'>{$nights} night" . ($nights > 1 ? 's' : '') . "</span>
                        </div>
                        <div class='detail-row'>
                            <span class='detail-label'>Adults:</span>
                            <span class='detail-value'>{$booking->adults}</span>
                        </div>";
                        
        if ($booking->children > 0) {
            $emailHtml .= "
                        <div class='detail-row'>
                            <span class='detail-label'>Children:</span>
                            <span class='detail-value'>{$booking->children}</span>
                        </div>";
        }
        
        if ($booking->special_requests) {
            $emailHtml .= "
                        <div class='detail-row'>
                            <span class='detail-label'>Special Requests:</span>
                            <span class='detail-value'>{$booking->special_requests}</span>
                        </div>";
        }
        
        $emailHtml .= "
                        <div class='detail-row' style='border-bottom: 2px solid #28a745; font-size: 18px; font-weight: bold;'>
                            <span class='detail-label'>Total Amount:</span>
                            <span class='detail-value'>₱{$totalAmount}</span>
                        </div>
                    </div>
                    
                    <h3>📝 What's Next?</h3>
                    <ul>
                        <li>Save this confirmation email for your records</li>
                        <li>Arrive at the hotel by 3:00 PM on your check-in date</li>
                        <li>Present a valid ID at check-in</li>
                        <li>Contact us if you need to make any changes</li>
                    </ul>
                    
                    <h3>📞 Need Help?</h3>
                    <p>If you have any questions or need to make changes to your booking, please contact us:</p>
                    <ul>
                        <li>📧 Email: reservations@yourhotel.com</li>
                        <li>📱 Phone: +63 123 456 7890</li>
                        <li>🕒 Available 24/7</li>
                    </ul>
                </div>
                
                <div class='footer'>
                    <p>Thank you for choosing us! We look forward to welcoming you.</p>
                    <p><small>This is an automated confirmation email. Please do not reply to this email.</small></p>
                </div>
            </div>
        </body>
        </html>";

        return $emailHtml;
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