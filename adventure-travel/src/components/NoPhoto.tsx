/** Stand-in where a trek has no photo yet: a quiet mountain mark on the brand gradient, sized by the caller. */
export default function NoPhoto({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`flex items-center justify-center bg-gradient-to-br from-emerald-800 via-slate-800 to-slate-900 ${className}`}>
      <svg className="h-1/4 max-h-24 min-h-8 w-auto text-white/15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3l4 8 5-5 5 15H2L8 3z" />
      </svg>
    </div>
  );
}
