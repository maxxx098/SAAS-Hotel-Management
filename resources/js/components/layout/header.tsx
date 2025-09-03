import Logo from '@/assets/images/Logo.png';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, LayoutDashboard, LogOut } from 'lucide-react';
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
        <header className={`absolute top-0 z-50 w-full pt-4 transition-all duration-300`}>
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Grid layout: 3 columns */}
                <div className="grid h-16 grid-cols-3 items-center">
                    {/* Logo - left */}
                    <Link href="/" className="flex items-center gap-2">
                        <img src={Logo} alt="Villa's Hotel Logo" className="h-20 w-auto rounded-lg object-contain" />
                    </Link>

                    {/* Center navigation */}
                    <nav className="flex items-center justify-center gap-6 text-sm font-medium">
                        <Link href={route('rooms.index')} className="transition-colors hover:text-primary">
                            Rooms
                        </Link>
                        <Link href={route('rooms.index')} className="transition-colors hover:text-primary">
                            Services
                        </Link>
                        <Link href={route('rooms.index')} className="transition-colors hover:text-primary">
                            About
                        </Link>
                        <Link href={route('rooms.index')} className="transition-colors hover:text-primary">
                            Testimonials
                        </Link>
                        <Link href={route('rooms.index')} className="transition-colors hover:text-primary">
                            Blog
                        </Link>
                    </nav>

                    {/* Right actions */}
                    <div className="flex items-center justify-end gap-3">
                        {auth.user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className=" flex h-10 w-10 items-center justify-center">
                                        <svg width={35} viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                                            <g id="SVGRepo_iconCarrier">
                                                {' '}
                                                <path
                                                    d="M12.5 13V22M12.5 13L4.5 8M12.5 13L20.5 8M8.5 5.5L16.5 10.5M4.5 8L12.5 3L20.5 8V17L12.5 22L4.5 17V8Z"
                                                    stroke="#F4C2A1"
                                                    stroke-width="1.975"
                                                ></path>{' '}
                                            </g>
                                        </svg>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-48">
                                    <DropdownMenuLabel>{auth.user.name}</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href={route('dashboard')} className="flex items-center">
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            Dashboard
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href={route('logout')} method="post" as="button" className="flex w-full items-center">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Logout
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                                <Button asChild className="shadow-sm">
                                    <Link href={route('dashboard')}>
                                        Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </DropdownMenu>
                        ) : (
                            <>
                                <Button variant="ghost" asChild>
                                    <Link href={route('login')}>Log in</Link>
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
