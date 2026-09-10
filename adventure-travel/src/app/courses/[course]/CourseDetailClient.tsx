"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform, type Variants } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { createActivityBooking } from "@/lib/auth";
import type { Course } from "@/data/courses";
import CourseVideoBackdrop from "@/components/CourseVideoBackdrop";
import SmartImage from "@/components/SmartImage";

type Tab = "overview" | "dates" | "itinerary" | "gallery" | "included" | "book";

/* Stock footage fallback for course types without their own footage. */
/* Courses with real footage carry a `video` field (e.g. /assets/snowboarding/*.MOV). */
const TYPE_VIDEOS: Record<string, string> = {
  Skiing: "https://videos.pexels.com/video-files/5526230/5526230-sd_960_540_25fps.mp4",
  Snowboarding: "https://videos.pexels.com/video-files/5526230/5526230-sd_960_540_25fps.mp4",
  Backcountry: "https://videos.pexels.com/video-files/11270206/11270206-sd_960_540_30fps.mp4",
};

const TAB_LIST: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "dates", label: "Dates" },
  { key: "itinerary", label: "Itinerary" },
  { key: "gallery", label: "Photo Gallery" },
  { key: "included", label: "What's Included" },
  { key: "book", label: "Book Now" },
];

const INC_ICONS: Record<string, string> = {
  structor: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  equipment: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
  lift: "M13 10V3L4 14h7v7l9-11h-7z",
  bed: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  food: "M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0A1.5 1.5 0 003 15.546M12 2v4m0 0a2 2 0 100 4 2 2 0 000-4z",
  certificate: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
  firstaid: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  photos: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
};

const TYPE_COLORS: Record<string, { gradient: string; badge: string }> = {
  Skiing: { gradient: "from-sky-500 to-cyan-400", badge: "bg-sky-100 text-sky-700" },
  Snowboarding: { gradient: "from-blue-500 to-indigo-400", badge: "bg-blue-100 text-blue-700" },
  Backcountry: { gradient: "from-violet-500 to-purple-400", badge: "bg-violet-100 text-violet-700" },
};

const WA_BASE = "https://wa.me/917817912062?text=";

const STAY_LABELS: Record<"base" | "full", string> = {
  base: "Without lodging & food",
  full: "With lodging & meals",
};

/* Per-combo bullet points for the package cards ("what changes" between the 4 options). */
function pkgBullets(tier: { id: string }, stay: "base" | "full"): string[] {
  if (stay === "full") {
    return [
      "7 nights Auli stay included",
      "All meals included (breakfast, lunch & dinner)",
      tier.id === "premium" ? "Video analysis, seminars & final assessment" : "3–4 hrs practical coaching daily",
      "Certificate + graduation ceremony",
    ];
  }
  return tier.id === "premium"
    ? [
        "Training only — no stay or meals",
        "4–5 hrs daily + HD video movement analysis",
        "Snow-science seminars, final assessment & après-ski",
        "Certificate + graduation ceremony",
      ]
    : [
        "Training only — no stay or meals",
        "3–4 hrs practical coaching daily",
        "Gliding, snow-plough turns & ski-lift basics",
        "Certificate + graduation ceremony",
      ];
}

/* ─── Availability / batch schedule (derived from the course season + duration) ─── */
type CAvail = "available" | "few" | "sold";
type CourseBatch = { id: string; label: string; iso: string; days: number; price: number; availability: CAvail };

const CMONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const CAVAIL: Record<CAvail, { color: string; label: string }> = {
  available: { color: "#16A34A", label: "Available" },
  few: { color: "#D97706", label: "Filling Fast" },
  sold: { color: "#DC2626", label: "Sold Out" },
};
const C_CYCLE: CAvail[] = ["available", "available", "few", "available", "few", "sold"];

function courseDays(duration: string): number {
  const m = duration.match(/\d+/);
  return m ? parseInt(m[0], 10) : 7;
}

function fmtCourseDate(year: number, monthIdx: number, day: number): string {
  const d = new Date(year, monthIdx, day); // fixed inputs → deterministic (no hydration mismatch)
  return `${d.getDate()} ${CMONTHS[d.getMonth()]}`;
}

