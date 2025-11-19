import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { 
    ChevronLeft, 
    ChevronRight, 
    ChevronsLeft, 
    ChevronsRight ,
    Users, 
    Bed, 
    DollarSign, 
    Calendar,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle,
    AlertCircle,
    UserCheck,
    Utensils,
    Car,
    Wifi,
    Star
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useState, useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard', // dashboard title
        href: '/dashboard', 
    },
];

interface PaginationState {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
}

interface DashboardStats {
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    rejectedBookings: number;
    totalRevenue: number;
    avgBookingValue: number;
    todayRequests: number;
    todayProcessed: number;
    revenueGrowth: number;
}

interface RecentBooking {
    id: number;
    guest_name: string;
    room_type: string;
    check_in: string;
    status: 'pending' | 'confirmed' | 'rejected';
    total_amount: number;
}

interface MaintenanceRequest {
    id: number;
    room: string;
    issue: string;
    priority: 'high' | 'medium' | 'low';
    status: 'pending' | 'in-progress' | 'completed';
}

interface DashboardData {
    bookingStats: DashboardStats;
    recentBookings: RecentBooking[];
    totalRooms?: number;
    occupiedRooms?: number;
    availableRooms?: number;
    occupancyRate?: number;
    revenueGrowth?: number;
    avgRating?: number;
    staffOnDuty?: number;
    checkInsToday?: number;
    checkOutsToday?: number;
}

interface PageProps {
    dashboardData?: DashboardData;
    userRole: string;
    isAdmin: boolean;
    error?: string;
    [key: string]: unknown;
}

export default function Dashboard() {
    const { props } = usePage<PageProps>();
    const { userRole, isAdmin, error: serverError } = props;
    const [paginationState, setPaginationState] = useState<PaginationState>({
    currentPage: 1,
    itemsPerPage: 3,
    totalItems: 0,
   });

const getTotalPages = () => {
    return Math.ceil(paginationState.totalItems / paginationState.itemsPerPage);
};

const handlePageChange = (page: number) => {
    setPaginationState(prev => ({
        ...prev,
        currentPage: page
    }));
};

const handlePreviousPage = () => {
    if (paginationState.currentPage > 1) {
        handlePageChange(paginationState.currentPage - 1);
    }
};

const handleNextPage = () => {
    if (paginationState.currentPage < getTotalPages()) {
        handlePageChange(paginationState.currentPage + 1);
    }
};

const handleFirstPage = () => {
    handlePageChange(1);
};

const handleLastPage = () => {
    handlePageChange(getTotalPages());
};
    const [dashboardData, setDashboardData] = useState<DashboardData>({
        bookingStats: {
            totalBookings: 0,
            pendingBookings: 0,
            confirmedBookings: 0,
            rejectedBookings: 0,
            totalRevenue: 0,
            avgBookingValue: 0,
            todayRequests: 0,
            todayProcessed: 0,
            revenueGrowth: 0,
        },
        recentBookings: [],
        // Admin-specific defaults
        ...(isAdmin && {
            totalRooms: 150,
            occupiedRooms: 0,
            availableRooms: 0,
            occupancyRate: 0,
            revenueGrowth: 12.5,
            avgRating: 4.6,
            staffOnDuty: 24,
            checkInsToday: 0,
            checkOutsToday: 0,
        }),
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(serverError || null);

    // Mock maintenance requests - keeping static as not in controller
    const maintenanceRequests: MaintenanceRequest[] = [
        { id: 1, room: '205', issue: 'AC not working', priority: 'high', status: 'pending' },
        { id: 2, room: '314', issue: 'Leaky faucet', priority: 'medium', status: 'in-progress' },
        { id: 3, room: '107', issue: 'Light bulb replacement', priority: 'low', status: 'completed' },
    ];

    useEffect(() => {
        fetchDashboardData();
    }, []);

// Update your fetchDashboardData function to set totalItems:

const fetchDashboardData = async () => {
    try {
        setLoading(true);
        setError(null);

        // Determine the correct endpoint based on user role
        const baseUrl = isAdmin ? '/admin/dashboard' : '/dashboard';

        // Fetch dashboard statistics
        const statsResponse = await fetch(`${baseUrl}/stats`, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
        });

        if (!statsResponse.ok) {
            throw new Error(`HTTP error! status: ${statsResponse.status}`);
        }

        const statsData = await statsResponse.json();

        if (!statsData.success) {
            throw new Error(statsData.message || 'Failed to fetch dashboard statistics');
        }

        // Fetch recent bookings
        const bookingsResponse = await fetch(`${baseUrl}/recent-bookings`, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
        });

        let recentBookings: RecentBooking[] = [];
        if (bookingsResponse.ok) {
            const bookingsData = await bookingsResponse.json();
            if (bookingsData.success) {
                recentBookings = bookingsData.recentBookings || [];
            }
        }

        // Use the booking stats from the API
        const bookingStats = statsData.stats;
        
        // Calculate room stats (admin-specific)
        let adminSpecificData = {};
        if (isAdmin) {
            const totalRooms = 150; // You can make this dynamic by adding it to your controller
            const occupiedRooms = bookingStats.confirmedBookings || 0;
            const availableRooms = Math.max(0, totalRooms - occupiedRooms);
            const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100 * 10) / 10 : 0;

            adminSpecificData = {
                totalRooms,
                occupiedRooms,
                availableRooms,
                occupancyRate,
                revenueGrowth: bookingStats.revenueGrowth || 12.5,
                avgRating: 4.6, // Static value - you can add this to your controller
                staffOnDuty: 24, // Static value - you can add this to your controller
                checkInsToday: bookingStats.todayProcessed || 0,
                checkOutsToday: Math.floor(bookingStats.todayProcessed * 0.8) || 0,
            };
        }

        setDashboardData({
            bookingStats,
            recentBookings,
            ...adminSpecificData,
        });

        // *** ADD THIS: Update pagination state with total items ***
        setPaginationState(prev => ({
            ...prev,
            totalItems: recentBookings.length,
            currentPage: 1 // Reset to first page when data changes
        }));

    } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
        setLoading(false);
    }
};

