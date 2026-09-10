"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useReveal } from "@/hooks/useReveal";
import SmartImage from "@/components/SmartImage";
import CampingSection from "@/components/CampingSection";
const activities = [
  {
    id: "trekking",
    name: "Trekking",
    tagline: "Walk the Himalayas",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
    description: "From gentle valley walks to challenging high-altitude expeditions, discover 17 handcrafted treks across Uttarakhand and Himachal Pradesh.",
    features: [
      "Valley of Flowers — 6 days through alpine meadows",
      "Kedarkantha — perfect beginner winter summit",
      "Roopkund — mysterious high-altitude lake trek",
      "Har Ki Dun — ancient valley with panoramic peaks",
    ],
    stats: { treks: "9+", difficulty: "Easy to Expert", duration: "4-12 Days" },
    cta: { label: "Explore Treks", href: "/treks" },
    color: "emerald",
  },
  {
    id: "camping",
    name: "Camping",
    tagline: "Under the Himalayan stars",
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80",
    description: "Riverside camps in Rishikesh, mountain camps in Uttarakhand, and basecamp setups for treks. Sleep under a billion stars.",
    features: [
      "Rishikesh riverside camps with bonfires",
      "Mountain basecamp experiences",
      "Swiss tents with modern amenities",
      "Stargazing & nature walks",
    ],
    stats: { locations: "5+", type: "Riverside & Mountain", season: "Year-round" },
    cta: { label: "View Camps", href: "/contact" },
    color: "orange",
  },
  {
    id: "paragliding",
    name: "Paragliding",
    tagline: "Soar over the valleys",
    image: "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=800&q=80",
    description: "Tandem paragliding flights in Bir Billing and Mussoorie. Experience the Himalayas from above with certified pilots.",
    features: [
      "Tandem flights for beginners",
      "Certified & experienced pilots",
      "GoPro footage included",
      "Bir Billing — world's best site",
    ],
    stats: { duration: "15-30 min", altitude: "2,000m+", location: "Bir & Mussoorie" },
    cta: { label: "Book Flight", href: "/contact" },
    color: "violet",
  },
];

const colorMap: Record<string, { bg: string; text: string; accent: string; badge: string }> = {
  emerald: { bg: "bg-emerald-500", text: "text-emerald-600", accent: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700" },
  sky: { bg: "bg-sky-500", text: "text-sky-600", accent: "bg-sky-500", badge: "bg-sky-100 text-sky-700" },
  orange: { bg: "bg-orange-500", text: "text-orange-600", accent: "bg-orange-500", badge: "bg-orange-100 text-orange-700" },
  violet: { bg: "bg-violet-500", text: "text-violet-600", accent: "bg-violet-500", badge: "bg-violet-100 text-violet-700" },
};

const icons: Record<string, React.JSX.Element> = {
  trekking: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  skiing: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  camping: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  ),
  paragliding: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.115 5.19l.319 1.913A6 6 0 008.11 10.36L9.75 12l-.387.775c-.217.433-.132.956.21 1.298l1.348 1.348c.21.21.329.497.329.795v1.089c0 .426.24.815.622 1.006l.153.076c.433.217.956.132 1.298-.21l.723-.723a8.7 8.7 0 002.288-4.042 1.087 1.087 0 00-.358-1.099l-1.33-1.108c-.251-.21-.582-.299-.905-.245l-1.17.195a1.125 1.125 0 01-.98-.314l-.295-.295a1.125 1.125 0 010-1.591l.13-.132a1.125 1.125 0 011.3-.21l.603.302a.809.809 0 001.086-1.086L14.25 7.5l1.256-.837a4.5 4.5 0 001.528-1.732l.146-.292M6.115 5.19A9 9 0 1017.18 4.64M6.115 5.19A8.965 8.965 0 0112 3c1.929 0 3.72.608 5.18 1.64" />
    </svg>
  ),
};

