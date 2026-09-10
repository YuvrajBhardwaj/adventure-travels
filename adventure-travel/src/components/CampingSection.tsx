"use client";

import { useEffect, useState } from "react";
import { FadeUp, StaggerContainer, StaggerItem, ScaleIn } from "./MotionWrapper";
import SmartImage from "./SmartImage";
import ContactPopup from "./ContactPopup";

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

export default function CampingSection() {
  const [selected, setSelected] = useState<Camp | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      else if (e.key === "ArrowRight") setLightbox((i) => (i === null ? i : (i + 1) % ALL_MOMENTS.length));
      else if (e.key === "ArrowLeft") setLightbox((i) => (i === null ? i : (i - 1 + ALL_MOMENTS.length) % ALL_MOMENTS.length));
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  const cardClass =
    "group block w-full cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-white/5 text-left backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-emerald-400/40 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400";

  return (
    <section className="relative overflow-hidden bg-[#0F172A] py-section text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 right-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute -bottom-24 left-1/5 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Block 1 — intro */}
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <FadeUp>
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-amber-400" aria-hidden />
              <span className="font-nav text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
                Camping
              </span>
            </div>
            <h2 className="mt-4 font-heading text-3xl font-bold leading-tight sm:text-4xl md:text-display-lg">
              Camp Beyond the Ordinary
            </h2>
            <p className="mt-2 font-heading text-lg font-semibold text-emerald-300">
              Discover the quieter side of the Himalayas.
            </p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
              From the slopes of Auli and forests around Joshimath to the remote
              landscapes of Tapovan, Niti Valley and Malari, discover camping
              experiences designed for people who want to go beyond conventional
              tourism.
            </p>
            <button
              type="button"
              onClick={() => setSelected(GENERAL_ENQUIRY)}
              className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#0F172A] transition-all hover:-translate-y-0.5 hover:bg-amber-300"
            >
              Explore Camping
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </FadeUp>

          <ScaleIn>
            <div className="group relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10">
              <SmartImage
                src={HERO_IMAGE}
                alt="Tent camped under Himalayan stars"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <span className="absolute bottom-4 left-4 rounded-full bg-black/50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-amber-300 backdrop-blur-sm">
                Auli · Joshimath · Tapovan · Niti · Malari
              </span>
            </div>
          </ScaleIn>
        </div>

        {/* Block 2 — choose your mountain */}
        <FadeUp delay={0.05}>
          <h3 className="mt-16 text-center font-heading text-2xl font-bold sm:text-3xl">
            Choose Your Mountain
          </h3>
        </FadeUp>

        <StaggerContainer className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.06}>
          {CAMPS.map((camp) => (
            <StaggerItem key={camp.name}>
              <button type="button" onClick={() => setSelected(camp)} className={cardClass}>
                <div className="relative h-40 overflow-hidden">
                  <SmartImage
                    src={camp.image}
                    alt={camp.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <h4 className="absolute bottom-3 left-4 font-heading text-xl font-bold tracking-wide">
                    {camp.name.toUpperCase()}
                  </h4>
                </div>
                <p className="p-4 text-sm leading-relaxed text-white/60">{camp.points}</p>
              </button>
            </StaggerItem>
          ))}

          <StaggerItem>
            <button
              type="button"
              onClick={() => setSelected(CUSTOM_CAMP)}
              className="flex h-full min-h-[220px] w-full cursor-pointer flex-col justify-center rounded-3xl border border-dashed border-amber-400/40 bg-amber-400/5 p-6 text-left transition-all hover:-translate-y-1 hover:bg-amber-400/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
            >
              <h4 className="font-heading text-xl font-bold tracking-wide text-amber-300">
                CUSTOM CAMPS
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Tell us where you want to go. We’ll help design the experience.
              </p>
              <span className="mt-4 text-xs font-semibold text-amber-300 group-hover:underline">
                Design my camp →
              </span>
            </button>
          </StaggerItem>
        </StaggerContainer>

        {/* Block 3 — real moments, shot on our camps */}
        <FadeUp delay={0.05}>
          <div className="mt-16 flex flex-wrap items-end justify-between gap-3">
            <h3 className="font-heading text-2xl font-bold sm:text-3xl">
              Moments from our camps
            </h3>
            <p className="text-sm text-white/50">Shot by our teams — not stock.</p>
          </div>
        </FadeUp>
        <FadeUp delay={0.1}>
          <div className="mt-6 flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {ALL_MOMENTS.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setLightbox(i)}
                aria-label={`View camp photo ${i + 1} of ${ALL_MOMENTS.length}`}
                className="relative h-48 w-72 flex-shrink-0 snap-start overflow-hidden rounded-2xl border border-white/10 cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
              >
                <SmartImage
                  src={src}
                  alt={`Real camp moment ${i + 1} — Himalayan camping with Expedition Happiness`}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 hover:bg-black/25 hover:opacity-100">
                  <svg className="h-8 w-8 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 7.5v6m3-3h-6M21 21l-5.2-5.2" />
                  </svg>
                </span>
              </button>
            ))}
          </div>
        </FadeUp>

        {/* Block 4 — manifesto */}
        <FadeUp delay={0.05}>
          <div className="mx-auto mt-16 max-w-3xl text-center">
            <p className="font-nav text-xs font-bold uppercase tracking-[0.3em] text-emerald-400">
              Why camp with us
            </p>
            <h3 className="mt-4 font-heading text-2xl font-bold leading-snug sm:text-3xl md:text-4xl">
              There is another Himalaya beyond the tourist map.
            </h3>
            <p className="mt-6 text-base leading-relaxed text-white/60 sm:text-lg">
              Some places aren’t famous. Some don’t have hundreds of reviews.
              Some don’t even have a proper tourist itinerary. That’s exactly
              why we want you to experience them.
            </p>
            <p className="mt-4 text-base leading-relaxed text-white/60 sm:text-lg">
              Expedition Happiness creates carefully planned camping experiences
              around lesser-explored Himalayan landscapes, combining camping,
              local exploration, short hikes, nature, photography, food and
              adventure.
            </p>
            <p className="mt-8 font-heading text-lg font-bold tracking-wide text-white">
              Your camp. Your people. <span className="text-amber-300">Your mountains.</span>
            </p>
          </div>
        </FadeUp>
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

      {/* Full-photo modal for the moments strip */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Camp photo ${lightbox + 1} of ${ALL_MOMENTS.length}`}
        >
          <button
            onClick={() => setLightbox(null)}
            aria-label="Close photo"
            className="absolute top-4 right-4 z-10 rounded-full bg-black/40 p-2 text-white/80 hover:text-white"
          >
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox((i) => (i === null ? i : (i - 1 + ALL_MOMENTS.length) % ALL_MOMENTS.length)); }}
            aria-label="Previous photo"
            className="absolute left-3 z-10 rounded-full bg-black/40 p-2 text-white/80 hover:text-white"
          >
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={lightbox}
            src={ALL_MOMENTS[lightbox]}
            alt={`Camp moment ${lightbox + 1} — Himalayan camping with Expedition Happiness`}
            className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox((i) => (i === null ? i : (i + 1) % ALL_MOMENTS.length)); }}
            aria-label="Next photo"
            className="absolute right-3 z-10 rounded-full bg-black/40 p-2 text-white/80 hover:text-white"
          >
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
          <div className="absolute bottom-4 text-sm text-white/80">
            {lightbox + 1} / {ALL_MOMENTS.length}
          </div>
        </div>
      )}
    </section>
  );
}
