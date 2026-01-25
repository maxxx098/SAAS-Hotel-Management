import React from 'react';
import { SectionHeader } from '@/components/ui/section-header';

export const AboutSection: React.FC = () => {
  return (
    <section className="container mx-auto px-6 pb-20 pt-10 md:pt-0">
      <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        
        {/* Image Side */}
        <div className="w-full lg:w-1/2 relative group">
          <div className="overflow-hidden rounded-2xl md:rounded-[2rem]">
            <img 
              src="https://images.unsplash.com/photo-1571896349842-6e5c48dc9fb1?q=80&w=1000&auto=format&fit=crop" 
              alt="Pool Villa" 
              className="w-full h-[400px] md:h-[500px] object-cover transform transition-transform duration-700 group-hover:scale-110"
            />
          </div>
          {/* Decorative outline */}
          <div className="absolute -bottom-6 -left-6 w-full h-full border border-zinc-200 rounded-[2rem] -z-10 hidden md:block"></div>
        </div>

        {/* Text Side */}
        <div className="w-full lg:w-1/2">
          <SectionHeader 
            title="Giving the Best Just For You" 
          />
          <p className="text-zinc-500 leading-relaxed font-sans mb-6">
            FAAS LOFTS HOTEL blends contemporary luxury with authentic Balinese hospitality. Each room is thoughtfully curated to provide a relaxing ambiance, featuring elegant interiors and premium amenities tailored for your comfort.
          </p>
          <p className="text-zinc-500 leading-relaxed font-sans">
             Immerse yourself in a serene environment where every detail is designed to help you unwind and reconnect with nature, just steps away from the vibrant heart of Canggu.
          </p>
        </div>

      </div>
    </section>
  );
};