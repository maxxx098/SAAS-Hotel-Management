import { Link } from '@inertiajs/react';
import { Separator } from '@/components/ui/separator';
import { Building } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="border-t border-border bg-muted/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-12">
                <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600">
                            <Building className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-bold">HotelManager</span>
                    </Link>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <span>© 2024 HotelManager. All rights reserved.</span>
                        <Separator orientation="vertical" className="h-4" />
                        <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
                        <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}