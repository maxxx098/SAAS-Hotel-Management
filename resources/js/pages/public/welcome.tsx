import Layout from '@/components/layout';
import { ArrowRight, Award, CheckCircle, ChevronRight, Crown, MapPin, PlayCircle, Sparkles, Star } from 'lucide-react';
import { useState } from 'react';
import TestimonialsSection from './TestimonialSection.';

export default function PremiumHotelLanding() {
    const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

    const premiumFeatures = [
        {
            icon: (
                <svg viewBox="-0.25 -0.25 25.50 25.50" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                    <g id="SVGRepo_iconCarrier">
                        {' '}
                        <path
                            d="M12.5 13V22M12.5 13L4.5 8M12.5 13L20.5 8M8.5 5.5L16.5 10.5M4.5 8L12.5 3L20.5 8V17L12.5 22L4.5 17V8Z"
                            stroke="#F4C2A1"
                            stroke-width="2.5"
                        ></path>{' '}
                    </g>
                </svg>
            ),
            title: 'Intelligent Reservation Engine',
            description:
                'AI-powered booking system with dynamic pricing, real-time availability sync across all channels, and automated guest communication workflows.',
            badge: 'AI-Enhanced',
            color: '',
            bgGradient: 'bg-[#1A1A1A] border-[rgba(255,255,255,0.05)] hover:border-[#d41515]/30',
            image: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=600&h=400&fit=crop&crop=center&auto=format&q=80',
            stats: { primary: '2.3x', secondary: 'Booking increase' },
            features: ['Multi-channel sync', 'Dynamic pricing', 'Guest automation'],
        },
        {
            icon: (
                <svg viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                    <g id="SVGRepo_iconCarrier">
                        {' '}
                        <path d="M16.5 14.5L20.5 16.5L12.5 20.5L4.5 16.5L8.5 14.5" stroke="#F4C2A1" stroke-width="2.1"></path>{' '}
                        <path d="M16.5 10.5L20.5 12.5L12.5 16.5L4.5 12.5L8.5 10.5" stroke="#F4C2A1" stroke-width="2.1"></path>{' '}
                        <path d="M20.5 8.5L12.5 12.5L4.5 8.5L12.5 4.5L20.5 8.5Z" stroke="#F4C2A1" stroke-width="2.1"></path>{' '}
                    </g>
                </svg>
            ),
            title: 'Revenue Intelligence Hub',
            description:
                'Advanced analytics with predictive insights, automated reporting, and revenue optimization recommendations powered by machine learning.',
            badge: 'Predictive Analytics',
            color: '',
            bgGradient: 'bg-[#1A1A1A] border-[rgba(255,255,255,0.05)] hover:border-[#d41515]/30',
            image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&crop=center&auto=format&q=80',
            stats: { primary: '34%', secondary: 'Revenue growth' },
            features: ['ML predictions', 'Custom dashboards', 'Automated reports'],
        },
        {
            icon: (
                <svg viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                    <g id="SVGRepo_iconCarrier">
                        {' '}
                        <path
                            d="M18.5 7V17.5C18.5 19.0594 16.0504 20.5 12.5 20.5C8.9496 20.5 6.5 19.0594 6.5 17.5V7M18.5 7C18.5 8.45543 15.8137 9.5 12.5 9.5C9.18629 9.5 6.5 8.45543 6.5 7C6.5 5.54457 9.18629 4.5 12.5 4.5C15.8137 4.5 18.5 5.54457 18.5 7Z"
                            stroke="#F4C2A1"
                            stroke-width="2.5"
                        ></path>{' '}
                    </g>
                </svg>
            ),
            title: 'VIP Guest Experience',
            description: 'Personalized guest journeys with preference tracking, loyalty program integration, and automated experience customization.',
            badge: 'Premium Service',
            color: '',
            bgGradient: 'bg-[#1A1A1A] border-[rgba(255,255,255,0.05)] hover:border-[#d41515]/30',
            image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop&crop=center&auto=format&q=80',
            stats: { primary: '4.8★', secondary: 'Guest satisfaction' },
            features: ['Preference tracking', 'Loyalty integration', 'Personal concierge'],
        },
    ];

    const stats = [
        {
            value: '5,000+',
            label: 'Premium Hotels',
            icon: (
                <svg viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                    <g id="SVGRepo_iconCarrier">
                        {' '}
                        <path
                            d="M12.5 20.5L15.5 14M11 9.5L4.5 12.5M9 14C9 14 7.54688 14.9531 6.5 16C5.5 17 4.5 20.5 4.5 20.5C4.5 20.5 8 19.5 9 18.5C10 17.5 11 16 11 16M9 14C9 14 10.1 9.90001 12.5 7.50001C15.5 4.50001 20.5 4.50001 20.5 4.50001C20.5 4.50001 20.5 9.5 17.5 12.5C15.7492 14.2508 11 16 11 16L9 14ZM16.5 10C16.5 10.8284 15.8284 11.5 15 11.5C14.1716 11.5 13.5 10.8284 13.5 10C13.5 9.17157 14.1716 8.5 15 8.5C15.8284 8.5 16.5 9.17157 16.5 10Z"
                            stroke="#F4C2A1"
                            stroke-width="1.475"
                        ></path>{' '}
                    </g>
                </svg>
            ),
            gradient: '',
        },
        {
            value: '50M+',
            label: 'Reservations Managed',
            icon: (
                <svg viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                    <g id="SVGRepo_iconCarrier">
                        {' '}
                        <path d="M16 14L12.5 17.5L9 14M4.5 7.5V20.5H20.5V7.5L18.5 4.5H6.5L4.5 7.5Z" stroke="#F4C2A1" stroke-width="2.125"></path>{' '}
                        <path d="M12.5 10.5V17" stroke="#F4C2A1" stroke-width="2.125"></path>{' '}
                        <path d="M4.5 7.5H20.5" stroke="#F4C2A1" stroke-width="2.125"></path>{' '}
                    </g>
                </svg>
            ),
            gradient: '',
        },
        {
            value: '99.9%',
            label: 'System Uptime',
            icon: (
                <svg viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                    <g id="SVGRepo_iconCarrier">
                        {' '}
                        <path d="M4.5 18.5L11.5 10.5L13.5 14.5L20.5 6.5" stroke="#F4C2A1" stroke-width="2.25"></path>{' '}
                        <path d="M20.5 11V6.5H16" stroke="#F4C2A1" stroke-width="2.25"></path>{' '}
                    </g>
                </svg>
            ),
            gradient: '',
        },
        {
            value: '24/7',
            label: 'White-Glove Support',
            icon: (
                <svg viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                    <g id="SVGRepo_iconCarrier">
                        {' '}
                        <path
                            d="M15.9957 11.5C14.8197 10.912 11.9957 9 10.4957 9C8.9957 9 5.17825 11.7674 6 13C7 14.5 9.15134 11.7256 10.4957 12C11.8401 12.2744 13 13.5 13 14.5C13 15.5 11.8401 16.939 10.4957 16.5C9.15134 16.061 8.58665 14.3415 7.4957 14C6.21272 13.5984 5.05843 14.6168 5.5 15.5C5.94157 16.3832 7.10688 17.6006 8.4957 19C9.74229 20.2561 11.9957 21.5 14.9957 20C17.9957 18.5 18.5 16.2498 18.5 13C18.5 11.5 13.7332 5.36875 11.9957 4.5C10.9957 4 10 5 10.9957 6.5C11.614 7.43149 13.5 9.27705 14 10.3751M15.5 8C15.5 8 15.3707 7.5 14.9957 6C14.4957 4 15.9957 3.5 16.4957 4.5C17.1281 5.76491 18.2872 10.9147 18.4957 13"
                            stroke="#F4C2A1"
                            stroke-width="1.7"
                        ></path>{' '}
                    </g>
                </svg>
            ),
            gradient: '',
        },
    ];

    const testimonials = [
        {
            quote: 'This platform transformed our operations completely. Revenue increased by 40% in the first quarter.',
            author: 'Sarah Johnson',
            role: 'General Manager',
            hotel: 'The Grand Luxe Resort',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face&auto=format&q=80',
            rating: 5,
        },
        {
            quote: 'The AI-powered insights helped us optimize pricing strategies like never before. Absolutely game-changing.',
            author: 'Michael Chen',
            role: 'Revenue Director',
            hotel: 'Metropolitan Hotel Group',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face&auto=format&q=80',
            rating: 5,
        },
    ];

    const galleryImages = [
        {
            src: 'https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            label: 'Luxury Reception',
            overlay: 'Experience elegance',
        },
        {
            src: 'https://images.unsplash.com/photo-1517840901100-8179e982acb7?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            label: 'Premium Suites',
            overlay: 'Comfort redefined',
        },
        {
            src: 'https://images.unsplash.com/photo-1495365200479-c4ed1d35e1aa?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            label: 'Fine Dining',
            overlay: 'Culinary excellence',
        },
    ];

    return (
        <Layout>
            <div className="min-h-screen">
                {/* Hero Section */}
                <section className="relative flex min-h-screen items-center overflow-hidden py-20 lg:py-50">
                    {/* Background with overlay */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920&h=1080&fit=crop&crop=center&auto=format&q=80"
                            alt="Luxury Hotel"
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/70"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30"></div>
                    </div>

                    <div className="relative z-10 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid items-center gap-16 lg:grid-cols-2">
                            {/* Left Content */}
                            <div className="space-y-8">
                                <div className="space-y-6">
                                    <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#303030] via-[#303030] to-[#303030] px-4 py-2 text-xs font-medium text-white backdrop-blur-sm">
                                        <svg width={30} height={30} viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                                            <g id="SVGRepo_iconCarrier">
                                                {' '}
                                                <path
                                                    d="M5.5 16.5H19.5M5.5 8.5H19.5M4.5 12.5H20.5M12.5 20.5C12.5 20.5 8 18.5 8 12.5C8 6.5 12.5 4.5 12.5 4.5M12.5 4.5C12.5 4.5 17 6.5 17 12.5C17 18.5 12.5 20.5 12.5 20.5M12.5 4.5V20.5M20.5 12.5C20.5 16.9183 16.9183 20.5 12.5 20.5C8.08172 20.5 4.5 16.9183 4.5 12.5C4.5 8.08172 8.08172 4.5 12.5 4.5C16.9183 4.5 20.5 8.08172 20.5 12.5Z"
                                                    stroke="white"
                                                    stroke-width="1.2"
                                                ></path>{' '}
                                            </g>
                                        </svg>
                                        Premium Hotel Management Platform
                                    </div>

                                    <h1 className="text-5xl leading-tight font-black tracking-tight md:text-6xl lg:text-7xl">
                                        <span className="font-bold text-white">Elevate Your</span>
                                        <br />
                                        <span className="bg-clip-text text-[#F4C2A1]">Hotel Excellence</span>
                                    </h1>

                                    <p className="max-w-2xl leading-relaxed text-gray-300">
                                        Transform your property into a world-class destination with AI-powered management tools, predictive analytics,
                                        and seamless guest experiences that drive exceptional results.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-4 sm:flex-row">
                                    <button className="group relative overflow-hidden rounded-xl bg-[#F4C2A1] px-8 py-4 text-sm font-semibold text-black transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/25">
                                        <div className="relative flex items-center justify-center">
                                            Start Premium Trial
                                            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                        </div>
                                    </button>

                                    <button className="group rounded-xl border border-white/20 from-[#303030] via-[#303030] to-[#303030] px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-white/20">
                                        <div className="flex items-center justify-center">
                                            <PlayCircle className="mr-2 h-4 w-4" />
                                            Watch Demo
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Right Gallery Grid */}
                            <div className="grid h-full grid-cols-2 gap-6">
                                {galleryImages.map((image, index) => (
                                    <div key={index} className={`group relative overflow-hidden rounded-2xl ${index % 3 === 0 ? 'row-span-2' : ''}`}>
                                        <img
                                            src={image.src}
                                            alt={image.label}
                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-all duration-300 group-hover:from-black/60"></div>
                                        <div className="absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                        <div className="absolute right-4 bottom-4 left-4">
                                            <div className="mb-1 text-xs font-medium text-[#F4C2A1] opacity-0 transition-opacity delay-100 duration-300 group-hover:opacity-100">
                                                {image.overlay}
                                            </div>
                                            <div className="font-semibold text-white">{image.label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Scroll Indicator */}
                    <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 transform">
                        <div className="flex flex-col items-center space-y-2 text-white/60">
                            <span className="text-xs font-medium">Discover More</span>
                            <div className="flex h-10 w-6 justify-center rounded-full border-2 border-white/30">
                                <div className="mt-2 h-3 w-1 animate-bounce rounded-full bg-white/60"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="relative py-32">
                    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-20 space-y-6 text-center">
                            <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-gradient-to-r from-[#303030] via-[#303030] to-[#303030] px-4 py-2 text-sm font-medium text-white">
                                <Award className="h-4 w-4" color="white" />
                                Industry-Leading Features
                            </div>
                            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                                Redefining Hotel
                                <span className="block bg-clip-text text-[#F4C2A1]">Management Excellence</span>
                            </h2>
                            <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-300">
                                Experience the future of hospitality with our comprehensive suite of intelligent tools designed to maximize
                                efficiency, revenue, and guest satisfaction.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
                            {premiumFeatures.map((feature, index) => (
                                <div
                                    key={index}
                                    className="group relative"
                                    onMouseEnter={() => setHoveredFeature(index)}
                                    onMouseLeave={() => setHoveredFeature(null)}
                                >
                                    <div className="relative h-full overflow-hidden rounded-3xl border border-gray-700/50 bg-gradient-to-br from-gray-800/50 to-gray-900/80 backdrop-blur-sm transition-all duration-500 hover:border-gray-600/50">
                                        {/* Gradient Overlay */}
                                        <div
                                            className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} transition-opacity duration-500 group-hover:opacity-80`}
                                        ></div>

                                        <div className="relative z-10 flex h-full flex-col p-8">
                                            {/* Icon and Badge */}
                                            <div className="mb-6 flex items-start justify-between">
                                                <div
                                                    className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${feature.color} text-white shadow-2xl transition-transform duration-300 group-hover:scale-110`}
                                                >
                                                    {feature.icon}
                                                </div>
                                                <div className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                                    {feature.badge}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 space-y-4">
                                                <h3 className="text-xl font-bold text-white transition-colors duration-300 group-hover:text-white">
                                                    {feature.title}
                                                </h3>
                                                <p className="leading-relaxed text-gray-300">{feature.description}</p>
                                            </div>

                                            {/* Stats */}
                                            <div className="mt-6 border-t border-white/10 pt-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <div className="text-2xl font-bold text-white">{feature.stats.primary}</div>
                                                        <div className="text-sm text-gray-400">{feature.stats.secondary}</div>
                                                    </div>
                                                    <button className="group/btn flex items-center gap-2 text-white transition-colors duration-300 hover:text-amber-400">
                                                        <span className="text-sm font-medium">Learn More</span>
                                                        <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="relative overflow-hidden py-32">
                    <div className="absolute inset-0">
                        <img
                            src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920&h=800&fit=crop&crop=center&auto=format&q=80"
                            alt="Hotel Excellence"
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/80"></div>
                        <div className="absolute inset-0 bg-gradient-to-r"></div>
                    </div>

                    <div className="relative z-10 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-20 space-y-6 text-center">
                            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Trusted by Industry Leaders</h2>
                            <p className="mx-auto max-w-2xl text-xl text-gray-300">
                                Join the world's most successful hotels in delivering exceptional experiences
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {stats.map((stat, index) => (
                                <div key={index} className="group text-center">
                                    <div className="relative rounded-3xl border border-white/20 bg-white/10 p-8 backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-white/20">
                                        <div
                                            className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${stat.gradient} mb-6 text-white transition-transform duration-300 group-hover:scale-110`}
                                        >
                                            {stat.icon}
                                        </div>
                                        <div className="mb-2 text-4xl font-bold text-white">{stat.value}</div>
                                        <div className="font-medium text-gray-300">{stat.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
               <TestimonialsSection/>
 
            </div>
        </Layout>
    );
}
