import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * A trek's real altitude profile (`trek.elevationProfile`, metres, one value per stop) drawn as a
 * single smooth line with a soft fill. It is the site's signature graphic: small on cards, large on
 * heroes and empty states. Pure SVG, no script, so it is in the static HTML and costs nothing.
 *
 * Colour comes from `currentColor`, so set it with a text colour class (e.g. `text-emerald-400`).
 * The line stretches to its box (`preserveAspectRatio="none"`) while staying 1.5px thick.
 */
export function ElevationLine({
  profile,
  className,
  fill = true,
  peak = false,
  strokeWidth = 1.5,
}: {
  profile: number[];
  className?: string;
  /** Soft gradient under the line. */
  fill?: boolean;
  /** Mark the highest point with a dot. */
  peak?: boolean;
  strokeWidth?: number;
}) {
  const gradientId = useId();
  if (profile.length < 2) return null;

  const W = 100;
  const H = 40;
  const pad = 4;
  const min = Math.min(...profile);
  const max = Math.max(...profile);
  const span = Math.max(1, max - min);
  const points = profile.map((alt, i) => ({
    x: (i / (profile.length - 1)) * W,
    y: pad + (1 - (alt - min) / span) * (H - pad * 2),
  }));

  // Smooth the line with a monotone-ish curve: each segment gets control points at the midpoint's x.
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const cur = points[i];
    const cx = (prev.x + cur.x) / 2;
    d += ` C${cx},${prev.y} ${cx},${cur.y} ${cur.x},${cur.y}`;
  }
  const top = points.reduce((best, p) => (p.y < best.y ? p : best), points[0]);

  return (
    <div aria-hidden className={cn("relative h-full w-full", className)}>
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="block h-full w-full overflow-visible">
      {fill && (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="currentColor" stopOpacity="0.28" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${d} L${W},${H} L0,${H} Z`} fill={`url(#${gradientId})`} />
        </>
      )}
      <path d={d} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
      {/* An HTML dot, so it stays round however the line is stretched. */}
      {peak && (
        <span
          className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current ring-2 ring-current/25"
          style={{ left: `${top.x}%`, top: `${(top.y / H) * 100}%` }}
        />
      )}
    </div>
  );
}
