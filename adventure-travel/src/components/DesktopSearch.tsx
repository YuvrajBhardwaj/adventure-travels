"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { searchAll } from "@/lib/searchIndex";

export default function DesktopSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
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
  }, [open ]);

  const go = () => {
    router.push(`/treks${query.trim() ? `?search=${encodeURIComponent(query.trim())}` : ""}`);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={wrapRef} className="relative hidden md:block">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          aria-label="Search treks and courses"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      ) : (
        <div className="w-64 lg:w-72">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              go();
            }}
            className="relative"
          >
            <label htmlFor="desktop-search" className="sr-only">Search treks and courses</label>
            <input
              id="desktop-search"
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search treks, courses…"
              autoComplete="off"
              className="w-full rounded-full border border-white/15 bg-white/10 py-2.5 pl-4 pr-10 text-sm text-white placeholder-white/40 outline-none backdrop-blur-sm focus:border-cyan-400/60 focus:bg-white/15"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-cyan-500 text-white transition-colors hover:bg-cyan-400"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          {query.trim() && (
            <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
              {results.length > 0 ? (
                results.map((r) => (
                  <Link
                    key={r.href}
                    href={r.href}
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                    }}
                    className="flex items-center justify-between gap-3 px-4 py-3 text-sm text-foreground transition-colors hover:bg-primary/5"
                  >
                    <span className="font-medium">{r.name}</span>
                    <span className="flex-shrink-0 text-xs text-muted">{r.sub}</span>
                  </Link>
                ))
              ) : (
                <button
                  type="button"
                  onClick={go}
                  className="block w-full px-4 py-3 text-left text-sm text-muted transition-colors hover:bg-primary/5"
                >
                  No matches — see treks filtered by &ldquo;{query.trim()}&rdquo;
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