// Also, make sure your getPaginatedBookings function uses the correct data:
const getPaginatedBookings = () => {
    const startIndex = (paginationState.currentPage - 1) * paginationState.itemsPerPage;
    const endIndex = startIndex + paginationState.itemsPerPage;
    return dashboardData.recentBookings.slice(startIndex, endIndex); // Use dashboardData.recentBookings instead of just recentBookings
};
const handleQuickAction = (action: string) => {
        const baseRoute = isAdmin ? '/admin' : '';
        
        switch (action) {
            case 'new-checkin':
                router.visit(`${baseRoute}/bookings?status=confirmed`);
                break;
            case 'room-management':
                if (isAdmin) {
                    router.visit('/admin/rooms');
                } else {
                    router.visit('/rooms');
                }
                break;
            case 'report-issue':
                // Handle maintenance report
                alert('Maintenance reporting feature coming soon!');
                break;
            case 'guest-directory':
                router.visit(`${baseRoute}/bookings`);
                break;
            case 'new-booking':
                router.visit('/rooms'); // For regular users
                break;
            case 'my-bookings':
                router.visit('/bookings'); // For regular users
                break;
        }
    };

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Loading dashboard data...</p>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (error) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <p className="text-red-600 mb-2">Error loading dashboard</p>
                            <p className="text-muted-foreground text-sm">{error}</p>
                            <button 
                                onClick={fetchDashboardData}
                                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const { bookingStats, recentBookings } = dashboardData;
    
    // Admin-specific data
    const { 
        totalRooms = 0, 
        occupiedRooms = 0, 
        availableRooms = 0, 
        occupancyRate = 0, 
        revenueGrowth = 0, 
        avgRating = 0, 
        staffOnDuty = 0, 
        checkInsToday = 0, 
        checkOutsToday = 0 
    } = dashboardData;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                
                {/* Welcome Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
                        <p className="text-muted-foreground">Here's what's happening at your hotel today.</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {new Date().toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </div>
                </div>

                {/* Key Metrics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₱{bookingStats.totalRevenue.toLocaleString()}</div>
                            <div className="flex items-center text-xs text-muted-foreground">
                                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                                +{revenueGrowth}% from last month
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                            <Bed className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{occupancyRate}%</div>
                            <div className="text-xs text-muted-foreground">
                                {occupiedRooms}/{totalRooms} rooms occupied
                            </div>
                            <Progress value={occupancyRate} className="mt-2" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Check-ins Today</CardTitle>
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{checkInsToday}</div>
                            <div className="text-xs text-muted-foreground">
                                {checkOutsToday} check-outs scheduled
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Guest Rating</CardTitle>
                            <Star className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{avgRating}/5</div>
                            <div className="flex items-center text-xs text-muted-foreground">
                                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                                +0.2 from last month
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    
                    {/* Recent Bookings */}
  <Card className="lg:col-span-2">
    <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Bookings
        </CardTitle>
        <CardDescription>
            Latest reservations and their status 
            {recentBookings.length > 0 && (
                <span className="ml-2 text-xs">
                    ({paginationState.totalItems} total)
                </span>
            )}
        </CardDescription>
    </CardHeader>
    <CardContent>
        <div className="space-y-4">
            {getPaginatedBookings().length > 0 ? (
                <>
                    {getPaginatedBookings().map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Users className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="font-medium">{booking.guest_name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {booking.room_type} • {new Date(booking.check_in).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <Badge variant={booking.status === 'confirmed' ? 'default' : booking.status === 'pending' ? 'secondary' : 'destructive'}>
                                    {booking.status}
                                </Badge>
                                <p className="text-sm text-muted-foreground mt-1">
                                    ₱{booking.total_amount.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                    
                    {/* Pagination Controls */}
                    {getTotalPages() > 1 && (
                        <div className="flex items-center justify-between pt-4 border-t">
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleFirstPage}
                                    disabled={paginationState.currentPage === 1}
                                >
                                    <ChevronsLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePreviousPage}
                                    disabled={paginationState.currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                                <span className="text-sm text-muted-foreground">
                                    Page {paginationState.currentPage} of {getTotalPages()}
                                </span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleNextPage}
                                    disabled={paginationState.currentPage === getTotalPages()}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleLastPage}
                                    disabled={paginationState.currentPage === getTotalPages()}
                                >
                                    <ChevronsRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No recent bookings</p>
                </div>
            )}
        </div>
    </CardContent>
</Card>

                    {/* Room Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bed className="h-5 w-5" />
                                Room Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                    <span className="text-sm">Available</span>
                                </div>
                                <span className="font-medium">{availableRooms}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                                    <span className="text-sm">Occupied</span>
                                </div>
                                <span className="font-medium">{occupiedRooms}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                                    <span className="text-sm">Cleaning</span>
                                </div>
                                <span className="font-medium">5</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                                    <span className="text-sm">Maintenance</span>
                                </div>
                                <span className="font-medium">3</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Maintenance Requests */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5" />
                                Maintenance
                            </CardTitle>
                            <CardDescription>Recent maintenance requests</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {maintenanceRequests.map((request) => (
                                    <div key={request.id} className="flex items-start gap-3 p-2 rounded-lg border">
                                        <div className={`h-2 w-2 rounded-full mt-2 ${
                                            request.priority === 'high' ? 'bg-red-500' :
                                            request.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                        }`}></div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Room {request.room}</p>
                                            <p className="text-xs text-muted-foreground">{request.issue}</p>
                                            <Badge variant="outline" className="mt-1 text-xs">
                                                {request.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Staff Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Staff Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">On Duty</span>
                                <span className="font-medium">{staffOnDuty}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Front Desk</span>
                                <span className="font-medium">4</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Housekeeping</span>
                                <span className="font-medium">12</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Maintenance</span>
                                <span className="font-medium">3</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Security</span>
                                <span className="font-medium">5</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <button 
                                onClick={() => handleQuickAction('new-checkin')}
                                className="w-full flex items-center gap-2 p-2 rounded-lg border hover:bg-accent transition-colors"
                            >
                                <UserCheck className="h-4 w-4" />
                                <span className="text-sm">New Check-in</span>
                            </button>
                            <button 
                                onClick={() => handleQuickAction('room-management')}
                                className="w-full flex items-center gap-2 p-2 rounded-lg border hover:bg-accent transition-colors"
                            >
                                <Bed className="h-4 w-4" />
                                <span className="text-sm">Room Management</span>
                            </button>
                            <button 
                                onClick={() => handleQuickAction('report-issue')}
                                className="w-full flex items-center gap-2 p-2 rounded-lg border hover:bg-accent transition-colors"
                            >
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm">Report Issue</span>
                            </button>
                            <button 
                                onClick={() => handleQuickAction('guest-directory')}
                                className="w-full flex items-center gap-2 p-2 rounded-lg border hover:bg-accent transition-colors"
                            >
                                <Users className="h-4 w-4" />
                                <span className="text-sm">Guest Directory</span>
                            </button>
                        </CardContent>
                    </Card>
                </div>

                {/* Services Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Hotel Services Status</CardTitle>
                        <CardDescription>Overview of hotel amenities and services</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                    <Utensils className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-medium">Restaurant</p>
                                    <p className="text-sm text-green-600">Open</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                    <Car className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium">Valet</p>
                                    <p className="text-sm text-blue-600">Available</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                    <Wifi className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-medium">WiFi</p>
                                    <p className="text-sm text-green-600">100% Uptime</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="font-medium">Pool</p>
                                    <p className="text-sm text-yellow-600">Maintenance</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Booking Statistics Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Booking Overview</CardTitle>
                        <CardDescription>Summary of all booking activities</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{bookingStats.totalBookings}</div>
                                <p className="text-sm text-muted-foreground">Total Bookings</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-600">{bookingStats.pendingBookings}</div>
                                <p className="text-sm text-muted-foreground">Pending</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{bookingStats.confirmedBookings}</div>
                                <p className="text-sm text-muted-foreground">Confirmed</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-muted-foreground">₱{bookingStats.avgBookingValue.toLocaleString()}</div>
                                <p className="text-sm text-muted-foreground">Avg. Booking Value</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}