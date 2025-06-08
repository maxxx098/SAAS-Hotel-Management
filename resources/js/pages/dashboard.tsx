import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { 
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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

// Mock data - replace with actual data from your backend
const dashboardData = {
    stats: {
        totalRooms: 150,
        occupiedRooms: 128,
        availableRooms: 22,
        revenue: 45230,
        checkInsToday: 18,
        checkOutsToday: 15,
        avgRating: 4.6,
        staffOnDuty: 24
    },
    occupancyRate: 85.3,
    revenueGrowth: 12.5,
    recentBookings: [
        { id: 1, guest: 'John Smith', room: '301', checkIn: '2024-06-07', status: 'confirmed' },
        { id: 2, guest: 'Sarah Johnson', room: '205', checkIn: '2024-06-07', status: 'pending' },
        { id: 3, guest: 'Mike Wilson', room: '412', checkIn: '2024-06-08', status: 'confirmed' },
        { id: 4, guest: 'Emma Davis', room: '108', checkIn: '2024-06-08', status: 'confirmed' },
    ],
    maintenanceRequests: [
        { id: 1, room: '205', issue: 'AC not working', priority: 'high', status: 'pending' },
        { id: 2, room: '314', issue: 'Leaky faucet', priority: 'medium', status: 'in-progress' },
        { id: 3, room: '107', issue: 'Light bulb replacement', priority: 'low', status: 'completed' },
    ]
};

export default function Dashboard() {
    const { stats, occupancyRate, revenueGrowth, recentBookings, maintenanceRequests } = dashboardData;

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
                            <div className="text-2xl font-bold">${stats.revenue.toLocaleString()}</div>
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
                                {stats.occupiedRooms}/{stats.totalRooms} rooms occupied
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
                            <div className="text-2xl font-bold">{stats.checkInsToday}</div>
                            <div className="text-xs text-muted-foreground">
                                {stats.checkOutsToday} check-outs scheduled
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Guest Rating</CardTitle>
                            <Star className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.avgRating}/5</div>
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
                            <CardDescription>Latest reservations and their status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentBookings.map((booking) => (
                                    <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg border">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Users className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{booking.guest}</p>
                                                <p className="text-sm text-muted-foreground">Room {booking.room} • {booking.checkIn}</p>
                                            </div>
                                        </div>
                                        <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                                            {booking.status}
                                        </Badge>
                                    </div>
                                ))}
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
                                <span className="font-medium">{stats.availableRooms}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                                    <span className="text-sm">Occupied</span>
                                </div>
                                <span className="font-medium">{stats.occupiedRooms}</span>
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
                                <span className="font-medium">{stats.staffOnDuty}</span>
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
                            <button className="w-full flex items-center gap-2 p-2 rounded-lg border hover:bg-accent transition-colors">
                                <UserCheck className="h-4 w-4" />
                                <span className="text-sm">New Check-in</span>
                            </button>
                            <button className="w-full flex items-center gap-2 p-2 rounded-lg border hover:bg-accent transition-colors">
                                <Bed className="h-4 w-4" />
                                <span className="text-sm">Room Management</span>
                            </button>
                            <button className="w-full flex items-center gap-2 p-2 rounded-lg border hover:bg-accent transition-colors">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm">Report Issue</span>
                            </button>
                            <button className="w-full flex items-center gap-2 p-2 rounded-lg border hover:bg-accent transition-colors">
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
            </div>
        </AppLayout>
    );
}