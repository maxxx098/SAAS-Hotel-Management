import { useState, useEffect, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
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
import { Separator } from '@/components/ui/separator';

export function useToast() {
    // This is a placeholder. Replace with your actual toast logic or library.
    const toast = useCallback(({ title, description, variant }: { title: string, description: string, variant?: string }) => {
        alert(`${title}: ${description}`);
    }, []);
    return { toast };
}

import {
    Calendar,
    Users,
    Bed,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    DollarSign,
    User,
    Phone,
    Mail,
    TrendingUp,
    Eye,
    Check,
    X,
    RefreshCw
} from 'lucide-react';

interface Booking {
    id: number;
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    check_in: string;
    check_out: string;
    adults: number;
    children: number;
    room_type: string;
    room_price: number;
    nights: number;
    total_amount: number;
    status: 'pending' | 'confirmed' | 'rejected';
    booking_date: string;
    special_requests?: string;
    booking_source: string;
}

interface BookingStats {
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    rejectedBookings: number;
    totalRevenue: number;
    avgBookingValue: number;
    todayRequests?: number;
    todayProcessed?: number;
}

interface Props {
    bookings: Booking[];
    stats: BookingStats;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Booking Management',
        href: '/admin/bookings',
    },
];

export default function AdminBookingManagement({ bookings: initialBookings, stats: initialStats }: Props) {
    const [selectedBooking, setSelectedBooking] = useState<number | null>(null);
    const [bookings, setBookings] = useState<Booking[]>(initialBookings);
    const [stats, setStats] = useState<BookingStats>(initialStats);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    // Helper function to format currency
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(Math.round(amount));
    };

    // Replace your handleBookingAction function with this improved version
