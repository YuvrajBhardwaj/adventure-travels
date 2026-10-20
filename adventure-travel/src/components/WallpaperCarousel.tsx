"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { DURATION, EASE } from "@/lib/motion";

export interface WallpaperSlide {
  src: string;
  /** Shown bottom-left, e.g. the trek the photo was taken on. */
  caption?: string;
  href?: string;
}

const SLIDE_MS = 5500;
/** Ambient photo crossfade (contracts/motion.md allows ~1.2s for slideshows). */
const CROSSFADE_S = 1.2;
/** Round control: a 44px hit area around a 32px glass circle. */
const roundControl =
  "group/ctl h-11 w-11 shrink-0 items-center justify-center rounded-full text-white";
const roundControlFace =
  "flex h-8 w-8 items-center justify-center rounded-full bg-black/35 backdrop-blur-sm transition-colors duration-150 ease-out group-hover/ctl:bg-black/55";

/**
 * Full-bleed photo wallpaper that crossfades through its slides with a slow zoom,
 * like the /courses hero. Children render on top (headline, copy). Autoplay stops
 * while a mouse hovers or focus is inside, when the visitor presses pause, and
 * entirely for reduced-motion visitors, who also get no zoom.
 *
 * Portrait photos would be cropped to a thin strip on a wide screen, so from `sm`
 * up they're shown whole over a blurred copy of themselves.
 */
