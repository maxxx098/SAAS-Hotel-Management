import React from 'react';
interface Facility {
  id: number;
  title: string;
  image: string;
}

const facilities: Facility[] = [
  { id: 1, title: 'Mini Bar', image: 'https://images.unsplash.com/photo-1574096079513-d82599602950?q=80&w=1974&auto=format&fit=crop' },
  { id: 2, title: 'Workspace', image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop' },
  { id: 3, title: 'Jacuzzi Bathroom', image: 'https://images.unsplash.com/photo-1606026939912-321528659dc6?q=80&w=1974&auto=format&fit=crop' },
  { id: 4, title: 'Library Room', image: 'https://images.unsplash.com/photo-1507842217121-9e93c8aaf27c?q=80&w=2070&auto=format&fit=crop' },
  { id: 5, title: 'Restaurant', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop' },
];

const Facilities: React.FC = () => {
  return (
    <section id="facilities" className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-6 mb-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="max-w-md">
                <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                    Experience the ultimate in comfort and style by choosing the perfect room tailored to your needs.
                </p>
            </div>
            <h2 className="text-4xl md:text-5xl font-medium text-right leading-tight">
                Premier Facilities and <br /> Guest Services
            </h2>
        </div>
      </div>

      {/* Scrolling List */}
      <div className="container mx-auto px-6">
          <div className="flex gap-4 overflow-x-auto pb-8 no-scrollbar snap-x">
             {facilities.map((item, i) => (
                 <div key={item.id} className={`
                    relative shrink-0 rounded-3xl overflow-hidden snap-center group cursor-pointer
                    ${i === 2 ? 'w-[320px] md:w-[400px] h-[450px]' : 'w-[240px] md:w-[280px] h-[400px] mt-auto'}
                 `}>
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-0 right-0 text-center">
                        <span className="text-white text-lg font-medium tracking-wide">{item.title}</span>
                    </div>
                 </div>
             ))}
          </div>
          
          <div className="flex justify-center mt-8">
              <button className="border border-gray-300 px-8 py-2.5 rounded-full text-sm font-medium hover:bg-black hover:text-white transition-all hover:border-black">
                  See All
              </button>
          </div>
      </div>
    </section>
  );
};

export default Facilities;