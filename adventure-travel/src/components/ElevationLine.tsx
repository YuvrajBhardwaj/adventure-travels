import { useId } from "react";
import { cn } from "@/lib/utils";

const W = 400;
const H = 100;
/** Headroom above the summit, and the horizon the range stands on. */
const TOP = 8;
const FLOOR = 96;

type Pt = { x: number; y: number };

/** Seeded random numbers (mulberry32): the server and the browser draw the same mountains. */
function seeded(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clampY = (y: number) => Math.min(H, Math.max(TOP, y));

/**
 * A ridgeline through the route's stops. A col drops between each pair of stops, so the high stops
 * stand as summits; midpoint displacement then adds rocky detail; finally the high ground is
 * sharpened into points and the low ground eased into foothills.
 */
function ridge(stops: Pt[], rand: () => number, levels: number, rough: number): Pt[] {
  let pts: Pt[] = [stops[0]];
  for (let i = 1; i < stops.length; i++) {
    const a = stops[i - 1];
    const b = stops[i];
    const dip = (b.x - a.x) * 0.16 * (0.6 + rand() * 0.8);
    pts.push({ x: (a.x + b.x) / 2 + (rand() - 0.5) * (b.x - a.x) * 0.3, y: clampY(Math.max(a.y, b.y) + dip) }, b);
  }
  let r = rough;
  for (let k = 0; k < levels; k++) {
    const next: Pt[] = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      next.push({ x: (a.x + b.x) / 2, y: clampY((a.y + b.y) / 2 + (rand() - 0.5) * (b.x - a.x) * r) }, b);
    }
    pts = next;
    r *= 0.82;
  }
  return pts.map((p) => {
    const h = Math.max(0, (FLOOR - p.y) / (FLOOR - TOP));
    return { x: p.x, y: FLOOR - Math.pow(h, 1.2) * (FLOOR - TOP) };
  });
}

const n = (v: number) => v.toFixed(1);
const line = (pts: Pt[]) => pts.map((p, i) => `${i ? "L" : "M"}${n(p.x)},${n(p.y)}`).join("");
const area = (pts: Pt[]) => `${line(pts)}L${W},${H}L0,${H}Z`;

/** Snow caps: below each ridge point above the snowline, snow reaches down about as far again, in slow-varying tongues. */
function snowCaps(front: Pt[], snowline: number, rand: () => number): string {
  const knots = Array.from({ length: Math.ceil(front.length / 12) + 2 }, () => 0.6 + rand() * 1.1);
  const caps: string[] = [];
  let run: { top: Pt; bottom: Pt }[] = [];
  const flush = () => {
    if (run.length > 1) caps.push(`${line(run.map((r) => r.top))}${run.reverse().map((r) => `L${n(r.bottom.x)},${n(r.bottom.y)}`).join("")}Z`);
    run = [];
  };
  front.forEach((p, i) => {
    const above = snowline - p.y;
    if (above <= 0) return flush();
    const k = i / 12;
    const k0 = Math.floor(k);
    const depth = knots[k0] * (1 - (k - k0)) + knots[k0 + 1] * (k - k0);
    run.push({ top: p, bottom: { x: p.x, y: p.y + above * depth } });
  });
  flush();
  return caps.join("");
}

/** Shadow faces on the two highest summits: the slope down to the next low point, bounded by a fall line. */
function shadowFaces(pts: Pt[], rand: () => number): string {
  const step = 10;
  const peaks: number[] = [];
  for (let i = step; i < pts.length - step; i++) {
    let isPeak = pts[i].y < FLOOR - 12;
    for (let j = i - step; j <= i + step && isPeak; j++) if (pts[j].y < pts[i].y) isPeak = false;
    if (isPeak) peaks.push(i);
  }
  return peaks
    .sort((a, b) => pts[a].y - pts[b].y)
    .slice(0, 2)
    .map((i) => {
      const p = pts[i];
      let j = i + 1;
      while (j < pts.length - 1 && !(pts[j].y >= pts[j - 1].y && pts[j].y >= pts[j + 1].y && pts[j].y > p.y + 6)) j++;
      const flank = pts.slice(i, j + 1);
      const last = flank[flank.length - 1];
      const foot = last.x + (H - last.y) * 0.25;
      const baseX = p.x + (H - p.y) * (0.05 + rand() * 0.15);
      const fall: Pt[] = [];
      for (let k = 8; k >= 0; k--) {
        const t = k / 8;
        fall.push({ x: p.x + (baseX - p.x) * t + (k && k < 8 ? (rand() - 0.5) * 3 : 0), y: p.y + (H - p.y) * t });
      }
      return `${line(flank)}L${n(foot)},${H}${fall.map((q) => `L${n(q.x)},${n(q.y)}`).join("")}Z`;
    })
    .join("");
}

