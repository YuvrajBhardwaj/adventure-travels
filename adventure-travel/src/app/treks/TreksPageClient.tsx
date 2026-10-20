"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { treks, REGIONS, priceRoute, byPopularity } from "@/data/treks";
import { destinations } from "@/data/destinations";
import SmartImage from "@/components/SmartImage";
import NoPhoto from "@/components/NoPhoto";
import Price from "@/components/Price";
import WallpaperCarousel from "@/components/WallpaperCarousel";
import { SearchX } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";

// Hero wallpaper: our own photos from these treks. Landscape shots only — portrait ones crop badly this wide.
const HERO_PHOTOS = [
  { slug: "pangarchula-peak", src: "/assets/pangarchula-peak-trek/IMG_3734.jpeg" },
  { slug: "satopanth-lake", src: "/assets/satopanth-lake/IMG_5914.JPG.jpeg" },
  { slug: "bhrigu-lake", src: "/assets/birgu-lake/d4044abb-3f2d-4334-a52a-4048f82b359c.jpeg" },
  { slug: "kedarkantha", src: "/assets/kedarkantha-trek/IMG_4143.JPG.jpeg" },
  { slug: "har-ki-dun", src: "/assets/har-ki-dun/e9a6b4b0-145b-4ce1-ba6c-7cd151231700.jpeg" },
  { slug: "valley-of-flowers", src: "/assets/valley-of-flowers/IMG_1532.JPG.jpeg" },
  { slug: "dronagiri-base-camp", src: "/assets/dronagiri/7155162a-d858-4534-901f-e67b9acfe491.jpeg" },
  { slug: "nandi-kund", src: "/assets/nandi-kund-trek/2c72f839-1d03-4194-829a-0cb0e953eb8a.jpeg" },
  { slug: "kuari-pass", src: "/assets/kuari-pass-trek/017bfe93-d6e9-4c29-841d-e55ba276be2b.jpeg" },
];
const HERO_SLIDES = HERO_PHOTOS.flatMap(({ slug, src }) => {
  const trek = treks.find((t) => t.slug === slug);
  return trek ? [{ src, caption: trek.name, href: `/treks/${slug}` }] : [];
});
const HERO_HEIGHT = "h-[58vh] min-h-[400px] max-h-[640px]";

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

