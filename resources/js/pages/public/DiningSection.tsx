import React from 'react';
import { SectionHeader } from '@/components/ui/section-header';
import { Utensils, Coffee, Bell, ChefHat, ArrowUpRight } from 'lucide-react';

interface DiningOption {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number }>;
}

const diningOptions: DiningOption[] = [
  {
    id: '1',
    title: 'FAAS Restaurant',
    description: 'In case you did not book your breakfast at the time you made your reservation.',
    icon: Utensils,
  },
  {
    id: '2',
    title: 'Floating Breakfast',
    description: 'Relax in the comfort of your private pool and we\'ll serve your preferred breakfast.',
    icon: Coffee,
  },
  {
    id: '3',
    title: 'Room Services',
    description: 'During your stay, we keep you feeling right at home with our room service available.',
    icon: Bell,
  },
  {
    id: '4',
    title: 'Rassa',
    description: 'Delicious catering for any occasion, featuring fresh ingredients and rich flavors.',
    icon: ChefHat,
  },
];

export const DiningSection: React.FC = () => {
  return (
    <section id="dining" className="container mx-auto px-6 py-24 bg-zinc-50/50">
      <SectionHeader 
        title="A Delightful Dining Experience" 
        subtitle="Enjoy a memorable dining experience in a stylish and relaxing setting."
        center
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {diningOptions.map((option) => {
          const Icon = option.icon;
          return (
            <div key={option.id} className="bg-white p-8 rounded-xl border border-zinc-100 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-zinc-50 flex items-center justify-center mb-6 group-hover:bg-zinc-900 transition-colors">
                <span className="text-zinc-900 group-hover:text-white transition-colors">
                  <Icon size={24} />
                </span>
              </div>
              <h3 className="font-serif text-xl mb-3 text-zinc-900">{option.title}</h3>
              <p className="text-zinc-500 text-sm mb-6 leading-relaxed flex-grow">
                {option.description}
              </p>
              <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-900 group-hover:text-zinc-600 transition-colors">
                Discover More <ArrowUpRight size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};