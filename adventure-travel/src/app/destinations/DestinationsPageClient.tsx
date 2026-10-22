"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { destinations, sortOptions } from "@/data/destinations";
import SmartImage from "@/components/SmartImage";
import { FadeUp } from "@/components/MotionWrapper";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";

type Dest = (typeof destinations)[number];

/** Up to three of the destination's treks as plain links, then the "+N more" count. */
function PopularTreks({ dest }: { dest: Dest }) {
  return (
    <p className="mt-4 flex flex-wrap items-center gap-x-1 text-sm text-muted">
      {dest.popularTreks.slice(0, 3).map((trek, i) => (
        <span key={trek.slug} className="inline-flex items-center">
          {i > 0 && <span aria-hidden className="mr-1 text-slate-300">·</span>}
          <Link
            href={`/treks/${trek.slug}`}
            className="inline-flex min-h-11 items-center font-medium text-foreground underline decoration-slate-300 underline-offset-4 transition-colors duration-150 ease-out hover:text-emerald-700 hover:decoration-emerald-600"
          >
            {trek.name}
          </Link>
        </span>
      ))}
      {dest.popularTreks.length > 3 && (
        <span className="inline-flex min-h-11 items-center">
          <span aria-hidden className="mr-1 text-slate-300">·</span>+{dest.popularTreks.length - 3} more
        </span>
      )}
    </p>
  );
}

const difficultyRanges = ["All Categories", "Himalayan Range", "Mountain Region", "Glacial Lakes", "Easy Access", "Summit Climbs", "State Region", "Seasonal"];

