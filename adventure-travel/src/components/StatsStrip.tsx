"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { stats } from "@/data/treks";

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
      <span className="text-primary">{suffix}</span>
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

  return (
    <section ref={ref} className="relative border-y border-foreground/10 bg-background/80 py-12 backdrop-blur-sm">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-10 px-4 sm:px-6 md:grid-cols-4 md:divide-x md:divide-foreground/10 lg:px-8">
        {stats.map((s) => (
          <div key={s.label} className="px-4 text-center">
            <p className="font-heading text-3xl font-bold tabular-nums tracking-[-0.02em] text-foreground md:text-5xl">
              <CountUp value={s.value} suffix={s.suffix} phase={phase} />
            </p>
            <p className="font-nav mt-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
