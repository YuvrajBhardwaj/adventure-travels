"use client";

import { useState } from "react";
import { FadeUp, StaggerContainer, StaggerItem, ScaleIn } from "./MotionWrapper";
import SmartImage from "./SmartImage";
import ContactPopup from "./ContactPopup";

const HERO_IMAGE = "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1000&q=80";

const CAMPS = [
  {
    name: "Auli",
    points: "Mountain camping • Stargazing • Bonfire • Nature walks",
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80",
  },
  {
    name: "Joshimath",
    points: "Mountain landscapes • Village experiences • Outdoor exploration",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
  },
  {
    name: "Tapovan",
    points: "Peaceful camps • Himalayan views • Nature & local experiences",
    image: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=600&q=80",
  },
  {
    name: "Niti Valley",
    points: "Remote landscapes • High Himalayan villages • Adventure",
    image: "https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=600&q=80",
  },
  {
    name: "Malari",
    points: "Raw Himalayan scenery • Remote villages • Exploration",
    image: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&q=80",
  },
];

type Camp = (typeof CAMPS)[number] | { name: string; points: string; image: string; custom: true };

const CUSTOM_CAMP: Camp = {
  name: "Custom Camp",
  points: "Tell us where you want to go. We’ll help design the experience.",
  image: HERO_IMAGE,
  custom: true,
};

const GENERAL_ENQUIRY: Camp = {
  name: "Himalayan Camping",
  points: "Auli · Joshimath · Tapovan · Niti Valley · Malari",
  image: HERO_IMAGE,
};

export default function CampingSection() {
  const [selected, setSelected] = useState<Camp | null>(null);

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

        {/* Block 3 — manifesto */}
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
        defaultMessage={selected ? `Hi! I'm interested in camping in ${selected.name}. Please share details.` : undefined}
      />
    </section>
  );
}
