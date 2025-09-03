import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Search, Users, Bed, Maximize2, Wifi, Tv, Car, Coffee, Bath, Shield, Wind, Utensils, Star, MapPin, Building, Filter, Link, ArrowRight } from 'lucide-react';
import { SharedData } from '@/types';
import Layout from '@/components/layout';
import HeroSection from './hero';
interface Room {
  id: number;
  name: string;
  description: string | null;
  type: 'single' | 'double' | 'suite' | 'family' | 'deluxe';
  price_per_night: number;
  capacity: number;
  beds: number;
  size: number | null;
  amenities: string[] | null;
  images: string[] | null;
  is_available: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
   is_popular: boolean;
}

interface PaginatedRooms {
  data: Room[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
}

interface RoomsPageProps {
  rooms: PaginatedRooms;
  filters: {
    search?: string;
    type?: string;
    availability?: string;
  };
  roomTypes: string[];
}

const amenityIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi className="h-4 w-4" />,
  ac: <Wind className="h-4 w-4" />,
  tv: <Tv className="h-4 w-4" />,
  mini_bar: <Coffee className="h-4 w-4" />,
  balcony: <MapPin className="h-4 w-4" />,
  room_service: <Utensils className="h-4 w-4" />,
  safe: <Shield className="h-4 w-4" />,
  hair_dryer: <Wind className="h-4 w-4" />,
  bathtub: <Bath className="h-4 w-4" />,
  shower: <Bath className="h-4 w-4" />,
};

const amenityLabels: Record<string, string> = {
  wifi: 'Wi-Fi',
  ac: 'Air Conditioning',
  tv: 'Television',
  mini_bar: 'Mini Bar',
  balcony: 'Balcony',
  room_service: 'Room Service',
  safe: 'Safe',
  hair_dryer: 'Hair Dryer',
  bathtub: 'Bathtub',
  shower: 'Shower',
};

const typeLabels: Record<string, string> = {
  single: 'Single Room',
  double: 'Double Room',
  suite: 'Suite',
  family: 'Family Room',
  deluxe: 'Deluxe Room',
};

