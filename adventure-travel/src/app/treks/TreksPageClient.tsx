"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { treks, REGIONS, priceRoute, byPopularity, type Trek } from "@/data/treks";
import { destinations } from "@/data/destinations";
import SmartImage from "@/components/SmartImage";
import NoPhoto from "@/components/NoPhoto";
import Price from "@/components/Price";
import WallpaperCarousel from "@/components/WallpaperCarousel";
import { ElevationLine } from "@/components/ElevationLine";
import { cn } from "@/lib/utils";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
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
const HERO_HEIGHT = "h-64 rounded-2xl sm:h-80 lg:h-[26rem]";
// Real data for the header: the lowest and highest "highest point" across all routes.
const ALTITUDE_LOW = Math.min(...treks.map((t) => t.maxAltitude));
const ALTITUDE_HIGH = Math.max(...treks.map((t) => t.maxAltitude));

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
    <main id="main" className="min-h-screen bg-white dark:bg-background">
      {/* Editorial header: navy under the fixed navbar, title and data left, the photo slideshow right as a framed picture. */}
      <header className="bg-navy text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-10 pt-28 sm:px-6 lg:grid-cols-12 lg:items-end lg:gap-12 lg:px-8 lg:pb-14 lg:pt-32">
          <div className="lg:col-span-5 lg:pb-1">
            <h1 className="font-heading text-5xl font-medium leading-[0.98] tracking-[-0.02em] sm:text-6xl xl:text-7xl">All Trekking Adventures</h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/75 sm:text-lg">
              Explore our complete collection of world-class trekking itineraries, from beginner-friendly walks to extreme mountain expeditions.
            </p>
            <div className="mt-8 border-t border-white/15 pt-4">
              <p className="font-heading text-4xl font-medium tabular-nums leading-none sm:text-5xl">
                {ALTITUDE_LOW.toLocaleString("en-IN")} – {ALTITUDE_HIGH.toLocaleString("en-IN")}
                <span className="ml-1.5 font-nav text-lg font-normal text-white/60">m</span>
              </p>
              <p className="mt-2 text-sm text-white/60">Highest points of our routes, lowest to highest</p>
            </div>
          </div>
          <div className="lg:col-span-7">
            <WallpaperCarousel
              slides={HERO_SLIDES}
              label="Photos from our treks"
              className={HERO_HEIGHT}
              scrimClassName="bg-gradient-to-t from-black/55 via-transparent to-transparent"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="py-section-sm mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-12">
          {/* Filters: hairlines, no panel. A collapsible row on phones, a sticky column on desktop. */}
          <aside className="lg:w-60 lg:shrink-0">
            <div className="border-y border-slate-200 lg:sticky lg:top-24 lg:border-y-0">
              <button
                type="button"
                onClick={() => setFiltersOpen((open) => !open)}
                aria-expanded={filtersOpen}
                aria-controls="trek-filter-controls"
                className="flex min-h-12 w-full items-center justify-between rounded-xl lg:hidden"
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
              <div className="mb-5 hidden border-b border-slate-200 pb-3 lg:block">
                <h3 className="text-2xl font-medium text-foreground">Filters</h3>
              </div>
              <div id="trek-filter-controls" className={`${filtersOpen ? "block" : "hidden"} space-y-5 pb-5 pt-1 lg:block lg:pb-0 lg:pt-0`}>
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
                <Button variant="link" onClick={clearFilters} className="h-11 px-0 text-emerald-700 hover:text-emerald-800">
                  Clear All Filters
                </Button>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="min-w-0 flex-1">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <p className="text-sm text-muted sm:text-base">Showing <span className="font-heading text-lg font-medium tabular-nums text-foreground">{filtered.length}</span> of {treks.length} adventures</p>
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
              // The first trek runs wide on desktop; the rest sit two across.
              <div className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2 lg:gap-x-8 lg:gap-y-10">
                {filtered.map((trek, i) => (
                  <TrekCard key={trek.id} trek={trek} featured={i === 0} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

/**
 * The site's signature trek card, also used by the trek hub pages (src/components/TrekHub.tsx).
 * Photo first and edge to edge (or the trek's own altitude line when it has no photo), the name in
 * Fraunces over a bottom scrim, highest point and days as the big numerals. The whole card is the link.
 * Sizes follow the card's own width (container queries), so it holds in one, two or three columns.
 * `featured` lets it span both columns of a two-column grid and go landscape on desktop.
 */
export function TrekCard({ trek, featured = false }: { trek: Trek; featured?: boolean }) {
  const route = priceRoute(trek);

  return (
    <Link
      href={`/treks/${trek.slug}`}
      className={cn(
        "group @container relative block aspect-[4/5] overflow-hidden rounded-2xl bg-navy-deep ring-1 ring-slate-900/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
        featured && "md:col-span-2 md:aspect-[16/9]"
      )}
    >
      {trek.image ? (
        <SmartImage
          src={trek.image}
          alt={trek.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      ) : (
        <NoPhoto className="absolute inset-0 h-full w-full" profile={trek.elevationProfile} label={trek.region} />
      )}

      {/* Bottom scrim: the card's text always sits on solid navy-to-clear, whatever the photo. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[80%] bg-gradient-to-t from-navy-deep via-navy-deep/80 to-transparent" />

      {/* Rating (unchanged size; owner decision pending) */}
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

      <div className={cn("absolute inset-x-0 bottom-0 z-20 p-4 @xs:p-5", featured && "md:max-w-2xl md:p-7")}>
        <p className="truncate text-xs text-white/70 @xs:text-sm">{trek.location || trek.region}</p>
        <h3 className={cn("mt-1 font-heading text-2xl font-medium leading-[1.08] tracking-[-0.01em] text-white @xs:text-[1.75rem]", featured && "md:text-4xl")}>
          {trek.name}
        </h3>

        {/* The route's own altitude profile. Photo-less cards draw it large in the panel instead. */}
        {trek.image && (
          <div className="mt-3 h-9 text-emerald-400">
            <ElevationLine profile={trek.elevationProfile} />
          </div>
        )}

        <div className={cn("flex items-end gap-6 @xs:gap-8", trek.image ? "mt-3" : "mt-5")}>
          <div>
            <p className="font-heading text-3xl font-medium tabular-nums leading-none text-white @xs:text-4xl">
              {trek.maxAltitude.toLocaleString("en-IN")}
              <span className="font-nav text-sm font-normal text-white/70"> m</span>
            </p>
            <p className="mt-1.5 text-xs text-white/60">Highest point</p>
          </div>
          <div>
            <p className="font-heading text-3xl font-medium tabular-nums leading-none text-white @xs:text-4xl">
              {trek.days}
              <span className="font-nav text-sm font-normal text-white/70"> days</span>
            </p>
            <p className="mt-1.5 text-xs text-white/60">Duration</p>
          </div>
          <div className="ml-auto text-right text-xs leading-snug text-white/70 @xs:text-sm">
            <p className="text-white/90">{trek.difficulty}</p>
            <p>Max {trek.groupSize || 15}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/20 pt-3">
          <p className="min-w-0 text-sm text-white/70">
            <span className="text-base font-semibold text-white"><Price inr={trek.price} /></span> per person
            {route && <span className="block truncate text-xs text-white/60">{route}</span>}
          </p>
          {/* The whole card is the link, so the call to action is an arrow; its words stay for screen readers. */}
          <span className="sr-only">Reserve Spot</span>
          <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/30 text-white transition-colors duration-150 ease-out group-hover:border-white group-hover:bg-white group-hover:text-navy">
            <svg className="h-4 w-4 transition-transform duration-150 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /><path strokeLinecap="round" strokeLinejoin="round" d="m12 5 7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