export default function ActivitiesPage() {
  const { ref: headerRef } = useReveal("reveal-up");

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      {/* Hero Banner */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          <SmartImage
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80"
            alt="Activities Banner"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/50 to-primary/80" />
        </div>
        <div className="relative z-10 flex h-full items-center justify-center">
          <div className="text-center px-6">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              Choose Your Adventure
            </p>
            <h1 className="mb-6 text-5xl md:text-7xl font-heading font-bold text-white">
              Activities
            </h1>
            <p className="max-w-2xl text-lg text-white/80">
              From Himalayan treks to snow-covered slopes, riverside camps to tandem flights — find your perfect adventure in the Indian Himalayas.
            </p>
          </div>
        </div>
      </section>

      {/* Skiing & Snowboarding feature banner */}
      <section id="skiing" className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100">
        {/* Flowing ribbon accent (echoes the airy landing-page look) */}
        <svg className="pointer-events-none absolute -top-16 left-0 w-2/3 text-sky-200/70" viewBox="0 0 600 300" fill="none" aria-hidden>
          <path d="M0,130 C 150,40 300,210 460,90 C 540,35 600,90 600,90" stroke="currentColor" strokeWidth="90" strokeLinecap="round" />
        </svg>

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 pt-16 pb-8 md:pt-24 lg:grid-cols-2 lg:gap-16 lg:px-8">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative"
          >
            <div className="pointer-events-none absolute -inset-4 -z-10 rounded-[2.5rem] bg-gradient-to-br from-sky-300/30 to-blue-400/20 blur-2xl" />
            <div className="group relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-2xl shadow-sky-900/15">
              <SmartImage
                src="/assets/skiing/IMG_5035.JPG.jpeg"
                alt="Snowboarding the powder slopes of Auli"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-sky-950/25 to-transparent" />
              {/* Curved edge facing the text, filled with the section colour */}
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-14 text-sky-50 lg:block">
                <svg className="h-full w-full" viewBox="0 0 56 100" preserveAspectRatio="none" fill="currentColor" aria-hidden>
                  <path d="M56,0 L36,0 C 10,22 50,48 22,70 C -2,88 42,100 32,100 L56,100 Z" />
                </svg>
              </div>
            </div>

            {/* Backcountry secondary image (collage) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="absolute -bottom-6 -left-6 hidden w-44 rotate-[-5deg] lg:block"
            >
              <div className="relative aspect-square overflow-hidden rounded-2xl border-[5px] border-white shadow-xl">
                <SmartImage
                  src="https://plus.unsplash.com/premium_photo-1754337730608-59a489f3c9fd?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Backcountry Ski & Snowboard Touring in the Himalayas"
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-2 left-2 rounded-full bg-sky-600/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                  Backcountry
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-center lg:text-left"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-sky-600">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              Skiing &amp; Snowboarding · Auli
            </span>
            <h2 className="mt-4 font-heading text-4xl font-bold leading-[1.05] text-sky-900 md:text-6xl">
              Enjoy the <span className="text-sky-500">Journey</span>
            </h2>
            <p className="mt-4 text-lg font-semibold text-sky-700">
              Certified 7-day courses on the powder slopes of Auli.
            </p>
            <p className="mx-auto mt-4 max-w-lg text-muted lg:mx-0">
              Learn to ski or snowboard with certified instructors — complete equipment provided,
              from beginner nursery slopes to intermediate runs, all beneath the gaze of Nanda Devi.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 rounded-full border-2 border-sky-500 px-7 py-3 text-sm font-semibold text-sky-600 transition-all hover:-translate-y-0.5 hover:bg-sky-500 hover:text-white"
              >
                View Courses
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Skills Academy */}
        <div id="skills-academy" className="relative mx-auto max-w-7xl px-6 pb-16 md:pb-24 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground">
              Skills Academy
            </h2>
            <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
              From first-timers to seasoned adventurers — structured progression tracks taught by certified mountain guides. Learn at your pace, earn your level.
            </p>
            <div className="mt-6 flex items-center justify-center gap-6 text-sm font-semibold">
              <span className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-full bg-emerald-500"></span> Beginner</span>
              <span className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-full bg-sky-500"></span> Intermediate</span>
              <span className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-full bg-red-500"></span> Advanced</span>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Skiing Track */}
            <div className="group relative overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-sky-100 transition-transform hover:-translate-y-1">
              <div className="bg-gradient-to-r from-sky-500 to-cyan-400 p-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" /></svg>
                  </div>
                  <div>
                    <Link href="/courses/skiing-course" className="font-heading text-xl font-bold underline-offset-4 hover:underline">Alpine Skiing</Link>
                    <p className="text-sm text-white/70">Auli · 7-day certified course</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex gap-3">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">🟢 Snowplough</span>
                  <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">🔵 Parallel Turns</span>
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">🔴 Off-Piste</span>
                </div>
                <p className="mt-4 text-sm text-muted">Master stance, balance, and stopping on nursery slopes. Progress through linked turns to chairlift runs with an instructor at your side.</p>
                <div className="mt-5 flex items-center justify-between">
                  <p className="font-heading text-xl font-bold text-foreground">From ₹10,000 <span className="text-xs font-normal text-muted">/ 7 days</span></p>
                  <div className="flex flex-wrap gap-2">
                    <Link href="/courses" className="rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-sky-600 hover:scale-105">View Course</Link>
                    <a href={`https://wa.me/917817912062?text=${encodeURIComponent("Hi! I'm interested in the Skiing course in Auli.")}`} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-sky-500 px-4 py-2.5 text-sm font-semibold text-sky-600 transition-all hover:bg-sky-50">Book</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Snowboarding Track */}
            <div className="group relative overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-indigo-100 transition-transform hover:-translate-y-1">
              <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>
                  </div>
                  <div>
                    <Link href="/courses/snowboarding-course" className="font-heading text-xl font-bold underline-offset-4 hover:underline">Snowboarding</Link>
                    <p className="text-sm text-white/70">Auli · 7-day certified course</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex gap-3">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">🟢 Balance & Sliding</span>
                  <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">🔵 Heel/Toe Turns</span>
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">🔴 Freestyle Basics</span>
                </div>
                <p className="mt-4 text-sm text-muted">From first slides to linking turns on blue runs. Build confidence with progressive coaching and all equipment included.</p>
                <div className="mt-5 flex items-center justify-between">
                  <p className="font-heading text-xl font-bold text-foreground">₹35,000 <span className="text-xs font-normal text-muted">/ 7 days</span></p>
                  <div className="flex flex-wrap gap-2">
                    <Link href="/courses" className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-600 hover:scale-105">View Course</Link>
                    <a href={`https://wa.me/917817912062?text=${encodeURIComponent("Hi! I'm interested in the Snowboarding course in Auli.")}`} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-indigo-400 px-4 py-2.5 text-sm font-semibold text-indigo-600 transition-all hover:bg-indigo-50">Book</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Mountaineering Track */}
            <div className="group relative overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-emerald-100 transition-transform hover:-translate-y-1">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-400 p-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008V10.5zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-bold">Mountaineering</h3>
                    <p className="text-sm text-white/70">Himalayas · Multi-day expeditions</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex gap-3">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">🟢 Day Hikes</span>
                  <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">🔵 Peak Bidding</span>
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">🔴 High Altitude</span>
                </div>
                <p className="mt-4 text-sm text-muted">Start with guided day hikes, progress to multi-day treks with technical sections. Rope work, crampon technique, and glacier travel.</p>
                <div className="mt-5 flex items-center justify-between">
                  <p className="font-heading text-xl font-bold text-foreground">₹18,000+ <span className="text-xs font-normal text-muted">/ trek</span></p>
                  <a href={`https://wa.me/917817912062?text=${encodeURIComponent("Hi! I'm interested in mountaineering courses.")}`} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-600 hover:scale-105">Enquire</a>
                </div>
              </div>
            </div>

            {/* Rock Climbing Track */}
            <div className="group relative overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-amber-100 transition-transform hover:-translate-y-1">
              <div className="bg-gradient-to-r from-amber-500 to-orange-400 p-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" /></svg>
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-bold">Rock Climbing</h3>
                    <p className="text-sm text-white/70">Rishikesh & Himalayas · Day courses</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex gap-3">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">🟢 Top-Rope Basics</span>
                  <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">🔵 Lead Climbing</span>
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">🔴 Multi-Pitch</span>
                </div>
                <p className="mt-4 text-sm text-muted">Learn belaying, footwork, and route reading on natural rock. Progress from gym-style top-rope to outdoor multi-pitch routes.</p>
                <div className="mt-5 flex items-center justify-between">
                  <p className="font-heading text-xl font-bold text-foreground">₹5,000+ <span className="text-xs font-normal text-muted">/ session</span></p>
                  <a href={`https://wa.me/917817912062?text=${encodeURIComponent("Hi! I'm interested in rock climbing courses.")}`} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-amber-600 hover:scale-105">Enquire</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Camping — detailed section (anchor target for #camping) */}
      <div id="camping" className="scroll-mt-24">
        <CampingSection />
      </div>

      {/* Activity Cards */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div ref={headerRef} className="text-center mb-16 reveal-up">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-primary">
              What Adventure Calls You?
            </h2>
            <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
              Every activity is guided, insured, and designed for unforgettable experiences. Pick your passion — we handle the rest.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {activities.filter((act) => act.id !== "camping").map((act) => {
              const colors = colorMap[act.color];
              return (
                <div
                  key={act.id}
                  id={act.id === "skiing" ? undefined : act.id}
                  className="group rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 trek-card-hover"
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <SmartImage
                      src={act.image}
                      alt={act.name}
                      className="h-full w-full object-cover trek-card-img"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${colors.badge}`}>
                        {icons[act.id]}
                        {act.name}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white/80 text-sm font-medium">{act.tagline}</p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    <p className="text-muted leading-relaxed mb-6">{act.description}</p>

                    {/* Features */}
                    <div className="space-y-3 mb-6">
                      {act.features.map((f) => (
                        <div key={f} className="flex items-start gap-3">
                          <svg className={`mt-0.5 h-4 w-4 flex-shrink-0 ${colors.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          <span className="text-sm text-primary/80">{f}</span>
                        </div>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-3 mb-6">
                      {Object.entries(act.stats).map(([key, val]) => (
                        <span key={key} className="rounded-full bg-gray-100 dark:bg-white/10 px-3 py-1 text-xs font-medium text-primary">
                          {val}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <Link
                      href={act.cta.href}
                      className={`inline-flex items-center gap-2 rounded-xl ${colors.accent} px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105`}
                    >
                      {act.cta.label}
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Restricted Border Treasures - ILP Section */}
      <section className="py-20 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-amber-500/5 blur-[120px]" />
          <div className="absolute bottom-20 right-[15%] w-96 h-96 rounded-full bg-emerald-500/5 blur-[100px]" />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-2 mb-6">
              <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <span className="text-xs font-semibold text-amber-400 tracking-wider uppercase">Inner Line Permit Required</span>
            </div>
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-white mb-4">
              Unlock <span className="text-amber-400">Restricted</span> Uttarakhand
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              These forbidden border regions are off-limits without a permit. We handle the paperwork — you explore the unexplored.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                slug: "mana-pass",
                name: "Mana Pass",
                altitude: "5,616m",
                region: "Chamoli, Uttarakhand",
                description: "India's highest motorable pass. Ancient Indo-Tibetan trade route. Raw, desolate, breathtaking.",
                image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
                status: "Restricted — ILP Required",
              },
              {
                slug: "niti-pass",
                name: "Niti Pass",
                altitude: "5,360m",
                region: "Chamoli, Uttarakhand",
                description: "Ancient Himalayan trade route at the Indo-Tibetan border. Pristine glacial landscapes untouched by tourism.",
                image: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=600&q=80",
                status: "Restricted — ILP Required",
              },
              {
                slug: "rimkhim",
                name: "Rimkhim",
                altitude: "4,500m+",
                region: "Chamoli, Uttarakhand",
                description: "Remote border village near the Tibet frontier. Untouched wilderness, zero crowds, pure Himalayan solitude.",
                image: "https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=600&q=80",
                status: "Restricted — ILP Required",
              },
            ].map((place, i) => (
              <Link
                key={place.name}
                href={`/treks/${place.slug}`}
                className="group relative rounded-3xl overflow-hidden h-80 block"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <SmartImage
                  src={place.image}
                  alt={place.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

                {/* Lock Icon */}
                <div className="absolute top-6 right-6 h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center transition-all duration-500 group-hover:bg-amber-500/20 group-hover:scale-110">
                  <svg className="h-5 w-5 text-white/70 group-hover:text-amber-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-400 mb-2">{place.status}</span>
                  <h3 className="font-heading text-2xl font-bold text-white mb-1">{place.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-white/50 mb-3">
                    <span>{place.altitude}</span>
                    <span className="w-1 h-1 rounded-full bg-white/30" />
                    <span>{place.region}</span>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed max-h-0 overflow-hidden opacity-0 transition-all duration-500 group-hover:max-h-24 group-hover:opacity-100">
                    {place.description}
                  </p>
                </div>

                {/* Bottom reveal bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </Link>
            ))}
          </div>

          {/* Permit CTA */}
          <div className="mt-12 text-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">We handle the ILP permit for you</p>
                  <p className="text-xs text-white/50">Proper guidelines, hassle-free entry to restricted areas</p>
                </div>
              </div>
              <a
                href="https://wa.me/918650561564?text=Hi!%20I'm%20interested%20in%20restricted%20area%20trekking%20(Mana/Niti/Rimkhim)."
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/25 hover:shadow-xl hover:scale-105 transition-all"
              >
                Get Permit Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Why Our Activities Section */}
      <section className="py-20 bg-accent/5">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary">
              Why Adventure With Us?
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "5,000+", label: "Happy Adventurers", icon: "👥" },
              { value: "100%", label: "Safety Record", icon: "🛡️" },
              { value: "4.8/5", label: "Average Rating", icon: "⭐" },
              { value: "24/7", label: "Support", icon: "📞" },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-6 rounded-2xl bg-white dark:bg-card shadow-md">
                <div className="text-3xl mb-3">{stat.icon}</div>
                <p className="font-heading text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary/90 to-accent/80">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-6">
              Ready to Start Your Adventure?
            </h2>
            <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
              Whether it&apos;s your first trek or your fiftieth, we&apos;ll make it unforgettable. Talk to our team to plan your perfect trip.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="rounded-xl bg-white dark:bg-card px-8 py-4 text-base font-semibold text-primary shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                Plan My Trip
              </Link>
              <a
                href="https://wa.me/917817912062?text=Hi!%20I'm%20interested%20in%20an%20adventure."
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border-2 border-white px-8 py-4 text-base font-semibold text-white hover:bg-white hover:text-primary transition-all"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

