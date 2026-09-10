"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FadeUp, StaggerContainer, StaggerItem, ScaleIn } from "./MotionWrapper";
import SmartImage from "./SmartImage";

type Reel = {
  title: string;
  region: string;
  video: string;
  poster: string;
  slug: string;
};

const REELS: Reel[] = [
  {
    title: "Bhrigu Lake Trek",
    region: "Himachal Pradesh",
    video: "/assets/birgu-lake/3551faed-4e8b-48a1-8d7c-3009f2af7229.mov",
    poster: "/assets/birgu-lake/22e5257b-854d-4722-9ad9-4f63715455e0.jpeg",
    slug: "bhrigu-lake",
  },
  {
    title: "Kuari Pass Trek",
    region: "Uttarakhand",
    video: "/assets/kuari-pass-trek/f14f4fc5-7c11-4e21-abcf-e12bf021e6dc.mov",
    poster: "/assets/kuari-pass-trek/017bfe93-d6e9-4c29-841d-e55ba276be2b.jpeg",
    slug: "kuari-pass",
  },
  {
    title: "Pangarchula Peak",
    region: "Auli, Uttarakhand",
    video: "/assets/pangarchula-peak-trek/0834c6e9-e382-426a-894b-6d7af316cda5.mp4",
    poster: "/assets/pangarchula-peak-trek/IMG_3734.jpeg",
    slug: "pangarchula-peak",
  },
  {
    title: "Nandi Kund Trek",
    region: "Garhwal, Uttarakhand",
    video: "/assets/nandi-kund-trek/feb980a9-026c-4e20-8207-d16c640983d6.mov",
    poster: "/assets/nandi-kund-trek/2c72f839-1d03-4194-829a-0cb0e953eb8a.jpeg",
    slug: "nandi-kund",
  },
  {
    title: "Panpatia Col Trek",
    region: "Kumaon, Uttarakhand",
    video: "/assets/panpatia-col-trek/Panpateya.mov",
    poster: "/assets/panpatia-col-trek/IMG_6079.jpeg",
    slug: "panpatia-col",
  },
];

export default function VideoShowcase() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState<Reel | null>(null);
  const featured = REELS[0];
  const rest = REELS.slice(1, 5);

  return (
    <section className="relative bg-gradient-to-b from-background to-slate-950 py-section">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeUp>
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-accent" aria-hidden />
            <span className="font-nav text-xs font-bold uppercase tracking-[0.3em] text-accent">
              WATCH THE TREKS
            </span>
          </div>
          <h2 className="mt-4 font-heading text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-display-lg">
            Real footage from the trail
          </h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            No stock clips — these are treks our groups actually walked, shot on
            the trail. Tap any reel to watch.
          </p>
        </FadeUp>

        {/* Featured video */}
        <ScaleIn className="mt-10">
          <button
            type="button"
            onClick={() => setActive(featured)}
            className="group relative block w-full overflow-hidden rounded-3xl border border-white/10 text-left shadow-2xl shadow-black/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            aria-label={`Play ${featured.title} video`}
          >
            <div className="relative aspect-[16/9] overflow-hidden sm:aspect-[21/9]">
              <SmartImage
                src={featured.poster}
                alt={featured.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              {/* Play badge */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-md ring-1 ring-white/40 transition-transform duration-300 group-hover:scale-110">
                  <svg className="ml-1 h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-5">
                <div>
                  <p className="font-nav text-[10px] font-bold uppercase tracking-[0.25em] text-accent">
                    {featured.region}
                  </p>
                  <h3 className="mt-1 font-heading text-xl font-bold text-white sm:text-2xl">
                    {featured.title}
                  </h3>
                </div>
                <span className="hidden text-sm font-semibold text-white/80 sm:block">
                  Watch reel →
                </span>
              </div>
            </div>
          </button>
        </ScaleIn>

        {/* Reel grid */}
        <StaggerContainer
          className="mt-6 grid gap-6 grid-cols-2 lg:grid-cols-4"
          staggerDelay={0.06}
        >
          {rest.map((reel) => (
            <StaggerItem key={reel.slug}>
              <button
                type="button"
                onClick={() => setActive(reel)}
                className="group relative block w-full overflow-hidden rounded-2xl border border-white/10 text-left shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                aria-label={`Play ${reel.title} video`}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <SmartImage
                    src={reel.poster}
                    alt={reel.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md ring-1 ring-white/40 transition-transform duration-300 group-hover:scale-110">
                      <svg className="ml-0.5 h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </span>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="font-nav text-[9px] font-bold uppercase tracking-[0.2em] text-accent">
                      {reel.region}
                    </p>
                    <h4 className="mt-0.5 font-heading text-sm font-semibold text-white">
                      {reel.title}
                    </h4>
                  </div>
                </div>
              </button>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>

      {/* Video modal */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-[130] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            role="dialog"
            aria-modal="true"
            aria-label={`${active.title} video`}
          >
            <motion.div
              className="relative w-full max-w-4xl"
              initial={reduceMotion ? false : { scale: 0.94, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={reduceMotion ? undefined : { scale: 0.94, y: 16 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setActive(null)}
                className="absolute -top-11 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/30 transition-colors hover:bg-white/20"
                aria-label="Close video"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 className="mb-3 font-heading text-lg font-bold text-white">
                {active.title}
                <span className="ml-2 text-sm font-normal text-white/60">{active.region}</span>
              </h3>
              <video
                key={active.video}
                className="aspect-video w-full rounded-2xl bg-black shadow-2xl"
                src={active.video}
                poster={active.poster}
                controls
                controlsList="nodownload"
                autoPlay
                playsInline
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
