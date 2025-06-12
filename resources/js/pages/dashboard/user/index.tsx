import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    DollarSign,
    User,
    Phone,
    Mail,
    MapPin,
    Star,
    Bed,
    Users,
    Utensils,
    Car,
    Wifi,
    Coffee,
    Dumbbell,
    Shield,
    CreditCard,
    Bell,
    Settings,
    BookOpen,
    Heart,
    Gift,
    MessageSquare
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface UserBooking {
    id: number;
    room_type: string;
    room_number?: string;
    check_in: string;
    check_out: string;
    adults: number;
    children: number;
    nights: number;
    total_amount: number;
    status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
    booking_date: string;
    special_requests?: string;
    booking_reference: string;
}

interface UserStats {
    totalBookings: number;
    activeBookings: number;
    completedStays: number;
    totalSpent: number;
    loyaltyPoints: number;
    membershipTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
    upcomingBookings: number;
}

interface HotelService {
    id: number;
    name: string;
    description: string;
    icon: string;
    status: 'available' | 'unavailable' | 'maintenance';
    hours?: string;
}

interface Props {
    user: {
        id: number;
        name: string;
        email: string;
        phone?: string;
        member_since?: string;
    };
    userStats: UserStats;
    recentBookings: UserBooking[];
    upcomingBookings: UserBooking[];
    hotelServices: HotelService[];
    notifications?: Array<{
        id: number;
        message: string;
        type: 'info' | 'success' | 'warning';
        created_at: string;
    }>;
}

