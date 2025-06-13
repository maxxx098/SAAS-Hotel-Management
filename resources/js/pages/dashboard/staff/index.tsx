import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Users,
    Bed,
    DollarSign,
    Calendar,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle,
    AlertCircle,
    UserCheck,
    Utensils,
    Car,
    Wifi,
    Star,
    ClipboardCheck,
    Wrench,
    Shield,
    Home,
    MapPin,
    Timer,
    User,
    Phone,
    Mail,
    RefreshCw,
    Bell,
    Settings
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useState, useEffect } from 'react';
import React from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: string;
    department: string;
    employee_id: string;
    hire_date?: string;
}

interface Task {
    id: number;
    type: string;
    title: string;
    description: string;
    time: string;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'in_progress' | 'completed';
    room_number?: string;
    guest_name?: string;
    location?: string;
    estimated_duration?: number;
    estimated_time?: number;
}

interface Room {
    id: number;
    number: string;
    type: string;
    status: string;
    last_checkout?: string;
    next_checkin?: string;
    priority: 'low' | 'medium' | 'high';
    estimated_time: number;
}

interface MaintenanceRequest {
    id: number;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'in_progress' | 'completed';
    room_number: string;
    location: string;
    reported_by: string;
    created_at: string;
    estimated_time: number;
}

interface Activity {
    id: number;
    type: string;
    title: string;
    description: string;
    timestamp: string;
}

interface Schedule {
    today: {
        shift_start: string;
        shift_end: string;
        break_start?: string;
        break_end?: string;
        status: string;
    };
    this_week: Array<{
        day: string;
        start: string;
        end: string;
    }>;
}

interface DashboardData {
    todayStats: Record<string, any>;
    todayTasks: Task[];
    assignedRooms: Room[];
    maintenanceRequests: MaintenanceRequest[];
    recentActivities: Activity[];
    schedule: Schedule;
    lastUpdated: string;
}

interface PageProps {
    dashboardData: DashboardData;
    user: User;
    userRole: string;
    isStaff: boolean;
    error?: string;
    [key: string]: unknown;
}
export function Tabs({ defaultValue, className, children }: React.PropsWithChildren<{ defaultValue: string; className?: string }>) {
    const [tabValue, setTabValue] = useState(defaultValue);
    return (
        <div className={className}>
            {React.Children.map(children, child =>
                React.isValidElement(child)
                    ? React.cloneElement(child as React.ReactElement<any>, { ...(child.props || {}), tabValue, setTabValue })
                    : child
            )}
        </div>
    );
}

// TabsList
export function TabsList({ children, tabValue, setTabValue }: React.PropsWithChildren<{ tabValue?: string; setTabValue?: (v: string) => void }>) {
    return (
        <div className="flex space-x-2 border-b mb-4">
            {React.Children.map(children, child =>
                React.isValidElement(child)
                    ? React.cloneElement(child as React.ReactElement<any>, { tabValue, setTabValue })
                    : child
            )}
        </div>
    );
}

// TabsTrigger
export function TabsTrigger({
    value,
    tabValue,
    setTabValue,
    children
}: React.PropsWithChildren<{ value: string; tabValue?: string; setTabValue?: (v: string) => void }>) {
    const isActive = tabValue === value;
    return (
        <button
            type="button"
            className={`px-4 py-2 rounded-t ${isActive ? 'bg-muted font-bold' : 'hover:bg-muted/50'} transition`}
            onClick={() => setTabValue && setTabValue(value)}
        >
            {children}
        </button>
    );
}

