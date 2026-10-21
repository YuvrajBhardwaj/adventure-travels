"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { courses } from "@/data/courses";
import Price from "@/components/Price";
import { Badge } from "@/components/ui/badge";
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

// Course-type tags in brand tones (sky / slate / amber), with a matching hover ring on the card.
const TYPE_TONES: Record<string, { tone: "sky" | "slate" | "amber"; hoverRing: string }> = {
  Skiing: { tone: "sky", hoverRing: "hover:ring-sky-300" },
  Snowboarding: { tone: "slate", hoverRing: "hover:ring-slate-300" },
  Backcountry: { tone: "amber", hoverRing: "hover:ring-amber-300" },
};

const H2 = "font-heading text-3xl font-bold tracking-[-0.02em] text-slate-900 sm:text-4xl";

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
      {/* Hero — cinematic full-bleed media with scroll parallax; the copy is visible from the first paint */}
      <section ref={heroRef} className="relative flex min-h-[88vh] items-center overflow-hidden bg-navy-hero">
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
        {/* Layered scrims — dark top for the navbar, solid navy base melting into the page */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy-hero/80 via-navy-hero/30 to-navy-hero" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-navy-hero to-transparent" />

        {/* Slide dots — the visible bar sits inside a 44px-tall hit area */}
        <div className="absolute bottom-4 right-4 z-20 flex sm:bottom-5 sm:right-5">
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
        <motion.div style={reduceMotion ? undefined : { y: contentY, opacity: contentOpacity }} className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-7 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-sky-200 ring-1 ring-white/25 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-300" />
              Auli Snow Sports Academy
            </span>

            <h1 className="font-heading text-4xl font-bold leading-[1.04] text-white sm:text-6xl lg:text-7xl [text-shadow:0_2px_30px_rgba(2,6,23,0.55)]">
              <span className="block pb-1">Skiing &amp; Snowboarding</span>
              <span className="block pb-2 text-sky-300">in the Himalayas</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg text-white/85 sm:text-xl [text-shadow:0_1px_12px_rgba(2,6,23,0.7)]">
              Certified 7-day courses on the powder slopes of Auli — professionals, full equipment, and views of Nanda Devi.
            </p>

            <div className="mt-9 flex flex-wrap justify-center gap-3">
              {[
                { label: "Dec 2026 — Mar 2027", d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
                { label: "Auli, Uttarakhand", d: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" },
                { label: "Certified Instructors", d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
              ].map((item) => (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-md"
                >
                  <svg className="h-4 w-4 text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.d} /></svg>
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Scroll cue */}
        <motion.a
          href="#courses-grid"
          aria-label="Scroll to courses"
          className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-white/60 transition-colors duration-150 ease-out hover:text-white"
          animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
          transition={reduceMotion ? undefined : { repeat: Infinity, duration: 2, ease: EASE.inOut }}
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em]">Explore Courses</span>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
          </svg>
        </motion.a>
      </section>

      {/* Course Cards */}
      <section id="courses-grid" className="mx-auto max-w-7xl px-4 py-section-sm sm:px-6 lg:px-8">
        <FadeUp className="mb-12 text-center">
          <h2 className={cn(H2, "mb-4")}>
            Choose Your Course
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            From first-timers to seasoned adventurers — structured progression tracks taught by certified mountain guides.
          </p>
        </FadeUp>

        <StaggerContainer className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {courses.map((course) => {
            const type = TYPE_TONES[course.type] ?? TYPE_TONES.Skiing;
            const displayPrice = course.tiers ? Math.min(...course.tiers.map((t) => t.priceBase)) : course.price;
            return (
              <StaggerItem key={course.id} className="h-full">
                <Link
                  href={`/courses/${course.slug}`}
                  className={cn(
                    "group relative block h-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5 transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-sky-900/10 hover:ring-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                    type.hoverRing
                  )}
                >
                  {course.featured && (
                    <div className="absolute right-4 top-4 z-10 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white">
                      MOST POPULAR
                    </div>
                  )}
                  <div className="relative h-48 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={course.image}
                      alt={course.name}
                      className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100" />
                  </div>
                  <div className="p-5 sm:p-6">
                    <Badge tone={type.tone} className="mb-3">
                      {course.type}
                    </Badge>
                    <h3 className="mb-2 text-lg font-semibold text-slate-900 transition-colors duration-150 ease-out group-hover:text-sky-700">
                      {course.name}
                    </h3>
                    <p className="mb-4 line-clamp-2 text-sm text-slate-600">
                      {course.shortDescription}
                    </p>
                    <div className="mb-4 flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {course.level}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <div className="min-w-0">
                        <span className="text-2xl font-bold text-slate-900">{course.tiers ? "From " : ""}<Price inr={displayPrice} /></span>
                        <span className="ml-1 text-sm text-slate-500">/ person</span>
                      </div>
                      <span className="inline-flex flex-shrink-0 items-center gap-1 whitespace-nowrap font-semibold text-emerald-700 transition-transform duration-150 ease-out group-hover:translate-x-1 motion-reduce:transition-none">
                        View Course
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </span>
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </section>

      {/* Why Choose Us */}
      <section className="bg-slate-50 py-section-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeUp className="mb-12 text-center">
            <h2 className={cn(H2, "mb-4")}>
              Why Learn With Us
            </h2>
          </FadeUp>
          <StaggerContainer className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {[
              {
                title: "Certified Instructors",
                desc: "Professional coaches with international certifications",
                icon: (
                  <svg className="h-8 w-8 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                ),
              },
              {
                title: "Prime Location",
                desc: "Auli's 3,050m slopes with Nanda Devi views",
                icon: (
                  <svg className="h-8 w-8 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 20l6-13 4 7 3-4.5L21 20H3z" />
                  </svg>
                ),
              },
              {
                title: "All Equipment",
                desc: "Complete gear provided — no need to bring anything",
                icon: (
                  <svg className="h-8 w-8 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                  </svg>
                ),
              },
              {
                title: "Recognized Certification",
                desc: "Course completion certificate for your portfolio",
                icon: (
                  <svg className="h-8 w-8 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                  </svg>
                ),
              },
            ].map((item) => (
              <StaggerItem key={item.title} className="group">
                <div className="rounded-2xl p-5 text-center transition-[background-color,box-shadow] duration-150 ease-out group-hover:bg-white group-hover:shadow-lg group-hover:shadow-sky-900/5 sm:p-6">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 transition-[transform,background-color] duration-150 ease-out group-hover:-translate-y-1 group-hover:bg-sky-100 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
                    {item.icon}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-sm text-slate-600">{item.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-gradient-to-r from-sky-700 via-sky-500 to-sky-700 py-section-sm animate-gradient motion-reduce:animate-none">
        <FadeUp className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 font-heading text-3xl font-bold tracking-[-0.02em] text-white sm:text-4xl">
            Ready to Hit the Slopes?
          </h2>
          <p className="mb-8 text-lg text-white/90">
            Book your 7-day course today and learn to ski or snowboard in the Himalayas.
          </p>
          <a
            href="https://wa.me/917817912062?text=Hi!%20I'm%20interested%20in%20the%20skiing/snowboarding%20course%20in%20Auli."
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ size: "lg" }), "group bg-white px-8 text-sky-700 shadow-lg shadow-sky-900/20 hover:bg-sky-50 hover:shadow-xl hover:shadow-sky-900/30 focus-visible:ring-white focus-visible:ring-offset-sky-600")}
          >
            Book on WhatsApp
            <svg className="h-5 w-5 transition-transform duration-150 ease-out group-hover:translate-x-1 motion-reduce:transition-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </a>
        </FadeUp>
      </section>

      {/* Course Film — playable with sound (native controls) */}
      <section className="bg-white py-section-sm">
        <FadeUp className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className={cn(H2, "mb-4")}>
            See the Slopes for Yourself
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600">
            Straight from our courses in Auli — hit play and turn the sound on.
          </p>
          <video
            controls
            controlsList="nodownload"
            preload="none"
            playsInline
            src="/assets/snowboarding/IMG_1477.MOV"
            poster="https://images.pexels.com/photos/848591/pexels-photo-848591.jpeg?w=1200&q=80"
            className="mx-auto block max-h-[80vh] w-full rounded-2xl bg-black object-contain shadow-xl shadow-slate-900/15 ring-1 ring-slate-100"
            aria-label="Course video from Auli snow sports academy"
          />
          <p className="mt-3 text-xs text-slate-400">
            Filmed on our Auli slopes during past courses.
          </p>
        </FadeUp>
      </section>
    </div>
  );
}
