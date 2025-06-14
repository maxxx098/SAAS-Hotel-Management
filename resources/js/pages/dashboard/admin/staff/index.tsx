import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { 
    Users, 
    Plus, 
    Search, 
    Filter,
    Eye,
    Edit,
    Trash2,
    Phone,
    Mail,
    Badge as BadgeIcon,
    Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Staff Management',
        href: '/admin/staff',
    },
];

interface Staff {
    id: number;
    name: string;
    email: string;
    role: string;
    department: string;
    employee_id: string;
    phone: string;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface StaffData {
    data: Staff[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface PageProps {
    staff: StaffData;
    filters: {
        role?: string;
        department?: string;
        search?: string;
    };
    availableRoles: string[];
    roleLabels: Record<string, string>;
    [key: string]: unknown; 
}

export default function StaffIndex() {
    const { props } = usePage<PageProps>();
    const { staff, filters, availableRoles, roleLabels } = props;
    
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || 'all');
    const [selectedDepartment, setSelectedDepartment] = useState(filters.department || 'all');

        const handleSearch = () => {
            router.get('/admin/staff', {
                search: searchTerm,
                role: selectedRole === 'all' ? '' : selectedRole,
                department: selectedDepartment === 'all' ? '' : selectedDepartment,
            }, { preserveState: true });
        };

        const handleClearFilters = () => {
            setSearchTerm('');
            setSelectedRole('all');
            setSelectedDepartment('all');
            router.get('/admin/staff', {}, { preserveState: true });
        };

    const handleDelete = (staffId: number, staffName: string) => {
        if (confirm(`Are you sure you want to delete ${staffName}? This action cannot be undone.`)) {
            router.delete(`/admin/staff/${staffId}`, {
                onSuccess: () => {
                    // Success message handled by backend
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Staff Management" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
                        <p className="text-muted-foreground">Manage hotel staff members and their roles</p>
                    </div>
                    <Link href="/admin/staff/create">
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Add Staff Member
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search staff..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9"
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Role</label>
                                <Select value={selectedRole} onValueChange={setSelectedRole}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All roles" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All roles</SelectItem>
                                    {availableRoles.map((role) => (
                                        <SelectItem key={role} value={role}>
                                            {roleLabels[role]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Department</label>
                                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All departments" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All departments</SelectItem>
                                    <SelectItem value="Front Desk">Front Desk</SelectItem>
                                    <SelectItem value="Housekeeping">Housekeeping</SelectItem>
                                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                                    <SelectItem value="Security">Security</SelectItem>
                                    <SelectItem value="General">General</SelectItem>
                                </SelectContent>
                            </Select>
                            </div>
                            <div className="flex items-end gap-2">
                                <Button onClick={handleSearch} className="flex-1">
                                    Search
                                </Button>
                                <Button variant="outline" onClick={handleClearFilters}>
                                    Clear
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Staff List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Staff Members ({staff.total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {staff.data.length > 0 ? (
                            <div className="space-y-4">
                                {staff.data.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Users className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold">{member.name}</h3>
                                                    <Badge variant={getRoleBadgeVariant(member.role)}>
                                                        {roleLabels[member.role]}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                                    <div className="flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />
                                                        {member.email}
                                                    </div>
                                                    {member.phone && (
                                                        <div className="flex items-center gap-1">
                                                            <Phone className="h-3 w-3" />
                                                            {member.phone}
                                                        </div>
                                                    )}
                                                    {member.employee_id && (
                                                        <div className="flex items-center gap-1">
                                                            <BadgeIcon className="h-3 w-3" />
                                                            {member.employee_id}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                    <span>{member.department}</span>
                                                    <span>•</span>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        Joined {new Date(member.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Link href={`/admin/staff/${member.id}`}>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Link href={`/admin/staff/${member.id}/edit`}>
                                                <Button variant="outline" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => handleDelete(member.id, member.name)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No staff members found</h3>
                                <p className="text-muted-foreground mb-4">
                                    {filters.search || filters.role || filters.department 
                                        ? "Try adjusting your filters to see more results."
                                        : "Get started by adding your first staff member."
                                    }
                                </p>
                                <Link href="/admin/staff/create">
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Staff Member
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Pagination */}
                        {staff.last_page > 1 && (
                            <div className="mt-6 flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Showing {staff.data.length} of {staff.total} staff members
                                </div>
                                <div className="flex items-center gap-2">
                                    {staff.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}