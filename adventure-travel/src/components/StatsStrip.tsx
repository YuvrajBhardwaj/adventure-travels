"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { stats } from "@/data/treks";

/** Numbers climb like altitude when the strip enters the viewport. */
function CountUp({ value, suffix, active }: { value: number; suffix: string; active: boolean }) {
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const start = performance.now();
    const duration = reduceMotion ? 0 : 1400;
    const tick = (now: number) => {
      const p = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, value, reduceMotion]);

  return (
    <>
      {display.toLocaleString("en-IN")}
      <span className="text-primary">{suffix}</span>
    </>
  );
}

export default function StatsStrip() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="relative border-y border-foreground/10 bg-background/80 py-12 backdrop-blur-sm">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-10 px-6 md:grid-cols-4 md:divide-x md:divide-foreground/10">
        {stats.map((s) => (
          <div key={s.label} className="px-4 text-center">
            <p className="font-heading text-3xl font-bold tabular-nums text-foreground md:text-5xl">
              <CountUp value={s.value} suffix={s.suffix} active={inView} />
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
