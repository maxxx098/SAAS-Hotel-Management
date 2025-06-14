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
            color: 'from-blue-600 to-indigo-600',
            bgColor: 'from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20'
        },
        {
            icon: <BarChart3 className="h-8 w-8" />,
            title: 'Analytics & Reporting',
            description: 'Track occupancy rates, revenue, and guest satisfaction. Make data-driven decisions with comprehensive insights.',
            badge: 'Real-time dashboards',
            color: 'from-purple-600 to-pink-600',
            bgColor: 'from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20'
        },
        {
            icon: <Users className="h-8 w-8" />,
            title: 'Guest Management',
            description: 'Maintain detailed guest profiles, preferences, and history. Personalize experiences and build loyalty.',
            badge: 'Personalized service',
            color: 'from-indigo-600 to-blue-600',
            bgColor: 'from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20'
        },
        {
            icon: <Bed className="h-8 w-8" />,
            title: 'Room Management',
            description: 'Monitor room status, schedule housekeeping, and manage maintenance requests efficiently.',
            badge: 'Automated workflows',
            color: 'from-green-600 to-emerald-600',
            bgColor: 'from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20'
        },
        {
            icon: <DollarSign className="h-8 w-8" />,
            title: 'Revenue Management',
            description: 'Optimize pricing strategies, track financial performance, and manage billing seamlessly.',
            badge: 'Dynamic pricing',
            color: 'from-yellow-600 to-orange-600',
            bgColor: 'from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20'
        },
        {
            icon: <Smartphone className="h-8 w-8" />,
            title: 'Mobile Access',
            description: 'Access your hotel management system anywhere, anytime. Full functionality on mobile devices.',
            badge: 'Always connected',
            color: 'from-red-600 to-pink-600',
            bgColor: 'from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20'
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
            {/* Hero Section */}
            <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-20 sm:py-32">
                <div className="text-center space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                            Streamline Your{' '}
                            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                Hotel Operations
                            </span>
                        </h1>
                        <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-8">
                            Manage reservations, track revenue, monitor staff, and deliver exceptional guest experiences with our comprehensive hotel management platform.
                        </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        {!auth.user && (
                            <Button className="px-6 py-2" asChild>
                                <Link href={route('register')}>
                                    Start Free Trial
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        )}
                        <Button variant="outline" className="px-6 py-2">
                            <PlayCircle className="mr-2 h-4 w-4" />
                            View Demo
                        </Button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-24 sm:py-32">
                <div className="text-center space-y-4 mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                        Everything you need to manage your hotel
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        From front desk operations to financial reporting, we've got you covered with powerful tools and insights.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <Card key={index} className="group relative overflow-hidden border-border hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                            <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor} opacity-50`}></div>
                            <CardHeader className="relative">
                                <div className={`flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r ${feature.color} text-white mb-4`}>
                                    {feature.icon}
                                </div>
                                <CardTitle className="text-xl">{feature.title}</CardTitle>
                                <CardDescription className="text-base">
                                    {feature.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="relative">
                                <Badge variant="secondary" className="bg-background/80">
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
                <Card className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl bg-gradient-to-r from-blue-600 to-indigo-600 border-0 text-white">
                    <CardContent className="py-16">
                        <div className="text-center space-y-4 mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                                Trusted by hotels worldwides
                            </h2>
                            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                                Join thousands of hotels that have transformed their operations with our platform.
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center space-y-2">
                                    <div className="flex items-center justify-center text-blue-200 mb-2">
                                        {stat.icon}
                                    </div>
                                    <div className="text-4xl font-bold text-white">{stat.value}</div>
                                    <div className="text-blue-100">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* CTA Section */}
            <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-24 sm:py-32">
                <Card className="text-center p-8 sm:p-12 border-border">
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                                Ready to transform your hotel?
                            </h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Start your free trial today and see how our platform can streamline your operations and boost your revenue.
                            </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            {!auth.user && (
                                <Button className="px-6 py-2" asChild>
                                    <Link href={route('register')}>
                                        Get Started Free
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            )}
                            <Button variant="outline" className="px-6 py-2">
                                <Globe className="mr-2 h-4 w-4" />
                                Learn More
                            </Button>
                        </div>
                        
                        <Separator className="my-8" />
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>30-day free trial</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>No credit card required</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>24/7 support included</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>
        </Layout>
    );
}