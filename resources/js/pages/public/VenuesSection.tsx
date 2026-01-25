import React from 'react';
import { Button } from '@/components/ui/button';

export const VenuesSection: React.FC = () => {
  return (
    <section id="venue" className="container mx-auto px-6 py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Umalas Venue */}
        <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden flex flex-col md:flex-row h-auto md:h-64">
          <div className="w-full md:w-5/12 h-48 md:h-full">
            <img 
              src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop" 
              alt="Umalas Venue" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-full md:w-7/12 p-8 flex flex-col justify-center items-start">
            <h3 className="font-serif text-2xl mb-2 text-zinc-900">Umalas Venue</h3>
            <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
              A Stylish and Versatile Space for Unforgettable Events
            </p>
            <Button variant="default" className="py-2 px-6 text-xs uppercase font-bold tracking-wider">Learn More</Button>
          </div>
        </div>

        {/* Whole Villa */}
        <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden flex flex-col md:flex-row h-auto md:h-64">
           <div className="w-full md:w-5/12 h-48 md:h-full">
            <img 
              src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=800&auto=format&fit=crop" 
              alt="Whole Villa" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-full md:w-7/12 p-8 flex flex-col justify-center items-start">
            <h3 className="font-serif text-2xl mb-2 text-zinc-900">Whole Villa</h3>
            <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
              An Exclusive Retreat with Ultimate Privacy for Your Perfect Stay
            </p>
            <Button variant="default" className="py-2 px-6 text-xs uppercase font-bold tracking-wider">Learn More</Button>
          </div>
        </div>

      </div>
    </section>
  );
};