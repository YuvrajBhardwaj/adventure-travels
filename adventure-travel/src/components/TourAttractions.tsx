"use client";

import { useState } from "react";
import NoPhoto from "@/components/NoPhoto";
import SmartImage from "@/components/SmartImage";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";

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
 * The name opens the description in place; the thumbnail opens the photo full size.
 * Closed descriptions are `hidden`, not unmounted, so the full text is in the static HTML.
 */
export default function TourAttractions({ attractions }: { attractions: TourAttraction[] }) {
  const [viewing, setViewing] = useState<TourAttraction | null>(null);
  // The last photo stays rendered while the viewer animates closed.
  const [shown, setShown] = useState<TourAttraction | null>(null);
  const open = (a: TourAttraction) => {
    setShown(a);
    setViewing(a);
  };

  return (
    <>
      <ul className="border-t border-foreground/20">
        {attractions.map((a) => (
          <AttractionRow key={a.name} attraction={a} onEnlarge={() => open(a)} />
        ))}
      </ul>
      <Dialog open={viewing !== null} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent size="full" tone="dark" hideTitle hideClose title={shown ? `${shown.name} photo` : "Photo"}>
          <div
            className="relative flex h-full w-full flex-col items-center justify-center gap-3 p-4"
            onClick={(e) => e.target === e.currentTarget && setViewing(null)}
          >
            <DialogClose
              aria-label="Close photo"
              className="absolute right-3 top-3 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white/80 transition-colors duration-150 ease-out hover:bg-black/60 hover:text-white"
            >
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </DialogClose>
            {shown?.photo && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={shown.photo}
                  alt={shown.photoAlt ?? shown.name}
                  className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl"
                  draggable={false}
                />
                <p className="font-heading text-lg text-white/90">{shown.name}</p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function AttractionRow({ attraction: a, onEnlarge }: { attraction: TourAttraction; onEnlarge: () => void }) {
  const [open, setOpen] = useState(false);
  const panelId = `attraction-${a.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const thumb = "relative block h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-24 sm:w-32";
  return (
    <li className="border-b border-foreground/15">
      <div className="flex items-center gap-4 py-4 sm:gap-6">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="group flex min-h-20 min-w-0 flex-1 cursor-pointer items-center text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <span className="min-w-0 flex-1">
            <span
              className={`block font-heading text-2xl font-medium leading-tight tracking-[-0.015em] group-hover:text-primary sm:text-3xl ${open ? "text-primary" : "text-foreground"}`}
            >
              {a.name}
            </span>
            <span className="mt-1 block text-sm leading-relaxed text-muted">{a.points}</span>
          </span>
        </button>
        {a.photo ? (
          <button
            type="button"
            onClick={onEnlarge}
            aria-label={`View photo: ${a.name}`}
            className={`group ${thumb} cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`}
          >
            <SmartImage
              src={a.photo}
              alt={a.photoAlt ?? a.name}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105 motion-reduce:transition-none"
            />
          </button>
        ) : (
          <span className={thumb}>
            <NoPhoto className="absolute inset-0 h-full w-full" />
          </span>
        )}
      </div>
      <div id={panelId} hidden={!open} className="pb-5 pr-4 sm:pr-40">
        <p className="text-base leading-relaxed text-slate-600">{a.text}</p>
      </div>
    </li>
  );
}
