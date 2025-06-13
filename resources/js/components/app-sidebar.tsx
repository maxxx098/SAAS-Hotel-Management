import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem as BaseNavItem } from '@/types';

type NavItem = BaseNavItem & {
    items?: BaseNavItem[];
};
import { Link, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { 
    BookOpen, 
    Folder, 
    LayoutGrid, 
    Users, 
    Settings, 
    BarChart3, 
    FileText, 
    Shield,
    User as UserIcon, 
    Building
} from 'lucide-react';
import AppLogo from './app-logo';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    is_admin?: boolean;
}

interface PageProps {
    auth: {
        user: User | null;
    };
    [key: string]: unknown;
}

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

// Function to get navigation items based on user role
const getMainNavItems = (isAdmin: boolean, isStaff: boolean): NavItem[] => {
    const baseItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
            icon: LayoutGrid,
        },
    ];
    if (isStaff) {
        baseItems.push(
      
        );
    } else {
        baseItems.push(

        );
    }
    if (isAdmin) {
        const adminItems: NavItem[] = [
            {
                title: 'Bookings',
                href: route('admin.bookings'),
                icon: FileText,
            },
            {
                title: 'Rooms',
                href: route('admin.rooms.index'),
                icon: Building,
            },
        ];
        
        return [...baseItems, ...adminItems];
    } else if (!isStaff) {
        // Only show "My Bookings" for regular users/clients, not staff or admins
        const userItems: NavItem[] = [
            {
                title: 'Bookings',
                href: route('bookings'),
                icon: FileText,
            },
        ];
        
        return [...baseItems, ...userItems];
    } else {
        // Staff (but not admin) - no extra items
        return baseItems;
    }
};

export function AppSidebar() {
    const { props } = usePage<PageProps>();
    const user = props.auth.user;
    const isAdmin = user?.is_admin || user?.role === 'admin';
    const isStaff = user?.role === 'staff' || isAdmin;
    
    // Get navigation items based on user role
    const mainNavItems = getMainNavItems(isAdmin, isStaff);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={route('dashboard')} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
                
                {/* Show appropriate access badge */}
                {user && (
                    <div className="px-3 py-2 mt-4">
                        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                            <Shield className="h-3 w-3" />
                            <span className="text-xs font-medium">
                                {isAdmin ? 'Admin Access' : isStaff ? 'Staff Access' : 'User Access'}
                            </span>
                        </div>
                    </div>
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}