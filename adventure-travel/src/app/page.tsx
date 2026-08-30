"use client";

import dynamic from "next/dynamic";
import SeasonSplitHero from "@/components/SeasonSplitHero";
import StatsStrip from "@/components/StatsStrip";
import SummerTreksRail from "@/components/SummerTreksRail";
import SnowSchool from "@/components/SnowSchool";
import VideoShowcase from "@/components/VideoShowcase";
import StoriesTestimonials from "@/components/StoriesTestimonials";
import HimalayanMap from "@/components/HimalayanMap";
import CallToActionV2 from "@/components/CallToActionV2";
import UnlockRestrictedUttarakhand from "@/components/UnlockRestrictedUttarakhand";
import FooterV2 from "@/components/FooterV2";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import MobileSearchButton from "@/components/MobileSearchButton";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";

const FAQV2 = dynamic(() => import("@/components/FAQV2"), {
  loading: () => (
    <div className="py-section bg-background/70 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6">
        <div className="h-64 skeleton rounded-2xl" />
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <SmoothScrollProvider>
      <main className="relative overflow-x-hidden">
        <SeasonSplitHero />
        <div className="relative z-10 pb-24 md:pb-0">
          <StatsStrip />
          <SummerTreksRail />
          <SnowSchool />
          <VideoShowcase />
          <StoriesTestimonials />
          <HimalayanMap />
          <UnlockRestrictedUttarakhand />
          <FAQV2 />
          <CallToActionV2 />
          <FooterV2 />
        </div>
        <FloatingWhatsApp />
        <MobileSearchButton />
      </main>
    </SmoothScrollProvider>
  );
}