// Parse the season string (e.g. "Dec 2026 — Mar 2027") + duration into upcoming batches.
function getCourseBatches(course: Course, priceOverride?: number): CourseBatch[] {
  const monthTokens = (course.dates.match(/[A-Za-z]{3,}/g) ?? [])
    .map((t) => CMONTHS.findIndex((x) => x.toLowerCase() === t.slice(0, 3).toLowerCase()))
    .filter((i) => i >= 0);
  const years = (course.dates.match(/20\d{2}/g) ?? []).map(Number);
  const days = courseDays(course.duration);

  const startM = monthTokens[0] ?? 11;
  const startY = years[0] ?? 2026;
  const endM = monthTokens[1] ?? (startM + 2) % 12;
  const endY = years[years.length - 1] ?? startY;

  const months: { m: number; y: number }[] = [];
  let m = startM;
  let y = startY;
  for (let guard = 0; guard < 24; guard++) {
    months.push({ m, y });
    if (m === endM && y === endY) break;
    m += 1;
    if (m > 11) { m = 0; y += 1; }
  }

  const startDays = [8, 22];
  const out: CourseBatch[] = [];
  let ci = 0;
  for (const mo of months) {
    for (const sd of startDays) {
      const end = new Date(mo.y, mo.m, sd + days - 1);
      out.push({
        id: `${course.slug}-${mo.y}-${mo.m}-${sd}`,
        label: `${fmtCourseDate(mo.y, mo.m, sd)} – ${fmtCourseDate(end.getFullYear(), end.getMonth(), end.getDate())} ${end.getFullYear()}`,
        iso: new Date(mo.y, mo.m, sd).toISOString().slice(0, 10),
        days,
        price: priceOverride ?? course.price,
        availability: C_CYCLE[ci++ % C_CYCLE.length],
      });
      if (out.length >= 6) break;
    }
    if (out.length >= 6) break;
  }
  return out;
}

