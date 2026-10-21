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

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      {/* Hero Banner — visible from the first paint (no entrance animation) */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80"
            alt="Destinations Banner"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/50 to-primary/80" />
        </div>
        <div className="relative z-10 flex h-full items-center justify-center">
          <div className="px-4 text-center sm:px-6">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              Explore Our Treks
            </p>
            <h1 className="mb-6 font-heading text-5xl font-bold text-white md:text-7xl">
              Destinations
            </h1>
            <p className="max-w-2xl text-lg text-white/80">
              From the Himalayan peaks of Uttarakhand to the valleys of Himachal Pradesh — discover handcrafted trekking adventures in India&apos;s most stunning regions.
            </p>
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

      {/* Destinations Grid */}
      <section className="py-section-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-6 text-sm text-muted">
            Showing <span className="font-semibold text-primary">{filteredDestinations.length}</span> destinations
          </p>

          {filteredDestinations.length === 0 ? (
            <EmptyState
              icon={<Search />}
              title="No destinations found"
              description="Try adjusting your search or filters"
              className="py-20"
            />
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDestinations.map((dest) => (
                <div
                  key={dest.id}
                  className="group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5 transition-shadow duration-300 ease-out hover:shadow-lg dark:bg-card"
                >
                  {/* Image */}
                  <div className="relative h-64 overflow-hidden">
                    <SmartImage
                      src={dest.image}
                      alt={dest.name}
                      className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Category badge */}
                    <div className="absolute left-4 top-4 z-10">
                      <span className="rounded-full bg-accent/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                        {dest.category}
                      </span>
                    </div>

                    {/* Trek count */}
                    <div className="absolute right-4 top-4 z-10">
                      <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-primary backdrop-blur-sm">
                        {dest.popularTreks.length} Treks
                      </span>
                    </div>

                    {/* Hover overlay (CSS opacity, pointer devices only) */}
                    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-primary/60 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100">
                      <span className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary shadow-lg">
                        Explore Destination
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 sm:p-6">
                    <div className="mb-2 flex items-center gap-2">
                      <svg className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-xs font-medium text-muted">{dest.region}, {dest.country}</span>
                    </div>
                    <h3 className="font-heading text-lg font-semibold text-primary transition-colors duration-150 ease-out group-hover:text-emerald-700">
                      {dest.name}
                    </h3>
                    <p className="mt-3 line-clamp-3 text-sm text-muted">
                      {dest.description}
                    </p>

                    {/* Popular treks tags */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {dest.popularTreks.slice(0, 3).map((trek) => (
                        <Link
                          key={trek.slug}
                          href={`/treks/${trek.slug}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex min-h-8 items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-primary transition-colors duration-150 ease-out hover:bg-accent hover:text-white dark:bg-white/10"
                        >
                          {trek.name}
                        </Link>
                      ))}
                      {dest.popularTreks.length > 3 && (
                        <span className="inline-flex min-h-8 items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-muted dark:bg-white/10">
                          +{dest.popularTreks.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="mt-5 border-t border-slate-100 pt-4 dark:border-white/10">
                      <Link
                        href={`/treks?destination=${encodeURIComponent(dest.slug)}`}
                        className={cn(buttonVariants({ variant: "outline" }), "w-full border-emerald-600 text-emerald-700 hover:bg-emerald-50")}
                      >
                        View {dest.popularTreks.length} {dest.popularTreks.length === 1 ? 'Trek' : 'Treks'}
                        <svg className="h-4 w-4 transition-transform duration-150 ease-out group-hover:translate-x-1 motion-reduce:transition-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-primary via-primary/90 to-accent/80 py-section-sm">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <FadeUp>
            <h2 className="mb-6 font-heading text-3xl font-bold tracking-[-0.02em] text-white sm:text-4xl">
              Not Sure Which Destination?
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-white/85">
              Our team will help you pick the perfect trek based on your fitness level, interests, and schedule. Every adventure is tailored just for you.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/contact"
                className={cn(buttonVariants({ size: "lg" }), "bg-white px-8 text-emerald-700 shadow-lg hover:bg-emerald-50 hover:shadow-xl focus-visible:ring-white focus-visible:ring-offset-emerald-600")}
              >
                Plan My Trek
              </Link>
              <a
                href="https://wa.me/917817912062?text=Hi!%20I%20need%20help%20choosing%20a%20trek."
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "border-2 border-white px-8 text-white hover:bg-white hover:text-emerald-700 focus-visible:ring-white focus-visible:ring-offset-emerald-600")}
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
