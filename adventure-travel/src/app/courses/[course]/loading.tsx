export default function CourseLoading() {
  // Mirrors CourseDetailClient proportions (92vh video hero + max-w-7xl
  // content card) so the skeleton is exactly content-width — no wider,
  // no layout shift when the real page paints.
  return (
    <div className="min-h-screen bg-[#0B1D33]">
      <div className="h-[92vh] animate-pulse bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 -mt-6">
        <div className="rounded-3xl bg-white/95 p-4 sm:p-8">
          <div className="h-8 skeleton rounded w-1/3 mb-4" />
          <div className="h-4 skeleton rounded w-2/3 mb-8" />
          <div className="space-y-4">
            <div className="h-10 skeleton rounded" />
            <div className="h-10 skeleton rounded w-2/3" />
            <div className="h-10 skeleton rounded w-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
}