export default function RoomsPage({ rooms, filters, roomTypes }: RoomsPageProps) {
  const { auth } = usePage<SharedData>().props;  
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
  const [availabilityFilter, setAvailabilityFilter] = useState(filters.availability || 'all');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    setIsSearching(true);
    router.get(route('rooms.index'), {
      search: searchValue || undefined,
      type: typeFilter !== 'all' ? typeFilter : undefined,
      availability: availabilityFilter !== 'all' ? availabilityFilter : undefined,
    }, {
      preserveState: true,
      replace: true,
      onFinish: () => setIsSearching(false),
    });
  };

  const clearFilters = () => {
    setSearchValue('');
    setTypeFilter('all');
    setAvailabilityFilter('all');
    router.get(route('rooms.index'));
  };

  const handlePageChange = (url: string) => {
    router.get(url);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Calculate room statistics
  const roomStats = {
    totalRooms: rooms.total,
    availableRooms: rooms.data.filter(r => r.is_available && r.is_active).length,
    avgPrice: rooms.data.length > 0 ? rooms.data.reduce((sum, r) => sum + r.price_per_night, 0) / rooms.data.length : 0,
  };

  return (
    <Layout>
      <HeroSection/>
     <div className="min-h-screen bg-background text-foreground">
      <Head title="Our Rooms" />
      
      {/* Main Container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-7xl py-20 sm:py-40">
        {/* Statistics Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
              <Building className="h-4 w-4  text-[#F4C2A1]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#F4C2A1]text-[#F4C2A1]">{roomStats.totalRooms}</div>
              <p className="text-xs text-muted-foreground">Available for booking</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Now</CardTitle>
              <Bed className="h-4 w-4 text-[#F4C2A1]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#F4C2A1]">{roomStats.availableRooms}</div>
              <p className="text-xs text-muted-foreground">Ready for booking</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Price</CardTitle>
              <Star className="h-4 w-4 text-[#F4C2A1]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${roomStats.avgPrice.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground">Per night</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters Section */}
        <Card className="mb-8 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Find Your Perfect Room
            </CardTitle>
            <CardDescription>
              Use the filters below to find rooms that match your preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search rooms..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Room Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {roomTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {typeLabels[type] || type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Availability</label>
                <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Rooms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Rooms</SelectItem>
                    <SelectItem value="available">Available Only</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col justify-end space-y-2">
                <Button className='bg-[#F4C2A1] text-black font-semibold' onClick={handleSearch} disabled={isSearching}>
                  <Filter className="h-4 w-4 mr-2" />
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            Showing {rooms.data.length} of {rooms.total} rooms
            {rooms.current_page > 1 && ` (Page ${rooms.current_page} of ${rooms.last_page})`}
          </p>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {rooms.data.map((room) => (
            <Card key={room.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-border">
              {/* Room Image */}
              <div className="relative h-48 bg-muted">
                {room.images && room.images.length > 0 ? (
                  <img
                    src={room.images[0].startsWith('http') ? room.images[0] : `/storage/${room.images[0]}`}
                    alt={room.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Bed className="h-12 w-12" />
                  </div>
                )}

                
                {/* Availability Badge */}
                <div className="absolute top-3 right-3">
                  <Badge 
                    variant={room.is_available ? "default" : "destructive"}
                    className={room.is_available ? "bg-[#F4C2A1]" : ""}
                  >
                    {room.is_available ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
                {/* Room Type + Popular Badge */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  <Badge variant="secondary">
                    {typeLabels[room.type] || room.type}
                  </Badge>

                  {room.is_popular && (
                    <Badge className="bg-red-500 text-white">
                      Popular
                    </Badge>
                  )}
                </div>
                {/* Room Type Badge */}
                <div className="absolute top-3 left-3">
                  <Badge variant="secondary">
                    {typeLabels[room.type] || room.type}
                  </Badge>
                </div>
              </div>

              <CardHeader>
                <CardTitle className="text-xl">{room.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {room.description || 'Comfortable and well-appointed room for your stay.'}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Room Details */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{room.capacity} guests</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bed className="h-4 w-4 text-muted-foreground" />
                    <span>{room.beds} bed{room.beds > 1 ? 's' : ''}</span>
                  </div>
                  {room.size && (
                    <div className="flex items-center gap-1">
                      <Maximize2 className="h-4 w-4 text-muted-foreground" />
                      <span>{room.size}m²</span>
                    </div>
                  )}
                </div>

                {/* Amenities */}
                {room.amenities && room.amenities.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Amenities</h4>
                    <div className="flex flex-wrap gap-1">
                      {room.amenities.slice(0, 6).map((amenity) => (
                        <Badge key={amenity} variant="outline" className="text-xs">
                          <span className="mr-1">
                            {amenityIcons[amenity]}
                          </span>
                          {amenityLabels[amenity] || amenity}
                        </Badge>
                      ))}
                      {room.amenities.length > 6 && (
                        <Badge variant="outline" className="text-xs">
                          +{room.amenities.length - 6} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{formatPrice(room.price_per_night)}</p>
                    <p className="text-sm text-muted-foreground">per night</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4  text-[#F4C2A1]" />
                    <span className="text-sm">4.8</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button 
                  className="w-full bg-[#F4C2A1]" 
                  disabled={!room.is_available}
                  onClick={() => router.get(route('rooms.show', room.id))}
                >
                  {room.is_available ? 'View Details & Book' : 'Currently Unavailable'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {rooms.data.length === 0 && (
          <Card className="text-center py-12 border-border">
            <CardContent>
              <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No rooms found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or filters
              </p>
              <Button onClick={clearFilters}>Clear all filters</Button>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {rooms.last_page > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            {rooms.links.map((link, index) => (
              <Button
                key={index}
                variant={link.active ? "default" : "outline"}
                size="sm"
                disabled={!link.url}
                onClick={() => link.url && handlePageChange(link.url)}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
    </Layout>
  );
}