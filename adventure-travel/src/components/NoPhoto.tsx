import { ElevationLine } from "@/components/ElevationLine";

/**
 * Stand-in where a trek has no photo yet, sized by the caller.
 *
 * With `profile` (a trek's `elevationProfile`, metres) it becomes a typographic panel: the route's
 * altitude line drawn large across a navy field, a dot on the summit, and `label` set in Fraunces.
 * Without it (small slots such as nav thumbnails) it stays the quiet mountain mark in a tinted square,
 * which shrinks with the slot and never exceeds 60% of it.
 *
 * Decorative either way: the trek's name and numbers are always in the text around it.
 */
export default function NoPhoto({
  className = "",
  profile,
  label,
}: {
  className?: string;
  /** Altitudes in metres, one per stop. Two or more values switch to the large elevation-line panel. */
  profile?: number[];
  /** Short line set in Fraunces in the panel's top-left corner (only with `profile`). */
  label?: string;
}) {
  if (profile && profile.length >= 2) {
    const max = Math.max(...profile);
    const peakAt = (profile.indexOf(max) / (profile.length - 1)) * 100;
    return (
      <div aria-hidden className={`@container relative overflow-hidden bg-gradient-to-br from-navy-hero via-navy to-navy-deep ${className}`}>
        {/* Altitude gridlines: three hairlines the profile climbs through. */}
        <div className="absolute inset-x-5 top-[16%] h-[25%]">
          {[0, 50, 100].map((pct) => (
            <div key={pct} className="absolute inset-x-0 border-t border-white/10" style={{ top: `${pct}%` }} />
          ))}
          <ElevationLine profile={profile} className="text-emerald-400" strokeWidth={2} />
          {/* The line's highest point always sits 10% from the top of its box. A real circle here, because the SVG stretches. */}
          <span
            className="absolute top-[10%] h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-300 ring-4 ring-emerald-400/25"
            style={{ left: `${peakAt}%` }}
          />
        </div>
        {label && (
          <p className="absolute left-5 top-5 max-w-[70%] font-heading text-[clamp(1.25rem,8cqw,3rem)] font-medium leading-none tracking-[-0.01em] text-white/90">
            {label}
          </p>
        )}
      </div>
    );
  }

  return (
    <div aria-hidden className={`flex items-center justify-center bg-gradient-to-br from-emerald-900 via-navy to-navy-deep ${className}`}>
      <div className="flex aspect-square h-12 max-h-[60%] sm:h-14 items-center justify-center rounded-2xl bg-white/[0.06] text-white/50 ring-1 ring-white/10">
        <svg className="h-1/2 w-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 3l4 8 5-5 5 15H2L8 3z" />
        </svg>
      </div>
    </div>
  );
}
