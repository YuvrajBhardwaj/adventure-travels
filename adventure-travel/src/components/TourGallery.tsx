"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import SmartImage from "@/components/SmartImage";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { transition } from "@/lib/motion";

/** A tour's photo grid with a full-screen viewer (arrows, swipe, Esc), like the trek Photo Gallery tab. */
export default function TourGallery({ name, photos }: { name: string; photos: readonly string[] }) {
  const reduceMotion = useReducedMotion();
  // The index is kept after closing so the viewer can animate out on the photo it showed.
  const [viewer, setViewer] = useState({ index: 0, open: false });
  const step = (by: number) => setViewer((v) => ({ ...v, index: (v.index + by + photos.length) % photos.length }));
  const navButton =
    "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-150 ease-out hover:bg-white/20";

  if (photos.length === 0) {
    return (
      <EmptyState
        className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12"
        icon={
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5a1.5 1.5 0 001.5 1.5z" />
          </svg>
        }
        title="Photos from this tour are coming soon."
        description="Ask us on WhatsApp and we'll send pictures from our recent trips."
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {photos.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setViewer({ index: i, open: true })}
            aria-label={`View photo ${i + 1} of ${photos.length}`}
            className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl"
          >
            <SmartImage
              src={src}
              alt={`${name}, photo ${i + 1}`}
              className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          </button>
        ))}
      </div>

      <Dialog open={viewer.open} onOpenChange={(open) => setViewer((v) => ({ ...v, open }))}>
        <DialogContent
          size="full"
          tone="dark"
          hideClose
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") step(1);
            else if (e.key === "ArrowLeft") step(-1);
          }}
        >
          <DialogTitle className="sr-only">{`${name} photo viewer`}</DialogTitle>
          {/* Tapping the dark area around the photo closes the viewer. */}
          <motion.div
            className="relative flex h-full w-full touch-pan-y items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setViewer((v) => ({ ...v, open: false }))}
            onPanEnd={(_, info) => {
              // Swipe left/right on phones moves between photos.
              if (Math.abs(info.offset.x) > 50 && Math.abs(info.offset.x) > Math.abs(info.offset.y)) step(info.offset.x < 0 ? 1 : -1);
            }}
          >
            <DialogClose
              aria-label="Close photo viewer"
              className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-150 ease-out hover:bg-white/20"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </DialogClose>
            <button type="button" onClick={() => step(-1)} aria-label="Previous photo" className={`${navButton} left-2 sm:left-4`}>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <motion.img
              key={viewer.index}
              src={photos[viewer.index]}
              alt={`${name}, photo ${viewer.index + 1}`}
              draggable={false}
              initial={reduceMotion ? { opacity: 0 } : { scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={transition("base")}
              className="max-h-[85vh] max-w-[92vw] select-none rounded-xl object-contain shadow-2xl"
            />
            <button type="button" onClick={() => step(1)} aria-label="Next photo" className={`${navButton} right-2 sm:right-4`}>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/80" aria-live="polite">
              {viewer.index + 1} / {photos.length}
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}
