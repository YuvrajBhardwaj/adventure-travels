"use client";

import Link from "next/link";
import { byPopularity, type Trek } from "@/data/treks";
import { FadeUp } from "./MotionWrapper";
import SmartImage from "./SmartImage";
import NoPhoto from "./NoPhoto";
import Price from "@/components/Price";
import { ElevationLine } from "@/components/ElevationLine";

/**
 * Photo-first trek card: the whole card is the link. Name sits on the photo, days and altitude are
 * the big numerals, the strip is the trek's real altitude profile, and the price is a quiet line.
 * `dark` is for navy bands (the text under the photo turns light).
 */
export function TrekPhotoCard({ trek, dark = false }: { trek: Trek; dark?: boolean }) {
  return (
    <Link
      href={`/treks/${trek.slug}`}
      className="group flex h-full flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-navy">
        {trek.image ? (
          <SmartImage
            src={trek.image}
            alt={trek.name}
            className="absolute inset-0 z-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <NoPhoto className="absolute inset-0 h-full w-full" />
        )}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy-deep/25 to-transparent" />
        <div aria-hidden className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-navy-deep/60 to-transparent" />
        <p className="font-nav absolute left-4 top-4 text-[11px] font-medium uppercase tracking-[0.16em] text-white/90">
          {trek.difficulty}
        </p>
        {trek.permitTour && (
          <p className="font-nav absolute right-4 top-4 text-[11px] font-medium uppercase tracking-[0.16em] text-amber-300">permit</p>
        )}
        <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
          <p className="font-nav text-[11px] font-medium uppercase tracking-[0.16em] text-white/70">{trek.region}</p>
          <h3 className="mt-1 font-heading text-2xl font-medium leading-[1.1] tracking-[-0.015em]">{trek.name}</h3>
          <p className="font-nav mt-3 flex items-baseline gap-5 tabular-nums">
            <span>
              <span className="font-heading text-3xl leading-none">{trek.days}</span>
              <span className="ml-1 text-xs text-white/70">Days</span>
            </span>
            <span>
              <span className="font-heading text-3xl leading-none">{trek.maxAltitude.toLocaleString("en-IN")}</span>
              <span className="ml-1 text-xs text-white/70">m</span>
            </span>
          </p>
          <div className="mt-2 h-9 text-emerald-300" aria-hidden>
            <ElevationLine profile={trek.elevationProfile} peak strokeWidth={1.25} />
          </div>
        </div>
      </div>
      <div className="pt-4">
        <p className={`line-clamp-2 text-sm leading-relaxed ${dark ? "text-white/65" : "text-muted"}`}>{trek.blurb}</p>
        <p className={`mt-3 flex items-center justify-between gap-3 text-sm ${dark ? "text-white" : "text-foreground"}`}>
          <span>
            <Price inr={trek.price} />
            <span className={dark ? "text-white/55" : "text-muted"}> / person</span>
          </span>
          <span className={dark ? "text-emerald-400" : "text-primary"}>
            <span className="sr-only">Explore</span>
            <svg className="h-4 w-4 transition-transform duration-150 ease-out group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12l-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </p>
      </div>
    </Link>
  );
}

export default function SummerTreksRail() {
  return (
    <section className="relative bg-card py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <h2 className="font-heading text-4xl font-medium leading-[1.04] tracking-[-0.025em] text-foreground sm:text-5xl lg:col-span-7 lg:text-6xl">
              Trek the range in bloom
            </h2>
            <div className="lg:col-span-4 lg:col-start-9">
              <p className="font-nav text-xs font-semibold tracking-[0.12em] text-amber-700">JAN – DEC · TREKS</p>
              <p className="mt-2 text-base leading-relaxed text-muted">
                18 treks across Uttarakhand &amp; Himachal Pradesh — filtered by difficulty, region, and real elevation
                profiles.
              </p>
              <Link
                href="/treks"
                className="mt-1 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-foreground underline decoration-primary decoration-2 underline-offset-[6px] transition-colors duration-150 ease-out hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Explore all treks
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </FadeUp>
      </div>

      {/* the rail runs off the right edge on purpose: more to scroll */}
      <ul className="mt-12 flex snap-x snap-mandatory scroll-pl-4 gap-5 sm:scroll-pl-6 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:px-6 lg:scroll-pl-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:pr-8 [&::-webkit-scrollbar]:hidden">
        {byPopularity().slice(0, 8).map((trek) => (
          <li key={trek.id} className="w-[72vw] max-w-[320px] shrink-0 snap-start sm:w-[300px]">
            <TrekPhotoCard trek={trek} />
          </li>
        ))}
      </ul>
    </section>
  );
}
