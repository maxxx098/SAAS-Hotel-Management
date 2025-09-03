import React from "react";
import { Button } from "@/components/ui/button";
import { Award, Calendar, Hotel } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative h-[80vh] flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-3xl px-6">
        <div className="flex items-center justify-center gap-2 mb-4">
         <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-gradient-to-r from-[#303030] via-[#303030] to-[#303030] px-4 py-2 text-sm font-medium text-white">
          OASIS HOTEL MANAGEMENT
         </div>
        </div>

        <h1 className="text-4xl md:text-6xl mt-3 pt-5 font-bold mb-4 ">
          HOME / <span className="text-[#F4C2A1]">ROOMS</span>
        </h1>

        <div className="flex justify-center pt-3 gap-4">
          <Button size="lg" className="bg-[#F4C2A1] text-black font-semibold">
            Book Now
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-white border-white hover:bg-white/10"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Check Availability
          </Button>
        </div>
      </div>
    </section>
  );
}
