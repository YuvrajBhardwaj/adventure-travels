"use client";

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { treks, REGIONS } from "@/data/treks";
import SmartImage from "@/components/SmartImage";

const DIFFICULTIES = ["All Levels", "Easy", "Moderate", "Challenging", "Strenuous"] as const;
const DURATION_OPTIONS = [
  { label: "Any Duration", min: 0, max: 999 },
  { label: "Up to 7 days", min: 0, max: 7 },
  { label: "8-14 days", min: 8, max: 14 },
  { label: "15+ days", min: 15, max: 999 },
];
const PRICE_OPTIONS = [
  { label: "Any Price", min: 0, max: 999999 },
  { label: "Under 20,000", min: 0, max: 20000 },
  { label: "20,000 - 30,000", min: 20000, max: 30000 },
  { label: "Above 30,000", min: 30000, max: 999999 },
];
const SORT_OPTIONS = ["Sort by Popularity", "Price: Low to High", "Price: High to Low", "Duration: Short to Long", "Difficulty: Easy to Hard"];
const DIFFICULTY_ORDER: Record<string, number> = { Easy: 0, Moderate: 1, Challenging: 2, Strenuous: 3 };

const DIFF_BADGE: Record<string, { bg: string; text: string }> = {
  Easy: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-600 dark:text-green-400" },
  Moderate: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-600 dark:text-yellow-400" },
  Challenging: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-600 dark:text-orange-400" },
  Strenuous: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-600 dark:text-red-400" },
};

function TrekSkeleton() {
  return (
    <div className="bg-white dark:bg-card rounded-2xl shadow-lg overflow-hidden">
      <div className="relative h-64 skeleton" />
      <div className="p-6 space-y-3">
        <div className="h-3 skeleton rounded w-1/3" />
        <div className="h-5 skeleton rounded w-2/3" />
        <div className="h-3 skeleton rounded w-full" />
        <div className="h-3 skeleton rounded w-1/2" />
        <div className="flex justify-between items-center pt-4">
          <div className="h-6 skeleton rounded w-1/4" />
          <div className="h-8 skeleton rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

export default function TreksPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-background pt-20">
        <section className="bg-gradient-to-r from-emerald-50 to-blue-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="h-10 skeleton rounded w-1/3 mx-auto mb-4" />
            <div className="h-5 skeleton rounded w-1/2 mx-auto" />
          </div>
        </section>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Array.from({ length: 6 }).map((_, i) => <TrekSkeleton key={i} />)}
          </div>
        </section>
      </div>
    }>
      <TreksCatalogue />
    </Suspense>
  );
}

