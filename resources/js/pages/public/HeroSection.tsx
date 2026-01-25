import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section id="home" className="relative w-full h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop" 
          alt="Hotel Lobby" 
          className="w-full h-full object-cover brightness-[0.6]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
      </div>

      <div className="relative h-full container mx-auto px-6 flex flex-col justify-end pb-20 md:pb-32 text-white">
        
        <div className="flex flex-col md:flex-row items-end justify-between gap-12">
          
          {/* Main Text */}
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-medium leading-tight tracking-tight mb-6">
              Book Your <br />
              Comfort Room <br />
              Today!
            </h1>
          </div>

          {/* Circular Interaction & Side Text */}
          <div className="flex flex-col items-end gap-8">
            <p className="max-w-xs text-right text-gray-200 text-lg leading-relaxed mb-4 hidden md:block">
              Get Ready for an Adventure! Reserve Your Spot Now and Embark on Your Hobbit Journey!
            </p>

            <div className="relative w-48 h-48 md:w-64 md:h-64 hidden md:block">
               {/* Decorative Ring */}
               <div className="absolute inset-0 rounded-full border border-white/30 animate-spin-slow" style={{ animationDuration: '20s' }}>
                  <div className="absolute top-1/2 -right-1 w-2 h-2 bg-white rounded-full"></div>
                  <div className="absolute bottom-4 left-4 w-2 h-2 bg-white rounded-full"></div>
               </div>
               
               {/* Center Image */}
               <div className="absolute inset-4 rounded-full overflow-hidden border-4 border-white/10">
                 <img 
                   src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=2070&auto=format&fit=crop"
                   alt="Room Detail"
                   className="w-full h-full object-cover"
                 />
               </div>

               {/* Floating Labels */}
               <div className="absolute top-1/2 -left-16 -translate-y-1/2 flex items-center gap-2">
                  <span className="text-sm font-medium">Enchanting</span>
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
               </div>
               <div className="absolute bottom-8 -left-8 flex items-center gap-2">
                  <span className="text-sm font-medium">Unique</span>
                  <div className="w-2 h-2 bg-white rounded-full ring-4 ring-white/20"></div>
               </div>
               <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  <span className="text-sm font-medium">Rejuvenate</span>
               </div>
            </div>
            
            {/* Mobile simplified circle */}
             <div className="md:hidden">
                <div className="w-16 h-16 bg-yellow-600 rounded-full blur-2xl opacity-50 absolute right-0"></div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;