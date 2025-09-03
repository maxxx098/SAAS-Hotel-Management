import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

import { 
    Building,
    DollarSign,
    Users,
    Bed,
    Ruler,
    Tag,
    Image,
    Save,
    ArrowLeft,
    Plus,
    X,
    Star,
    Hash,
} from 'lucide-react';

// UI Components (keeping your existing components)
import { ReactNode } from 'react';

const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
    <div className={`rounded-lg border bg-card shadow-sm ${className}`}>
        {children}
    </div>
);

const CardHeader = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
        {children}
    </div>
);

const CardTitle = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
    <h3 className={`text-2xl font-semibold leading-none tracking-tight text-card-foreground ${className}`}>
        {children}
    </h3>
);

const CardDescription = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <p className={`text-sm text-muted-foreground ${className}`}>
        {children}
    </p>
);

const CardContent = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
    <div className={`p-6 pt-0 ${className}`}>
        {children}
    </div>
);

import { MouseEventHandler } from 'react';

type ButtonProps = {
    children: ReactNode;
    className?: string;
    variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
    size?: "default" | "sm" | "lg";
    onClick?: MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
};

const Button = ({
    children,
    className = "",
    variant = "default",
    size = "default",
    onClick,
    disabled = false,
    type = "button"
}: ButtonProps) => {
    const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90"
    };
    
    const sizes = {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3",
        lg: "h-11 px-8"
    };
    
    return (
        <button
            type={type}
            className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

type InputProps = {
    className?: string;
    placeholder?: string;
    value: string | number;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    type?: string;
    required?: boolean;
    id?: string;
    min?: number | string;
    max?: number | string;
    step?: number | string;
};

const Input = ({
    className = "",
    placeholder,
    value,
    onChange,
    type = "text",
    required = false,
    id,
    min,
    max,
    step
}: InputProps) => (
    <input
        id={id}
        type={type}
        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        min={min}
        max={max}
        step={step}
    />
);

type TextareaProps = {
    className?: string;
    placeholder?: string;
    value: string;
    onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
    rows?: number;
    required?: boolean;
    id?: string;
};

const Textarea = ({
    className = "",
    placeholder,
    value,
    onChange,
    rows = 3,
    required = false,
    id
}: TextareaProps) => (
    <textarea
        id={id}
        className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        required={required}
    />
);

type SelectProps = {
    children: React.ReactNode;
    value: string;
    onChange: React.ChangeEventHandler<HTMLSelectElement>;
    className?: string;
};

const Select = ({ children, value, onChange, className = "" }: SelectProps) => (
    <select
        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        value={value}
        onChange={onChange}
    >
        {children}
    </select>
);

const Label = ({
    children,
    className = "",
    htmlFor
}: {
    children: React.ReactNode;
    className?: string;
    htmlFor?: string;
}) => (
    <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} htmlFor={htmlFor}>
        {children}
    </label>
);

type BadgeProps = {
    children: React.ReactNode;
    variant?: "default" | "secondary" | "outline";
    className?: string;
};

const Badge = ({ children, variant = "default", className = "" }: BadgeProps) => {
    const variants = {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        outline: "border border-input bg-background text-foreground"
    };
    
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

const Switch = ({
    checked,
    onCheckedChange,
    className = ""
}: {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    className?: string;
}) => (
    <button
        type="button"
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            checked ? 'bg-primary' : 'bg-input'
        } ${className}`}
        onClick={() => onCheckedChange(!checked)}
    >
        <span
            className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                checked ? 'translate-x-6' : 'translate-x-1'
            }`}
        />
    </button>
);

// Main Component with Laravel Integration
type RoomType = { value: string; label: string };
type AmenityOption = { key: string; label: string };
type CreateRoomProps = {
    roomTypes?: RoomType[];
    amenitiesOptions?: Record<string, string>;
};

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
        title: 'Create Room',
        href: '/admin/rooms/create',
    },
];

