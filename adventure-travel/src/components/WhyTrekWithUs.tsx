"use client";

import Link from "next/link";
import { FadeUp } from "./MotionWrapper";

// Each point restates something already promised in the FAQ or booking-process copy.
const POINTS: { title: string; text: string }[] = [
  {
    title: "Licensed local guides",
    text: "Guides from the region you're walking through — not a rotating roster of contractors.",
  },
  {
    title: "Altitude-safe by design",
    text: "Acclimatization days are built into every itinerary above 3,000 m, and guides are trained to recognise AMS.",
  },
  {
    title: "Emergency kit on hard routes",
    text: "A Gamow bag and pulse oximeter travel with every Challenging route.",
  },
  {
    title: "Permits sorted for you",
    text: "National park and inner-line permits are handled before you reach the trailhead.",
  },
  {
    title: "Buffer days for weather",
    text: "We plan for the mountain, not just the itinerary — spare days are built in.",
  },
  {
    title: "Private departures",
    text: "Groups of 2 or more can book a private departure with pacing and rest days adjusted.",
  },
];

export default function WhyTrekWithUs() {
  return (
    <section className="relative bg-card py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
        <FadeUp className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <p className="sr-only">WHY TREK WITH US</p>
            <h2 className="font-heading text-4xl font-medium leading-[1.04] tracking-[-0.025em] text-foreground sm:text-5xl lg:text-6xl">
              Built around safety, not shortcuts
            </h2>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-muted sm:text-lg">
              The Himalaya rewards preparation. Here&apos;s what&apos;s already taken care of before you lace up.
            </p>
            <Link
              href="/faq"
              className="mt-4 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-foreground underline decoration-primary decoration-2 underline-offset-[6px] transition-colors duration-150 ease-out hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Read how we handle altitude, permits and more →
            </Link>
          </div>
        </FadeUp>

        <ol className="border-t border-foreground/20 lg:col-span-7">
          {POINTS.map(({ title, text }, i) => (
            <li key={title} className="grid gap-x-6 gap-y-1 border-b border-foreground/15 py-6 sm:grid-cols-[3.5rem_1fr] sm:py-7">
              <span aria-hidden className="font-heading text-3xl font-normal tabular-nums leading-none text-foreground/25">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-heading text-2xl font-medium leading-tight tracking-[-0.015em] text-foreground">{title}</h3>
                <p className="mt-2 max-w-lg text-base leading-relaxed text-muted">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
