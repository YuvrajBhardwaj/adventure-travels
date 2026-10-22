"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { courses } from "@/data/courses";
import Price from "@/components/Price";
import { buttonVariants } from "@/components/ui/button";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/MotionWrapper";
import { EASE, transition } from "@/lib/motion";
import { cn } from "@/lib/utils";

// Hero media — skiing gallery (images only) + real course videos, mixed carousel
const SKIING_GALLERY = courses.find((c) => c.slug === "skiing-course")?.gallery ?? [];
const GALLERY_WALLPAPERS = SKIING_GALLERY.filter((u) => !/\.(mp4|mov)$/i.test(u)).map((u) =>
  u.replace("w=800", "w=1920")
);
const HERO_MEDIA: { type: "image" | "video"; src: string }[] = [
  ...GALLERY_WALLPAPERS.map((src) => ({ type: "image" as const, src })),
  { type: "video", src: "/assets/skiing/IMG_4968.MP4" },
  { type: "video", src: "/assets/skiing/IMG_4975.MP4" },
  { type: "video", src: "/assets/skiing/IMG_5018.MP4" },
  { type: "video", src: "/assets/snowboarding/IMG_5201.MOV" },
  { type: "video", src: "/assets/snowboarding/IMG_4222.MOV" },
  { type: "video", src: "/assets/snowboarding/IMG_5198.MOV" },
  { type: "video", src: "/assets/snowboarding/IMG_5272.MOV" },
];

const H2 = "font-heading text-3xl font-semibold tracking-[-0.02em] text-slate-900 sm:text-4xl";

