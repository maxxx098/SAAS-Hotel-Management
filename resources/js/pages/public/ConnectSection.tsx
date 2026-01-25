import React from 'react';
import { Button } from '@/components/ui/button';

export const ConnectSection: React.FC = () => {
  return (
    <section className="container mx-auto px-6 py-12">
      <div className="relative rounded-[2.5rem] overflow-hidden h-[350px] md:h-[450px]">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2070&auto=format&fit=crop")' 
          }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col justify-center items-center text-center px-6">
          <h2 className="font-serif text-4xl md:text-6xl text-white mb-6">Connect With Us</h2>
          <p className="text-white/80 font-sans max-w-xl mb-10 text-sm md:text-base">
            We're here to assist you! Reach out to us for inquiries, bookings, or any information you need. Let's connect and make your experience seamless.
          </p>
          <Button variant="secondary" className="px-8 py-3 text-sm font-bold uppercase tracking-wider">
            Get In Touch
          </Button>
        </div>
      </div>
    </section>
  );
};