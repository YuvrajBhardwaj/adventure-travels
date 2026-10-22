"use client";

import { useState, useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { motion, useAnimate, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { Course } from "@/data/courses";
import CourseVideoBackdrop from "@/components/CourseVideoBackdrop";
import WallpaperCarousel from "@/components/WallpaperCarousel";
import SmartImage from "@/components/SmartImage";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import Price, { PriceNote } from "@/components/Price";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import WhatsAppFallback from "@/components/WhatsAppFallback";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { transition } from "@/lib/motion";
import { cn } from "@/lib/utils";

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

// Course-type tag tones, in the brand palette.
const TYPE_TONES: Record<string, "sky" | "slate" | "amber"> = {
  Skiing: "sky",
  Snowboarding: "slate",
  Backcountry: "amber",
};

const WA_BASE = "https://wa.me/917817912062?text=";

/** Phone: a 10-digit Indian mobile (optionally with 0, 91 or +91), or any +country number of 8-15 digits. Spaces, dashes and brackets are ignored. */
function isValidPhone(raw: string): boolean {
  const v = raw.trim().replace(/[\s\-()]/g, "");
  return /^(?:\+?91|0)?[6-9]\d{9}$/.test(v) || /^\+\d{8,15}$/.test(v);
}

/** Today as YYYY-MM-DD in the visitor's time zone. Empty on the server, so the static HTML and hydration agree. */
function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const subscribeNever = () => () => {};

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
const CAVAIL: Record<CAvail, { dot: string; text: string; label: string }> = {
  available: { dot: "bg-emerald-600", text: "text-emerald-700", label: "Available" },
  few: { dot: "bg-amber-500", text: "text-amber-700", label: "Filling Fast" },
  sold: { dot: "bg-red-600", text: "text-red-700", label: "Sold Out" },
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

/* Panel content has no scroll-in reveals of its own: CourseTabPanel fades the whole panel in when it is shown. */
function AvailabilityView({ batches, onBook }: { batches: CourseBatch[]; onBook: (iso: string) => void }) {
  return (
    <div>
      <h2 className={cn(PANEL_H2, "mb-2")}>Upcoming Batches</h2>
      <p className="mb-6 text-slate-600">Live availability for this course — pick a batch and reserve your spot.</p>
      <div className="mb-5 flex flex-wrap items-center gap-4 text-xs">
        {(Object.keys(CAVAIL) as CAvail[]).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5 text-slate-500">
            <span className={cn("h-2.5 w-2.5 rounded-full", CAVAIL[k].dot)} />
            {CAVAIL[k].label}
          </span>
        ))}
      </div>
      <div className="space-y-2.5">
        {batches.map((b) => (
          <CourseBatchRow key={b.id} b={b} onBook={onBook} />
        ))}
      </div>
    </div>
  );
}

function CourseBatchRow({ b, onBook }: { b: CourseBatch; onBook: (iso: string) => void }) {
  const a = CAVAIL[b.availability];
  const sold = b.availability === "sold";
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 transition-shadow duration-150 ease-out hover:shadow-lg hover:shadow-slate-100 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-slate-900">{b.label}</div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          <span>{b.days} Days</span>
          <span className="inline-flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-full", a.dot)} />
            <span className={cn("font-medium", a.text)}>{a.label}</span>
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <div className="text-right">
          <div className="text-sm font-bold text-slate-900"><Price inr={b.price} /></div>
          <div className="text-[11px] text-slate-500">/ person</div>
        </div>
        <Button
          variant={sold ? "outline" : "default"}
          disabled={sold}
          onClick={() => onBook(b.iso)}
          aria-label={sold ? `${b.label} sold out` : `Book ${b.label}`}
          className="px-6 font-bold"
        >
          {sold ? "Sold Out" : "Book"}
        </Button>
      </div>
    </div>
  );
}

interface Props {
  course: Course;
}

/** Headings inside the tab panels (they sit in a card, one step below a page-section h2). */
const PANEL_H2 = "font-heading text-2xl font-bold tracking-[-0.02em] text-slate-900";
const PANEL_H3 = "font-heading text-xl font-semibold text-slate-900";

/**
 * One tab's panel. All panels stay mounted (their text is in the static HTML for crawlers,
 * and the booking form survives tab switches); inactive ones are `hidden`, so their lazy
 * images don't load until shown. The fade-in runs only when a panel is switched to after
 * load, never on first paint, and not at all with reduced motion.
 */
