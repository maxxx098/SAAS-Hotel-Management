import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Calendar, 
  MapPin, 
  Users, 
  Mail, 
  Phone, 
  Clock,
  Home,
  FileText
} from 'lucide-react';
import Layout from '@/components/layout';
import { format } from 'date-fns';

interface Booking {
  id: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  total_amount: number;
  status: string;
  special_requests?: string;
  room: {
    id: number;
    name: string;
    type: string;
    images: string[] | null;
  };
}

interface BookingConfirmationProps {
  booking: Booking;
}

export default function BookingConfirmation({ booking }: BookingConfirmationProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const calculateNights = () => {
    const checkIn = new Date(booking.check_in);
    const checkOut = new Date(booking.check_out);
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <Head title="Booking Confirmation" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-4xl py-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">Booking Confirmed!</h1>
            <p className="text-lg text-muted-foreground">
              Thank you for your reservation. We've sent a confirmation email to{' '}
              <span className="font-medium">{booking.guest_email}</span>
            </p>
          </div>

          {/* Booking Details Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Booking Details
              </CardTitle>
              <CardDescription>
                Booking ID: #{booking.id.toString().padStart(6, '0')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Room Information */}
              <div className="flex items-start gap-4">
                {booking.room.images && booking.room.images.length > 0 ? (
                  <img
                    src={booking.room.images[0]}
                    alt={booking.room.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{booking.room.name}</h3>
                  <Badge variant="secondary" className="mb-2">
                    {booking.room.type.charAt(0).toUpperCase() + booking.room.type.slice(1)} Room
                  </Badge>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Check-in: {format(new Date(booking.check_in), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Check-out: {format(new Date(booking.check_out), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{booking.adults} Adults{booking.children > 0 && `, ${booking.children} Children`}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{calculateNights()} Night{calculateNights() > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Guest Information */}
              <div>
                <h4 className="font-medium mb-3">Guest Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{booking.guest_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{booking.guest_email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{booking.guest_phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>

              {booking.special_requests && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Special Requests</h4>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      {booking.special_requests}
                    </p>
                  </div>
                </>
              )}

              <Separator />

              {/* Pricing Summary */}
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-3">Pricing Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>{calculateNights()} night{calculateNights() > 1 ? 's' : ''}</span>
                    <span>{formatPrice(booking.total_amount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Amount</span>
                    <span>{formatPrice(booking.total_amount)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Alert */}
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Awaiting Confirmation</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Your booking is currently pending. We'll review your reservation and send you a confirmation 
                    email within 24 hours. You'll receive all the details including check-in instructions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => router.get('/dashboard')} className="w-full sm:w-auto">
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.get('/rooms')}
              className="w-full sm:w-auto"
            >
              Browse More Rooms
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.get(`/bookings/${booking.id}`)}
              className="w-full sm:w-auto"
            >
              View Booking Details
            </Button>
          </div>

          {/* Contact Information */}
          <Card className="mt-8">
            <CardContent className="pt-6">
              <div className="text-center">
                <h4 className="font-medium mb-2">Need Help?</h4>
                <p className="text-sm text-muted-foreground">
                  If you have any questions about your booking, please don't hesitate to contact us.
                </p>
                <div className="flex justify-center gap-4 mt-3 text-sm">
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    +1 (555) 123-4567
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    support@hotel.com
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}