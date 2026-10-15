"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { treks } from "@/data/treks";
import { courses } from "@/data/courses";
import { destinations } from "@/data/destinations";
import Price from "@/components/Price";
import SmartImage from "@/components/SmartImage";
import NoPhoto from "@/components/NoPhoto";

const SEEN_KEY = "hac_welcome_seen";

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
  // Featured treks first, then by rating — a sensible "top of the shelf".
  const trekItems = [...treks]
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || (b.rating ?? 0) - (a.rating ?? 0))
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
 * Netflix-style "who's watching?" gate for the home page. Shown once per browser
 * session, only on "/", and only after hydration — so crawlers and deep links
 * (e.g. /treks/kedarkantha) always get the real page straight away.
 */
export default function WelcomeChooser() {
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const tiles = useMemo(() => buildTiles(), []);
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState(tiles[0].id);
  const tileRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  // Decide once, after mount, whether to show.
  useEffect(() => {
    if (pathname !== "/") return;
    try {
      if (sessionStorage.getItem(SEEN_KEY)) return;
    } catch {
      return; // storage blocked → don't risk showing it on every page load
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(true);
  }, [pathname]);

  const dismiss = useCallback(() => {
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }, []);

  const go = useCallback(
    (href: string) => {
      dismiss();
      router.push(href);
    },
    [dismiss, router]
  );

  // Lock page scroll, focus the first tile, and close on Escape while open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    tileRefs.current[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
      if (e.key === "Tab" && panelRef.current) {
        // keep keyboard focus inside the dialog
        const focusable = panelRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, dismiss]);

  const onTileKey = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (index + (e.key === "ArrowRight" ? 1 : -1) + tiles.length) % tiles.length;
    tileRefs.current[next]?.focus();
  };

  const active = tiles.find((t) => t.id === activeId) ?? tiles[0];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="welcome"
          role="dialog"
          aria-modal="true"
          aria-label="Choose what to explore"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[210] overflow-y-auto bg-[#0b0f17]"
        >
          {/* soft aurora behind everything */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 left-1/2 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-emerald-500/15 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
          </div>

          <div ref={panelRef} className="relative mx-auto flex min-h-full max-w-5xl flex-col items-center px-4 py-10 sm:py-14">
            <p className="font-nav text-xs font-bold uppercase tracking-[0.35em] text-emerald-400">Himalayan Arc Adventure</p>
            <h2 className="mt-3 text-center font-heading text-3xl font-bold text-white sm:text-5xl">Where to today?</h2>
            <p className="mt-2 text-center text-sm text-white/55">Pick a door. You can always change your mind.</p>

            {/* Profile-style tiles */}
            <div role="group" aria-label="Sections" className="mt-9 flex flex-wrap justify-center gap-4 sm:gap-8">
              {tiles.map((tile, i) => {
                const isActive = tile.id === activeId;
                return (
                  <motion.button
                    key={tile.id}
                    ref={(el) => {
                      tileRefs.current[i] = el;
                    }}
                    type="button"
                    onMouseEnter={() => setActiveId(tile.id)}
                    onFocus={() => setActiveId(tile.id)}
                    onKeyDown={(e) => onTileKey(e, i)}
                    onClick={() => go(tile.href)}
                    initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: reduceMotion ? 0 : 0.12 + i * 0.08, duration: 0.4 }}
                    className="group flex w-[100px] flex-col items-center gap-3 text-center outline-none sm:w-[150px] lg:w-[170px]"
                  >
                    <span
                      className={`relative block aspect-square w-full overflow-hidden rounded-xl bg-slate-800 transition-all duration-200 motion-reduce:transition-none ${
                        isActive ? "scale-105 ring-4 ring-white" : "ring-0 ring-white/0 opacity-80"
                      }`}
                    >
                      {tile.image ? (
                        <SmartImage src={tile.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                      ) : (
                        <NoPhoto className="absolute inset-0 h-full w-full" />
                      )}
                      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </span>
                    <span>
                      <span className={`block font-heading text-base font-bold transition-colors sm:text-lg ${isActive ? "text-white" : "text-white/55"}`}>
                        {tile.label}
                      </span>
                      <span className="block text-xs text-white/40">{tile.sub}</span>
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* What's inside the highlighted tile */}
            <div className="mt-10 w-full">
              <div className="mb-3 flex items-end justify-between gap-4">
                <p className="font-nav text-xs font-bold uppercase tracking-[0.25em] text-white/50">
                  Inside {active.label}
                </p>
                <Link
                  href={active.href}
                  onClick={dismiss}
                  className="text-sm font-semibold text-emerald-400 hover:underline"
                >
                  See all {active.label.toLowerCase()} →
                </Link>
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.ul
                  key={active.id}
                  initial={reduceMotion ? false : { opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, x: -16 }}
                  transition={{ duration: 0.2 }}
                  className="flex gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {active.items.map((item) => (
                    <li key={item.key} className="w-[200px] shrink-0 sm:w-[230px]">
                      <Link
                        href={item.href}
                        onClick={dismiss}
                        className="group block overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10 transition-all hover:-translate-y-1 hover:bg-white/10 hover:ring-white/30 focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                      >
                        <span className="relative block aspect-[16/10] overflow-hidden">
                          {item.image ? (
                            <SmartImage
                              src={item.image}
                              alt=""
                              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                            />
                          ) : (
                            <NoPhoto className="absolute inset-0 h-full w-full" />
                          )}
                        </span>
                        <span className="block p-3">
                          <span className="block truncate text-sm font-semibold text-white">{item.name}</span>
                          <span className="mt-0.5 block truncate text-xs text-white/50">{item.meta}</span>
                          {item.price ? (
                            <span className="mt-1 block text-xs font-semibold text-emerald-400">
                              From <Price inr={item.price} />
                            </span>
                          ) : null}
                        </span>
                      </Link>
                    </li>
                  ))}
                </motion.ul>
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={dismiss}
              className="mt-8 rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              Skip and see the home page
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
