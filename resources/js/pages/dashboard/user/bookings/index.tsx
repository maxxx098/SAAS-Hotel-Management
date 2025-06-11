import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
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
import { useToast } from '@/components/ui/use-toast';
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
    X,
    Loader2
} from 'lucide-react';

// Types
interface Room {
    id: number;
    name: string;
    type: string;
    images?: string[];
}

interface Booking {
    id: number;
    booking_reference?: string;
    user_id: number;
    room_id: number;
    room?: Room;
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    check_in: string;
    check_out: string;
    adults: number;
    children: number;
    room_type: string;
    room_price: number;
    total_amount: number | string; // Explicitly allow both types
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    special_requests?: string;
    created_at: string;
    updated_at: string;
    nights?: number;
    hotel_name?: string;
    hotel_address?: string;
    can_cancel?: boolean;
    can_modify?: boolean;
}

interface Props {
    bookings: {
        filter(arg0: (b: any) => boolean): unknown;
        data: Booking[];
        links: any;
        meta: any;
    };
    filters: {
        status?: string;
    };
}

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

export default function UserBookingManagement({ bookings, filters }: Props) {
    const { toast } = useToast();
    const [expandedBooking, setExpandedBooking] = useState<number | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Form for editing bookings
    const { data: editData, setData: setEditData, put, processing: editProcessing, errors: editErrors, reset: resetEdit } = useForm({
        check_in: '',
        check_out: '',
        adults: 1,
        children: 0,
        guest_name: '',
        guest_email: '',
        guest_phone: '',
        special_requests: '',
    });

    // Calculate stats from bookings data
        const calculateTotalSpent = (bookings: Booking[]): number => {
            return bookings
                .filter(b => b.status !== 'cancelled')
                .reduce((sum: number, booking: Booking) => {
                    // Handle both string and number types
                    let amount: number;
                    if (typeof booking.total_amount === 'number') {
                        amount = booking.total_amount;
                    } else {
                        amount = parseFloat(booking.total_amount?.toString() || '0');
                    }
                    
                    // Return 0 if amount is NaN
                    return sum + (isNaN(amount) ? 0 : amount);
                }, 0);
        };

        const stats = {
            total: bookings.data.length,
            pending: bookings.data.filter(b => b.status === 'pending').length,
            confirmed: bookings.data.filter(b => b.status === 'confirmed').length,
            total_spent: calculateTotalSpent(bookings.data)
        };


    // Calculate nights for each booking
    const calculateNights = (checkIn: string, checkOut: string): number => {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    // Enhanced bookings with calculated fields
    const enhancedBookings = bookings.data.map(booking => ({
        ...booking,
        nights: calculateNights(booking.check_in, booking.check_out),
        hotel_name: booking.room?.name || 'Hotel Name',
        hotel_address: 'Hotel Address', // You might want to add this to your Room model
        can_cancel: ['pending', 'confirmed'].includes(booking.status) && new Date(booking.check_in) > new Date(),
        can_modify: ['pending', 'confirmed'].includes(booking.status) && new Date(booking.check_in) > new Date(),
        booking_reference: `HTL-${booking.id.toString().padStart(6, '0')}`
    }));

    const handleEditBooking = (booking: Booking) => {
        setEditData({
            check_in: booking.check_in,
            check_out: booking.check_out,
            adults: booking.adults,
            children: booking.children,
            guest_name: booking.guest_name,
            guest_email: booking.guest_email,
            guest_phone: booking.guest_phone,
            special_requests: booking.special_requests || '',
        });
        setIsEditDialogOpen(true);
    };

    const handleSaveEdit = (bookingId: number) => {
        put(route('bookings.update', bookingId), {
            onSuccess: () => {
                setIsEditDialogOpen(false);
                resetEdit();
                toast({
                    title: "Booking Updated",
                    description: "Your booking has been updated successfully.",
                });
            },
            onError: () => {
                toast({
                    title: "Update Failed",
                    description: "Failed to update booking. Please try again.",
                    variant: "destructive",
                });
            }
        });
    };

    const handleCancelBooking = (bookingId: number) => {
        setIsProcessing(true);
        router.delete(route('bookings.destroy', bookingId), {
            onSuccess: () => {
                setIsCancelDialogOpen(false);
                setBookingToCancel(null);
                setIsProcessing(false);
                toast({
                    title: "Booking Cancelled",
                    description: "Your booking has been cancelled successfully.",
                });
            },
            onError: () => {
                setIsProcessing(false);
                toast({
                    title: "Cancellation Failed",
                    description: "Failed to cancel booking. Please try again.",
                    variant: "destructive",
                });
            }
        });
    };

    const handleStatusFilter = (status: string) => {
        router.get(route('bookings.index'), { status: status === filters.status ? '' : status }, {
            preserveState: true,
            replace: true,
        });
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
                    <Button 
                        className="bg-primary hover:bg-primary/90"
                        onClick={() => router.visit(route('rooms.index'))}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Booking
                    </Button>
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-2 flex-wrap">
                    <Button
                        variant={!filters.status ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleStatusFilter('')}
                    >
                        All ({stats.total})
                    </Button>
                    <Button
                        variant={filters.status === 'pending' ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleStatusFilter('pending')}
                    >
                        Pending ({stats.pending})
                    </Button>
                    <Button
                        variant={filters.status === 'confirmed' ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleStatusFilter('confirmed')}
                    >
                        Confirmed ({stats.confirmed})
                    </Button>
                </div>

                {/* Quick Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-3">
                            <div className="flex items-center space-x-2">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Bookings</p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
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
                                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
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
                                    <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
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
                                    <p className="text-2xl font-bold">
                                        ${stats.total_spent.toLocaleString('en-US', { 
                                            minimumFractionDigits: 2, 
                                            maximumFractionDigits: 2 
                                        })}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Bookings List */}
                <div className="space-y-4">
                    {enhancedBookings.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
                                <p className="text-muted-foreground mb-4">
                                    {filters.status ? `No ${filters.status} bookings found.` : 'You haven\'t made any bookings yet.'}
                                </p>
                                <Button onClick={() => router.visit(route('rooms.index'))}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Make Your First Booking
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        enhancedBookings.map((booking) => (
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
                                                <div className="text-2xl font-bold text-primary">${Number(booking.total_amount).toFixed(2)}</div>
                                                <div className="text-sm text-muted-foreground">{booking.nights} nights</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                            <div className="flex items-center space-x-2 text-sm">
                                                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-muted-foreground">Check-in</p>
                                                    <p className="font-medium">{new Date(booking.check_in).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 text-sm">
                                                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-muted-foreground">Check-out</p>
                                                    <p className="font-medium">{new Date(booking.check_out).toLocaleDateString()}</p>
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
                                                                    <span>${(Number(booking.total_amount) - (Number(booking.room_price) * Number(booking.nights))).toFixed(2)}</span>
                                                                </div>
                                                                <Separator />
                                                                <div className="flex justify-between font-semibold">
                                                                    <span>Total Amount:</span>
                                                                    <span>${Number(booking.total_amount).toFixed(2)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <h4 className="font-medium">Guest Information</h4>
                                                            <div className="space-y-2 text-sm">
                                                                <p><strong>Name:</strong> {booking.guest_name}</p>
                                                                <p><strong>Email:</strong> {booking.guest_email}</p>
                                                                <p><strong>Phone:</strong> {booking.guest_phone}</p>
                                                                <p><strong>Booked on:</strong> {new Date(booking.created_at).toLocaleDateString()}</p>
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
                        ))
                    )}
                </div>

                {/* Pagination */}
                {bookings.links && bookings.links.length > 3 && (
                    <div className="flex justify-center mt-6">
                        {bookings.links.map((link: any, index: number) => (
                            <Button
                                key={index}
                                variant={link.active ? "default" : "outline"}
                                size="sm"
                                className="mx-1"
                                onClick={() => router.visit(link.url)}
                                disabled={!link.url}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}

                {/* Edit Booking Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Modify Booking</DialogTitle>
                            <DialogDescription>
                                Update your booking details. Changes may require approval.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="check_in">Check-in Date</Label>
                                    <Input
                                        id="check_in"
                                        type="date"
                                        value={editData.check_in}
                                        onChange={(e) => setEditData('check_in', e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                    {editErrors.check_in && (
                                        <p className="text-sm text-red-600 mt-1">{editErrors.check_in}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="check_out">Check-out Date</Label>
                                    <Input
                                        id="check_out"
                                        type="date"
                                        value={editData.check_out}
                                        onChange={(e) => setEditData('check_out', e.target.value)}
                                        min={editData.check_in || new Date().toISOString().split('T')[0]}
                                    />
                                    {editErrors.check_out && (
                                        <p className="text-sm text-red-600 mt-1">{editErrors.check_out}</p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="adults">Adults</Label>
                                    <Input
                                        id="adults"
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={editData.adults}
                                        onChange={(e) => setEditData('adults', parseInt(e.target.value))}
                                    />
                                    {editErrors.adults && (
                                        <p className="text-sm text-red-600 mt-1">{editErrors.adults}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="children">Children</Label>
                                    <Input
                                        id="children"
                                        type="number"
                                        min="0"
                                        max="10"
                                        value={editData.children}
                                        onChange={(e) => setEditData('children', parseInt(e.target.value))}
                                    />
                                    {editErrors.children && (
                                        <p className="text-sm text-red-600 mt-1">{editErrors.children}</p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="guest_name">Guest Name</Label>
                                    <Input
                                        id="guest_name"
                                        type="text"
                                        value={editData.guest_name}
                                        onChange={(e) => setEditData('guest_name', e.target.value)}
                                    />
                                    {editErrors.guest_name && (
                                        <p className="text-sm text-red-600 mt-1">{editErrors.guest_name}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="guest_phone">Phone</Label>
                                    <Input
                                        id="guest_phone"
                                        type="tel"
                                        value={editData.guest_phone}
                                        onChange={(e) => setEditData('guest_phone', e.target.value)}
                                    />
                                    {editErrors.guest_phone && (
                                        <p className="text-sm text-red-600 mt-1">{editErrors.guest_phone}</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="guest_email">Email</Label>
                                <Input
                                    id="guest_email"
                                    type="email"
                                    value={editData.guest_email}
                                    onChange={(e) => setEditData('guest_email', e.target.value)}
                                />
                                {editErrors.guest_email && (
                                    <p className="text-sm text-red-600 mt-1">{editErrors.guest_email}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="special_requests">Special Requests</Label>
                                <textarea
                                    id="special_requests"
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={editData.special_requests}
                                    onChange={(e) => setEditData('special_requests', e.target.value)}
                                    placeholder="Any special requests or notes..."
                                    rows={3}
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                    <X className="h-4 w-4 mr-1" />
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={() => handleSaveEdit(expandedBooking || 0)}
                                    disabled={editProcessing}
                                >
                                    {editProcessing ? (
                                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-1" />
                                    )}
                                    Save Changes
                                </Button>
                            </div>
                        </div>
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
                                    <p className="text-sm">{new Date(bookingToCancel.check_in).toLocaleDateString()} to {new Date(bookingToCancel.check_out).toLocaleDateString()}</p>
                                    <p className="font-semibold text-lg">${Number(bookingToCancel.total_amount).toFixed(2)}</p>
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
                                        Keep Booking
                                    </Button>
                                    <Button 
                                        variant="destructive" 
                                        onClick={() => handleCancelBooking(bookingToCancel.id)}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? (
                                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4 mr-1" />
                                        )}
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