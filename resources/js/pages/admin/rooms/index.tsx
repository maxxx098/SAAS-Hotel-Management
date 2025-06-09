import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { 
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Plus, 
    Search, 
    MoreHorizontal, 
    Edit, 
    Eye, 
    Trash2,
    Building,
    Filter,
    Bed,
    Users,
    DollarSign,
    Star,
    TrendingUp
} from 'lucide-react';

// Table Components for shadcn/ui
import { ReactNode } from 'react';

const Table = ({
    children,
    className = "",
}: {
    children: ReactNode;
    className?: string;
}) => (
    <div className={`w-full overflow-auto ${className}`}>
        <table className="w-full caption-bottom text-sm">
            {children}
        </table>
    </div>
);

const TableHeader = ({
    children,
    className = "",
}: {
    children: ReactNode;
    className?: string;
}) => (
    <thead className={`[&_tr]:border-b ${className}`}>
        {children}
    </thead>
);

const TableBody = ({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) => (
    <tbody className={`[&_tr:last-child]:border-0 ${className}`}>
        {children}
    </tbody>
);

const TableRow = ({
    children,
    className = "",
    onClick,
}: {
    children: React.ReactNode;
    className?: string;
    onClick?: React.MouseEventHandler<HTMLTableRowElement>;
}) => (
    <tr
        className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className}`}
        onClick={onClick}
    >
        {children}
    </tr>
);

const TableHead = ({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) => (
    <th className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className}`}>
        {children}
    </th>
);

