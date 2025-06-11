import { useState, useEffect, SetStateAction } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            {...props}
        />
    );
}
interface CalendarProps {
    mode?: 'single';
    selected?: Date;
    onSelect?: (date: Date) => void;
    disabled?: (date: Date) => boolean;
    initialFocus?: boolean;
}

export const Calendar: React.FC<CalendarProps> = ({
    selected,
    onSelect,
    disabled,
}) => {
    const [currentMonth, setCurrentMonth] = React.useState<Date>(
        selected || new Date()
    );

    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const days: Date[] = [];
    for (let i = 1; i <= endOfMonth.getDate(); i++) {
        days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
    }

    const prevMonth = () => {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
        );
    };

    const nextMonth = () => {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
        );
    };

    const isSameDay = (a?: Date, b?: Date) =>
        a && b &&
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

    const firstDayOfWeek = startOfMonth.getDay();

    const handleDateSelect = (day: Date) => {
        if (!disabled?.(day)) {
            onSelect?.(day);
        }
    };


    return (
       <div className="p-4 bg-background rounded-lg shadow-md w-72">
            <div className="flex items-center justify-between mb-2">
                <button
                    type="button"
                    onClick={prevMonth}
                    className="px-2 py-1 rounded hover:bg-muted"
                    aria-label="Previous month"
                >
                    ‹
                </button>
                <span className="font-semibold">
                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <button
                    type="button"
                    onClick={nextMonth}
                    className="px-2 py-1 rounded hover:bg-muted"
                    aria-label="Next month"
                >
                    ›
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-xs text-center mb-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                    <div key={d} className="font-medium p-1">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-8" />
                ))}
                {days.map((day) => {
                    const isDisabled = disabled?.(day);
                    const isSelected = isSameDay(day, selected);
                    return (
                        <button
                            key={day.toISOString()}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => handleDateSelect(day)}
                            className={cn(
                                "h-8 w-8 rounded-md text-sm flex items-center justify-center transition-colors",
                                isSelected 
                                    ? "bg-primary text-primary-foreground font-medium" 
                                    : "hover:bg-accent hover:text-accent-foreground",
                                isDisabled && "opacity-30 cursor-not-allowed hover:bg-transparent"
                            )}
                        >
                            {day.getDate()}
                        </button>
                    );
                })}
            </div>
        </div>

    );
};

// Updated Popover components with state management
export const Popover: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    
    return (
        <div className="relative">
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child as React.ReactElement<any>, {
                        isOpen,
                        setIsOpen,
                    });
                }
                return child;
            })}
        </div>
    );
};

export const PopoverTrigger: React.FC<{ 
    asChild?: boolean; 
    children: React.ReactNode;
    isOpen?: boolean;
    setIsOpen?: (open: boolean) => void;
}> = ({ children, isOpen, setIsOpen }) => {
    return (
        <div 
            className="inline-block cursor-pointer"
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsOpen?.(!isOpen);
            }}
        >
            {children}
        </div>
    );
};

