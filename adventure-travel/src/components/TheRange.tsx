"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { transition } from "@/lib/motion";
import { stats, treks, DIFFICULTY_COLORS, type Trek } from "@/data/treks";
import Price from "@/components/Price";

// Which treks sit in which part of the range (moved here from the old region map).
const REGIONS = [
  { id: "all", name: "All regions", slugs: null as string[] | null },
  { id: "himachal", name: "Himachal Pradesh", slugs: ["hampta-pass", "bhrigu-lake"] },
  {
    id: "garhwal",
    name: "Garhwal",
    slugs: [
      "valley-of-flowers", "kedarkantha", "brahmatal", "roopkund", "har-ki-dun", "pangarchula-peak",
      "kuari-pass", "satopanth-lake", "nandi-kund", "kalindi-khal", "gupt-khal", "panpatia-col",
      "dronagiri-base-camp", "mana-pass", "niti-pass", "rimkhim", "tungnath", "madhyamaheshwar",
    ],
  },
  { id: "kumaon", name: "Kumaon", slugs: ["nanda-devi-base-camp"] },
] as const;

const W = 1000;
const H = 380;
const FLOOR = 1500; // metres at the bottom of the chart
const CEIL = 6200; // metres at the top
const y = (m: number) => H - ((m - FLOOR) / (CEIL - FLOOR)) * (H - 20);
const BY_HEIGHT = [...treks].sort((a, b) => b.maxAltitude - a.maxAltitude);
// Laid out like a massif: the highest summit in the middle, lower ones stepping out to both sides.
const RANGE: Trek[] = [];
BY_HEIGHT.forEach((t, i) => (i % 2 ? RANGE.unshift(t) : RANGE.push(t)));
const HIGHEST = BY_HEIGHT[0];
const STEP = W / RANGE.length;

/** A peak with a slightly broken ridge, so the range reads as mountains, not a bar chart. */
function peakPath(i: number, alt: number) {
  const cx = STEP * i + STEP / 2;
  const top = y(alt);
  const half = STEP * 1.6;
  const l = cx - half;
  const r = cx + half;
  const s = (H - top) * 0.18;
  return `M${l},${H} L${cx - half * 0.45},${top + s * 1.2} L${cx - half * 0.2},${top + s * 0.55} L${cx},${top} L${cx + half * 0.25},${top + s * 0.7} L${cx + half * 0.5},${top + s * 0.45} L${r},${H} Z`;
}

const short = (t: Trek) => t.name.replace(/ (Trek|Expedition)$/, "");

/**
 * "The Range": every trek drawn as a peak at its real top altitude, grouped by region.
 * Replaces the old shape map and the stats strip (their facts are all here: the region
 * lists, the trek counts and the four headline numbers, every one computed from src/data).
 * Hover or focus a peak or a name to see the trek; the list is the keyboard and
 * screen-reader path, the drawing is aria-hidden.
 */
