"use client";

import { useEffect, useState } from "react";
import { FadeUp } from "./MotionWrapper";
import SmartImage from "./SmartImage";
import ContactPopup from "./ContactPopup";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const HERO_IMAGE = "/assets/camping/camp-12.jpg";

/* Real camp photos (local, compressed). camp-NN doubles as popup gallery material. */
const CAMPS = [
  {
    name: "Auli",
    points: "Mountain camping • Stargazing • Bonfire • Nature walks",
    image: "/assets/camping/camp-06.jpg",
    gallery: ["/assets/camping/camp-06.jpg", "/assets/camping/camp-05.jpg", "/assets/camping/camp-07.jpg"],
  },
  {
    name: "Joshimath",
    points: "Mountain landscapes • Village experiences • Outdoor exploration",
    image: "/assets/camping/camp-01.jpg",
    gallery: ["/assets/camping/camp-01.jpg", "/assets/camping/camp-02.jpg", "/assets/camping/camp-03.jpg"],
  },
  {
    name: "Tapovan",
    points: "Peaceful camps • Himalayan views • Nature & local experiences",
    image: "/assets/camping/camp-04.jpg",
    gallery: ["/assets/camping/camp-04.jpg", "/assets/camping/camp-10.jpg", "/assets/camping/camp-09.jpg"],
  },
  {
    name: "Niti Valley",
    points: "Remote landscapes • High Himalayan villages • Adventure",
    image: "/assets/camping/camp-11.jpg",
    gallery: ["/assets/camping/camp-11.jpg", "/assets/camping/camp-08.jpg", "/assets/camping/camp-07.jpg"],
  },
  {
    name: "Malari",
    points: "Raw Himalayan scenery • Remote villages • Exploration",
    image: "/assets/camping/camp-02.jpg",
    gallery: ["/assets/camping/camp-02.jpg", "/assets/camping/camp-09.jpg", "/assets/camping/camp-05.jpg"],
  },
];

/* Every photo, for the "moments" filmstrip. */
const ALL_MOMENTS = [
  "/assets/camping/camp-01.jpg",
  "/assets/camping/camp-02.jpg",
  "/assets/camping/camp-03.jpg",
  "/assets/camping/camp-04.jpg",
  "/assets/camping/camp-05.jpg",
  "/assets/camping/camp-06.jpg",
  "/assets/camping/camp-07.jpg",
  "/assets/camping/camp-08.jpg",
  "/assets/camping/camp-09.jpg",
  "/assets/camping/camp-10.jpg",
  "/assets/camping/camp-11.jpg",
  "/assets/camping/camp-12.jpg",
];

type Camp = (typeof CAMPS)[number] | { name: string; points: string; image: string; gallery: string[]; custom: true };

const CUSTOM_CAMP: Camp = {
  name: "Custom Camp",
  points: "Tell us where you want to go. We’ll help design the experience.",
  image: HERO_IMAGE,
  gallery: [HERO_IMAGE, "/assets/camping/camp-04.jpg", "/assets/camping/camp-11.jpg"],
  custom: true,
};

const GENERAL_ENQUIRY: Camp = {
  name: "Himalayan Camping",
  points: "Auli · Joshimath · Tapovan · Niti Valley · Malari",
  image: HERO_IMAGE,
  gallery: [HERO_IMAGE, "/assets/camping/camp-06.jpg", "/assets/camping/camp-08.jpg"],
};

/** Mixed crops for the filmstrip, so the photos are not all cut the same way. */
const FILM_CROPS = ["h-64 w-44", "h-64 w-72", "h-64 w-56", "h-64 w-44", "h-64 w-80"];

/** Round icon controls on the dark lightbox: 48px targets, shared focus outline. */
const lightboxControl =
  "absolute z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white/80 transition-colors duration-150 ease-out hover:bg-black/60 hover:text-white";

