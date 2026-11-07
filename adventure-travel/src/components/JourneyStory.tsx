"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { treks, priceRoute } from "@/data/treks";
import Price from "@/components/Price";
import { buttonVariants } from "@/components/ui/button";
import { BrandIcon } from "@/components/BrandIcon";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion";

const SLUG = "kuari-pass";
const P = "/assets/kuari-pass-trek/";

/**
 * The home page's scroll story: the Kuari Pass trek told day by day with our own photos,
 * styled after motionsites.ai's "Moss Island" (scroll fly-in, data tags pinned to the scene,
 * a frosted data card, a numbered chapter index).
 *
 * Scrolling walks the route: the photo behind changes per chapter, a tag marks where you are in
 * the frame, the altitude card counts up or down and its marker climbs the route line. Days,
 * altitudes, hours and the price come from src/data/treks.ts; only the chapter copy, photo
 * choice and tag position live here.
 *
 * Every chapter's text is a normal block in the page flow, so it's all in the static HTML and
 * readable without JavaScript. The pinned photo layer, tag, card and index are decoration.
 */
type Chapter = {
  day: number;
  place: string;
  photo: string;
  alt: string;
  heading: string;
  text: string;
  /** Where the place tag sits on the photo, in % of the frame (desktop). */
  tag: { x: number; y: number };
  night?: boolean;
};

const CHAPTERS: Chapter[] = [
  {
    day: 1,
    place: "Joshimath base",
    photo: `${P}8a7f3f68-76f9-4945-98cc-8734fc98063c.jpeg`,
    alt: "A trek group together before setting out",
    heading: "Meet the team in Joshimath",
    text: "Gear check and a briefing from the guides who lead this trail every season. Tonight you sleep at our base.",
    tag: { x: 62, y: 38 },
  },
  {
    day: 2,
    place: "Khulara trail",
    photo: `${P}017bfe93-d6e9-4c29-841d-e55ba276be2b.jpeg`,
    alt: "Trekkers on a snowy trail through oak forest",
    heading: "Into the oak and rhododendron forest",
    text: "Through Garhwali villages and old forest to Khulara.",
    tag: { x: 64, y: 46 },
  },
  {
    day: 2,
    place: "Khulara camp",
    photo: `${P}43025720-b05f-48e4-91cd-9d6783d428b2.jpeg`,
    alt: "Tents pitched in a forest clearing below snow peaks",
    heading: "Tents up, dinner hot",
    text: "Our crew pitches camp and cooks fresh meals on the trail. You just walk in.",
    tag: { x: 70, y: 56 },
    night: true,
  },
  {
    day: 3,
    place: "Kuari Pass",
    photo: `${P}7d28235d-0d49-4998-9bc7-3304ad6c33e2.jpeg`,
    alt: "A trekker with arms open at the prayer-flag cairn on Kuari Pass",
    heading: "Summit day on the Curzon Trail",
    text: "An early start to the pass, and a 360° view of Nanda Devi, Dronagiri and Trishul.",
    tag: { x: 72, y: 34 },
  },
  {
    day: 4,
    place: "Gorson Bugyal",
    photo: `${P}564c4289-af50-4c8b-be21-3e209be853cc.jpeg`,
    alt: "Snow-dusted meadow ridge with the Garhwal peaks behind",
    heading: "Down through the meadows",
    text: "The rolling grasslands of Gorson Bugyal and Tali Lake, then down past the Auli ski slopes to Joshimath.",
    tag: { x: 60, y: 44 },
  },
];

const LABEL = "font-nav text-[11px] font-medium uppercase tracking-[0.16em]";

