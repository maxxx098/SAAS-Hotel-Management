import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Layout from '@/components/layout';
import { 
    Users, 
    Bed, 
    DollarSign, 
    Calendar,
    TrendingUp,
    Shield,
    Clock,
    CheckCircle,
    UserCheck,
    BarChart3,
    Bell,
    Smartphone,
    ArrowRight,
    Star,
    Building,
    Globe,
    Zap,
    PlayCircle,
    Trophy,
    HeadphonesIcon
} from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    const features = [
        {
            icon: <Calendar className="h-8 w-8" />,
            title: 'Reservation Management',
            description: 'Handle bookings, cancellations, and modifications with ease. Real-time availability and automated confirmations.',
            badge: 'Online & offline bookings',
            color: 'from-red-500 to-red-600',
            bgColor: 'from-red-950/20 to-red-900/30',
            image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop&crop=center'
        },
        {
            icon: <BarChart3 className="h-8 w-8" />,
            title: 'Analytics & Reporting',
            description: 'Track occupancy rates, revenue, and guest satisfaction. Make data-driven decisions with comprehensive insights.',
            badge: 'Real-time dashboards',
            color: 'from-red-600 to-pink-600',
            bgColor: 'from-red-950/20 to-pink-950/20',
            image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop&crop=center'
        },
        {
            icon: <Users className="h-8 w-8" />,
            title: 'Guest Management',
            description: 'Maintain detailed guest profiles, preferences, and history. Personalize experiences and build loyalty.',
            badge: 'Personalized service',
            color: 'from-red-500 to-orange-500',
            bgColor: 'from-red-950/20 to-orange-950/20',
            image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop&crop=center'
        },
        {
            icon: <Bed className="h-8 w-8" />,
            title: 'Room Management',
            description: 'Monitor room status, schedule housekeeping, and manage maintenance requests efficiently.',
            badge: 'Automated workflows',
            color: 'from-red-600 to-red-500',
            bgColor: 'from-red-950/20 to-red-900/30',
            image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&h=250&fit=crop&crop=center'
        },
        {
            icon: <DollarSign className="h-8 w-8" />,
            title: 'Revenue Management',
            description: 'Optimize pricing strategies, track financial performance, and manage billing seamlessly.',
            badge: 'Dynamic pricing',
            color: 'from-red-500 to-red-700',
            bgColor: 'from-red-950/20 to-red-800/30',
            image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop&crop=center'
        },
        {
            icon: <Smartphone className="h-8 w-8" />,
            title: 'Mobile Access',
            description: 'Access your hotel management system anywhere, anytime. Full functionality on mobile devices.',
            badge: 'Always connected',
            color: 'from-red-600 to-pink-600',
            bgColor: 'from-red-950/20 to-pink-950/20',
            image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=400&h=250&fit=crop&crop=center'
        }
    ];

    const stats = [
        { value: '2,500+', label: 'Hotels Managed', icon: <Building className="h-5 w-5" /> },
        { value: '1M+', label: 'Reservations Processed', icon: <Calendar className="h-5 w-5" /> },
        { value: '98%', label: 'Customer Satisfaction', icon: <Trophy className="h-5 w-5" /> },
        { value: '24/7', label: 'Support Available', icon: <HeadphonesIcon className="h-5 w-5" /> }
    ];

    return (
        <Layout title="Welcome">
            <div className="min-h-screen">
                {/* Hero Section - 2 Grid Layout */}
                <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-12 sm:py-20">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div className="space-y-8">
                            <div className="space-y-6">
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                                    Streamline Your{' '}
                                    <span className="bg-gradient-to-r from-red-500 via-red-400 to-orange-400 bg-clip-text text-transparent">
                                        Hotel Operations
                                    </span>
                                </h1>
                                <p className="text-lg text-gray-300 leading-relaxed max-w-xl">
                                    Manage reservations, track revenue, monitor staff, and deliver exceptional guest experiences with our comprehensive hotel management platform.
                                </p>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-4">
                                {!auth.user && (
                                    <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg" asChild>
                                        <Link href={route('register')}>
                                            Start Free Trial
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Link>
                                    </Button>
                                )}
                                <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-950 px-8 py-3 text-lg">
                                    <PlayCircle className="mr-2 h-5 w-5" />
                                    View Demo
                                </Button>
                            </div>

                            {/* Key Features Preview */}
                            <div className="grid grid-cols-3 gap-6 pt-8">
                                <div className="text-center">
                                    <div className="bg-red-600/10 rounded-full p-3 w-fit mx-auto mb-2">
                                        <Calendar className="h-6 w-6 text-red-400" />
                                    </div>
                                    <p className="text-sm text-gray-300">Smart Booking</p>
                                </div>
                                <div className="text-center">
                                    <div className="bg-red-600/10 rounded-full p-3 w-fit mx-auto mb-2">
                                        <BarChart3 className="h-6 w-6 text-red-400" />
                                    </div>
                                    <p className="text-sm text-gray-300">Real-time Analytics</p>
                                </div>
                                <div className="text-center">
                                    <div className="bg-red-600/10 rounded-full p-3 w-fit mx-auto mb-2">
                                        <Users className="h-6 w-6 text-red-400" />
                                    </div>
                                    <p className="text-sm text-gray-300">Guest Management</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Images Grid */}
                        <div className="grid grid-cols-2 gap-4 h-full">
                            <div className="space-y-4">
                                <div className="relative overflow-hidden rounded-xl">
                                    <img 
                                        src="https://images.unsplash.com/photo-1455587734955-081b22074882?w=300&h=200&fit=crop&crop=center" 
                                        alt="Hotel Lobby" 
                                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-red-900/50 to-transparent"></div>
                                    <div className="absolute bottom-3 left-3">
                                        <Badge className="bg-red-600 text-white">Luxury Lobby</Badge>
                                    </div>
                                </div>
                                <div className="relative overflow-hidden rounded-xl">
                                    <img 
                                        src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=250&fit=crop&crop=center" 
                                        alt="Hotel Room" 
                                        className="w-full h-56 object-cover hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-red-900/50 to-transparent"></div>
                                    <div className="absolute bottom-3 left-3">
                                        <Badge className="bg-red-600 text-white">Premium Rooms</Badge>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4 mt-8">
                                <div className="relative overflow-hidden rounded-xl">
                                    <img 
                                        src="https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=300&h=250&fit=crop&crop=center" 
                                        alt="Hotel Restaurant" 
                                        className="w-full h-56 object-cover hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-red-900/50 to-transparent"></div>
                                    <div className="absolute bottom-3 left-3">
                                        <Badge className="bg-red-600 text-white">Fine Dining</Badge>
                                    </div>
                                </div>
                                <div className="relative overflow-hidden rounded-xl">
                                    <img 
                                        src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=300&h=200&fit=crop&crop=center" 
                                        alt="Hotel Pool" 
                                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-red-900/50 to-transparent"></div>
                                    <div className="absolute bottom-3 left-3">
                                        <Badge className="bg-red-600 text-white">Pool & Spa</Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-24 sm:py-32">
                    <div className="text-center space-y-4 mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                            Everything you need to manage your hotel
                        </h2>
                        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                            From front desk operations to financial reporting, we've got you covered with powerful tools and insights.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <Card key={index} className="group relative overflow-hidden bg-gray-800 border-gray-700 hover:shadow-xl hover:shadow-red-500/25 transition-all duration-300 hover:scale-[1.02]">
                                {/* Background Image */}
                                <div className="absolute inset-0 opacity-10">
                                    <img 
                                        src={feature.image} 
                                        alt={feature.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor}`}></div>
                                
                                <CardHeader className="relative z-10">
                                    <div className={`flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r ${feature.color} text-white mb-4 shadow-lg`}>
                                        {feature.icon}
                                    </div>
                                    <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                                    <CardDescription className="text-base text-gray-300">
                                        {feature.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="relative z-10">
                                    <Badge variant="secondary" className="bg-red-600/20 text-red-300 border-red-500/30">
                                        <CheckCircle className="mr-1 h-3 w-3" />
                                        {feature.badge}
                                    </Badge>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-24 sm:py-32">
                    <Card className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl bg-gradient-to-r from-red-600 to-red-800 border-0 text-white relative overflow-hidden">
                        {/* Background Image */}
                        <div className="absolute inset-0 opacity-20">
                            <img 
                                src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&h=600&fit=crop&crop=center" 
                                alt="Hotel Management"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <CardContent className="py-16 relative z-10">
                            <div className="text-center space-y-4 mb-16">
                                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                                    Trusted by hotels worldwide
                                </h2>
                                <p className="text-lg text-red-100 max-w-2xl mx-auto">
                                    Join thousands of hotels that have transformed their operations with our platform.
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {stats.map((stat, index) => (
                                    <div key={index} className="text-center space-y-2 bg-white/10 backdrop-blur-sm rounded-lg p-6">
                                        <div className="flex items-center justify-center text-red-200 mb-2">
                                            {stat.icon}
                                        </div>
                                        <div className="text-4xl font-bold text-white">{stat.value}</div>
                                        <div className="text-red-100">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Gallery Section */}
                <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-24">
                    <div className="text-center space-y-4 mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                            Experience Excellence
                        </h2>
                        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                            See how our platform transforms hotel operations across different property types
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { src: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=300&h=300&fit=crop", label: "Reception" },
                            { src: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=300&h=300&fit=crop", label: "Conference" },
                            { src: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=300&h=300&fit=crop", label: "Suite" },
                            { src: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=300&h=300&fit=crop", label: "Service" }
                        ].map((image, index) => (
                            <div key={index} className="relative overflow-hidden rounded-lg group">
                                <img 
                                    src={image.src} 
                                    alt={image.label}
                                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-red-900/70 to-transparent group-hover:from-red-800/80"></div>
                                <div className="absolute bottom-4 left-4">
                                    <p className="text-white font-medium">{image.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-24 sm:py-32">
                    <Card className="text-center p-8 sm:p-12 bg-gray-800 border-gray-700 relative overflow-hidden">
                        {/* Background Image */}
                        <div className="absolute inset-0 opacity-10">
                            <img 
                                src="https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1200&h=400&fit=crop&crop=center" 
                                alt="Hotel Management"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <CardContent className="space-y-6 relative z-10">
                            <div className="space-y-4">
                                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                                    Ready to transform your hotel?
                                </h2>
                                <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                                    Start your free trial today and see how our platform can streamline your operations and boost your revenue.
                                </p>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                {!auth.user && (
                                    <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3" asChild>
                                        <Link href={route('register')}>
                                            Get Started Free
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                )}
                                <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-950 px-8 py-3">
                                    <Globe className="mr-2 h-4 w-4" />
                                    Learn More
                                </Button>
                            </div>
                            
                            <Separator className="my-8 bg-gray-700" />
                            
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-red-500" />
                                    <span>30-day free trial</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-red-500" />
                                    <span>No credit card required</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-red-500" />
                                    <span>24/7 support included</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </Layout>
    );
}