// TabsContent
export function TabsContent({
    value,
    tabValue,
    children,
    className
}: React.PropsWithChildren<{ value: string; tabValue?: string; className?: string }>) {
    // Only render if active
    if (tabValue !== value) return null;
    return <div className={className}>{children}</div>;
}
export default function StaffDashboard() {
    const { dashboardData, user, userRole, isStaff, error } = usePage<PageProps>().props;
    const [isLoading, setIsLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Staff Dashboard', href: '/dashboard/staff' }
    ];

    const handleTaskUpdate = async (taskId: number, status: string, taskType: string) => {
        setIsLoading(true);
        try {
            await router.post('/dashboard/staff/update-task-status', {
                task_id: taskId,
                status: status,
                task_type: taskType
            });
        } catch (error) {
            console.error('Failed to update task:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'destructive';
            case 'medium': return 'default';
            case 'low': return 'secondary';
            default: return 'default';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'default';
            case 'in_progress': return 'default';
            case 'pending': return 'secondary';
            default: return 'secondary';
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'front_desk': return <UserCheck className="h-4 w-4" />;
            case 'housekeeping': return <Bed className="h-4 w-4" />;
            case 'maintenance': return <Wrench className="h-4 w-4" />;
            case 'security': return <Shield className="h-4 w-4" />;
            default: return <User className="h-4 w-4" />;
        }
    };

    const formatTime = (time: string) => {
        return new Date(`2024-01-01 ${time}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const renderStatsCards = () => {
        const stats = dashboardData?.todayStats ?? {};
        
        switch (userRole) {
            case 'front_desk':
                return (
                    <>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Check-ins Today</CardTitle>
                                <UserCheck className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.checkInsToday || 0}</div>
                                <p className="text-xs text-muted-foreground">Scheduled arrivals</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Check-outs Today</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.checkOutsToday || 0}</div>
                                <p className="text-xs text-muted-foreground">Scheduled departures</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
                                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.pendingBookings || 0}</div>
                                <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.tasksCompleted || 0}</div>
                                <p className="text-xs text-muted-foreground">Today's progress</p>
                            </CardContent>
                        </Card>
                    </>
                );
            
            case 'housekeeping':
                return (
                    <>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Assigned Rooms</CardTitle>
                                <Bed className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.assignedRooms || 0}</div>
                                <p className="text-xs text-muted-foreground">Today's assignment</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Cleaned Rooms</CardTitle>
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.cleanedRooms || 0}</div>
                                <Progress value={stats.efficiency || 0} className="mt-2" />
                                <p className="text-xs text-muted-foreground mt-2">{stats.efficiency || 0}% efficiency</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending Rooms</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.pendingRooms || 0}</div>
                                <p className="text-xs text-muted-foreground">Awaiting cleaning</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Maintenance Reports</CardTitle>
                                <Wrench className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.maintenanceReports || 0}</div>
                                <p className="text-xs text-muted-foreground">Issues reported</p>
                            </CardContent>
                        </Card>
                    </>
                );
            
            case 'maintenance':
                return (
                    <>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Assigned Requests</CardTitle>
                                <Wrench className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.assignedRequests || 0}</div>
                                <p className="text-xs text-muted-foreground">Total assignments</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.completedToday || 0}</div>
                                <p className="text-xs text-muted-foreground">Tasks finished</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.inProgress || 0}</div>
                                <p className="text-xs text-muted-foreground">Active tasks</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Urgent Requests</CardTitle>
                                <AlertCircle className="h-4 w-4 text-destructive" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-destructive">{stats.urgentRequests || 0}</div>
                                <p className="text-xs text-muted-foreground">High priority</p>
                            </CardContent>
                        </Card>
                    </>
                );
            
            default:
                return (
                    <>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Tasks Assigned</CardTitle>
                                <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.tasksAssigned || 0}</div>
                                <p className="text-xs text-muted-foreground">Today's tasks</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.tasksCompleted || 0}</div>
                                <Progress value={(stats.tasksCompleted / (stats.tasksAssigned || 1)) * 100} className="mt-2" />
                                <p className="text-xs text-muted-foreground mt-2">
                                    {Math.round((stats.tasksCompleted / (stats.tasksAssigned || 1)) * 100)}% complete
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Hours Worked</CardTitle>
                                <Timer className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.hoursWorked || 0}</div>
                                <p className="text-xs text-muted-foreground">Today's hours</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Performance</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.performance || 0}%</div>
                                <Progress value={stats.performance || 0} className="mt-2" />
                                <p className="text-xs text-muted-foreground mt-2">This week</p>
                            </CardContent>
                        </Card>
                    </>
                );
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Staff Dashboard" />
            
            <div className="flex-1 space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                            <AvatarFallback>
                                {user?.name
                                    ? user.name
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')
                                        .toUpperCase()
                                        .slice(0, 2)
                                    : ''}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-2xl font-bold">Welcome back, {user?.name ?? ''}!</h1>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                    {getRoleIcon(user?.role ?? '')}
                                    <span className="capitalize">{user?.role ? user.role.replace('_', ' ') : ''}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{user?.department ?? ''}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{currentTime.toLocaleTimeString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Badge variant={dashboardData?.schedule?.today?.status === 'on_duty' ? 'default' : 'secondary'}>
                            {dashboardData?.schedule?.today?.status === 'on_duty' ? 'On Duty' : 'Off Duty'}
                        </Badge>
                        <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => router.reload()}
                            disabled={isLoading}
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>

                {error && (
                    <Card className="border-destructive">
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2 text-destructive">
                                <AlertCircle className="h-4 w-4" />
                                <p>{error}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {renderStatsCards()}
                </div>

                {/* Main Content */}
                <Tabs defaultValue="tasks" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="tasks">Today's Tasks</TabsTrigger>
                        {userRole === 'housekeeping' && (
                            <TabsTrigger value="rooms">Assigned Rooms</TabsTrigger>
                        )}
                        {userRole === 'maintenance' && (
                            <TabsTrigger value="maintenance">Maintenance Requests</TabsTrigger>
                        )}
                        <TabsTrigger value="schedule">Schedule</TabsTrigger>
                        <TabsTrigger value="activities">Recent Activities</TabsTrigger>
                    </TabsList>

                    <TabsContent value="tasks" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Today's Tasks</CardTitle>
                                <CardDescription>
                                    Your assigned tasks for {new Date().toLocaleDateString()}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {!dashboardData?.todayTasks || dashboardData.todayTasks.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <ClipboardCheck className="h-12 w-12 mx-auto mb-4" />
                                        <p>No tasks assigned for today</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {dashboardData.todayTasks.map((task) => (
                                            <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <h4 className="font-medium">{task.title}</h4>
                                                        <Badge variant={getPriorityColor(task.priority)}>
                                                            {task.priority}
                                                        </Badge>
                                                        <Badge variant={getStatusColor(task.status)}>
                                                            {task.status.replace('_', ' ')}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                                                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                                        <div className="flex items-center space-x-1">
                                                            <Clock className="h-3 w-3" />
                                                            <span>{formatTime(task.time)}</span>
                                                        </div>
                                                        {task.room_number && (
                                                            <div className="flex items-center space-x-1">
                                                                <Home className="h-3 w-3" />
                                                                <span>Room {task.room_number}</span>
                                                            </div>
                                                        )}
                                                        {task.estimated_duration && (
                                                            <div className="flex items-center space-x-1">
                                                                <Timer className="h-3 w-3" />
                                                                <span>{task.estimated_duration} min</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {task.status === 'pending' && (
                                                        <Button 
                                                            size="sm" 
                                                            onClick={() => handleTaskUpdate(task.id, 'in_progress', task.type)}
                                                            disabled={isLoading}
                                                        >
                                                            Start
                                                        </Button>
                                                    )}
                                                    {task.status === 'in_progress' && (
                                                        <Button 
                                                            size="sm" 
                                                            onClick={() => handleTaskUpdate(task.id, 'completed', task.type)}
                                                            disabled={isLoading}
                                                        >
                                                            Complete
                                                        </Button>
                                                    )}
                                                    {task.status === 'completed' && (
                                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {userRole === 'housekeeping' && (
                        <TabsContent value="rooms" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Assigned Rooms</CardTitle>
                                    <CardDescription>
                                        Rooms assigned for cleaning today
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {dashboardData.assignedRooms.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Bed className="h-12 w-12 mx-auto mb-4" />
                                            <p>No rooms assigned</p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {dashboardData.assignedRooms.map((room) => (
                                                <Card key={room.id}>
                                                    <CardHeader className="pb-3">
                                                        <div className="flex items-center justify-between">
                                                            <CardTitle className="text-lg">Room {room.number}</CardTitle>
                                                            <Badge variant={getPriorityColor(room.priority)}>
                                                                {room.priority}
                                                            </Badge>
                                                        </div>
                                                        <CardDescription>{room.type}</CardDescription>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex justify-between">
                                                                <span>Status:</span>
                                                                <Badge variant="outline">
                                                                    {room.status.replace('_', ' ')}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>Est. Time:</span>
                                                                <span>{room.estimated_time} min</span>
                                                            </div>
                                                            {room.next_checkin && (
                                                                <div className="flex justify-between">
                                                                    <span>Next Check-in:</span>
                                                                    <span>{new Date(room.next_checkin).toLocaleTimeString()}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}

                    {userRole === 'maintenance' && (
                        <TabsContent value="maintenance" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Maintenance Requests</CardTitle>
                                    <CardDescription>
                                        Your assigned maintenance tasks
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {dashboardData.maintenanceRequests.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Wrench className="h-12 w-12 mx-auto mb-4" />
                                            <p>No maintenance requests assigned</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {dashboardData.maintenanceRequests.map((request) => (
                                                <div key={request.id} className="p-4 border rounded-lg">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-2 mb-2">
                                                                <h4 className="font-medium">{request.title}</h4>
                                                                <Badge variant={getPriorityColor(request.priority)}>
                                                                    {request.priority}
                                                                </Badge>
                                                                <Badge variant={getStatusColor(request.status)}>
                                                                    {request.status.replace('_', ' ')}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground mb-2">{request.description}</p>
                                                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                                                <div className="flex items-center space-x-1">
                                                                    <MapPin className="h-3 w-3" />
                                                                    <span>{request.location} {request.room_number}</span>
                                                                </div>
                                                                <div className="flex items-center space-x-1">
                                                                    <User className="h-3 w-3" />
                                                                    <span>Reported by {request.reported_by}</span>
                                                                </div>
                                                                <div className="flex items-center space-x-1">
                                                                    <Timer className="h-3 w-3" />
                                                                    <span>Est. {request.estimated_time} min</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}

                    <TabsContent value="schedule" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Today's Schedule</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span>Shift Start:</span>
                                            <span className="font-medium">{formatTime(dashboardData?.schedule?.today?.shift_start ?? '')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Shift End:</span>
                                            <span className="font-medium">
                                                {formatTime(dashboardData?.schedule?.today?.shift_end ?? '')}
                                            </span>
                                        </div>
                                        {dashboardData?.schedule?.today?.break_start && dashboardData?.schedule?.today?.break_end && (
                                            <div className="flex justify-between">
                                                <span>Break:</span>
                                                <span className="font-medium">
                                                    {formatTime(dashboardData.schedule.today.break_start)} - {formatTime(dashboardData.schedule.today.break_end)}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span>Status:</span>
                                            <Badge variant={dashboardData?.schedule?.today?.status === 'on_duty' ? 'default' : 'secondary'}>
                                                {dashboardData?.schedule?.today?.status ? dashboardData.schedule.today.status.replace('_', ' ') : ''}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>This Week's Schedule</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {dashboardData && dashboardData.schedule && dashboardData.schedule.this_week
                                            ? dashboardData.schedule.this_week.map((day, index) => (
                                                <div key={index} className="flex justify-between">
                                                    <span className="capitalize">{day.day}:</span>
                                                    <span className="font-medium">
                                                        {formatTime(day.start)} - {formatTime(day.end)}
                                                    </span>
                                                </div>
                                            ))
                                            : <div className="text-muted-foreground">No schedule available</div>
                                        }
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="activities" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activities</CardTitle>
                                <CardDescription>
                                    Your recent work activities and updates
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {!dashboardData?.recentActivities || dashboardData.recentActivities.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Bell className="h-12 w-12 mx-auto mb-4" />
                                        <p>No recent activities</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {dashboardData.recentActivities.map((activity) => (
                                            <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                                                <div className="p-2 bg-muted rounded-full">
                                                    {activity.type === 'task_completed' && <CheckCircle className="h-4 w-4" />}
                                                    {activity.type === 'task_assigned' && <ClipboardCheck className="h-4 w-4" />}
                                                    {activity.type === 'room_cleaned' && <Bed className="h-4 w-4" />}
                                                    {activity.type === 'maintenance_reported' && <Wrench className="h-4 w-4" />}
                                                    {activity.type === 'guest_checkin' && <UserCheck className="h-4 w-4" />}
                                                    {!['task_completed', 'task_assigned', 'room_cleaned', 'maintenance_reported', 'guest_checkin'].includes(activity.type) && <Bell className="h-4 w-4" />}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium">{activity.title}</h4>
                                                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {new Date(activity.timestamp).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Footer Info */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>ID: {user?.employee_id}</span>
                        </div>
                        {user?.phone && (
                            <div className="flex items-center space-x-1">
                                <Phone className="h-3 w-3" />
                                <span>{user.phone}</span>
                            </div>
                        )}
                        <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>{user?.email}</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1">
                        <RefreshCw className="h-3 w-3" />
                        <span>Last updated: {dashboardData?.lastUpdated ? new Date(dashboardData.lastUpdated).toLocaleString() : 'N/A'}</span>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}