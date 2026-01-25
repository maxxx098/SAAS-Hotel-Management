import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface Room {
  id: number;
  title: string;
  image: string;
}

const rooms: Room[] = [
  { id: 1, title: 'Deluxe Room', image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2070&auto=format&fit=crop' },
  { id: 2, title: 'Superior Room', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop' },
  { id: 3, title: 'Executive Room', image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1974&auto=format&fit=crop' },
];

const CalendarWidget: React.FC = () => {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  
  // Simple offset for a specific month layout (e.g. March 2024 starts on Friday)
  const emptyStartDays = Array.from({ length: 4 }, (_, i) => i); 

  return (
    <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <button className="p-1 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft size={16} /></button>
        <h3 className="font-semibold text-lg">March 2024</h3>
        <button className="p-1 hover:bg-gray-100 rounded-full transition-colors"><ChevronRight size={16} /></button>
      </div>
      
      <div className="grid grid-cols-7 gap-y-4 gap-x-1 mb-2">
        {weekDays.map(d => (
          <div key={d} className="text-center text-xs font-bold text-gray-400 uppercase">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-2 gap-x-1">
        {emptyStartDays.map(d => <div key={`empty-${d}`} />)}
        {days.map(d => {
            const isSelected = d === 22 || d === 23;
            const isToday = d === 10;
            return (
                <div key={d} className="flex justify-center">
                    <button className={`
                        w-8 h-8 flex items-center justify-center text-sm rounded-full transition-all
                        ${isSelected ? 'bg-green-100 text-green-700 font-semibold' : ''}
                        ${isToday ? 'bg-red-100 text-red-600 font-semibold' : ''}
                        ${!isSelected && !isToday ? 'hover:bg-gray-100 text-gray-600' : ''}
                    `}>
                        {d}
                    </button>
                </div>
            )
        })}
      </div>
    </div>
  );
};

const Rooms: React.FC = () => {
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
                 <CalendarWidget />
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Rooms;