export default function TheRange() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [regionId, setRegionId] = useState<(typeof REGIONS)[number]["id"]>("all");
  const [activeSlug, setActiveSlug] = useState(HIGHEST.slug);
  const region = REGIONS.find((r) => r.id === regionId)!;
  const inRegion = (t: Trek) => !region.slugs || (region.slugs as readonly string[]).includes(t.slug);
  const list = BY_HEIGHT.filter(inRegion);
  const active = treks.find((t) => t.slug === activeSlug) ?? HIGHEST;

  const pick = (region: (typeof REGIONS)[number]) => {
    setRegionId(region.id);
    const top = BY_HEIGHT.find((t) => !region.slugs || (region.slugs as readonly string[]).includes(t.slug));
    if (top) setActiveSlug(top.slug);
  };

  return (
    <section aria-labelledby="range-heading" className="relative overflow-hidden bg-navy-deep py-20 text-white md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="font-nav text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">The range</p>
            <h2 id="range-heading" className="mt-4 font-heading text-4xl font-medium leading-[1.02] tracking-[-0.03em] sm:text-5xl lg:text-6xl">
              Every trek, drawn at its true height
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/65">
              Pick a region, then a peak, to see every trek we run there.
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-5 lg:col-span-5 lg:grid-cols-4 lg:gap-x-6">
            {stats.map((s) => (
              <div key={s.label}>
                <dd className="font-heading text-3xl font-medium tabular-nums leading-none sm:text-4xl">
                  {s.value.toLocaleString("en-IN")}
                  {s.suffix && <span className="ml-0.5 text-base text-white/50">{s.suffix}</span>}
                </dd>
                <dt className="mt-2 font-nav text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-12 flex flex-wrap gap-2" role="group" aria-label="Region">
          {REGIONS.map((r) => {
            const count = r.slugs ? r.slugs.length : treks.length;
            const on = r.id === regionId;
            return (
              <button
                key={r.id}
                type="button"
                aria-pressed={on}
                onClick={() => pick(r)}
                className={cn(
                  "rounded-full px-4 py-2 font-nav text-sm font-medium ring-1 transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  on ? "bg-white text-navy-deep ring-white" : "text-white/75 ring-white/20 hover:bg-white/10 hover:text-white"
                )}
              >
                {r.name} <span className={on ? "text-slate-500" : "text-white/45"}>{count}</span>
              </button>
            );
          })}
        </div>

        <div className="relative mt-8">
          <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" aria-hidden>
            <defs>
              <linearGradient id="range-snow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#F8FAFC" />
                <stop offset="0.28" stopColor="#CBD5E1" />
                <stop offset="1" stopColor="#1E293B" />
              </linearGradient>
              <linearGradient id="range-dim" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#334155" />
                <stop offset="1" stopColor="#0F172A" />
              </linearGradient>
            </defs>
            {RANGE.map((t, i) => ({ t, i }))
              .sort((a, b) => Number(a.t.slug === active.slug) - Number(b.t.slug === active.slug))
              .map(({ t, i }) => {
              const on = inRegion(t);
              const isActive = t.slug === active.slug;
              return (
                <path
                  key={t.slug}
                  d={peakPath(i, t.maxAltitude)}
                  fill={on ? "url(#range-snow)" : "url(#range-dim)"}
                  stroke={on ? "rgba(11,18,34,0.55)" : "rgba(255,255,255,0.05)"}
                  strokeWidth={1}
                  opacity={on ? (isActive ? 1 : 0.82) : 0.5}
                  className={on ? "cursor-pointer transition-opacity duration-150" : undefined}
                  onMouseEnter={on ? () => setActiveSlug(t.slug) : undefined}
                  onClick={on ? () => router.push(`/treks/${t.slug}`) : undefined}
                />
              );
            })}
            {[4000, 5000, 6000].map((m) => (
              <g key={m}>
                <line x1="0" x2={W} y1={y(m)} y2={y(m)} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 6" />
                <text x="2" y={y(m) - 6} fill="rgba(255,255,255,0.4)" fontSize="11" fontFamily="var(--font-nav)">
                  {m.toLocaleString("en-IN")} m
                </text>
              </g>
            ))}
            {(() => {
              const i = RANGE.findIndex((t) => t.slug === active.slug);
              const cx = STEP * i + STEP / 2;
              const top = y(active.maxAltitude);
              return (
                <g>
                  <line x1={cx} x2={cx} y1={Math.max(26, top - 34)} y2={top - 4} stroke="#10B981" strokeWidth="1.5" />
                  <circle cx={cx} cy={top} r="4" fill="#10B981" />
                  <text
                    x={Math.min(W - 6, Math.max(6, cx))}
                    y={Math.max(18, top - 42)}
                    fill="#fff"
                    fontSize="15"
                    fontFamily="var(--font-nav)"
                    textAnchor={cx > W - 120 ? "end" : cx < 120 ? "start" : "middle"}
                  >
                    {short(active)} · {active.maxAltitude.toLocaleString("en-IN")} m
                  </text>
                </g>
              );
            })()}
          </svg>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active.slug}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={transition("base")}
              className="self-start rounded-2xl bg-white/[0.06] p-6 ring-1 ring-white/10 lg:sticky lg:top-24 lg:col-span-5"
            >
              <p className="font-nav text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: DIFFICULTY_COLORS[active.difficulty] }}>
                {active.difficulty}
              </p>
              <h3 className="mt-2 font-heading text-3xl font-medium leading-tight">{active.name}</h3>
              <dl className="mt-5 grid grid-cols-3 gap-4 font-nav">
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.18em] text-white/50">Top</dt>
                  <dd className="mt-1 text-lg tabular-nums">{active.maxAltitude.toLocaleString("en-IN")} m</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.18em] text-white/50">Days</dt>
                  <dd className="mt-1 text-lg tabular-nums">{active.days}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.18em] text-white/50">From</dt>
                  <dd className="mt-1 text-lg tabular-nums">
                    <Price inr={active.price} />
                  </dd>
                </div>
              </dl>
              <Link
                href={`/treks/${active.slug}`}
                className={cn(buttonVariants({ size: "lg" }), "mt-6 w-full sm:w-auto")}
              >
                View {short(active)}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </motion.div>
          </AnimatePresence>

          <div className="lg:col-span-7">
            <p className="font-nav text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
              {region.name} · {list.length} {list.length === 1 ? "trek" : "treks"}, highest first
            </p>
            <ul className="mt-3 grid gap-x-8 sm:grid-cols-2">
              {list.map((t) => (
                <li key={t.slug} className="border-b border-white/10">
                  <Link
                    href={`/treks/${t.slug}`}
                    onMouseEnter={() => setActiveSlug(t.slug)}
                    onFocus={() => setActiveSlug(t.slug)}
                    className={cn(
                      "group flex items-center justify-between gap-3 py-3 text-sm transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:text-primary",
                      t.slug === active.slug ? "text-white" : "text-white/70 hover:text-white"
                    )}
                  >
                    <span>{t.name}</span>
                    <span className="flex shrink-0 items-center gap-2 whitespace-nowrap font-nav tabular-nums text-white/45">
                      {t.maxAltitude.toLocaleString("en-IN")} m
                      <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100" aria-hidden />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
