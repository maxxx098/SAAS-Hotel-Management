<?php

namespace App\Http\Controllers\Admin;

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

class DashboardController extends Controller
{
    /**
     * Display the unified dashboard based on user role.
     */
           public function index(): Response
    {
        try {
            $user = auth()->user();
            $isAdmin = $this->isAdmin($user);
            $isStaff = $this->isStaff($user);
            
            if ($isAdmin) {
                // Admin Dashboard
                $dashboardData = $this->getAdminDashboardData();
                
                return Inertia::render('dashboard/admin/index', [
                    'dashboardData' => $dashboardData,
                    'userRole' => $user->role ?? 'admin',
                    'isAdmin' => true,
                ]);
            } elseif ($isStaff) {
                // Staff Dashboard - render a minimal staff dashboard Inertia page
                return Inertia::render('dashboard/staff/index', [
                    'userRole' => $user->role ?? 'staff',
                    'isStaff' => true,
                ]);
            } else {
                // User Dashboard - Return data in the exact format React component expects
                $dashboardData = $this->getUserDashboardData($user->id);
                
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
            }
        } catch (\Exception $e) {
            Log::error('Dashboard data fetch error', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);

            // Return error state with proper structure
            $user = auth()->user();
            $isAdmin = $this->isAdmin($user);
            $isStaff = $this->isStaff($user);
            
            if ($isAdmin) {
                return Inertia::render('dashboard/admin/index', [
                    'dashboardData' => $this->getEmptyDashboardData(),
                    'userRole' => $user->role ?? 'admin',
                    'isAdmin' => true,
                    'error' => 'Failed to load dashboard data',
                ]);
            } elseif ($isStaff) {
                return redirect()->route('staff.dashboard');
            } else {
                return Inertia::render('dashboard/user/index', [
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
    }

        /**
         * Get dashboard statistics based on user role.
         */
        public function stats(): JsonResponse
        {
            try {
                $user = auth()->user();
                $isAdmin = $this->isAdmin($user);
                
                if ($isAdmin) {
                    $stats = $this->getBookingStats();
                } else {
                    $stats = $this->getUserBookingStats($user->id);
                }
                
                return response()->json([
                    'success' => true,
                    'stats' => $stats,
                    'userRole' => $user->role ?? 'client',
                    'isAdmin' => $isAdmin,
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to fetch dashboard statistics', [
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
     * Get recent bookings for dashboard.
     */
    public function recentBookings(): JsonResponse
    {
        try {
            $user = auth()->user();
            $isAdmin = $this->isAdmin($user);
            
            $query = Booking::with(['user', 'room'])
                ->orderBy('created_at', 'desc')
                ->limit(5);
                
            if (!$isAdmin) {
                // Regular users only see their own bookings
                $query->where('user_id', $user->id);
            }
            
            $recentBookings = $query->get()->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'guest_name' => $booking->user->name ?? $booking->guest_name ?? 'N/A',
                    'guest_email' => $booking->user->email ?? $booking->guest_email ?? 'N/A',
                    'room_type' => $booking->room->name ?? $booking->room_type ?? 'N/A',
                    'check_in' => $booking->check_in ? $booking->check_in->format('Y-m-d') : 'N/A',
                    'check_out' => $booking->check_out ? $booking->check_out->format('Y-m-d') : 'N/A',
                    'total_amount' => (float) ($booking->total_amount ?? 0),
                    'status' => $booking->status ?? 'pending',
                    'created_at' => $booking->created_at ? $booking->created_at->format('Y-m-d H:i:s') : 'N/A',
                ];
            });

            return response()->json([
                'success' => true,
                'recentBookings' => $recentBookings,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch recent bookings', [
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
     * Get monthly revenue chart data.
     */
    public function monthlyRevenue(): JsonResponse
    {
        try {
            $user = auth()->user();
            $isAdmin = $this->isAdmin($user);
            
            $query = DB::table('bookings')
                ->selectRaw('
                    DATE_FORMAT(created_at, "%Y-%m") as month,
                    SUM(CASE WHEN status = "confirmed" THEN total_amount ELSE 0 END) as revenue,
                    COUNT(CASE WHEN status = "confirmed" THEN 1 END) as bookings
                ')
                ->where('created_at', '>=', Carbon::now()->subMonths(11)->startOfMonth());
                
            if (!$isAdmin) {
                $query->where('user_id', $user->id);
            }
            
            $monthlyData = $query->groupBy('month')
                ->orderBy('month')
                ->get()
                ->map(function ($item) {
                    return [
                        'month' => Carbon::createFromFormat('Y-m', $item->month)->format('M Y'),
                        'revenue' => (float) $item->revenue,
                        'bookings' => (int) $item->bookings,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $monthlyData,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch monthly revenue data', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch monthly revenue data',
            ], 500);
        }
    }

    /**
     * Get room type distribution.
     */
    public function roomTypeDistribution(): JsonResponse
    {
        try {
            $user = auth()->user();
            $isAdmin = $this->isAdmin($user);
            
            $query = DB::table('bookings')
                ->join('rooms', 'bookings.room_id', '=', 'rooms.id')
                ->selectRaw('
                    rooms.type as room_type,
                    COUNT(*) as bookings,
                    SUM(CASE WHEN bookings.status = "confirmed" THEN bookings.total_amount ELSE 0 END) as revenue
                ')
                ->where('bookings.status', 'confirmed');
                
            if (!$isAdmin) {
                $query->where('bookings.user_id', $user->id);
            }
            
            $distribution = $query->groupBy('rooms.type')
                ->get()
                ->map(function ($item) {
                    return [
                        'type' => $item->room_type,
                        'bookings' => (int) $item->bookings,
                        'revenue' => (float) $item->revenue,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $distribution,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch room type distribution', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch room type distribution',
            ], 500);
        }
    }

    /**
     * Check if user is admin.
     */
    private function isAdmin($user): bool
    {
        if (!$user) {
            return false;
        }
        
        // Check multiple possible admin indicators
        return $user->is_admin ?? 
               $user->role === 'admin' ?? 
               $user->role === 'super_admin' ?? 
               false;
    }

    /**
     * Check if user is staff.
     */
    private function isStaff($user): bool
    {
        if (!$user) {
            return false;
        }

        // Check for staff role or indicator
        return ($user->role ?? null) === 'staff' || ($user->is_staff ?? false);
    }

    /**
     * Get admin dashboard data.
     */
    private function getAdminDashboardData(): array
    {
        $bookingStats = $this->getBookingStats();
        $roomStats = $this->getRoomStats();
        $recentBookings = $this->getRecentBookingsData();

        return [
            'bookingStats' => $bookingStats,
            'roomStats' => $roomStats,
            'recentBookings' => $recentBookings,
            'lastUpdated' => now()->toISOString(),
        ];
    }

/**
 * Get user dashboard data 
 */
private function getUserDashboardData(int $userId): array
{
    // Get user stats in the format expected by React component
    $userStats = $this->getUserStats($userId);
    $recentBookings = $this->getUserRecentBookingsData($userId);
    $upcomingBookings = $this->getUserUpcomingBookingsData($userId);
    $hotelServices = $this->getDefaultHotelServices();

    return [
        'userStats' => $userStats,
        'recentBookings' => $recentBookings,
        'upcomingBookings' => $upcomingBookings,
        'hotelServices' => $hotelServices,
        'notifications' => [],
    ];
}

/**
 * Get comprehensive user statistics 
 */
private function getUserStats(int $userId): array
{
    try {
        // Get all bookings for the user
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
        Log::error('Error getting user stats', ['error' => $e->getMessage(), 'user_id' => $userId]);
        return $this->getEmptyUserStats();
    }
}

/**
 * Get upcoming bookings for user
 */
private function getUserUpcomingBookingsData(int $userId): array
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
        Log::error('Error getting upcoming bookings', ['error' => $e->getMessage(), 'user_id' => $userId]);
        return [];
    }
}

/**
 * Get membership tier based on total spent 
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
 * Get default hotel services - NEW METHOD
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
 * Get empty user stats 
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
/**
 * Get recent bookings for a specific user 
 */
private function getUserRecentBookingsData(int $userId): array
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
                    'guest_name' => $booking->user->name ?? 'N/A',
                    'guest_email' => $booking->user->email ?? 'N/A',
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
        Log::error('Error getting user recent bookings', ['error' => $e->getMessage(), 'user_id' => $userId]);
        return [];
    }
}

/**
 * Get admin booking statistics 
 */
private function getBookingStats(): array
{
    try {
        $stats = DB::table('bookings')
            ->selectRaw('
                COUNT(*) as total_bookings,
                COUNT(CASE WHEN status = "confirmed" THEN 1 END) as confirmed_bookings,
                COUNT(CASE WHEN status = "pending" THEN 1 END) as pending_bookings,
                COUNT(CASE WHEN status = "cancelled" THEN 1 END) as cancelled_bookings,
                SUM(CASE WHEN status = "confirmed" THEN total_amount ELSE 0 END) as total_revenue,
                AVG(CASE WHEN status = "confirmed" THEN total_amount END) as avg_booking_value
            ')
            ->first();

        return [
            'totalBookings' => (int) ($stats->total_bookings ?? 0),
            'confirmedBookings' => (int) ($stats->confirmed_bookings ?? 0),
            'pendingBookings' => (int) ($stats->pending_bookings ?? 0),
            'cancelledBookings' => (int) ($stats->cancelled_bookings ?? 0),
            'totalRevenue' => (float) ($stats->total_revenue ?? 0),
            'avgBookingValue' => (float) ($stats->avg_booking_value ?? 0),
        ];
    } catch (\Exception $e) {
        Log::error('Error getting booking stats', ['error' => $e->getMessage()]);
        return [
            'totalBookings' => 0,
            'confirmedBookings' => 0,
            'pendingBookings' => 0,
            'cancelledBookings' => 0,
            'totalRevenue' => 0,
            'avgBookingValue' => 0,
        ];
    }
}

/**
 * Get user booking statistics 
 */
private function getUserBookingStats(int $userId): array
{
    try {
        $stats = DB::table('bookings')
            ->selectRaw('
                COUNT(*) as total_bookings,
                COUNT(CASE WHEN status = "confirmed" THEN 1 END) as confirmed_bookings,
                COUNT(CASE WHEN status = "pending" THEN 1 END) as pending_bookings,
                COUNT(CASE WHEN status = "cancelled" THEN 1 END) as cancelled_bookings,
                SUM(CASE WHEN status = "confirmed" THEN total_amount ELSE 0 END) as total_spent
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
        Log::error('Error getting user booking stats', ['error' => $e->getMessage(), 'user_id' => $userId]);
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
 * Get room statistics 
 */
private function getRoomStats(): array
{
    try {
        $stats = DB::table('rooms')
            ->selectRaw('
                COUNT(*) as total_rooms,
                COUNT(CASE WHEN status = "available" THEN 1 END) as available_rooms,
                COUNT(CASE WHEN status = "occupied" THEN 1 END) as occupied_rooms,
                COUNT(CASE WHEN status = "maintenance" THEN 1 END) as maintenance_rooms
            ')
            ->first();

        return [
            'totalRooms' => (int) ($stats->total_rooms ?? 0),
            'availableRooms' => (int) ($stats->available_rooms ?? 0),
            'occupiedRooms' => (int) ($stats->occupied_rooms ?? 0),
            'maintenanceRooms' => (int) ($stats->maintenance_rooms ?? 0),
        ];
    } catch (\Exception $e) {
        Log::error('Error getting room stats', ['error' => $e->getMessage()]);
        return [
            'totalRooms' => 0,
            'availableRooms' => 0,
            'occupiedRooms' => 0,
            'maintenanceRooms' => 0,
        ];
    }
}

/**
 * Get recent bookings for admin 
 */
private function getRecentBookingsData(): array
{
    try {
        return Booking::with(['user', 'room'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'guest_name' => $booking->user->name ?? $booking->guest_name ?? 'N/A',
                    'guest_email' => $booking->user->email ?? $booking->guest_email ?? 'N/A',
                    'room_type' => $booking->room->name ?? $booking->room_type ?? 'N/A',
                    'check_in' => $booking->check_in ? $booking->check_in->format('Y-m-d') : 'N/A',
                    'check_out' => $booking->check_out ? $booking->check_out->format('Y-m-d') : 'N/A',
                    'total_amount' => (float) ($booking->total_amount ?? 0),
                    'status' => $booking->status ?? 'pending',
                    'created_at' => $booking->created_at ? $booking->created_at->format('Y-m-d H:i:s') : 'N/A',
                ];
            })
            ->toArray();
    } catch (\Exception $e) {
        Log::error('Error getting recent bookings', ['error' => $e->getMessage()]);
        return [];
    }
}

/**
 * Get empty dashboard data for error states 
 */
private function getEmptyDashboardData(): array
{
    return [
        'bookingStats' => [
            'totalBookings' => 0,
            'confirmedBookings' => 0,
            'pendingBookings' => 0,
            'cancelledBookings' => 0,
            'totalRevenue' => 0,
            'avgBookingValue' => 0,
        ],
        'roomStats' => [
            'totalRooms' => 0,
            'availableRooms' => 0,
            'occupiedRooms' => 0,
            'maintenanceRooms' => 0,
        ],
        'recentBookings' => [],
        'lastUpdated' => now()->toISOString(),
    ];
}
}