function CreateRoomPage({ roomTypes, amenitiesOptions }: CreateRoomProps) {
    type FormData = {
    number: string;  // Add this line
    name: string;
    description: string;
    type: string;
    price_per_night: string;
    capacity: string;
    beds: string;
    size: string;
    amenities: string[];
    images: string[];
    is_available: boolean;
    is_active: boolean;
    is_popular: boolean;
};

  const [formData, setFormData] = useState<FormData>({
    number: '',  // Add this line
    name: '',
    description: '',
    type: roomTypes?.[0]?.value || 'single',
    price_per_night: '',
    capacity: '',
    beds: '',
    size: '',
    amenities: [],
    images: [''],
    is_available: true,
    is_active: true,
    is_popular: false
});
type Errors = {
    number?: string;  // Add this line
    name?: string;
    description?: string;
    type?: string;
    price_per_night?: string;
    capacity?: string;
    beds?: string;
    size?: string;
    amenities?: string;
    images?: string;
    [key: string]: string | undefined;
};
    
    const [errors, setErrors] = useState<Errors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Default room types if not provided by Laravel
    const defaultRoomTypes = [
        { value: 'single', label: 'Single Room' },
        { value: 'double', label: 'Double Room' },
        { value: 'suite', label: 'Suite' },
        { value: 'family', label: 'Family Room' },
        { value: 'deluxe', label: 'Deluxe Room' }
    ];

    // Default amenities if not provided by Laravel
    const defaultAmenitiesOptions = [
        { key: 'wifi', label: 'Wi-Fi' },
        { key: 'ac', label: 'Air Conditioning' },
        { key: 'tv', label: 'Television' },
        { key: 'mini_bar', label: 'Mini Bar' },
        { key: 'balcony', label: 'Balcony' },
        { key: 'room_service', label: 'Room Service' },
        { key: 'safe', label: 'Safe' },
        { key: 'hair_dryer', label: 'Hair Dryer' },
        { key: 'bathtub', label: 'Bathtub' },
        { key: 'shower', label: 'Shower' }
    ];

    // Use props from Laravel or fallback to defaults
    const roomTypesList = roomTypes || defaultRoomTypes;
    const amenitiesList = amenitiesOptions ? 
        Object.entries(amenitiesOptions).map(([key, label]) => ({ key, label })) : 
        defaultAmenitiesOptions;

    const handleInputChange = (field: string, value: string | boolean | string[]) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleAmenityToggle = (amenityKey: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenityKey)
                ? prev.amenities.filter(a => a !== amenityKey)
                : [...prev.amenities, amenityKey]
        }));
    };

    const handleImageChange = (index: number, value: string) => {
        const newImages = [...formData.images];
        newImages[index] = value;
        handleInputChange('images', newImages);
    };

    const addImageField = () => {
        handleInputChange('images', [...formData.images, '']);
    };

