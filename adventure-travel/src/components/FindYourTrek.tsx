"use client";

import Link from "next/link";
import { treks, REGIONS } from "@/data/treks";
import { FadeUp } from "./MotionWrapper";
import Price from "@/components/Price";

// Copy mirrors the FAQ: Easy/Moderate need no prior experience; Challenging/Strenuous
// cross passes above 4,500 m and want multi-day hiking experience.
const LEVELS = [
  { difficulty: "Easy", label: "First Himalayan trek", blurb: "No experience needed — reasonable fitness is enough." },
  { difficulty: "Moderate", label: "Some hiking behind you", blurb: "No experience needed — steady days with a few big climbs." },
  { difficulty: "Challenging", label: "Confident trekker", blurb: "High passes above 4,500 m. Multi-day hiking experience recommended." },
  { difficulty: "Strenuous", label: "High-altitude veteran", blurb: "Our hardest routes. Strong multi-day hiking experience expected." },
] as const;

// Everything below is derived from the same data as the trek pages, so it can't drift.
const levelStats = LEVELS.map((level) => {
  const group = treks.filter((t) => t.difficulty === level.difficulty);
  return {
    ...level,
    count: group.length,
    fromPrice: group.length ? Math.min(...group.map((t) => t.price)) : 0,
    minDays: group.length ? Math.min(...group.map((t) => t.days)) : 0,
    maxDays: group.length ? Math.max(...group.map((t) => t.days)) : 0,
    maxAltitude: group.length ? Math.max(...group.map((t) => t.maxAltitude)) : 0,
  };
}).filter((l) => l.count > 0);

const topAltitude = Math.max(...levelStats.map((l) => l.maxAltitude), 1);

const regionStats = REGIONS.filter((r) => r !== "All Regions").map((region) => ({
  region,
  count: treks.filter((t) => t.region === region).length,
}));

// Difficulty is a staircase, not four colours: on desktop each step stands higher than the last.
const STEP_HEIGHT = [
  "lg:min-h-[21rem] lg:bg-foreground/[0.02]",
  "lg:min-h-[24rem] lg:bg-foreground/[0.035]",
  "lg:min-h-[27rem] lg:bg-foreground/[0.05]",
  "lg:min-h-[30rem] lg:bg-foreground/[0.065]",
];

export default function FindYourTrek() {
  return (
    <section className="relative bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <p className="sr-only">FIND YOUR TREK</p>
          <h2 className="max-w-3xl font-heading text-4xl font-medium leading-[1.04] tracking-[-0.025em] text-foreground sm:text-5xl lg:text-6xl">
            Which trek is right for you?
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
            Start with how much mountain experience you have. We&apos;ll show only the routes that fit.
          </p>
        </FadeUp>

        <ol className="mt-12 grid border-t border-foreground/20 lg:mt-16 lg:grid-cols-4 lg:items-end lg:border-t-0">
          {levelStats.map((l, i) => (
            <li key={l.difficulty} className="contents">
              <Link
                href={`/treks?difficulty=${encodeURIComponent(l.difficulty)}`}
                className={`group relative flex flex-col border-b border-foreground/15 py-7 transition-colors duration-150 ease-out hover:bg-foreground/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none lg:border-b-0 lg:border-t-2 lg:border-t-foreground lg:px-6 lg:pb-8 lg:pt-6 ${STEP_HEIGHT[i] ?? ""}`}
              >
                <span className="font-heading text-4xl font-medium leading-none tracking-[-0.02em] text-foreground sm:text-5xl">
                  {l.difficulty}
                </span>
                <h3 className="font-nav mt-3 text-sm font-medium text-foreground">{l.label}</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">{l.blurb}</p>

                <dl className="mt-6 flex gap-8">
                  <div>
                    <dt className="font-nav text-[11px] uppercase tracking-[0.14em] text-muted">Duration</dt>
                    <dd className="mt-1 font-heading text-2xl tabular-nums text-foreground">
                      {l.minDays === l.maxDays ? `${l.minDays} days` : `${l.minDays}–${l.maxDays} days`}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-nav text-[11px] uppercase tracking-[0.14em] text-muted">Up to</dt>
                    <dd className="mt-1 font-heading text-2xl tabular-nums text-foreground">
                      {l.maxAltitude.toLocaleString("en-IN")} m
                    </dd>
                  </div>
                </dl>

                {/* altitude bar: the highest point of this level, against our highest overall */}
                <div className="mt-5 h-px bg-foreground/15" aria-hidden>
                  <div className="h-[3px] -translate-y-px bg-primary" style={{ width: `${Math.round((l.maxAltitude / topAltitude) * 100)}%` }} />
                </div>

                <p className="mt-auto flex items-center justify-between gap-3 pt-6 text-sm text-foreground">
                  <span>
                    {l.count} {l.count === 1 ? "trek" : "treks"} · from <Price inr={l.fromPrice} />
                  </span>
                  <span aria-hidden className="text-primary transition-transform duration-150 ease-out group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">
                    →
                  </span>
                </p>
              </Link>
            </li>
          ))}
        </ol>

        <FadeUp delay={0.1}>
          <div className="mt-10 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="mr-2 text-sm text-muted">Or browse by region:</span>
            {regionStats.map((r) => (
              <Link
                key={r.region}
                href={`/treks?region=${encodeURIComponent(r.region)}`}
                className="inline-flex min-h-11 items-center gap-1 px-2 text-sm font-medium text-foreground underline decoration-foreground/25 underline-offset-4 transition-colors duration-150 ease-out hover:text-primary hover:decoration-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {r.region} <span className="text-muted">({r.count})</span>
              </Link>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
