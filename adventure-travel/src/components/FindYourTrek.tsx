"use client";

import Link from "next/link";
import { treks, DIFFICULTY_COLORS, REGIONS } from "@/data/treks";
import { FadeUp, StaggerContainer, StaggerItem } from "./MotionWrapper";
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

const regionStats = REGIONS.filter((r) => r !== "All Regions").map((region) => ({
  region,
  count: treks.filter((t) => t.region === region).length,
}));

export default function FindYourTrek() {
  return (
    <section className="relative bg-background py-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-primary" aria-hidden />
            <span className="font-nav text-xs font-bold uppercase tracking-[0.3em] text-primary">
              FIND YOUR TREK
            </span>
          </div>
          <h2 className="mt-4 font-heading text-3xl font-bold leading-tight text-foreground tracking-[-0.02em] sm:text-4xl">
            Which trek is right for you?
          </h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Start with how much mountain experience you have. We&apos;ll show only the routes that fit.
          </p>
        </FadeUp>

        <StaggerContainer className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={0.07}>
          {levelStats.map((l) => (
            <StaggerItem key={l.difficulty}>
              <Link
                href={`/treks?difficulty=${encodeURIComponent(l.difficulty)}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-card shadow-sm transition-[transform,border-color,background-color] duration-200 ease-out hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0 hover:shadow-lg hover:shadow-black/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span aria-hidden className="h-1.5 w-full" style={{ backgroundColor: DIFFICULTY_COLORS[l.difficulty] }} />
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <span
                    className="inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
                    style={{ backgroundColor: DIFFICULTY_COLORS[l.difficulty] }}
                  >
                    {l.difficulty}
                  </span>
                  <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">{l.label}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{l.blurb}</p>

                  <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-foreground/10 pt-4 text-sm">
                    <div>
                      <dt className="text-[11px] uppercase tracking-wider text-muted">Duration</dt>
                      <dd className="font-semibold text-foreground">
                        {l.minDays === l.maxDays ? `${l.minDays} days` : `${l.minDays}–${l.maxDays} days`}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] uppercase tracking-wider text-muted">Up to</dt>
                      <dd className="font-semibold text-foreground">{l.maxAltitude.toLocaleString("en-IN")} m</dd>
                    </div>
                  </dl>

                  <p className="mt-4 flex items-center justify-between text-sm font-semibold text-primary">
                    <span>
                      {l.count} {l.count === 1 ? "trek" : "treks"} · from <Price inr={l.fromPrice} />
                    </span>
                    <span aria-hidden className="transition-transform duration-150 ease-out group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">
                      →
                    </span>
                  </p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeUp delay={0.1}>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="text-sm text-muted">Or browse by region:</span>
            {regionStats.map((r) => (
              <Link
                key={r.region}
                href={`/treks?region=${encodeURIComponent(r.region)}`}
                className="inline-flex min-h-11 items-center gap-1 rounded-full border border-foreground/15 bg-card px-4 text-sm font-medium text-foreground transition-colors duration-150 ease-out hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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
