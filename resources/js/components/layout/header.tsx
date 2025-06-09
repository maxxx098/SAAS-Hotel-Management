import { Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Building, ArrowRight } from 'lucide-react';
import { type SharedData } from '@/types';

export default function Header() {
    const { auth } = usePage<SharedData>().props;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="flex h-16 items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600">
                            <Building className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold">HotelManager</span>
                    </Link>
                    <nav className="flex items-center gap-4">
                        <Button variant="ghost" asChild>
                            <Link href={route('rooms.index')}>
                                Our Rooms
                            </Link>
                        </Button>
                        {auth.user ? (
                            <Button asChild>
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
                                <Button asChild>
                                    <Link href={route('register')}>
                                        Get Started <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}