import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Calendar,
    Users,
    Bed,
    Wifi,
    Car,
    Coffee,
    Utensils,
    MapPin,
    Star,
    CreditCard,
    User,
    ArrowLeft,
    Check,
    Shield
} from 'lucide-react';

// Static data for demo
const rooms = [
    {
        id: 1,
        name: 'Deluxe Ocean View',
        type: 'Deluxe',
        price: 299,
        capacity: 2,
        size: '45 sqm',
        bed: 'King Bed',
        amenities: ['Ocean View', 'Balcony', 'Mini Bar', 'WiFi', 'AC'],
        image: '/api/placeholder/400/250',
        available: true,
        rating: 4.8
    },
    {
        id: 2,
        name: 'Executive Suite',
        type: 'Suite',
        price: 459,
        capacity: 4,
        size: '65 sqm',
        bed: 'King Bed + Sofa Bed',
        amenities: ['City View', 'Living Area', 'Kitchenette', 'WiFi', 'AC'],
        image: '/api/placeholder/400/250',
        available: true,
        rating: 4.9
    },
    {
        id: 3,
        name: 'Standard Room',
        type: 'Standard',
        price: 179,
        capacity: 2,
        size: '30 sqm',
        bed: 'Queen Bed',
        amenities: ['Garden View', 'WiFi', 'AC', 'TV'],
        image: '/api/placeholder/400/250',
        available: false,
        rating: 4.5
    }
];

const hotelAmenities = [
    { icon: Wifi, name: 'Free WiFi' },
    { icon: Car, name: 'Parking' },
    { icon: Coffee, name: 'Coffee Shop' },
    { icon: Utensils, name: 'Restaurant' }
];

interface BookingFormData {
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    check_in: string;
    check_out: string;
    adults: number;
    children: number;
    room_id: number | null;
    special_requests: string;
    booking_source: string;
}

