"use client";

import { useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Trek } from "@/data/treks";
import { transition } from "@/lib/motion";

const W = 320;
const H = 132;
const PAD_X = 10;
const PAD_T = 26;
const PAD_B = 16;

/**
 * A trek's altitude profile you can walk along. Drag across it (mouse or finger) or use the arrow
 * keys: a marker moves from stop to stop, the stretch already "walked" fills in, and the readout
 * below names the day, the camp, the altitude and the hours on trail. It opens on the highest day.
 * Vertical swipes still scroll the page (touch-action: pan-y).
 */
export default function RouteProfile({ profile, itinerary }: { profile: number[]; itinerary: Trek["itinerary"] }) {
  const id = useId();
  const reduceMotion = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const max = Math.max(...profile);
  const min = Math.min(...profile);
  const range = max - min || 1;
  const peak = profile.indexOf(max);
  const [active, setActive] = useState(peak);
  const [dragging, setDragging] = useState(false);

  if (profile.length < 2) return null;

  const last = profile.length - 1;
  const pts = profile.map((alt, i) => ({
    x: PAD_X + (i / last) * (W - PAD_X * 2),
    y: PAD_T + (1 - (alt - min) / range) * (H - PAD_T - PAD_B),
    alt,
    day: itinerary[Math.min(i, itinerary.length - 1)],
  }));
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L${pts[last].x} ${H - PAD_B} L${pts[0].x} ${H - PAD_B} Z`;
  const cur = pts[active];
  const glide = reduceMotion ? { duration: 0 } : transition("base");

  const pick = (clientX: number) => {
    const box = svgRef.current?.getBoundingClientRect();
    if (!box) return;
    const x = ((clientX - box.left) / box.width) * W;
    const i = Math.round(((x - PAD_X) / (W - PAD_X * 2)) * last);
    setActive(Math.max(0, Math.min(last, i)));
  };
  const onPointerDown = (e: PointerEvent<SVGSVGElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    pick(e.clientX);
  };
  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    // Mice scrub on hover; touch and pen only while pressed, so a passing finger doesn't move it.
    if (dragging || e.pointerType === "mouse") pick(e.clientX);
  };
  const onKeyDown = (e: KeyboardEvent) => {
    const next = { ArrowRight: active + 1, ArrowUp: active + 1, ArrowLeft: active - 1, ArrowDown: active - 1, Home: 0, End: last }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    setActive(Math.max(0, Math.min(last, next)));
  };

  const label = cur.day ? `Day ${cur.day.day}, ${cur.day.title}, ${cur.alt.toLocaleString("en-IN")} metres` : `${cur.alt.toLocaleString("en-IN")} metres`;

  return (
    <div>
      <div
        role="slider"
        tabIndex={0}
        aria-label="Walk the route: altitude by day"
        aria-valuemin={1}
        aria-valuemax={pts.length}
        aria-valuenow={active + 1}
        aria-valuetext={label}
        onKeyDown={onKeyDown}
        className="rounded-xl text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="block w-full cursor-ew-resize touch-pan-y select-none"
          aria-hidden
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={() => setDragging(false)}
          onPointerCancel={() => setDragging(false)}
        >
          <defs>
            <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="currentColor" stopOpacity="0.28" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0.02" />
            </linearGradient>
            {/* The stretch walked so far: everything left of the marker. */}
            <clipPath id={`${id}-walked`}>
              <motion.rect x="0" y="0" height={H} initial={false} animate={{ width: cur.x }} transition={glide} />
            </clipPath>
          </defs>

          <path d={area} fill={`url(#${id}-fill)`} />
          <path d={line} fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          <path
            d={line}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.75"
            strokeLinejoin="round"
            strokeLinecap="round"
            clipPath={`url(#${id}-walked)`}
          />

          {pts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={i === peak ? 3 : 2} className={i <= active ? "fill-primary" : "fill-white"} stroke="currentColor" strokeWidth="1.5" />
          ))}

          <motion.line
            initial={false}
            animate={{ x1: cur.x, x2: cur.x, y1: cur.y, y2: H - PAD_B }}
            transition={glide}
            stroke="currentColor"
            strokeOpacity="0.35"
            strokeDasharray="3 3"
          />
          <motion.circle
            initial={false}
            animate={{ cx: cur.x, cy: cur.y, r: dragging ? 7 : 6 }}
            transition={glide}
            className="fill-white"
            stroke="currentColor"
            strokeWidth="3"
          />

          <text x={pts[peak].x} y={pts[peak].y - 12} textAnchor="middle" className="fill-foreground font-nav text-[8px] font-semibold">
            {max.toLocaleString("en-IN")} m
          </text>
        </svg>
      </div>

      {/* Readout: always visible, so phones don't need a tooltip under the finger. */}
      <div aria-live="polite" className="mt-3 flex items-start justify-between gap-4 border-t border-slate-200 pt-3">
        <div className="min-w-0">
          {cur.day && <p className="font-nav text-xs font-medium tabular-nums text-muted">Day {cur.day.day} of {itinerary.length}</p>}
          <p className="mt-0.5 line-clamp-2 text-sm leading-snug font-semibold text-foreground">{cur.day?.title ?? "On the route"}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-heading text-lg font-semibold leading-none tabular-nums text-foreground">{cur.alt.toLocaleString("en-IN")} m</p>
          {cur.day && cur.day.hours > 0 && <p className="mt-1 text-xs tabular-nums text-muted">{cur.day.hours} h on trail</p>}
        </div>
      </div>
      <p className="mt-2 text-xs text-muted">Drag along the route, or use the arrow keys.</p>
    </div>
  );
}
