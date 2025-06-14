import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    Users, 
    ArrowLeft,
    Edit,
    Trash2,
    User,
    Mail,
    Phone,
    Badge as BadgeIcon,
    Building,
    Calendar,
    UserCheck,
    Shield,
    Clock
} from 'lucide-react';

interface Staff {
    id: number;
    name: string;
    email: string;
    username: string;
    role: string;
    department: string;
    employee_id: string;
    phone: string;
    created_at: string;
}

interface PageProps {
    staff: Staff;
    roleLabel: string;
    [key: string]: unknown;
}

export default function StaffShow() {
    const { props } = usePage<PageProps>();
    const { staff, roleLabel } = props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/admin/dashboard',
        },
        {
            title: 'Staff Management',
            href: '/admin/staff',
        },
        {
            title: staff.name,
            href: `/admin/staff/${staff.id}`,
        },
    ];

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete ${staff.name}? This action cannot be undone.`)) {
            router.delete(`/admin/staff/${staff.id}`, {
                onSuccess: () => {
                    router.visit('/admin/staff');
                },
                onError: () => {
                    alert('Failed to delete staff member. Please try again.');
                }
            });
        }
    };

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'front_desk':
                return 'default';
            case 'housekeeping':
                return 'secondary';
            case 'maintenance':
                return 'outline';
            case 'security':
                return 'destructive';
            case 'staff':
                return 'default';
            default:
                return 'default';
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'front_desk':
                return <Users className="h-4 w-4" />;
            case 'housekeeping':
                return <Building className="h-4 w-4" />;
            case 'maintenance':
                return <UserCheck className="h-4 w-4" />;
            case 'security':
                return <Shield className="h-4 w-4" />;
            case 'staff':
                return <User className="h-4 w-4" />;
            default:
                return <User className="h-4 w-4" />;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={staff.name} />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/staff">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Staff
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Staff Details</h1>
                            <p className="text-muted-foreground">View {staff.name}'s information</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`/admin/staff/${staff.id}/edit`}>
                            <Button variant="outline">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        </Link>
                        <Button 
                            variant="outline" 
                            onClick={handleDelete}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Profile Overview */}
                    <Card className="md:col-span-1">
                        <CardHeader className="text-center pb-4">
                            <div className="mx-auto h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <span className="text-2xl font-semibold text-primary">
                                    {getInitials(staff.name)}
                                </span>
                            </div>
                            <CardTitle className="text-xl">{staff.name}</CardTitle>
                            <div className="flex justify-center">
                                <Badge variant={getRoleBadgeVariant(staff.role)} className="flex items-center gap-1">
                                    {getRoleIcon(staff.role)}
                                    {roleLabel}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3 text-sm">
                                <Building className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Department:</span>
                                <span>{staff.department}</span>
                            </div>
                            {staff.employee_id && (
                                <div className="flex items-center gap-3 text-sm">
                                    <BadgeIcon className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Employee ID:</span>
                                    <span className="font-mono">{staff.employee_id}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Joined:</span>
                                <span>{new Date(staff.created_at).toLocaleDateString()}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Detailed Information */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Contact Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="h-5 w-5" />
                                    Contact Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span>{staff.email}</span>
                                        </div>
                                    </div>
                                    {staff.phone && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <span>{staff.phone}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Account Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserCheck className="h-5 w-5" />
                                    Account Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Username</label>
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-mono">{staff.username}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Role</label>
                                        <div className="flex items-center gap-2">
                                            {getRoleIcon(staff.role)}
                                            <span>{roleLabel}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* System Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    System Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Account Created</label>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span>{formatDate(staff.created_at)}</span>
                                    </div>
                                </div>
                                <Separator />
                                <div className="text-sm text-muted-foreground">
                                    <p>This staff member can log in using either their username (<strong>{staff.username}</strong>) or employee ID (<strong>{staff.employee_id}</strong>) with their password.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            <Link href={`/admin/staff/${staff.id}/edit`}>
                                <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Profile
                                </Button>
                            </Link>
                            <Button variant="outline" size="sm" onClick={() => window.location.href = `mailto:${staff.email}`}>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Email
                            </Button>
                            {staff.phone && (
                                <Button variant="outline" size="sm" onClick={() => window.location.href = `tel:${staff.phone}`}>
                                    <Phone className="h-4 w-4 mr-2" />
                                    Call
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}