const removeImageField = (index: number) => {
    if (formData.images.length === 1) {
        // If only one image field, clear it instead of removing
        handleInputChange('images', ['']);
    } else {
        const newImages = formData.images.filter((_, i) => i !== index);
        handleInputChange('images', newImages);
    }
};

   const validateForm = () => {
    const newErrors: Errors = {};

    if (!formData.number.trim()) newErrors.number = 'Room number is required';  // Add this line
    if (!formData.name.trim()) newErrors.name = 'Room name is required';
    if (!formData.type) newErrors.type = 'Room type is required';
    if (!formData.price_per_night || Number(formData.price_per_night) <= 0) {
        newErrors.price_per_night = 'Valid price per night is required';
    }
    if (!formData.capacity || Number(formData.capacity) < 1 || Number(formData.capacity) > 10) {
        newErrors.capacity = 'Capacity must be between 1 and 10';
    }
    if (!formData.beds || Number(formData.beds) < 1 || Number(formData.beds) > 5) {
        newErrors.beds = 'Number of beds must be between 1 and 5';
    }
    if (formData.size && Number(formData.size) < 0) {
        newErrors.size = 'Size cannot be negative';
    }

    // Validate image URLs
    const nonEmptyImages = formData.images.filter(img => img && img.trim());
    const invalidImages = nonEmptyImages.filter(img => {
        try {
            new URL(img.trim());
            return false;
        } catch {
            return true;
        }
    });
    
    if (invalidImages.length > 0) {
        newErrors.images = 'Please enter valid image URLs';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
        // Filter out empty image URLs and validate URLs
        const cleanedImages = formData.images
            .filter(img => img && img.trim()) // Remove empty/null/undefined
            .map(img => img.trim()); // Trim whitespace
        
        const submitData = {
            number: formData.number,  // Add this line
            name: formData.name,
            description: formData.description || null,
            type: formData.type,
            price_per_night: parseFloat(formData.price_per_night),
            capacity: parseInt(formData.capacity),
            beds: parseInt(formData.beds),
            size: formData.size ? parseFloat(formData.size) : null,
            amenities: formData.amenities,
            images: cleanedImages,
            is_available: formData.is_available,
            is_active: formData.is_active,
            is_popular: formData.is_popular
        };

        console.log('Submitting data:', submitData);

        // Submit to Laravel using Inertia
        router.post(route('admin.rooms.store'), submitData, {
            onSuccess: () => {
                console.log('Room created successfully');
            },
            onError: (errors) => {
                console.log('Validation errors:', errors);
                setErrors(errors);
                setIsSubmitting(false);
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
        
    } catch (error) {
        console.error('Error creating room:', error);
        setIsSubmitting(false);
    }
};

    const handleCancel = () => {
        router.get(route('admin.rooms.index'));
    };

    return (
        <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <Button variant="outline" onClick={handleCancel}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Rooms
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Create New Room</h1>
                        <p className="text-muted-foreground">Add a new room to your hotel inventory</p>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building className="h-5 w-5" />
                            Basic Information
                        </CardTitle>
                        <CardDescription>
                            Enter the basic details for the room
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Room Name *</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Deluxe Ocean Suite"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className={errors.name ? 'border-destructive' : ''}
                                    required
                                />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">Room Type *</Label>
                                <Select
                                    value={formData.type}
                                    onChange={(e) => handleInputChange('type', e.target.value)}
                                    className={errors.type ? 'border-destructive' : ''}
                                >
                                    {roomTypesList.map(type => (
                                        <option key={typeof type === 'string' ? type : type.value} value={typeof type === 'string' ? type : type.value}>
                                            {typeof type === 'string' ? type : type.label}
                                        </option>
                                    ))}
                                </Select>
                                {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe the room features and ambiance..."
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                rows={4}
                            />
                            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* Room Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bed className="h-5 w-5" />
                            Room Details
                        </CardTitle>
                        <CardDescription>
                            Specify room capacity and physical details
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="price" className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    Price per Night *
                                </Label>
                                <Input
                                    id="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.price_per_night}
                                    onChange={(e) => handleInputChange('price_per_night', e.target.value)}
                                    className={errors.price_per_night ? 'border-destructive' : ''}
                                    required
                                />
                                {errors.price_per_night && <p className="text-sm text-destructive">{errors.price_per_night}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="number" className="flex items-center gap-2">
                                    <Hash className="h-4 w-4" />
                                    Room Number *
                                </Label>
                                <Input
                                    id="number"
                                    placeholder="e.g., 101, A-205, Suite-301"
                                    value={formData.number}
                                    onChange={(e) => handleInputChange('number', e.target.value)}
                                    className={errors.number ? 'border-destructive' : ''}
                                    required
                                />
                                {errors.number && <p className="text-sm text-destructive">{errors.number}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="capacity" className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Capacity *
                                </Label>
                                <Input
                                    id="capacity"
                                    type="number"
                                    min="1"
                                    max="10"
                                    placeholder="2"
                                    value={formData.capacity}
                                    onChange={(e) => handleInputChange('capacity', e.target.value)}
                                    className={errors.capacity ? 'border-destructive' : ''}
                                    required
                                />
                                {errors.capacity && <p className="text-sm text-destructive">{errors.capacity}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="beds" className="flex items-center gap-2">
                                    <Bed className="h-4 w-4" />
                                    Number of Beds *
                                </Label>
                                <Input
                                    id="beds"
                                    type="number"
                                    min="1"
                                    max="5"
                                    placeholder="1"
                                    value={formData.beds}
                                    onChange={(e) => handleInputChange('beds', e.target.value)}
                                    className={errors.beds ? 'border-destructive' : ''}
                                    required
                                />
                                {errors.beds && <p className="text-sm text-destructive">{errors.beds}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="size" className="flex items-center gap-2">
                                    <Ruler className="h-4 w-4" />
                                    Size (sqm)
                                </Label>
                                <Input
                                    id="size"
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    placeholder="25.5"
                                    value={formData.size}
                                    onChange={(e) => handleInputChange('size', e.target.value)}
                                    className={errors.size ? 'border-destructive' : ''}
                                />
                                {errors.size && <p className="text-sm text-destructive">{errors.size}</p>}
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
                            Select the amenities available in this room
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {amenitiesList.map(amenity => (
                                <div key={amenity.key} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id={amenity.key}
                                        checked={formData.amenities.includes(amenity.key)}
                                        onChange={() => handleAmenityToggle(amenity.key)}
                                        className="rounded border-input text-primary focus:ring-ring"
                                    />
                                    <Label htmlFor={amenity.key} className="text-sm font-normal cursor-pointer">
                                        {amenity.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                        
                        {formData.amenities.length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm text-muted-foreground mb-2">Selected amenities:</p>
                                <div className="flex flex-wrap gap-2">
                                    {formData.amenities.map(amenityKey => {
                                        const amenity = amenitiesList.find(a => a.key === amenityKey);
                                        return (
                                            <Badge key={amenityKey} variant="secondary">
                                                {amenity?.label}
                                            </Badge>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        {errors.amenities && <p className="text-sm text-destructive mt-2">{errors.amenities}</p>}
                    </CardContent>
                </Card>

                {/* Images */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Image className="h-5 w-5" />
                            Room Images
                        </CardTitle>
                        <CardDescription>
                            Add image URLs for the room gallery
                        </CardDescription>
                    </CardHeader>
        
                    <CardContent className="space-y-4">
                        {formData.images.map((image, index) => (
                            <div key={index} className="flex gap-2">
                                <Input
                                    placeholder="https://example.com/room-image.jpg"
                                    value={image}
                                    onChange={(e) => handleImageChange(index, e.target.value)}
                                    className={`flex-1 ${errors.images ? 'border-red-500' : ''}`}
                                />
                                {formData.images.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeImageField(index)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={addImageField}
                            className="w-full"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Another Image
                        </Button>
                        {errors.images && <p className="text-sm text-red-500 mt-2">{errors.images}</p>}
                        
                        {/* Add preview of valid images */}
                        {formData.images.some(img => img.trim()) && (
                            <div className="mt-4">
                                <p className="text-sm text-gray-600 mb-2">Image URLs added:</p>
                                <div className="space-y-1">
                                    {formData.images
                                        .filter(img => img.trim())
                                        .map((img, index) => (
                                            <p key={index} className="text-xs text-blue-600 truncate">
                                                {img}
                                            </p>
                                        ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Room Status */}
              <Card>
                <CardHeader>
                    <CardTitle>Room Status</CardTitle>
                    <CardDescription>
                        Set the initial availability and active status
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Available */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label>Available for Booking</Label>
                            <p className="text-sm text-muted-foreground">
                                Whether this room can be booked by guests
                            </p>
                        </div>
                        <Switch
                            checked={formData.is_available}
                            onCheckedChange={(checked) => handleInputChange('is_available', checked)}
                        />
                    </div>

                    {/* Active */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label>Active Room</Label>
                            <p className="text-sm text-muted-foreground">
                                Whether this room is active in the system
                            </p>
                        </div>
                        <Switch
                            checked={formData.is_active}
                            onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                        />
                    </div>

                    {/* ✅ Popular */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label>Popular Room</Label>
                            <p className="text-sm text-muted-foreground">
                                Mark this room as a popular choice
                            </p>
                        </div>
                        <Switch
                            checked={formData.is_popular}
                            onCheckedChange={(checked) => handleInputChange('is_popular', checked)}
                        />
                    </div>
                </CardContent>
            </Card>
                {/* Form Actions */}
                <div className="flex items-center justify-end gap-4 pt-6">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="min-w-[120px]"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                Creating...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Create Room
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function CreateRoom(props: CreateRoomProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Room - Admin" />
            <CreateRoomPage {...props} />
        </AppLayout>
    );
}