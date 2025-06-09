import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
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
import { Label } from '@/components/ui/label';
const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea
        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
    />
);
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
const Switch = (props: React.ComponentProps<'input'> & { checked: boolean; onCheckedChange: (checked: boolean) => void }) => (
    <input
        type="checkbox"
        className="shadcn-switch"
        onChange={e => props.onCheckedChange(e.target.checked)}
        {...props}
    />
);
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ArrowLeft,
    Save,
    Building,
    DollarSign,
    Users,
    Bed,
    Square,
    Star,
    Wifi,
    Tv,
    Wind,
    Coffee,
    Car,
    Shield,
    Bath,
    Utensils,
    X,
    Plus
} from 'lucide-react';

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

interface Props {
    room: Room;
    roomTypes: string[];
    amenitiesOptions: Record<string, string>;
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
    {
        title: 'Edit Room',
        href: '#',
    },
];

export default function AdminRoomEdit({ room, roomTypes, amenitiesOptions }: Props) {
    const [newImage, setNewImage] = useState('');
    
    const { data, setData, patch, processing, errors, reset } = useForm({
        name: room.name || '',
        description: room.description || '',
        type: room.type || '',
        price_per_night: room.price_per_night || 0,
        capacity: room.capacity || 1,
        beds: room.beds || 1,
        size: room.size || 0,
        amenities: room.amenities || [],
        images: room.images || [],
        is_available: room.is_available ?? true,
        is_active: room.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('admin.rooms.update', room.id), {
            onSuccess: () => {
                // Redirect back to rooms list
                router.visit(route('admin.rooms.index'));
            }
        });
    };

    const handleCancel = () => {
        router.visit(route('admin.rooms.index'));
    };

    const toggleAmenity = (amenityKey: string) => {
        const currentAmenities = data.amenities || [];
        const newAmenities = currentAmenities.includes(amenityKey)
            ? currentAmenities.filter(a => a !== amenityKey)
            : [...currentAmenities, amenityKey];
        
        setData('amenities', newAmenities);
    };

    const addImage = () => {
        if (newImage.trim()) {
            setData('images', [...(data.images || []), newImage.trim()]);
            setNewImage('');
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...(data.images || [])];
        newImages.splice(index, 1);
        setData('images', newImages);
    };

    const getAmenityIcon = (amenityKey: string) => {
        const iconMap: Record<string, React.ReactNode> = {
            wifi: <Wifi className="h-4 w-4" />,
            ac: <Wind className="h-4 w-4" />,
            tv: <Tv className="h-4 w-4" />,
            mini_bar: <Coffee className="h-4 w-4" />,
            balcony: <Square className="h-4 w-4" />,
            room_service: <Utensils className="h-4 w-4" />,
            safe: <Shield className="h-4 w-4" />,
            hair_dryer: <Wind className="h-4 w-4" />,
            bathtub: <Bath className="h-4 w-4" />,
            shower: <Bath className="h-4 w-4" />,
        };
        return iconMap[amenityKey] || <Star className="h-4 w-4" />;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${room.name} - Admin`} />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" onClick={handleCancel}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Rooms
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Edit Room</h1>
                            <p className="text-muted-foreground">Update room details and settings</p>
                        </div>
                    </div>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                        Room #{room.id}
                    </Badge>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building className="h-5 w-5" />
                                        Basic Information
                                    </CardTitle>
                                    <CardDescription>
                                        Basic room details and identification
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Room Name</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="e.g., Deluxe Suite 101"
                                                className={errors.name ? 'border-red-500' : ''}
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-red-600">{errors.name}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="type">Room Type</Label>
                                            <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                                                <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select room type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {roomTypes.map((type) => (
                                                        <SelectItem key={type} value={type}>
                                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.type && (
                                                <p className="text-sm text-red-600">{errors.type}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e: { target: { value: string; }; }) => setData('description', e.target.value)}
                                            placeholder="Describe the room features and amenities..."
                                            rows={3}
                                            className={errors.description ? 'border-red-500' : ''}
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-red-600">{errors.description}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Room Specifications */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bed className="h-5 w-5" />
                                        Room Specifications
                                    </CardTitle>
                                    <CardDescription>
                                        Physical characteristics and capacity
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="price_per_night" className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4" />
                                                Price per Night
                                            </Label>
                                            <Input
                                                id="price_per_night"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={data.price_per_night}
                                                onChange={(e) => setData('price_per_night', parseFloat(e.target.value) || 0)}
                                                placeholder="0.00"
                                                className={errors.price_per_night ? 'border-red-500' : ''}
                                            />
                                            {errors.price_per_night && (
                                                <p className="text-sm text-red-600">{errors.price_per_night}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="capacity" className="flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                Capacity
                                            </Label>
                                            <Input
                                                id="capacity"
                                                type="number"
                                                min="1"
                                                max="10"
                                                value={data.capacity}
                                                onChange={(e) => setData('capacity', parseInt(e.target.value) || 1)}
                                                className={errors.capacity ? 'border-red-500' : ''}
                                            />
                                            {errors.capacity && (
                                                <p className="text-sm text-red-600">{errors.capacity}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="beds" className="flex items-center gap-2">
                                                <Bed className="h-4 w-4" />
                                                Number of Beds
                                            </Label>
                                            <Input
                                                id="beds"
                                                type="number"
                                                min="1"
                                                max="5"
                                                value={data.beds}
                                                onChange={(e) => setData('beds', parseInt(e.target.value) || 1)}
                                                className={errors.beds ? 'border-red-500' : ''}
                                            />
                                            {errors.beds && (
                                                <p className="text-sm text-red-600">{errors.beds}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="size" className="flex items-center gap-2">
                                                <Square className="h-4 w-4" />
                                                Size (sqm)
                                            </Label>
                                            <Input
                                                id="size"
                                                type="number"
                                                min="0"
                                                step="0.1"
                                                value={data.size}
                                                onChange={(e) => setData('size', parseFloat(e.target.value) || 0)}
                                                placeholder="0"
                                                className={errors.size ? 'border-red-500' : ''}
                                            />
                                            {errors.size && (
                                                <p className="text-sm text-red-600">{errors.size}</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Amenities */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Star className="h-5 w-5" />
                                        Amenities
                                    </CardTitle>
                                    <CardDescription>
                                        Select available amenities for this room
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        {Object.entries(amenitiesOptions).map(([key, label]) => (
                                            <div
                                                key={key}
                                                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                                    data.amenities?.includes(key)
                                                        ? 'bg-primary/10 border-primary'
                                                        : 'bg-background border-border hover:bg-muted/50'
                                                }`}
                                                onClick={() => toggleAmenity(key)}
                                            >
                                                {getAmenityIcon(key)}
                                                <span className="text-sm font-medium">{label}</span>
                                                {data.amenities?.includes(key) && (
                                                    <div className="ml-auto">
                                                        <Badge variant="default" className="text-xs">✓</Badge>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Images */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Room Images</CardTitle>
                                    <CardDescription>
                                        Add image URLs for this room
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Add new image */}
                                    <div className="flex gap-2">
                                        <Input
                                            type="url"
                                            placeholder="Enter image URL..."
                                            value={newImage}
                                            onChange={(e) => setNewImage(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                                        />
                                        <Button type="button" onClick={addImage} disabled={!newImage.trim()}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {/* Existing images */}
                                    {data.images && data.images.length > 0 && (
                                        <div className="space-y-2">
                                            <Label>Current Images</Label>
                                            <div className="space-y-2">
                                                {data.images.map((image, index) => (
                                                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                                                        <img
                                                            src={image}
                                                            alt={`Room image ${index + 1}`}
                                                            className="w-16 h-16 object-cover rounded"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = '/placeholder-room.jpg';
                                                            }}
                                                        />
                                                        <span className="flex-1 text-sm text-gray-600 truncate">{image}</span>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeImage(index)}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Room Status */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Room Status</CardTitle>
                                    <CardDescription>
                                        Manage room availability and status
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Room Active</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Room can be booked when active
                                            </p>
                                        </div>
                                        <Switch
                                            checked={data.is_active}
                                            onCheckedChange={(checked: boolean) => setData('is_active', checked)}
                                        />
                                    </div>

                                    <Separator />

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Currently Available</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Room is ready for new bookings
                                            </p>
                                        </div>
                                        <Switch
                                            checked={data.is_available}
                                            onCheckedChange={(checked: boolean) => setData('is_available', checked)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Current Room Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Current Room Info</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="text-sm">
                                        <p className="text-muted-foreground">Created</p>
                                        <p>{new Date(room.created_at).toLocaleDateString()}</p>
                                    </div>
                                    
                                    {room.bookings_count !== undefined && (
                                        <div className="text-sm">
                                            <p className="text-muted-foreground">Total Bookings</p>
                                            <p>{room.bookings_count}</p>
                                        </div>
                                    )}
                                    
                                    {room.rating && (
                                        <div className="text-sm">
                                            <p className="text-muted-foreground">Average Rating</p>
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <span>{room.rating}</span>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Action Buttons */}
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="space-y-2">
                                        <Button type="submit" className="w-full" disabled={processing}>
                                            <Save className="h-4 w-4 mr-2" />
                                            {processing ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                        <Button type="button" variant="outline" className="w-full" onClick={handleCancel}>
                                            Cancel
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}