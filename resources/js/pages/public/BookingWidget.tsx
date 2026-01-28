import React, { useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';

interface Room {
  id: number;
  title: string;
  image: string;
  name?: string;
  type?: string;
  capacity?: number;
  beds?: number;
  price_per_night?: number;
  total_price?: number;
  nights?: number;
  amenities?: string[];
  description?: string;
}

const rooms: Room[] = [
  { id: 1, title: 'Deluxe Room', image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2070&auto=format&fit=crop' },
  { id: 2, title: 'Superior Room', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop' },
  { id: 3, title: 'Executive Room', image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1974&auto=format&fit=crop' },
];

const CalendarWidget: React.FC<{ onDateClick: (checkIn: string, checkOut: string) => void }> = ({ onDateClick }) => {
  const today = new Date();
  const [selectedCheckIn, setSelectedCheckIn] = useState<number | null>(null);
  const [selectedCheckOut, setSelectedCheckOut] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());
  const [isLoadingDates, setIsLoadingDates] = useState(false);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Fetch booked dates when month changes
  React.useEffect(() => {
    fetchBookedDates();
  }, [currentMonth, currentYear]);

  const fetchBookedDates = async () => {
    setIsLoadingDates(true);
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      
      // Get first and last day of current month
      const firstDay = new Date(currentYear, currentMonth, 1);
      const lastDay = new Date(currentYear, currentMonth + 1, 0);
      
      const startDate = firstDay.toISOString().split('T')[0];
      const endDate = lastDay.toISOString().split('T')[0];

      const response = await fetch('/api/booked-dates', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Assuming API returns { booked_dates: ['2024-01-05', '2024-01-06', ...] }
        setBookedDates(new Set(data.booked_dates || []));
      }
    } catch (error) {
      console.error('Error fetching booked dates:', error);
      // Set some mock data for demo purposes
      const mockBooked = new Set([
        `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-05`,
        `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-06`,
        `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-07`,
        `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-15`,
      ]);
      setBookedDates(mockBooked);
    } finally {
      setIsLoadingDates(false);
    }
  };

  const isDateBooked = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookedDates.has(dateStr);
  };
  
  // Calculate days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Calculate first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  // Adjust for Monday start (0 = Monday, 6 = Sunday)
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const emptyStartDays = Array.from({ length: adjustedFirstDay }, (_, i) => i);
  
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const handleDayClick = (day: number) => {
    // Prevent booking on already booked dates
    if (isDateBooked(day)) {
      return;
    }

    if (!selectedCheckIn) {
      setSelectedCheckIn(day);
      setSelectedCheckOut(null);
    } else if (!selectedCheckOut) {
      if (day > selectedCheckIn) {
        // Check if any date in range is booked
        const hasBookedInRange = Array.from(
          { length: day - selectedCheckIn + 1 }, 
          (_, i) => selectedCheckIn + i
        ).some(d => isDateBooked(d));

        if (hasBookedInRange) {
          // Reset selection if there's a booked date in range
          setSelectedCheckIn(day);
          setSelectedCheckOut(null);
          return;
        }

        setSelectedCheckOut(day);
        // Create date strings
        const checkInDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedCheckIn).padStart(2, '0')}`;
        const checkOutDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        onDateClick(checkInDate, checkOutDate);
      } else {
        setSelectedCheckIn(day);
        setSelectedCheckOut(null);
      }
    } else {
      setSelectedCheckIn(day);
      setSelectedCheckOut(null);
    }
  };

  const isInRange = (day: number) => {
    if (selectedCheckIn && selectedCheckOut) {
      return day > selectedCheckIn && day < selectedCheckOut;
    }
    return false;
  };

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedCheckIn(null);
    setSelectedCheckOut(null);
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedCheckIn(null);
    setSelectedCheckOut(null);
  };

  const isToday = (day: number) => {
    const todayDate = new Date();
    return day === todayDate.getDate() && 
           currentMonth === todayDate.getMonth() && 
           currentYear === todayDate.getFullYear();
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={goToPreviousMonth}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <h3 className="font-semibold text-lg">{monthNames[currentMonth]} {currentYear}</h3>
        <button 
          onClick={goToNextMonth}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-y-4 gap-x-1 mb-2">
        {weekDays.map(d => (
          <div key={d} className="text-center text-xs font-bold text-gray-400 uppercase">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-2 gap-x-1">
        {emptyStartDays.map(d => <div key={`empty-${d}`} />)}
        {days.map(d => {
            const isCheckIn = d === selectedCheckIn;
            const isCheckOut = d === selectedCheckOut;
            const inRange = isInRange(d);
            const isTodayDate = isToday(d);
            const isBooked = isDateBooked(d);
            return (
                <div key={d} className="flex justify-center">
                    <button 
                        onClick={() => handleDayClick(d)}
                        disabled={isBooked}
                        className={`
                        w-8 h-8 flex items-center justify-center text-sm rounded-full transition-all
                        ${isBooked ? 'bg-yellow-400 text-yellow-900 font-semibold cursor-not-allowed' : ''}
                        ${isCheckIn && !isBooked ? 'bg-green-500 text-white font-semibold' : ''}
                        ${isCheckOut && !isBooked ? 'bg-red-500 text-white font-semibold' : ''}
                        ${inRange && !isBooked ? 'bg-green-100 text-green-700' : ''}
                        ${isTodayDate && !isCheckIn && !isCheckOut && !inRange && !isBooked ? 'bg-gray-100 text-gray-600 font-semibold' : ''}
                        ${!isCheckIn && !isCheckOut && !inRange && !isTodayDate && !isBooked ? 'hover:bg-gray-100 text-gray-600' : ''}
                    `}>
                        {d}
                    </button>
                </div>
            )
        })}
      </div>

      {selectedCheckIn && (
        <div className="mt-4 pt-4 border-t text-sm text-gray-600">
          <p className="mb-1">
            <span className="font-semibold">Check-in:</span> {monthNames[currentMonth]} {selectedCheckIn}
          </p>
          {selectedCheckOut && (
            <p>
              <span className="font-semibold">Check-out:</span> {monthNames[currentMonth]} {selectedCheckOut}
            </p>
          )}
          {!selectedCheckOut && (
            <p className="text-xs text-gray-500 mt-2">Click another date for check-out</p>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 pt-4 border-t flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span className="text-gray-600">Check-in</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <span className="text-gray-600">Check-out</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
          <span className="text-gray-600">Booked</span>
        </div>
      </div>
    </div>
  );
};

const Rooms: React.FC = () => {
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');

  const checkAvailability = async (checkIn: string, checkOut: string) => {
    setError('');
    setIsChecking(true);
    setShowResults(false);

    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      
      if (!csrfToken) {
        throw new Error('CSRF token not found');
      }

      const response = await fetch('/check-availability', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          check_in: checkIn,
          check_out: checkOut,
          adults: 2, // Default values since we're not asking user
          children: 0,
          room_type: null,
        }),
      });

      const data = await response.json();

      // Handle CSRF token mismatch
      if (response.status === 419 || (data.message && data.message.includes('CSRF'))) {
        setError('Session expired. Please refresh the page and try again.');
        setTimeout(() => window.location.reload(), 2000);
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to check availability');
      }

      if (data.success) {
        setAvailableRooms(data.rooms || []);
        setShowResults(true);
      } else {
        setError(data.message || 'No rooms available for selected dates');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to check availability. Please try again.');
      console.error('Availability check error:', err);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <section id="rooms" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-3 gap-16">
          
          {/* Left Side: Room Carousel */}
          <div className="lg:col-span-2">
            <div className="flex flex-col gap-8">
                
                {/* Rooms Grid/Carousel */}
                <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar snap-x">
                    {rooms.map((room) => (
                        <div key={room.id} className="relative min-w-[280px] md:min-w-[320px] h-[300px] rounded-2xl overflow-hidden group snap-center cursor-pointer">
                            <img src={room.image} alt={room.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                            <div className="absolute top-4 left-4">
                                <span className="text-[10px] uppercase tracking-wider text-white border border-white/30 rounded-full px-3 py-1 backdrop-blur-sm">Detail</span>
                            </div>
                            <div className="absolute bottom-6 left-6 text-white">
                                <h3 className="text-xl font-medium">{room.title}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Header Text & Controls */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="max-w-md">
                        <h2 className="text-4xl md:text-5xl font-medium leading-tight mb-4 tracking-tight">
                            Choose the Best Room <br /> for Your Perfect Stay!
                        </h2>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6">
                            Experience the ultimate in comfort and style by choosing the perfect room tailored to your needs.
                        </p>
                        <button className="flex items-center gap-2 border border-black hover:bg-black hover:text-white transition-all px-6 py-2.5 rounded-full text-sm font-medium group">
                            Booking
                            <div className="bg-black text-white group-hover:bg-white group-hover:text-black rounded-full p-0.5 transition-colors">
                                <ArrowUpRight size={14} />
                            </div>
                        </button>
                    </div>

                    <div className="flex gap-2 mb-2">
                        <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white transition-all">
                            <ChevronLeft size={20} />
                        </button>
                        <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white transition-all">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
          </div>

          {/* Right Side: Calendar */}
          <div className="lg:col-span-1 flex flex-col justify-start pt-4">
             <div className="lg:pl-8">
                 <h2 className="text-3xl font-medium leading-snug mb-8 text-right lg:text-right">
                    Check Your Availability Room <br /> On This Calendar
                 </h2>
                 <CalendarWidget onDateClick={checkAvailability} />
                 
                 {/* Loading State */}
                 {isChecking && (
                   <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
                     <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                     <p className="text-blue-800 text-sm">Checking availability...</p>
                   </div>
                 )}

                 {/* Error State */}
                 {error && (
                   <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                     <p className="text-red-800 text-sm">{error}</p>
                   </div>
                 )}
             </div>
          </div>

        </div>

        {/* Available Rooms Results */}
        {showResults && availableRooms.length > 0 && (
          <div className="mt-16 bg-gray-50 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-medium">
                {availableRooms.length} Room{availableRooms.length !== 1 ? 's' : ''} Available
              </h3>
              <button
                onClick={() => setShowResults(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableRooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={room.image}
                      alt={room.name || room.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="p-6">
                    <h4 className="text-xl font-medium mb-2">
                      {room.name || room.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-4 capitalize">
                      {room.type} • {room.beds} bed{room.beds !== 1 ? 's' : ''} • Up to {room.capacity} guests
                    </p>

                    {room.amenities && room.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {room.amenities.slice(0, 3).map((amenity, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="border-t pt-4 mt-4 space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm text-gray-600">Per Night</span>
                        <span className="text-sm font-medium">₱{room.price_per_night?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm text-gray-600">{room.nights} Night{room.nights !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-baseline justify-between pb-4 border-b">
                        <span className="text-sm font-semibold">Total</span>
                        <span className="text-2xl font-medium">₱{room.total_price?.toLocaleString()}</span>
                      </div>
                      <button className="w-full mt-4 px-6 py-3 bg-black hover:bg-gray-800 text-white rounded-full text-sm font-medium transition-all">
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Rooms;