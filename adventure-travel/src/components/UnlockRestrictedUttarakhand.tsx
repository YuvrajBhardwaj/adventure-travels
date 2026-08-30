"use client";

import Link from "next/link";
import { treks, DIFFICULTY_COLORS } from "@/data/treks";
import { FadeUp, StaggerContainer, StaggerItem } from "./MotionWrapper";
import SmartImage from "./SmartImage";

const PERKS = [
  "ILP / permit handled by us",
  "India–Tibet frontier zone",
  "Zero crowds, raw wilderness",
];

export default function UnlockRestrictedUttarakhand() {
  const restricted = treks.filter((t) => t.permitTour);

  return (
    <section className="relative overflow-hidden bg-[#0F172A] py-section text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute -bottom-24 right-1/5 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <FadeUp>
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-amber-400" aria-hidden />
              <span className="font-nav text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
                ILP-RESTRICTED · BY PERMIT ONLY
              </span>
            </div>
            <h2 className="mt-4 font-heading text-3xl font-bold leading-tight sm:text-4xl md:text-display-lg">
              Unlock Restricted Uttarakhand
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
              The rawest, most remote corners of the Indian Himalayas sit in
              the ILP-restricted Indo–Tibet frontier zone. We handle the
              permits, you walk a land very few ever see.
            </p>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="grid gap-2 sm:grid-cols-3 md:grid-cols-1">
              {PERKS.map((p) => (
                <div
                  key={p}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-sm"
                >
                  <svg
                    className="h-3.5 w-3.5 flex-shrink-0 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    aria-hidden
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {p}
                </div>
              ))}
            </div>
          </FadeUp>
        </div>

        <StaggerContainer
          className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          staggerDelay={0.08}
        >
          {restricted.map((trek) => (
            <StaggerItem key={trek.id}>
              <Link
                href={`/treks/${trek.slug}`}
                className="group block overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-emerald-400/40 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <SmartImage
                    src={trek.image}
                    alt={trek.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <span
                    className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold text-white"
                    style={{ backgroundColor: DIFFICULTY_COLORS[trek.difficulty] }}
                  >
                    {trek.difficulty}
                  </span>
                  <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-300 backdrop-blur-sm">
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    permit
                  </span>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
                      {trek.region} · {trek.days} Days ·{" "}
                      {trek.maxAltitude.toLocaleString("en-IN")} m
                    </p>
                    <h3 className="mt-1 font-heading text-xl font-bold leading-tight">
                      {trek.name}
                    </h3>
                  </div>
                </div>
                <div className="p-5">
                  <p className="line-clamp-2 text-sm leading-relaxed text-white/60">
                    {trek.blurb}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                    <span className="text-sm font-bold text-white">
                      {trek.currency}
                      {trek.price.toLocaleString("en-IN")}
                      <span className="font-normal text-white/50"> / person</span>
                    </span>
                    <span className="text-xs font-semibold text-emerald-400 group-hover:underline">
                      Explore →
                    </span>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeUp delay={0.1}>
          <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-amber-400/20 bg-gradient-to-r from-emerald-500/10 via-transparent to-amber-500/10 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="text-sm leading-relaxed text-white/70">
              <span className="font-bold text-amber-300">Permit handled by us.</span>{" "}
              These are frontier-zone expeditions — not open treks. Limited
              seats, so availability is confirmed on request.
            </p>
            <Link
              href="/contact"
              className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#0F172A] transition-all hover:bg-amber-300 hover:-translate-y-0.5"
            >
              Request a permit
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
