"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { treks } from "@/data/treks";
import { FadeUp } from "./MotionWrapper";
import { TrekPhotoCard } from "./SummerTreksRail";
import { SwipeRail, RailItem } from "./SwipeRail";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PERKS = [
  "ILP / permit handled by us",
  "India–Tibet frontier zone",
  "Zero crowds, raw wilderness",
];

/** The page's one navy band. */
export default function UnlockRestrictedUttarakhand() {
  const restricted = treks.filter((t) => t.permitTour);

  return (
    <section className="relative bg-navy py-20 text-white md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-16">
            <div className="lg:col-span-7">
              <h2 className="font-heading text-4xl font-medium leading-[1.04] tracking-[-0.025em] sm:text-5xl lg:text-6xl">
                Unlock Restricted Uttarakhand
              </h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
                Some of the most remote corners of the Indian Himalayas sit in the ILP-restricted Indo–Tibet frontier
                zone. We handle the permits; you walk country that few trekkers ever reach.
              </p>
            </div>

            <div className="lg:col-span-5">
              <p className="font-nav text-xs font-semibold tracking-[0.12em] text-amber-300">ILP-RESTRICTED · BY PERMIT ONLY</p>
              <ul className="mt-3 flex flex-wrap gap-2 lg:block lg:border-t lg:border-white/20">
                {PERKS.map((p) => (
                  <li
                    key={p}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/85 ring-1 ring-white/15 lg:flex lg:rounded-none lg:border-b lg:border-white/15 lg:bg-transparent lg:px-0 lg:py-3 lg:text-sm lg:ring-0"
                  >
                    <Check className="h-3.5 w-3.5 text-amber-300 lg:hidden" aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </FadeUp>

        <SwipeRail label="Permit-only expeditions" tone="dark" className="mt-12 lg:mt-14" desktop="lg:grid lg:grid-cols-3 lg:gap-x-6 lg:gap-y-12">
          {restricted.map((trek) => (
            <RailItem key={trek.id}>
              <TrekPhotoCard trek={trek} dark />
            </RailItem>
          ))}
        </SwipeRail>

        <FadeUp delay={0.1}>
          <div className="mt-14 flex flex-col gap-5 border-t border-white/20 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-base leading-relaxed text-white/75">
              <span className="font-semibold text-amber-300">Permit handled by us.</span>{" "}
              These are frontier-zone expeditions, not open treks. Limited seats, so availability is confirmed on request.
            </p>
            <Link
              href="/contact"
              className={cn(buttonVariants({ size: "lg" }), "shrink-0 px-6 focus-visible:ring-offset-navy")}
            >
              Request a permit
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
