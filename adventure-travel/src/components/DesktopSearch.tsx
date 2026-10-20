"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { searchAll } from "@/lib/searchIndex";
import { Input } from "@/components/ui/input";
import { transition } from "@/lib/motion";

export default function DesktopSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = searchAll(query);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const go = () => {
    router.push(`/treks${query.trim() ? `?search=${encodeURIComponent(query.trim())}` : ""}`);
    setOpen(false);
    setQuery("");
  };

  return (
    // Keeps the icon's 40px slot in the bar; the open field overlays the links to its left,
    // so opening search never pushes Log in / Sign up off the bar at 1024px.
    <div ref={wrapRef} className="relative hidden h-10 w-10 lg:block">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          aria-label="Search treks and courses"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-colors duration-150 ease-out hover:bg-white/10 hover:text-white"
        >
          <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      ) : (
        <motion.div
          className="dark absolute right-0 top-0 z-10 w-72"
          initial={reduce ? { opacity: 0 } : { opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={transition("base")}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              go();
            }}
            className="relative"
          >
            <label htmlFor="desktop-search" className="sr-only">Search treks and courses</label>
            <Input
              id="desktop-search"
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search treks, courses…"
              autoComplete="off"
              className="h-10 pl-4 pr-11 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)] dark:bg-navy-deep dark:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)]"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-emerald-600 text-white transition-colors duration-150 ease-out hover:bg-emerald-500"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          <AnimatePresence>
            {query.trim() && (
              <motion.div
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: transition("fast", "inOut") }}
                transition={transition("base")}
                className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-100 bg-white p-1.5 shadow-2xl"
              >
                {results.length > 0 ? (
                  results.map((r) => (
                    <Link
                      key={r.href}
                      href={r.href}
                      onClick={() => {
                        setOpen(false);
                        setQuery("");
                      }}
                      className="flex items-center justify-between gap-3 rounded-xl px-3.5 py-3 text-sm text-foreground transition-colors duration-150 ease-out hover:bg-emerald-50 focus-visible:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500"
                    >
                      <span className="font-medium">{r.name}</span>
                      <span className="flex-shrink-0 text-xs text-muted">{r.sub}</span>
                    </Link>
                  ))
                ) : (
                  <button
                    type="button"
                    onClick={go}
                    className="block w-full rounded-xl px-3.5 py-3 text-left text-sm text-muted transition-colors duration-150 ease-out hover:bg-emerald-50 focus-visible:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500"
                  >
                    No matches — see treks filtered by &ldquo;{query.trim()}&rdquo;
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
