<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ClientDashboardController extends Controller
{
    /**
     * Display the client dashboard.
     */
    public function index(): Response
    {
        try {
            $user = auth()->user();
            $dashboardData = $this->getClientDashboardData($user->id);

            return Inertia::render('dashboard/user/index', [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone ?? null,
                    'member_since' => $user->created_at ? $user->created_at->format('Y-m-d') : null,
                ],
                'userStats' => $dashboardData['userStats'],
                'recentBookings' => $dashboardData['recentBookings'],
                'upcomingBookings' => $dashboardData['upcomingBookings'],
                'hotelServices' => $dashboardData['hotelServices'],
                'notifications' => $dashboardData['notifications'] ?? [],
            ]);
        } catch (\Exception $e) {
            Log::error('Client dashboard data fetch error', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);

            // Return error state with proper structure
            $user = auth()->user();
            return Inertia::render('dashboard/client/index', [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone ?? null,
                    'member_since' => $user->created_at ? $user->created_at->format('Y-m-d') : null,
                ],
                'userStats' => $this->getEmptyUserStats(),
                'recentBookings' => [],
                'upcomingBookings' => [],
                'hotelServices' => $this->getDefaultHotelServices(),
                'notifications' => [],
                'error' => 'Failed to load dashboard data',
            ]);
        }
    }

    /**
     * Get client dashboard statistics.
     */
    public function stats(): JsonResponse
    {
        try {
            $user = auth()->user();
            $stats = $this->getClientBookingStats($user->id);
            
            return response()->json([
                'success' => true,
                'stats' => $stats,
                'userRole' => 'client',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch client dashboard statistics', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard statistics',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Get client's recent bookings for dashboard.
     */
    public function recentBookings(): JsonResponse
    {
        try {
            $user = auth()->user();
            
            $recentBookings = Booking::with(['room'])
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($booking) {
                    return [
                        'id' => $booking->id,
                        'room_type' => $booking->room->name ?? $booking->room_type ?? 'Standard Room',
                        'room_number' => $booking->room->number ?? null,
                        'check_in' => $booking->check_in ? $booking->check_in->format('Y-m-d') : 'N/A',
                        'check_out' => $booking->check_out ? $booking->check_out->format('Y-m-d') : 'N/A',
                        'total_amount' => (float) ($booking->total_amount ?? 0),
                        'status' => $booking->status ?? 'pending',
                        'created_at' => $booking->created_at ? $booking->created_at->format('Y-m-d H:i:s') : 'N/A',
                        'booking_reference' => $booking->booking_reference ?? 'BK-' . str_pad($booking->id, 6, '0', STR_PAD_LEFT),
                    ];
                });

            return response()->json([
                'success' => true,
                'recentBookings' => $recentBookings,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch client recent bookings', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch recent bookings',
            ], 500);
        }
    }

    /**
     * Get client's upcoming bookings.
     */
    public function upcomingBookings(): JsonResponse
    {
        try {
            $user = auth()->user();
            
            $upcomingBookings = Booking::with(['room'])
                ->where('user_id', $user->id)
                ->whereIn('status', ['confirmed', 'checked_in'])
                ->where('check_in', '>=', Carbon::today())
                ->orderBy('check_in', 'asc')
                ->limit(10)
                ->get()
                ->map(function ($booking) {
                    return [
                        'id' => $booking->id,
                        'room_type' => $booking->room->name ?? $booking->room_type ?? 'Standard Room',
                        'room_number' => $booking->room->number ?? null,
                        'check_in' => $booking->check_in ? $booking->check_in->format('Y-m-d') : null,
                        'check_out' => $booking->check_out ? $booking->check_out->format('Y-m-d') : null,
                        'adults' => (int) ($booking->adults ?? 1),
                        'children' => (int) ($booking->children ?? 0),
                        'nights' => $booking->check_in && $booking->check_out ? 
                            $booking->check_in->diffInDays($booking->check_out) : 1,
                        'total_amount' => (float) ($booking->total_amount ?? 0),
                        'status' => $booking->status ?? 'pending',
                        'booking_date' => $booking->created_at ? $booking->created_at->format('Y-m-d') : null,
                        'special_requests' => $booking->special_requests ?? null,
                        'booking_reference' => $booking->booking_reference ?? 'BK-' . str_pad($booking->id, 6, '0', STR_PAD_LEFT),
                    ];
                });

            return response()->json([
                'success' => true,
                'upcomingBookings' => $upcomingBookings,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch client upcoming bookings', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch upcoming bookings',
            ], 500);
        }
    }

    /**
     * Get client's monthly spending chart data.
     */
    public function monthlySpending(): JsonResponse
    {
        try {
            $user = auth()->user();
            
            $monthlyData = DB::table('bookings')
                ->selectRaw('
                    DATE_FORMAT(created_at, "%Y-%m") as month,
                    SUM(CASE WHEN status IN ("confirmed", "checked_in", "checked_out") THEN total_amount ELSE 0 END) as spending,
                    COUNT(CASE WHEN status IN ("confirmed", "checked_in", "checked_out") THEN 1 END) as bookings
                ')
                ->where('user_id', $user->id)
                ->where('created_at', '>=', Carbon::now()->subMonths(11)->startOfMonth())
                ->groupBy('month')
                ->orderBy('month')
                ->get()
                ->map(function ($item) {
                    return [
                        'month' => Carbon::createFromFormat('Y-m', $item->month)->format('M Y'),
                        'spending' => (float) $item->spending,
                        'bookings' => (int) $item->bookings,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $monthlyData,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch client monthly spending data', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch monthly spending data',
            ], 500);
        }
    }

    /**
     * Get client's room type preferences.
     */
    public function roomTypePreferences(): JsonResponse
    {
        try {
            $user = auth()->user();
            
            $preferences = DB::table('bookings')
                ->join('rooms', 'bookings.room_id', '=', 'rooms.id')
                ->selectRaw('
                    rooms.type as room_type,
                    COUNT(*) as bookings,
                    SUM(CASE WHEN bookings.status IN ("confirmed", "checked_in", "checked_out") THEN bookings.total_amount ELSE 0 END) as total_spent
                ')
                ->where('bookings.user_id', $user->id)
                ->where('bookings.status', '!=', 'cancelled')
                ->groupBy('rooms.type')
                ->get()
                ->map(function ($item) {
                    return [
                        'type' => $item->room_type,
                        'bookings' => (int) $item->bookings,
                        'total_spent' => (float) $item->total_spent,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $preferences,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch client room type preferences', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch room type preferences',
            ], 500);
        }
    }

    /**
     * Get client notifications.
     */
    public function notifications(): JsonResponse
    {
        try {
            $user = auth()->user();
            $notifications = $this->getClientNotifications($user->id);

            return response()->json([
                'success' => true,
                'notifications' => $notifications,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch client notifications', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch notifications',
            ], 500);
        }
    }

    /**
     * Get available hotel services.
     */
    public function services(): JsonResponse
    {
        try {
            $services = $this->getDefaultHotelServices();

            return response()->json([
                'success' => true,
                'services' => $services,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch hotel services', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch hotel services',
            ], 500);
        }
    }

    /**
     * Update client profile.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'name' => 'sometimes|string|max:255',
                'phone' => 'sometimes|nullable|string|max:20',
                'preferences' => 'sometimes|array',
            ]);

            $user = auth()->user();
            $updateData = [];

            if ($request->has('name')) {
                $updateData['name'] = $request->name;
            }

            if ($request->has('phone')) {
                $updateData['phone'] = $request->phone;
            }

            if ($request->has('preferences')) {
                $updateData['preferences'] = json_encode($request->preferences);
            }

            if (!empty($updateData)) {
                $user->update($updateData);
            }

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'member_since' => $user->created_at->format('Y-m-d'),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update client profile', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile',
            ], 500);
        }
    }

    /**
     * Private helper methods
     */

    /**
     * Get client dashboard data.
     */
    private function getClientDashboardData(int $userId): array
    {
        $userStats = $this->getClientStats($userId);
        $recentBookings = $this->getClientRecentBookingsData($userId);
        $upcomingBookings = $this->getClientUpcomingBookingsData($userId);
        $hotelServices = $this->getDefaultHotelServices();
        $notifications = $this->getClientNotifications($userId);

        return [
            'userStats' => $userStats,
            'recentBookings' => $recentBookings,
            'upcomingBookings' => $upcomingBookings,
            'hotelServices' => $hotelServices,
            'notifications' => $notifications,
        ];
    }

    /**
     * Get comprehensive client statistics.
     */
    private function getClientStats(int $userId): array
    {
        try {
            // Get all bookings for the client
            $allBookings = DB::table('bookings')
                ->selectRaw('
                    COUNT(*) as total_bookings,
                    COUNT(CASE WHEN status IN ("confirmed", "checked_in") THEN 1 END) as active_bookings,
                    COUNT(CASE WHEN status = "checked_out" THEN 1 END) as completed_stays,
                    SUM(CASE WHEN status IN ("confirmed", "checked_in", "checked_out") THEN total_amount ELSE 0 END) as total_spent
                ')
                ->where('user_id', $userId)
                ->first();

            // Get upcoming bookings count
            $upcomingBookings = DB::table('bookings')
                ->where('user_id', $userId)
                ->whereIn('status', ['confirmed', 'checked_in'])
                ->where('check_in', '>=', Carbon::today())
                ->count();

            // Calculate loyalty points and membership tier
            $totalSpent = (float) ($allBookings->total_spent ?? 0);
            $loyaltyPoints = (int) ($totalSpent * 10); // 10 points per dollar
            $membershipTier = $this->getMembershipTier($totalSpent);

            return [
                'totalBookings' => (int) ($allBookings->total_bookings ?? 0),
                'activeBookings' => (int) ($allBookings->active_bookings ?? 0),
                'completedStays' => (int) ($allBookings->completed_stays ?? 0),
                'totalSpent' => $totalSpent,
                'loyaltyPoints' => $loyaltyPoints,
                'membershipTier' => $membershipTier,
                'upcomingBookings' => $upcomingBookings,
            ];
        } catch (\Exception $e) {
            Log::error('Error getting client stats', ['error' => $e->getMessage(), 'user_id' => $userId]);
            return $this->getEmptyUserStats();
        }
    }

    /**
     * Get client booking statistics.
     */
    private function getClientBookingStats(int $userId): array
    {
        try {
            $stats = DB::table('bookings')
                ->selectRaw('
                    COUNT(*) as total_bookings,
                    COUNT(CASE WHEN status = "confirmed" THEN 1 END) as confirmed_bookings,
                    COUNT(CASE WHEN status = "pending" THEN 1 END) as pending_bookings,
                    COUNT(CASE WHEN status = "cancelled" THEN 1 END) as cancelled_bookings,
                    SUM(CASE WHEN status IN ("confirmed", "checked_in", "checked_out") THEN total_amount ELSE 0 END) as total_spent
                ')
                ->where('user_id', $userId)
                ->first();

            return [
                'totalBookings' => (int) ($stats->total_bookings ?? 0),
                'confirmedBookings' => (int) ($stats->confirmed_bookings ?? 0),
                'pendingBookings' => (int) ($stats->pending_bookings ?? 0),
                'cancelledBookings' => (int) ($stats->cancelled_bookings ?? 0),
                'totalSpent' => (float) ($stats->total_spent ?? 0),
            ];
        } catch (\Exception $e) {
            Log::error('Error getting client booking stats', ['error' => $e->getMessage(), 'user_id' => $userId]);
            return [
                'totalBookings' => 0,
                'confirmedBookings' => 0,
                'pendingBookings' => 0,
                'cancelledBookings' => 0,
                'totalSpent' => 0,
            ];
        }
    }

    /**
     * Get recent bookings for client.
     */
    private function getClientRecentBookingsData(int $userId): array
    {
        try {
            return Booking::with(['room'])
                ->where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($booking) {
                    return [
                        'id' => $booking->id,
                        'room_type' => $booking->room->name ?? $booking->room_type ?? 'Standard Room',
                        'room_number' => $booking->room->number ?? null,
                        'check_in' => $booking->check_in ? $booking->check_in->format('Y-m-d') : null,
                        'check_out' => $booking->check_out ? $booking->check_out->format('Y-m-d') : null,
                        'total_amount' => (float) ($booking->total_amount ?? 0),
                        'status' => $booking->status ?? 'pending',
                        'created_at' => $booking->created_at ? $booking->created_at->format('Y-m-d H:i:s') : null,
                        'booking_reference' => $booking->booking_reference ?? 'BK-' . str_pad($booking->id, 6, '0', STR_PAD_LEFT),
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            Log::error('Error getting client recent bookings', ['error' => $e->getMessage(), 'user_id' => $userId]);
            return [];
        }
    }

    /**
     * Get upcoming bookings for client.
     */
    private function getClientUpcomingBookingsData(int $userId): array
    {
        try {
            return Booking::with(['room'])
                ->where('user_id', $userId)
                ->whereIn('status', ['confirmed', 'checked_in'])
                ->where('check_in', '>=', Carbon::today())
                ->orderBy('check_in', 'asc')
                ->limit(10)
                ->get()
                ->map(function ($booking) {
                    return [
                        'id' => $booking->id,
                        'room_type' => $booking->room->name ?? $booking->room_type ?? 'Standard Room',
                        'room_number' => $booking->room->number ?? null,
                        'check_in' => $booking->check_in ? $booking->check_in->format('Y-m-d') : null,
                        'check_out' => $booking->check_out ? $booking->check_out->format('Y-m-d') : null,
                        'adults' => (int) ($booking->adults ?? 1),
                        'children' => (int) ($booking->children ?? 0),
                        'nights' => $booking->check_in && $booking->check_out ? 
                            $booking->check_in->diffInDays($booking->check_out) : 1,
                        'total_amount' => (float) ($booking->total_amount ?? 0),
                        'status' => $booking->status ?? 'pending',
                        'booking_date' => $booking->created_at ? $booking->created_at->format('Y-m-d') : null,
                        'special_requests' => $booking->special_requests ?? null,
                        'booking_reference' => $booking->booking_reference ?? 'BK-' . str_pad($booking->id, 6, '0', STR_PAD_LEFT),
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            Log::error('Error getting client upcoming bookings', ['error' => $e->getMessage(), 'user_id' => $userId]);
            return [];
        }
    }

    /**
     * Get client notifications.
     */
    private function getClientNotifications(int $userId): array
    {
        try {
            $notifications = [];

            // Check for upcoming bookings (within 7 days)
            $upcomingBooking = Booking::where('user_id', $userId)
                ->whereIn('status', ['confirmed', 'checked_in'])
                ->where('check_in', '>=', Carbon::today())
                ->where('check_in', '<=', Carbon::today()->addDays(7))
                ->first();

            if ($upcomingBooking) {
                $notifications[] = [
                    'id' => 'upcoming_booking_' . $upcomingBooking->id,
                    'type' => 'upcoming_stay',
                    'title' => 'Upcoming Stay',
                    'message' => 'You have a booking starting on ' . $upcomingBooking->check_in->format('M d, Y'),
                    'created_at' => now()->format('Y-m-d H:i:s'),
                    'read' => false,
                    'action_url' => '/bookings/' . $upcomingBooking->id,
                ];
            }

            // Check for pending bookings
            $pendingBookings = Booking::where('user_id', $userId)
                ->where('status', 'pending')
                ->count();

            if ($pendingBookings > 0) {
                $notifications[] = [
                    'id' => 'pending_bookings',
                    'type' => 'pending_confirmation',
                    'title' => 'Pending Bookings',
                    'message' => "You have {$pendingBookings} booking(s) awaiting confirmation",
                    'created_at' => now()->format('Y-m-d H:i:s'),
                    'read' => false,
                    'action_url' => '/bookings?status=pending',
                ];
            }

            // Loyalty points milestone
            $userStats = $this->getClientStats($userId);
            $loyaltyPoints = $userStats['loyaltyPoints'];
            $nextMilestone = $this->getNextLoyaltyMilestone($loyaltyPoints);

            if ($nextMilestone) {
                $pointsNeeded = $nextMilestone['points'] - $loyaltyPoints;
                if ($pointsNeeded <= 500 && $pointsNeeded > 0) {
                    $notifications[] = [
                        'id' => 'loyalty_milestone',
                        'type' => 'loyalty_reward',
                        'title' => 'Loyalty Milestone',
                        'message' => "You're only {$pointsNeeded} points away from {$nextMilestone['tier']} status!",
                        'created_at' => now()->format('Y-m-d H:i:s'),
                        'read' => false,
                        'action_url' => '/profile/loyalty',
                    ];
                }
            }

            return $notifications;
        } catch (\Exception $e) {
            Log::error('Error getting client notifications', ['error' => $e->getMessage(), 'user_id' => $userId]);
            return [];
        }
    }

    /**
     * Get membership tier based on total spent.
     */
    private function getMembershipTier(float $totalSpent): string
    {
        if ($totalSpent >= 10000) {
            return 'Platinum';
        } elseif ($totalSpent >= 5000) {
            return 'Gold';
        } elseif ($totalSpent >= 2500) {
            return 'Silver';
        } else {
            return 'Bronze';
        }
    }

    /**
     * Get next loyalty milestone.
     */
    private function getNextLoyaltyMilestone(int $currentPoints): ?array
    {
        $milestones = [
            ['points' => 2500, 'tier' => 'Silver'],
            ['points' => 5000, 'tier' => 'Gold'],
            ['points' => 10000, 'tier' => 'Platinum'],
        ];

        foreach ($milestones as $milestone) {
            if ($currentPoints < $milestone['points']) {
                return $milestone;
            }
        }

        return null; // Already at highest tier
    }

    /**
     * Get default hotel services.
     */
    private function getDefaultHotelServices(): array
    {
        return [
            [
                'id' => 1,
                'name' => 'Restaurant',
                'description' => 'Fine dining experience',
                'icon' => 'restaurant',
                'status' => 'available',
                'hours' => '6:00 AM - 11:00 PM'
            ],
            [
                'id' => 2,
                'name' => 'WiFi',
                'description' => 'High-speed internet',
                'icon' => 'wifi',
                'status' => 'available',
                'hours' => '24/7'
            ],
            [
                'id' => 3,
                'name' => 'Parking',
                'description' => 'Secure parking facility',
                'icon' => 'parking',
                'status' => 'available',
                'hours' => '24/7'
            ],
            [
                'id' => 4,
                'name' => 'Gym',
                'description' => 'Fitness center',
                'icon' => 'gym',
                'status' => 'available',
                'hours' => '5:00 AM - 11:00 PM'
            ],
            [
                'id' => 5,
                'name' => 'Spa',
                'description' => 'Wellness and relaxation',
                'icon' => 'spa',
                'status' => 'available',
                'hours' => '9:00 AM - 9:00 PM'
            ],
            [
                'id' => 6,
                'name' => 'Coffee Shop',
                'description' => 'Fresh coffee and snacks',
                'icon' => 'coffee',
                'status' => 'available',
                'hours' => '6:00 AM - 10:00 PM'
            ]
        ];
    }

    /**
     * Get empty user stats.
     */
    private function getEmptyUserStats(): array
    {
        return [
            'totalBookings' => 0,
            'activeBookings' => 0,
            'completedStays' => 0,
            'totalSpent' => 0,
            'loyaltyPoints' => 0,
            'membershipTier' => 'Bronze',
            'upcomingBookings' => 0,
        ];
    }
}