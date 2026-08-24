"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useScroll, useTransform, type Variants } from "framer-motion";

type Slide = { type: "image" | "video"; src: string; alt: string };

// Summer — trek imagery (real expedition photos from our treks)
const SUMMER_SLIDES: Slide[] = [
  { type: "image", src: "/assets/valley-of-flowers/IMG_5934.JPG.jpeg", alt: "Blooming meadows of the Valley of Flowers, Uttarakhand" },
  { type: "image", src: "/assets/kuari-pass-trek/340648ba-f46c-4dae-9ba6-d48a6a1d91f9.jpeg", alt: "Himalayan peaks from the Kuari Pass trail" },
  { type: "image", src: "/assets/satopanth-lake/IMG_4752.JPG.jpeg", alt: "Satopanth lake and valley trek route" },
  { type: "image", src: "/assets/valley-of-flowers/IMG_4735.JPG.jpeg", alt: "Alpine meadow trek trail, Uttarakhand" },
];

// Winter — snowboarding videos only (right side = videos)
const WINTER_SLIDES: Slide[] = [
  { type: "video", src: "/assets/snowboarding/IMG_5201.MOV", alt: "Snowboarding run at Auli — video" },
  { type: "video", src: "/assets/snowboarding/IMG_4222.MOV", alt: "Snowboarding powder spray — video" },
  { type: "video", src: "/assets/snowboarding/IMG_5198.MOV", alt: "Snowboarder carving — video" },
  { type: "video", src: "/assets/snowboarding/IMG_5272.MOV", alt: "Auli snow run — video" },
  { type: "video", src: "/assets/snowboarding/IMG_5220.MOV", alt: "Snowboarding descent — video" },
  { type: "video", src: "/assets/snowboarding/IMG_1477.MOV", alt: "Mountain snowboarding — video" },
];

function CarouselLayer({
  slides,
  intervalMs,
  gradient,
  reduceMotion,
  paused,
  frozen,
  fetchPriorityFirst,
}: {
  slides: Slide[];
  intervalMs: number;
  gradient: string;
  reduceMotion: boolean | null;
  paused: boolean;
  frozen?: boolean;
  fetchPriorityFirst?: boolean;
}) {
  const [idx, setIdx] = useState(0);
  const mediaRefs = useRef<(HTMLImageElement | HTMLVideoElement | null)[]>([]);

  // Every slide stays MOUNTED — no remounts, so a video never loses its decoded
  // frame mid-transition. Only the active video plays; paused ones hold their
  // last frame as an opaque backdrop for the incoming fade.
  useEffect(() => {
    mediaRefs.current.forEach((el, i) => {
      if (!el || el.tagName !== "VIDEO") return;
      const v = el as HTMLVideoElement;
      if (i === idx && !frozen) void v.play().catch(() => {});
      else v.pause();
      v.preload = i === idx || i === (idx + 1) % slides.length ? "auto" : "metadata";
    });
  }, [idx, slides.length, frozen]);

  useEffect(() => {
    if (reduceMotion || paused || slides.length <= 1) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % slides.length), intervalMs);
    return () => clearInterval(id);
  }, [reduceMotion, paused, slides.length, intervalMs]);

  return (
    <>
      {slides.map((slide, i) => {
        const active = i === idx;
        return (
          <motion.div
            key={i}
            initial={false}
            animate={{ opacity: active ? 1 : 0 }}
            transition={
              active
                ? { duration: reduceMotion ? 0.15 : 0.7, ease: "easeInOut" }
                : { duration: reduceMotion ? 0.1 : 0.5, ease: "easeInOut", delay: reduceMotion ? 0 : 0.5 }
            }
            className="absolute inset-0"
          >
            {slide.type === "video" ? (
              <video
                ref={(el) => { mediaRefs.current[i] = el; }}
                src={slide.src}
                muted
                loop
                playsInline
                preload={i === 0 ? "auto" : "metadata"}
                className="h-full w-full object-cover object-center"
                aria-label={slide.alt}
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                ref={(el) => { mediaRefs.current[i] = el; }}
                src={slide.src}
                alt={slide.alt}
                fetchPriority={fetchPriorityFirst && i === 0 ? "high" : undefined}
                loading={fetchPriorityFirst && i === 0 ? undefined : "lazy"}
                decoding="async"
                className="h-full w-full object-cover object-center"
              />
            )}
          </motion.div>
        );
      })}
      <div className={`absolute inset-0 ${gradient}`} aria-hidden />
      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIdx(i)}
            className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"}`}
          />
        ))}
      </div>
    </>
  );
}