function CourseTabPanel({ index, active, reduceMotion, children }: { index: number; active: boolean; reduceMotion: boolean; children: ReactNode }) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const wasActive = useRef(active);

  useEffect(() => {
    if (active && !wasActive.current && !reduceMotion && scope.current) {
      animate(scope.current, { opacity: [0, 1], y: [10, 0] }, transition("base"));
    }
    wasActive.current = active;
  }, [active, reduceMotion, animate, scope]);

  return (
    <div
      ref={scope}
      id={`course-tabpanel-${index}`}
      role="tabpanel"
      aria-labelledby={`course-tab-${index}`}
      tabIndex={0}
      hidden={!active}
      className="rounded-2xl"
    >
      {children}
    </div>
  );
}

export default function CourseDetailClient({ course }: Props) {
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
  const [bookErrors, setBookErrors] = useState<Record<string, string>>({});
  const clearBookError = (key: string) => setBookErrors((prev) => (prev[key] ? { ...prev, [key]: "" } : prev));
  const today = useSyncExternalStore(subscribeNever, localToday, () => "");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [bookError, setBookError] = useState("");
  // The booking service couldn't be reached or isn't set up: nothing was saved, so offer WhatsApp instead of "try again".
  const [bookUnavailable, setBookUnavailable] = useState(false);
  // Set once the server has stored the booking — enables "Pay online" and the account hint.
  const [saved, setSaved] = useState<{ id: string; amount: number | null; signedIn: boolean } | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  // The index survives closing, so the photo stays on screen while the Dialog animates out.
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const swipeX = useRef<number | null>(null);

  // Scroll-linked parallax — hero copy lifts and fades as the footage recedes
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroContentY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const heroContentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);


  // Multi-tier pricing (skiing course sells Basic/Premium × without/with stay)
  const tiers = course.tiers ?? [];
  const [tierId, setTierId] = useState(tiers[0]?.id ?? "");
  const [stay, setStay] = useState<"base" | "full">("base");
  const selectedTier = tiers.find((t) => t.id === tierId) ?? tiers[0];
  const total = selectedTier ? (stay === "full" ? selectedTier.priceFull : selectedTier.priceBase) : course.price;
  const packages = tiers.flatMap((t) => (["base", "full"] as const).map((s) => ({ tier: t, stay: s })));

  const typeTone = TYPE_TONES[course.type] ?? "sky";
  const images = course.gallery || [course.image];
  // Hero slideshow: the cover first, then the gallery photos (videos are left to the gallery tab).
  const heroSlides = [...new Set([course.image, ...images].filter((src) => !/\.(mp4|mov|webm)$/i.test(src)))].map((src) => ({ src }));

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // Switch tab and center it in the strip. Panel scrolling happens in a
  // useEffect once the newly shown panel has rendered.
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
      document.getElementById("course-tabpanels")?.scrollIntoView({ behavior: "auto", block: "start" });
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

  // Lightbox paging: arrow keys and horizontal swipes. Escape, focus trap and scroll lock come from the Dialog.
  const stepLightbox = (dir: 1 | -1) =>
    setLightbox((i) => (i === null ? i : (i + dir + images.length) % images.length));

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setLightbox((i) => (i === null ? i : (i + 1) % images.length));
      else if (e.key === "ArrowLeft") setLightbox((i) => (i === null ? i : (i - 1 + images.length) % images.length));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightboxOpen, images.length]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookError("");
    setBookUnavailable(false);
    const invalid: Record<string, string> = {};
    if (!bookingForm.name.trim()) invalid.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingForm.email.trim())) invalid.email = "Enter a valid email address.";
    if (!isValidPhone(bookingForm.phone)) invalid.phone = "Enter a valid phone number (10 digits, or with +country code).";
    if (!bookingForm.date) invalid.date = "Pick a date in the future.";
    else if (bookingForm.date < localToday()) invalid.date = "Pick a date in the future.";
    setBookErrors(invalid);
    if (Object.keys(invalid).length > 0) {
      document.getElementById(`cb-${Object.keys(invalid)[0]}`)?.focus();
      return;
    }
    setSubmitting(true);
    try {
      // Attach the login (if any) so the booking lands in the user's account.
      const supabase = createClient();
      const token = supabase ? (await supabase.auth.getSession()).data.session?.access_token : undefined;
      // The server prices the package and stores the booking (specs/001-persistent-backend, FR-011/016).
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify({
          type: "course",
          slug: course.slug,
          tierId: selectedTier?.id,
          stay: selectedTier ? stay : undefined,
          date: bookingForm.date,
          groupSize: Number(bookingForm.groupSize),
          contact: {
            name: bookingForm.name.trim(),
            email: bookingForm.email.trim(),
            phone: bookingForm.phone.trim(),
          },
          message: bookingForm.message.trim(),
        }),
      });
      const result = await response.json().catch(() => null);
      // Not found, a server error (5xx) or a non-JSON reply means the booking service isn't reachable: nothing was saved
      // and retrying can't help, so show the WhatsApp fallback (FR-061). Other errors carry a message
      // the visitor can act on (bad date, group size, ...).
      if (response.status === 404 || response.status >= 500 || result === null) {
        setBookUnavailable(true);
        return;
      }
      if (!response.ok) throw new Error(result?.error || "We couldn't send your booking request. Please try again.");
      setSaved(result?.bookingId ? { id: result.bookingId, amount: result.amount ?? null, signedIn: Boolean(token) } : null);
      setSent(true);
    } catch (err) {
      // fetch() itself failed (offline, blocked): same as unreachable.
      if (err instanceof TypeError) setBookUnavailable(true);
      else setBookError(err instanceof Error ? err.message : "We couldn't send your booking request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Never lose the lead: the same details, pre-filled for WhatsApp.
  const fallbackDetails = [
    `Hi! I'd like to book the ${course.name} (${course.type}) in Auli.`,
    bookingForm.date && `Preferred date: ${bookingForm.date}`,
    `Group size: ${bookingForm.groupSize}`,
    selectedTier && `Package: ${selectedTier.name} (${STAY_LABELS[stay]}) — Rs.${total.toLocaleString("en-IN")}`,
    bookingForm.name.trim() && `Name: ${bookingForm.name.trim()}`,
    bookingForm.phone.trim() && `Phone: ${bookingForm.phone.trim()}`,
    bookingForm.email.trim() && `Email: ${bookingForm.email.trim()}`,
    bookingForm.message.trim() && `Message: ${bookingForm.message.trim()}`,
  ].filter((line): line is string => Boolean(line));

  const waLink = `${WA_BASE}${encodeURIComponent(
    `Hi! I'm interested in the ${course.name} (${course.type}) in Auli.`
  )}`;

  return (
    <div className="min-h-screen">
      {/* Cinematic video template behind every course sub-page — real course footage when available */}
      <CourseVideoBackdrop video={course.video ?? TYPE_VIDEOS[course.type] ?? TYPE_VIDEOS.Skiing} poster={course.image} />

      {/* Hero: a photo slideshow of this course (like the trek pages), text left aligned on top. */}
      <section ref={heroRef} className="relative z-10">
      <WallpaperCarousel
        slides={heroSlides}
        label={`Photos from the ${course.name}`}
        className="min-h-[82vh]"
        scrimClassName="bg-gradient-to-t from-black/80 via-black/35 to-black/45"
      >
      <div className="flex min-h-[82vh] items-end">
        <motion.div
          style={shouldReduceMotion ? undefined : { y: heroContentY, opacity: heroContentOpacity }}
          className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 sm:pb-28 pt-32"
        >
          <Link href="/courses" className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-xl text-white/80 transition-colors duration-150 ease-out hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            All Courses
          </Link>
          {/* No entrance animation: the hero copy is the first paint (motion contract rule 5). */}
          <div className="grid items-end gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-8">
              <p className="mb-4 text-sm text-white/80">Auli Snow Sports Academy · The Experience</p>
              <h1 className="font-heading text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.025em] text-white sm:text-6xl lg:text-7xl [text-shadow:0_2px_30px_rgba(2,6,23,0.6)]">
                {course.name}
              </h1>
              <p className="mt-6 max-w-2xl text-base sm:text-lg text-white/85 line-clamp-3 [text-shadow:0_1px_12px_rgba(2,6,23,0.7)]">
                {course.shortDescription}
              </p>
            </div>
            <div className="lg:col-span-4 lg:text-right">
              <p className="font-heading text-5xl font-semibold leading-none tracking-[-0.03em] text-white sm:text-6xl [text-shadow:0_2px_30px_rgba(2,6,23,0.6)]">
                {course.duration}
              </p>
              <p className="mt-2 text-sm text-white/75">{course.dates}</p>
            </div>
          </div>
          <p className="mt-8 border-t border-white/20 pt-4 text-sm text-white/80">
            {[course.location, course.level, "Certified"].map((label, i) => (
              <span key={label}>
                {i > 0 && <span aria-hidden className="mx-2 text-white/40">·</span>}
                {label}
              </span>
            ))}
          </p>
          <a href="#course-content" className="sr-only focus:not-sr-only focus:mt-4 focus:inline-block focus:text-white">Scroll</a>
        </motion.div>
      </div>
      </WallpaperCarousel>
      </section>

      {/* Tabs + Content — glass card floating over the footage */}
      <section id="course-content" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 -mt-6">
        <div className="rounded-2xl bg-white/95 p-4 shadow-2xl shadow-slate-950/40 ring-1 ring-white/40 backdrop-blur-xl sm:p-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content (min-w-0 lets the column shrink beside the sidebar instead of widening the page at 1024px) */}
          <div className="min-w-0 flex-1">
            {/* Tab Navigation */}
            <div className="sticky top-16 z-30 mb-8 border-b border-slate-200 bg-white/90 backdrop-blur-md">
              <div role="tablist" aria-label="Course details" className="flex gap-1 overflow-x-auto py-1">
                {TAB_LIST.map((t, i) => (
                  <button
                    key={t.key}
                    ref={(el) => { tabRefs.current[i] = el; }}
                    role="tab"
                    id={`course-tab-${i}`}
                    aria-selected={tab === t.key}
                    aria-controls={`course-tabpanel-${i}`}
                    tabIndex={tab === t.key ? 0 : -1}
                    onClick={() => goToTab(t.key)}
                    onKeyDown={(e) => onTabKeyDown(e, i)}
                    className={cn(
                      "relative min-h-11 whitespace-nowrap rounded-full px-4 text-xs font-medium transition-colors duration-150 ease-out sm:px-6 sm:text-sm",
                      tab === t.key ? "text-sky-700" : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    {tab === t.key &&
                      (shouldReduceMotion ? (
                        <span className="absolute inset-0 rounded-full bg-sky-50 ring-1 ring-sky-200" />
                      ) : (
                        <motion.span
                          layoutId="course-tab-pill"
                          transition={transition("base")}
                          className="absolute inset-0 rounded-full bg-sky-50 ring-1 ring-sky-200"
                        />
                      ))}
                    <span className="relative">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content: every panel is in the static HTML so search engines can read the
                itinerary and inclusions; inactive panels are `hidden`. */}
            <div id="course-tabpanels" className="scroll-mt-36">
            {TAB_LIST.map((panel, panelIndex) => (
            <CourseTabPanel key={panel.key} index={panelIndex} active={tab === panel.key} reduceMotion={!!shouldReduceMotion}>
              {panel.key === "overview" && (
                <div>
                  <div>
                    <h2 className={cn(PANEL_H2, "mb-4")}>About This Course</h2>
                    <p className="mb-8 text-base leading-relaxed text-slate-600">{course.description}</p>
                  </div>

                  {packages.length > 0 && (
                    <div className="mb-10">
                      <h3 className={cn(PANEL_H3, "mb-1")}>Choose Your Package</h3>
                      <p className="mb-4 text-sm text-slate-500">Two itineraries, each with or without stay &amp; meals — pick one and it carries through to booking.</p>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {packages.map(({ tier, stay: s }) => {
                          const active = tier.id === tierId && s === stay;
                          const price = s === "full" ? tier.priceFull : tier.priceBase;
                          return (
                            <button key={`${tier.id}-${s}`} type="button"
                              onClick={() => { setTierId(tier.id); setStay(s); }}
                              aria-pressed={active}
                              className={cn(
                                "relative flex flex-col rounded-2xl border p-5 text-left transition-[border-color,box-shadow,background-color] duration-150 ease-out sm:p-6",
                                active ? "border-sky-500 bg-sky-50 shadow-lg shadow-sky-100 ring-2 ring-sky-200" : "border-slate-200 bg-white hover:border-sky-300 hover:shadow-md"
                              )}>
                              {active && (
                                <span className="absolute top-4 right-4 flex h-5 w-5 items-center justify-center rounded-full bg-sky-500">
                                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                                </span>
                              )}
                              <Badge tone={tier.id === "premium" ? "amber" : "sky"} className="self-start text-[11px] font-bold uppercase tracking-wide">{tier.name}</Badge>
                              <span className="mt-2 font-heading text-2xl font-bold text-slate-900"><Price inr={price} /></span>
                              <span className="text-xs text-slate-500">per person · {STAY_LABELS[s]}</span>
                              <ul className="mt-3 w-full space-y-1.5 border-t border-slate-100 pt-3">
                                {pkgBullets(tier, s).map((b) => (
                                  <li key={b} className="flex items-start gap-2 text-xs leading-snug text-slate-600">
                                    <svg className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                                    {b}
                                  </li>
                                ))}
                              </ul>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {(course.levelRequirement || course.instructorRatio || course.weeklyHours) && (
                    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                      {[
                        { label: "Level Requirement", value: course.levelRequirement },
                        { label: "Group Size", value: course.instructorRatio },
                        { label: "Training Hours", value: course.weeklyHours },
                      ]
                        .filter((f) => f.value)
                        .map((f) => (
                          <div key={f.label} className="rounded-2xl bg-gradient-to-br from-sky-50 to-sky-50/40 p-4 ring-1 ring-sky-100">
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-sky-700">{f.label}</p>
                            <p className="text-sm text-slate-700">{f.value}</p>
                          </div>
                        ))}
                    </div>
                  )}

                  {course.highlights && (
                    <div className="mb-8">
                      <h3 className={cn(PANEL_H3, "mb-4")}>Course Highlights</h3>
                      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {course.highlights.map((h) => (
                          <li key={h} className="flex items-start gap-2 px-2 py-1 text-sm text-slate-600">
                            <svg className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h3 className={cn(PANEL_H3, "mb-4")}>Available Dates</h3>
                    <div className="mb-8 rounded-2xl bg-gradient-to-br from-sky-50 to-sky-50/40 p-5 ring-1 ring-sky-100 sm:p-6">
                      <p className="font-semibold text-sky-800">{course.dates}</p>
                      <p className="mt-1 text-sm text-sky-700">{course.duration} intensive course</p>
                    </div>
                  </div>

                  <div>
                    <h3 className={cn(PANEL_H3, "mb-4")}>What Guests Say</h3>
                    <div className="space-y-4">
                      {course.testimonials.map((t, i) => (
                        <figure key={i} className="relative rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-sky-400 font-heading text-sm font-bold text-white shadow-md shadow-sky-200">
                            {t.name.charAt(0)}
                          </div>
                          <blockquote className="mb-3 mt-3 text-base italic leading-relaxed text-slate-600">&ldquo;{t.text}&rdquo;</blockquote>
                          <figcaption className="text-sm font-medium text-slate-900">{t.name} — {t.location}
                            <span className="ml-2 inline-flex items-center gap-0.5 align-middle text-amber-500" aria-label={`${t.rating} out of 5 stars`}>
                              {Array.from({ length: t.rating }).map((_, s) => (
                                <svg key={s} className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.445a1 1 0 00-.363 1.118l1.286 3.958c.3.921-.755 1.688-1.539 1.118l-3.367-2.445a1 1 0 00-1.176 0l-3.367 2.445c-.783.57-1.838-.197-1.539-1.118l1.286-3.958a1 1 0 00-.363-1.118L2.924 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.958z"/></svg>
                              ))}
                            </span>
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {panel.key === "dates" && (
                <AvailabilityView batches={getCourseBatches(course, selectedTier?.priceBase)} onBook={registerForBatch} />
              )}

              {panel.key === "itinerary" && (
                <div>
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <h2 className={PANEL_H2}>{course.duration} Itinerary</h2>
                    {tiers.length > 0 && (
                      <div role="tablist" aria-label="Itinerary tier" className="flex gap-1 rounded-full bg-slate-100 p-1">
                        {tiers.map((t) => (
                          <button key={t.id} type="button" onClick={() => setTierId(t.id)} aria-pressed={selectedTier?.id === t.id}
                            className={cn(
                              "relative min-h-11 rounded-full px-4 text-sm font-semibold transition-colors duration-150 ease-out",
                              selectedTier?.id === t.id ? "text-sky-700" : "text-slate-500 hover:text-slate-800"
                            )}>
                            {selectedTier?.id === t.id &&
                              (shouldReduceMotion ? (
                                <span className="absolute inset-0 rounded-full bg-white shadow-sm" />
                              ) : (
                                <motion.span layoutId="tier-pill" transition={transition("base")}
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
                      <p className="mb-2 text-slate-600">{selectedTier.blurb}</p>
                      <p className="mb-6 text-sm text-slate-500">
                        <Price inr={selectedTier.priceBase} /> without stay &amp; meals · <Price inr={selectedTier.priceFull} /> with lodging &amp; all meals. Certificate and graduation ceremony included in both.
                      </p>
                      <div className="space-y-2">
                        {selectedTier.itinerary.map((day, i) => (
                          <div key={day.day} className="relative flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-sky-400 font-bold text-white shadow-md shadow-sky-200 ring-4 ring-sky-50">
                                {day.day}
                              </div>
                              {i < selectedTier.itinerary.length - 1 && <div className="w-px flex-1 bg-gradient-to-b from-sky-200 to-transparent" />}
                            </div>
                            <div className="flex-1 pb-8">
                              <h3 className="mb-1 text-lg font-semibold text-slate-900">Day {day.day} · {day.title}</h3>
                              <p className="text-sm text-slate-600">{day.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="mb-8 text-slate-600">A structured progression from first turns to certified confidence.</p>
                      <div className="space-y-2">
                        {course.itinerary.map((day, i) => (
                          <div key={day.day} className="relative flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-sky-400 font-bold text-white shadow-md shadow-sky-200 ring-4 ring-sky-50">
                                {day.day}
                              </div>
                              {i < course.itinerary.length - 1 && <div className="w-px flex-1 bg-gradient-to-b from-sky-200 to-transparent" />}
                            </div>
                            <div className="flex-1 pb-8">
                              <h3 className="mb-1 text-lg font-semibold text-slate-900">{day.title}</h3>
                              <p className="text-sm text-slate-600">{day.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {panel.key === "gallery" && (
                <div>
                  <div>
                    <h2 className={cn(PANEL_H2, "mb-2")}>Photo Gallery</h2>
                    <p className="mb-8 text-slate-600">Moments from our skiing and snowboarding courses in Auli.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {images.map((img, i) => {
                      const isVideo = /\.(mp4|mov)$/i.test(img);
                      return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => { setLightbox(i); setLightboxOpen(true); }}
                        aria-label={`View ${isVideo ? "video" : "photo"} ${i + 1} of ${images.length}`}
                        className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-2xl ring-1 ring-slate-900/5"
                      >
                        {isVideo ? (
                          /* ponytail: no <video> here (preload="none" still stalls on 40MB .movs) —
                             exact-size skeleton + play badge; the file loads only in the lightbox */
                          <>
                            <Skeleton className="absolute inset-0 rounded-none" />
                            <span className="absolute inset-0 flex items-center justify-center">
                              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/45 transition-transform duration-150 ease-out group-hover:scale-110 motion-reduce:transition-none">
                                <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M8 5v14l11-7z" /></svg>
                              </span>
                            </span>
                          </>
                        ) : (
                          <SmartImage
                            src={img}
                            alt={`${course.name} — photo ${i + 1}`}
                            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                          />
                        )}
                        {!isVideo && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100">
                            <svg className="h-8 w-8 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 7.5v6m3-3h-6M21 21l-5.2-5.2" />
                            </svg>
                          </div>
                        )}
                      </button>
                      );
                    })}
                  </div>

                  {/* Lightbox: kit Dialog (focus trap, Escape, scroll lock, focus return); it portals
                      to <body> and mounts only when opened, so nothing of it is in the static HTML. */}
                  <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
                    <DialogContent size="full" tone="dark" title={`${course.name} gallery`} hideTitle hideClose>
                      {lightbox !== null && (
                        <div
                          className="relative flex min-h-0 flex-1 items-center justify-center p-4"
                          onClick={() => setLightboxOpen(false)}
                          onTouchStart={(e) => { swipeX.current = e.touches[0].clientX; }}
                          onTouchEnd={(e) => {
                            const start = swipeX.current;
                            swipeX.current = null;
                            if (start === null) return;
                            const dx = e.changedTouches[0].clientX - start;
                            if (Math.abs(dx) > 50) stepLightbox(dx < 0 ? 1 : -1);
                          }}
                        >
                          <DialogClose
                            className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-xl text-white/80 transition-colors duration-150 ease-out hover:bg-white/10 hover:text-white"
                            aria-label="Close lightbox"
                          >
                            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </DialogClose>

                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); stepLightbox(-1); }}
                            className="absolute left-2 z-10 flex h-12 w-12 items-center justify-center rounded-xl text-white/80 transition-colors duration-150 ease-out hover:bg-white/10 hover:text-white sm:left-4"
                            aria-label="Previous photo"
                          >
                            <svg className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>

                          <motion.div
                            key={lightbox}
                            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={transition("base")}
                            className="relative max-h-[80vh] max-w-4xl"
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
                                className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl"
                              />
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={images[lightbox]}
                                alt={`${course.name} — photo ${lightbox + 1}`}
                                className="max-h-[80vh] max-w-full rounded-2xl object-contain"
                              />
                            )}
                          </motion.div>

                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); stepLightbox(1); }}
                            className="absolute right-2 z-10 flex h-12 w-12 items-center justify-center rounded-xl text-white/80 transition-colors duration-150 ease-out hover:bg-white/10 hover:text-white sm:right-4"
                            aria-label="Next photo"
                          >
                            <svg className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </button>

                          <div className="absolute bottom-4 text-sm text-white/80">
                            {lightbox + 1} / {images.length}
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {panel.key === "included" && (
                <div>
                  <div>
                    <h2 className={cn(PANEL_H2, "mb-2")}>What&apos;s Included</h2>
                    <p className="mb-8 text-slate-600">Everything you need for a seamless mountain experience.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {course.inclusions.map((item, i) => (
                      <div key={i} className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-100 to-sky-50 ring-1 ring-sky-100">
                          <svg className="h-5 w-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={INC_ICONS[item.icon] || INC_ICONS.structor} />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{item.label}</h3>
                          <p className="text-sm text-slate-600">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {panel.key === "book" && (
                <div>
                  <h2 className={cn(PANEL_H2, "mb-6")}>Book This Course</h2>
                  {sent ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center sm:p-8">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                        <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <h3 className="mb-2 text-xl font-bold text-slate-900">Request Received!</h3>
                      <p className="mb-4 text-slate-600">We&apos;ll confirm availability for your dates shortly.</p>
                      {isSupabaseConfigured && saved?.amount ? (
                        saved.signedIn ? (
                          <Link
                            href={`/checkout?course=${saved.id}`}
                            className={cn(buttonVariants({ size: "lg" }), "mb-4")}
                          >
                            Pay online with UPI
                          </Link>
                        ) : (
                          <p className="mb-4 text-sm text-slate-600">
                            Want to pay online and track this booking?{" "}
                            <Link href="/signup" className="font-semibold text-emerald-700 hover:underline">Create an account</Link>
                            {" "}or{" "}
                            <Link href="/login" className="font-semibold text-emerald-700 hover:underline">log in</Link>
                            {" "}with <strong>{bookingForm.email}</strong>.
                          </p>
                        )
                      ) : null}
                      <div>
                        <Button variant="link" onClick={() => { setSent(false); setSaved(null); }} className="min-h-11 text-base font-medium">
                          Book another course
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {selectedTier && tiers.length > 0 && (
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-sky-50 p-4 ring-1 ring-sky-100">
                          <div>
                            <p className="text-sm font-bold text-slate-900">{selectedTier.name} · {STAY_LABELS[stay]}</p>
                            <p className="text-xs text-slate-500">Picked from the package cards on the Overview tab.</p>
                          </div>
                          <div className="text-right">
                            <p className="font-heading text-xl font-bold text-slate-900"><Price inr={total} /></p>
                            <PriceNote inr={total} className="mt-1 max-w-[16rem] text-slate-500" />
                            <Button variant="link" onClick={() => goToTab("overview")} className="min-h-11 text-xs">
                              Change package
                            </Button>
                          </div>
                        </div>
                      )}
                      <form onSubmit={handleBook} noValidate className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="cb-name">Full Name</Label>
                          <Input
                            id="cb-name"
                            type="text"
                            required
                            autoComplete="name"
                            value={bookingForm.name}
                            onChange={(e) => { setBookingForm({ ...bookingForm, name: e.target.value }); clearBookError("name"); }}
                            aria-invalid={!!bookErrors.name}
                            aria-describedby={bookErrors.name ? "cb-name-err" : undefined}
                          />
                          {bookErrors.name && <p id="cb-name-err" className="mt-1 text-xs text-red-600">{bookErrors.name}</p>}
                        </div>
                        <div>
                          <Label htmlFor="cb-email">Email</Label>
                          <Input
                            id="cb-email"
                            type="email"
                            required
                            autoComplete="email"
                            value={bookingForm.email}
                            onChange={(e) => { setBookingForm({ ...bookingForm, email: e.target.value }); clearBookError("email"); }}
                            aria-invalid={!!bookErrors.email}
                            aria-describedby={bookErrors.email ? "cb-email-err" : undefined}
                          />
                          {bookErrors.email && <p id="cb-email-err" className="mt-1 text-xs text-red-600">{bookErrors.email}</p>}
                        </div>
                        <div>
                          <Label htmlFor="cb-phone">Phone</Label>
                          <Input
                            id="cb-phone"
                            type="tel"
                            required
                            inputMode="tel"
                            autoComplete="tel"
                            value={bookingForm.phone}
                            onChange={(e) => { setBookingForm({ ...bookingForm, phone: e.target.value }); clearBookError("phone"); }}
                            aria-invalid={!!bookErrors.phone}
                            aria-describedby={bookErrors.phone ? "cb-phone-err" : undefined}
                          />
                          {bookErrors.phone && <p id="cb-phone-err" className="mt-1 text-xs text-red-600">{bookErrors.phone}</p>}
                        </div>
                        <div>
                          <Label htmlFor="cb-date">Preferred Date</Label>
                          <Input
                            id="cb-date"
                            type="date"
                            required
                            min={today || undefined}
                            value={bookingForm.date}
                            onChange={(e) => { setBookingForm({ ...bookingForm, date: e.target.value }); clearBookError("date"); }}
                            aria-invalid={!!bookErrors.date}
                            aria-describedby={bookErrors.date ? "cb-date-err" : undefined}
                          />
                          {bookErrors.date && <p id="cb-date-err" className="mt-1 text-xs text-red-600">{bookErrors.date}</p>}
                        </div>
                        <div>
                          <Label htmlFor="cb-group">Group Size</Label>
                          <Select
                            id="cb-group"
                            value={bookingForm.groupSize}
                            onChange={(e) => setBookingForm({ ...bookingForm, groupSize: e.target.value })}
                          >
                            {[1, 2, 3, 4, 5, 6].map((n) => (
                              <option key={n} value={n}>{n} {n === 1 ? "person" : "people"}</option>
                            ))}
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="cb-msg">Message (optional)</Label>
                        <Textarea
                          id="cb-msg"
                          rows={3}
                          value={bookingForm.message}
                          onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })}
                          placeholder="Any special requirements or questions..."
                        />
                      </div>
                      {bookUnavailable && (
                        <WhatsAppFallback message="We couldn't save your request online right now." details={fallbackDetails} />
                      )}
                      {bookError && (
                        <div role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
                          <p>{bookError}</p>
                        </div>
                      )}
                      <Button type="submit" size="lg" loading={submitting} className="w-full px-8 sm:w-auto">
                        {submitting ? "Submitting..." : "Submit Booking"}
                      </Button>
                      </form>
                    </>
                  )}
                </div>
              )}
            </CourseTabPanel>
            ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="sticky top-24 rounded-2xl bg-white/95 p-5 shadow-xl shadow-slate-900/10 ring-1 ring-slate-100 backdrop-blur-xl sm:p-6">
              <div className="mb-4">
                <Badge tone={typeTone} className="px-3 py-1">
                  {course.type}
                </Badge>
              </div>
              <div className="mb-4">
                {tiers.length > 0 ? (
                  <>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">From</span>
                    <span className="text-3xl font-bold text-slate-900"><Price inr={Math.min(...tiers.map((t) => t.priceBase))} /></span>
                    <span className="ml-1 text-slate-500">/ person</span>
                    <table className="mt-3 w-full text-left text-xs">
                      <thead>
                        <tr className="text-slate-500">
                          <th className="py-1 font-medium" scope="col"><span className="sr-only">Tier</span></th>
                          <th className="py-1 text-right font-medium" scope="col">No stay</th>
                          <th className="py-1 text-right font-medium" scope="col">With stay</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tiers.map((t) => (
                          <tr key={t.id} className={cn("border-t border-slate-100", selectedTier?.id === t.id && "font-semibold text-sky-700")}>
                            <td className="py-1.5">{t.name}</td>
                            <td className="py-1.5 text-right"><Price inr={t.priceBase} /></td>
                            <td className="py-1.5 text-right"><Price inr={t.priceFull} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-slate-900"><Price inr={course.price} /></span>
                    <span className="ml-1 text-slate-500">/ person</span>
                  </>
                )}
              </div>
              <p className="mb-6 text-sm text-slate-500">{course.duration} · {course.dates}</p>

              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ size: "lg" }), "mb-3 w-full")}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Book on WhatsApp
              </a>
              <Button
                variant="outline"
                size="lg"
                onClick={() => goToTab("book")}
                className="w-full border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50"
              >
                Book Online
              </Button>

              <div className="mt-6 space-y-2.5 border-t border-slate-100 pt-6 text-sm text-slate-600">
                {[
                  { d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", label: "Certified instruction" },
                  { d: INC_ICONS.equipment, label: "All equipment included" },
                  { d: INC_ICONS.bed, label: "Accommodation & meals" },
                  { d: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5", label: "Free cancellation" },
                ].map((b) => (
                  <div key={b.label} className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
                    <svg className="h-4 w-4 text-sky-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={b.d} /></svg>
                    {b.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Fixed mobile booking band — price + CTA always reachable on phones */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex-shrink-0">
            <div className="text-[11px] leading-none text-slate-500">From</div>
            <div className="text-lg font-bold leading-tight text-slate-900">
              <Price inr={Math.min(...tiers.map((t) => t.priceBase), course.price)} />
            </div>
          </div>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline" }), "flex-shrink-0 border-2 border-emerald-600 px-4 text-emerald-700 hover:bg-emerald-50")}
          >
            WhatsApp
          </a>
          <Button onClick={() => goToTab("book")} className="flex-1 px-4 font-bold">
            Book Now →
          </Button>
        </div>
      </div>
    </div>
  );
}
