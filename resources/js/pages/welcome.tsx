import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
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
    Zap
} from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
                {/* Header */}
                <header className="relative z-50 w-full border-b border-white/10 bg-white/80 backdrop-blur-md dark:bg-slate-900/80">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600">
                                    <Building className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-xl font-bold text-slate-900 dark:text-white">HotelManager</span>
                            </div>
                            <nav className="flex items-center gap-4">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl"
                                    >
                                        Dashboard <ArrowRight className="h-4 w-4" />
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl"
                                        >
                                            Get Started <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="relative overflow-hidden py-20 sm:py-32">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20 blur-3xl"></div>
                    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-slate-900 sm:text-7xl dark:text-white">
                                Streamline Your
                                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"> Hotel Operations</span>
                            </h1>
                            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                                Manage reservations, track revenue, monitor staff, and deliver exceptional guest experiences with our comprehensive hotel management platform.
                            </p>
                            <div className="mt-10 flex items-center justify-center gap-6">
                                {!auth.user && (
                                    <Link
                                        href={route('register')}
                                        className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-2xl transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/25"
                                    >
                                        Start Free Trial
                                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                )}
                                <button className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-8 py-4 text-lg font-semibold text-slate-900 transition-all hover:bg-slate-50 hover:shadow-lg dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700">
                                    <Globe className="h-5 w-5" />
                                    View Demo
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="py-24 sm:py-32">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                                Everything you need to manage your hotel
                            </h2>
                            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
                                From front desk operations to financial reporting, we've got you covered.
                            </p>
                        </div>
                        
                        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                            <div className="grid max-w-xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
                                {/* Feature 1 */}
                                <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-2xl hover:shadow-blue-500/10 dark:bg-slate-800">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50 dark:from-blue-900/20 dark:to-indigo-900/20"></div>
                                    <div className="relative">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                            <Calendar className="h-8 w-8" />
                                        </div>
                                        <h3 className="mt-6 text-xl font-semibold text-slate-900 dark:text-white">
                                            Reservation Management
                                        </h3>
                                        <p className="mt-4 text-slate-600 dark:text-slate-300">
                                            Handle bookings, cancellations, and modifications with ease. Real-time availability and automated confirmations.
                                        </p>
                                        <div className="mt-6 flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                                            <CheckCircle className="h-4 w-4" />
                                            Online & offline bookings
                                        </div>
                                    </div>
                                </div>

                                {/* Feature 2 */}
                                <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-2xl hover:shadow-purple-500/10 dark:bg-slate-800">
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-50 dark:from-purple-900/20 dark:to-pink-900/20"></div>
                                    <div className="relative">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                                            <BarChart3 className="h-8 w-8" />
                                        </div>
                                        <h3 className="mt-6 text-xl font-semibold text-slate-900 dark:text-white">
                                            Analytics & Reporting
                                        </h3>
                                        <p className="mt-4 text-slate-600 dark:text-slate-300">
                                            Track occupancy rates, revenue, and guest satisfaction. Make data-driven decisions with comprehensive insights.
                                        </p>
                                        <div className="mt-6 flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400">
                                            <TrendingUp className="h-4 w-4" />
                                            Real-time dashboards
                                        </div>
                                    </div>
                                </div>

                                {/* Feature 3 */}
                                <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-2xl hover:shadow-indigo-500/10 dark:bg-slate-800">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-blue-50 opacity-50 dark:from-indigo-900/20 dark:to-blue-900/20"></div>
                                    <div className="relative">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                                            <Users className="h-8 w-8" />
                                        </div>
                                        <h3 className="mt-6 text-xl font-semibold text-slate-900 dark:text-white">
                                            Guest Management
                                        </h3>
                                        <p className="mt-4 text-slate-600 dark:text-slate-300">
                                            Maintain detailed guest profiles, preferences, and history. Personalize experiences and build loyalty.
                                        </p>
                                        <div className="mt-6 flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                            <Star className="h-4 w-4" />
                                            Personalized service
                                        </div>
                                    </div>
                                </div>

                                {/* Feature 4 */}
                                <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-2xl hover:shadow-green-500/10 dark:bg-slate-800">
                                    <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-50 dark:from-green-900/20 dark:to-emerald-900/20"></div>
                                    <div className="relative">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                                            <Bed className="h-8 w-8" />
                                        </div>
                                        <h3 className="mt-6 text-xl font-semibold text-slate-900 dark:text-white">
                                            Room Management
                                        </h3>
                                        <p className="mt-4 text-slate-600 dark:text-slate-300">
                                            Monitor room status, schedule housekeeping, and manage maintenance requests efficiently.
                                        </p>
                                        <div className="mt-6 flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                                            <CheckCircle className="h-4 w-4" />
                                            Automated workflows
                                        </div>
                                    </div>
                                </div>

                                {/* Feature 5 */}
                                <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-2xl hover:shadow-yellow-500/10 dark:bg-slate-800">
                                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-orange-50 opacity-50 dark:from-yellow-900/20 dark:to-orange-900/20"></div>
                                    <div className="relative">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-yellow-600 to-orange-600 text-white">
                                            <DollarSign className="h-8 w-8" />
                                        </div>
                                        <h3 className="mt-6 text-xl font-semibold text-slate-900 dark:text-white">
                                            Revenue Management
                                        </h3>
                                        <p className="mt-4 text-slate-600 dark:text-slate-300">
                                            Optimize pricing strategies, track financial performance, and manage billing seamlessly.
                                        </p>
                                        <div className="mt-6 flex items-center gap-2 text-sm font-medium text-yellow-600 dark:text-yellow-400">
                                            <TrendingUp className="h-4 w-4" />
                                            Dynamic pricing
                                        </div>
                                    </div>
                                </div>

                                {/* Feature 6 */}
                                <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-2xl hover:shadow-red-500/10 dark:bg-slate-800">
                                    <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-pink-50 opacity-50 dark:from-red-900/20 dark:to-pink-900/20"></div>
                                    <div className="relative">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white">
                                            <Smartphone className="h-8 w-8" />
                                        </div>
                                        <h3 className="mt-6 text-xl font-semibold text-slate-900 dark:text-white">
                                            Mobile Access
                                        </h3>
                                        <p className="mt-4 text-slate-600 dark:text-slate-300">
                                            Access your hotel management system anywhere, anytime. Full functionality on mobile devices.
                                        </p>
                                        <div className="mt-6 flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400">
                                            <Zap className="h-4 w-4" />
                                            Always connected
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-24 sm:py-32">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                Trusted by hotels worldwide
                            </h2>
                            <p className="mt-4 text-lg text-blue-100">
                                Join thousands of hotels that have transformed their operations with our platform.
                            </p>
                        </div>
                        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-8 sm:max-w-none sm:grid-cols-2 lg:grid-cols-4">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-white">2,500+</div>
                                <div className="mt-2 text-blue-100">Hotels Managed</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-white">1M+</div>
                                <div className="mt-2 text-blue-100">Reservations Processed</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-white">98%</div>
                                <div className="mt-2 text-blue-100">Customer Satisfaction</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-white">24/7</div>
                                <div className="mt-2 text-blue-100">Support Available</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 sm:py-32">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                                Ready to transform your hotel?
                            </h2>
                            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
                                Start your free trial today and see how our platform can streamline your operations.
                            </p>
                            <div className="mt-8 flex items-center justify-center gap-6">
                                {!auth.user && (
                                    <Link
                                        href={route('register')}
                                        className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-2xl transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/25"
                                    >
                                        Get Started Free
                                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-slate-900">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600">
                                    <Building className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-lg font-bold text-slate-900 dark:text-white">HotelManager</span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                © 2024 HotelManager. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}