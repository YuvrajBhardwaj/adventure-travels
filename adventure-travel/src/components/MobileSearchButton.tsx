"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { searchAll } from "@/lib/searchIndex";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function MobileSearchButton() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The button only exists below `md`; close the sheet if the window grows past it.
  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => mq.matches && setOpen(false);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [open]);

  const results = searchAll(query);

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            aria-label="Search treks"
            className={`fixed bottom-6 left-4 z-[72] flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-xl transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-opacity ${
              visible && !open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
            }`}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </SheetTrigger>

        {/* Focus lands in the field when the sheet opens (Radix autofocus) and returns to the button on close. */}
        <SheetContent
          side="bottom"
          title="Search treks"
          hideTitle
          tone="light"
          className="px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-14 md:hidden"
        >
          <form
            action="/treks"
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = `/treks${query.trim() ? `?search=${encodeURIComponent(query.trim())}` : ""}`;
            }}
            className="relative"
          >
            <label htmlFor="sticky-search" className="sr-only">Search for Treks / Trips</label>
            <Input
              id="sticky-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for Treks / Trips..."
              autoComplete="off"
              className="h-12 pl-4 pr-14"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg bg-emerald-600 text-white transition-colors duration-150 ease-out hover:bg-emerald-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          {query.trim() && (
            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-100 bg-white p-1">
              {results.length > 0 ? (
                results.map((r) => (
                  <Link
                    key={r.href}
                    href={r.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-11 items-center justify-between gap-3 rounded-xl px-3.5 py-3 text-sm text-foreground transition-colors duration-150 ease-out hover:bg-emerald-50 active:bg-emerald-50"
                  >
                    <span className="font-medium">{r.name}</span>
                    <span className="flex-shrink-0 text-xs text-muted">{r.sub}</span>
                  </Link>
                ))
              ) : (
                <Link
                  href={`/treks?search=${encodeURIComponent(query.trim())}`}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3.5 py-3 text-sm text-muted transition-colors duration-150 ease-out hover:bg-emerald-50 active:bg-emerald-50"
                >
                  No matches — see all treks filtered by &ldquo;{query.trim()}&rdquo;
                </Link>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