export default function JourneyStory() {
  const trek = treks.find((t) => t.slug === SLUG);
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // Fly-in: as the story scrolls into view the scene comes into focus from a blurred close-up.
  const { scrollYProgress: entry } = useScroll({ target: sectionRef, offset: ["start end", "start start"] });
  const flyScale = useTransform(entry, [0, 1], [1.18, 1]);
  const flyBlur = useTransform(entry, [0, 0.85], ["blur(10px)", "blur(0px)"]);

  // 0 → first chapter centred, CHAPTERS.length - 1 → last chapter centred.
  const { scrollYProgress } = useScroll({ target: stepsRef, offset: ["start center", "end center"] });
  const position = useTransform(scrollYProgress, [0, 1], [0, CHAPTERS.length - 1], { clamp: true });
  useMotionValueEvent(position, "change", (v) => setActive(Math.min(CHAPTERS.length - 1, Math.max(0, Math.round(v)))));

  // Where on the route the marker is, as an index into elevationProfile (day 1 = 0).
  const route = useTransform(position, (v) => {
    const i = Math.floor(v);
    const f = v - i;
    const a = CHAPTERS[Math.min(i, CHAPTERS.length - 1)].day - 1;
    const b = CHAPTERS[Math.min(i + 1, CHAPTERS.length - 1)].day - 1;
    return a + (b - a) * f;
  });

  const profile = trek?.elevationProfile ?? [0, 0];
  const last = profile.length - 1;
  const max = Math.max(...profile);
  const min = Math.min(...profile);
  const yPct = (alt: number) => 14 + (1 - (alt - min) / (max - min || 1)) * 72;
  const altAt = (r: number) => {
    const i = Math.min(last - 1, Math.max(0, Math.floor(r)));
    return profile[i] + (profile[i + 1] - profile[i]) * Math.min(1, Math.max(0, r - i));
  };
  const markerLeft = useTransform(route, (r) => `${(r / last) * 100}%`);
  const markerTop = useTransform(route, (r) => `${yPct(altAt(r))}%`);
  const altitude = useTransform(route, (r) => Math.round(altAt(r)).toLocaleString("en-IN"));

  if (!trek) return null;

  const ch = CHAPTERS[active];
  const stop = trek.itinerary[ch.day - 1];
  const prevStop = ch.day > 1 ? trek.itinerary[ch.day - 2] : null;
  const dayChange = stop && prevStop && !ch.night ? stop.altitude - prevStop.altitude : 0;
  const linePoints = profile.map((alt, i) => `${(i / last) * 300},${yPct(alt) * 0.8}`).join(" ");
  const fade = reduceMotion ? { duration: 0.15 } : { duration: 0.8, ease: EASE.out };
  const glide = reduceMotion ? { duration: 0 } : { duration: 0.6, ease: EASE.out };
  const goTo = (i: number) =>
    document.getElementById(`journey-ch-${i}`)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });

  return (
    <section ref={sectionRef} aria-labelledby="journey-h" className="relative bg-navy-deep text-white">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-20 sm:px-6 md:pt-28 lg:px-8">
        <h2 id="journey-h" className="max-w-3xl font-heading text-4xl font-medium leading-[1.04] tracking-[-0.025em] sm:text-5xl lg:text-6xl">
          Walk the Kuari Pass in {trek.days} days
        </h2>
        <p className="mt-5 max-w-md text-base leading-relaxed text-white/70">
          Scroll down to follow the trail, from our Joshimath base to the pass at {trek.maxAltitude.toLocaleString("en-IN")} m and back.
        </p>
      </div>

      <div className="relative">
        {/* Pinned scene: photos, scrims, place tag, chapter index and altitude card. */}
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <motion.div
            aria-hidden
            style={reduceMotion ? undefined : { scale: flyScale, filter: flyBlur }}
            className="absolute inset-0"
          >
            {CHAPTERS.map((c, i) => (
              <motion.img
                key={c.photo}
                src={c.photo}
                alt=""
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                initial={false}
                animate={{ opacity: i === active ? 1 : 0, scale: i === active || reduceMotion ? 1 : 1.06 }}
                transition={fade}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ))}
          </motion.div>
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-navy-deep/80 via-navy-deep/25 to-transparent" />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-navy-deep/90 via-navy-deep/40 to-transparent" />

          {/* Place tag pinned into the scene, with a crosshair, like a field marker. */}
          <motion.div
            aria-hidden
            initial={false}
            animate={{ left: `${ch.tag.x}%`, top: `${ch.tag.y}%` }}
            transition={glide}
            className="absolute hidden md:block"
          >
            <span className="absolute -left-2 -top-2 h-4 w-4">
              <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/90" />
              <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/90" />
            </span>
            <span className="absolute left-4 top-3 block min-w-44 rounded-md border border-white/25 bg-navy-deep/45 p-2.5 backdrop-blur-md">
              <span className={cn(LABEL, "inline-block rounded bg-primary px-1.5 py-0.5 text-[10px] text-white")}>{ch.place}</span>
              <span className={cn(LABEL, "mt-2 block text-[10px] tabular-nums leading-relaxed text-white/80")}>
                Elev {stop?.altitude.toLocaleString("en-IN")} m
                <br />
                {ch.night ? "Night" : "Day"} {ch.day} / {trek.days}
                {stop && stop.hours > 0 && !ch.night && ch.day > 1 && (
                  <>
                    <br />
                    Trail {stop.hours} h
                  </>
                )}
              </span>
            </span>
          </motion.div>

          {/* Chapter index: numbered, the current one lit; click to jump. */}
          <nav aria-label="Trek days" className="absolute right-6 top-24 hidden w-72 rounded-xl border border-white/15 bg-navy-deep/45 p-2 backdrop-blur-md lg:block xl:right-[max(1.5rem,calc((100vw-80rem)/2+2rem))]">
            <ol>
              {CHAPTERS.map((c, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={i === active ? "step" : undefined}
                    className={cn(
                      LABEL,
                      "flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left transition-colors duration-150 ease-out hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-primary",
                      i === active ? "text-white" : "text-white/55"
                    )}
                  >
                    <span className={cn("tabular-nums", i === active ? "text-primary" : "text-white/40")}>{String(i + 1).padStart(2, "0")}</span>
                    <span className="flex-1">{c.place}</span>
                    <span aria-hidden className={cn("transition-transform duration-150 ease-out", i === active && "translate-x-0.5 text-primary")}>→</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          {/* Frosted altitude card: counter, change since yesterday, the route with the walker. */}
          <div aria-hidden className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/20 bg-white/10 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:inset-x-auto sm:bottom-8 sm:right-6 sm:w-80 sm:p-5 xl:right-[max(1.5rem,calc((100vw-80rem)/2+2rem))]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Altitude</p>
                <p className={cn(LABEL, "mt-0.5 text-[10px] text-white/60")}>
                  {ch.night ? "Night" : "Day"} {ch.day} · {ch.place}
                </p>
              </div>
              {dayChange !== 0 && (
                <span className={cn(LABEL, "rounded-md px-1.5 py-0.5 text-[10px] tabular-nums", dayChange > 0 ? "bg-primary text-white" : "bg-white/20 text-white")}>
                  {dayChange > 0 ? "+" : "−"}
                  {Math.abs(dayChange).toLocaleString("en-IN")} m
                </span>
              )}
            </div>
            <p className="mt-3 font-heading text-4xl font-medium leading-none tabular-nums tracking-[-0.03em] sm:text-5xl">
              <motion.span>{altitude}</motion.span>
              <span className="ml-1 text-lg text-white/60">m</span>
            </p>
            <div className="relative mt-4 h-12">
              <svg viewBox="0 0 300 80" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
                <polyline points={linePoints} fill="none" stroke="white" strokeOpacity="0.55" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
              </svg>
              <motion.span
                style={{ left: markerLeft, top: markerTop }}
                className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-4 ring-primary/30"
              />
            </div>
            <div className={cn(LABEL, "mt-2 flex justify-between text-[10px] text-white/50")}>
              <span>Day 1</span>
              <span>Day {trek.days}</span>
            </div>
          </div>
        </div>

        {/* Chapters: ordinary text blocks that scroll over the pinned scene. */}
        <div className="relative -mt-[100svh]">
          <div ref={stepsRef}>
          {CHAPTERS.map((c, i) => {
            const s = trek.itinerary[c.day - 1];
            const prev = c.day > 1 ? trek.itinerary[c.day - 2] : null;
            const gain = s && prev ? s.altitude - prev.altitude : 0;
            return (
              <article id={`journey-ch-${i}`} key={i} className="flex min-h-[100svh] items-center">
                <div className="mx-auto w-full max-w-7xl px-4 pb-56 sm:px-6 sm:pb-24 lg:px-8">
                  <motion.div
                    initial={false}
                    animate={{ opacity: i === active ? 1 : 0.35 }}
                    transition={{ duration: 0.3 }}
                    className="max-w-md"
                  >
                    <h3 className="font-heading text-3xl font-medium leading-tight tracking-[-0.02em] [text-shadow:0_2px_24px_rgba(2,6,23,0.6)] sm:text-5xl">
                      {c.heading}
                    </h3>
                    <p className="mt-4 text-base leading-relaxed text-white/85 [text-shadow:0_1px_12px_rgba(2,6,23,0.7)] sm:text-lg">
                      {c.text}
                      {!c.night && s && s.hours > 0 && c.day > 1 && (
                        <> About {s.hours} hours on the trail{gain > 0 ? `, climbing ${gain.toLocaleString("en-IN")} m` : ""}.</>
                      )}
                    </p>
                    <p className={cn(LABEL, "mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-2 py-1 text-white")}>
                      <span aria-hidden>+</span>
                      {c.night ? "Night" : "Day"} {c.day} · {s?.altitude.toLocaleString("en-IN")} m
                    </p>
                    <span className="sr-only">Photo: {c.alt}.</span>
                  </motion.div>
                </div>
              </article>
            );
          })}

          </div>

          {/* The end of the trail: book it. */}
          <article className="relative flex min-h-[80svh] items-center bg-gradient-to-b from-transparent via-navy-deep/90 to-navy-deep">
            <div className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
              <h3 className="max-w-2xl font-heading text-4xl font-medium leading-[1.05] tracking-[-0.025em] sm:text-5xl">Your turn to walk it.</h3>
              <p className="mt-4 text-lg text-white/75">
                {trek.days} days · up to {trek.maxAltitude.toLocaleString("en-IN")} m · from <Price inr={trek.price} /> per person
                {priceRoute(trek) ? `, ${priceRoute(trek)}` : ""}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={`/treks/${trek.slug}`} className={cn(buttonVariants({ size: "lg" }), "px-7")}>
                  See dates and book
                </Link>
                <a
                  href={`https://wa.me/917817912062?text=${encodeURIComponent("Hi! I'd like to know more about the Kuari Pass trek.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ size: "lg", variant: "outline" }), "border-white/60 bg-transparent px-7 text-white hover:bg-white/10")}
                >
                  <BrandIcon brand="whatsapp" className="h-4 w-4" />
                  Ask on WhatsApp
                </a>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
