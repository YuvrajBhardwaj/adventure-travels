"use client";

import Link from "next/link";
import { treks, DIFFICULTY_COLORS } from "@/data/treks";
import { FadeUp, StaggerContainer, StaggerItem } from "./MotionWrapper";
import SmartImage from "./SmartImage";

export default function SummerTreksRail() {
  return (
    <section className="relative bg-gradient-to-b from-background to-emerald-50/40 py-section">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeUp>
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-primary" aria-hidden />
            <span className="font-nav text-xs font-bold uppercase tracking-[0.3em] text-primary">
              JAN – DEC · TREKS
            </span>
          </div>
          <h2 className="mt-4 font-heading text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-display-lg">
            Trek the range in bloom
          </h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            18 treks across Uttarakhand &amp; Himachal Pradesh — filtered by
            difficulty, region, and real elevation profiles.
          </p>
          <Link
            href="/treks"
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            Explore all treks
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </FadeUp>

        <StaggerContainer
          className="mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          staggerDelay={0.06}
        >
          {treks.slice(0, 8).map((trek) => (
            <StaggerItem
              key={trek.id}
              className="min-w-[300px] snap-start sm:min-w-[340px]"
            >
              <Link
                href={`/treks/${trek.slug}`}
                className="group block overflow-hidden rounded-3xl border border-foreground/10 bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <SmartImage
                    src={trek.image}
                    alt={trek.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <span
                    className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold text-white"
                    style={{ backgroundColor: DIFFICULTY_COLORS[trek.difficulty] }}
                  >
                    {trek.difficulty}
                  </span>
                </div>
                <div className="p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                    {trek.region} · {trek.days} Days ·{" "}
                    {trek.maxAltitude.toLocaleString("en-IN")} m
                  </p>
                  <h3 className="mt-2 font-heading text-lg font-bold leading-tight text-foreground">
                    {trek.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
                    {trek.blurb}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-foreground/10 pt-3">
                    <span className="text-sm font-bold text-foreground">
                      {trek.currency}
                      {trek.price.toLocaleString("en-IN")}
                      <span className="font-normal text-muted"> / person</span>
                    </span>
                    <span className="text-xs font-semibold text-primary group-hover:underline">
                      Explore →
                    </span>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
