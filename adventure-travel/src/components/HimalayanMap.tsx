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
    <section className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="max-w-2xl">
          <p className="sr-only">Explore</p>
          <h2 className="font-heading text-4xl font-medium leading-[1.04] tracking-[-0.025em] text-foreground sm:text-5xl lg:text-6xl">
            Interactive Himalayan Map
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            Select a region on the map to see every trek available there.
          </p>
        </FadeUp>

        <div className="mt-10 grid grid-cols-1 items-start gap-10 lg:mt-14 lg:grid-cols-12 lg:gap-14">
          <FadeUp className="lg:col-span-7">
            <div className="border-y border-foreground/15 py-6 sm:py-8">
              <svg viewBox="0 0 600 230" className="h-auto w-full" role="group" aria-label="Select a Himalayan region">
                <defs>
                  <pattern id="himalayan-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M24 0H0V24" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-foreground/10" />
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
                        className="cursor-pointer transition-colors duration-150 ease-out focus:outline-none focus-visible:stroke-foreground"
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

              <div className="font-nav mt-5 flex flex-wrap gap-x-6 gap-y-2">
                {regions.map((region) => (
                  <div key={region.id} className="flex items-center gap-2">
                    <span className="h-[3px] w-5" style={{ backgroundColor: region.color }} aria-hidden />
                    <span className="text-xs text-muted">{region.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>

          <FadeUp delay={0.1} className="lg:col-span-5">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeRegion.id}
                initial={{ opacity: 0, x: reduceMotion ? 0 : 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: reduceMotion ? 0 : -12 }}
                transition={transition("base")}
              >
                <div className="flex items-end justify-between gap-4 border-b-2 pb-4" style={{ borderColor: activeRegion.color }}>
                  <h3 className="font-heading text-3xl font-medium leading-tight tracking-[-0.02em] text-foreground sm:text-4xl">
                    {activeRegion.name}
                  </h3>
                  <p className="font-nav shrink-0 text-right text-sm text-muted">
                    <span className="block font-heading text-4xl leading-none tabular-nums text-foreground">{regionTreks.length}</span>
                    {regionTreks.length === 1 ? "trek" : "treks"} available
                  </p>
                </div>

                <ul className="mt-2 mb-6 sm:columns-2 sm:gap-x-6">
                  {regionTreks.map((trek) => (
                    <li key={trek.slug} className="break-inside-avoid">
                      <Link
                        href={`/treks/${trek.slug}`}
                        className="flex min-h-11 items-center justify-between gap-2 border-b border-foreground/10 text-sm text-foreground/80 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        {trek.name}
                        <span aria-hidden className="text-muted">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>

                <Link href="/treks" className={cn(buttonVariants(), "h-auto min-h-11 w-full whitespace-normal py-2.5 text-center sm:w-auto sm:px-8")}>
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
