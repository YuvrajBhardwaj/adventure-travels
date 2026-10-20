"use client";

import { useState } from "react";
import Link from "next/link";
import ContactPopup from "./ContactPopup";
import { FadeUp, ScaleIn } from "./MotionWrapper";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CallToActionV2() {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <>
      <section className="py-section-sm px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ScaleIn>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-mesh p-8 text-center sm:p-12 md:p-16">
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-secondary" />

              {/* Decorative Elements */}
              <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-white/10 blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white/10 blur-[120px] pointer-events-none" />

              {/* Rotating Rings */}
              <div className="absolute -top-20 -right-20 h-40 w-40 animate-spin-slow rounded-full border border-white/10 motion-reduce:animate-none" />
              <div className="absolute -bottom-10 -left-10 h-32 w-32 animate-spin-slow rounded-full border border-white/10 [animation-direction:reverse] [animation-duration:25s] motion-reduce:animate-none" />

              {/* Mountain Silhouette */}
              <div className="absolute bottom-0 left-0 right-0 h-20 opacity-10">
                <svg viewBox="0 0 1440 200" preserveAspectRatio="none" className="w-full h-full">
                  <path d="M0,200 L0,120 Q200,40 400,100 Q600,20 800,80 Q1000,10 1200,70 Q1400,30 1440,60 L1440,200 Z" fill="white" />
                </svg>
              </div>

              <div className="relative z-10">
                <FadeUp delay={0.1}>
                  <h2 className="mx-auto max-w-3xl font-heading text-3xl font-bold leading-tight tracking-[-0.02em] text-white sm:text-4xl">
                    Your Next Himalayan Adventure Starts Today
                  </h2>
                </FadeUp>

                <FadeUp delay={0.2}>
                  <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
                    Choose from our carefully curated collection of treks, each offering unique experiences and unforgettable memories in the Indian Himalayas.
                  </p>
                </FadeUp>

                <FadeUp delay={0.3}>
                  <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link
                      href="/treks"
                      className={cn(
                        buttonVariants({ size: "lg" }),
                        "bg-white px-8 text-emerald-700 shadow-xl shadow-emerald-950/20 hover:bg-emerald-50 hover:shadow-xl focus-visible:ring-white focus-visible:ring-offset-emerald-600"
                      )}
                    >
                      Explore Adventures
                    </Link>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setShowPopup(true)}
                      className="border-white/40 bg-white/10 px-8 text-white backdrop-blur-sm hover:border-white/60 hover:bg-white/20 focus-visible:ring-white focus-visible:ring-offset-emerald-600"
                    >
                      Talk to an Expert
                    </Button>
                  </div>
                </FadeUp>

                <FadeUp delay={0.4}>
                  <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-white/80">
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      100% Safe
                    </span>
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                      </svg>
                      4.9+ Rating
                    </span>
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                      </svg>
                      Expert Guides
                    </span>
                  </div>
                </FadeUp>
              </div>
            </div>
          </ScaleIn>
        </div>
      </section>

      <ContactPopup open={showPopup} onClose={() => setShowPopup(false)} />
    </>
  );
}
