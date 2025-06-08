import { SetStateAction, useState } from 'react';
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
import {
    Calendar,
    Users,
    Bed,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    DollarSign,
    Edit,
    Trash2,
    Plus,
    MapPin,
    Phone,
    Mail,
    CalendarDays,
    Receipt,
    Eye,
    EyeOff,
    Save,
    X
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'My Bookings',
        href: '/bookings',
    },
];

// Mock data for user's bookings
const userBookings = [
    {
        id: 1,
        booking_reference: 'HTL-2024-001',
        hotel_name: 'Grand Ocean Resort',
        hotel_address: '123 Beachfront Ave, Miami, FL',
        check_in: '2024-06-15',
        check_out: '2024-06-18',
        adults: 2,
        children: 1,
        room_type: 'Deluxe Ocean View',
        room_price: 299,
        nights: 3,
        total_amount: 1007.64,
        status: 'confirmed',
        booking_date: '2024-06-08',
        special_requests: 'Late check-in requested, celebrating anniversary',
        can_cancel: true,
        can_modify: true
    },
    {
        id: 2,
        booking_reference: 'HTL-2024-002',
        hotel_name: 'Downtown Business Hotel',
        hotel_address: '456 Corporate Blvd, New York, NY',
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
        can_cancel: true,
        can_modify: true
    },
    {
        id: 3,
        booking_reference: 'HTL-2024-003',
        hotel_name: 'City Center Inn',
        hotel_address: '789 Main Street, Chicago, IL',
        check_in: '2024-05-12',
        check_out: '2024-05-14',
        adults: 2,
        children: 0,
        room_type: 'Standard Room',
        room_price: 179,
        nights: 2,
        total_amount: 400.96,
        status: 'completed',
        booking_date: '2024-05-06',
        special_requests: 'Ground floor room preferred',
        can_cancel: false,
        can_modify: false
    },
    {
        id: 4,
        booking_reference: 'HTL-2024-004',
        hotel_name: 'Mountain View Lodge',
        hotel_address: '321 Alpine Road, Denver, CO',
        check_in: '2024-06-10',
        check_out: '2024-06-12',
        adults: 4,
        children: 2,
        room_type: 'Family Suite',
        room_price: 389,
        nights: 2,
        total_amount: 870.32,
        status: 'cancelled',
        booking_date: '2024-06-05',
        special_requests: 'Extra beds for children',
        can_cancel: false,
        can_modify: false
    }
];