/**
 * A trek's real altitude profile (`trek.elevationProfile`, metres, one value per stop) drawn as the
 * mountains it crosses: the route's stops set the summits and cols, rocky detail fills in between,
 * snow caps the high ground, the two highest summits get a shaded face, and a paler range stands
 * behind. It is the site's signature graphic. Pure SVG, seeded, so the static HTML and the browser
 * draw the same range.
 *
 * Rock takes `currentColor` (set a text colour: navy on light sections, white or slate on dark);
 * snow is white. `compact` (small cards) keeps only the front ridge and its snow, for a lighter page.
 * It stretches to its box.
 */
export function ElevationLine({
  profile,
  className,
  compact = false,
  strokeWidth = 1.25,
}: {
  profile: number[];
  className?: string;
  compact?: boolean;
  strokeWidth?: number;
}) {
  const id = useId();
  if (profile.length < 2) return null;

  // Normalise from 30% of the summit, so road-head stops (a few hundred metres) become foothills,
  // not a long flat baseline.
  const peakAlt = Math.max(...profile);
  const min = Math.max(Math.min(...profile), peakAlt * 0.3);
  const span = Math.max(1, peakAlt - min);
  const stops = profile.map((alt, i) => ({
    x: (i / (profile.length - 1)) * W,
    y: TOP + (1 - (0.1 + (0.9 * Math.max(0, alt - min)) / span)) * (FLOOR - TOP),
  }));
  const rand = seeded(profile.reduce((sum, alt, i) => sum + alt * (i + 1), profile.length));

  const levels = compact ? 3 : 4;
  const front = ridge(stops, rand, levels, 0.55);
  const behind = compact
    ? null
    : ridge(
        stops.map((p) => ({ x: W - p.x, y: TOP + 10 + (p.y - TOP) * 0.55 })).reverse(),
        rand,
        levels,
        0.7
      );
  const summit = Math.min(...front.map((p) => p.y));
  const snow = snowCaps(front, summit + (FLOOR - summit) * 0.3, rand);
  const shade = compact ? "" : shadowFaces(front, rand);
  const ref = (name: string) => `url(#${id}-${name})`;

  return (
    <div aria-hidden className={cn("relative h-full w-full", className)}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="block h-full w-full overflow-visible">
        <defs>
          <path id={`${id}-front`} d={area(front)} />
          <linearGradient id={`${id}-rock`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.6" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0.05" />
          </linearGradient>
          {behind && (
            <>
              <linearGradient id={`${id}-far`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="currentColor" stopOpacity="0.24" />
                <stop offset="1" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
              {/* The far range shows only above the front ridge, never through it. */}
              <mask id={`${id}-far-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
                <rect width={W} height={H} fill="white" />
                <use href={`#${id}-front`} fill="black" />
              </mask>
            </>
          )}
          {shade && (
            <>
              <linearGradient id={`${id}-shade`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#0b1222" stopOpacity="0.26" />
                <stop offset="1" stopColor="#0b1222" stopOpacity="0" />
              </linearGradient>
              <clipPath id={`${id}-clip`}>
                <use href={`#${id}-front`} />
              </clipPath>
            </>
          )}
        </defs>
        {behind && <path d={area(behind)} fill={ref("far")} mask={ref("far-mask")} />}
        <use href={`#${id}-front`} fill={ref("rock")} />
        {shade && <path d={shade} fill={ref("shade")} clipPath={ref("clip")} />}
        {snow && <path d={snow} fill="white" fillOpacity={0.92} />}
        <path
          d={line(front)}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
