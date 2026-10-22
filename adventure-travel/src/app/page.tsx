"use client";

import dynamic from "next/dynamic";
import SeasonSplitHero from "@/components/SeasonSplitHero";
import StatsStrip from "@/components/StatsStrip";
import FindYourTrek from "@/components/FindYourTrek";
import WhyTrekWithUs from "@/components/WhyTrekWithUs";
import HowItWorks from "@/components/HowItWorks";
import SnowSchool from "@/components/SnowSchool";
import CampingSection from "@/components/CampingSection";
import VideoShowcase from "@/components/VideoShowcase";
import StoriesTestimonials from "@/components/StoriesTestimonials";
import HimalayanMap from "@/components/HimalayanMap";
import CallToActionV2 from "@/components/CallToActionV2";
import UnlockRestrictedUttarakhand from "@/components/UnlockRestrictedUttarakhand";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import MobileSearchButton from "@/components/MobileSearchButton";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import WelcomeChooser from "@/components/WelcomeChooser";
import { Skeleton } from "@/components/ui/skeleton";

const FAQV2 = dynamic(() => import("@/components/FAQV2"), {
  loading: () => (
    <div className="bg-background py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        <Skeleton className="h-40 rounded-2xl lg:col-span-4" />
        <Skeleton className="h-64 rounded-2xl lg:col-span-8" />
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <SmoothScrollProvider>
      <main className="relative overflow-x-hidden">
        <SeasonSplitHero />
        <div className="relative z-10">
          <WelcomeChooser />
          <StatsStrip />
          <FindYourTrek />
          <SnowSchool />
          <WhyTrekWithUs />
          <CampingSection />
          <StoriesTestimonials />
          <VideoShowcase />
          <HimalayanMap />
          <UnlockRestrictedUttarakhand />
          <HowItWorks />
          <FAQV2 />
          <CallToActionV2 />
        </div>
        <FloatingWhatsApp />
        <MobileSearchButton />
      </main>
    </SmoothScrollProvider>
  );
}
