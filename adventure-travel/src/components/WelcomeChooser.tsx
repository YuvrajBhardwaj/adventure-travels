"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { byPopularity, treks } from "@/data/treks";
import { courses } from "@/data/courses";
import { destinations } from "@/data/destinations";
import Price from "@/components/Price";
import SmartImage from "@/components/SmartImage";
import NoPhoto from "@/components/NoPhoto";
import { transition } from "@/lib/motion";

interface PreviewItem {
  key: string;
  name: string;
  href: string;
  image?: string;
  meta: string;
  price?: number;
}

interface Tile {
  id: string;
  label: string;
  sub: string;
  href: string;
  image?: string;
  items: PreviewItem[];
}

function buildTiles(): Tile[] {
  // Most popular first (Kuari Pass, Pangarchula, …), then featured, then by rating.
  const trekItems = byPopularity(
    [...treks].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || (b.rating ?? 0) - (a.rating ?? 0))
  )
    .slice(0, 8)
    .map<PreviewItem>((t) => ({
      key: t.slug,
      name: t.name,
      href: `/treks/${t.slug}`,
      image: t.image,
      meta: `${t.days} days · ${t.difficulty}`,
      price: t.price,
    }));

  const courseItems = courses.map<PreviewItem>((c) => ({
    key: c.slug,
    name: c.name,
    href: `/courses/${c.slug}`,
    image: c.image,
    meta: `${c.duration} · ${c.type}`,
    price: c.tiers?.length ? Math.min(...c.tiers.map((t) => t.priceBase)) : c.price,
  }));

  const destinationItems = destinations.slice(0, 8).map<PreviewItem>((d) => ({
    key: d.slug,
    name: d.name,
    href: "/destinations",
    image: d.image,
    meta: `${d.region} · ${d.popularTreks.length} treks`,
  }));

  return [
    { id: "treks", label: "Treks", sub: `${treks.length} routes`, href: "/treks", image: trekItems.find((t) => t.image)?.image, items: trekItems },
    { id: "courses", label: "Courses", sub: `${courses.length} courses`, href: "/courses", image: courseItems[0].image, items: courseItems },
    { id: "destinations", label: "Destinations", sub: `${destinations.length} regions`, href: "/destinations", image: destinationItems[0].image, items: destinationItems },
  ];
}

/**
 * "Where to today?" section under the home hero: pick treks, courses or destinations and
 * see what's inside. It used to be a full-screen gate on the first visit; Google discourages
 * those for visitors arriving from search, so it now sits in the page (and its HTML).
 */
export default function WelcomeChooser() {
  const reduceMotion = useReducedMotion();
  const tiles = useMemo(() => buildTiles(), []);
  const [activeId, setActiveId] = useState(tiles[0].id);
  const tileRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onTileKey = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (index + (e.key === "ArrowRight" ? 1 : -1) + tiles.length) % tiles.length;
    tileRefs.current[next]?.focus();
  };

  const active = tiles.find((t) => t.id === activeId) ?? tiles[0];

  return (
    <section aria-labelledby="where-to-heading" className="relative bg-background py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8">
        <div className="min-w-0 lg:col-span-4">
          {/* the page's one small label */}
          <p className="font-nav text-xs font-semibold uppercase tracking-[0.28em] text-muted">Himalayan Arc Adventure</p>
          <h2 id="where-to-heading" className="mt-4 font-heading text-4xl font-medium leading-[1.04] tracking-[-0.025em] text-foreground sm:text-5xl">
            Where to today?
          </h2>
          <p className="mt-4 max-w-xs text-base leading-relaxed text-muted">Pick a door. You can always change your mind.</p>

          {/* three doors as a typographic index; each shows what's inside it */}
          <div role="group" aria-label="Sections" className="mt-8 flex gap-x-7 gap-y-1 lg:flex-col lg:gap-0">
            {tiles.map((tile, i) => {
              const isActive = tile.id === activeId;
              return (
                <button
                  key={tile.id}
                  ref={(el) => {
                    tileRefs.current[i] = el;
                  }}
                  type="button"
                  aria-pressed={isActive}
                  onMouseEnter={() => setActiveId(tile.id)}
                  onFocus={() => setActiveId(tile.id)}
                  onClick={() => setActiveId(tile.id)}
                  onKeyDown={(e) => onTileKey(e, i)}
                  className={`group relative min-h-11 border-foreground/15 text-left transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none lg:flex lg:items-baseline lg:justify-between lg:border-t lg:py-4 ${
                    isActive ? "text-foreground" : "text-foreground/45 hover:text-foreground/75"
                  }`}
                >
                  <span className="block font-heading text-xl font-medium tracking-[-0.015em] sm:text-2xl lg:text-3xl">
                    {tile.label}
                  </span>
                  <span className="font-nav block text-xs tabular-nums text-muted">{tile.sub}</span>
                  <span
                    aria-hidden
                    className={`absolute inset-x-0 bottom-0 h-[2px] origin-left bg-primary transition-transform duration-200 ease-out motion-reduce:transition-none lg:inset-x-0 lg:bottom-auto lg:top-[-1px] ${
                      isActive ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* What's inside the highlighted door */}
        {/* min-w-0: a grid column otherwise grows to fit the card row, so the row never scrolls on phones. */}
        <div className="min-w-0 lg:col-span-8">
          <div className="flex items-end justify-between gap-4 border-b border-foreground/15 pb-3">
            <p className="font-nav text-xs font-semibold uppercase tracking-[0.2em] text-muted">Inside {active.label}</p>
            <Link
              href={active.href}
              className="inline-flex min-h-11 items-center text-sm font-semibold text-foreground underline decoration-primary decoration-2 underline-offset-[6px] hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              See all {active.label.toLowerCase()} →
            </Link>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.ul
              key={active.id}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={transition("base")}
              data-lenis-prevent-touch className="mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-3 [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:gap-x-10 sm:gap-y-0 sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden"
            >
              {active.items.map((item) => (
                <li key={item.key} className="w-[58vw] max-w-[240px] shrink-0 snap-start sm:w-auto sm:max-w-none">
                  <Link
                    href={item.href}
                    className="group flex flex-col gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:flex-row sm:items-center sm:gap-4 sm:border-b sm:border-foreground/10 sm:py-3"
                  >
                    <span className="relative block aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl sm:aspect-square sm:w-16">
                      {item.image ? (
                        <SmartImage
                          src={item.image}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105 motion-reduce:transition-none"
                        />
                      ) : (
                        <NoPhoto className="absolute inset-0 h-full w-full" />
                      )}
                    </span>
                    <span className="block min-w-0 flex-1">
                      <span className="block truncate font-heading text-lg font-medium leading-tight text-foreground group-hover:text-primary">
                        {item.name}
                      </span>
                      <span className="font-nav mt-0.5 block truncate text-xs text-muted">{item.meta}</span>
                      {item.price ? (
                        <span className="mt-0.5 block text-xs text-foreground/80 sm:hidden">
                          From <Price inr={item.price} />
                        </span>
                      ) : null}
                    </span>
                    {item.price ? (
                      <span className="hidden shrink-0 text-right text-xs text-muted sm:block">
                        From{" "}
                        <span className="block text-sm font-medium text-foreground">
                          <Price inr={item.price} />
                        </span>
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </motion.ul>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
