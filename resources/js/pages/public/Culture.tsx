import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const Culture: React.FC = () => {
  return (
    <section id="around-us" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        
        <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-8">
            <h2 className="text-4xl md:text-5xl font-medium leading-tight tracking-tight max-w-lg">
                Experience the Local Culture and Sights
            </h2>
            <div className="flex flex-col items-start md:items-end gap-6">
                <p className="text-gray-500 text-sm max-w-xs text-left md:text-right leading-relaxed">
                    We offer a range of world-class facilities to ensure your stay is both comfortable and memorable.
                </p>
                <button className="flex items-center gap-2 border border-gray-300 hover:bg-black hover:text-white transition-all px-5 py-2 rounded-full text-sm font-medium group hover:border-black">
                  More Info
                  <div className="bg-black text-white group-hover:bg-white group-hover:text-black rounded-full p-0.5 transition-colors">
                    <ArrowUpRight size={14} />
                  </div>
                </button>
            </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px] md:h-[500px]">
            {/* Large Left Image - Rice Terrace */}
            <div className="md:col-span-1 h-full rounded-3xl overflow-hidden group relative">
                <img 
                    src="https://images.unsplash.com/photo-1512413316925-fd4b93f31521?q=80&w=1974&auto=format&fit=crop" 
                    alt="Rice Terrace" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
            </div>

            {/* Middle Column - Split Images */}
            <div className="md:col-span-1 flex flex-col gap-4 h-full">
                <div className="flex-1 rounded-3xl overflow-hidden group relative">
                    <img 
                        src="https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=2070&auto=format&fit=crop" 
                        alt="Ocean Cliff" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                </div>
                <div className="flex-1 rounded-3xl overflow-hidden group relative">
                    <img 
                        src="https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?q=80&w=2070&auto=format&fit=crop" 
                        alt="Waterfall" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                </div>
            </div>

            {/* Right Column - Statue */}
            <div className="md:col-span-1 h-full rounded-3xl overflow-hidden group relative">
                <img 
                    src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1938&auto=format&fit=crop" 
                    alt="Temple Statue" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
            </div>
        </div>

      </div>
    </section>
  );
};

export default Culture;