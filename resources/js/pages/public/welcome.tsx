import Layout from '@/components/layout';
import {
    ArrowRight,
    Award,
    BarChart3,
    Building,
    Calendar,
    CheckCircle,
    ChevronRight,
    Crown,
    Diamond,
    Eye,
    HeadphonesIcon,
    MapPin,
    PlayCircle,
    Shield,
    Sparkles,
    Star,
    TrendingUp,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

export default function PremiumHotelLanding() {
    
    const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

    const premiumFeatures = [
        {
            icon: <Calendar className="h-10 w-10" />,
            title: 'Intelligent Reservation Engine',
            description:
                'AI-powered booking system with dynamic pricing, real-time availability sync across all channels, and automated guest communication workflows.',
            badge: 'AI-Enhanced',
            color: 'from-amber-400 via-orange-500 to-red-600',
            bgGradient: 'from-amber-500/10 via-orange-500/20 to-red-600/30',
            image: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=600&h=400&fit=crop&crop=center&auto=format&q=80',
            stats: { primary: '2.3x', secondary: 'Booking increase' },
            features: ['Multi-channel sync', 'Dynamic pricing', 'Guest automation'],
        },
        {
            icon: <BarChart3 className="h-10 w-10" />,
            title: 'Revenue Intelligence Hub',
            description:
                'Advanced analytics with predictive insights, automated reporting, and revenue optimization recommendations powered by machine learning.',
            badge: 'Predictive Analytics',
            color: 'from-blue-400 via-purple-500 to-pink-600',
            bgGradient: 'from-blue-500/10 via-purple-500/20 to-pink-600/30',
            image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&crop=center&auto=format&q=80',
            stats: { primary: '34%', secondary: 'Revenue growth' },
            features: ['ML predictions', 'Custom dashboards', 'Automated reports'],
        },
        {
            icon: <Crown className="h-10 w-10" />,
            title: 'VIP Guest Experience',
            description: 'Personalized guest journeys with preference tracking, loyalty program integration, and automated experience customization.',
            badge: 'Premium Service',
            color: 'from-purple-400 via-pink-500 to-red-600',
            bgGradient: 'from-purple-500/10 via-pink-500/20 to-red-600/30',
            image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop&crop=center&auto=format&q=80',
            stats: { primary: '4.8★', secondary: 'Guest satisfaction' },
            features: ['Preference tracking', 'Loyalty integration', 'Personal concierge'],
        },
        {
            icon: <Diamond className="h-10 w-10" />,
            title: 'Smart Room Operations',
            description: 'IoT-enabled room management with predictive maintenance, energy optimization, and automated housekeeping workflows.',
            badge: 'IoT Integration',
            color: 'from-emerald-400 via-teal-500 to-cyan-600',
            bgGradient: 'from-emerald-500/10 via-teal-500/20 to-cyan-600/30',
            image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=400&fit=crop&crop=center&auto=format&q=80',
            stats: { primary: '45%', secondary: 'Cost reduction' },
            features: ['Predictive maintenance', 'Energy optimization', 'Smart scheduling'],
        },
        {
            icon: <TrendingUp className="h-10 w-10" />,
            title: 'Dynamic Revenue Optimization',
            description:
                'Real-time market analysis with competitor pricing, demand forecasting, and automated rate adjustments for maximum profitability.',
            badge: 'Real-time Optimization',
            color: 'from-green-400 via-emerald-500 to-teal-600',
            bgGradient: 'from-green-500/10 via-emerald-500/20 to-teal-600/30',
            image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&h=400&fit=crop&crop=center&auto=format&q=80',
            stats: { primary: '28%', secondary: 'Profit increase' },
            features: ['Market analysis', 'Competitor tracking', 'Auto-pricing'],
        },
        {
            icon: <Zap className="h-10 w-10" />,
            title: 'Unified Operations Command',
            description:
                'Centralized control center with mobile-first design, real-time notifications, and seamless integration across all hotel systems.',
            badge: 'All-in-One Platform',
            color: 'from-violet-400 via-purple-500 to-indigo-600',
            bgGradient: 'from-violet-500/10 via-purple-500/20 to-indigo-600/30',
            image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=600&h=400&fit=crop&crop=center&auto=format&q=80',
            stats: { primary: '85%', secondary: 'Time saved' },
            features: ['Mobile command center', 'Real-time sync', 'System integration'],
        },
    ];

    const stats = [
        {
            value: '5,000+',
            label: 'Premium Hotels',
            icon: <Building className="h-6 w-6" />,
            gradient: 'from-amber-400 to-orange-500',
        },
        {
            value: '50M+',
            label: 'Reservations Managed',
            icon: <Calendar className="h-6 w-6" />,
            gradient: 'from-blue-400 to-purple-500',
        },
        {
            value: '99.9%',
            label: 'System Uptime',
            icon: <Shield className="h-6 w-6" />,
            gradient: 'from-green-400 to-emerald-500',
        },
        {
            value: '24/7',
            label: 'White-Glove Support',
            icon: <HeadphonesIcon className="h-6 w-6" />,
            gradient: 'from-pink-400 to-red-500',
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
            src: 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=500&h=600&fit=crop&crop=center&auto=format&q=80',
            label: 'Luxury Reception',
            overlay: 'Experience elegance',
        },
        {
            src: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=400&fit=crop&crop=center&auto=format&q=80',
            label: 'Premium Suites',
            overlay: 'Comfort redefined',
        },
        {
            src: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=500&h=400&fit=crop&crop=center&auto=format&q=80',
            label: 'Fine Dining',
            overlay: 'Culinary excellence',
        },
    ];

    return (
        <Layout>
            <div className="min-h-screen">
                {/* Hero Section */}
                <section className="relative flex min-h-screen py-20 lg:py-50 items-center overflow-hidden">
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
                                    <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#303030] via-[#303030] to-[#303030] px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                                        <svg width={30} height={30} viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                                            <g id="SVGRepo_iconCarrier">
                                                {' '}
                                                <path
                                                    d="M5.5 16.5H19.5M5.5 8.5H19.5M4.5 12.5H20.5M12.5 20.5C12.5 20.5 8 18.5 8 12.5C8 6.5 12.5 4.5 12.5 4.5M12.5 4.5C12.5 4.5 17 6.5 17 12.5C17 18.5 12.5 20.5 12.5 20.5M12.5 4.5V20.5M20.5 12.5C20.5 16.9183 16.9183 20.5 12.5 20.5C8.08172 20.5 4.5 16.9183 4.5 12.5C4.5 8.08172 8.08172 4.5 12.5 4.5C16.9183 4.5 20.5 8.08172 20.5 12.5Z"
                                                    stroke="#d20f2c"
                                                    stroke-width="1.2"
                                                ></path>{' '}
                                            </g>
                                        </svg>
                                        Premium Hotel Management Platform
                                    </div>

                                    <h1 className="text-5xl leading-tight font-bold tracking-tight md:text-6xl lg:text-7xl">
                                        <span className="text-white">Elevate Your</span>
                                        <br />
                                        <span className="bg-gradient-to-r from-[#303030] via-[#303030] to-[#303030] bg-clip-text text-transparent">
                                            Hotel Excellence
                                        </span>
                                    </h1>

                                    <p className="max-w-2xl text-xl leading-relaxed text-gray-300">
                                        Transform your property into a world-class destination with AI-powered management tools, predictive analytics,
                                        and seamless guest experiences that drive exceptional results.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-4 sm:flex-row">
                                    <button className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-[#303030] via-[#303030] to-[#303030] px-8 py-4 font-semibold text-white transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/25">
                                        <div className="absolute inset-0 bg-gradient-to-r from-[#303030] via-[#303030] to-[#303030] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                        <div className="relative flex items-center justify-center">
                                            Start Premium Trial
                                            <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                                        </div>
                                    </button>

                                    <button className="group rounded-xl border border-white/20 from-[#303030] via-[#303030] to-[#303030] px-8 py-4 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-white/20">
                                        <div className="flex items-center justify-center">
                                            <PlayCircle className="mr-2 h-5 w-5" />
                                            Watch Demo
                                            <Eye className="ml-2 h-4 w-4 opacity-70" />
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
                                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-transparent to-orange-600/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                        <div className="absolute right-4 bottom-4 left-4">
                                            <div className="mb-1 text-xs font-medium text-amber-400 opacity-0 transition-opacity delay-100 duration-300 group-hover:opacity-100">
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
                            <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-gradient-to-r from-purple-400/20 to-pink-500/20 px-4 py-2 text-sm font-medium text-purple-400">
                                <Award className="h-4 w-4" />
                                Industry-Leading Features
                            </div>
                            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                                Redefining Hotel
                                <span className="block bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                                    Management Excellence
                                </span>
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

                                            {/* Feature List */}
                                            <div className="mt-4 space-y-2 opacity-0 transition-opacity delay-100 duration-300 group-hover:opacity-100">
                                                {feature.features.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                                                        <CheckCircle className="h-3 w-3 flex-shrink-0 text-green-400" />
                                                        <span>{item}</span>
                                                    </div>
                                                ))}
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
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 via-transparent to-purple-600/20"></div>
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
                <section className="py-32">
                    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-20 space-y-6 text-center">
                            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">What Industry Leaders Say</h2>
                            <p className="mx-auto max-w-2xl text-xl text-gray-300">
                                Discover why top hotels choose our platform for their operations
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                            {testimonials.map((testimonial, index) => (
                                <div
                                    key={index}
                                    className="group relative rounded-3xl border border-gray-700/50 bg-gradient-to-br from-gray-800/50 to-gray-900/80 p-8 backdrop-blur-sm transition-all duration-500 hover:border-gray-600/50"
                                >
                                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-500/5 via-transparent to-purple-600/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

                                    <div className="relative z-10">
                                        <div className="mb-6 flex items-center gap-1">
                                            {[...Array(testimonial.rating)].map((_, i) => (
                                                <Star key={i} className="h-5 w-5 fill-current text-amber-400" />
                                            ))}
                                        </div>

                                        <blockquote className="mb-8 text-xl leading-relaxed text-gray-300">"{testimonial.quote}"</blockquote>

                                        <div className="flex items-center gap-4">
                                            <img src={testimonial.avatar} alt={testimonial.author} className="h-12 w-12 rounded-full object-cover" />
                                            <div>
                                                <div className="font-semibold text-white">{testimonial.author}</div>
                                                <div className="text-sm text-gray-400">{testimonial.role}</div>
                                                <div className="text-sm text-amber-400">{testimonial.hotel}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="relative overflow-hidden py-32">
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-600 to-red-600"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    </div>

                    <div className="relative z-10 container mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                        <div className="space-y-8">
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                                    <Crown className="h-4 w-4" />
                                    Exclusive Premium Access
                                </div>

                                <h2 className="text-4xl leading-tight font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                                    Ready to Transform Your
                                    <span className="block">Hotel Experience?</span>
                                </h2>

                                <p className="mx-auto max-w-3xl text-xl leading-relaxed text-white/90">
                                    Join the elite circle of hotels that have revolutionized their operations and achieved unprecedented success with
                                    our premium platform.
                                </p>
                            </div>

                            <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
                                <button className="group relative overflow-hidden rounded-2xl bg-white px-10 py-5 text-lg font-bold text-gray-900 transition-all duration-300 hover:bg-gray-100 hover:shadow-2xl hover:shadow-white/25">
                                    <div className="absolute inset-0 bg-gradient-to-r from-amber-100 to-orange-100 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                    <div className="relative flex items-center justify-center">
                                        <Crown className="mr-3 h-6 w-6" />
                                        Start Premium Trial
                                        <ArrowRight className="ml-3 h-6 w-6 transition-transform duration-300 group-hover:translate-x-1" />
                                    </div>
                                </button>

                                <button className="group rounded-2xl border-2 border-white/30 bg-white/10 px-10 py-5 text-lg font-bold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/50 hover:bg-white/20">
                                    <div className="flex items-center justify-center">
                                        <PlayCircle className="mr-3 h-6 w-6" />
                                        Schedule Demo
                                        <Sparkles className="ml-3 h-5 w-5 opacity-70" />
                                    </div>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-8 pt-12 sm:grid-cols-3">
                                <div className="flex items-center justify-center gap-3 text-white/90">
                                    <CheckCircle className="h-6 w-6 flex-shrink-0 text-green-400" />
                                    <span className="font-medium">30-Day Premium Trial</span>
                                </div>
                                <div className="flex items-center justify-center gap-3 text-white/90">
                                    <CheckCircle className="h-6 w-6 flex-shrink-0 text-green-400" />
                                    <span className="font-medium">White-Glove Onboarding</span>
                                </div>
                                <div className="flex items-center justify-center gap-3 text-white/90">
                                    <CheckCircle className="h-6 w-6 flex-shrink-0 text-green-400" />
                                    <span className="font-medium">Dedicated Success Manager</span>
                                </div>
                            </div>

                            <div className="border-t border-white/20 pt-8">
                                <p className="text-sm text-white/70">
                                    Trusted by 5,000+ premium hotels worldwide • 99.9% uptime guarantee • Enterprise-grade security
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Floating Elements */}
                    <div className="absolute top-20 left-10 h-20 w-20 rounded-full bg-white/10 blur-xl"></div>
                    <div className="absolute top-40 right-20 h-32 w-32 rounded-full bg-yellow-400/20 blur-2xl"></div>
                    <div className="absolute bottom-20 left-1/4 h-24 w-24 rounded-full bg-orange-400/15 blur-xl"></div>
                </section>

                {/* Footer */}
                <footer className="border-t border-gray-800 py-20">
                    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
                            <div className="space-y-6 md:col-span-2">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-orange-600">
                                        <Crown className="h-6 w-6 text-white" />
                                    </div>
                                    <span className="text-2xl font-bold text-white">HotelElite</span>
                                </div>
                                <p className="max-w-md text-lg leading-relaxed text-gray-400">
                                    Empowering the world's finest hotels with cutting-edge technology and unparalleled service excellence.
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-amber-400">
                                        <MapPin className="h-4 w-4" />
                                        <span className="text-sm">San Francisco, CA</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-green-400">
                                        <div className="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
                                        <span className="text-sm">Available 24/7</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-white">Solutions</h3>
                                <ul className="space-y-3 text-gray-400">
                                    <li>
                                        <a href="#" className="transition-colors duration-300 hover:text-amber-400">
                                            Revenue Management
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="transition-colors duration-300 hover:text-amber-400">
                                            Guest Experience
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="transition-colors duration-300 hover:text-amber-400">
                                            Operations
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="transition-colors duration-300 hover:text-amber-400">
                                            Analytics
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-white">Support</h3>
                                <ul className="space-y-3 text-gray-400">
                                    <li>
                                        <a href="#" className="transition-colors duration-300 hover:text-amber-400">
                                            Documentation
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="transition-colors duration-300 hover:text-amber-400">
                                            Training
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="transition-colors duration-300 hover:text-amber-400">
                                            Community
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="transition-colors duration-300 hover:text-amber-400">
                                            Contact
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-gray-800 pt-8 md:flex-row">
                            <p className="text-sm text-gray-500">© 2024 HotelElite. All rights reserved. Elevating hospitality worldwide.</p>
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                                <a href="#" className="transition-colors duration-300 hover:text-amber-400">
                                    Privacy Policy
                                </a>
                                <a href="#" className="transition-colors duration-300 hover:text-amber-400">
                                    Terms of Service
                                </a>
                                <a href="#" className="transition-colors duration-300 hover:text-amber-400">
                                    Security
                                </a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </Layout>
    );
}