const handleBookingAction = async (bookingId: number, action: 'confirm' | 'reject') => {
    setLoading(true);
    
    try {
        // Get fresh CSRF token from multiple possible sources
        let csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        
        // If meta tag token is not found, try getting from cookie
        if (!csrfToken) {
            const cookies = document.cookie.split(';');
            const xsrfCookie = cookies.find(cookie => cookie.trim().startsWith('XSRF-TOKEN='));
            if (xsrfCookie) {
                csrfToken = decodeURIComponent(xsrfCookie.split('=')[1]);
            }
        }
        
        // If still no token, try getting from Laravel's global
        if (!csrfToken && (window as any).Laravel?.csrfToken) {
            csrfToken = (window as any).Laravel.csrfToken;
        }
        
        if (!csrfToken) {
            // Last resort: refresh the page to get a new token
            window.location.reload();
            return;
        }

        const response = await fetch(`/admin/bookings/${bookingId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest', // Important for Laravel
            },
            credentials: 'same-origin', // Include cookies
            body: JSON.stringify({
                status: action === 'confirm' ? 'confirmed' : 'rejected',
            }),
        });

        const data = await response.json();

        // Handle CSRF token mismatch specifically
        if (response.status === 419 || (data.message && data.message.includes('CSRF'))) {
            toast({
                title: 'Session Expired',
                description: 'Please refresh the page and try again',
                variant: 'destructive',
            });
            // Refresh the page to get new CSRF token
            setTimeout(() => window.location.reload(), 2000);
            return;
        }

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update booking status');
        }

        // Update the meta tag with potentially new token from response
        if (data.csrf_token) {
            const metaTag = document.querySelector('meta[name="csrf-token"]');
            if (metaTag) {
                metaTag.setAttribute('content', data.csrf_token);
            }
        }

        // Find the booking being updated
        const bookingToUpdate = bookings.find(b => b.id === bookingId);
        if (!bookingToUpdate) {
            throw new Error('Booking not found');
        }

        // Update local state
        setBookings(prev => prev.map(booking => 
            booking.id === bookingId 
                ? { ...booking, status: action === 'confirm' ? 'confirmed' : 'rejected' }
                : booking
        ));

        // Update stats correctly
        setStats(prev => {
            const newStats = { ...prev };
            
            // Only update if the booking was previously pending
            if (bookingToUpdate.status === 'pending') {
                newStats.pendingBookings = Math.max(0, newStats.pendingBookings - 1);
                
                if (action === 'confirm') {
                    newStats.confirmedBookings += 1;
                    newStats.totalRevenue += bookingToUpdate.total_amount;
                    
                    // Recalculate average booking value
                    newStats.avgBookingValue = newStats.confirmedBookings > 0 
                        ? newStats.totalRevenue / newStats.confirmedBookings 
                        : 0;
                } else {
                    newStats.rejectedBookings += 1;
                }
            }
            
            return newStats;
        });

        setSelectedBooking(null);
        
        toast({
            title: 'Success',
            description: `Booking ${action === 'confirm' ? 'confirmed' : 'rejected'} successfully`,
        });
    } catch (error) {
        console.error('Error updating booking:', error);
        toast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to update booking status',
            variant: 'destructive',
        });
    } finally {
        setLoading(false);
    }
};

    const refreshData = () => {
        router.reload({ only: ['bookings', 'stats'] });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary" className="bg-yellow-50 text-yellow-700"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
            case 'confirmed':
                return <Badge variant="default" className="bg-green-50 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>;
            case 'rejected':
                return <Badge variant="destructive" className="bg-red-50 text-red-700"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    const selectedBookingData = bookings.find(b => b.id === selectedBooking);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Booking Management - Admin" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Booking Management</h1>
                        <p className="text-muted-foreground">Review and manage hotel booking requests</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={refreshData}
                            disabled={loading}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                            Admin Panel
                        </Badge>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalBookings}</div>
                            <div className="flex items-center text-xs text-muted-foreground">
                                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                                Active bookings
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.pendingBookings}</div>
                            <div className="text-xs text-muted-foreground">
                                Requires your attention
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.confirmedBookings}</div>
                            <div className="text-xs text-muted-foreground">
                                Ready for check-in
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                            <div className="text-xs text-muted-foreground">
                                Avg: {formatCurrency(stats.avgBookingValue)} per booking
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Booking Requests List */}
                    <div className="lg:col-span-2 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Booking Requests
                                </CardTitle>
                                <CardDescription>
                                    Click on a booking to view details and take action
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {bookings.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>No booking requests found</p>
                                    </div>
                                ) : (
                                    bookings.map((booking) => (
                                        <div
                                            key={booking.id}
                                            className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                                selectedBooking === booking.id
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border hover:border-border/80'
                                            }`}
                                            onClick={() => setSelectedBooking(booking.id)}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="font-semibold text-lg">{booking.guest_name}</h3>
                                                    <p className="text-sm text-gray-600">{booking.room_type}</p>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    {getStatusBadge(booking.status)}
                                                    <div className="text-right">
                                                        <div className="font-bold text-blue-600">{formatCurrency(booking.total_amount)}</div>
                                                        <div className="text-xs text-gray-500">{booking.nights} nights</div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                                                <div className="flex items-center space-x-1">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{booking.check_in}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{booking.check_out}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Users className="h-4 w-4" />
                                                    <span>{booking.adults + booking.children} guests</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Clock className="h-4 w-4" />
                                                    <span>{booking.booking_date}</span>
                                                </div>
                                            </div>

                                            {booking.special_requests && (
                                                <div className="bg-muted p-2 rounded text-sm">
                                                    <strong>Special Requests:</strong> {booking.special_requests}
                                                </div>
                                            )}

                                            {selectedBooking === booking.id && booking.status === 'pending' && (
                                                <div className="mt-3 flex gap-2">
                                                    <Button 
                                                        size="sm" 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleBookingAction(booking.id, 'confirm');
                                                        }}
                                                        disabled={loading}
                                                        className="bg-green-600 hover:bg-green-700"
                                                    >
                                                        <Check className="h-4 w-4 mr-1" />
                                                        Confirm
                                                    </Button>
                                                    <Button 
                                                        variant="destructive" 
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleBookingAction(booking.id, 'reject');
                                                        }}
                                                        disabled={loading}
                                                    >
                                                        <X className="h-4 w-4 mr-1" />
                                                        Reject
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Booking Details Sidebar */}
                    <div className="space-y-6">
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Eye className="h-5 w-5" />
                                    <span>Booking Details</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {selectedBookingData ? (
                                    <div className="space-y-4">
                                        {/* Guest Information */}
                                        <div className="space-y-2">
                                            <h4 className="font-medium flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                Guest Information
                                            </h4>
                                            <div className="space-y-1 text-sm">
                                                <p><strong>Name:</strong> {selectedBookingData.guest_name}</p>
                                                <div className="flex items-center gap-1">
                                                    <Mail className="h-3 w-3" />
                                                    <span>{selectedBookingData.guest_email}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    <span>{selectedBookingData.guest_phone}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Pricing */}
                                        <div className="space-y-2">
                                            <h4 className="font-medium flex items-center gap-2">
                                                <DollarSign className="h-4 w-4" />
                                                Pricing
                                            </h4>
                                            <div className="space-y-1 text-sm">
                                                <div className="flex justify-between">
                                                    <span>Room rate × {selectedBookingData.nights} nights:</span>
                                                    <span>{formatCurrency(selectedBookingData.room_price * selectedBookingData.nights)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Taxes & fees:</span>
                                                    <span>{formatCurrency(selectedBookingData.total_amount - (selectedBookingData.room_price * selectedBookingData.nights))}</span>
                                                </div>
                                                <Separator />
                                                <div className="flex justify-between font-semibold">
                                                    <span>Total:</span>
                                                    <span>{formatCurrency(selectedBookingData.total_amount)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {selectedBookingData.special_requests && (
                                            <>
                                                <Separator />
                                                <div className="space-y-2">
                                                    <h4 className="font-medium">Special Requests</h4>
                                                    <p className="text-sm bg-muted p-2 rounded">
                                                        {selectedBookingData.special_requests}
                                                    </p>
                                                </div>
                                            </>
                                        )}

                                        {selectedBookingData.status === 'pending' && (
                                            <>
                                                <Separator />
                                                <div className="space-y-2">
                                                    <Button 
                                                        className="w-full bg-green-600 hover:bg-green-700"
                                                        onClick={() => handleBookingAction(selectedBookingData.id, 'confirm')}
                                                        disabled={loading}
                                                    >
                                                        <Check className="h-4 w-4 mr-2" />
                                                        Confirm Booking
                                                    </Button>
                                                    <Button 
                                                        variant="destructive" 
                                                        className="w-full"
                                                        onClick={() => handleBookingAction(selectedBookingData.id, 'reject')}
                                                        disabled={loading}
                                                    >
                                                        <X className="h-4 w-4 mr-2" />
                                                        Reject Booking
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>Select a booking to view details</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Today's Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span>New Requests</span>
                                    <Badge variant="secondary">{stats.todayRequests || 0}</Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span>Processed Today</span>
                                    <Badge variant="default">{stats.todayProcessed || 0}</Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span>Pending Review</span>
                                    <Badge variant="secondary" className="bg-yellow-50 text-yellow-700">
                                        {stats.pendingBookings}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}