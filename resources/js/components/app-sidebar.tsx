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
    Building,
    Calendar,
    Wrench,
    ClipboardList
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
const getMainNavItems = (isAdmin: boolean, isStaff: boolean, userRole: string): NavItem[] => {
    const baseItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
            icon: LayoutGrid,
        },
    ];

    // Define staff roles
    const staffRoles = ['staff', 'front_desk', 'housekeeping', 'maintenance', 'security'];
    
    if (isAdmin) {
        // Admin gets all admin navigation items
        const adminItems: NavItem[] = [
            {
                title: 'Bookings Management',
                href: route('admin.bookings'),
                icon: FileText,
            },
            {
                title: 'Rooms Management',
                href: route('admin.rooms.index'),
                icon: Building,
            },
            {
                title: 'Staff Management',
                href: route('admin.staff.index'),
                icon: Users,
            },
        ];
        
        return [...baseItems, ...adminItems];
    } else if (staffRoles.includes(userRole)) {
        // Staff members get staff-specific navigation items
        const staffItems: NavItem[] = [];
        
        // Add role-specific items based on staff type
        switch (userRole) {
            case 'front_desk':
                staffItems.push(
                    {
                        title: 'Guest Check-ins',
                        href: route('staff.dashboard'), // You might want specific routes for these
                        icon: Calendar,
                    },
                    {
                        title: 'Guest Check-outs',
                        href: route('staff.dashboard'),
                        icon: Calendar,
                    }
                );
                break;
                
            case 'housekeeping':
                staffItems.push(
                    {
                        title: 'Room Assignments',
                        href: route('staff.dashboard'),
                        icon: Building,
                    },
                    {
                        title: 'Cleaning Tasks',
                        href: route('staff.dashboard'),
                        icon: ClipboardList,
                    }
                );
                break;
                
            case 'maintenance':
                staffItems.push(
                    {
                        title: 'Maintenance Requests',
                        href: route('staff.dashboard'),
                        icon: Wrench,
                    }
                );
                break;
                
            case 'security':
                staffItems.push(
                    {
                        title: 'Security Tasks',
                        href: route('staff.dashboard'),
                        icon: Shield,
                    }
                );
                break;
                
            default:
                // General staff items
                staffItems.push(
                    {
                        title: 'My Tasks',
                        href: route('staff.dashboard'),
                        icon: ClipboardList,
                    }
                );
                break;
        }
        
        return [...baseItems, ...staffItems];
    } else {
        // Regular users/clients get client navigation items
        const clientItems: NavItem[] = [
            {
                title: 'My Bookings',
                href: route('bookings'),
                icon: FileText,
            },
        ];
        
        return [...baseItems, ...clientItems];
    }
};

export function AppSidebar() {
    const { props } = usePage<PageProps>();
    const user = props.auth.user;
    
    if (!user) {
        return null; // or some fallback UI
    }
    
    const isAdmin = user?.is_admin || user?.role === 'admin';
    const staffRoles = ['staff', 'front_desk', 'housekeeping', 'maintenance', 'security'];
    const isStaff = staffRoles.includes(user.role) || isAdmin;
    
    // Get navigation items based on user role
    const mainNavItems = getMainNavItems(isAdmin, isStaff, user.role);

    // Determine access level for display
    let accessLevel = 'User Access';
    if (isAdmin) {
        accessLevel = 'Admin Access';
    } else if (staffRoles.includes(user.role)) {
        accessLevel = 'Staff Access';
    }

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
                <div className="px-3 py-2 mt-4">
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                        <Shield className="h-3 w-3" />
                        <span className="text-xs font-medium">
                            {accessLevel}
                        </span>
                    </div>
                    {/* Debug info - remove in production */}
                    <div className="mt-2 text-xs text-gray-500">
                        Role: {user.role} | Is Admin: {isAdmin ? 'Yes' : 'No'} | Is Staff: {isStaff ? 'Yes' : 'No'}
                    </div>
                </div>
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}