export default function WallpaperCarousel({
  slides,
  label,
  className = "",
  scrimClassName = "bg-gradient-to-t from-black/75 via-black/30 to-black/40",
  controls = "bottom",
  fallback,
  children,
}: {
  slides: WallpaperSlide[];
  label: string;
  className?: string;
  scrimClassName?: string;
  /** "bottom": caption + controls along the bottom edge. "top": controls only, top-left, for heroes whose copy sits at the bottom. */
  controls?: "bottom" | "top";
  /** Background shown when there are no slides. */
  fallback?: ReactNode;
  children?: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [holding, setHolding] = useState(false);
  const [tall, setTall] = useState<Record<string, boolean>>({});
  const touchX = useRef<number | null>(null);
  const n = slides.length;
  const playing = !reduceMotion && !paused && !holding && n > 1;

  const measure = (src: string, img: HTMLImageElement) => {
    if (!img.naturalWidth) return;
    const isTall = img.naturalHeight > img.naturalWidth;
    setTall((t) => (t[src] === isTall ? t : { ...t, [src]: isTall }));
  };

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setIdx((i) => (i + 1) % n), SLIDE_MS);
    return () => clearTimeout(t);
  }, [playing, idx, n]);

  // Warm the next photo so the crossfade never fades into a blank frame (and we know its shape in time).
  useEffect(() => {
    if (n < 2) return;
    const src = slides[(idx + 1) % n].src;
    const img = new Image();
    img.onload = () => measure(src, img);
    img.src = src;
  }, [idx, n, slides]);

  const go = (step: number) => setIdx((i) => (i + step + n) % n);
  const slide = slides[idx % Math.max(n, 1)];
  const isTall = slide && tall[slide.src];

  const controlButtons = (
    <div className="flex shrink-0 items-center">
      <ArrowButton dir="prev" onClick={() => go(-1)} />
      {slides.map((s, i) => (
        <button
          key={s.src}
          type="button"
          onClick={() => setIdx(i)}
          aria-label={`Show photo ${i + 1} of ${n}${s.caption ? `: ${s.caption}` : ""}`}
          aria-current={i === idx}
          className="group flex h-11 items-center justify-center rounded-full px-1 sm:min-w-6"
        >
          {i === idx ? (
            <span className="relative block h-1.5 w-6 overflow-hidden rounded-full bg-white/40">
              {/* Fills over the slide's time on screen, so it reads as "next photo coming" */}
              <motion.span
                key={`${idx}-${playing}`}
                className="absolute inset-0 origin-left rounded-full bg-white"
                initial={{ scaleX: playing ? 0 : 1 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: playing ? SLIDE_MS / 1000 : 0, ease: "linear" }}
              />
            </span>
          ) : (
            <span className="block h-1.5 w-1.5 rounded-full bg-white/45 transition-colors duration-150 ease-out group-hover:bg-white/80" />
          )}
        </button>
      ))}
      <ArrowButton dir="next" onClick={() => go(1)} />
      {!reduceMotion && (
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Play slideshow" : "Pause slideshow"}
          className={`${roundControl} flex`}
        >
          <span className={roundControlFace}>
            {paused ? (
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M8 5v14l11-7z" /></svg>
            ) : (
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
            )}
          </span>
        </button>
      )}
    </div>
  );

  return (
    <section
      aria-roledescription={n > 1 ? "carousel" : undefined}
      aria-label={label}
      className={`relative overflow-hidden bg-navy ${className}`}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHolding(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHolding(false)}
      onFocus={() => setHolding(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHolding(false);
      }}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null || n < 2) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      }}
    >
      {slide ? (
        // initial={false}: the first slide renders at full opacity in the static HTML (no fade-in on
        // first paint); only later slides crossfade in.
        <AnimatePresence initial={false}>
          <motion.div
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? DURATION.base : CROSSFADE_S, ease: EASE.inOut }}
            className="absolute inset-0"
          >
            {isTall && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={slide.src} alt="" aria-hidden className="absolute inset-0 hidden h-full w-full scale-110 object-cover opacity-70 blur-2xl sm:block" />
            )}
            <motion.img
              ref={(el: HTMLImageElement | null) => {
                if (el?.complete) measure(slide.src, el);
              }}
              src={slide.src}
              alt=""
              aria-hidden
              decoding="async"
              fetchPriority={idx === 0 ? "high" : "auto"}
              onLoad={(e) => measure(slide.src, e.currentTarget)}
              initial={reduceMotion ? false : { scale: 1.08 }}
              animate={{ scale: 1 }}
              // Ken Burns: an ambient constant-speed zoom, so linear on purpose (contracts/motion.md exception).
              transition={{ duration: SLIDE_MS / 1000 + CROSSFADE_S, ease: "linear" }}
              className={`relative h-full w-full object-cover ${isTall ? "sm:object-contain" : ""}`}
            />
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="absolute inset-0">{fallback}</div>
      )}

      <div className={`absolute inset-0 ${scrimClassName}`} />

      <div className="relative z-10 h-full">{children}</div>

      {n > 1 && controls === "top" && <div className="absolute left-4 top-4 z-20 sm:left-6 sm:top-6">{controlButtons}</div>}

      {n > 1 && controls === "bottom" && (
        <div className="absolute inset-x-0 bottom-0 z-20 mx-auto flex max-w-7xl flex-col gap-1 px-4 pb-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:pb-5 lg:px-8">
          <div aria-live={playing ? "off" : "polite"} className="min-w-0">
            {slide?.caption &&
              (slide.href ? (
                <Link
                  href={slide.href}
                  className="relative inline-flex max-w-full items-center gap-1.5 rounded-full bg-black/35 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors duration-150 ease-out before:absolute before:-inset-y-1.5 before:inset-x-0 hover:bg-black/55"
                >
                  <PinIcon />
                  <span className="truncate">{slide.caption}</span>
                  <span aria-hidden>→</span>
                </Link>
              ) : (
                <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-black/35 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
                  <PinIcon />
                  <span className="truncate">{slide.caption}</span>
                </span>
              ))}
          </div>
          {controlButtons}
        </div>
      )}
    </section>
  );
}

function PinIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function ArrowButton({ dir, onClick }: { dir: "prev" | "next"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === "prev" ? "Previous photo" : "Next photo"}
      className={`${roundControl} hidden sm:flex`}
    >
      <span className={roundControlFace}>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d={dir === "prev" ? "M15.75 19.5L8.25 12l7.5-7.5" : "M8.25 4.5l7.5 7.5-7.5 7.5"} />
        </svg>
      </span>
    </button>
  );
}
