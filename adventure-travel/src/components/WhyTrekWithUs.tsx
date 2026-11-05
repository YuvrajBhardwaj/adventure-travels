"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { BadgeCheck, BriefcaseMedical, CloudSun, FileCheck2, HeartPulse, Users, type LucideIcon } from "lucide-react";
import { FadeUp, useDeferredReveal } from "./MotionWrapper";
import { DURATION, EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

// Each point restates something already promised in the FAQ or booking-process copy.
const POINTS: { title: string; text: string; Icon: LucideIcon }[] = [
  {
    Icon: BadgeCheck,
    title: "Licensed local guides",
    text: "Guides from the region you're walking through, not a rotating roster of contractors.",
  },
  {
    Icon: HeartPulse,
    title: "Altitude-safe by design",
    text: "Acclimatization days are built into every itinerary above 3,000 m, and guides are trained to recognise AMS.",
  },
  {
    Icon: BriefcaseMedical,
    title: "Emergency kit on hard routes",
    text: "A Gamow bag and pulse oximeter travel with every Challenging route.",
  },
  {
    Icon: FileCheck2,
    title: "Permits sorted for you",
    text: "National park and inner-line permits are handled before you reach the trailhead.",
  },
  {
    Icon: CloudSun,
    title: "Buffer days for weather",
    text: "Spare days are built in, because mountain weather doesn't follow the itinerary.",
  },
  {
    Icon: Users,
    title: "Private departures",
    text: "Groups of 2 or more can book a private departure with pacing and rest days adjusted.",
  },
];

const tile: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.97, transition: { duration: 0 } },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: DURATION.slow, ease: EASE.out } },
};

export default function WhyTrekWithUs() {
  const { ref, state } = useDeferredReveal<HTMLOListElement>("-60px");
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

        {/* Phones and tablets: icon tiles (first and last run full width on phones); desktop: a numbered, ruled list */}
        <motion.ol
          ref={ref}
          initial={false}
          animate={state}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:col-span-7 lg:block lg:border-t lg:border-foreground/20"
        >
          {POINTS.map(({ title, text, Icon }, i) => (
            <motion.li
              key={title}
              variants={tile}
              className={cn(
                "flex flex-col rounded-2xl bg-background p-4 ring-1 ring-foreground/[0.07] sm:p-5",
                "lg:grid lg:grid-cols-[3.5rem_1fr] lg:gap-x-6 lg:gap-y-1 lg:rounded-none lg:border-b lg:border-foreground/15 lg:bg-transparent lg:p-0 lg:py-7 lg:ring-0",
                (i === 0 || i === POINTS.length - 1) && "col-span-2 sm:col-span-1"
              )}
            >
              <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 lg:hidden">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <span aria-hidden className="hidden font-heading text-3xl font-normal tabular-nums leading-none text-foreground/25 lg:block">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="mt-3 lg:mt-0">
                <h3 className="font-heading text-[17px] font-medium leading-snug tracking-[-0.01em] text-foreground sm:text-lg lg:text-2xl lg:leading-tight lg:tracking-[-0.015em]">
                  {title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted sm:text-sm lg:mt-2 lg:max-w-lg lg:text-base">{text}</p>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
