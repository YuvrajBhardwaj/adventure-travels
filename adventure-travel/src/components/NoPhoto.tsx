import { ElevationLine } from "@/components/ElevationLine";

/**
 * Stand-in where a trek has no photo yet, sized by the caller.
 *
 * With `profile` (a trek's `elevationProfile`, metres) it becomes a typographic panel: the route's
 * mountain range (ElevationLine) across the lower half of a navy field, and `label` set in Fraunces.
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
    return (
      <div aria-hidden className={`@container relative overflow-hidden bg-gradient-to-b from-navy-hero via-navy to-navy-deep ${className}`}>
        {/* The trek's own range, snow on top, standing across the lower half of the panel. */}
        <div className="absolute inset-x-0 bottom-0 h-[58%]">
          <ElevationLine profile={profile} className="text-slate-300" strokeWidth={1.5} />
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
