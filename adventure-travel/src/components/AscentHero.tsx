"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ArrowRight, Pause, Play, Snowflake } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion";
import { treks } from "@/data/treks";
import Price from "@/components/Price";

// The pitch's facts come from the trek data, so they stay true when treks change.
const FROM_PRICE = Math.min(...treks.map((t) => t.price));
const MIN_DAYS = Math.min(...treks.map((t) => t.days));
const MAX_DAYS = Math.max(...treks.map((t) => t.days));
const TOP = Math.max(...treks.map((t) => t.maxAltitude));
const BASE = 1875; // Joshimath, where every group starts

/**
 * Each slide is one of our photos in two layers: the photo, and the same photo with the
 * sky cut away (`-fg.webp`, made by a sky flood-fill from the top edge). "HIMALAYA" sits
 * between them, so peaks, people and poles stand in front of the word.
 * `aspect` is the photo's width/height; `baseline` is where the word's bottom sits, as a
 * fraction of the photo's height (set by eye per photo, just below the ridge). Phones see
 * only the middle of the photo, where the peaks are often higher, so `phone` sets it there.
 */
const SLIDES = [
  { file: "panpatia-1", slug: "panpatia-col", aspect: 4 / 3, baseline: 0.39, phone: 0.36 },
  { file: "kuari", slug: "kuari-pass", aspect: 4 / 3, baseline: 0.43, phone: 0.35 },
  { file: "panpatia-2", slug: "panpatia-col", aspect: 4 / 3, baseline: 0.36, phone: 0.27 },
  { file: "dronagiri-1", slug: "dronagiri-base-camp", aspect: 1600 / 722, baseline: 0.4, phone: 0.4 },
].flatMap((s) => {
  const trek = treks.find((t) => t.slug === s.slug);
  return trek ? [{ ...s, name: trek.name, altitude: trek.maxAltitude }] : [];
});

const SLIDE_MS = 2000; // the owner asked for a 2-second change
/** Ambient crossfade between photos (slideshow, not a UI response). */
const FADE_S = 0.8;

function Stage({
  slide,
  load,
  first,
  skyY,
  wordY,
  ridgeY,
}: {
  slide: (typeof SLIDES)[number];
  load: boolean;
  first: boolean;
  skyY?: MotionValue<string>;
  wordY?: MotionValue<string>;
  ridgeY?: MotionValue<string>;
}) {
  const focus = 0.5; // centre of the photo stays in view (like object-position: 50%)
  return (
    // The stage keeps the photo's shape and covers the hero like object-fit: cover,
    // so the word lines up with the ridge at any screen size.
    <div
      className="absolute top-[28%] -translate-y-[28%] [container-type:inline-size]"
      style={{
        aspectRatio: String(slide.aspect),
        width: `max(100%, calc(max(100svh, 640px) * ${slide.aspect}))`,
        // Like object-position x: which part of a photo wider than the screen stays in view.
        left: `${focus * 100}%`,
        transform: `translateX(-${focus * 100}%)`,
      }}
    >
      {load && (
        <motion.img
          src={`/assets/hero/${slide.file}-bg.webp`}
          alt=""
          fetchPriority={first ? "high" : "auto"}
          decoding="async"
          style={skyY ? { y: skyY } : undefined}
          className="absolute inset-0 h-full w-full select-none"
        />
      )}
      <motion.span
        style={{
          // Bottom of the word just under the ridge, but never higher than 7.5rem below the hero's
          // top (navbar + the base/route line). Stage height = 100cqw / aspect; the stage starts
          // 0.28 × (hero height − stage height) above the hero.
          top: `max(calc(7.5rem - 0.28 * (max(100svh, 640px) - 100cqw / ${slide.aspect})), calc(var(--bl) * 100cqw / ${slide.aspect} - min(19cqw, 20.5vw, 30svh)))`,
          // Centred on the part of the photo that's on screen, not on the whole photo.
          left: `calc(${focus} * (100cqw - 100vw) + 50vw)`,
          ...(wordY ? { y: wordY } : {}),
          ...({ "--bd": slide.baseline, "--bp": slide.phone } as Record<string, number>),
        }}
        className="absolute block -translate-x-1/2 select-none [--bl:var(--bd)] max-sm:[--bl:var(--bp)] whitespace-nowrap text-center font-heading font-semibold leading-none tracking-[-0.045em] text-white [font-size:min(19cqw,20.5vw,30svh)] [text-shadow:0_2px_40px_rgba(2,6,23,0.35)]"
      >
        HIMALAYA
      </motion.span>
      {load && (
        <motion.img
          src={`/assets/hero/${slide.file}-fg.webp`}
          alt=""
          decoding="async"
          style={ridgeY ? { y: ridgeY } : undefined}
          className="absolute inset-0 h-full w-full select-none"
        />
      )}
    </div>
  );
}

/**
 * Home hero: a slideshow of our own mountain photos, each with a giant "HIMALAYA" set
 * behind its peaks. The first slide is in the static HTML; the rest load one ahead.
 * Changes every 2 s; stops only with the pause button, and never runs under
 * reduced motion (which also drops the scroll parallax).
 */
