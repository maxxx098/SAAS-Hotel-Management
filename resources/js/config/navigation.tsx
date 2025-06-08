
import { 
    Home, 
    User, 
    Settings, 
    Users, 
    Shield,
    BarChart3,
    FileText,
    Database,
    Lock
} from 'lucide-react';

export interface NavItem {
    title: string;
    href: string;
    icon?: React.ComponentType<any>;
    badge?: string;
    children?: NavItem[];
}

export const getNavigationItems = (isAdmin: boolean): NavItem[] => {
    const userItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: Home,
        },
        {
            title: 'Profile',
            href: '/profile',
            icon: User,
        },
    ];

    if (isAdmin) {
        userItems.push(
            {
                title: 'Admin',
                href: '/admin',
                icon: Shield,
                children: [
                    {
                        title: 'Dashboard',
                        href: '/admin/dashboard',
                        icon: BarChart3,
                    },
                    {
                        title: 'Bookings',
                        href: '/admin/bookings',
                        icon: Users,
                    },
                    {
                        title: 'Reports',
                        href: '/admin/reports',
                        icon: FileText,
                    },
                    {
                        title: 'Settings',
                        href: '/admin/settings',
                        icon: Settings,
                    },
                ]
            }
        );
    }

    return userItems;
};