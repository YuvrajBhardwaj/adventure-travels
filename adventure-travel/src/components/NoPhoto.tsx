/**
 * Stand-in where a trek has no photo yet, sized by the caller. Same look as the dark
 * EmptyState (src/components/ui/empty-state.tsx): a muted mountain mark in a rounded-2xl
 * tinted square, here on a quiet navy-to-emerald gradient so overlaid white text stays legible.
 * The square shrinks with small slots (nav thumbnails) and never exceeds 60% of the slot.
 */
export default function NoPhoto({ className = "" }: { className?: string }) {
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
