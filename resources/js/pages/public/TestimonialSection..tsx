import { Card } from "@/components/ui/card";
import { Award, Star } from "lucide-react";

// Testimonials data
const testimonialsData = [
  {
    id: 1,
    initial: "M",
    name: "Maria L.",
    title: "E-commerce Owner",
    location: "Manila",
    testimonial: "Symon transformed my outdated shop into a sleek online store. Sales jumped the same week we launched.",
    rating: 5
  },
  {
    id: 2,
    initial: "J",
    name: "James R.",
    title: "Startup Founder",
    location: "Cebu",
    testimonial: "From idea to live website in record time. Symon nailed the design and the performance is lightning fast.",
    rating: 5
  },
  {
    id: 3,
    initial: "A",
    name: "Anna P.",
    title: "Marketing Director",
    location: "Davao",
    testimonial: "Our site now looks as premium as our brand. Clients keep complimenting how professional it feels.",
    rating: 5
  },
  {
    id: 4,
    initial: "C",
    name: "Carlos V.",
    title: "Travel Agency CEO",
    location: "Baguio",
    testimonial: "Symon built us a booking platform that works perfectly on mobile. We stopped losing clients due to slow responses.",
    rating: 5
  },
  {
    id: 5,
    initial: "R",
    name: "Rachel S.",
    title: "Non-Profit Director",
    location: "Quezon City",
    testimonial: "He made our donation site modern, secure, and easy to manage. Donor engagement is way up.",
    rating: 5
  },
  {
    id: 6,
    initial: "D",
    name: "David K.",
    title: "Restaurant Owner",
    location: "Makati",
    testimonial: "Symon delivered an online ordering system that doubled our takeout sales. Couldn’t be happier.",
    rating: 5
  }
];


// Testimonial type definition
interface Testimonial {
  id: number;
  initial: string;
  name: string;
  title: string;
  location: string;
  testimonial: string;
  rating: number;
}

// Individual testimonial card component
const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => {
  const renderStars = (rating: number) => {
    return "★".repeat(rating);
  };

  return (
    <div
      className="
        bg-[#1A1A1A] border border-[rgba(255,255,255,0.05)] rounded-xl p-6
        hover:scale-[1.02] hover:border-[#F4C2A1]/30 
        transition-all duration-300 cursor-pointer
      "
      dir="ltr"
      style={{ animationDelay: "0ms" }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#F4C2A1] to-[#F4C2A1] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-black font-bold text-sm">
              {testimonial.initial}
            </span>
          </div>
          <div className="min-w-0">
            <h4 className="text-white font-semibold text-sm">
              {testimonial.name}
            </h4>
            <p className="text-[#9D9D9D] text-xs">{testimonial.title}</p>
            <p className="text-[#F4C2A1] text-xs font-medium">
              {testimonial.location}
            </p>
          </div>
        </div>
        <div className="flex text-[#F4C2A1] text-sm flex-shrink-0">
          {renderStars(testimonial.rating)}
        </div>
      </div>
      <p className="text-[#E6E6E6] text-sm leading-relaxed">
        "{testimonial.testimonial}"
      </p>
    </div>
  );
};

// Avatar component for the bottom section
const Avatar = ({ initial }: { initial: string }) => (
  <div className="w-8 h-8 bg-gradient-to-br from-[#F4C2A1] to-[#F4C2A1] rounded-full border-2 border-[#121212] flex items-center justify-center -ms-2 first:ms-0">
    <span className="text-black font-bold text-xs">{initial}</span>
  </div>
);

// Show More Button component
const ShowMoreButton = () => (
  <button className="group inline-flex items-center gap-2 px-6 py-3 bg-[#1A1A1A] border border-[rgba(255,255,255,0.1)] rounded-lg text-white hover:border-[#F4C2A1]/50 hover:bg-[#F4C2A1]/5 transition-all duration-300">
    <span className="font-medium">Show More</span>
    <svg
      className="w-4 h-4 transition-transform duration-300"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M19 9l-7 7-7-7"
      ></path>
    </svg>
  </button>
);

// Section Header component
const SectionHeader = () => (
  <div className="text-center mb-12 sm:mb-16">
    <div className="flex items-center justify-center mb-6 sm:mb-8">
      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#9D9D9D] me-2 sm:me-3"></span>
     <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-gradient-to-r from-[#303030] via-[#303030] to-[#303030] px-4 py-2 text-sm font-medium text-white">
        <Award className="h-4 w-4" color="white" />
       Client Success
    </div>
    </div>
    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 sm:mb-8 leading-tight">
      Real Results from Real Clients
    </h2>
    <p className="text-base sm:text-lg md:text-xl text-[#9D9D9D] max-w-3xl mx-auto leading-relaxed">
      Trusted by businesses worldwide. Here's what our clients say about
      working with us.
    </p>
  </div>
);

// Client Avatars Section component
const ClientAvatarsSection = () => (
  <div className="text-center mt-16 sm:mt-20">
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      <div className="flex gap-[-0.5rem]">
        {testimonialsData.slice(0, 5).map((testimonial) => (
          <Avatar key={testimonial.id} initial={testimonial.initial} />
        ))}
      </div>
      <span className="text-[#F4C2A1] font-semibold text-sm">
        +12 Happy Clients
      </span>
    </div>
  </div>
);

// Main component
const TestimonialsSection = () => {
  return (
    <section
      className="py-20 sm:py-24 md:py-32 px-4 sm:px-6 md:px-4 bg-[#121212]"
      dir="ltr"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {testimonialsData.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <ShowMoreButton />
        </div>
        
        <ClientAvatarsSection />
      </div>
    </section>
  );
};

export default TestimonialsSection;