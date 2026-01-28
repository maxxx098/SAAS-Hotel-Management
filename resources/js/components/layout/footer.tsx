import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white py-20 border-t border-gray-100">
      <div className="container mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            {/* Brand Column */}
            <div className="md:col-span-1">
                 <div className="flex flex-col mb-6">
                    <span className="text-xl font-serif tracking-widest uppercase font-bold">Glamour</span>
                    <span className="text-[8px] tracking-[0.2em] text-gray-500 uppercase">Hotel & Resort</span>
                </div>
                <p className="text-gray-500 text-xs leading-relaxed max-w-xs">
                    Glamour Hotel and Resort is a five-star hotel located in Canggu, Bali. Known for its stunning views and elegant atmosphere, this hotel offers a luxurious and unforgettable vacation experience.
                </p>
                <button className="mt-8 text-sm font-semibold border-b border-black pb-0.5 hover:opacity-70 transition-opacity">
                    Go to Details
                </button>
            </div>

            {/* Links Columns */}
            <div>
                <h4 className="font-bold text-sm mb-6">About</h4>
                <ul className="flex flex-col gap-4 text-gray-500 text-sm">
                    <li><a href="#" className="hover:text-black transition-colors">Career</a></li>
                    <li><a href="#" className="hover:text-black transition-colors">Experience</a></li>
                    <li><a href="#" className="hover:text-black transition-colors">Direction</a></li>
                </ul>
            </div>

            <div>
                <h4 className="font-bold text-sm mb-6">Package</h4>
                <ul className="flex flex-col gap-4 text-gray-500 text-sm">
                    <li><a href="#" className="hover:text-black transition-colors">Wedding</a></li>
                    <li><a href="#" className="hover:text-black transition-colors">Meeting</a></li>
                    <li><a href="#" className="hover:text-black transition-colors">Birthday</a></li>
                    <li><a href="#" className="hover:text-black transition-colors">Workspace</a></li>
                </ul>
            </div>

            <div>
                <h4 className="font-bold text-sm mb-6">Keep in Touch</h4>
                <ul className="flex flex-col gap-4 text-gray-500 text-sm">
                    <li><a href="#" className="hover:text-black transition-colors">Instagram</a></li>
                    <li><a href="#" className="hover:text-black transition-colors">Twitter</a></li>
                    <li><a href="#" className="hover:text-black transition-colors">Tiktok</a></li>
                </ul>
            </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-400 font-medium uppercase tracking-wide pt-8 border-t border-gray-100">
            <p>Copyright © Glamour Hotel & Resort 2024</p>
            <p>The Best Companion for Your Rest.</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;