const TableCell = ({ children, className = "", colSpan }: { children: React.ReactNode; className?: string; colSpan?: number }) => (
    <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`} colSpan={colSpan}>
        {children}
    </td>
);

// Types
interface Room {
    id: number;
    name: string;
    description?: string;
    type: string;
    price_per_night: number;
    capacity: number;
    beds: number;
    size?: number;
    amenities?: string[];
    images?: string[];
    is_available: boolean;
    is_active: boolean;
    created_at: string;
    bookings_count?: number;
    rating?: number;
}

interface PaginatedRooms {
    data: Room[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Props {
    rooms: PaginatedRooms;
    filters: {
        search?: string;
        type?: string;
        availability?: string;
    };
    roomTypes: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Rooms Management',
        href: '/admin/rooms',
    },
];

export default function AdminRoomsManagement({ rooms, filters, roomTypes }: Props) {
    const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [selectedType, setSelectedType] = useState(filters.type || 'all');
    const [selectedAvailability, setSelectedAvailability] = useState(filters.availability || 'all');
    const [isSearching, setIsSearching] = useState(false);

    // Calculate statistics from current rooms data
    const roomStats = {
        totalRooms: rooms.total,
        availableRooms: rooms.data.filter(r => r.is_available && r.is_active).length,
        occupiedRooms: rooms.data.filter(r => !r.is_available && r.is_active).length,
        inactiveRooms: rooms.data.filter(r => !r.is_active).length,
        avgPrice: rooms.data.length > 0 ? rooms.data.reduce((sum, r) => sum + r.price_per_night, 0) / rooms.data.length : 0,
        totalBookings: rooms.data.reduce((sum, r) => sum + (r.bookings_count || 0), 0)
    };

    // Handle search and filters
    const handleSearch = () => {
        setIsSearching(true);
        const params: any = {};
        
        if (search.trim()) params.search = search.trim();
        if (selectedType !== 'all') params.type = selectedType;
        if (selectedAvailability !== 'all') params.availability = selectedAvailability;

        router.get(route('admin.rooms.index'), params, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsSearching(false),
        });
    };

    const handleClearFilters = () => {
        setSearch('');
        setSelectedType('all');
        setSelectedAvailability('all');
        setSelectedRoom(null);
        
        router.get(route('admin.rooms.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Handle pagination
    const handlePageChange = (page: number) => {
        const params: any = { page };
        
        if (search.trim()) params.search = search.trim();
        if (selectedType !== 'all') params.type = selectedType;
        if (selectedAvailability !== 'all') params.availability = selectedAvailability;

        router.get(route('admin.rooms.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Handle room deletion
    const handleDelete = (room: Room) => {
        if (confirm(`Are you sure you want to delete ${room.name}?`)) {
            router.delete(route('admin.rooms.destroy', room.id), {
                onSuccess: () => {
                    if (selectedRoom === room.id) {
                        setSelectedRoom(null);
                    }
                }
            });
        }
    };

    // Handle room actions
    const handleEdit = (room: Room) => {
        router.get(route('admin.rooms.edit', room.id));
    };

    const handleView = (room: Room) => {
        router.get(route('admin.rooms.show', room.id));
    };

    const handleAddRoom = () => {
        router.get(route('admin.rooms.create'));
    };

    // Toggle room status
    const toggleRoomStatus = (room: Room) => {
        router.patch(route('admin.rooms.update', room.id), {
            ...room,
            is_active: !room.is_active
        }, {
            preserveState: true,
        });
    };

    const getStatusBadge = (room: Room) => {
        if (!room.is_active) {
            return <Badge variant="secondary" className="bg-gray-50 text-gray-700">Inactive</Badge>;
        }
        if (!room.is_available) {
            return <Badge variant="destructive" className="bg-red-50 text-red-700">Occupied</Badge>;
        }
        return <Badge variant="default" className="bg-green-50 text-green-700">Available</Badge>;
    };

    const selectedRoomData = rooms.data.find(r => r.id === selectedRoom);

    // Auto-search on enter key
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && document.activeElement?.tagName === 'INPUT') {
                handleSearch();
            }
        };

        document.addEventListener('keypress', handleKeyPress);
        return () => document.removeEventListener('keypress', handleKeyPress);
    }, [search, selectedType, selectedAvailability]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rooms Management - Admin" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Rooms Management</h1>
                        <p className="text-muted-foreground">Manage hotel rooms and availability</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                            Admin Panel
                        </Badge>
                        <Button onClick={handleAddRoom}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Room
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
                            <Building className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{roomStats.totalRooms}</div>
                            <div className="flex items-center text-xs text-muted-foreground">
                                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                                Total in system
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Available</CardTitle>
                            <Bed className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{roomStats.availableRooms}</div>
                            <div className="text-xs text-muted-foreground">
                                Ready for booking
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Occupied</CardTitle>
                            <Users className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{roomStats.occupiedRooms}</div>
                            <div className="text-xs text-muted-foreground">
                                Currently in use
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg. Price</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${roomStats.avgPrice.toFixed(0)}</div>
                            <div className="text-xs text-muted-foreground">
                                Per night
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Rooms Table */}
                    <div className="lg:col-span-2 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="h-5 w-5" />
                                    Room Inventory
                                </CardTitle>
                                <CardDescription>
                                    Manage your hotel rooms and their availability
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Filters */}
                                <div className="mb-6 space-y-4">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex-1">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input
                                                    placeholder="Search rooms by name or type..."
                                                    value={search}
                                                    onChange={(e) => setSearch(e.target.value)}
                                                    className="pl-10"
                                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                                />
                                            </div>
                                        </div>
                                        
                                        <Select value={selectedType} onValueChange={setSelectedType}>
                                            <SelectTrigger className="w-full sm:w-48">
                                                <SelectValue placeholder="Filter by type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Types</SelectItem>
                                                {roomTypes.map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
                                            <SelectTrigger className="w-full sm:w-48">
                                                <SelectValue placeholder="Filter by status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                <SelectItem value="available">Available</SelectItem>
                                                <SelectItem value="unavailable">Unavailable</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Button onClick={handleSearch} disabled={isSearching}>
                                            <Filter className="h-4 w-4 mr-2" />
                                            {isSearching ? 'Filtering...' : 'Filter'}
                                        </Button>

                                        <Button variant="outline" onClick={handleClearFilters}>
                                            Clear
                                        </Button>
                                    </div>
                                </div>

                                {/* Rooms Table */}
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Room</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Price/Night</TableHead>
                                                <TableHead>Capacity</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {rooms.data.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-8">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Building className="h-8 w-8 text-gray-400" />
                                                            <p className="text-gray-500">
                                                                {filters.search || filters.type || filters.availability 
                                                                    ? 'No rooms found matching your filters'
                                                                    : 'No rooms found'
                                                                }
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                rooms.data.map((room) => (
                                                    <TableRow 
                                                        key={room.id}
                                                        className={`cursor-pointer ${
                                                            selectedRoom === room.id ? 'bg-primary/5' : ''
                                                        }`}
                                                        onClick={() => setSelectedRoom(room.id)}
                                                    >
                                                        <TableCell>
                                                            <div>
                                                                <div className="font-medium">{room.name}</div>
                                                                {room.size && (
                                                                    <div className="text-sm text-gray-500">
                                                                        {room.size} sqm • {room.beds} bed{room.beds > 1 ? 's' : ''}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">
                                                                {room.type.charAt(0).toUpperCase() + room.type.slice(1)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            ${room.price_per_night}
                                                        </TableCell>
                                                        <TableCell>{room.capacity} guest{room.capacity > 1 ? 's' : ''}</TableCell>
                                                        <TableCell>{getStatusBadge(room)}</TableCell>
                                                        <TableCell className="text-right">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="sm">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => handleView(room)}>
                                                                        <Eye className="h-4 w-4 mr-2" />
                                                                        View Details
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleEdit(room)}>
                                                                        <Edit className="h-4 w-4 mr-2" />
                                                                        Edit Room
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDelete(room);
                                                                        }}
                                                                        className="text-red-600"
                                                                    >
                                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                {rooms.last_page > 1 && (
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="text-sm text-gray-600">
                                            Showing {rooms.from} to {rooms.to} of {rooms.total} rooms
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(rooms.current_page - 1)}
                                                disabled={rooms.current_page === 1}
                                            >
                                                Previous
                                            </Button>
                                            
                                            {/* Page numbers */}
                                            {Array.from({ length: Math.min(5, rooms.last_page) }, (_, i) => {
                                                const page = i + 1;
                                                return (
                                                    <Button
                                                        key={page}
                                                        variant={rooms.current_page === page ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => handlePageChange(page)}
                                                    >
                                                        {page}
                                                    </Button>
                                                );
                                            })}
                                            
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(rooms.current_page + 1)}
                                                disabled={rooms.current_page === rooms.last_page}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Room Details Sidebar */}
                    <div className="space-y-6">
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Eye className="h-5 w-5" />
                                    <span>Room Details</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {selectedRoomData ? (
                                    <div className="space-y-4">
                                        {/* Room Information */}
                                        <div className="space-y-2">
                                            <h4 className="font-medium flex items-center gap-2">
                                                <Building className="h-4 w-4" />
                                                Room Information
                                            </h4>
                                            <div className="space-y-1 text-sm">
                                                <p><strong>Name:</strong> {selectedRoomData.name}</p>
                                                <p><strong>Type:</strong> {selectedRoomData.type.charAt(0).toUpperCase() + selectedRoomData.type.slice(1)}</p>
                                                {selectedRoomData.size && <p><strong>Size:</strong> {selectedRoomData.size} sqm</p>}
                                                <p><strong>Capacity:</strong> {selectedRoomData.capacity} guest{selectedRoomData.capacity > 1 ? 's' : ''}</p>
                                                <p><strong>Beds:</strong> {selectedRoomData.beds}</p>
                                                {selectedRoomData.description && (
                                                    <p><strong>Description:</strong> {selectedRoomData.description}</p>
                                                )}
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Pricing */}
                                        <div className="space-y-2">
                                            <h4 className="font-medium flex items-center gap-2">
                                                <DollarSign className="h-4 w-4" />
                                                Pricing & Stats
                                            </h4>
                                            <div className="space-y-1 text-sm">
                                                <div className="flex justify-between">
                                                    <span>Base rate:</span>
                                                    <span className="font-semibold">${selectedRoomData.price_per_night}/night</span>
                                                </div>
                                                {selectedRoomData.bookings_count !== undefined && (
                                                    <div className="flex justify-between">
                                                        <span>Total bookings:</span>
                                                        <span>{selectedRoomData.bookings_count}</span>
                                                    </div>
                                                )}
                                                {selectedRoomData.rating && (
                                                    <div className="flex justify-between items-center">
                                                        <span>Rating:</span>
                                                        <div className="flex items-center gap-1">
                                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                            <span>{selectedRoomData.rating}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {selectedRoomData.amenities && selectedRoomData.amenities.length > 0 && (
                                            <>
                                                <Separator />
                                                <div className="space-y-2">
                                                    <h4 className="font-medium">Amenities</h4>
                                                    <div className="flex flex-wrap gap-1">
                                                        {selectedRoomData.amenities.map((amenity, index) => (
                                                            <Badge key={index} variant="outline" className="text-xs">
                                                                {amenity}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        <Separator />
                                        <div className="space-y-2">
                                            <Button 
                                                className="w-full" 
                                                variant="outline"
                                                onClick={() => handleEdit(selectedRoomData)}
                                            >
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit Room
                                            </Button>
                                            <Button 
                                                className="w-full" 
                                                variant={selectedRoomData.is_active ? "secondary" : "default"}
                                                onClick={() => toggleRoomStatus(selectedRoomData)}
                                            >
                                                {selectedRoomData.is_active ? 'Deactivate' : 'Activate'} Room
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Building className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>Select a room to view details</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Room Statistics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span>Occupancy Rate</span>
                                    <Badge variant="secondary">
                                        {roomStats.totalRooms > 0 
                                            ? Math.round((roomStats.occupiedRooms / (roomStats.totalRooms - roomStats.inactiveRooms)) * 100)
                                            : 0
                                        }%
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span>Active Rooms</span>
                                    <Badge variant="default">{roomStats.totalRooms - roomStats.inactiveRooms}</Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span>Total Bookings</span>
                                    <Badge variant="outline">{roomStats.totalBookings}</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}