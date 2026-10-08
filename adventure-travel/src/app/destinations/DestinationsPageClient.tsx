"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { destinations, sortOptions } from "@/data/destinations";
import SmartImage from "@/components/SmartImage";

const difficultyRanges = ["All Categories", "Himalayan Range", "Mountain Region", "Glacial Lakes", "Easy Access", "Summit Climbs", "State Region", "Seasonal"];

export default function DestinationsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("popularity");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

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
      {/* Hero Banner */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80"
            alt="Destinations Banner"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/50 to-primary/80" />
        </div>
        <div className="relative z-10 flex h-full items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center px-6"
          >
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              Explore Our Treks
            </p>
            <h1 className="mb-6 text-5xl md:text-7xl font-heading font-bold text-white">
              Destinations
            </h1>
            <p className="max-w-2xl text-lg text-white/80">
              From the Himalayan peaks of Uttarakhand to the valleys of Himachal Pradesh — discover handcrafted trekking adventures in India&apos;s most stunning regions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter Panel + Search */}
      <section className="sticky top-20 z-30 bg-white dark:bg-card border-b border-gray-200 dark:border-white/10 shadow-sm">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search destinations..."
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-surface py-3 pl-10 pr-4 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-surface px-4 py-3 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all w-full md:w-auto"
            >
              {difficultyRanges.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-surface px-4 py-3 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all w-full md:w-auto"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-sm text-muted mb-6">
            Showing <span className="font-semibold text-primary">{filteredDestinations.length}</span> destinations
          </p>

          {filteredDestinations.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl font-semibold text-primary">No destinations found</p>
              <p className="text-muted mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDestinations.map((dest, i) => (
                <motion.div
                  key={dest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  onMouseEnter={() => setHoveredCard(dest.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative h-64 overflow-hidden">
                    <SmartImage
                      src={dest.image}
                      alt={dest.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Category badge */}
                    <div className="absolute top-4 left-4 z-10">
                      <span className="rounded-full bg-accent/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white">
                        {dest.category}
                      </span>
                    </div>

                    {/* Trek count */}
                    <div className="absolute top-4 right-4 z-10">
                      <span className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-bold text-primary">
                        {dest.popularTreks.length} Treks
                      </span>
                    </div>

                    {/* Hover overlay */}
                    <motion.div
                      initial={false}
                      animate={hoveredCard === dest.id ? { opacity: 1 } : { opacity: 0 }}
                      className="absolute inset-0 bg-primary/60 flex items-center justify-center z-10"
                    >
                      <span className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary shadow-lg">
                        Explore Destination
                      </span>
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="p-6 bg-white dark:bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-xs font-medium text-muted">{dest.region}, {dest.country}</span>
                    </div>
                    <h3 className="text-xl font-heading font-bold text-primary group-hover:text-accent transition-colors">
                      {dest.name}
                    </h3>
                    <p className="mt-3 text-sm text-muted line-clamp-3">
                      {dest.description}
                    </p>

                    {/* Popular treks tags */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {dest.popularTreks.slice(0, 3).map((trek) => (
                        <Link
                          key={trek.slug}
                          href={`/treks/${trek.slug}`}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-full bg-gray-100 dark:bg-white/10 px-3 py-1 text-xs font-medium text-primary hover:bg-accent hover:text-white transition-colors"
                        >
                          {trek.name}
                        </Link>
                      ))}
                      {dest.popularTreks.length > 3 && (
                        <span className="rounded-full bg-gray-100 dark:bg-white/10 px-3 py-1 text-xs font-medium text-muted">
                          +{dest.popularTreks.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/10">
                      <Link
                        href={`/treks?destination=${encodeURIComponent(dest.slug)}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-primary transition-colors"
                      >
                        View {dest.popularTreks.length} {dest.popularTreks.length === 1 ? 'Trek' : 'Treks'}
                        <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary/90 to-accent/80">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-6">
              Not Sure Which Destination?
            </h2>
            <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
              Our team will help you pick the perfect trek based on your fitness level, interests, and schedule. Every adventure is tailored just for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="rounded-xl bg-white px-8 py-4 text-base font-semibold text-primary shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                Plan My Trek
              </Link>
              <a
                href="https://wa.me/917817912062?text=Hi!%20I%20need%20help%20choosing%20a%20trek."
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border-2 border-white px-8 py-4 text-base font-semibold text-white hover:bg-white hover:text-primary transition-all"
              >
                Chat on WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