export default function UserBookingManagement() {
    const [bookings, setBookings] = useState(userBookings);
    type Booking = typeof userBookings[number];

    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
    const [expandedBooking, setExpandedBooking] = useState<number | null>(null);

    const handleCancelBooking = (bookingId: number) => {
        setBookings(prev => prev.map(booking => 
            booking.id === bookingId 
                ? { ...booking, status: 'cancelled', can_cancel: false, can_modify: false }
                : booking
        ));
        setIsCancelDialogOpen(false);
        setBookingToCancel(null);
    };

    const handleEditBooking = (booking: Booking) => {
        setEditingBooking({
            ...booking,
            check_in: booking.check_in,
            check_out: booking.check_out,
            adults: booking.adults,
            children: booking.children,
            special_requests: booking.special_requests
        });
        setIsEditDialogOpen(true);
    };

    const handleSaveEdit = () => {
        if (!editingBooking) return;
        setBookings(prev => prev.map(booking => 
            booking.id === editingBooking.id 
                ? { ...booking, ...editingBooking, status: 'pending' }
                : booking
        ));
        setIsEditDialogOpen(false);
        setEditingBooking(null);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
            case 'confirmed':
                return <Badge variant="default" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>;
            case 'completed':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
            case 'cancelled':
                return <Badge variant="destructive" className="bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'text-green-600 dark:text-green-400';
            case 'pending': return 'text-yellow-600 dark:text-yellow-400';
            case 'completed': return 'text-blue-600 dark:text-blue-400';
            case 'cancelled': return 'text-red-600 dark:text-red-400';
            default: return 'text-gray-600 dark:text-gray-400';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Bookings" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
                        <p className="text-muted-foreground">Manage your hotel reservations and bookings</p>
                    </div>
                    <Button className="bg-primary hover:bg-primary/90">
                        <Plus className="h-4 w-4 mr-2" />
                        New Booking
                    </Button>
                </div>

                {/* Quick Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Bookings</p>
                                    <p className="text-2xl font-bold">{bookings.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <Clock className="h-5 w-5 text-yellow-500" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Pending</p>
                                    <p className="text-2xl font-bold text-yellow-600">{bookings.filter(b => b.status === 'pending').length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Confirmed</p>
                                    <p className="text-2xl font-bold text-green-600">{bookings.filter(b => b.status === 'confirmed').length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <DollarSign className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Spent</p>
                                    <p className="text-2xl font-bold">${bookings.filter(b => b.status !== 'cancelled').reduce((sum, b) => sum + b.total_amount, 0).toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Bookings List */}
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <Card key={booking.id} className="overflow-hidden">
                            <CardContent className="p-0">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center space-x-2">
                                                <h3 className="text-xl font-semibold">{booking.hotel_name}</h3>
                                                {getStatusBadge(booking.status)}
                                            </div>
                                            <p className="text-sm text-muted-foreground flex items-center">
                                                <MapPin className="h-3 w-3 mr-1" />
                                                {booking.hotel_address}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Booking Reference: <span className="font-mono">{booking.booking_reference}</span>
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-primary">${booking.total_amount.toFixed(2)}</div>
                                            <div className="text-sm text-muted-foreground">{booking.nights} nights</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        <div className="flex items-center space-x-2 text-sm">
                                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-muted-foreground">Check-in</p>
                                                <p className="font-medium">{booking.check_in}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm">
                                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-muted-foreground">Check-out</p>
                                                <p className="font-medium">{booking.check_out}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-muted-foreground">Guests</p>
                                                <p className="font-medium">{booking.adults + booking.children} guests</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm">
                                            <Bed className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-muted-foreground">Room</p>
                                                <p className="font-medium">{booking.room_type}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {booking.special_requests && (
                                        <div className="bg-muted p-3 rounded-lg mb-4">
                                            <p className="text-sm">
                                                <strong>Special Requests:</strong> {booking.special_requests}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setExpandedBooking(expandedBooking === booking.id ? null : booking.id)}
                                            >
                                                {expandedBooking === booking.id ? (
                                                    <>
                                                        <EyeOff className="h-4 w-4 mr-1" />
                                                        Hide Details
                                                    </>
                                                ) : (
                                                    <>
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View Details
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                        
                                        <div className="flex items-center space-x-2">
                                            {booking.can_modify && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditBooking(booking)}
                                                >
                                                    <Edit className="h-4 w-4 mr-1" />
                                                    Modify
                                                </Button>
                                            )}
                                            {booking.can_cancel && (
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => {
                                                        setBookingToCancel(booking);
                                                        setIsCancelDialogOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    Cancel
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {expandedBooking === booking.id && (
                                        <>
                                            <Separator className="my-4" />
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-3">
                                                        <h4 className="font-medium flex items-center">
                                                            <Receipt className="h-4 w-4 mr-2" />
                                                            Booking Details
                                                        </h4>
                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex justify-between">
                                                                <span>Room rate × {booking.nights} nights:</span>
                                                                <span>${(booking.room_price * booking.nights).toFixed(2)}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>Taxes & fees:</span>
                                                                <span>${(booking.total_amount - (booking.room_price * booking.nights)).toFixed(2)}</span>
                                                            </div>
                                                            <Separator />
                                                            <div className="flex justify-between font-semibold">
                                                                <span>Total Amount:</span>
                                                                <span>${booking.total_amount.toFixed(2)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <h4 className="font-medium">Booking Information</h4>
                                                        <div className="space-y-2 text-sm">
                                                            <p><strong>Booked on:</strong> {booking.booking_date}</p>
                                                            <p><strong>Status:</strong> <span className={getStatusColor(booking.status)}>{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span></p>
                                                            <p><strong>Adults:</strong> {booking.adults}</p>
                                                            <p><strong>Children:</strong> {booking.children}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Edit Booking Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Modify Booking</DialogTitle>
                            <DialogDescription>
                                Update your booking details. Changes may require approval.
                            </DialogDescription>
                        </DialogHeader>
                        {editingBooking && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="check_in">Check-in Date</Label>
                                        <Input
                                            id="check_in"
                                            type="date"
                                            value={editingBooking.check_in}
                                            onChange={(e) => setEditingBooking({...editingBooking, check_in: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="check_out">Check-out Date</Label>
                                        <Input
                                            id="check_out"
                                            type="date"
                                            value={editingBooking.check_out}
                                            onChange={(e) => setEditingBooking({...editingBooking, check_out: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="adults">Adults</Label>
                                        <Input
                                            id="adults"
                                            type="number"
                                            min="1"
                                            value={editingBooking.adults}
                                            onChange={(e) => setEditingBooking({...editingBooking, adults: parseInt(e.target.value)})}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="children">Children</Label>
                                        <Input
                                            id="children"
                                            type="number"
                                            min="0"
                                            value={editingBooking.children}
                                            onChange={(e) => setEditingBooking({...editingBooking, children: parseInt(e.target.value)})}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="special_requests">Special Requests</Label>
                                    <textarea
                                        id="special_requests"
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        value={editingBooking.special_requests}
                                        onChange={(e) => setEditingBooking({...editingBooking, special_requests: e.target.value})}
                                        placeholder="Any special requests or notes..."
                                    />
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                        <X className="h-4 w-4 mr-1" />
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSaveEdit}>
                                        <Save className="h-4 w-4 mr-1" />
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Cancel Booking Dialog */}
                <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Cancel Booking</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to cancel this booking? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        {bookingToCancel && (
                            <div className="space-y-4">
                                <div className="bg-muted p-4 rounded-lg">
                                    <h4 className="font-medium">{bookingToCancel.hotel_name}</h4>
                                    <p className="text-sm text-muted-foreground">{bookingToCancel.booking_reference}</p>
                                    <p className="text-sm">{bookingToCancel.check_in} to {bookingToCancel.check_out}</p>
                                    <p className="font-semibold text-lg">${bookingToCancel.total_amount.toFixed(2)}</p>
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
                                        Keep Booking
                                    </Button>
                                    <Button 
                                        variant="destructive" 
                                        onClick={() => handleCancelBooking(bookingToCancel.id)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Cancel Booking
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}