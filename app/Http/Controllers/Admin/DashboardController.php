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
            
            // Get dashboard data based on user role
            $dashboardData = $isAdmin ? 
                $this->getAdminDashboardData() : 
                $this->getUserDashboardData($user->id);
            
            return Inertia::render('dashboard/index', [
                'dashboardData' => $dashboardData,
                'userRole' => $user->role ?? 'client',
                'isAdmin' => $isAdmin,
            ]);
        } catch (\Exception $e) {
            Log::error('Dashboard data fetch error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => auth()->id(),
            ]);

            return Inertia::render('dashboard/index', [
                'dashboardData' => $this->getEmptyDashboardData(),
                'userRole' => auth()->user()->role ?? 'client',
                'isAdmin' => $this->isAdmin(auth()->user()),
                'error' => 'Failed to load dashboard data',
            ]);
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
     * Get user dashboard data.
     */
    private function getUserDashboardData(int $userId): array
    {
        $bookingStats = $this->getUserBookingStats($userId);
        $recentBookings = $this->getUserRecentBookingsData($userId);

        return [
            'bookingStats' => $bookingStats,
            'recentBookings' => $recentBookings,
            'lastUpdated' => now()->toISOString(),
        ];
    }

    /**
     * Get booking statistics for admins.
     */
    private function getBookingStats(): array
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();
        $lastMonthEnd = Carbon::now()->subMonth()->endOfMonth();

        try {
            // Get current month stats
            $currentStats = DB::table('bookings')
                ->selectRaw('
                    COUNT(*) as total_bookings,
                    SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending_bookings,
                    SUM(CASE WHEN status = "confirmed" THEN 1 ELSE 0 END) as confirmed_bookings,
                    SUM(CASE WHEN status = "rejected" THEN 1 ELSE 0 END) as rejected_bookings,
                    SUM(CASE WHEN status = "confirmed" THEN total_amount ELSE 0 END) as total_revenue,
                    AVG(CASE WHEN status = "confirmed" THEN total_amount ELSE NULL END) as avg_booking_value
                ')
                ->whereDate('created_at', '>=', $thisMonth)
                ->first();

            // Get today's stats
            $todayStats = DB::table('bookings')
                ->selectRaw('
                    COUNT(CASE WHEN DATE(created_at) = ? THEN 1 END) as today_requests,
                    COUNT(CASE WHEN DATE(updated_at) = ? AND status IN ("confirmed", "rejected") THEN 1 END) as today_processed
                ')
                ->setBindings([$today->format('Y-m-d'), $today->format('Y-m-d')])
                ->first();

            // Get last month stats for comparison
            $lastMonthStats = DB::table('bookings')
                ->selectRaw('SUM(CASE WHEN status = "confirmed" THEN total_amount ELSE 0 END) as last_month_revenue')
                ->whereBetween('created_at', [$lastMonth, $lastMonthEnd])
                ->first();

            // Calculate growth
            $revenueGrowth = 0;
            if (($lastMonthStats->last_month_revenue ?? 0) > 0 && ($currentStats->total_revenue ?? 0) > 0) {
                $revenueGrowth = (($currentStats->total_revenue - $lastMonthStats->last_month_revenue) / $lastMonthStats->last_month_revenue) * 100;
            }

            return [
                'totalBookings' => (int) ($currentStats->total_bookings ?? 0),
                'pendingBookings' => (int) ($currentStats->pending_bookings ?? 0),
                'confirmedBookings' => (int) ($currentStats->confirmed_bookings ?? 0),
                'rejectedBookings' => (int) ($currentStats->rejected_bookings ?? 0),
                'totalRevenue' => (float) ($currentStats->total_revenue ?? 0),
                'avgBookingValue' => (float) ($currentStats->avg_booking_value ?? 0),
                'todayRequests' => (int) ($todayStats->today_requests ?? 0),
                'todayProcessed' => (int) ($todayStats->today_processed ?? 0),
                'revenueGrowth' => round($revenueGrowth, 1),
            ];
        } catch (\Exception $e) {
            Log::error('Error getting booking stats', ['error' => $e->getMessage()]);
            return $this->getEmptyBookingStats();
        }
    }

    /**
     * Get booking statistics for a specific user.
     */
    private function getUserBookingStats(int $userId): array
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();
        
        try {
            $stats = DB::table('bookings')
                ->selectRaw('
                    COUNT(*) as total_bookings,
                    SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending_bookings,
                    SUM(CASE WHEN status = "confirmed" THEN 1 ELSE 0 END) as confirmed_bookings,
                    SUM(CASE WHEN status = "rejected" THEN 1 ELSE 0 END) as rejected_bookings,
                    SUM(CASE WHEN status = "confirmed" THEN total_amount ELSE 0 END) as total_spent,
                    AVG(CASE WHEN status = "confirmed" THEN total_amount ELSE NULL END) as avg_booking_value
                ')
                ->where('user_id', $userId)
                ->whereDate('created_at', '>=', $thisMonth)
                ->first();

            $todayStats = DB::table('bookings')
                ->selectRaw('
                    COUNT(CASE WHEN DATE(created_at) = ? THEN 1 END) as today_requests,
                    COUNT(CASE WHEN DATE(updated_at) = ? AND status IN ("confirmed", "rejected") THEN 1 END) as today_processed
                ')
                ->where('user_id', $userId)
                ->setBindings([$today->format('Y-m-d'), $today->format('Y-m-d')])
                ->first();

            return [
                'totalBookings' => (int) ($stats->total_bookings ?? 0),
                'pendingBookings' => (int) ($stats->pending_bookings ?? 0),
                'confirmedBookings' => (int) ($stats->confirmed_bookings ?? 0),
                'rejectedBookings' => (int) ($stats->rejected_bookings ?? 0),
                'totalRevenue' => (float) ($stats->total_spent ?? 0),
                'avgBookingValue' => (float) ($stats->avg_booking_value ?? 0),
                'todayRequests' => (int) ($todayStats->today_requests ?? 0),
                'todayProcessed' => (int) ($todayStats->today_processed ?? 0),
                'revenueGrowth' => 0,
            ];
        } catch (\Exception $e) {
            Log::error('Error getting user booking stats', ['error' => $e->getMessage(), 'user_id' => $userId]);
            return $this->getEmptyBookingStats();
        }
    }

    /**
     * Get room statistics (admin only).
     */
    private function getRoomStats(): array
    {
        try {
            $today = Carbon::today();
            
            // Get total rooms
            $totalRooms = Room::count();
            
            // Get occupied rooms (confirmed bookings for today)
            $occupiedRooms = Booking::where('status', 'confirmed')
                ->whereDate('check_in', '<=', $today)
                ->whereDate('check_out', '>', $today)
                ->count();

            // Get rooms under maintenance
            $maintenanceRooms = Room::where('is_available', false)->count();
            
            // Calculate available rooms
            $availableRooms = max(0, $totalRooms - $occupiedRooms - $maintenanceRooms);
            
            // Calculate occupancy rate
            $occupancyRate = $totalRooms > 0 ? ($occupiedRooms / $totalRooms) * 100 : 0;

            // Get check-ins and check-outs for today
            $checkInsToday = Booking::where('status', 'confirmed')
                ->whereDate('check_in', $today)
                ->count();
                
            $checkOutsToday = Booking::where('status', 'confirmed')
                ->whereDate('check_out', $today)
                ->count();

            return [
                'totalRooms' => $totalRooms,
                'occupiedRooms' => $occupiedRooms,
                'availableRooms' => $availableRooms,
                'maintenanceRooms' => $maintenanceRooms,
                'occupancyRate' => round($occupancyRate, 1),
                'checkInsToday' => $checkInsToday,
                'checkOutsToday' => $checkOutsToday,
            ];
        } catch (\Exception $e) {
            Log::error('Error getting room stats', ['error' => $e->getMessage()]);
            return [
                'totalRooms' => 0,
                'occupiedRooms' => 0,
                'availableRooms' => 0,
                'maintenanceRooms' => 0,
                'occupancyRate' => 0,
                'checkInsToday' => 0,
                'checkOutsToday' => 0,
            ];
        }
    }

    /**
     * Get recent bookings data (admin).
     */
    private function getRecentBookingsData(): array
    {
        try {
            return Booking::with(['user', 'room'])
                ->orderBy('created_at', 'desc')
                ->limit(4)
                ->get()
                ->map(function ($booking) {
                    return [
                        'id' => $booking->id,
                        'guest_name' => $booking->user->name ?? $booking->guest_name ?? 'N/A',
                        'room_type' => $booking->room->name ?? $booking->room_type ?? 'N/A',
                        'check_in' => $booking->check_in ? $booking->check_in->format('Y-m-d') : 'N/A',
                        'status' => $booking->status ?? 'pending',
                        'total_amount' => (float) ($booking->total_amount ?? 0),
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            Log::error('Error getting recent bookings data', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Get recent bookings data for a specific user.
     */
    private function getUserRecentBookingsData(int $userId): array
    {
        try {
            return Booking::with(['room'])
                ->where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->limit(4)
                ->get()
                ->map(function ($booking) {
                    return [
                        'id' => $booking->id,
                        'guest_name' => $booking->guest_name ?? 'N/A',
                        'room_type' => $booking->room->name ?? $booking->room_type ?? 'N/A',
                        'check_in' => $booking->check_in ? $booking->check_in->format('Y-m-d') : 'N/A',
                        'status' => $booking->status ?? 'pending',
                        'total_amount' => (float) ($booking->total_amount ?? 0),
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            Log::error('Error getting user recent bookings data', ['error' => $e->getMessage(), 'user_id' => $userId]);
            return [];
        }
    }

    /**
     * Get empty booking stats.
     */
    private function getEmptyBookingStats(): array
    {
        return [
            'totalBookings' => 0,
            'pendingBookings' => 0,
            'confirmedBookings' => 0,
            'rejectedBookings' => 0,
            'totalRevenue' => 0,
            'avgBookingValue' => 0,
            'todayRequests' => 0,
            'todayProcessed' => 0,
            'revenueGrowth' => 0,
        ];
    }

    /**
     * Get empty dashboard data structure.
     */
    private function getEmptyDashboardData(): array
    {
        return [
            'bookingStats' => $this->getEmptyBookingStats(),
            'roomStats' => [
                'totalRooms' => 0,
                'occupiedRooms' => 0,
                'availableRooms' => 0,
                'maintenanceRooms' => 0,
                'occupancyRate' => 0,
                'checkInsToday' => 0,
                'checkOutsToday' => 0,
            ],
            'recentBookings' => [],
            'lastUpdated' => now()->toISOString(),
        ];
    }
}