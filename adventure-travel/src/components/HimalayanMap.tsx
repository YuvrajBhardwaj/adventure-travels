"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FadeUp } from "./MotionWrapper";
import { buttonVariants } from "@/components/ui/button";
import { transition } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { treks } from "@/data/treks";

const regions = [
  {
    id: "himachal",
    name: "Himachal Pradesh",
    color: "#0EA5E9",
    path: "M35,82 L88,42 L145,52 L182,101 L170,156 L128,190 L72,168 L39,124 Z",
    labelX: 109,
    labelY: 113,
    trekSlugs: ["hampta-pass", "bhrigu-lake"],
  },
  {
    id: "garhwal",
    name: "Garhwal Region",
    color: "#F59E0B",
    path: "M218,73 L272,35 L333,49 L372,100 L360,157 L316,190 L255,174 L220,126 Z",
    labelX: 296,
    labelY: 113,
    trekSlugs: [
      "valley-of-flowers",
      "kedarkantha",
      "brahmatal",
      "roopkund",
      "har-ki-dun",
      "pangarchula-peak",
      "kuari-pass",
      "satopanth-lake",
      "nandi-kund",
      "kalindi-khal",
      "gupt-khal",
      "panpatia-col",
      "dronagiri-base-camp",
      "mana-pass",
      "niti-pass",
      "rimkhim",
      "tungnath",
      "madhyamaheshwar",
    ],
  },
  {
    id: "kumaon",
    name: "Kumaon Region",
    color: "#10B981",
    path: "M414,82 L466,43 L523,52 L563,101 L550,155 L507,188 L449,171 L414,125 Z",
    labelX: 489,
    labelY: 113,
    trekSlugs: ["nanda-devi-base-camp"],
  },
];

function getRegionTreks(region: (typeof regions)[number]) {
  return region.trekSlugs
    .map((slug) => treks.find((trek) => trek.slug === slug))
    .filter((trek): trek is (typeof treks)[number] => Boolean(trek));
}

export default function HimalayanMap() {
  const [activeRegionId, setActiveRegionId] = useState("garhwal");
  const reduceMotion = useReducedMotion();
  const activeRegion = regions.find((region) => region.id === activeRegionId) ?? regions[1];
  const regionTreks = getRegionTreks(activeRegion);

  return (
    <section className="py-section-sm bg-gradient-to-b from-background/70 via-background/40 to-accent/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <span className="font-nav text-xs font-bold uppercase tracking-[0.3em] text-accent">Explore</span>
          <h2 className="mt-3 font-heading text-3xl font-bold leading-tight tracking-[-0.02em] text-foreground sm:mt-4 sm:text-4xl">
            Interactive Himalayan Map
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">
            Select a region on the map to see every trek available there.
          </p>
        </FadeUp>

        <div className="grid grid-cols-1 items-start gap-4 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          <FadeUp className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-lg shadow-black/5 sm:p-8 dark:border-white/10 dark:bg-card">
              <svg viewBox="0 0 600 230" className="h-auto w-full" role="group" aria-label="Select a Himalayan region">
                <defs>
                  <pattern id="himalayan-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M24 0H0V24" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-100 dark:text-white/5" />
                  </pattern>
                </defs>
                <rect width="600" height="230" fill="url(#himalayan-grid)" />

                {regions.map((region) => {
                  const selected = activeRegionId === region.id;
                  const count = getRegionTreks(region).length;
                  return (
                    <g key={region.id}>
                      <path
                        d={region.path}
                        fill={`${region.color}${selected ? "44" : "22"}`}
                        stroke={region.color}
                        strokeWidth={selected ? 3 : 1.5}
                        className="cursor-pointer transition-colors duration-150 ease-out focus:outline-none"
                        tabIndex={0}
                        role="button"
                        aria-label={`${region.name}: ${count} ${count === 1 ? "trek" : "treks"}`}
                        aria-pressed={selected}
                        onMouseEnter={() => setActiveRegionId(region.id)}
                        onFocus={() => setActiveRegionId(region.id)}
                        onClick={() => setActiveRegionId(region.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setActiveRegionId(region.id);
                          }
                        }}
                      />
                      <text
                        x={region.labelX}
                        y={region.labelY}
                        textAnchor="middle"
                        className="pointer-events-none fill-foreground text-xs font-semibold"
                        style={{ fontSize: "12px" }}
                      >
                        {region.name}
                      </text>
                      <text
                        x={region.labelX}
                        y={region.labelY + 18}
                        textAnchor="middle"
                        className="pointer-events-none fill-muted text-[8px]"
                        style={{ fontSize: "10px" }}
                      >
                        {count} {count === 1 ? "trek" : "treks"}
                      </text>
                    </g>
                  );
                })}
              </svg>

              <div className="mt-6 flex flex-wrap justify-center gap-4">
                {regions.map((region) => (
                  <div key={region.id} className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: region.color }} />
                    <span className="text-xs text-muted">{region.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>

          <FadeUp delay={0.2}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeRegion.id}
                initial={{ opacity: 0, x: reduceMotion ? 0 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: reduceMotion ? 0 : -20 }}
                transition={transition("base")}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-lg shadow-black/5 sm:p-6 dark:border-white/10 dark:bg-card"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${activeRegion.color}20` }}>
                    <svg className="h-5 w-5" style={{ color: activeRegion.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground">{activeRegion.name}</h3>
                    <p className="text-sm text-muted">
                      {regionTreks.length} {regionTreks.length === 1 ? "trek" : "treks"} available
                    </p>
                  </div>
                </div>

                <ul className="mb-6 space-y-1">
                  {regionTreks.map((trek) => (
                    <li key={trek.slug}>
                      <Link
                        href={`/treks/${trek.slug}`}
                        className="flex min-h-9 items-center gap-2 rounded-lg px-1 text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <svg className="h-4 w-4 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                        {trek.name}
                      </Link>
                    </li>
                  ))}
                </ul>

                <Link href="/treks" className={cn(buttonVariants(), "h-auto min-h-11 w-full whitespace-normal py-2.5 text-center")}>
                  Browse all treks
                </Link>
              </motion.div>
            </AnimatePresence>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
