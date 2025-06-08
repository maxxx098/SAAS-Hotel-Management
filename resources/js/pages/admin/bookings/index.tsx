import { useState } from 'react';
import { Head } from '@inertiajs/react';
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
    MapPin,
    Star,
    TrendingUp,
    Eye,
    Check,
    X
} from 'lucide-react';

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

// Mock data for booking requests
const bookingRequests = [
    {
        id: 1,
        guest_name: 'John Smith',
        guest_email: 'john.smith@email.com',
        guest_phone: '+1 (555) 123-4567',
        check_in: '2024-06-15',
        check_out: '2024-06-18',
        adults: 2,
        children: 1,
        room_type: 'Deluxe Ocean View',
        room_price: 299,
        nights: 3,
        total_amount: 1007.64,
        status: 'pending',
        booking_date: '2024-06-08',
        special_requests: 'Late check-in requested, celebrating anniversary',
        booking_source: 'website'
    },
    {
        id: 2,
        guest_name: 'Sarah Johnson',
        guest_email: 'sarah.j@email.com',
        guest_phone: '+1 (555) 987-6543',
        check_in: '2024-06-20',
        check_out: '2024-06-25',
        adults: 1,
        children: 0,
        room_type: 'Executive Suite',
        room_price: 459,
        nights: 5,
        total_amount: 2570.40,
        status: 'pending',
        booking_date: '2024-06-07',
        special_requests: 'Business trip, need early check-in',
        booking_source: 'phone'
    },
    {
        id: 3,
        guest_name: 'Mike Wilson',
        guest_email: 'mike.wilson@email.com',
        guest_phone: '+1 (555) 456-7890',
        check_in: '2024-06-12',
        check_out: '2024-06-14',
        adults: 2,
        children: 0,
        room_type: 'Standard Room',
        room_price: 179,
        nights: 2,
        total_amount: 400.96,
        status: 'confirmed',
        booking_date: '2024-06-06',
        special_requests: 'Ground floor room preferred',
        booking_source: 'website'
    },
    {
        id: 4,
        guest_name: 'Emma Davis',
        guest_email: 'emma.davis@email.com',
        guest_phone: '+1 (555) 321-0987',
        check_in: '2024-06-10',
        check_out: '2024-06-12',
        adults: 4,
        children: 2,
        room_type: 'Executive Suite',
        room_price: 459,
        nights: 2,
        total_amount: 1028.16,
        status: 'rejected',
        booking_date: '2024-06-05',
        special_requests: 'Extra beds for children',
        booking_source: 'mobile_app'
    }
];

// Dashboard statistics
const bookingStats = {
    totalBookings: bookingRequests.length,
    pendingBookings: bookingRequests.filter(b => b.status === 'pending').length,
    confirmedBookings: bookingRequests.filter(b => b.status === 'confirmed').length,
    rejectedBookings: bookingRequests.filter(b => b.status === 'rejected').length,
    totalRevenue: bookingRequests
        .filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + b.total_amount, 0),
    avgBookingValue: bookingRequests
        .filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + b.total_amount, 0) / bookingRequests.filter(b => b.status === 'confirmed').length || 0
};

export default function AdminBookingManagement() {
    const [selectedBooking, setSelectedBooking] = useState<number | null>(null);
    const [bookings, setBookings] = useState(bookingRequests);

    const handleBookingAction = (bookingId: number, action: 'confirm' | 'reject') => {
        setBookings(prev => prev.map(booking => 
            booking.id === bookingId 
                ? { ...booking, status: action === 'confirm' ? 'confirmed' : 'rejected' }
                : booking
        ));
        setSelectedBooking(null);
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
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                        Admin Panel
                    </Badge>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{bookingStats.totalBookings}</div>
                            <div className="flex items-center text-xs text-muted-foreground">
                                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                                +12% from last week
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{bookingStats.pendingBookings}</div>
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
                            <div className="text-2xl font-bold text-green-600">{bookingStats.confirmedBookings}</div>
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
                            <div className="text-2xl font-bold">${bookingStats.totalRevenue.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">
                                Avg: ${bookingStats.avgBookingValue.toFixed(0)} per booking
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
                                {bookings.map((booking) => (
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
                                                    <div className="font-bold text-blue-600">${booking.total_amount.toFixed(2)}</div>
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

                                        {selectedBooking === booking.id && (
                                            <div className="mt-3 flex gap-2">
                                                <Button 
                                                    size="sm" 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleBookingAction(booking.id, 'confirm');
                                                    }}
                                                    disabled={booking.status !== 'pending'}
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
                                                    disabled={booking.status !== 'pending'}
                                                >
                                                    <X className="h-4 w-4 mr-1" />
                                                    Reject
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
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

                                        {/* Stay Details */}
                                        <div className="space-y-2">
                                            <h4 className="font-medium flex items-center gap-2">
                                                <Bed className="h-4 w-4" />
                                                Stay Details
                                            </h4>
                                            <div className="space-y-1 text-sm">
                                                <p><strong>Room:</strong> {selectedBookingData.room_type}</p>
                                                <p><strong>Check-in:</strong> {selectedBookingData.check_in}</p>
                                                <p><strong>Check-out:</strong> {selectedBookingData.check_out}</p>
                                                <p><strong>Guests:</strong> {selectedBookingData.adults} adults, {selectedBookingData.children} children</p>
                                                <p><strong>Source:</strong> {selectedBookingData.booking_source}</p>
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
                                                    <span>${(selectedBookingData.room_price * selectedBookingData.nights).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Taxes & fees:</span>
                                                    <span>${(selectedBookingData.total_amount - (selectedBookingData.room_price * selectedBookingData.nights)).toFixed(2)}</span>
                                                </div>
                                                <Separator />
                                                <div className="flex justify-between font-semibold">
                                                    <span>Total:</span>
                                                    <span>${selectedBookingData.total_amount.toFixed(2)}</span>
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
                                                    >
                                                        <Check className="h-4 w-4 mr-2" />
                                                        Confirm Booking
                                                    </Button>
                                                    <Button 
                                                        variant="destructive" 
                                                        className="w-full"
                                                        onClick={() => handleBookingAction(selectedBookingData.id, 'reject')}
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
                                    <Badge variant="secondary">3</Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span>Processed Today</span>
                                    <Badge variant="default">7</Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span>Response Time</span>
                                    <span className="text-green-600"> 2 hours</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}