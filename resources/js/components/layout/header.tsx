import React, { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-md py-4' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex items-center justify-between text-white">
        {/* Logo */}
        <div className="flex flex-col">
          <span className="text-2xl font-serif tracking-widest uppercase font-bold">Glamour</span>
          <span className="text-[10px] tracking-[0.2em] text-gray-300 uppercase">Hotel & Resort</span>
        </div>

        {/* Links - Hidden on Mobile */}
        <div className="hidden md:flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-full px-2 py-1 border border-white/20">
          {['Home', 'Rooms', 'Facilities', 'Wedding', 'Around Us'].map((item, index) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(' ', '-')}`}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${index === 0 ? 'bg-white text-black' : 'hover:bg-white/20'}`}
            >
              {item}
            </a>
          ))}
        </div>

        {/* Booking Button */}
        <button className="flex items-center gap-2 border border-white/30 hover:bg-white hover:text-black transition-all px-5 py-2 rounded-full text-sm font-medium group">
          Booking
          <div className="bg-white text-black group-hover:bg-black group-hover:text-white rounded-full p-0.5 transition-colors">
            <ArrowUpRight size={14} />
          </div>
        </button>
      </div>
    </nav>
  );
};

export default Header;