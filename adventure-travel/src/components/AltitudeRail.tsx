"use client";

import { useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { treks } from "@/data/treks";

const BASE = 1875; // Joshimath
const TOP = Math.max(...treks.map((t) => t.maxAltitude));
const PEAKS = [...treks].sort((a, b) => a.maxAltitude - b.maxAltitude).map((t) => ({ name: t.name, alt: t.maxAltitude }));
const pct = (alt: number) => ((alt - BASE) / (TOP - BASE)) * 100;

/**
 * The home page as a climb: scrolling the page walks the altitude from our Joshimath
 * base to the highest summit we run. Each tick is a real trek at its real top altitude;
 * the readout names the last one you have climbed past. Desktop only (it would crowd
 * the floating buttons on phones) and decorative: aria-hidden, nothing to read in it
 * that the page doesn't say.
 */
export default function AltitudeRail() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 30 }); // scroll-follow, not a UI transition
  const progress = reduce ? scrollYProgress : smooth;
  // Stay hidden over the hero and the footer.
  const opacity = useTransform(scrollYProgress, [0, 0.04, 0.08, 0.93, 0.97], [0, 0, 1, 1, 0]);
  const markerBottom = useTransform(progress, (v) => `${Math.min(1, Math.max(0, v)) * 100}%`);
  const [alt, setAlt] = useState(BASE);

  useMotionValueEvent(progress, "change", (v) => {
    const next = Math.round((BASE + Math.min(1, Math.max(0, v)) * (TOP - BASE)) / 10) * 10;
    setAlt((a) => (a === next ? a : next));
  });

  const passed = [...PEAKS].reverse().find((p) => p.alt <= alt);

  return (
    <>
    {/* Narrower screens: a hairline under the navbar that fills as you climb, with the altitude. */}
    <motion.div
      aria-hidden
      style={{ opacity }}
      className="pointer-events-none fixed inset-x-0 top-16 z-40 min-[1440px]:hidden"
    >
      <motion.div style={{ width: markerBottom }} className="h-0.5 bg-primary" />
      <p className="absolute right-3 top-1.5 rounded-full bg-navy-deep/85 px-2.5 py-0.5 font-nav text-[11px] font-semibold tabular-nums text-white backdrop-blur">
        {alt.toLocaleString("en-IN")} m
      </p>
    </motion.div>
    <motion.aside
      aria-hidden
      style={{ opacity }}
      className="pointer-events-none fixed right-2 top-1/2 z-40 hidden h-[52vh] -translate-y-1/2 min-[1440px]:flex"
    >
      <div className="relative mr-3 flex w-[5.25rem] flex-col justify-between text-right font-nav">
        <span className="text-[10px] font-semibold tabular-nums tracking-[0.12em] text-slate-400">{TOP.toLocaleString("en-IN")} m</span>
        <span className="text-[10px] font-semibold tabular-nums tracking-[0.12em] text-slate-400">{BASE.toLocaleString("en-IN")} m</span>
        <motion.div style={{ bottom: markerBottom }} className="absolute right-0 translate-y-1/2">
          <p className="w-[5.25rem] rounded-xl bg-navy-deep/90 px-2.5 py-2 text-white shadow-lg ring-1 ring-white/10 backdrop-blur">
            <span className="block whitespace-nowrap font-heading text-lg font-semibold tabular-nums leading-none">
              {alt.toLocaleString("en-IN")}
              <span className="ml-0.5 text-xs font-normal text-white/60">m</span>
            </span>
            {passed && (
              <span className="mt-1 block text-[9px] uppercase leading-tight tracking-[0.1em] text-white/60">
                Above {passed.name.replace(/ (Trek|Expedition)$/, "").replace(/ \(.*\)$/, "")}
              </span>
            )}
          </p>
        </motion.div>
      </div>
      <div className="relative w-px bg-slate-400/40">
        <motion.div style={{ height: markerBottom }} className="absolute bottom-0 left-0 w-px bg-primary" />
        {PEAKS.map((p) => (
          <span
            key={p.name}
            className="absolute left-1/2 h-px w-2 -translate-x-1/2 bg-slate-400/70"
            style={{ bottom: `${pct(p.alt)}%` }}
          />
        ))}
        <motion.span
          style={{ bottom: markerBottom }}
          className="absolute left-1/2 h-2.5 w-2.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-primary ring-4 ring-primary/20"
        />
      </div>
    </motion.aside>
    </>
  );
}