export default function DestinationsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("popularity");

  const filteredDestinations = useMemo(() => {
    let result = [...destinations];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.region.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== "All Categories") {
      result = result.filter((d) => d.category === selectedCategory);
    }

    switch (sortBy) {
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "trekCount":
        result.sort((a, b) => b.popularTreks.length - a.popularTreks.length);
        break;
      case "popularity":
      default:
        break;
    }

    return result;
  }, [search, selectedCategory, sortBy]);

  const feature = filteredDestinations[0];
  const rest = filteredDestinations.slice(1);

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      {/* Hero — full-bleed photo, one big line, bottom-left. Visible from the first paint (no entrance animation). */}
      <section className="relative flex min-h-[460px] items-end overflow-hidden bg-navy-hero sm:min-h-[56vh]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80"
          alt="Destinations Banner"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-hero/75 via-navy-hero/25 to-navy-hero/90" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-12 pt-32 sm:px-6 sm:pb-16 lg:px-8">
          <p className="mb-4 text-sm text-white/80">Explore Our Treks</p>
          <div className="grid items-end gap-6 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-8">
              <h1 className="font-heading text-6xl font-semibold leading-[0.98] tracking-[-0.03em] text-white sm:text-7xl lg:text-8xl [text-shadow:0_2px_30px_rgba(2,6,23,0.55)]">
                Destinations
              </h1>
              <p className="mt-6 max-w-xl text-lg text-white/85 [text-shadow:0_1px_12px_rgba(2,6,23,0.7)]">
                From the Himalayan peaks of Uttarakhand to the valleys of Himachal Pradesh — discover handcrafted trekking adventures in India&apos;s most stunning regions.
              </p>
            </div>
            <div className="lg:col-span-4 lg:text-right">
              <p className="font-heading text-6xl font-semibold leading-none tracking-[-0.03em] text-white sm:text-7xl">{destinations.length}</p>
              <p className="mt-2 text-sm text-white/70">destinations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Panel + Search */}
      <section className="sticky top-20 z-30 border-b border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-card">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-3 md:flex-row md:gap-4">
            {/* Search */}
            <div className="relative w-full flex-1">
              <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search destinations..."
                aria-label="Search destinations"
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Category"
              wrapperClassName="w-full md:w-auto"
            >
              {difficultyRanges.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>

            {/* Sort */}
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort by"
              wrapperClassName="w-full md:w-auto"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Select>
          </div>
        </div>
      </section>

      {/* Destinations — one large feature, then a quieter list */}
      <section className="py-section-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-8 text-sm text-muted">
            Showing <span className="font-semibold text-primary">{filteredDestinations.length}</span> destinations
          </p>

          {!feature ? (
            <EmptyState
              icon={<Search />}
              title="No destinations found"
              description="Try adjusting your search or filters"
              className="py-20"
            />
          ) : (
            <>
              <article className="group grid items-end gap-6 lg:grid-cols-12 lg:gap-10">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-navy sm:aspect-[16/10] lg:col-span-8">
                  <SmartImage
                    src={feature.image}
                    alt={feature.name}
                    loading="eager"
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                  <div className="absolute inset-0 z-[2] bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <p className="absolute bottom-4 left-4 z-[3] text-sm text-white/90 sm:bottom-6 sm:left-6">
                    {feature.category} <span aria-hidden className="mx-1.5 text-white/50">·</span> {feature.popularTreks.length} Treks
                  </p>
                </div>
                <div className="lg:col-span-4">
                  <p className="text-sm text-muted">{feature.region}, {feature.country}</p>
                  <h3 className="mt-2 font-heading text-4xl font-semibold tracking-[-0.025em] text-primary">
                    <Link
                      href={`/treks?destination=${encodeURIComponent(feature.slug)}`}
                      className="underline-offset-4 hover:underline"
                    >
                      <span className="sr-only">Explore Destination: </span>
                      {feature.name}
                    </Link>
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-muted">{feature.description}</p>
                  <PopularTreks dest={feature} />
                  <Link
                    href={`/treks?destination=${encodeURIComponent(feature.slug)}`}
                    className={cn(buttonVariants({ size: "lg" }), "mt-6 px-6")}
                  >
                    View {feature.popularTreks.length} {feature.popularTreks.length === 1 ? "Trek" : "Treks"}
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </article>

              {rest.length > 0 && (
                <div className="mt-14 divide-y divide-slate-200 border-t border-slate-200 dark:divide-white/10 dark:border-white/10">
                  {rest.map((dest) => (
                    <article key={dest.id} className="group grid gap-5 py-7 sm:grid-cols-12 sm:gap-8">
                      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-navy sm:col-span-4 lg:col-span-3">
                        <SmartImage
                          src={dest.image}
                          alt={dest.name}
                          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        />
                      </div>
                      <div className="sm:col-span-8 lg:col-span-9">
                        <p className="text-sm text-muted">
                          {dest.region}, {dest.country} <span aria-hidden className="mx-1.5 text-slate-300">·</span> {dest.category}{" "}
                          <span aria-hidden className="mx-1.5 text-slate-300">·</span> {dest.popularTreks.length} Treks
                        </p>
                        <h3 className="mt-1 font-heading text-2xl font-semibold text-primary">
                          <Link
                            href={`/treks?destination=${encodeURIComponent(dest.slug)}`}
                            className="underline-offset-4 hover:underline"
                          >
                            <span className="sr-only">Explore Destination: </span>
                            {dest.name}
                          </Link>
                        </h3>
                        <p className="mt-2 line-clamp-2 max-w-3xl text-base text-muted">{dest.description}</p>
                        <PopularTreks dest={dest} />
                        <Link
                          href={`/treks?destination=${encodeURIComponent(dest.slug)}`}
                          className="mt-1 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-400"
                        >
                          View {dest.popularTreks.length} {dest.popularTreks.length === 1 ? "Trek" : "Treks"}
                          <svg className="h-4 w-4 transition-transform duration-150 ease-out group-hover:translate-x-1 motion-reduce:transition-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-navy py-section-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeUp className="max-w-2xl">
            <h2 className="mb-5 font-heading text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl">
              Not Sure Which Destination?
            </h2>
            <p className="mb-8 text-lg text-white/80">
              Our team will help you pick the perfect trek based on your fitness level, interests, and schedule. Every adventure is tailored just for you.
            </p>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-6">
              <Link
                href="/contact"
                className={cn(buttonVariants({ size: "lg" }), "px-8 focus-visible:ring-offset-navy")}
              >
                Plan My Trek
              </Link>
              <a
                href="https://wa.me/917817912062?text=Hi!%20I%20need%20help%20choosing%20a%20trek."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center text-base font-semibold text-white underline underline-offset-4 hover:text-white/80"
              >
                Chat on WhatsApp
              </a>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