export default function CampingSection() {
  const [selected, setSelected] = useState<Camp | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);

  // The last photo shown stays rendered while the lightbox animates closed.
  const [shown, setShown] = useState(0);
  const lightboxOpen = lightbox !== null;
  const openPhoto = (i: number) => {
    setShown(i);
    setLightbox(i);
  };

  // Arrow keys page through the photos; Escape, focus trap and scroll lock come from the Dialog.
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!delta) return;
      setShown((i) => (i + delta + ALL_MOMENTS.length) % ALL_MOMENTS.length);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightboxOpen]);

  const step = (delta: number) => setShown((i) => (i + delta + ALL_MOMENTS.length) % ALL_MOMENTS.length);

  return (
    <section className="relative bg-background">
      {/* Full-bleed photo band with one big line */}
      <div className="relative isolate flex min-h-[34rem] items-end overflow-hidden bg-navy-deep text-white md:min-h-[44rem]">
        <SmartImage
          src={HERO_IMAGE}
          alt="Tent camped under Himalayan stars"
          className="absolute inset-0 z-0 h-full w-full object-cover"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy-deep/30 to-navy-deep/10" />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 md:pb-16 lg:px-8">
          <p className="sr-only">Camping</p>
          <FadeUp>
            <h2 className="max-w-4xl font-heading text-5xl font-medium leading-[1.0] tracking-[-0.03em] sm:text-6xl lg:text-8xl">
              Camp Beyond the Ordinary
            </h2>
            <p className="mt-5 max-w-xl font-heading text-xl font-normal text-white/90 sm:text-2xl">
              Discover the quieter side of the Himalayas.
            </p>
            <p className="font-nav mt-6 text-xs tracking-[0.1em] text-white/70">Auli · Joshimath · Tapovan · Niti · Malari</p>
          </FadeUp>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        {/* Editorial two-column: what we do and why (left), where (right) */}
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <FadeUp className="lg:col-span-5">
            <p className="text-lg leading-relaxed text-foreground/80 sm:text-xl">
              From the slopes of Auli and forests around Joshimath to the remote landscapes of Tapovan, Niti Valley and
              Malari, discover camping experiences designed for people who want to go beyond conventional tourism.
            </p>
            <Button size="lg" onClick={() => setSelected(GENERAL_ENQUIRY)} className="mt-6 px-6">
              Explore Camping
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12l-7.5 7.5M21 12H3" />
              </svg>
            </Button>

            <div className="mt-14 border-t border-foreground/15 pt-8">
              <p className="sr-only">Why camp with us</p>
              <h3 className="font-heading text-3xl font-medium leading-[1.1] tracking-[-0.02em] text-foreground">
                There is another Himalaya beyond the tourist map.
              </h3>
              <p className="mt-5 text-base leading-relaxed text-muted">
                Some places aren’t famous. Some don’t have hundreds of reviews. Some don’t even have a proper tourist
                itinerary. That’s exactly why we want you to experience them.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted">
                Himalayan Arc Adventure creates carefully planned camping experiences around lesser-explored Himalayan
                landscapes, combining camping, local exploration, short hikes, nature, photography, food and adventure.
              </p>
              <p className="mt-6 font-heading text-xl font-medium text-foreground">
                Your camp. Your people. <span className="text-amber-700">Your mountains.</span>
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.05} className="lg:col-span-7">
            <h3 className="font-heading text-2xl font-medium tracking-[-0.015em] text-foreground sm:text-3xl">Choose Your Mountain</h3>
            <ul className="mt-6 border-t border-foreground/20">
              {CAMPS.map((camp) => (
                <li key={camp.name} className="border-b border-foreground/15">
                  <button
                    type="button"
                    onClick={() => setSelected(camp)}
                    className="group flex min-h-24 w-full cursor-pointer items-center gap-4 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:gap-6"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-heading text-2xl font-medium leading-tight tracking-[-0.015em] text-foreground group-hover:text-primary sm:text-3xl">
                        {camp.name}
                      </span>
                      <span className="mt-1 block text-sm leading-relaxed text-muted">{camp.points}</span>
                    </span>
                    <span className="relative block h-20 w-20 shrink-0 overflow-hidden rounded-xl sm:h-24 sm:w-32">
                      <SmartImage
                        src={camp.image}
                        alt={camp.name}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105 motion-reduce:transition-none"
                      />
                    </span>
                  </button>
                </li>
              ))}
              <li className="border-b border-foreground/15">
                <button
                  type="button"
                  onClick={() => setSelected(CUSTOM_CAMP)}
                  className="group flex min-h-24 w-full cursor-pointer flex-col justify-center py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <span className="font-heading text-2xl font-medium tracking-[-0.015em] text-amber-700 sm:text-3xl">CUSTOM CAMPS</span>
                  <span className="mt-1 text-sm leading-relaxed text-muted">Tell us where you want to go. We’ll help design the experience.</span>
                  <span className="mt-2 text-sm font-semibold text-amber-700 group-hover:underline">Design my camp →</span>
                </button>
              </li>
            </ul>
          </FadeUp>
        </div>
      </div>

      {/* Real moments, shot on our camps: a filmstrip with mixed crops, bleeding off both edges */}
      <div className="border-t border-foreground/10 bg-card py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h3 className="font-heading text-3xl font-medium tracking-[-0.02em] text-foreground sm:text-4xl">Moments from our camps</h3>
              <p className="font-nav text-sm text-muted">Shot by our teams — not stock.</p>
            </div>
          </FadeUp>
        </div>
        <div data-lenis-prevent-touch className="mt-8 flex overscroll-x-contain snap-x snap-mandatory scroll-pl-4 items-end gap-3 sm:scroll-pl-6 lg:scroll-pl-[max(2rem,calc((100vw-80rem)/2+2rem))] overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:px-6 lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))] [&::-webkit-scrollbar]:hidden">
          {ALL_MOMENTS.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => openPhoto(i)}
              aria-label={`View camp photo ${i + 1} of ${ALL_MOMENTS.length}`}
              className={cn(
                "relative shrink-0 snap-start cursor-zoom-in overflow-hidden rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                FILM_CROPS[i % FILM_CROPS.length]
              )}
            >
              <SmartImage
                src={src}
                alt={`Real camp moment ${i + 1} — Himalayan camping with Himalayan Arc Adventure`}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      <ContactPopup
        key={selected?.name ?? "closed"}
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? selected.name : undefined}
        subtitle={selected ? selected.points : undefined}
        image={selected?.image}
        gallery={selected?.gallery}
        defaultMessage={selected ? `Hi! I'm interested in camping in ${selected.name}. Please share details.` : undefined}
      />

      {/* Full-photo lightbox for the moments strip */}
      <Dialog open={lightboxOpen} onOpenChange={(open) => !open && setLightbox(null)}>
        <DialogContent size="full" tone="dark" hideTitle hideClose title={`Camp photo ${shown + 1} of ${ALL_MOMENTS.length}`}>
          <div
            className="relative flex h-full w-full items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setLightbox(null)}
          >
            <DialogClose aria-label="Close photo" className={cn(lightboxControl, "right-3 top-3")}>
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </DialogClose>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous photo"
              className={cn(lightboxControl, "left-3 top-1/2 -translate-y-1/2")}
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={shown}
              src={ALL_MOMENTS[shown]}
              alt={`Camp moment ${shown + 1} — Himalayan camping with Himalayan Arc Adventure`}
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
              draggable={false}
            />
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next photo"
              className={cn(lightboxControl, "right-3 top-1/2 -translate-y-1/2")}
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/80">
              {shown + 1} / {ALL_MOMENTS.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