export const PopoverContent: React.FC<{
    children: React.ReactNode;
    className?: string;
    align?: 'start' | 'center' | 'end';
    isOpen?: boolean;
    setIsOpen?: (open: boolean) => void;
}> = ({ children, className = '', align = 'start', isOpen, setIsOpen }) => {
    const ref = React.useRef<HTMLDivElement>(null);
    
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen?.(false);
            }
        };
        
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, setIsOpen]);
    
    if (!isOpen) return null;
    
    return (
        <div
            ref={ref}
            className={cn(
                "absolute z-50 mt-2 bg-popover text-popover-foreground border rounded-md shadow-lg p-0",
                align === 'start' && "left-0",
                align === 'center' && "left-1/2 -translate-x-1/2",
                align === 'end' && "right-0",
                className
            )}
        >
            {children}
        </div>
    );
};
import { 
  Users, 
  Bed, 
  Maximize2, 
  Wifi, 
  Tv, 
  Car, 
  Coffee, 
  Bath, 
  Shield, 
  Wind, 
  Utensils, 
  Star, 
  MapPin, 
  Calendar as CalendarIcon,
  ArrowLeft,
  Check,
  X,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { SharedData } from '@/types';
import Layout from '@/components/layout';
import { format, addDays, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import React from 'react';

interface Room {
  id: number;
  name: string;
  description: string | null;
  type: 'single' | 'double' | 'suite' | 'family' | 'deluxe';
  price_per_night: number;
  capacity: number;
  beds: number;
  size: number | null;
  amenities: string[] | null;
  images: string[] | null;
  is_available: boolean;
  is_active: boolean;
}

interface RelatedRoom {
  id: number;
  name: string;
  type: string;
  price_per_night: number;
  images: string[] | null;
}

interface RoomShowPageProps {
  room: Room;
  relatedRooms: RelatedRoom[];
  unavailableDates: string[];
}

const amenityIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi className="h-4 w-4" />,
  ac: <Wind className="h-4 w-4" />,
  tv: <Tv className="h-4 w-4" />,
  mini_bar: <Coffee className="h-4 w-4" />,
  balcony: <MapPin className="h-4 w-4" />,
  room_service: <Utensils className="h-4 w-4" />,
  safe: <Shield className="h-4 w-4" />,
  hair_dryer: <Wind className="h-4 w-4" />,
  bathtub: <Bath className="h-4 w-4" />,
  shower: <Bath className="h-4 w-4" />,
};

const amenityLabels: Record<string, string> = {
  wifi: 'Wi-Fi',
  ac: 'Air Conditioning',
  tv: 'Television',
  mini_bar: 'Mini Bar',
  balcony: 'Balcony',
  room_service: 'Room Service',
  safe: 'Safe',
  hair_dryer: 'Hair Dryer',
  bathtub: 'Bathtub',
  shower: 'Shower',
};

const typeLabels: Record<string, string> = {
  single: 'Single Room',
  double: 'Double Room',
  suite: 'Suite',
  family: 'Family Room',
  deluxe: 'Deluxe Room',
};

export default function RoomShowPage({ room, relatedRooms, unavailableDates }: RoomShowPageProps) {
  const { auth } = usePage<SharedData>().props;
  
  // Booking form state
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [guestName, setGuestName] = useState(auth.user?.name || '');
  const [guestEmail, setGuestEmail] = useState(auth.user?.email || '');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const calculateNights = () => {
    if (checkIn && checkOut) {
      const timeDiff = checkOut.getTime() - checkIn.getTime();
      return Math.ceil(timeDiff / (1000 * 3600 * 24));
    }
    return 0;
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    return nights * room.price_per_night;
  };

  const isDateUnavailable = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return unavailableDates.includes(dateString) || date < new Date();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!auth.user) {
      router.visit('/login');
      return;
    }

    if (!checkIn || !checkOut) {
      alert('Please select check-in and check-out dates');
      return;
    }

    if (adults + children > room.capacity) {
      alert(`This room can accommodate maximum ${room.capacity} guests`);
      return;
    }

    setIsSubmitting(true);

    router.post('/bookings', {
      room_id: room.id,
      check_in: format(checkIn, 'yyyy-MM-dd'),
      check_out: format(checkOut, 'yyyy-MM-dd'),
      adults,
      children,
      guest_name: guestName,
      guest_email: guestEmail,
      guest_phone: guestPhone,
      special_requests: specialRequests,
    }, {
      onFinish: () => setIsSubmitting(false),
    });
  };

  const nextImage = () => {
    if (room.images && room.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % room.images!.length);
    }
  };

  const prevImage = () => {
    if (room.images && room.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + room.images!.length) % room.images!.length);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <Head title={room.name} />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-7xl py-8">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => router.get('/rooms')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Rooms
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Room Details - Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Room Images */}
              <div className="relative">
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  {room.images && room.images.length > 0 ? (
                    <div className="relative w-full h-full">
                      <img
                        src={room.images[currentImageIndex]}
                        alt={room.name}
                        className="w-full h-full object-cover"
                      />
                      {room.images.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Bed className="h-16 w-16" />
                    </div>
                  )}
                </div>
                
                {room.images && room.images.length > 1 && (
                  <div className="flex justify-center mt-4 space-x-2">
                    {room.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={cn(
                          "w-3 h-3 rounded-full transition-colors",
                          index === currentImageIndex ? "bg-primary" : "bg-muted-foreground/30"
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Room Header */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{room.name}</h1>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {typeLabels[room.type] || room.type}
                      </Badge>
                      <Badge 
                        variant={room.is_available ? "default" : "destructive"}
                        className={room.is_available ? "bg-green-500 hover:bg-green-600" : ""}
                      >
                        {room.is_available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">{formatPrice(room.price_per_night)}</p>
                    <p className="text-muted-foreground">per night</p>
                  </div>
                </div>

                {room.description && (
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {room.description}
                  </p>
                )}
              </div>

              {/* Room Features */}
              <Card>
                <CardHeader>
                  <CardTitle>Room Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{room.capacity} Guests</p>
                        <p className="text-sm text-muted-foreground">Maximum</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bed className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{room.beds} Bed{room.beds > 1 ? 's' : ''}</p>
                        <p className="text-sm text-muted-foreground">Comfortable</p>
                      </div>
                    </div>
                    {room.size && (
                      <div className="flex items-center gap-2">
                        <Maximize2 className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{room.size}m²</p>
                          <p className="text-sm text-muted-foreground">Floor Area</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="font-medium">4.8 Rating</p>
                        <p className="text-sm text-muted-foreground">Guest Reviews</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Amenities */}
              {room.amenities && room.amenities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Amenities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {room.amenities.map((amenity) => (
                        <div key={amenity} className="flex items-center gap-2">
                          {amenityIcons[amenity] || <Check className="h-4 w-4" />}
                          <span>{amenityLabels[amenity] || amenity}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Booking Form - Right Column */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Book This Room</CardTitle>
                  <CardDescription>
                    Reserve your stay and enjoy our hospitality
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Check-in Date */}
                      <div className="space-y-2">
                        <Label>Check-in Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !checkIn && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {checkIn ? format(checkIn, 'PPP') : 'Select date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={checkIn}
                              onSelect={(date) => {
                                setCheckIn(date);
                                // Auto-close popover after selection
                                setTimeout(() => {
                                  const popover = document.querySelector('[data-popover-content]');
                                  if (popover) {
                                    const event = new MouseEvent('click', { bubbles: true });
                                    document.dispatchEvent(event);
                                  }
                                }, 100);
                              }}
                              disabled={isDateUnavailable}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Check-out Date */}
                      <div className="space-y-2">
                        <Label>Check-out Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !checkOut && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {checkOut ? format(checkOut, 'PPP') : 'Select date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={checkOut}
                              onSelect={(date) => {
                                setCheckOut(date);
                                // Auto-close popover after selection
                                setTimeout(() => {
                                  const popover = document.querySelector('[data-popover-content]');
                                  if (popover) {
                                    const event = new MouseEvent('click', { bubbles: true });
                                    document.dispatchEvent(event);
                                  }
                                }, 100);
                              }}
                              disabled={(date: Date) => {
                                return isDateUnavailable(date) || (checkIn ? date <= checkIn : false);
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                    {/* Guests */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Adults</Label>
                        <Input
                          type="number"
                          min="1"
                          max={room.capacity}
                          value={adults}
                          onChange={(e) => setAdults(Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Children</Label>
                        <Input
                          type="number"
                          min="0"
                          max={room.capacity - adults}
                          value={children}
                          onChange={(e) => setChildren(Number(e.target.value))}
                        />
                      </div>
                    </div>

                    {/* Guest Information */}
                    <div className="space-y-2">
                      <Label>Guest Name</Label>
                      <Input
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>

                    {/* Special Requests */}
                    <div className="space-y-2">
                      <Label>Special Requests (Optional)</Label>
                      <Textarea
                        value={specialRequests}
                        onChange={(e: { target: { value: SetStateAction<string>; }; }) => setSpecialRequests(e.target.value)}
                        placeholder="Any special requirements or requests..."
                        rows={3}
                      />
                    </div>

                    {/* Booking Summary */}
                    {checkIn && checkOut && (
                      <div className="space-y-2 p-4 bg-muted rounded-lg">
                        <div className="flex justify-between">
                          <span>Nights:</span>
                          <span>{calculateNights()}</span>
                          </div>
                        <div className="flex justify-between">
                          <span>Price per night:</span>
                          <span>{formatPrice(room.price_per_night)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total guests:</span>
                          <span>{adults + children}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total:</span>
                          <span>{formatPrice(calculateTotal())}</span>
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSubmitting || !room.is_available}
                    >
                      {isSubmitting ? (
                        <>
                          <Clock className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Book Now'
                      )}
                    </Button>

                    {!auth.user && (
                      <p className="text-sm text-muted-foreground text-center">
                        You'll be redirected to login to complete your booking
                      </p>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Related Rooms */}
          {relatedRooms && relatedRooms.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Similar Rooms</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedRooms.map((relatedRoom) => (
                  <Card key={relatedRoom.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <div className="aspect-video rounded-t-lg overflow-hidden bg-muted">
                      {relatedRoom.images && relatedRoom.images.length > 0 ? (
                        <img
                          src={relatedRoom.images[0]}
                          alt={relatedRoom.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Bed className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{relatedRoom.name}</h3>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">
                          {typeLabels[relatedRoom.type] || relatedRoom.type}
                        </Badge>
                        <p className="font-bold">{formatPrice(relatedRoom.price_per_night)}/night</p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full mt-4"
                        onClick={() => router.get(`/rooms/${relatedRoom.id}`)}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}