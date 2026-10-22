"use client";

import { useState } from "react";
import Link from "next/link";
import ContactPopup from "./ContactPopup";
import { FadeUp } from "./MotionWrapper";
import { ElevationLine } from "@/components/ElevationLine";
import { treks } from "@/data/treks";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CallToActionV2() {
  const [showPopup, setShowPopup] = useState(false);
  // The page ends on the profile of our highest route, running into the footer.
  const highest = [...treks].sort((a, b) => b.maxAltitude - a.maxAltitude)[0];

  return (
    <>
      <section className="relative overflow-hidden bg-card pt-20 md:pt-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <h2 className="max-w-5xl font-heading text-5xl font-medium leading-[1.0] tracking-[-0.03em] text-foreground sm:text-6xl lg:text-8xl">
              Your Next Himalayan Adventure Starts Today
            </h2>
          </FadeUp>

          <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
            <p className="max-w-xl text-base leading-relaxed text-muted sm:text-lg lg:col-span-6">
              Choose from our carefully curated collection of treks, each offering unique experiences and unforgettable
              memories in the Indian Himalayas.
            </p>

            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-6 lg:col-span-6 lg:justify-end">
              <Link
                href="/treks"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-cta px-8 text-navy shadow-none hover:bg-orange-400 hover:shadow-none"
                )}
              >
                Explore Adventures
              </Link>
              <button
                type="button"
                onClick={() => setShowPopup(true)}
                className="inline-flex min-h-11 items-center text-sm font-semibold text-foreground underline decoration-foreground/30 decoration-2 underline-offset-[6px] transition-colors duration-150 ease-out hover:text-primary hover:decoration-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Talk to an Expert
              </button>
            </div>
          </div>

          <ul className="font-nav mt-10 flex flex-wrap gap-x-6 gap-y-1 border-t border-foreground/15 pt-4 text-sm text-muted">
            <li>100% Safe</li>
            <li>4.9+ Rating</li>
            <li>Expert Guides</li>
          </ul>
        </div>

        <div className="mt-10 h-24 text-emerald-500 md:h-36" aria-hidden>
          <ElevationLine profile={highest.elevationProfile} peak strokeWidth={1.5} />
        </div>
      </section>

      <ContactPopup open={showPopup} onClose={() => setShowPopup(false)} />
    </>
  );
}