export default function AdminBookingPage() {
    const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
    const [bookingData, setBookingData] = useState<BookingFormData>({
        guest_name: '',
        guest_email: '',
        guest_phone: '',
        check_in: '',
        check_out: '',
        adults: 1,
        children: 0,
        room_id: null,
        special_requests: '',
        booking_source: 'admin'
    });

    const handleRoomSelect = (roomId: number) => {
        setSelectedRoom(roomId);
        setBookingData(prev => ({ ...prev, room_id: roomId }));
    };

    const handleInputChange = (field: keyof BookingFormData, value: string | number) => {
        setBookingData(prev => ({ ...prev, [field]: value }));
    };

    const calculateNights = () => {
        if (bookingData.check_in && bookingData.check_out) {
            const checkIn = new Date(bookingData.check_in);
            const checkOut = new Date(bookingData.check_out);
            const diffTime = checkOut.getTime() - checkIn.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays > 0 ? diffDays : 0;
        }
        return 0;
    };

    const calculateTotal = () => {
        const nights = calculateNights();
        const selectedRoomData = rooms.find(room => room.id === selectedRoom);
        if (selectedRoomData && nights > 0) {
            const subtotal = selectedRoomData.price * nights;
            const tax = subtotal * 0.12; // 12% tax
            return {
                subtotal,
                tax,
                total: subtotal + tax,
                nights
            };
        }
        return { subtotal: 0, tax: 0, total: 0, nights: 0 };
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically send the booking data to your Laravel backend
        console.log('Booking Data:', bookingData);
        alert('Booking created successfully! (This is a demo)');
    };

    const { subtotal, tax, total, nights } = calculateTotal();
    const selectedRoomData = rooms.find(room => room.id === selectedRoom);

    return (
        <>
            <Head title="Create Booking - Admin" />
            
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center space-x-4">
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/admin/dashboard">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to Dashboard
                                    </Link>
                                </Button>
                                <Separator orientation="vertical" className="h-6" />
                                <div className="flex items-center space-x-2">
                                    <Shield className="h-5 w-5 text-amber-600" />
                                    <span className="font-semibold text-gray-900">Admin Booking</span>
                                </div>
                            </div>
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                                Hotel Management System
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Guest Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <User className="h-5 w-5" />
                                        <span>Guest Information</span>
                                    </CardTitle>
                                    <CardDescription>
                                        Enter guest details for the booking
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="guest_name">Full Name *</Label>
                                            <Input
                                                id="guest_name"
                                                placeholder="John Doe"
                                                value={bookingData.guest_name}
                                                onChange={(e) => handleInputChange('guest_name', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="guest_email">Email Address *</Label>
                                            <Input
                                                id="guest_email"
                                                type="email"
                                                placeholder="john@example.com"
                                                value={bookingData.guest_email}
                                                onChange={(e) => handleInputChange('guest_email', e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="guest_phone">Phone Number *</Label>
                                        <Input
                                            id="guest_phone"
                                            placeholder="+1 (555) 123-4567"
                                            value={bookingData.guest_phone}
                                            onChange={(e) => handleInputChange('guest_phone', e.target.value)}
                                            required
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Booking Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Calendar className="h-5 w-5" />
                                        <span>Booking Details</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="check_in">Check-in Date *</Label>
                                            <Input
                                                id="check_in"
                                                type="date"
                                                value={bookingData.check_in}
                                                onChange={(e) => handleInputChange('check_in', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="check_out">Check-out Date *</Label>
                                            <Input
                                                id="check_out"
                                                type="date"
                                                value={bookingData.check_out}
                                                onChange={(e) => handleInputChange('check_out', e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="adults">Adults</Label>
                                            <Select value={bookingData.adults.toString()} onValueChange={(value) => handleInputChange('adults', parseInt(value))}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {[1, 2, 3, 4, 5, 6].map(num => (
                                                        <SelectItem key={num} value={num.toString()}>{num} Adult{num > 1 ? 's' : ''}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="children">Children</Label>
                                            <Select value={bookingData.children.toString()} onValueChange={(value) => handleInputChange('children', parseInt(value))}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {[0, 1, 2, 3, 4].map(num => (
                                                        <SelectItem key={num} value={num.toString()}>{num} Child{num !== 1 ? 'ren' : ''}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Room Selection */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Bed className="h-5 w-5" />
                                        <span>Select Room</span>
                                    </CardTitle>
                                    <CardDescription>
                                        Choose from available rooms
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {rooms.map((room) => (
                                        <div
                                            key={room.id}
                                            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                                selectedRoom === room.id
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : room.available
                                                    ? 'border-gray-200 hover:border-gray-300'
                                                    : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                                            }`}
                                            onClick={() => room.available && handleRoomSelect(room.id)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <h3 className="font-semibold text-lg">{room.name}</h3>
                                                        <Badge variant={room.available ? "default" : "secondary"}>
                                                            {room.available ? "Available" : "Unavailable"}
                                                        </Badge>
                                                        {selectedRoom === room.id && (
                                                            <Badge variant="default" className="bg-green-500">
                                                                <Check className="h-3 w-3 mr-1" />
                                                                Selected
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                                                        <div className="flex items-center space-x-1">
                                                            <Users className="h-4 w-4" />
                                                            <span>{room.capacity} guests</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <MapPin className="h-4 w-4" />
                                                            <span>{room.size}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <Bed className="h-4 w-4" />
                                                            <span>{room.bed}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                            <span>{room.rating}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1 mb-3">
                                                        {room.amenities.map((amenity, index) => (
                                                            <Badge key={index} variant="outline" className="text-xs">
                                                                {amenity}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-blue-600">
                                                        ${room.price}
                                                    </div>
                                                    <div className="text-sm text-gray-500">per night</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Special Requests */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Special Requests</CardTitle>
                                    <CardDescription>
                                        Any additional requests or notes
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <textarea
                                        placeholder="Early check-in, extra towels, room preferences, etc."
                                        value={bookingData.special_requests}
                                        onChange={(e) => handleInputChange('special_requests', e.target.value)}
                                        className="min-h-[100px] w-full border rounded px-3 py-2"
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar - Booking Summary */}
                        <div className="space-y-6">
                            <Card className="sticky top-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <CreditCard className="h-5 w-5" />
                                        <span>Booking Summary</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {selectedRoomData && (
                                        <>
                                            <div className="space-y-2">
                                                <h4 className="font-medium">{selectedRoomData.name}</h4>
                                                <p className="text-sm text-gray-600">{selectedRoomData.type} Room</p>
                                            </div>
                                            
                                            <Separator />
                                            
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span>Check-in:</span>
                                                    <span>{bookingData.check_in || 'Not selected'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Check-out:</span>
                                                    <span>{bookingData.check_out || 'Not selected'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Guests:</span>
                                                    <span>{bookingData.adults + bookingData.children}</span>
                                                </div>
                                                {nights > 0 && (
                                                    <div className="flex justify-between font-medium">
                                                        <span>Nights:</span>
                                                        <span>{nights}</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {nights > 0 && (
                                                <>
                                                    <Separator />
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span>Room rate × {nights} nights:</span>
                                                            <span>${subtotal.toFixed(2)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Taxes & fees:</span>
                                                            <span>${tax.toFixed(2)}</span>
                                                        </div>
                                                        <Separator />
                                                        <div className="flex justify-between font-semibold text-lg">
                                                            <span>Total:</span>
                                                            <span>${total.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    )}
                                    
                                    {!selectedRoomData && (
                                        <div className="text-center py-8 text-gray-500">
                                            <Bed className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                            <p>Select a room to see pricing</p>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter>
                                    <Button 
                                        onClick={handleSubmit}
                                        className="w-full" 
                                        size="lg"
                                        disabled={!selectedRoom || !bookingData.guest_name || !bookingData.check_in || !bookingData.check_out}
                                    >
                                        Create Booking
                                    </Button>
                                </CardFooter>
                            </Card>

                            {/* Hotel Amenities */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Hotel Amenities</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-3">
                                        {hotelAmenities.map((amenity, index) => (
                                            <div key={index} className="flex items-center space-x-2 text-sm">
                                                <amenity.icon className="h-4 w-4 text-gray-500" />
                                                <span>{amenity.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}