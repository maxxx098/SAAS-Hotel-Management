import { MailCheck } from 'lucide-react';
import React from 'react';
import Logo from '@/assets/images/Logo.png';
const Footer: React.FC = () => {
    return (
        <div className="relative bg-black text-white">
            <div className="container mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="text-xl font-medium">Oasis Hotel Management</div>
                    <button className="rounded bg-gray-800 px-4 py-2 text-sm hover:bg-gray-700">Oasis</button>
                </div>
                {/* Contact Info */}
                <div className="mt-3 mb-8 flex items-center gap-8 text-sm text-gray-400">
                    <span className="flex items-center gap-2">
                        <svg
                            width={20}
                            viewBox="-3 0 32 32"
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                            xmlnsXlink="http://www.w3.org/1999/xlink"
                            fill="#000000"
                        >
                            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                            <g id="SVGRepo_iconCarrier">
                                {' '}
                                <title>location 2</title> <desc>Created with Sketch Beta.</desc> <defs> </defs>{' '}
                                <g id="Page-1" stroke-width="0.6719999999999999" fill="none" fill-rule="evenodd" >
                                    {' '}
                                    <g id="Icon-Set-Filled"  transform="translate(-157.000000, -413.000000)" fill="#F4C2A1">
                                        {' '}
                                        <path
                                            d="M182.717,425.224 L179.737,419.282 C179.524,419.069 179.241,418.982 178.962,419 L159,419 C157.896,419 157,419.896 157,421 L157,431 C157,432.104 157.896,433 159,433 L179,432.976 C179,432.976 179.534,432.89 179.737,432.688 L182.717,426.745 C182.942,426.325 182.972,426.188 183.002,425.984 C183.016,425.711 182.927,425.604 182.717,425.224 L182.717,425.224 Z M163,441 C163,443.209 164.791,445 167,445 L169,445 C171.209,445 173,443.209 173,441 L173,435 L163,435 L163,441 L163,441 Z M169,413 L167,413 C164.791,413 163,414.791 163,417 L173,417 C173,414.791 171.209,413 169,413 L169,413 Z"
                                            id="location-2"
                                        >
                                            {' '}
                                        </path>{' '}
                                    </g>{' '}
                                </g>{' '}
                            </g>
                        </svg>
                        Australia - Sydney 2000
                    </span>
                    <span className="flex items-center gap-2">
                        <svg width={20} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                            <g id="SVGRepo_iconCarrier">
                                {' '}
                                <path
                                    d="M21 10H14.6C14.0399 10 13.7599 10 13.546 9.89101C13.3578 9.79513 13.2049 9.64215 13.109 9.45399C13 9.24008 13 8.96005 13 8.4V5M10 5H17.8C18.9201 5 19.4802 5 19.908 5.21799C20.2843 5.40973 20.5903 5.71569 20.782 6.09202C21 6.51984 21 7.07989 21 8.2V17.8C21 18.9201 21 19.4802 20.782 19.908C20.5903 20.2843 20.2843 20.5903 19.908 20.782C19.4802 21 18.9201 21 17.8 21H6.2C5.07989 21 4.51984 21 4.09202 20.782C3.71569 20.5903 3.40973 20.2843 3.21799 19.908C3 19.4802 3 18.9201 3 17.8V8.2C3 7.07989 3 6.51984 3.21799 6.09202C3.40973 5.71569 3.71569 5.40973 4.09202 5.21799C4.49359 5.01338 5.01165 5.00082 6 5.00005M10 5V4.6C10 4.03995 10 3.75992 9.89101 3.54601C9.79513 3.35785 9.64215 3.20487 9.45399 3.10899C9.24008 3 8.96005 3 8.4 3H7.6C7.03995 3 6.75992 3 6.54601 3.10899C6.35785 3.20487 6.20487 3.35785 6.10899 3.54601C6 3.75992 6 4.03995 6 4.6V5.00005M10 5V15.4C10 15.9601 10 16.2401 9.89101 16.454C9.79513 16.6422 9.64215 16.7951 9.45399 16.891C9.24008 17 8.96005 17 8.4 17H7.6C7.03995 17 6.75992 17 6.54601 16.891C6.35785 16.7951 6.20487 16.6422 6.10899 16.454C6 16.2401 6 15.9601 6 15.4V5.00005M14 14H14.01V13.99H14V14ZM14 17H14.01V17.01H14V17ZM17 17H17.01V17.01H17V17ZM17 14H17.01V14.01H17V14Z"
                                    stroke="#F4C2A1"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                ></path>{' '}
                            </g>
                        </svg>
                        (845) 555-7018
                    </span>
                    <span className="flex items-center gap-2">
                       <MailCheck color='#F4C2A1' width={20} height={20} />
                        hello@vario.com
                    </span>
                </div>
                {/* Main Content */}

                <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-[2fr_1fr]">
                    {/* Left Side - Navigation */}
                    <div className="grid grid-cols-3 gap-8">
                        {/* Features */}
                        <div>
                            <h3 className="mb-6 font-medium text-white">Features</h3>
                            <ul className="space-y-4 text-gray-300">
                                <li>Budgeting</li>
                                <li>Savings</li>
                                <li>Accounts</li>
                                <li className="flex items-center gap-2">
                                    Secured Data
                                    <span className="rounded bg-[#F4C2A1] px-2 py-1 text-xs font-medium text-black">New</span>
                                </li>
                            </ul>
                        </div>

                        {/* Solutions */}
                        <div>
                            <h3 className="mb-6 font-medium text-white">Solutions</h3>
                            <ul className="space-y-4 text-gray-300">
                                <li>Financial Planning</li>
                                <li className="flex items-center gap-2">
                                    Vario FPM
                                    <span className="rounded bg-[#F4C2A1] px-2 py-1 text-xs font-medium text-black">New</span>
                                </li>
                                <li>Security</li>
                                <li>Fraud Detections</li>
                            </ul>
                        </div>

                        {/* Resources */}
                        <div>
                            <h3 className="mb-6 font-medium text-white">Resources</h3>
                            <ul className="space-y-4 text-gray-300">
                                <li>Blog</li>
                                <li>Community</li>
                                <li>Help</li>
                                <li className="flex items-center gap-2">
                                    Monitoring
                                    <span className="rounded bg-[#F4C2A1] px-2 py-1 text-xs font-medium text-black">New</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Side - CTA */}
                    <div className="">
                        <h2 className="mb-4 text-4xl font-bold">
                            Start your 7-day
                            <br />
                            free trial
                        </h2>
                        <p className="mb-8 text-gray-400">
                            Lorem ipsum dolor sit amet, consectetur
                            <br />
                            adipiscing elit. Risus mauris.
                        </p>

                        <div className="space-y-4">
                            <div className="grid">
                                <input
                                    type="email"
                                    placeholder="Your email address..."
                                    className="flex-1 rounded-l border-0 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#F4C2A1] focus:outline-none"
                                />
                                <button className="mt-3 rounded-r bg-[#F4C2A1] px-6 py-3 font-medium text-black">Get Started</button>
                            </div>

                            <div className="flex items-center text-sm text-gray-400">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-[#F4C2A1]"></div>
                                        Free 7-day trial
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-[#F4C2A1]"></div>
                                        Cancel anytime
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Bottom */}
                <div className="mt-10 flex items-center justify-between border-t border-gray-800 pt-8">
                    <div className="text-sm text-gray-400">©2024 Oasis All Rights Reserved.</div>
                    <div className="flex gap-6 text-sm text-gray-400">
                        <a href="#" className="hover:text-white">
                            Instagram
                        </a>
                        <a href="#" className="hover:text-white">
                            LinkedIn
                        </a>
                        <a href="#" className="hover:text-white">
                            Twitter
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Footer;
