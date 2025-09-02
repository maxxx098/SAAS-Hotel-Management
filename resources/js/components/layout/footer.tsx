import React from 'react';

const Footer: React.FC = () => {
  return (
    <div className="bg-black relative text-white ">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="text-xl font-medium">Vario Financial Planning</div>
          <button className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-sm">
            Vario Practice
          </button>
        </div>
        {/* Contact Info */}
        <div className="flex items-center gap-8 mt-3 mb-8 text-gray-400 text-sm">
          <span className="flex items-center gap-2">
            <span className="text-red-600">📍</span>
            Australia - Sydney 2000
          </span>
          <span className="flex items-center gap-2">
            <span className="text-red-600">📞</span>
            (845) 555-7018
          </span>
          <span className="flex items-center gap-2">
            <span className="text-red-600">✉️</span>
            hello@vario.com
          </span>
        </div>
        {/* Main Content */}
     
         <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-16 items-center">

          {/* Left Side - Navigation */}
          <div className="grid grid-cols-3 gap-8">
            {/* Features */}
            <div>
              <h3 className="text-white font-medium mb-6">Features</h3>
              <ul className="space-y-4 text-gray-300">
                <li>Budgeting</li>
                <li>Savings</li>
                <li>Accounts</li>
                <li className="flex items-center gap-2">
                  Secured Data
                  <span className="bg-[#F4C2A1] text-black text-xs px-2 py-1 rounded font-medium">
                    New
                  </span>
                </li>
              </ul>
            </div>

            {/* Solutions */}
            <div>
              <h3 className="text-white font-medium mb-6">Solutions</h3>
              <ul className="space-y-4 text-gray-300">
                <li>Financial Planning</li>
                <li className="flex items-center gap-2">
                  Vario FPM
                  <span className="bg-[#F4C2A1] text-black text-xs px-2 py-1 rounded font-medium">
                    New
                  </span>
                </li>
                <li>Security</li>
                <li>Fraud Detections</li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-white font-medium mb-6">Resources</h3>
              <ul className="space-y-4 text-gray-300">
                <li>Blog</li>
                <li>Community</li>
                <li>Help</li>
                <li className="flex items-center gap-2">
                  Monitoring
                  <span className="bg-[#F4C2A1] text-black text-xs px-2 py-1 rounded font-medium">
                    New
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Side - CTA */}
          <div className="">
            <h2 className="text-4xl font-bold mb-4">
              Start your 7-day<br />free trial
            </h2>
            <p className="text-gray-400 mb-8">
              Lorem ipsum dolor sit amet, consectetur<br />
              adipiscing elit. Risus mauris.
            </p>
            
            <div className="space-y-4">
              <div className="grid">
                <input
                  type="email"
                  placeholder="Your email address..."
                  className="bg-gray-800 text-white px-4 py-3 rounded-l flex-1 placeholder-gray-500 border-0 focus:outline-none focus:ring-2 focus:ring-[#F4C2A1]"
                />
                <button className="bg-[#F4C2A1] mt-3 text-black  px-6 py-3 rounded-r font-medium">
                  Get Started
                </button>
              </div>
              
              <div className="flex items-center text-sm text-gray-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#F4C2A1] rounded-full"></div>
                    Free 7-day trial
                  </span>
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#F4C2A1] rounded-full"></div>
                    Cancel anytime
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Bottom */}
        <div className="flex justify-between items-center pt-8 border-t mt-10 border-gray-800">
          <div className="text-gray-400 text-sm">
            ©2024 Vario All Rights Reserved.
          </div>
          <div className="flex gap-6 text-gray-400 text-sm">
            <a href="#" className="hover:text-white">Instagram</a>
            <a href="#" className="hover:text-white">LinkedIn</a>
            <a href="#" className="hover:text-white">Twitter</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;