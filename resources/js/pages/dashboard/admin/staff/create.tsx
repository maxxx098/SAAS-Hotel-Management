import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
    UserPlus, 
    ArrowLeft, 
    User, 
    Mail, 
    Phone, 
    Key, 
    Building, 
    Badge as BadgeIcon,
    Eye,
    EyeOff
} from 'lucide-react';
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
    {
        title: 'Create Staff Member',
        href: '/admin/staff/create',
    },
];

interface PageProps {
    availableRoles: string[];
    roleLabels: Record<string, string>;
    errors?: Record<string, string>;
    [key: string]: unknown;
}

interface FormData {
    name: string;
    email: string;
    username: string;
    password: string;
    password_confirmation: string;
    role: string;
    department: string;
    employee_id: string;
    phone: string;
    [key: string]: string;
}

export default function StaffCreate() {
    const { props } = usePage<PageProps>();
    const { availableRoles, roleLabels, errors } = props;
    
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    const { data, setData, post, processing, reset } = useForm<FormData>({
        name: '',
        email: '',
        username: '',
        password: '',
        password_confirmation: '',
        role: '',
        department: '',
        employee_id: '',
        phone: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/staff', {
            onSuccess: () => {
                reset();
            },
        });
    };

    const handleRoleChange = (value: string) => {
        setData('role', value);
        
        // Auto-set department based on role
        const departmentMap: Record<string, string> = {
            'front_desk': 'Front Desk',
            'housekeeping': 'Housekeeping',
            'maintenance': 'Maintenance',
            'security': 'Security',
            'staff': 'General',
        };
        
        if (departmentMap[value]) {
            setData('department', departmentMap[value]);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Staff Member" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Create Staff Member</h1>
                        <p className="text-muted-foreground">Add a new staff member to your hotel team</p>
                    </div>
                    <Link href="/admin/staff">
                        <Button variant="outline" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Staff List
                        </Button>
                    </Link>
                </div>

                {/* Form */}
                <div className="max-w-8xl">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5" />
                                Staff Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                
                                {/* Personal Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Personal Information
                                    </h3>
                                    
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name *</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="Enter full name"
                                                className={errors?.name ? 'border-red-500' : ''}
                                            />
                                            {errors?.name && (
                                                <p className="text-sm text-red-500">{errors.name}</p>
                                            )}
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    value={data.phone}
                                                    onChange={(e) => setData('phone', e.target.value)}
                                                    placeholder="Enter phone number"
                                                    className={`pl-9 ${errors?.phone ? 'border-red-500' : ''}`}
                                                />
                                            </div>
                                            {errors?.phone && (
                                                <p className="text-sm text-red-500">{errors.phone}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Account Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Key className="h-4 w-4" />
                                        Account Information
                                    </h3>
                                    
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address *</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    placeholder="Enter email address"
                                                    className={`pl-9 ${errors?.email ? 'border-red-500' : ''}`}
                                                />
                                            </div>
                                            {errors?.email && (
                                                <p className="text-sm text-red-500">{errors.email}</p>
                                            )}
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <Label htmlFor="username">Username *</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="username"
                                                    type="text"
                                                    value={data.username}
                                                    onChange={(e) => setData('username', e.target.value)}
                                                    placeholder="Enter username"
                                                    className={`pl-9 ${errors?.username ? 'border-red-500' : ''}`}
                                                />
                                            </div>
                                            {errors?.username && (
                                                <p className="text-sm text-red-500">{errors.username}</p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="password">Password *</Label>
                                            <div className="relative">
                                                <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    placeholder="Enter password"
                                                    className={`pl-9 pr-9 ${errors?.password ? 'border-red-500' : ''}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            {errors?.password && (
                                                <p className="text-sm text-red-500">{errors.password}</p>
                                            )}
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <Label htmlFor="password_confirmation">Confirm Password *</Label>
                                            <div className="relative">
                                                <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="password_confirmation"
                                                    type={showPasswordConfirmation ? 'text' : 'password'}
                                                    value={data.password_confirmation}
                                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                                    placeholder="Confirm password"
                                                    className={`pl-9 pr-9 ${errors?.password_confirmation ? 'border-red-500' : ''}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showPasswordConfirmation ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            {errors?.password_confirmation && (
                                                <p className="text-sm text-red-500">{errors.password_confirmation}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Work Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Building className="h-4 w-4" />
                                        Work Information
                                    </h3>
                                    
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="role">Role *</Label>
                                            <Select value={data.role} onValueChange={handleRoleChange}>
                                                <SelectTrigger className={errors?.role ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableRoles.map((role) => (
                                                        <SelectItem key={role} value={role}>
                                                            {roleLabels[role]}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors?.role && (
                                                <p className="text-sm text-red-500">{errors.role}</p>
                                            )}
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <Label htmlFor="department">Department</Label>
                                            <Input
                                                id="department"
                                                type="text"
                                                value={data.department}
                                                onChange={(e) => setData('department', e.target.value)}
                                                placeholder="Department (auto-filled based on role)"
                                                className={errors?.department ? 'border-red-500' : ''}
                                            />
                                            {errors?.department && (
                                                <p className="text-sm text-red-500">{errors.department}</p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="employee_id">Employee ID</Label>
                                        <div className="relative">
                                            <BadgeIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="employee_id"
                                                type="text"
                                                value={data.employee_id}
                                                onChange={(e) => setData('employee_id', e.target.value)}
                                                placeholder="Leave blank to auto-generate"
                                                className={`pl-9 ${errors?.employee_id ? 'border-red-500' : ''}`}
                                            />
                                        </div>
                                        {errors?.employee_id && (
                                            <p className="text-sm text-red-500">{errors.employee_id}</p>
                                        )}
                                        <p className="text-sm text-muted-foreground">
                                            If left blank, an employee ID will be automatically generated
                                        </p>
                                    </div>
                                </div>

                                {/* General Error */}
                                {errors?.error && (
                                    <Alert className="border-red-200 bg-red-50">
                                        <AlertDescription className="text-red-800">
                                            {errors.error}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {/* Submit Buttons */}
                                <div className="flex items-center justify-end gap-4 pt-4 border-t">
                                    <Link href="/admin/staff">
                                        <Button variant="outline" type="button">
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Creating...' : 'Create Staff Member'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Info Card */}
                <div className="max-w-8xl">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Important Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            <p>• Staff members can log in using either their username or employee ID with their password</p>
                            <p>• A strong password with at least 8 characters is required</p>
                            <p>• Employee ID will be auto-generated if not provided</p>
                            <p>• Department is automatically set based on role but can be customized</p>
                            <p>• All fields marked with * are required</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}