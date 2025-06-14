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

class AdminDashboardController extends Controller
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
            // If you want to fetch staff-specific dashboard data, do so here
            $dashboardData = $this->getStaffDashboardData($user);

            return Inertia::render('dashboard/staff/index', [
                'dashboardData' => [], // or $this->getStaffDashboardData()
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone ?? null,
                    'role' => $user->role,
                    'department' => $user->department ?? 'General',
                    'employee_id' => $user->employee_id ?? 'EMP-' . str_pad($user->id, 4, '0', STR_PAD_LEFT),
                    'hire_date' => $user->created_at ? $user->created_at->format('Y-m-d') : null,
                ],
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
  /**
     * Get staff dashboard statistics.
     */
    public function staffStats(): JsonResponse
    {
        try {
            $user = auth()->user();
            $stats = $this->getStaffStats($user);
            
            return response()->json([
                'success' => true,
                'stats' => $stats,
                'userRole' => $user->role ?? 'staff',
                'isStaff' => true,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch staff dashboard statistics', [
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
     * Get today's tasks for staff.
     */
    public function todayTasks(): JsonResponse
    {
        try {
            $user = auth()->user();
            $tasks = $this->getTodayTasksData($user);
            
            return response()->json([
                'success' => true,
                'tasks' => $tasks,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch today tasks', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch tasks',
            ], 500);
        }
    }

    /**
     * Get assigned rooms for housekeeping staff.
     */
    public function assignedRooms(): JsonResponse
    {
        try {
            $user = auth()->user();
            $rooms = $this->getAssignedRoomsData($user);
            
            return response()->json([
                'success' => true,
                'rooms' => $rooms,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch assigned rooms', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch assigned rooms',
            ], 500);
        }
    }

    /**
     * Get maintenance requests assigned to staff.
     */
    public function maintenanceRequests(): JsonResponse
    {
        try {
            $user = auth()->user();
            $requests = $this->getMaintenanceRequestsData($user);
            
            return response()->json([
                'success' => true,
                'requests' => $requests,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch maintenance requests', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch maintenance requests',
            ], 500);
        }
    }

    /**
     * Update task status.
     */
    public function updateTaskStatus(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'task_id' => 'required|integer',
                'status' => 'required|string|in:pending,in_progress,completed',
                'task_type' => 'required|string|in:room_cleaning,maintenance,check_in,check_out,guest_service',
            ]);

            $user = auth()->user();
            $taskType = $request->task_type;
            $taskId = $request->task_id;
            $status = $request->status;

            switch ($taskType) {
                case 'room_cleaning':
                    // Update room status or create cleaning log
                    $this->updateRoomCleaningStatus($taskId, $status, $user->id);
                    break;
                    
                case 'maintenance':
                    // Update maintenance request
                    MaintenanceRequest::where('id', $taskId)
                        ->where('assigned_to', $user->id)
                        ->update([
                            'status' => $status,
                            'updated_at' => now(),
                        ]);
                    break;
                    
                case 'check_in':
                case 'check_out':
                    // Update booking status
                    $this->updateBookingStatus($taskId, $status, $taskType);
                    break;
                    
                default:
                    // Handle other task types
                    break;
            }

            return response()->json([
                'success' => true,
                'message' => 'Task status updated successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update task status', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
                'request_data' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update task status',
            ], 500);
        }
    }

    /**
     * Get staff dashboard data.
     */
    private function getStaffDashboardData($user): array
    {
        $todayStats = $this->getTodayStaffStats($user);
        $todayTasks = $this->getTodayTasksData($user);
        $assignedRooms = $this->getAssignedRoomsData($user);
        $maintenanceRequests = $this->getMaintenanceRequestsData($user);
        $recentActivities = $this->getRecentActivitiesData($user);
        $schedule = $this->getStaffScheduleData($user);

        return [
            'todayStats' => $todayStats,
            'todayTasks' => $todayTasks,
            'assignedRooms' => $assignedRooms,
            'maintenanceRequests' => $maintenanceRequests,
            'recentActivities' => $recentActivities,
            'schedule' => $schedule,
            'lastUpdated' => now()->toISOString(),
        ];
    }

    /**
     * Get today's staff statistics.
     */
    private function getTodayStaffStats($user): array
    {
        try {
            $today = Carbon::today();
            $role = $user->role ?? 'staff';

            switch ($role) {
                case 'front_desk':
                    return $this->getFrontDeskStats($user, $today);
                    
                case 'housekeeping':
                    return $this->getHousekeepingStats($user, $today);
                    
                case 'maintenance':
                    return $this->getMaintenanceStats($user, $today);
                    
                case 'security':
                    return $this->getSecurityStats($user, $today);
                    
                default:
                    return $this->getGeneralStaffStats($user, $today);
            }
        } catch (\Exception $e) {
            Log::error('Error getting staff stats', ['error' => $e->getMessage(), 'user_id' => $user->id]);
            return $this->getEmptyStaffStats();
        }
    }

    /**
     * Get front desk statistics.
     */
    private function getFrontDeskStats($user, $today): array
    {
        $stats = DB::table('bookings')
            ->selectRaw('
                COUNT(CASE WHEN DATE(check_in) = ? AND status = "confirmed" THEN 1 END) as check_ins_today,
                COUNT(CASE WHEN DATE(check_out) = ? AND status = "checked_in" THEN 1 END) as check_outs_today,
                COUNT(CASE WHEN status = "pending" THEN 1 END) as pending_bookings,
                COUNT(CASE WHEN DATE(created_at) = ? THEN 1 END) as new_bookings_today
            ')
            ->setBindings([$today->format('Y-m-d'), $today->format('Y-m-d'), $today->format('Y-m-d')])
            ->first();

        return [
            'checkInsToday' => (int) ($stats->check_ins_today ?? 0),
            'checkOutsToday' => (int) ($stats->check_outs_today ?? 0),
            'pendingBookings' => (int) ($stats->pending_bookings ?? 0),
            'newBookingsToday' => (int) ($stats->new_bookings_today ?? 0),
            'tasksCompleted' => $this->getCompletedTasksCount($user->id, $today),
            'guestComplaints' => 2, // Mock data - implement guest complaints system
        ];
    }

    /**
     * Get housekeeping statistics.
     */
    private function getHousekeepingStats($user, $today): array
    {
        // Mock room assignments - implement proper room assignment system
        $assignedRooms = 12;
        $cleanedRooms = 8;
        $pendingRooms = $assignedRooms - $cleanedRooms;

        return [
            'assignedRooms' => $assignedRooms,
            'cleanedRooms' => $cleanedRooms,
            'pendingRooms' => $pendingRooms,
            'maintenanceReports' => 3,
            'tasksCompleted' => $this->getCompletedTasksCount($user->id, $today),
            'efficiency' => $assignedRooms > 0 ? round(($cleanedRooms / $assignedRooms) * 100) : 0,
        ];
    }

    /**
     * Get maintenance statistics.
     */
    private function getMaintenanceStats($user, $today): array
    {
        $stats = DB::table('maintenance_requests')
            ->selectRaw('
                COUNT(CASE WHEN assigned_to = ? THEN 1 END) as assigned_requests,
                COUNT(CASE WHEN assigned_to = ? AND status = "completed" AND DATE(updated_at) = ? THEN 1 END) as completed_today,
                COUNT(CASE WHEN assigned_to = ? AND status = "in_progress" THEN 1 END) as in_progress,
                COUNT(CASE WHEN assigned_to = ? AND priority = "high" AND status != "completed" THEN 1 END) as urgent_requests
            ')
            ->setBindings([$user->id, $user->id, $today->format('Y-m-d'), $user->id, $user->id])
            ->first();

        return [
            'assignedRequests' => (int) ($stats->assigned_requests ?? 0),
            'completedToday' => (int) ($stats->completed_today ?? 0),
            'inProgress' => (int) ($stats->in_progress ?? 0),
            'urgentRequests' => (int) ($stats->urgent_requests ?? 0),
            'tasksCompleted' => $this->getCompletedTasksCount($user->id, $today),
            'avgResponseTime' => '2.5 hours', // Mock data
        ];
    }

    /**
     * Get security statistics.
     */
    private function getSecurityStats($user, $today): array
    {
        return [
            'incidentsToday' => 1, // Mock data
            'patrolsCompleted' => 8, // Mock data
            'guestAssistance' => 5, // Mock data
            'keyCardIssues' => 3, // Mock data
            'tasksCompleted' => $this->getCompletedTasksCount($user->id, $today),
            'shiftStatus' => 'On Duty',
        ];
    }

    /**
     * Get general staff statistics.
     */
    private function getGeneralStaffStats($user, $today): array
    {
        return [
            'tasksAssigned' => 8, // Mock data
            'tasksCompleted' => $this->getCompletedTasksCount($user->id, $today),
            'tasksPending' => 3, // Mock data
            'hoursWorked' => 6.5, // Mock data
            'shiftStatus' => 'On Duty',
            'performance' => 85, // Mock data - percentage
        ];
    }

    /**
     * Get today's tasks for staff.
     */
    private function getTodayTasksData($user): array
    {
        $today = Carbon::today();
        $role = $user->role ?? 'staff';
        $tasks = [];

        switch ($role) {
            case 'front_desk':
                $tasks = $this->getFrontDeskTasks($user, $today);
                break;
                
            case 'housekeeping':
                $tasks = $this->getHousekeepingTasks($user, $today);
                break;
                
            case 'maintenance':
                $tasks = $this->getMaintenanceTasks($user, $today);
                break;
                
            case 'security':
                $tasks = $this->getSecurityTasks($user, $today);
                break;
                
            default:
                $tasks = $this->getGeneralTasks($user, $today);
                break;
        }

        return $tasks;
    }

    /**
     * Get front desk tasks.
     */
    private function getFrontDeskTasks($user, $today): array
    {
        $checkIns = Booking::with(['user', 'room'])
            ->where('check_in', $today)
            ->where('status', 'confirmed')
            ->limit(10)
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'type' => 'check_in',
                    'title' => 'Check-in: ' . ($booking->user->name ?? 'Guest'),
                    'description' => 'Room ' . ($booking->room->number ?? 'TBD') . ' - ' . ($booking->room->type ?? 'Standard'),
                    'time' => '14:00',
                    'priority' => 'medium',
                    'status' => 'pending',
                    'guest_name' => $booking->user->name ?? 'Guest',
                    'room_number' => $booking->room->number ?? 'TBD',
                ];
            });

        $checkOuts = Booking::with(['user', 'room'])
            ->where('check_out', $today)
            ->where('status', 'checked_in')
            ->limit(10)
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'type' => 'check_out',
                    'title' => 'Check-out: ' . ($booking->user->name ?? 'Guest'),
                    'description' => 'Room ' . ($booking->room->number ?? 'TBD'),
                    'time' => '11:00',
                    'priority' => 'medium',
                    'status' => 'pending',
                    'guest_name' => $booking->user->name ?? 'Guest',
                    'room_number' => $booking->room->number ?? 'TBD',
                ];
            });

        return $checkIns->concat($checkOuts)->toArray();
    }

    /**
     * Get housekeeping tasks.
     */
    private function getHousekeepingTasks($user, $today): array
    {
        // Mock housekeeping tasks - implement proper assignment system
        return [
            [
                'id' => 1,
                'type' => 'room_cleaning',
                'title' => 'Clean Room 101',
                'description' => 'Standard cleaning after checkout',
                'time' => '09:00',
                'priority' => 'high',
                'status' => 'pending',
                'room_number' => '101',
                'estimated_duration' => 45,
            ],
            [
                'id' => 2,
                'type' => 'room_cleaning',
                'title' => 'Deep Clean Room 205',
                'description' => 'Deep cleaning required',
                'time' => '10:30',
                'priority' => 'medium',
                'status' => 'in_progress',
                'room_number' => '205',
                'estimated_duration' => 90,
            ],
            [
                'id' => 3,
                'type' => 'maintenance_report',
                'title' => 'Report AC Issue - Room 312',
                'description' => 'Guest reported AC not cooling properly',
                'time' => '14:00',
                'priority' => 'high',
                'status' => 'pending',
                'room_number' => '312',
            ],
        ];
    }

    /**
     * Get maintenance tasks.
     */
    private function getMaintenanceTasks($user, $today): array
    {
        return MaintenanceRequest::with(['room'])
            ->where('assigned_to', $user->id)
            ->whereIn('status', ['pending', 'in_progress'])
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'asc')
            ->limit(10)
            ->get()
            ->map(function ($request) {
                return [
                    'id' => $request->id,
                    'type' => 'maintenance',
                    'title' => $request->title ?? 'Maintenance Request',
                    'description' => $request->description ?? 'No description',
                    'time' => $request->created_at->format('H:i'),
                    'priority' => $request->priority ?? 'medium',
                    'status' => $request->status ?? 'pending',
                    'room_number' => $request->room->number ?? 'N/A',
                    'location' => $request->location ?? 'Room',
                ];
            })
            ->toArray();
    }

    /**
     * Get security tasks.
     */
    private function getSecurityTasks($user, $today): array
    {
        // Mock security tasks
        return [
            [
                'id' => 1,
                'type' => 'patrol',
                'title' => 'Morning Patrol - Floors 1-3',
                'description' => 'Regular security patrol',
                'time' => '08:00',
                'priority' => 'medium',
                'status' => 'completed',
                'location' => 'Floors 1-3',
            ],
            [
                'id' => 2,
                'type' => 'incident',
                'title' => 'Guest Assistance - Lobby',
                'description' => 'Help guest with luggage',
                'time' => '10:30',
                'priority' => 'low',
                'status' => 'pending',
                'location' => 'Lobby',
            ],
        ];
    }

    /**
     * Get general tasks.
     */
    private function getGeneralTasks($user, $today): array
    {
        // Mock general tasks
        return [
            [
                'id' => 1,
                'type' => 'general',
                'title' => 'Team Meeting',
                'description' => 'Weekly team briefing',
                'time' => '09:00',
                'priority' => 'medium',
                'status' => 'pending',
            ],
            [
                'id' => 2,
                'type' => 'training',
                'title' => 'Safety Training Module',
                'description' => 'Complete online safety training',
                'time' => '15:00',
                'priority' => 'low',
                'status' => 'pending',
            ],
        ];
    }

    /**
     * Get assigned rooms data.
     */
    private function getAssignedRoomsData($user): array
    {
        if ($user->role !== 'housekeeping') {
            return [];
        }

        // Mock assigned rooms - implement proper room assignment system
        return [
            [
                'id' => 101,
                'number' => '101',
                'type' => 'Standard',
                'status' => 'needs_cleaning',
                'last_checkout' => '2024-01-15 11:00:00',
                'next_checkin' => '2024-01-15 15:00:00',
                'priority' => 'high',
                'estimated_time' => 45,
            ],
            [
                'id' => 102,
                'number' => '102',
                'type' => 'Deluxe',
                'status' => 'in_progress',
                'last_checkout' => '2024-01-15 10:30:00',
                'next_checkin' => '2024-01-15 16:00:00',
                'priority' => 'medium',
                'estimated_time' => 60,
            ],
        ];
    }

    /**
     * Get maintenance requests data.
     */
    private function getMaintenanceRequestsData($user): array
    {
        if ($user->role !== 'maintenance') {
            return [];
        }

        return MaintenanceRequest::with(['room', 'reportedBy'])
            ->where('assigned_to', $user->id)
            ->whereIn('status', ['pending', 'in_progress'])
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'asc')
            ->limit(15)
            ->get()
            ->map(function ($request) {
                return [
                    'id' => $request->id,
                    'title' => $request->title ?? 'Maintenance Request',
                    'description' => $request->description ?? 'No description',
                    'priority' => $request->priority ?? 'medium',
                    'status' => $request->status ?? 'pending',
                    'room_number' => $request->room->number ?? 'N/A',
                    'location' => $request->location ?? 'Room',
                    'reported_by' => $request->reportedBy->name ?? 'System',
                    'created_at' => $request->created_at->format('Y-m-d H:i:s'),
                    'estimated_time' => $request->estimated_time ?? 60,
                ];
            })
            ->toArray();
    }

    /**
     * Get recent activities data.
     */
    private function getRecentActivitiesData($user): array
    {
        // Mock recent activities - implement activity logging system
        return [
            [
                'id' => 1,
                'type' => 'task_completed',
                'title' => 'Completed room cleaning',
                'description' => 'Room 101 cleaned successfully',
                'timestamp' => now()->subHours(2)->format('Y-m-d H:i:s'),
            ],
            [
                'id' => 2,
                'type' => 'task_assigned',
                'title' => 'New task assigned',
                'description' => 'Maintenance request for Room 205',
                'timestamp' => now()->subHours(4)->format('Y-m-d H:i:s'),
            ],
        ];
    }

    /**
     * Get staff schedule data.
     */
    private function getStaffScheduleData($user): array
    {
        // Mock schedule data - implement staff scheduling system
        return [
            'today' => [
                'shift_start' => '08:00',
                'shift_end' => '16:00',
                'break_start' => '12:00',
                'break_end' => '13:00',
                'status' => 'on_duty',
            ],
            'this_week' => [
                ['day' => 'Monday', 'start' => '08:00', 'end' => '16:00'],
                ['day' => 'Tuesday', 'start' => '08:00', 'end' => '16:00'],
                ['day' => 'Wednesday', 'start' => '08:00', 'end' => '16:00'],
                ['day' => 'Thursday', 'start' => '08:00', 'end' => '16:00'],
                ['day' => 'Friday', 'start' => '08:00', 'end' => '16:00'],
                ['day' => 'Saturday', 'start' => 'Off', 'end' => 'Off'],
                ['day' => 'Sunday', 'start' => 'Off', 'end' => 'Off'],
            ],
        ];
    }

    /**
     * Helper methods.
     */
    private function getCompletedTasksCount($userId, $date): int
    {
        // Mock completed tasks count - implement task tracking system
        return rand(3, 8);
    }

    private function updateRoomCleaningStatus($roomId, $status, $staffId): void
    {
        // Implement room cleaning status update
        // This could update a room_cleaning_logs table or room status
    }

    private function updateBookingStatus($bookingId, $status, $taskType): void
    {
        $newStatus = $taskType === 'check_in' ? 'checked_in' : 'checked_out';
        
        Booking::where('id', $bookingId)->update([
            'status' => $newStatus,
            'updated_at' => now(),
        ]);
    }

    private function getEmptyStaffStats(): array
    {
        return [
            'tasksAssigned' => 0,
            'tasksCompleted' => 0,
            'tasksPending' => 0,
            'hoursWorked' => 0,
            'shiftStatus' => 'Off Duty',
            'performance' => 0,
        ];
    }

    private function getEmptyStaffDashboardData(): array
    {
        return [
            'todayStats' => $this->getEmptyStaffStats(),
            'todayTasks' => [],
            'assignedRooms' => [],
            'maintenanceRequests' => [],
            'recentActivities' => [],
            'schedule' => [
                'today' => [
                    'shift_start' => '08:00',
                    'shift_end' => '16:00',
                    'status' => 'off_duty',
                ],
                'this_week' => [],
            ],
            'lastUpdated' => now()->toISOString(),
        ];
    }
}