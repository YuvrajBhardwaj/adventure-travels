"use client";

import Link from "next/link";
import { CloudSun, FileCheck2, HeartPulse, MountainSnow, UserCheck, Users, type LucideIcon } from "lucide-react";
import { FadeUp, StaggerContainer, StaggerItem } from "./MotionWrapper";

// Each point restates something already promised in the FAQ or booking-process copy.
const POINTS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: UserCheck,
    title: "Licensed local guides",
    text: "Guides from the region you're walking through — not a rotating roster of contractors.",
  },
  {
    icon: MountainSnow,
    title: "Altitude-safe by design",
    text: "Acclimatization days are built into every itinerary above 3,000 m, and guides are trained to recognise AMS.",
  },
  {
    icon: HeartPulse,
    title: "Emergency kit on hard routes",
    text: "A Gamow bag and pulse oximeter travel with every Challenging route.",
  },
  {
    icon: FileCheck2,
    title: "Permits sorted for you",
    text: "National park and inner-line permits are handled before you reach the trailhead.",
  },
  {
    icon: CloudSun,
    title: "Buffer days for weather",
    text: "We plan for the mountain, not just the itinerary — spare days are built in.",
  },
  {
    icon: Users,
    title: "Private departures",
    text: "Groups of 2 or more can book a private departure with pacing and rest days adjusted.",
  },
];

export default function WhyTrekWithUs() {
  return (
    <section className="relative bg-background py-section">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeUp>
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-primary" aria-hidden />
            <span className="font-nav text-xs font-bold uppercase tracking-[0.3em] text-primary">
              WHY TREK WITH US
            </span>
          </div>
          <h2 className="mt-4 max-w-2xl font-heading text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-display-lg">
            Built around safety, not shortcuts
          </h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            The Himalaya rewards preparation. Here&apos;s what&apos;s already taken care of before you lace up.
          </p>
        </FadeUp>

        <StaggerContainer className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.06}>
          {POINTS.map(({ icon: Icon, title, text }) => (
            <StaggerItem key={title}>
              <div className="h-full rounded-3xl border border-foreground/10 bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="mt-5 font-heading text-lg font-bold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeUp delay={0.1}>
          <Link
            href="/faq"
            className="mt-8 inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            Read how we handle altitude, permits and more →
          </Link>
        </FadeUp>
      </div>
    </section>
  );
}
