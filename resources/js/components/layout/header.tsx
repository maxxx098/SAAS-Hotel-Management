import { Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Building, ArrowRight } from 'lucide-react';
import { type SharedData } from '@/types';
import { useEffect, useState } from 'react';

export default function Header() {
    const { auth } = usePage<SharedData>().props;
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className="absolute top-0 z-50 w-full pt-4 transition-all duration-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                {/* Grid layout: 3 columns */}
                <div className="grid grid-cols-3 h-16 items-center">
                    
                    {/* Logo - left */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md">
                            <Building className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">
                            Villa's Hotel
                        </span>
                    </Link>
                    
                    {/* Center navigation */}
                    <nav className="flex justify-center items-center gap-6 text-sm font-medium">
                        <Link href={route('rooms.index')} className="hover:text-primary transition-colors">
                            Rooms
                        </Link>
                        <Link href={route('rooms.index')} className="hover:text-primary transition-colors">
                            Services
                        </Link>
                        <Link href={route('rooms.index')} className="hover:text-primary transition-colors">
                            About
                        </Link>
                        <Link href={route('rooms.index')} className="hover:text-primary transition-colors">
                            Testimonials
                        </Link>
                    </nav>
                    
                    {/* Right actions */}
                    <div className="flex justify-end items-center gap-3">
                        {auth.user ? (
                            <Button asChild className="shadow-sm">
                                <Link href={route('dashboard')}>
                                    Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        ) : (
                            <>
                                <Button variant="ghost" asChild>
                                    <Link href={route('login')}>
                                        Log in
                                    </Link>
                                </Button>
                                <Button asChild className="shadow-sm">
                                    <Link href={route('register')}>
                                        Get Started <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}