export default function TreksPage() {
  // Filters start at "everything", so the static HTML lists all treks (crawlable links to
  // every trek page). No useSearchParams(): in a static export it would turn this whole
  // page into a client-only skeleton.
  const [destination, setDestination] = useState("");
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("All Regions");
  const [difficulty, setDifficulty] = useState("All Levels");

  // Deep links from the hero search, navbar, destination cards and footer
  // (?search=, ?destination=, ?region=, ?difficulty=) are applied after mount.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const regionParam = params.get("region");
    const difficultyParam = params.get("difficulty");
    /* eslint-disable react-hooks/set-state-in-effect -- the URL only exists in the browser */
    if (params.get("destination")) setDestination(params.get("destination")!);
    if (params.get("search")) setSearch(params.get("search")!);
    if (regionParam && REGIONS.includes(regionParam)) setRegion(regionParam);
    if (difficultyParam && (DIFFICULTIES as readonly string[]).includes(difficultyParam)) setDifficulty(difficultyParam);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const [durationIdx, setDurationIdx] = useState(0);
  const [priceIdx, setPriceIdx] = useState(0);
  const [sort, setSort] = useState("Sort by Popularity");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = [...treks];

    if (destination) {
      const slugs = new Set(destinations.find((d) => d.slug === destination)?.popularTreks.map((t) => t.slug) ?? []);
      result = result.filter((t) => slugs.has(t.slug));
    }

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
      default:
        result = byPopularity(result);
    }

    return result;
  }, [destination, search, region, difficulty, durationIdx, priceIdx, sort]);

  const clearFilters = () => {
    setDestination("");
    setSearch("");
    setRegion("All Regions");
    setDifficulty("All Levels");
    setDurationIdx(0);
    setPriceIdx(0);
    setSort("Sort by Popularity");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      {/* Navy strip under the fixed navbar, so no light line shows between it and the hero. */}
      <div aria-hidden className="h-20 bg-navy" />
      {/* Hero Banner */}
      <WallpaperCarousel slides={HERO_SLIDES} label="Photos from our treks" className={HERO_HEIGHT}>
        <div className="mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-4 pb-20 text-center sm:px-6 sm:pb-12 lg:px-8">
          <h1 className="mb-4 text-4xl font-bold tracking-[-0.02em] text-white sm:text-5xl [text-shadow:0_2px_24px_rgba(0,0,0,0.55)]">All Trekking Adventures</h1>
          <p className="mx-auto max-w-2xl text-lg text-white/90 sm:text-xl [text-shadow:0_1px_12px_rgba(0,0,0,0.7)]">
            Explore our complete collection of world-class trekking itineraries, from beginner-friendly walks to extreme mountain expeditions.
          </p>
        </div>
      </WallpaperCarousel>

      {/* Main Content */}
      <section className="py-section-sm mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left Sidebar */}
          <div className="lg:w-1/4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-card sm:p-6 lg:sticky lg:top-24">
              <button
                type="button"
                onClick={() => setFiltersOpen((open) => !open)}
                aria-expanded={filtersOpen}
                aria-controls="trek-filter-controls"
                className="-my-2 flex min-h-11 w-full items-center justify-between rounded-xl lg:hidden"
              >
                <span className="flex items-center gap-2 font-semibold text-foreground">
                  <svg className="h-5 w-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                  </svg>
                  Filters
                </span>
                <svg className={`h-4 w-4 text-muted transition-transform duration-150 ease-out motion-reduce:transition-none ${filtersOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              <div className="mb-5 hidden items-center gap-2 lg:flex">
                <svg className="h-5 w-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                <h3 className="text-lg font-semibold text-foreground">Filters</h3>
              </div>
              <div id="trek-filter-controls" className={`${filtersOpen ? "block" : "hidden"} mt-5 space-y-5 lg:mt-0 lg:block`}>
                <div>
                  <Label htmlFor="trek-search">Search</Label>
                  <Input
                    id="trek-search"
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search treks, regions…"
                  />
                </div>
                <div>
                  <Label htmlFor="trek-destination">Destination</Label>
                  <Select id="trek-destination" value={destination} onChange={(e) => setDestination(e.target.value)}>
                    <option value="">All Destinations</option>
                    {destinations.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="trek-region">Region</Label>
                  <Select id="trek-region" value={region} onChange={(e) => setRegion(e.target.value)}>
                    {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="trek-difficulty">Difficulty</Label>
                  <Select id="trek-difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                    {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="trek-duration">Duration</Label>
                  <Select id="trek-duration" value={durationIdx} onChange={(e) => setDurationIdx(Number(e.target.value))}>
                    {DURATION_OPTIONS.map((d, i) => <option key={i} value={i}>{d.label}</option>)}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="trek-price">Price Range</Label>
                  <Select id="trek-price" value={priceIdx} onChange={(e) => setPriceIdx(Number(e.target.value))}>
                    {PRICE_OPTIONS.map((p, i) => <option key={i} value={i}>{p.label}</option>)}
                  </Select>
                </div>
                <Button variant="ghost" onClick={clearFilters} className="w-full text-emerald-700 hover:text-emerald-800">
                  Clear All Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:w-3/4">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted sm:text-base">Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {treks.length} adventures</p>
              <Select aria-label="Sort treks" value={sort} onChange={(e) => setSort(e.target.value)} wrapperClassName="w-full sm:w-auto" className="sm:w-64">
                {SORT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                className="rounded-2xl border border-dashed border-slate-200 py-16"
                icon={<SearchX />}
                title="No treks match your filters."
                action={<Button variant="outline" onClick={clearFilters}>Clear all filters</Button>}
              />
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
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

/** Also used by the trek hub pages (src/components/TrekHub.tsx). */
export function TrekCard({ trek }: { trek: (typeof treks)[0] }) {
  const badge = DIFF_BADGE[trek.difficulty] || DIFF_BADGE.Moderate;

  // Surface: rounded-2xl, one shadow step on hover/focus, transform-only motion (a 4px lift, photo zoom).
  return (
    <Link
      href={`/treks/${trek.slug}`}
      className="group relative block overflow-hidden rounded-2xl shadow-md transition-transform duration-200 ease-out hover:-translate-y-1 hover:shadow-xl focus-visible:-translate-y-1 focus-visible:shadow-xl motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:focus-visible:translate-y-0"
    >
      {/* Full-bleed image */}
      {trek.image ? (
        <SmartImage
          src={trek.image}
          alt={trek.name}
          className="h-80 w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100 sm:h-96"
        />
      ) : (
        <NoPhoto className="h-80 w-full sm:h-96" />
      )}

      {/* Readability gradient */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

      {/* Difficulty Badge */}
      <div className="absolute left-4 top-4 z-20">
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${badge.text} ${badge.bg} backdrop-blur-sm`}>
          {trek.difficulty}
        </span>
      </div>

      {/* Rating Badge */}
      {trek.rating && (
        <div className="absolute right-4 top-4 z-20 rounded-full bg-black/40 px-3 py-1 backdrop-blur-sm">
          <div className="flex items-center gap-1">
            <svg className="h-4 w-4 fill-current text-amber-400" viewBox="0 0 20 20" aria-hidden>
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-medium text-white">{trek.rating}</span>
            <span className="text-sm text-white/70">({trek.reviewCount})</span>
          </div>
        </div>
      )}

      {/* Overlaid content */}
      <div className="absolute inset-x-0 bottom-0 z-20 p-5 sm:p-6">
        <div className="mb-1 flex items-center text-sm text-white/80">
          <svg className="mr-1 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {trek.location || trek.region}
        </div>
        <h3 className="mb-2 text-lg font-semibold tracking-[-0.01em] text-white transition-colors duration-150 ease-out group-hover:text-emerald-300 sm:text-xl">{trek.name}</h3>

        <div className="mb-3 flex items-center justify-between gap-3 text-sm text-white/80">
          <div className="flex items-center">
            <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            {trek.days} days
          </div>
          <div className="flex items-center">
            <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
            Max {trek.groupSize || 15}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/20 pt-3">
          <div className="flex min-w-0 flex-col">
            <span className="text-2xl font-bold leading-tight text-white"><Price inr={trek.price} /></span>
            <span className="whitespace-nowrap text-xs text-white/70">per person</span>
            {priceRoute(trek) && <span className="truncate text-xs font-medium text-white/90">{priceRoute(trek)}</span>}
          </div>
          {/* Looks like the primary Button; the whole card is the link, so this is a span. */}
          <span className={buttonVariants({ className: "h-10 shrink-0 px-4 group-hover:bg-emerald-700" })}>
            Reserve Spot
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /><path strokeLinecap="round" strokeLinejoin="round" d="m12 5 7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