export default function CoursesPageClient() {
  const [idx, setIdx] = useState(0);
  const reduceMotion = useReducedMotion();

  // Scroll-linked parallax — media recedes while copy lifts away
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 110]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  useEffect(() => {
    if (reduceMotion || HERO_MEDIA.length < 2) return;
    const cur = HERO_MEDIA[idx];
    const delay = cur.type === "video" ? 6000 : 4000;
    const t = setTimeout(() => setIdx((i) => (i + 1) % HERO_MEDIA.length), delay);
    return () => clearTimeout(t);
  }, [reduceMotion, idx]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero — full-bleed media, one big line, bottom-left. Copy is visible from the first paint. */}
      <section ref={heroRef} className="relative flex min-h-[88vh] items-end overflow-hidden bg-navy-hero">
        {/* Media layer (parallax zoom on scroll) */}
        <motion.div style={reduceMotion ? undefined : { scale: mediaScale }} className="absolute inset-0 will-change-transform">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={idx}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              // Ambient slideshow crossfade: long by design (motion contract), easing from the tokens.
              transition={reduceMotion ? transition("base", "inOut") : { duration: 1.1, ease: EASE.out }}
              className="absolute inset-0"
            >
              {HERO_MEDIA[idx].type === "video" ? (
                <video
                  key={HERO_MEDIA[idx].src}
                  src={HERO_MEDIA[idx].src}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                  aria-hidden
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={HERO_MEDIA[idx].src} alt="" aria-hidden className="h-full w-full object-cover" />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
        {/* Scrims — dark top for the navbar, solid navy base melting into the page */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy-hero/80 via-navy-hero/25 to-navy-hero/95" />

        {/* Slide dots — the visible bar sits inside a 44px-tall hit area */}
        <div className="absolute right-4 top-24 z-20 flex sm:right-5">
          {HERO_MEDIA.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIdx(i)}
              className="group flex h-11 items-center rounded-full px-[3px]"
            >
              <span
                className={cn(
                  "block h-1.5 rounded-full transition-colors duration-150 ease-out motion-reduce:transition-none",
                  i === idx ? "w-6 bg-white" : "w-1.5 bg-white/40 group-hover:bg-white/70"
                )}
              />
            </button>
          ))}
        </div>

        {/* Copy */}
        <motion.div
          style={reduceMotion ? undefined : { y: contentY, opacity: contentOpacity }}
          className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-14 pt-32 sm:px-6 sm:pb-20 lg:px-8"
        >
          <p className="mb-5 text-sm text-white/80">Auli Snow Sports Academy</p>

          <div className="grid items-end gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-9">
              <h1 className="font-heading text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.025em] text-white sm:text-6xl lg:text-7xl [text-shadow:0_2px_30px_rgba(2,6,23,0.55)]">
                <span className="block">Skiing &amp; Snowboarding</span>
                <span className="block">in the Himalayas</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-white/85 [text-shadow:0_1px_12px_rgba(2,6,23,0.7)]">
                Certified 7-day courses on the powder slopes of Auli — professionals, full equipment, and views of Nanda Devi.
              </p>
            </div>

            {/* The one number: the slope altitude already quoted further down this page */}
            <div className="lg:col-span-3 lg:text-right">
              <p className="font-heading text-6xl font-semibold leading-none tracking-[-0.03em] text-white sm:text-7xl">
                3,050<span className="ml-1 text-3xl font-normal text-white/70 sm:text-4xl">m</span>
              </p>
              <p className="mt-2 text-sm text-white/70">Auli&apos;s slopes</p>
            </div>
          </div>

          <p className="mt-8 flex flex-wrap gap-x-5 gap-y-1 border-t border-white/20 pt-4 text-sm text-white/80">
            <span>Dec 2026 — Mar 2027</span>
            <span>Auli, Uttarakhand</span>
            <span>Certified Instructors</span>
          </p>

          <a href="#courses-grid" className="sr-only focus:not-sr-only focus:mt-4 focus:inline-block focus:text-white">
            Explore Courses
          </a>
        </motion.div>
      </section>

      {/* Courses — wide photo, dates and duration as the headline, the whole card is the link */}
      <section id="courses-grid" className="mx-auto max-w-7xl px-4 py-section-sm sm:px-6 lg:px-8">
        <FadeUp className="mb-10 max-w-2xl sm:mb-14">
          <h2 className={cn(H2, "mb-4")}>Choose Your Course</h2>
          <p className="text-lg text-slate-600">
            From first-timers to seasoned adventurers — structured progression tracks taught by certified mountain guides.
          </p>
        </FadeUp>

        <StaggerContainer className="flex flex-col gap-10 sm:gap-14">
          {courses.map((course, i) => {
            const displayPrice = course.tiers ? Math.min(...course.tiers.map((t) => t.priceBase)) : course.price;
            const flip = i % 2 === 1;
            return (
              <StaggerItem key={course.id}>
                <Link
                  href={`/courses/${course.slug}`}
                  className="group grid items-center gap-5 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-4 lg:grid-cols-12 lg:gap-10"
                >
                  {/* Photo — navy box so there is never an empty white area while it loads */}
                  <div
                    className={cn(
                      "relative aspect-[16/10] overflow-hidden rounded-2xl bg-navy lg:col-span-7",
                      flip && "lg:order-2"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={course.image}
                      alt={course.name}
                      loading={i === 0 ? "eager" : "lazy"}
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                    {course.featured && (
                      <span className="absolute left-4 top-4 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white">
                        MOST POPULAR
                      </span>
                    )}
                  </div>

                  <div className={cn("lg:col-span-5", flip && "lg:order-1")}>
                    <p className="font-heading text-5xl font-semibold leading-none tracking-[-0.03em] text-slate-900 sm:text-6xl">
                      {course.duration}
                    </p>
                    <p className="mt-3 font-heading text-xl text-sky-700 sm:text-2xl">{course.dates}</p>

                    <h3 className="mt-6 font-heading text-xl font-semibold text-slate-900 underline-offset-4 group-hover:underline">
                      {course.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {course.type} <span aria-hidden className="mx-1.5 text-slate-300">·</span> {course.level}
                    </p>
                    <p className="mt-3 line-clamp-2 text-slate-600">{course.shortDescription}</p>

                    <p className="mt-5 flex flex-wrap items-baseline justify-between gap-x-4 border-t border-slate-200 pt-4 text-sm text-slate-600">
                      <span>
                        {course.tiers ? "From " : ""}
                        <span className="font-semibold text-slate-900">
                          <Price inr={displayPrice} />
                        </span>{" "}
                        / person
                      </span>
                      <span className="inline-flex min-h-11 items-center gap-1 font-semibold text-emerald-700">
                        <span className="sr-only">View Course</span>
                        <svg
                          className="h-5 w-5 transition-transform duration-150 ease-out group-hover:translate-x-1 motion-reduce:transition-none"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </p>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </section>

      {/* Why Choose Us — a plain ruled list, no icon tiles */}
      <section className="bg-slate-50 py-section-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeUp className="mb-10 sm:mb-12">
            <h2 className={H2}>Why Learn With Us</h2>
          </FadeUp>
          <StaggerContainer className="grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-4">
            {[
              { title: "Certified Instructors", desc: "Professional coaches with international certifications" },
              { title: "Prime Location", desc: "Auli's 3,050m slopes with Nanda Devi views" },
              { title: "All Equipment", desc: "Complete gear provided — no need to bring anything" },
              { title: "Recognized Certification", desc: "Course completion certificate for your portfolio" },
            ].map((item) => (
              <StaggerItem key={item.title} className="border-t border-slate-300 pt-4">
                <h3 className="mb-2 font-heading text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA — navy band, left aligned */}
      <section className="bg-navy py-section-sm">
        <FadeUp className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="mb-4 font-heading text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl">
              Ready to Hit the Slopes?
            </h2>
            <p className="mb-8 text-lg text-white/80">
              Book your 7-day course today and learn to ski or snowboard in the Himalayas.
            </p>
            <a
              href="https://wa.me/917817912062?text=Hi!%20I'm%20interested%20in%20the%20skiing/snowboarding%20course%20in%20Auli."
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ size: "lg" }), "group px-8 focus-visible:ring-offset-navy")}
            >
              Book on WhatsApp
              <svg className="h-5 w-5 transition-transform duration-150 ease-out group-hover:translate-x-1 motion-reduce:transition-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </a>
          </div>
        </FadeUp>
      </section>

      {/* Course Film — playable with sound (native controls) */}
      <section className="bg-white py-section-sm">
        <FadeUp className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className={cn(H2, "mb-4")}>See the Slopes for Yourself</h2>
          <p className="mb-8 max-w-2xl text-lg text-slate-600">
            Straight from our courses in Auli — hit play and turn the sound on.
          </p>
          <video
            controls
            controlsList="nodownload"
            preload="none"
            playsInline
            src="/assets/snowboarding/IMG_1477.MOV"
            poster="https://images.pexels.com/photos/848591/pexels-photo-848591.jpeg?w=1200&q=80"
            className="block max-h-[80vh] w-full rounded-2xl bg-navy object-contain"
            aria-label="Course video from Auli snow sports academy"
          />
          <p className="mt-3 text-xs text-slate-500">
            Filmed on our Auli slopes during past courses.
          </p>
        </FadeUp>
      </section>
    </div>
  );
}
