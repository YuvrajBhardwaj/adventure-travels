"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { treks } from "@/data/treks";
import { FadeUp } from "./MotionWrapper";

export default function TheRange() {
  const reduceMotion = useReducedMotion();
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInView = useInView(chartRef, { once: true, margin: "-80px" });
  const highest = [...treks]
    .sort((a, b) => b.maxAltitude - a.maxAltitude)
    .slice(0, 3);

  const markers = [
    { label: "Auli Snow School", alt: 2800, kind: "course" as const },
    ...highest.map((t) => ({
      label: t.name,
      alt: t.maxAltitude,
      kind: "trek" as const,
    })),
  ];

  return (
    <section className="relative bg-background py-section-sm">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeUp>
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-foreground/20" aria-hidden />
            <span className="font-nav text-xs font-bold uppercase tracking-[0.3em] text-muted">
              THE RANGE
            </span>
          </div>
          <h2 className="mt-4 font-heading text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-display-lg">
            One range, two altitudes of adventure
          </h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">
            Snow school at 2,800 m. Treks up to 4,700 m. Same mountains,
            different seasons.
          </p>
        </FadeUp>

        <FadeUp className="mt-10">
          <div ref={chartRef} className="overflow-hidden rounded-3xl border border-foreground/10 bg-card p-6 shadow-sm sm:p-8">
            {/* Altitude SVG */}
            <svg
              viewBox="0 0 1200 280"
              preserveAspectRatio="xMidYMid meet"
              className="h-auto w-full"
              role="img"
              aria-label="Altitude profile from 1,200 m to 4,700 m"
            >
              <defs>
                <linearGradient id="range-stroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--color-primary)" />
                  <stop offset="45%" stopColor="var(--color-primary)" />
                  <stop offset="100%" stopColor="var(--color-secondary)" />
                </linearGradient>
              </defs>

              {/* Baseline */}
              <line
                x1={40}
                y1={220}
                x2={1160}
                y2={220}
                stroke="var(--color-foreground)"
                strokeOpacity={0.1}
                strokeWidth={1}
              />
              {/* Axis labels */}
              <text
                x={40}
                y={245}
                fontSize="11"
                fill="var(--color-muted)"
                fontWeight={600}
              >
                0 m
              </text>
              <text
                x={1140}
                y={245}
                fontSize="11"
                fill="var(--color-muted)"
                fontWeight={600}
                textAnchor="end"
              >
                5,000 m
              </text>

              {/* Mountain path — draws itself on scroll into view */}
              <motion.path
                d="M40,220 C280,210 420,110 640,80 C820,55 980,35 1160,18"
                fill="none"
                stroke="url(#range-stroke)"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reduceMotion ? undefined : { pathLength: 0 }}
                animate={chartInView || reduceMotion ? { pathLength: 1 } : undefined}
                transition={{ duration: 1.6, ease: "easeInOut" }}
              />

              {/* Markers — pop in one by one after the path draws */}
              {markers.map((m, i) => {
                const x = (m.alt / 5000) * 1120 + 40;
                // y follows the mountain path roughly
                const t = m.alt / 5000;
                const y = 220 - t * 195 - Math.sin(t * Math.PI) * 12;
                const fill =
                  m.kind === "course"
                    ? "var(--color-secondary)"
                    : "var(--color-primary)";
                return (
                  <motion.g
                    key={m.label}
                    initial={reduceMotion ? undefined : { opacity: 0, scale: 0 }}
                    animate={chartInView || reduceMotion ? { opacity: 1, scale: 1 } : undefined}
                    transition={{ delay: reduceMotion ? 0 : 1 + i * 0.18, duration: 0.45, type: "spring", stiffness: 260, damping: 18 }}
                    style={{ transformBox: "fill-box", transformOrigin: "center" }}
                  >
                    <circle
                      cx={x}
                      cy={y}
                      r={7}
                      fill={fill}
                      stroke="white"
                      strokeWidth={2}
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r={14}
                      fill={fill}
                      opacity={0.12}
                    />
                    <text
                      x={x}
                      y={y - 22}
                      fontSize="11"
                      fontWeight={700}
                      fill="var(--color-foreground)"
                      textAnchor="middle"
                    >
                      {m.label}
                    </text>
                    <text
                      x={x}
                      y={y - 10}
                      fontSize="10"
                      fill="var(--color-muted)"
                      textAnchor="middle"
                    >
                      {m.alt.toLocaleString("en-IN")} m
                    </text>
                  </motion.g>
                );
              })}
            </svg>

            <div className="mt-6 flex flex-wrap gap-3 border-t border-foreground/10 pt-4">
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-muted">
                <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
                Summer treks
              </span>
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-muted">
                <span
                  className="h-2 w-2 rounded-full bg-secondary"
                  aria-hidden
                />
                Auli snow school
              </span>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
