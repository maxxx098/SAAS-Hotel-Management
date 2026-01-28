import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  location: string;
  flag: string;
  text: string;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Carlos García',
    location: 'Madrid, Spain',
    flag: '🇪🇸',
    text: "My stay at Glamour Hotel and Resort was absolutely fantastic! The luxurious ambiance and elegant decor made it feel like a true five-star experience. Highly recommended for anyone seeking a top-notch luxury stay!",
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1887&auto=format&fit=crop'
  },
  {
    id: 2,
    name: 'Emma Wilson',
    location: 'Canberra, Australia',
    flag: '🇦🇺',
    text: "The atmosphere was serene and beautifully decorated, making it ideal for couples. The spa services were excellent, offering a variety of treatments that left us feeling rejuvenated.",
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop'
  },
  {
    id: 3,
    name: 'Yui Suzuki',
    location: 'Osaka, Japan',
    flag: '🇯🇵',
    text: "We had a wonderful family vacation at Glamour Hotel and Resort. The resort had something for everyone, including a kids' club, multiple pools, and a variety of activities.",
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=1887&auto=format&fit=crop'
  },
  {
    id: 4,
    name: 'Klara Braun',
    location: 'Wolfsburg, Germany',
    flag: '🇩🇪',
    text: "The conference facilities were top-notch, and the staff were incredibly courteous. My room was spacious and comfortable, providing a perfect place to unwind after meetings.",
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop'
  },
  {
    id: 5,
    name: 'Lukas Wagner',
    location: 'Munich, Germany',
    flag: '🇩🇪',
    text: "The location is perfect, and the views are breathtaking. The staff went above and beyond to make our stay comfortable. Will definitely come back!",
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1887&auto=format&fit=crop'
  }
];

const Testimonials: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({ left: direction === 'right' ? scrollAmount : -scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-50 bg-white overflow-hidden">
      <div className="container mx-auto px-6 mb-16 text-center">
        <h2 className="text-4xl md:text-5xl font-medium mb-6">The Words of Our Guest!</h2>
        <p className="text-gray-500 text-sm max-w-xl mx-auto leading-relaxed">
            From luxurious rooms and top-notch amenities to friendly staff and delicious dining, our guests share their honest feedback.
        </p>
      </div>

      {/* Scrolling Container */}
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-12 px-6 md:px-[20vw] no-scrollbar snap-x snap-mandatory"
        style={{ scrollPaddingLeft: '24px', scrollPaddingRight: '24px' }}
      >
        {testimonials.map((item) => (
          <div 
            key={item.id} 
            className="flex-shrink-0 w-[300px] md:w-[350px] bg-white p-8 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.05)] flex flex-col justify-between snap-center border border-gray-50"
          >
             <div>
                 <div className="flex items-center gap-2 mb-6">
                     <span className="text-sm font-semibold text-gray-800">{item.location}</span>
                     <span className="text-sm">{item.flag}</span>
                 </div>
                 <p className="text-gray-600 text-sm leading-relaxed mb-8">
                     {item.text}
                 </p>
             </div>

             <div className="flex items-center gap-4">
                 <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
                 <span className="font-medium text-gray-900">{item.name}</span>
             </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-4 mt-4">
            <button onClick={() => scroll('left')} className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:border-black transition-colors">
                <ChevronLeft size={20} />
            </button>
            <button onClick={() => scroll('right')} className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:border-black transition-colors">
                <ChevronRight size={20} />
            </button>
      </div>

    </section>
  );
};

export default Testimonials;