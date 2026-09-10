"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform, type Variants } from "framer-motion";
import { courses } from "@/data/courses";
import TermsConditions from "@/components/TermsConditions";

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

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string; hoverRing: string }> = {
  Skiing: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", hoverRing: "hover:ring-sky-300" },
  Snowboarding: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", hoverRing: "hover:ring-blue-300" },
  Backcountry: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", hoverRing: "hover:ring-violet-300" },
};

export default function CoursesPageClient() {
  const [idx, setIdx] = useState(0);
  const reduceMotion = useReducedMotion();

  // Scroll-linked parallax — media recedes while copy lifts away
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 110]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  // Orchestrated entrance choreography
  const heroStagger: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduceMotion ? 0 : 0.12, delayChildren: 0.15 } },
  };
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 26 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
  };
  const lineReveal: Variants = reduceMotion
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.4 } } }
    : { hidden: { y: "112%" }, show: { y: "0%", transition: { duration: 0.95, ease: [0.22, 1, 0.36, 1] } } };
  const inViewStagger: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduceMotion ? 0 : 0.07 } },
  };

  useEffect(() => {
    if (reduceMotion || HERO_MEDIA.length < 2) return;
    const cur = HERO_MEDIA[idx];
    const delay = cur.type === "video" ? 6000 : 4000;
    const t = setTimeout(() => setIdx((i) => (i + 1) % HERO_MEDIA.length), delay);
    return () => clearTimeout(t);
  }, [reduceMotion, idx]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero — cinematic full-bleed media, parallax + orchestrated reveal */}
      <section ref={heroRef} className="relative flex min-h-[88vh] items-center overflow-hidden bg-[#0B1D33]">
        {/* Media layer (parallax zoom on scroll) */}
        <motion.div style={reduceMotion ? undefined : { scale: mediaScale }} className="absolute inset-0 will-change-transform">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={idx}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={reduceMotion ? { duration: 0.25 } : { duration: 1.1, ease: [0.23, 1, 0.32, 1] }}
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1D33]/80 via-[#0B1D33]/30 to-[#0B1D33]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0B1D33] to-transparent" />

        {/* Slide dots */}
        <div className="absolute bottom-6 right-6 z-20 flex gap-1.5">
          {HERO_MEDIA.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"}`}
            />
          ))}
        </div>

        {/* Copy — staggered clip-reveal */}
        <motion.div style={reduceMotion ? undefined : { y: contentY, opacity: contentOpacity }} className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
          <motion.div variants={heroStagger} initial="hidden" animate="show" className="mx-auto max-w-3xl text-center">
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-sky-200 ring-1 ring-white/25 backdrop-blur-md mb-7">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
              Auli Snow Sports Academy
            </motion.span>

            <h1 className="font-heading text-4xl font-bold leading-[1.04] text-white sm:text-6xl lg:text-7xl [text-shadow:0_2px_30px_rgba(2,6,23,0.55)]">
              <span className="block overflow-hidden pb-1">
                <motion.span variants={lineReveal} className="block">Skiing &amp; Snowboarding</motion.span>
              </span>
              <span className="block overflow-hidden pb-2">
                <motion.span variants={lineReveal} className="block text-cyan-300">in the Himalayas</motion.span>
              </span>
            </h1>

            <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-xl text-lg text-white/85 sm:text-xl [text-shadow:0_1px_12px_rgba(2,6,23,0.7)]">
              Certified 7-day courses on the powder slopes of Auli — professionals, full equipment, and views of Nanda Devi.
            </motion.p>

            <div className="mt-9 flex flex-wrap justify-center gap-3">
              {[
                { label: "Dec 2026 — Mar 2027", d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
                { label: "Auli, Uttarakhand", d: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" },
                { label: "Certified Instructors", d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
              ].map((item) => (
                <motion.span key={item.label} variants={fadeUp}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-md">
                  <svg className="h-4 w-4 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.d} /></svg>
                  {item.label}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.a
          href="#courses-grid"
          aria-label="Scroll to courses"
          className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60 transition-colors hover:text-white"
          animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
          transition={reduceMotion ? undefined : { repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em]">Explore Courses</span>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
          </svg>
        </motion.a>
      </section>

      {/* Course Cards */}
      <section id="courses-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-heading">
            Choose Your Course
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From first-timers to seasoned adventurers — structured progression tracks taught by certified mountain guides.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={inViewStagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {courses.map((course) => {
            const colors = TYPE_COLORS[course.type];
            const displayPrice = course.tiers ? Math.min(...course.tiers.map((t) => t.priceBase)) : course.price;
            return (
              <motion.div key={course.id} variants={fadeUp}>
                <Link
                  href={`/courses/${course.slug}`}
                  className={`group relative block h-full bg-white rounded-2xl overflow-hidden ring-1 ring-gray-900/5 shadow-sm transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-sky-900/10 hover:ring-2 ${colors.hoverRing}`}
                >
                  {course.featured && (
                    <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                      MOST POPULAR
                    </div>
                  )}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={course.image}
                      alt={course.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover:scale-[1.07]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  </div>
                  <div className="p-6">
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text} mb-3`}>
                      {course.type}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-sky-600 transition-colors duration-300">
                      {course.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.shortDescription}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {course.level}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        <span className="text-2xl font-bold text-gray-900">{course.tiers ? "From " : ""}Rs.{displayPrice.toLocaleString("en-IN")}</span>
                        <span className="text-sm text-gray-500 ml-1">/ person</span>
                      </div>
                      <span className="text-sky-600 font-semibold group-hover:translate-x-1 transition-transform duration-300 inline-flex items-center gap-1">
                        View Course
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-heading">
              Why Learn With Us
            </h2>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={inViewStagger}
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
          >
            {[
              {
                title: "Certified Instructors",
                desc: "Professional coaches with international certifications",
                icon: (
                  <svg className="h-8 w-8 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                ),
              },
              {
                title: "Prime Location",
                desc: "Auli's 3,050m slopes with Nanda Devi views",
                icon: (
                  <svg className="h-8 w-8 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 20l6-13 4 7 3-4.5L21 20H3z" />
                  </svg>
                ),
              },
              {
                title: "All Equipment",
                desc: "Complete gear provided — no need to bring anything",
                icon: (
                  <svg className="h-8 w-8 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                  </svg>
                ),
              },
              {
                title: "Recognized Certification",
                desc: "Course completion certificate for your portfolio",
                icon: (
                  <svg className="h-8 w-8 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                  </svg>
                ),
              },
            ].map((item) => (
              <motion.div key={item.title} variants={fadeUp} className="group">
                <div className="text-center p-6 rounded-2xl transition-colors duration-300 group-hover:bg-white group-hover:shadow-lg group-hover:shadow-sky-900/5">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 transition-[transform,background-color,box-shadow] duration-300 group-hover:-translate-y-1 group-hover:scale-105 group-hover:bg-sky-100 group-hover:shadow-md">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-[linear-gradient(115deg,#0369a1,#0ea5e9,#22d3ee,#0ea5e9,#0369a1)] animate-gradient py-16">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-heading">
            Ready to Hit the Slopes?
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Book your 7-day course today and learn to ski or snowboard in the Himalayas.
          </p>
          <a
            href="https://wa.me/917817912062?text=Hi!%20I'm%20interested%20in%20the%20skiing/snowboarding%20course%20in%20Auli."
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 bg-white text-sky-600 px-8 py-3 rounded-full font-semibold shadow-lg shadow-sky-900/20 transition-[transform,box-shadow,background-color] duration-300 ease-out hover:-translate-y-0.5 hover:bg-sky-50 hover:shadow-xl hover:shadow-sky-900/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Book on WhatsApp
            <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </a>
        </motion.div>
      </section>

      {/* Course Film — playable with sound (native controls) */}
      <section className="bg-white py-16">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-heading">
            See the Slopes for Yourself
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Straight from our courses in Auli — hit play and turn the sound on.
          </p>
          <video
            controls
            preload="none"
            playsInline
            src="/assets/snowboarding/IMG_1477.MOV"
            poster="https://images.pexels.com/photos/848591/pexels-photo-848591.jpeg?w=1200&q=80"
            className="mx-auto block max-h-[80vh] w-full rounded-2xl bg-black object-contain shadow-xl shadow-slate-900/15 ring-1 ring-gray-100"
            aria-label="Course video from Auli snow sports academy"
          />
          <p className="mt-3 text-xs text-gray-400">
            Filmed on our Auli slopes during past courses.
          </p>
        </motion.div>
      </section>

      {/* Terms & Conditions */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <TermsConditions />
        </div>
      </section>
    </div>
  );
}