export default function SeasonSplitHero() {
  const reduceMotion = useReducedMotion();
  // MotionValue (not state) — divider updates skip React entirely, no re-render lag
  const pos = useMotionValue(50);
  const [isDragging, setIsDragging] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);
  const heroRef = useRef<HTMLElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const paused = isDragging;

  // Clip paths + divider position as live templates — compositor-driven
  const summerRight = useTransform(pos, (p) => 100 - p);
  const summerClip = useMotionTemplate`inset(0 ${summerRight}% 0 0)`;
  const winterClip = useMotionTemplate`inset(0 0 0 ${pos}%)`;
  const posLeft = useMotionTemplate`${pos}%`;

  // Stop video decoding once the hero is scrolled away
  useEffect(() => {
    const el = heroRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Scroll-linked exit — copy lifts away as the hero leaves the viewport
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Orchestrated entrance — paced to match the courses hero (slower, cinematic)
  const heroStagger: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduceMotion ? 0 : 0.12, delayChildren: reduceMotion ? 0 : 0.15 } },
  };
  const copyStagger: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduceMotion ? 0 : 0.12, delayChildren: reduceMotion ? 0 : 0.3 } },
  };
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 26 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
  };
  const fadeDown: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : -14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
  };
  const lineReveal: Variants = reduceMotion
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.4 } } }
    : { hidden: { y: "112%" }, show: { y: "0%", transition: { duration: 0.95, ease: [0.22, 1, 0.36, 1] } } };

  // Pointer-drag divider (desktop)
  useEffect(() => {
    const el = dragRef.current;
    if (!el || reduceMotion) return;
    let raf = 0;
    const update = (clientX: number) => {
      const rect = heroRef.current!.getBoundingClientRect();
      const pct = Math.min(88, Math.max(12, ((clientX - rect.left) / rect.width) * 100));
      pos.set(pct);
      el.setAttribute("aria-valuenow", String(Math.round(pct)));
    };
    const onDown = (e: PointerEvent) => {
      draggingRef.current = true;
      setIsDragging(true);
      el.setPointerCapture(e.pointerId);
      update(e.clientX);
    };
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          update(e.clientX);
        });
    };
    const onUp = () => {
      draggingRef.current = false;
      setIsDragging(false);
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      cancelAnimationFrame(raf);
    };
  }, [reduceMotion, pos]);

  // Touch: divider follows scroll progress through the hero
  useEffect(() => {
    if (reduceMotion) return;
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    if (!isCoarse) return;
    const unsub = scrollYProgress.on("change", (v) => {
      pos.set(Math.min(88, Math.max(12, 60 - v * 30)));
    });
    return () => unsub();
  }, [reduceMotion, scrollYProgress, pos]);

  const onKey = (e: React.KeyboardEvent<HTMLElement>) => {
    const step = e.key === "ArrowLeft" ? -5 : e.key === "ArrowRight" ? 5 : 0;
    if (!step) return;
    const next = Math.min(88, Math.max(12, pos.get() + step));
    pos.set(next);
    e.currentTarget.setAttribute("aria-valuenow", String(Math.round(next)));
  };

  return (
    <section
      ref={heroRef}
      className="relative isolate min-h-[100svh] overflow-hidden bg-background"
    >
      {/* Summer layer — left side only */}
      <motion.div className="absolute inset-0" style={{ clipPath: summerClip }} aria-hidden>
        <CarouselLayer slides={SUMMER_SLIDES} intervalMs={3000} gradient="bg-gradient-to-t from-emerald-950/70 via-emerald-950/15 to-transparent" reduceMotion={reduceMotion} paused={paused} frozen={!heroVisible} fetchPriorityFirst />
      </motion.div>

      {/* Winter layer — right side only */}
      <motion.div
        className="absolute inset-0"
        style={{ clipPath: winterClip }}
        aria-hidden
      >
        <CarouselLayer slides={WINTER_SLIDES} intervalMs={6000} gradient="bg-gradient-to-t from-sky-950/70 via-sky-950/15 to-transparent" reduceMotion={reduceMotion} paused={paused} frozen={!heroVisible} />
      </motion.div>

      {/* Divider */}
      <motion.div
        ref={dragRef}
        role="slider"
        aria-label="Season divider"
        aria-valuemin={12}
        aria-valuemax={88}
        aria-valuenow={50}
        tabIndex={0}
        onKeyDown={onKey}
        className={`absolute inset-y-0 z-20 flex w-0.5 items-center justify-center bg-white/80 shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${reduceMotion ? "pointer-events-none cursor-default" : "cursor-ew-resize touch-none"}`}
        style={{ left: posLeft }}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/90 text-foreground shadow-xl">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path d="M6 3L2 7l4 4M14 3l4 4-4 4M2 7h4M14 7h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </motion.div>

      {/* Content — scroll-parallax wrapper, orchestrated entrance inside */}
      <motion.div
        style={reduceMotion ? undefined : { y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-between px-6 pb-14 pt-24 lg:px-8"
      >
        <motion.div variants={heroStagger} initial={reduceMotion ? "show" : "hidden"} animate="show" className="contents">
          {/* Top rail */}
          <motion.div variants={fadeDown} className="flex items-center justify-between font-nav">
            <span className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-white backdrop-blur-sm">JAN – DEC</span>
            <span className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-white backdrop-blur-sm">DEC – MAR</span>
          </motion.div>

          <div className="mt-auto flex flex-col gap-4 lg:gap-3">
            <motion.div variants={copyStagger} className="flex flex-col">
              <h1 className="font-heading font-bold leading-none text-white drop-shadow-lg">
                <span className="block overflow-hidden pb-1">
                  <motion.span variants={lineReveal} className="block text-display-xl">ONE RANGE.</motion.span>
                </span>
                <span className="block overflow-hidden pb-2">
                  <motion.span variants={lineReveal} className="block text-display-xl text-white/95">TWO SEASONS.</motion.span>
                </span>
              </h1>
              <motion.p variants={fadeUp} className="max-w-xl text-base font-medium leading-relaxed text-white/80 md:text-lg">
                Himalayan treks in Uttarakhand — and snow school at Auli.
              </motion.p>
              <motion.div variants={fadeUp} className="mt-4 flex flex-wrap gap-3">
                <Link href="/treks" className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                  Explore treks
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </Link>
                <Link href="/courses" className="inline-flex items-center gap-2 rounded-full bg-secondary px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-secondary/90 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary">
                  Learn to ski
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </Link>
              </motion.div>
            </motion.div>
          </div>

          <motion.div variants={fadeUp} className="mt-8 hidden items-center gap-2 self-start rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm sm:flex">
            <svg className="h-3.5 w-3.5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 8-8" /><path strokeLinecap="round" strokeLinejoin="round" d="M14 7h7v7" /></svg>
            <span className="font-heading text-sm font-bold tabular-nums text-white">1,200 M – 4,700 M</span>
            <span className="text-xs font-semibold uppercase tracking-widest text-white/70">Uttarakhand Himalaya</span>
          </motion.div>
        </motion.div>
      </motion.div>
      <div className="pointer-events-none absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60">Scroll</span>
        <div className="flex h-8 w-5 justify-center rounded-full border border-white/30 pt-1.5">
          <div className="h-1.5 w-1 rounded-full bg-white/60" style={{ animation: "scroll-dot 1.5s ease-in-out infinite" }} />
        </div>
      </div>
    </section>
  );
}
