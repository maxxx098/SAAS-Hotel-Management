import Layout from '@/components/layout';
import { ArrowRight, Award, CheckCircle, ChevronRight, Crown, MapPin, PlayCircle, Sparkles, Star } from 'lucide-react';
import { useState } from 'react';
import TestimonialsSection from './TestimonialSection.';
import HeroSection from './HeroSection';
import { AboutSection } from './AboutSection';
import BookingWidget from './BookingWidget';
import RoomsSection from './RoomsSection';
import FacilitiesSection from './FacilitiesSection';
import { DiningSection } from './DiningSection';
import { ConnectSection } from './ConnectSection';
import { VenuesSection } from './VenuesSection';
import Culture from './Culture';

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

export default function PremiumHotelLanding({ rooms, filters, roomTypes }: RoomsPageProps) {

    return (
        <Layout>
            <div className="min-h-screen bg-white text-zinc-900 font-sans antialiased selection:bg-zinc-900 selection:text-white">
                {/* Hero Section */}
                <HeroSection/>
                {/* Features Section */}
               <div className='relative px-6'>
                <BookingWidget/>
               </div>
               <FacilitiesSection/>
               <Culture/>
               <TestimonialsSection/>
            </div>
        </Layout>
    );
}
