"use client";

import { useState } from "react";
import { FadeUp } from "./MotionWrapper";
import SmartImage from "./SmartImage";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";

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
  // `active` stays set while the dialog animates closed, so the video doesn't vanish mid-fade.
  const [active, setActive] = useState<Reel | null>(null);
  const [open, setOpen] = useState(false);
  const play = (reel: Reel) => {
    setActive(reel);
    setOpen(true);
  };
  const featured = REELS[0];
  const rest = REELS.slice(1, 5);

  return (
    <section className="relative bg-navy-deep text-white">
      {/* Full-bleed band: the featured reel's poster with one big line */}
      <div className="relative isolate flex min-h-[36rem] items-end overflow-hidden md:min-h-[46rem]">
        <SmartImage src={featured.poster} alt={featured.title} className="absolute inset-0 z-0 h-full w-full object-cover" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy-deep/35 to-navy-deep/20" />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 md:pb-14 lg:px-8">
          <p className="sr-only">WATCH THE TREKS</p>
          <FadeUp>
            <h2 className="max-w-3xl font-heading text-5xl font-medium leading-[1.0] tracking-[-0.03em] sm:text-6xl lg:text-8xl">
              Real footage from the trail
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/80 sm:text-lg">
              No stock clips — these are treks our groups actually walked, shot on the trail. Tap any reel to watch.
            </p>
          </FadeUp>

          <div className="mt-8 flex items-center gap-4 border-t border-white/25 pt-5">
            <button
              type="button"
              onClick={() => play(featured)}
              className="group inline-flex min-h-14 items-center gap-4 rounded-full text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-navy-deep transition-transform duration-200 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                <svg className="ml-0.5 h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <span className="text-sm font-semibold">
                Watch reel
                <span className="sr-only">: {featured.title} video</span>
              </span>
            </button>
            <div className="ml-auto text-right">
              <p className="font-nav text-[11px] font-medium uppercase tracking-[0.16em] text-white/70">{featured.region}</p>
              <h3 className="font-heading text-xl font-medium sm:text-2xl">{featured.title}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* The other reels: an edge-to-edge row of stills */}
      <ul className="grid grid-cols-2 gap-px bg-white/15 lg:grid-cols-4">
        {rest.map((reel) => (
          <li key={reel.slug} className="bg-navy-deep">
            <button
              type="button"
              onClick={() => play(reel)}
              className="group relative block w-full text-left focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white"
              aria-label={`Play ${reel.title} video`}
            >
              <span className="relative block aspect-[4/5] overflow-hidden sm:aspect-[4/3]">
                <SmartImage
                  src={reel.poster}
                  alt={reel.title}
                  className="absolute inset-0 z-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
                <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy-deep/85 via-transparent to-transparent" />
                <span className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-navy-deep">
                  <svg className="ml-0.5 h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                <span className="absolute inset-x-0 bottom-0 block p-4">
                  <span className="font-nav block text-[10px] font-medium uppercase tracking-[0.16em] text-white/70">{reel.region}</span>
                  <span className="mt-0.5 block font-heading text-lg font-medium leading-tight">{reel.title}</span>
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {/* Video modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="full" tone="dark" hideTitle hideClose title={active ? `${active.title} video` : "Video"}>
          {active && (
            <div
              className="flex h-full w-full items-center justify-center p-4"
              onClick={(e) => e.target === e.currentTarget && setOpen(false)}
            >
              <div className="relative w-full max-w-4xl">
                <DialogClose
                  className="absolute -top-12 right-0 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/30 transition-colors duration-150 ease-out hover:bg-white/20"
                  aria-label="Close video"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </DialogClose>
                <h3 className="mb-3 pr-14 font-heading text-lg font-semibold text-white">
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
                  preload="none"
                  playsInline
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