export default function AscentHero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const skyY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const wordY = useTransform(scrollYProgress, [0, 1], ["0%", "34%"]);
  const ridgeY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [loaded, setLoaded] = useState<number[]>([0]);
  const n = SLIDES.length;
  const playing = !reduce && !paused && n > 1;
  const slide = SLIDES[idx];

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setIdx((i) => (i + 1) % n), SLIDE_MS);
    return () => clearTimeout(t);
  }, [playing, idx, n]);

  // Load the current slide and the next two, so a crossfade never fades into a blank frame.
  useEffect(() => {
    const want = [idx, (idx + 1) % n, (idx + 2) % n];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoaded((l) => (want.every((i) => l.includes(i)) ? l : [...new Set([...l, ...want])]));
  }, [idx, n]);

  const parallax = reduce ? {} : { skyY, wordY, ridgeY };

  return (
    <section
      ref={ref}
      aria-labelledby="hero-heading"
      aria-roledescription="carousel"
      className="relative isolate h-[100svh] min-h-[640px] overflow-hidden bg-[#020617]"
    >
      <div aria-hidden>
        {SLIDES.map((s, i) => (
          <motion.div
            key={s.file}
            initial={false}
            animate={{ opacity: i === idx ? 1 : 0 }}
            transition={{ duration: reduce ? 0 : FADE_S, ease: EASE.inOut }}
            className="absolute inset-0"
          >
            <Stage slide={s} load={loaded.includes(i)} first={i === 0} {...parallax} />
          </motion.div>
        ))}
      </div>

      {/* The ground fades into the page, so the dark copy reads over snow, rock or grass. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-background via-background/80 to-transparent"
      />

      {/* Copy: top line on the sky, the pitch on the ground. */}
      <motion.div
        style={reduce ? undefined : { y: copyY }}
        className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-between px-4 pb-8 pt-24 sm:px-6 sm:pb-10 lg:px-8"
      >
        <div className="flex items-start justify-between gap-4 font-nav text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80 [text-shadow:0_1px_8px_rgba(2,6,23,0.5)]">
          <p>
            <span className="text-primary">●</span> Base · Joshimath {BASE.toLocaleString("en-IN")} m
          </p>
          <p className="hidden text-right sm:block">Highest route · {TOP.toLocaleString("en-IN")} m</p>
        </div>

        <div className="grid items-end gap-6 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-7">
            <h1
              id="hero-heading"
              className="font-heading text-[clamp(2.4rem,6vw,4.75rem)] font-semibold leading-[0.95] tracking-[-0.035em] text-navy-deep"
            >
              One range.
              <br />
              Two seasons.
            </h1>
            <p className="mt-4 max-w-lg text-base font-medium leading-relaxed text-slate-700 md:text-lg">
              Guided {MIN_DAYS}–{MAX_DAYS} day treks from <Price inr={FROM_PRICE} />, with permits, guide and meals
              included. Ski and snowboard courses at Auli in winter.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/treks" className={cn(buttonVariants({ size: "lg" }), "bg-navy-deep px-7 text-white hover:bg-navy")}>
                Browse treks
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/courses"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "border-navy-deep/25 bg-white/60 px-7 text-navy-deep backdrop-blur-sm hover:bg-white"
                )}
              >
                <Snowflake className="h-4 w-4" aria-hidden />
                Auli ski courses
              </Link>
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-4 font-nav text-navy-deep lg:col-span-5 lg:items-end">
            <dl className="hidden grid-cols-2 gap-x-8 lg:grid">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Treks</dt>
                <dd className="text-sm font-semibold">Jan – Dec</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Auli snow</dt>
                <dd className="text-sm font-semibold">Dec – Mar</dd>
              </div>
            </dl>
            {/* Slide controls: which photo, which trek, pause. Clear of the WhatsApp button on phones. */}
            <div className="flex min-w-0 max-w-full items-center gap-3 max-sm:pr-16">
              <Link
                href={`/treks/${slide.slug}`}
                className="min-w-0 truncate text-xs text-slate-600 underline-offset-4 hover:text-navy-deep hover:underline"
              >
                Photo: {slide.name.replace(/ \(.*\)$/, "")} · {slide.altitude.toLocaleString("en-IN")} m
              </Link>
              <div className="flex shrink-0 items-center" role="group" aria-label="Choose a photo">
                {SLIDES.map((s, i) => (
                  <button
                    key={s.file}
                    type="button"
                    onClick={() => setIdx(i)}
                    aria-label={`Photo ${i + 1} of ${n}: ${s.name}`}
                    aria-current={i === idx ? "true" : undefined}
                    className="flex h-8 w-6 items-center justify-center focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <span
                      className={cn(
                        "block h-1.5 rounded-full transition-[width,background-color] duration-200 ease-out",
                        i === idx ? "w-4 bg-navy-deep" : "w-1.5 bg-navy-deep/30"
                      )}
                    />
                  </button>
                ))}
              </div>
              {!reduce && (
                <button
                  type="button"
                  onClick={() => setPaused((p) => !p)}
                  aria-label={paused ? "Play slideshow" : "Pause slideshow"}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-navy-deep ring-1 ring-navy-deep/20 transition-colors duration-150 ease-out hover:bg-navy-deep/5 focus-visible:outline-2 focus-visible:outline-primary"
                >
                  {paused ? <Play className="h-3.5 w-3.5" aria-hidden /> : <Pause className="h-3.5 w-3.5" aria-hidden />}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
