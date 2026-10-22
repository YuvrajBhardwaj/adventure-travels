"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { stats, treks } from "@/data/treks";
import { ElevationLine } from "@/components/ElevationLine";

const format = (n: number) => n.toLocaleString("en-IN");

/**
 * Numbers climb like altitude when the strip scrolls into view. The static HTML
 * (and anyone already looking at the strip) gets the real figure; only a strip
 * that starts below the viewport is zeroed, unseen, and then counted up.
 */
function CountUp({ value, suffix, phase }: { value: number; suffix: string; phase: "static" | "armed" | "run" }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || phase === "static") return;
    if (phase === "armed") {
      el.textContent = format(0);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const duration = 1400; // ambient number climb, not an interaction response
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      el.textContent = format(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, value]);

  return (
    <>
      <span ref={ref}>{format(value)}</span>
      {suffix && <span className="ml-0.5 text-[0.42em] text-muted">{suffix}</span>}
    </>
  );
}

export default function StatsStrip() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (reduceMotion || !el) return;
    if (el.getBoundingClientRect().top > window.innerHeight) setArmed(true);
  }, [reduceMotion]);

  const phase = !armed ? "static" : inView ? "run" : "armed";

  // The strip's one graphic is the profile of our highest route, so the line is real data.
  const highest = [...treks].sort((a, b) => b.maxAltitude - a.maxAltitude)[0];

  return (
    <section ref={ref} className="relative border-y border-foreground/10 bg-card pt-10 md:pt-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4 md:gap-x-0">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col-reverse justify-end md:border-l md:border-foreground/15 md:pl-6 md:first:border-l-0 md:first:pl-0"
            >
              <dt className="font-nav mt-3 text-[11px] font-medium uppercase tracking-[0.16em] text-muted">{s.label}</dt>
              <dd className="font-heading text-5xl font-normal leading-none tabular-nums tracking-[-0.03em] text-foreground md:text-6xl lg:text-7xl">
                <CountUp value={s.value} suffix={s.suffix} phase={phase} />
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-8 h-14 text-emerald-500 md:mt-10 md:h-24" aria-hidden>
          <ElevationLine profile={highest.elevationProfile} peak strokeWidth={1.5} />
        </div>
      </div>
    </section>
  );
}
