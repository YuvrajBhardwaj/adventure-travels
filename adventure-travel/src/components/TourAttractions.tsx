"use client";

import { useState } from "react";
import NoPhoto from "@/components/NoPhoto";
import SmartImage from "@/components/SmartImage";

export interface TourAttraction {
  name: string;
  /** Short tags for the row, e.g. "Snow slopes • Chairlift • Ski lessons". */
  points: string;
  text: string;
  /** One of our own photos (public/assets/...). Without one the row shows the NoPhoto mark. */
  photo?: string;
  photoAlt?: string;
}

/**
 * "Top attractions" on tour pages, in the same hairline-row style as the home page's
 * "Choose Your Mountain" list (CampingSection): serif name, tag line, thumbnail on the right.
 * Each row opens its description in place. Closed descriptions are `hidden`, not unmounted,
 * so the full text is in the static HTML for search engines.
 */
export default function TourAttractions({ attractions }: { attractions: TourAttraction[] }) {
  return (
    <ul className="border-t border-foreground/20">
      {attractions.map((a) => (
        <AttractionRow key={a.name} attraction={a} />
      ))}
    </ul>
  );
}

function AttractionRow({ attraction: a }: { attraction: TourAttraction }) {
  const [open, setOpen] = useState(false);
  const panelId = `attraction-${a.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <li className="border-b border-foreground/15">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="group flex min-h-24 w-full cursor-pointer items-center gap-4 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:gap-6"
      >
        <span className="min-w-0 flex-1">
          <span
            className={`block font-heading text-2xl font-medium leading-tight tracking-[-0.015em] group-hover:text-primary sm:text-3xl ${open ? "text-primary" : "text-foreground"}`}
          >
            {a.name}
          </span>
          <span className="mt-1 block text-sm leading-relaxed text-muted">{a.points}</span>
        </span>
        <span className="relative block h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-24 sm:w-32">
          {a.photo ? (
            <SmartImage
              src={a.photo}
              alt={a.photoAlt ?? a.name}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105 motion-reduce:transition-none"
            />
          ) : (
            <NoPhoto className="absolute inset-0 h-full w-full" />
          )}
        </span>
      </button>
      <div id={panelId} hidden={!open} className="pb-5 pr-4 sm:pr-40">
        <p className="text-base leading-relaxed text-slate-600">{a.text}</p>
      </div>
    </li>
  );
}