function AvailabilityView({ batches, currency, onBook }: { batches: CourseBatch[]; currency: string; onBook: (iso: string) => void }) {
  const reduce = useReducedMotion();
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  };
  const stagger: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.06 } },
  };
  return (
    <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }} variants={stagger}>
      <motion.div variants={fadeUp}>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upcoming Batches</h2>
        <p className="text-gray-600 mb-6">Live availability for this course — pick a batch and reserve your spot.</p>
      </motion.div>
      <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4 mb-5 text-xs">
        {(Object.keys(CAVAIL) as CAvail[]).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5 text-gray-500">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CAVAIL[k].color }} />
            {CAVAIL[k].label}
          </span>
        ))}
      </motion.div>
      <div className="space-y-2.5">
        {batches.map((b) => (
          <motion.div key={b.id} variants={fadeUp}>
            <CourseBatchRow b={b} currency={currency} onBook={onBook} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function CourseBatchRow({ b, currency, onBook }: { b: CourseBatch; currency: string; onBook: (iso: string) => void }) {
  const a = CAVAIL[b.availability];
  const sold = b.availability === "sold";
  return (
    <div className="group flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl bg-white ring-1 ring-gray-100 shadow-sm p-3.5 transition-[transform,box-shadow,ring-color] duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-gray-100 hover:ring-sky-200">
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 text-sm">{b.label}</div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mt-1">
          <span>{b.days} Days</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: a.color }} />
            <span style={{ color: a.color }} className="font-medium">{a.label}</span>
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between sm:justify-end gap-3">
        <div className="text-right">
          <div className="font-bold text-gray-900 text-sm">{currency}{b.price.toLocaleString("en-IN")}</div>
          <div className="text-[11px] text-gray-500">/ person</div>
        </div>
        <button
          disabled={sold}
          onClick={() => onBook(b.iso)}
          aria-label={sold ? `${b.label} sold out` : `Book ${b.label}`}
          className={`rounded-full px-5 py-2 text-sm font-bold transition-[transform,background-color,box-shadow] duration-200 active:scale-95 ${
            sold ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-sky-500 text-white shadow-md shadow-sky-200 hover:-translate-y-0.5 hover:bg-sky-600 hover:shadow-lg"
          }`}
        >
          {sold ? "Sold Out" : "Book"}
        </button>
      </div>
    </div>
  );
}

interface Props {
  course: Course;
}

export default function CourseDetailClient({ course }: Props) {
  const { user } = useAuth();
  const shouldReduceMotion = useReducedMotion();
  const [tab, setTab] = useState<Tab>("overview");
  const [bookingForm, setBookingForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    groupSize: "1",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [bookError, setBookError] = useState("");
  const [lightbox, setLightbox] = useState<number | null>(null);

  // Scroll-linked parallax — hero copy lifts and fades as the footage recedes
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroContentY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const heroContentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Scroll-reveal choreography reused across tab content
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };
  const inViewStagger: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.07 } },
  };

  // Multi-tier pricing (skiing course sells Basic/Premium × without/with stay)
  const tiers = course.tiers ?? [];
  const [tierId, setTierId] = useState(tiers[0]?.id ?? "");
  const [stay, setStay] = useState<"base" | "full">("base");
  const selectedTier = tiers.find((t) => t.id === tierId) ?? tiers[0];
  const total = selectedTier ? (stay === "full" ? selectedTier.priceFull : selectedTier.priceBase) : course.price;
  const packages = tiers.flatMap((t) => (["base", "full"] as const).map((s) => ({ tier: t, stay: s })));

  const colors = TYPE_COLORS[course.type];
  const images = course.gallery || [course.image];

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // Switch tab and center it in the strip. Panel scrolling happens in a
  // useEffect after AnimatePresence (mode="wait") has swapped the panel in.
  const goToTab = (key: Tab) => {
    setTab(key);
    const idx = TAB_LIST.findIndex((t) => t.key === key);
    tabRefs.current[idx]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  // Jump just below the sticky bars once the new panel has actually rendered.
  // Skipped on first mount so the page doesn't auto-scroll on load. Uses an
  // instant scrollIntoView (the panel carries scroll-mt-36) retried over several
  // frames so it lands correctly even while the enter animation is settling on
  // touch devices — smooth/JS-timed scrolling is flaky there.
  const firstTabRef = useRef(true);
  useEffect(() => {
    if (firstTabRef.current) {
      firstTabRef.current = false;
      return;
    }
    let raf = 0;
    const tries = 8;
    let i = 0;
    const scrollToPanel = () => {
      document.getElementById("course-tabpanel")?.scrollIntoView({ behavior: "auto", block: "start" });
      if (++i < tries) raf = requestAnimationFrame(scrollToPanel);
    };
    const t = window.setTimeout(() => {
      scrollToPanel();
    }, 220);
    const raf2 = window.requestAnimationFrame(() => {
      scrollToPanel();
    });
    return () => {
      window.clearTimeout(t);
      window.cancelAnimationFrame(raf);
      window.cancelAnimationFrame(raf2);
    };
  }, [tab]);

  // Book a specific batch → prefill the date and jump to the booking form.
  const registerForBatch = (iso: string) => {
    setBookingForm((f) => ({ ...f, date: iso }));
    goToTab("book");
  };

  const onTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    let next = index;
    if (e.key === "ArrowRight") next = (index + 1) % TAB_LIST.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + TAB_LIST.length) % TAB_LIST.length;
    else if (e.key === "Home") next = 0;
    else next = TAB_LIST.length - 1;
    const key = TAB_LIST[next].key;
    setTab(key);
    tabRefs.current[next]?.focus();
    tabRefs.current[next]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      else if (e.key === "ArrowRight") setLightbox((i) => (i === null ? i : (i + 1) % images.length));
      else if (e.key === "ArrowLeft") setLightbox((i) => (i === null ? i : (i - 1 + images.length) % images.length));
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, images.length]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      // new / signed-out visitors go straight to sign-up to create an account
      window.location.href = "/signup";
      return;
    }
    setSubmitting(true);
    try {
      await createActivityBooking({
        user_id: user.id,
        activity_type: "skiing",
        activity_name: course.name,
        activity_date: bookingForm.date,
        group_size: bookingForm.groupSize,
        message: `${selectedTier ? `Package: ${selectedTier.name} (${STAY_LABELS[stay]}) — Rs.${total.toLocaleString("en-IN")}. ` : ""}Name: ${bookingForm.name}, Email: ${bookingForm.email}, Phone: ${bookingForm.phone}. ${bookingForm.message}`,
      });
      setSent(true);
    } catch {
      setBookError("Something went wrong on our end. Please try again, or book instantly on WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  };

  const waLink = `${WA_BASE}${encodeURIComponent(
    `Hi! I'm interested in the ${course.name} (${course.type}) in Auli.`
  )}`;

  return (
    <div className="min-h-screen">
      {/* Cinematic video template behind every course sub-page — real course footage when available */}
      <CourseVideoBackdrop video={course.video ?? TYPE_VIDEOS[course.type] ?? TYPE_VIDEOS.Skiing} poster={course.image} />

      {/* Cinematic hero over the footage */}
      <section ref={heroRef} className="relative z-10 flex min-h-[92vh] items-end overflow-hidden">
        <motion.div
          style={shouldReduceMotion ? undefined : { y: heroContentY, opacity: heroContentOpacity }}
          className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-32"
        >
          <Link href="/courses" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            All Courses
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/15 text-white text-[11px] font-semibold uppercase tracking-[0.2em] mb-5 backdrop-blur-sm border border-white/20">
              Auli Snow Sports Academy · The Experience
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-5 font-heading leading-[1.02] [text-shadow:0_2px_30px_rgba(2,6,23,0.6)]">
              {course.name}
            </h1>
            <p className="text-base sm:text-lg text-white/85 max-w-2xl mb-8 line-clamp-3 [text-shadow:0_1px_12px_rgba(2,6,23,0.7)]">
              {course.shortDescription}
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", label: course.duration },
                { icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z", label: course.location },
                { icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", label: course.level },
                { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", label: "Certified" },
              ].map((item) => (
                <span key={item.label} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 text-white text-sm backdrop-blur-sm border border-white/15">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                  {item.label}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Scroll cue */}
          <motion.a
            href="#course-content"
            className="mt-12 flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em]">Scroll</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
            </svg>
          </motion.a>
        </motion.div>
      </section>

      {/* Tabs + Content — glass card floating over the footage */}
      <section id="course-content" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 -mt-6">
        <div className="rounded-3xl bg-white/95 backdrop-blur-xl shadow-2xl shadow-slate-950/40 ring-1 ring-white/40 p-4 sm:p-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="flex-1">
            {/* Tab Navigation */}
            <div className="sticky top-16 z-30 mb-8 border-b border-gray-200 bg-white/90 backdrop-blur-md">
              <div role="tablist" aria-label="Course details" className="flex gap-1 overflow-x-auto">
                {TAB_LIST.map((t, i) => (
                  <button
                    key={t.key}
                    ref={(el) => { tabRefs.current[i] = el; }}
                    role="tab"
                    id={`course-tab-${i}`}
                    aria-selected={tab === t.key}
                    aria-controls="course-tabpanel"
                    tabIndex={tab === t.key ? 0 : -1}
                    onClick={() => goToTab(t.key)}
                    onKeyDown={(e) => onTabKeyDown(e, i)}
                    className={`px-4 py-2.5 text-xs sm:px-6 sm:py-3 sm:text-sm font-medium whitespace-nowrap transition-colors relative active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-t-md ${
                      tab === t.key
                        ? "text-sky-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab === t.key &&
                      (shouldReduceMotion ? (
                        <span className="absolute inset-x-1 inset-y-1 rounded-full bg-sky-50 ring-1 ring-sky-200" />
                      ) : (
                        <motion.span
                          layoutId="course-tab-pill"
                          transition={{ type: "spring", damping: 30, stiffness: 380 }}
                          className="absolute inset-x-1 inset-y-1 rounded-full bg-sky-50 ring-1 ring-sky-200"
                        />
                      ))}
                    <span className="relative">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              id="course-tabpanel"
              role="tabpanel"
              aria-labelledby={`course-tab-${TAB_LIST.findIndex((t) => t.key === tab)}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="scroll-mt-36 focus:outline-none"
            >
              {tab === "overview" && (
                <motion.div
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={inViewStagger}
                >
                  <motion.div variants={fadeUp}>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Course</h2>
                    <p className="text-gray-600 leading-relaxed mb-8">{course.description}</p>
                  </motion.div>

                  {packages.length > 0 && (
                    <motion.div variants={fadeUp} className="mb-10">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">Choose Your Package</h3>
                      <p className="text-sm text-gray-500 mb-4">Two itineraries, each with or without stay &amp; meals — pick one and it carries through to booking.</p>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {packages.map(({ tier, stay: s }) => {
                          const active = tier.id === tierId && s === stay;
                          const price = s === "full" ? tier.priceFull : tier.priceBase;
                          return (
                            <button key={`${tier.id}-${s}`} type="button"
                              onClick={() => { setTierId(tier.id); setStay(s); }}
                              aria-pressed={active}
                              className={`relative flex flex-col rounded-2xl border p-5 text-left transition-[border-color,box-shadow,transform] duration-300 focus-visible:ring-2 focus-visible:ring-sky-400 hover:-translate-y-0.5 ${
                                active ? "border-sky-500 bg-sky-50 ring-2 ring-sky-200 shadow-lg shadow-sky-100" : "border-gray-200 bg-white hover:border-sky-300 hover:shadow-md"
                              }`}>
                              {active && (
                                <span className="absolute top-4 right-4 flex h-5 w-5 items-center justify-center rounded-full bg-sky-500">
                                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                                </span>
                              )}
                              <span className={`inline-block self-start rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${tier.id === "premium" ? "bg-violet-100 text-violet-700" : "bg-sky-100 text-sky-700"}`}>{tier.name}</span>
                              <span className="mt-2 font-heading text-2xl font-bold text-gray-900">Rs.{price.toLocaleString("en-IN")}</span>
                              <span className="text-xs text-gray-400">per person · {STAY_LABELS[s]}</span>
                              <ul className="mt-3 w-full space-y-1.5 border-t border-gray-100 pt-3">
                                {pkgBullets(tier, s).map((b) => (
                                  <li key={b} className="flex items-start gap-2 text-xs leading-snug text-gray-600">
                                    <svg className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                                    {b}
                                  </li>
                                ))}
                              </ul>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {(course.levelRequirement || course.instructorRatio || course.weeklyHours) && (
                    <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                      {[
                        { label: "Level Requirement", value: course.levelRequirement },
                        { label: "Group Size", value: course.instructorRatio },
                        { label: "Training Hours", value: course.weeklyHours },
                      ]
                        .filter((f) => f.value)
                        .map((f) => (
                          <div key={f.label} className="group rounded-xl bg-gradient-to-br from-sky-50 to-cyan-50/50 p-4 ring-1 ring-sky-100 transition-shadow duration-300 hover:shadow-md hover:shadow-sky-100">
                            <p className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1">{f.label}</p>
                            <p className="text-sm text-gray-700">{f.value}</p>
                          </div>
                        ))}
                    </motion.div>
                  )}

                  {course.highlights && (
                    <motion.div variants={fadeUp} className="mb-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Course Highlights</h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {course.highlights.map((h) => (
                          <li key={h} className="flex items-start gap-2 text-sm text-gray-600 rounded-lg px-2 py-1 transition-colors duration-200 hover:bg-gray-50">
                            <svg className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {h}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  <motion.div variants={fadeUp}>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Available Dates</h3>
                    <div className="rounded-xl bg-gradient-to-br from-sky-50 to-cyan-50/50 p-6 mb-8 ring-1 ring-sky-100">
                      <p className="text-sky-700 font-semibold">{course.dates}</p>
                      <p className="text-sky-600 text-sm mt-1">{course.duration} intensive course</p>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeUp}>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">What Guests Say</h3>
                    <div className="space-y-4">
                      {course.testimonials.map((t, i) => (
                        <figure key={i} className="group relative rounded-2xl bg-white p-6 ring-1 ring-gray-100 shadow-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-gray-100">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 font-heading text-sm font-bold text-white shadow-md shadow-sky-200">
                            {t.name.charAt(0)}
                          </div>
                          <blockquote className="mt-3 text-gray-600 italic mb-3 leading-relaxed">&ldquo;{t.text}&rdquo;</blockquote>
                          <figcaption className="text-sm font-medium text-gray-900">{t.name} — {t.location}
                            <span className="ml-2 inline-flex items-center gap-0.5 align-middle text-amber-500" aria-label={`${t.rating} out of 5 stars`}>
                              {Array.from({ length: t.rating }).map((_, s) => (
                                <svg key={s} className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.445a1 1 0 00-.363 1.118l1.286 3.958c.3.921-.755 1.688-1.539 1.118l-3.367-2.445a1 1 0 00-1.176 0l-3.367 2.445c-.783.57-1.838-.197-1.539-1.118l1.286-3.958a1 1 0 00-.363-1.118L2.924 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.958z"/></svg>
                              ))}
                            </span>
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {tab === "dates" && (
                <AvailabilityView batches={getCourseBatches(course, selectedTier?.priceBase)} currency={course.currency} onBook={registerForBatch} />
              )}

              {tab === "itinerary" && (
                <div>
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-2xl font-bold text-gray-900">{course.duration} Itinerary</h2>
                    {tiers.length > 0 && (
                      <div role="tablist" aria-label="Itinerary tier" className="flex gap-1 rounded-full bg-gray-100 p-1">
                        {tiers.map((t) => (
                          <button key={t.id} type="button" onClick={() => setTierId(t.id)} aria-pressed={selectedTier?.id === t.id}
                            className={`relative rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                              selectedTier?.id === t.id ? "text-sky-700" : "text-gray-500 hover:text-gray-800"
                            }`}>
                            {selectedTier?.id === t.id &&
                              (shouldReduceMotion ? (
                                <span className="absolute inset-0 rounded-full bg-white shadow-sm" />
                              ) : (
                                <motion.span layoutId="tier-pill" transition={{ type: "spring", damping: 30, stiffness: 380 }}
                                  className="absolute inset-0 rounded-full bg-white shadow-sm" />
                              ))}
                            <span className="relative">{t.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {selectedTier ? (
                    <>
                      <p className="text-gray-600 mb-2">{selectedTier.blurb}</p>
                      <p className="mb-6 text-sm text-gray-500">
                        Rs.{selectedTier.priceBase.toLocaleString("en-IN")} without stay &amp; meals · Rs.{selectedTier.priceFull.toLocaleString("en-IN")} with lodging &amp; all meals. Certificate and graduation ceremony included in both.
                      </p>
                      <motion.div
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-40px" }}
                        variants={inViewStagger}
                        className="space-y-2"
                      >
                        {selectedTier.itinerary.map((day, i) => (
                          <motion.div key={day.day} variants={fadeUp} className="relative flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 font-bold text-white shadow-md shadow-sky-200 ring-4 ring-sky-50">
                                {day.day}
                              </div>
                              {i < selectedTier.itinerary.length - 1 && <div className="w-px flex-1 bg-gradient-to-b from-sky-200 to-transparent" />}
                            </div>
                            <div className="flex-1 pb-8">
                              <h3 className="font-bold text-gray-900 mb-1">Day {day.day} · {day.title}</h3>
                              <p className="text-gray-600 text-sm">{day.description}</p>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-600 mb-8">A structured progression from first turns to certified confidence.</p>
                      <motion.div
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-40px" }}
                        variants={inViewStagger}
                        className="space-y-2"
                      >
                        {course.itinerary.map((day, i) => (
                          <motion.div key={day.day} variants={fadeUp} className="relative flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 font-bold text-white shadow-md shadow-sky-200 ring-4 ring-sky-50">
                                {day.day}
                              </div>
                              {i < course.itinerary.length - 1 && <div className="w-px flex-1 bg-gradient-to-b from-sky-200 to-transparent" />}
                            </div>
                            <div className="flex-1 pb-8">
                              <h3 className="font-bold text-gray-900 mb-1">{day.title}</h3>
                              <p className="text-gray-600 text-sm">{day.description}</p>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </>
                  )}
                </div>
              )}

              {tab === "gallery" && (
                <motion.div
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={inViewStagger}
                >
                  <motion.div variants={fadeUp}>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Photo Gallery</h2>
                    <p className="text-gray-600 mb-8">Moments from our skiing and snowboarding courses in Auli.</p>
                  </motion.div>
                  <motion.div variants={inViewStagger} className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {images.map((img, i) => {
                      const isVideo = /\.(mp4|mov)$/i.test(img);
                      return (
                      <motion.button
                        key={i}
                        variants={fadeUp}
                        type="button"
                        onClick={() => setLightbox(i)}
                        aria-label={`View ${isVideo ? "video" : "photo"} ${i + 1} of ${images.length}`}
                        className="relative aspect-[4/3] rounded-xl overflow-hidden group cursor-pointer ring-1 ring-gray-900/5"
                      >
                        {isVideo ? (
                          /* ponytail: no <video> here (preload="none" still stalls on 40MB .movs) —
                             exact-size skeleton + play badge; the file loads only in the lightbox */
                          <>
                            <span aria-hidden className="absolute inset-0 skeleton" />
                            <span className="absolute inset-0 flex items-center justify-center">
                              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/45 transition-transform duration-300 group-hover:scale-110">
                                <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M8 5v14l11-7z" /></svg>
                              </span>
                            </span>
                          </>
                        ) : (
                          <SmartImage
                            src={img}
                            alt={`${course.name} — photo ${i + 1}`}
                            className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover:scale-[1.06]"
                          />
                        )}
                        {!isVideo && (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <svg className="w-8 h-8 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 7.5v6m3-3h-6M21 21l-5.2-5.2" />
                            </svg>
                          </div>
                        )}
                      </motion.button>
                      );
                    })}
                  </motion.div>

                  {/* Lightbox — portaled to body so the animating tab panel's
                      CSS transform can't break its fixed/centered positioning */}
                  {createPortal(
                  <AnimatePresence>
                    {lightbox !== null && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
                        onClick={() => setLightbox(null)}
                      >
                        <button
                          onClick={() => setLightbox(null)}
                          className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
                          aria-label="Close lightbox"
                        >
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>

                        <button
                          onClick={(e) => { e.stopPropagation(); setLightbox((i) => (i === null ? i : (i - 1 + images.length) % images.length)); }}
                          className="absolute left-4 text-white/80 hover:text-white z-10 p-2"
                          aria-label="Previous photo"
                        >
                          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>

                        <motion.div
                          key={lightbox}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="max-w-4xl max-h-[80vh] relative"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/\.(mp4|mov)$/i.test(images[lightbox]) ? (
                            <video
                              src={images[lightbox]}
                              controls
                              controlsList="nodownload"
                              autoPlay
                              muted
                              playsInline
                              preload="metadata"
                              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                            />
                          ) : (
                            <img
                              src={images[lightbox]}
                              alt={`${course.name} — photo ${lightbox + 1}`}
                              className="max-w-full max-h-[80vh] object-contain rounded-lg"
                            />
                          )}
                        </motion.div>

                        <button
                          onClick={(e) => { e.stopPropagation(); setLightbox((i) => (i === null ? i : (i + 1) % images.length)); }}
                          className="absolute right-4 text-white/80 hover:text-white z-10 p-2"
                          aria-label="Next photo"
                        >
                          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>

                        <div className="absolute bottom-4 text-white/80 text-sm">
                          {lightbox + 1} / {images.length}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>,
                  document.body
                  )}
                </motion.div>
              )}

              {tab === "included" && (
                <motion.div
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={inViewStagger}
                >
                  <motion.div variants={fadeUp}>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">What&apos;s Included</h2>
                    <p className="text-gray-600 mb-8">Everything you need for a seamless mountain experience.</p>
                  </motion.div>
                  <motion.div variants={inViewStagger} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {course.inclusions.map((item, i) => (
                      <motion.div key={i} variants={fadeUp} className="flex items-start gap-4 p-5 rounded-2xl bg-white ring-1 ring-gray-100 shadow-sm transition-[transform,box-shadow,ring-color] duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-gray-100 hover:ring-sky-200">
                        <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-sky-100 to-cyan-50 flex items-center justify-center ring-1 ring-sky-100 transition-transform duration-300 group-hover:scale-105">
                          <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={INC_ICONS[item.icon] || INC_ICONS.structor} />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.label}</h3>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {tab === "book" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Book This Course</h2>
                  {sent ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Request Received!</h3>
                      <p className="text-gray-600 mb-4">We&apos;ll confirm availability for your dates shortly.</p>
                      <button onClick={() => setSent(false)} className="text-sky-600 hover:underline">
                        Book another course
                      </button>
                    </div>
                  ) : (
                    <>
                      {selectedTier && tiers.length > 0 && (
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-sky-50 p-4 ring-1 ring-sky-100">
                          <div>
                            <p className="text-sm font-bold text-gray-900">{selectedTier.name} · {STAY_LABELS[stay]}</p>
                            <p className="text-xs text-gray-500">Picked from the package cards on the Overview tab.</p>
                          </div>
                          <div className="text-right">
                            <p className="font-heading text-xl font-bold text-gray-900">Rs.{total.toLocaleString("en-IN")}</p>
                            <button type="button" onClick={() => goToTab("overview")} className="text-xs font-semibold text-sky-600 hover:underline">
                              Change package
                            </button>
                          </div>
                        </div>
                      )}
                      <form onSubmit={handleBook} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="cb-name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                          <input
                            id="cb-name"
                            type="text"
                            required
                            autoComplete="name"
                            value={bookingForm.name}
                            onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label htmlFor="cb-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            id="cb-email"
                            type="email"
                            required
                            autoComplete="email"
                            value={bookingForm.email}
                            onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label htmlFor="cb-phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <input
                            id="cb-phone"
                            type="tel"
                            required
                            inputMode="tel"
                            autoComplete="tel"
                            value={bookingForm.phone}
                            onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label htmlFor="cb-date" className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                          <input
                            id="cb-date"
                            type="date"
                            required
                            value={bookingForm.date}
                            onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label htmlFor="cb-group" className="block text-sm font-medium text-gray-700 mb-1">Group Size</label>
                          <select
                            id="cb-group"
                            value={bookingForm.groupSize}
                            onChange={(e) => setBookingForm({ ...bookingForm, groupSize: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                          >
                            {[1, 2, 3, 4, 5, 6].map((n) => (
                              <option key={n} value={n}>{n} {n === 1 ? "person" : "people"}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label htmlFor="cb-msg" className="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
                        <textarea
                          id="cb-msg"
                          rows={3}
                          value={bookingForm.message}
                          onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                          placeholder="Any special requirements or questions..."
                        />
                      </div>
                      {bookError && (
                        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-100">{bookError}</p>
                      )}
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full sm:w-auto px-8 py-3 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? "Submitting..." : "Submit Booking"}
                      </button>
                      </form>
                    </>
                  )}
                </div>
              )}
            </motion.div>
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
              className="sticky top-24 rounded-2xl bg-white/95 backdrop-blur-xl p-6 shadow-xl shadow-slate-900/10 ring-1 ring-gray-100"
            >
              <div className="mb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${colors.badge}`}>
                  {course.type}
                </span>
              </div>
              <div className="mb-4">
                {tiers.length > 0 ? (
                  <>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400">From</span>
                    <span className="text-3xl font-bold text-gray-900">Rs.{Math.min(...tiers.map((t) => t.priceBase)).toLocaleString("en-IN")}</span>
                    <span className="text-gray-500 ml-1">/ person</span>
                    <table className="mt-3 w-full text-left text-xs">
                      <thead>
                        <tr className="text-gray-400">
                          <th className="py-1 font-medium" scope="col"><span className="sr-only">Tier</span></th>
                          <th className="py-1 text-right font-medium" scope="col">No stay</th>
                          <th className="py-1 text-right font-medium" scope="col">With stay</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tiers.map((t) => (
                          <tr key={t.id} className={`border-t border-gray-100 ${selectedTier?.id === t.id ? "text-sky-700 font-semibold" : ""}`}>
                            <td className="py-1.5">{t.name}</td>
                            <td className="py-1.5 text-right">Rs.{t.priceBase.toLocaleString("en-IN")}</td>
                            <td className="py-1.5 text-right">Rs.{t.priceFull.toLocaleString("en-IN")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-gray-900">Rs.{course.price.toLocaleString("en-IN")}</span>
                    <span className="text-gray-500 ml-1">/ person</span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-6">{course.duration} · {course.dates}</p>
              
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-300 mb-3 active:scale-95"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Book on WhatsApp
              </a>
              <button
                onClick={() => goToTab("book")}
                className="block w-full rounded-full border-2 border-sky-500 px-6 py-2.5 text-sm font-semibold text-sky-600 transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-sky-50 active:scale-95"
              >
                Book Online
              </button>

              <div className="mt-6 pt-6 border-t border-gray-100 space-y-2.5 text-sm text-gray-600">
                {[
                  { d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", label: "Certified instruction" },
                  { d: INC_ICONS.equipment, label: "All equipment included" },
                  { d: INC_ICONS.bed, label: "Accommodation & meals" },
                  { d: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5", label: "Free cancellation" },
                ].map((b) => (
                  <div key={b.label} className="flex items-center gap-2.5 rounded-lg bg-gray-50 px-3 py-2 ring-1 ring-gray-100">
                    <svg className="h-4 w-4 text-sky-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={b.d} /></svg>
                    {b.label}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
        </div>
      </section>

      {/* Fixed mobile booking band — price + CTA always reachable on phones */}
      <div
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex-shrink-0">
            <div className="text-[11px] leading-none text-gray-500">From</div>
            <div className="text-lg font-bold leading-tight text-gray-900">
              Rs.{Math.min(...tiers.map((t) => t.priceBase), course.price).toLocaleString("en-IN")}
            </div>
          </div>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 rounded-full border-2 border-emerald-500 px-4 py-2.5 text-sm font-semibold text-emerald-600 active:scale-95 transition"
          >
            WhatsApp
          </a>
          <button
            onClick={() => goToTab("book")}
            className="flex-1 rounded-full bg-sky-500 px-4 py-2.5 text-sm font-bold text-white shadow-md active:scale-95 transition"
          >
            Book Now →
          </button>
        </div>
      </div>
    </div>
  );
}