function TreksCatalogue() {
  const searchParams = useSearchParams();

  // Initialise filters straight from the URL (?search=, ?region=, ?difficulty=) so
  // deep links from the hero search, destination cards and footer land pre-filtered.
  const regionParam = searchParams.get("region");
  const difficultyParam = searchParams.get("difficulty");
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [region, setRegion] = useState(
    regionParam && REGIONS.includes(regionParam) ? regionParam : "All Regions"
  );
  const [difficulty, setDifficulty] = useState(
    difficultyParam && (DIFFICULTIES as readonly string[]).includes(difficultyParam)
      ? difficultyParam
      : "All Levels"
  );
  const [durationIdx, setDurationIdx] = useState(0);
  const [priceIdx, setPriceIdx] = useState(0);
  const [sort, setSort] = useState("Sort by Popularity");

  const filtered = useMemo(() => {
    let result = [...treks];

    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((t) =>
        [t.name, t.region, t.location, t.blurb, t.bestSeason]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(q))
      );
    }
    if (region !== "All Regions") {
      result = result.filter((t) => t.region === region);
    }
    if (difficulty !== "All Levels") {
      result = result.filter((t) => t.difficulty === difficulty);
    }
    const dur = DURATION_OPTIONS[durationIdx];
    if (dur.min > 0 || dur.max < 999) {
      result = result.filter((t) => t.days >= dur.min && t.days <= dur.max);
    }
    const price = PRICE_OPTIONS[priceIdx];
    if (price.min > 0 || price.max < 999999) {
      result = result.filter((t) => t.price >= price.min && t.price <= price.max);
    }

    switch (sort) {
      case "Price: Low to High":
        result.sort((a, b) => a.price - b.price);
        break;
      case "Price: High to Low":
        result.sort((a, b) => b.price - a.price);
        break;
      case "Duration: Short to Long":
        result.sort((a, b) => a.days - b.days);
        break;
      case "Difficulty: Easy to Hard":
        result.sort((a, b) => (DIFFICULTY_ORDER[a.difficulty] ?? 0) - (DIFFICULTY_ORDER[b.difficulty] ?? 0));
        break;
    }

    return result;
  }, [search, region, difficulty, durationIdx, priceIdx, sort]);

  const clearFilters = () => {
    setSearch("");
    setRegion("All Regions");
    setDifficulty("All Levels");
    setDurationIdx(0);
    setPriceIdx(0);
    setSort("Sort by Popularity");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-background pt-20">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-emerald-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-foreground mb-4">All Trekking Adventures</h1>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Explore our complete collection of world-class trekking itineraries, from beginner-friendly walks to extreme mountain expeditions.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white dark:bg-card rounded-2xl shadow-lg p-6 sticky top-24">
              <div className="flex items-center space-x-2 mb-6">
                <svg className="h-5 w-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                <h3 className="text-lg font-semibold text-foreground">Filters</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <label htmlFor="trek-search" className="block text-sm font-medium text-foreground mb-3">Search</label>
                  <input
                    id="trek-search"
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search treks, regions…"
                    className="w-full p-3 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                  />
                </div>
                <div>
                  <label htmlFor="trek-region" className="block text-sm font-medium text-foreground mb-3">Region</label>
                  <select id="trek-region" value={region} onChange={(e) => setRegion(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300">
                    {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="trek-difficulty" className="block text-sm font-medium text-foreground mb-3">Difficulty</label>
                  <select id="trek-difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300">
                    {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="trek-duration" className="block text-sm font-medium text-foreground mb-3">Duration</label>
                  <select id="trek-duration" value={durationIdx} onChange={(e) => setDurationIdx(Number(e.target.value))} className="w-full p-3 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300">
                    {DURATION_OPTIONS.map((d, i) => <option key={i} value={i}>{d.label}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="trek-price" className="block text-sm font-medium text-foreground mb-3">Price Range</label>
                  <select id="trek-price" value={priceIdx} onChange={(e) => setPriceIdx(Number(e.target.value))} className="w-full p-3 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300">
                    {PRICE_OPTIONS.map((p, i) => <option key={i} value={i}>{p.label}</option>)}
                  </select>
                </div>
                <button onClick={clearFilters} className="w-full text-emerald-600 hover:text-emerald-700 font-medium py-2 transition-all duration-300">
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-8">
              <p className="text-muted">Showing <span className="font-semibold">{filtered.length}</span> of {treks.length} adventures</p>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="p-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-sm">
                {SORT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted text-lg">No treks match your filters.</p>
                <button onClick={clearFilters} className="mt-3 text-emerald-600 font-semibold hover:underline">Clear all filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filtered.map((trek) => (
                  <TrekCard key={trek.id} trek={trek} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function TrekCard({ trek }: { trek: (typeof treks)[0] }) {
  const badge = DIFF_BADGE[trek.difficulty] || DIFF_BADGE.Moderate;

  return (
    <Link
      href={`/treks/${trek.slug}`}
      className="relative block overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 group"
    >
      {/* Full-bleed image */}
      <SmartImage
        src={trek.image}
        alt={trek.name}
        className="w-full h-80 sm:h-96 object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Readability gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 transition-opacity duration-300" />

      {/* Difficulty Badge */}
      <div className="absolute top-4 left-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.text} ${badge.bg} backdrop-blur-sm`}>
          {trek.difficulty}
        </span>
      </div>

      {/* Rating Badge */}
      {trek.rating && (
        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1">
          <div className="flex items-center space-x-1">
            <svg className="h-4 w-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-medium text-white">{trek.rating}</span>
            <span className="text-sm text-white/70">({trek.reviewCount})</span>
          </div>
        </div>
      )}

      {/* Overlaid content */}
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <div className="flex items-center text-sm text-white/80 mb-1">
          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {trek.location || trek.region}
        </div>
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">{trek.name}</h3>

        <div className="flex items-center justify-between gap-3 text-sm text-white/80 mb-3">
          <div className="flex items-center">
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            {trek.days} days
          </div>
          <div className="flex items-center">
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
            Max {trek.groupSize || 15}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/20 pt-3">
          <div className="flex min-w-0 flex-col">
            <span className="text-2xl font-bold text-white leading-tight">{trek.currency}{trek.price.toLocaleString("en-IN")}</span>
            <span className="text-xs text-white/70 whitespace-nowrap">per person</span>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-emerald-600 text-white px-4 py-2 text-sm font-semibold transition-colors group-hover:bg-emerald-700">
            Reserve Spot
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /><path strokeLinecap="round" strokeLinejoin="round" d="m12 5 7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}