export default function UserDashboard({ 
    user, 
    userStats, 
    recentBookings, 
    upcomingBookings,
    hotelServices,
    notifications = []
}: Props) {
    const [loading, setLoading] = useState(false);

    // Helper function to format currency
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(Math.round(amount));
    };

    // Helper function to format date
    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Get status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary" className="bg-yellow-50 text-yellow-700"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
            case 'confirmed':
                return <Badge variant="default" className="bg-green-50 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>;
            case 'checked_in':
                return <Badge variant="default" className="bg-blue-50 text-blue-700"><User className="h-3 w-3 mr-1" />Checked In</Badge>;
            case 'checked_out':
                return <Badge variant="outline" className="bg-gray-50 text-gray-700"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
            case 'cancelled':
                return <Badge variant="destructive" className="bg-red-50 text-red-700"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    // Get membership tier color
    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'Bronze': return 'text-amber-600';
            case 'Silver': return 'text-gray-500';
            case 'Gold': return 'text-yellow-500';
            case 'Platinum': return 'text-purple-600';
            default: return 'text-gray-500';
        }
    };

    // Get service icon
    const getServiceIcon = (iconName: string) => {
        const iconMap: { [key: string]: JSX.Element } = {
            'restaurant': <Utensils className="h-5 w-5" />,
            'wifi': <Wifi className="h-5 w-5" />,
            'parking': <Car className="h-5 w-5" />,
            'gym': <Dumbbell className="h-5 w-5" />,
            'spa': <Heart className="h-5 w-5" />,
            'coffee': <Coffee className="h-5 w-5" />,
            'security': <Shield className="h-5 w-5" />,
            'concierge': <Bell className="h-5 w-5" />,
        };
        return iconMap[iconName] || <Star className="h-5 w-5" />;
    };

    // Quick actions
    const handleQuickAction = (action: string) => {
        switch (action) {
            case 'new-booking':
                router.visit('/rooms');
                break;
            case 'my-bookings':
                router.visit('/my-bookings');
                break;
            case 'profile':
                router.visit('/profile');
                break;
            case 'support':
                router.visit('/support');
                break;
            case 'services':
                router.visit('/services');
                break;
            case 'reviews':
                router.visit('/reviews');
                break;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                
                {/* Welcome Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Welcome back, {user?.name ? user.name.split(' ')[0] : 'Guest'}!
                        </h1>
                        <p className="text-muted-foreground">Manage your bookings and explore our hotel services.</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Badge variant="outline" className={`${getTierColor(userStats?.membershipTier ?? 'Bronze')} border-current`}>
                            <Star className="h-3 w-3 mr-1" />
                            {(userStats?.membershipTier ?? 'Bronze')} Member
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                            {new Date().toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </div>
                    </div>
                </div>

                {/* Quick Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{userStats?.activeBookings ?? 0}</div>
                            <div className="text-xs text-muted-foreground">
                                {userStats?.upcomingBookings ?? 0} upcoming
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(userStats?.totalSpent ?? 0)}</div>
                            <div className="text-xs text-muted-foreground">
                                {userStats?.completedStays ?? 0} completed stays
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
                            <Gift className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{(userStats?.loyaltyPoints ?? 0).toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">
                                {(userStats?.membershipTier ?? 'Bronze')} tier benefits
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Member Since</CardTitle>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {user?.member_since ? new Date(user.member_since).getFullYear() : '2024'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Valued guest
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    
                    {/* Upcoming Bookings */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Upcoming Bookings
                            </CardTitle>
                            <CardDescription>Your confirmed reservations</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {(upcomingBookings?.length ?? 0) > 0 ? (
                                    (upcomingBookings ?? []).slice(0, 3).map((booking) => (
                                        <div key={booking.id} className="flex items-center justify-between p-4 rounded-lg border">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <Bed className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{booking.room_type}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {formatDate(booking.check_in)} - {formatDate(booking.check_out)}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {booking.adults + booking.children} guests • {booking.nights} nights
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {getStatusBadge(booking.status)}
                                                <p className="text-sm font-medium mt-1">
                                                    {formatCurrency(booking.total_amount)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Ref: {booking.booking_reference}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p className="mb-2">No upcoming bookings</p>
                                        <Button onClick={() => handleQuickAction('new-booking')} size="sm">
                                            Book Your Stay
                                        </Button>
                                    </div>
                                )}
                            </div>
                            {(upcomingBookings?.length ?? 0) > 3 && (
                                <div className="mt-4 pt-4 border-t">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => handleQuickAction('my-bookings')}
                                        className="w-full"
                                    >
                                        View All Bookings
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <button 
                                onClick={() => handleQuickAction('new-booking')}
                                className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                            >
                                <Calendar className="h-4 w-4" />
                                <span className="text-sm">Book a Room</span>
                            </button>
                            <button 
                                onClick={() => handleQuickAction('my-bookings')}
                                className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                            >
                                <BookOpen className="h-4 w-4" />
                                <span className="text-sm">My Bookings</span>
                            </button>
                            <button 
                                onClick={() => handleQuickAction('services')}
                                className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                            >
                                <Utensils className="h-4 w-4" />
                                <span className="text-sm">Hotel Services</span>
                            </button>
                            <button 
                                onClick={() => handleQuickAction('support')}
                                className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                            >
                                <MessageSquare className="h-4 w-4" />
                                <span className="text-sm">Contact Support</span>
                            </button>
                            <button 
                                onClick={() => handleQuickAction('profile')}
                                className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                            >
                                <Settings className="h-4 w-4" />
                                <span className="text-sm">Profile Settings</span>
                            </button>
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Recent Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {(recentBookings ?? []).slice(0, 4).map((booking) => (
                                    <div key={booking.id} className="flex items-start gap-3 p-2 rounded-lg border">
                                        <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{booking.room_type}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(booking.booking_date)}
                                            </p>
                                        </div>
                                        {getStatusBadge(booking.status)}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Loyalty Progress */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="h-5 w-5" />
                                Loyalty Program
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Current Tier: {userStats?.membershipTier ?? 'Bronze'}</span>
                                    <span className="text-sm text-muted-foreground">
                                        {(userStats?.loyaltyPoints ?? 0).toLocaleString()} pts
                                    </span>
                                </div>
                                <Progress 
                                    value={
                                        userStats?.membershipTier === 'Bronze' ? 25 :
                                        userStats?.membershipTier === 'Silver' ? 50 :
                                        userStats?.membershipTier === 'Gold' ? 75 :
                                        userStats?.membershipTier === 'Platinum' ? 100 : 0
                                    } 
                                    className="h-2" 
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    {userStats?.membershipTier === 'Platinum' 
                                        ? 'You\'ve reached the highest tier!' 
                                        : `${userStats?.loyaltyPoints !== undefined && userStats.loyaltyPoints < 1000 ? 1000 - userStats.loyaltyPoints : 0} points to next tier`
                                    }
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Current Benefits:</h4>
                                <ul className="text-xs text-muted-foreground space-y-1">
                                    <li>• Free Wi-Fi</li>
                                    <li>• Late checkout</li>
                                    {userStats?.membershipTier !== 'Bronze' && <li>• Complimentary breakfast</li>}
                                    {(userStats?.membershipTier === 'Gold' || userStats?.membershipTier === 'Platinum') && <li>• Room upgrades</li>}
                                    {userStats?.membershipTier === 'Platinum' && <li>• Concierge service</li>}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notifications */}
                    {notifications.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="h-5 w-5" />
                                    Notifications
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {notifications.slice(0, 3).map((notification) => (
                                        <div key={notification.id} className="flex items-start gap-3 p-2 rounded-lg border">
                                            <div className={`h-2 w-2 rounded-full mt-2 ${
                                                notification.type === 'success' ? 'bg-green-500' :
                                                notification.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                                            }`}></div>
                                            <div className="flex-1">
                                                <p className="text-sm">{notification.message}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDate(notification.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Hotel Services */}
                <Card>
                    <CardHeader>
                        <CardTitle>Hotel Services</CardTitle>
                        <CardDescription>Available amenities and services for your convenience</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {hotelServices?.slice(0, 6).map((service) => (
                                <div key={service.id} className="flex flex-col items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                                        service.status === 'available' ? 'bg-green-100 dark:bg-green-900/20 text-green-600' :
                                        service.status === 'maintenance' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600' :
                                        'bg-gray-100 dark:bg-gray-900/20 text-gray-600'
                                    }`}>
                                        {getServiceIcon(service.icon)}
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium">{service.name}</p>
                                        <p className={`text-xs ${
                                            service.status === 'available' ? 'text-green-600' :
                                            service.status === 'maintenance' ? 'text-yellow-600' :
                                            'text-gray-600'
                                        }`}>
                                            {service.status === 'available' ? 'Available' :
                                             service.status === 'maintenance' ? 'Maintenance' : 'Unavailable'}
                                        </p>
                                        {service.hours && (
                                            <p className="text-xs text-muted-foreground">{service.hours}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {hotelServices && hotelServices.length > 6 && (
                            <div className="mt-4 text-center">
                                <Button 
                                    variant="outline" 
                                    onClick={() => handleQuickAction('services')}
                                >
                                    View All Services
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Need Assistance?</CardTitle>
                        <CardDescription>Get in touch with our team</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-3 p-3 rounded-lg border">
                                <Phone className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="font-medium">Front Desk</p>
                                    <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg border">
                                <Mail className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="font-medium">Email Support</p>
                                    <p className="text-sm text-muted-foreground">help@hotel.com</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg border">
                                <MessageSquare className="h-5 w-5 text-purple-600" />
                                <div>
                                    <p className="font-medium">Live Chat</p>
                                    <p className="text-sm text-muted-foreground">Available 24/7</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}