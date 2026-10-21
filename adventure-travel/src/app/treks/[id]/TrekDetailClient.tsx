"use client";

import { useState, useEffect, useMemo, useRef, type ReactNode } from "react";
import { motion, AnimatePresence, useAnimate, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { priceRoute, type Trek } from "@/data/treks";
import ContactPopup from "@/components/ContactPopup";
import TermsConditions from "@/components/TermsConditions";
import { QuickInfoModal, type QuickInfoId } from "@/components/QuickInfoModal";
import SmartImage from "@/components/SmartImage";
import LazyVideo from "@/components/LazyVideo";
import { useAuth } from "@/contexts/AuthContext";
import { BackendUnavailableError, createTrekBooking } from "@/lib/auth";
import WhatsAppFallback from "@/components/WhatsAppFallback";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  Backpack,
  BadgeCheck,
  BedDouble,
  CalendarDays,
  Car,
  ChevronRight,
  ClipboardList,
  FileCheck2,
  Flower2,
  Footprints,
  Gauge,
  GraduationCap,
  HeartPulse,
  Info,
  Leaf,
  Lock,
  Luggage,
  MapPin,
  Mountain,
  Phone,
  ShieldCheck,
  Snowflake,
  Sprout,
  Star,
  Sun,
  Tent,
  Timer,
  UserCheck,
  Users,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { useDepartures, type DeparturesState } from "./useDepartures";
import {
  batchLabel, datesBadge, groupByMonth, isBookable, seasonStrip, seatLabel, seatStatus,
  type Departure, type SeatStatus,
} from "@/lib/departures";
import { MONTHS } from "@/lib/season";
import { MONTH_HIGHLIGHTS } from "@/data/trekSeasons";
import { getTrekPackage } from "@/data/trekPackage";
import ScholarshipsTab from "./ScholarshipsTab";
import { printItinerary } from "./printItinerary";
import NoPhoto from "@/components/NoPhoto";
import WallpaperCarousel, { type WallpaperSlide } from "@/components/WallpaperCarousel";
import ScrollProgressRing from "@/components/ScrollProgressRing";
import Price, { PriceNote } from "@/components/Price";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input as TextInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DURATION, EASE, transition } from "@/lib/motion";
// The site's one difficulty palette (also used by QuickInfoModal and the trek cards).
import { DIFFICULTY_COLORS } from "@/data/treks";

const SEAT_STYLE: Record<SeatStatus, { dot: string; text: string; legend: string }> = {
  available: { dot: "bg-emerald-600", text: "text-emerald-700", legend: "Available" },
  few: { dot: "bg-amber-500", text: "text-amber-700", legend: "Few seats left" },
  full: { dot: "bg-slate-400", text: "text-slate-500", legend: "Full (join the waitlist)" },
  closed: { dot: "bg-slate-300", text: "text-slate-400", legend: "Closed" },
};

const FULL_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WHATSAPP = "https://wa.me/917817912062";

const TABS = ["Overview", "Dates", "Itinerary", "T&C", "Scholarships", "Photo Gallery", "What's Included", "Packing List", "Make Reservation"] as const;
type Tab = (typeof TABS)[number];

const GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
  "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=600&q=80",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80",
  "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=600&q=80",
  "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&q=80",
  "https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=600&q=80",
  "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=600&q=80",
];

const TREK_GALLERIES: Record<string, string[]> = {
  "valley-of-flowers": [
    "/assets/valley-of-flowers/IMG_5934.JPG.jpeg",
    "/assets/valley-of-flowers/IMG_1532.JPG.jpeg",
    "/assets/valley-of-flowers/IMG_4735.JPG.jpeg",
    "/assets/valley-of-flowers/IMG_6644.JPG.jpeg",
    "/assets/valley-of-flowers/IMG_6639.JPG.jpeg",
    "/assets/valley-of-flowers/IMG_6626.JPG.jpeg",
    "/assets/valley-of-flowers/IMG_6080.JPG.jpeg",
    "/assets/valley-of-flowers/IMG_6061.JPG.jpeg",
  ],
  "satopanth-lake": [
    "/assets/satopanth-lake/IMG_4732.JPG.jpeg",
    "/assets/satopanth-lake/IMG_4733.JPG.jpeg",
    "/assets/satopanth-lake/IMG_4746.JPG.jpeg",
    "/assets/satopanth-lake/IMG_4748.JPG.jpeg",
    "/assets/satopanth-lake/IMG_4752.JPG.jpeg",
    "/assets/satopanth-lake/IMG_5914.JPG.jpeg",
    "/assets/satopanth-lake/IMG_5925.JPG.jpeg",
    "/assets/satopanth-lake/IMG_5931.JPG.jpeg",
  ],
  "hampta-pass": [
    "/assets/hampta-pass/IMG_7578.jpeg",
    "/assets/hampta-pass/IMG_7579.jpeg",
    "/assets/hampta-pass/IMG_7580.jpeg",
    "/assets/hampta-pass/IMG_7581.jpeg",
  ],
  kedarkantha: [
    "/assets/kedarkantha-trek/IMG_1267.JPG.jpeg",
    "/assets/kedarkantha-trek/IMG_1268.JPG.jpeg",
    "/assets/kedarkantha-trek/IMG_1269.JPG.jpeg",
    "/assets/kedarkantha-trek/IMG_1270.JPG.jpeg",
    "/assets/kedarkantha-trek/IMG_4137.JPG.jpeg",
    "/assets/kedarkantha-trek/IMG_4139.JPG.jpeg",
    "/assets/kedarkantha-trek/IMG_4141.JPG.jpeg",
    "/assets/kedarkantha-trek/IMG_4142.JPG.jpeg",
    "/assets/kedarkantha-trek/IMG_4143.JPG.jpeg",
    "/assets/kedarkantha-trek/IMG_4144.JPG.jpeg",
  ],
  "har-ki-dun": [
    "/assets/har-ki-dun/0438a440-d8ea-4b76-bdae-881663d56e4d.jpeg",
    "/assets/har-ki-dun/06287674-b8df-4057-80dc-eab46b75802d.jpeg",
    "/assets/har-ki-dun/106d5aac-9f53-4495-99c1-cb9b16a5dd01.jpeg",
    "/assets/har-ki-dun/411ba4ff-e5d5-4217-8964-77ff3584205e.jpeg",
    "/assets/har-ki-dun/5027dc2f-ce24-4537-b8d1-d401001a84c3.jpeg",
    "/assets/har-ki-dun/5027dc2f-ce24-4537-b8d1-d401001a84c3_1.jpeg",
    "/assets/har-ki-dun/7132cc37-803f-479f-8cdb-fc595552b3ed.jpeg",
    "/assets/har-ki-dun/e9a6b4b0-145b-4ce1-ba6c-7cd151231700.jpeg",
  ],
  "dronagiri-base-camp": [
    "/assets/dronagiri/3a7fecb4-cee0-4007-939b-817762df7e3f.jpeg",
    "/assets/dronagiri/56317364-2f86-46e4-8b57-3c989e2b39b5.jpeg",
    "/assets/dronagiri/7155162a-d858-4534-901f-e67b9acfe491.jpeg",
    "/assets/dronagiri/85943898-e5e5-4bb4-93b0-84cd940cd6b6.jpeg",
    "/assets/dronagiri/c3de05f4-7486-4ad7-bd72-ee923d6f6831.jpeg",
    "/assets/dronagiri/220a92d7-c372-466f-b568-682143c3f75a.mov",
    "/assets/dronagiri/390992d1-bb16-456c-9696-2b7076d7e510 (1).mov",
    "/assets/dronagiri/da4bf970-c056-493f-9a0f-1f4a83a7227a.mov",
    "/assets/dronagiri/da933a63-a715-4cf8-a753-0b4bab45c6a7.mov",
    "/assets/dronagiri/fb97608f-889a-4473-a9c3-4206fddec5c4.mov",
  ],
  "pangarchula-peak": [
    "/assets/pangarchula-peak-trek/IMG_3734.jpeg",
    "/assets/pangarchula-peak-trek/IMG_3735.jpeg",
    "/assets/pangarchula-peak-trek/IMG_3737.jpeg",
    "/assets/pangarchula-peak-trek/IMG_3741.jpeg",
    "/assets/pangarchula-peak-trek/IMG_3746.jpeg",
    "/assets/pangarchula-peak-trek/IMG_3747.jpeg",
    "/assets/pangarchula-peak-trek/IMG_3751.jpeg",
    "/assets/pangarchula-peak-trek/af2701a5-b67d-4691-af78-627834f8c0a8.jpeg",
    "/assets/pangarchula-peak-trek/0834c6e9-e382-426a-894b-6d7af316cda5.mp4",
  ],
  "nandi-kund": [
    "/assets/nandi-kund-trek/2c72f839-1d03-4194-829a-0cb0e953eb8a.jpeg",
    "/assets/nandi-kund-trek/32abfdc3-ad09-48a0-b15b-6da2e0d3dffc.jpeg",
    "/assets/nandi-kund-trek/5ea3adc5-d375-4a7f-ab3a-17224fcd463c.jpeg",
    "/assets/nandi-kund-trek/65a896f6-83b2-41aa-9726-171f369a2b12.jpeg",
    "/assets/nandi-kund-trek/74d946e2-9a04-4881-b830-0579948647b8.jpeg",
    "/assets/nandi-kund-trek/b0e62e4f-a4ec-40ce-9808-2ee87c0bf2cd.jpeg",
    "/assets/nandi-kund-trek/d39028ef-4d93-4a91-b087-2f40237fc124.jpeg",
    "/assets/nandi-kund-trek/feb980a9-026c-4e20-8207-d16c640983d6.mov",
  ],
  "panpatia-col": [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=600&q=80",
    "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&q=80",
    "/assets/panpatia-col-trek/9ecb69c4-00c7-4116-a312-ad393182f10e.jpeg",
    "/assets/panpatia-col-trek/a8c14f1d-60a2-4e5a-b38b-17d5c74cfb9e.jpeg",
    "/assets/panpatia-col-trek/IMG_6013.jpeg",
    "/assets/panpatia-col-trek/IMG_6015.jpeg",
    "/assets/panpatia-col-trek/IMG_6059.jpeg",
    "/assets/panpatia-col-trek/IMG_6060.jpeg",
    "/assets/panpatia-col-trek/IMG_6079.jpeg",
    "/assets/panpatia-col-trek/Panpateya.mov",
  ],
  "kuari-pass": [
    "/assets/kuari-pass-trek/017bfe93-d6e9-4c29-841d-e55ba276be2b.jpeg",
    "/assets/kuari-pass-trek/1d41b58f-ea07-4213-b575-da947e8c33c0.jpeg",
    "/assets/kuari-pass-trek/340648ba-f46c-4dae-9ba6-d48a6a1d91f9.jpeg",
    "/assets/kuari-pass-trek/3a32bc72-b94d-46f5-a2b3-9a47fd31ffd1.jpeg",
    "/assets/kuari-pass-trek/43025720-b05f-48e4-91cd-9d6783d428b2.jpeg",
    "/assets/kuari-pass-trek/564c4289-af50-4c8b-be21-3e209be853cc.jpeg",
    "/assets/kuari-pass-trek/7d28235d-0d49-4998-9bc7-3304ad6c33e2.jpeg",
    "/assets/kuari-pass-trek/7ec049fb-c7cd-4864-8489-01856a209ae0.jpeg",
    "/assets/kuari-pass-trek/886a82c1-6760-4244-9124-ac856341552c.jpeg",
    "/assets/kuari-pass-trek/8a7f3f68-76f9-4945-98cc-8734fc98063c.jpeg",
    "/assets/kuari-pass-trek/9f773586-9c67-460f-bdd5-30d7737e3c80.jpeg",
    "/assets/kuari-pass-trek/f7d8168c-15e8-4766-946e-74358e954af2.jpeg",
    "/assets/kuari-pass-trek/f14f4fc5-7c11-4e21-abcf-e12bf021e6dc.mov",
  ],
  "bhrigu-lake": [
    "/assets/birgu-lake/22e5257b-854d-4722-9ad9-4f63715455e0.jpeg",
    "/assets/birgu-lake/5c300a48-3471-4dc2-90d0-dce291830158.jpeg",
    "/assets/birgu-lake/64bc3481-a48c-41b4-953e-b53aa486c316.jpeg",
    "/assets/birgu-lake/6964c690-5520-4da2-8cc3-dffff4846b4c.jpeg",
    "/assets/birgu-lake/787e70f8-b61c-4f19-a2a7-551cadf0dc80.jpeg",
    "/assets/birgu-lake/cb3e743b-1cdd-4977-aa99-3f494072cb9a.jpeg",
    "/assets/birgu-lake/d4044abb-3f2d-4334-a52a-4048f82b359c.jpeg",
    "/assets/birgu-lake/d9f3c584-2fd9-497d-9ee0-a9c30ee52888.jpeg",
    "/assets/birgu-lake/3551faed-4e8b-48a1-8d7c-3009f2af7229.mov",
    "/assets/birgu-lake/96aa6578-8641-4b71-88af-a4892d9060f7.mov",
    "/assets/birgu-lake/9b1e5436-c884-4453-b06b-3c29651bbbcc.mov",
    "/assets/birgu-lake/c45c1e10-d795-4622-9afe-9aa19b3b325c.mov",
  ],
};

/** The Photo Gallery tab's media: the trek's own photos and videos, or its cover plus stock shots when it has none. */
function galleryMedia(trek: Trek): string[] {
  return TREK_GALLERIES[trek.slug] || (trek.image ? [trek.image, ...GALLERY_IMAGES.slice(0, 7)] : []);
}

/** Hero wallpaper: the gallery's photos (no videos), cover first, stock shots fetched at full-screen width. */
function getHeroSlides(trek: Trek): WallpaperSlide[] {
  const photos = galleryMedia(trek).filter((src) => !/\.(mp4|mov)$/i.test(src));
  const ordered = trek.image ? [trek.image, ...photos.filter((src) => src !== trek.image)] : photos;
  return ordered.map((src) => ({ src: src.includes("images.unsplash.com") ? src.replace(/([?&])w=\d+/, "$1w=1920") : src }));
}

export default function TrekDetailClient({ trek }: { trek: Trek }) {
  const { user } = useAuth();
  const shouldReduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [showContact, setShowContact] = useState(false);
  const [wished, setWished] = useState(false);
  const [shareMsg, setShareMsg] = useState("");
  const [payBookingId, setPayBookingId] = useState<string | null>(null);
  // Set when the booking could not be saved, so the tab shows a WhatsApp fallback instead of "Sent!".
  const [bookingIssue, setBookingIssue] = useState<string | null>(null);
  const [bookingForm, setBookingForm] = useState({
    name: "", email: "", phone: "", date: "", groupSize: "1", message: "",
    sharing: trek.roomSharing?.[0].label ?? "",
  });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const dates = useDepartures(trek.slug);
  const heroSlides = useMemo(() => getHeroSlides(trek), [trek]);

  const goToTab = (tab: Tab) => {
    setActiveTab(tab);
    const idx = TABS.indexOf(tab);
    tabRefs.current[idx]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    document.getElementById("trek-tabpanels")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Register CTA on an active departure → prefill the date and open the reservation tab.
  const registerForDate = (iso: string) => {
    setBookingForm((f) => ({ ...f, date: iso }));
    goToTab("Make Reservation");
  };

  const handleBookingSubmit = async () => {
    if (!user) {
      // new / signed-out visitors go straight to sign-up to create an account
      window.location.href = "/signup";
      return;
    }
    setPayBookingId(null);
    const room = bookingForm.sharing ? `Room: ${bookingForm.sharing}\n` : "";
    setBookingIssue(null);
    try {
      // The server prices and stores the booking (specs/001-persistent-backend, FR-016).
      const created = await createTrekBooking({
        trekSlug: trek.slug,
        date: bookingForm.date,
        groupSize: bookingForm.groupSize,
        roomSharing: bookingForm.sharing || undefined,
        message: bookingForm.message,
      });
      if (!created.quoteRequired) setPayBookingId(created.bookingId);
    } catch (err) {
      // Not saved — never show a false success (FR-061). The WhatsApp hand-off below still opens.
      setBookingIssue(
        err instanceof BackendUnavailableError
          ? "We couldn't save your request online right now."
          : err instanceof Error
            ? err.message
            : "We couldn't save your request online."
      );
    }
    const text = encodeURIComponent(
      `Hi! I'm ${bookingForm.name || "a trekker"}. I'd like to book the ${trek.name}.\nDate: ${bookingForm.date}\nGroup: ${bookingForm.groupSize}\n${room}Phone: ${bookingForm.phone}\nMessage: ${bookingForm.message || ""}`
    );
    window.open(`https://wa.me/917817912062?text=${text}`, "_blank");
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: `${trek.name} — Himalayan Arc Adventure`, text: trek.blurb, url });
        return;
      } catch {
        /* user dismissed the share sheet — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareMsg("Link copied!");
    } catch {
      setShareMsg("Couldn't copy link");
    }
    setTimeout(() => setShareMsg(""), 2000);
  };

  const onTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    let next = index;
    if (e.key === "ArrowRight") next = (index + 1) % TABS.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TABS.length - 1;
    setActiveTab(TABS[next]);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      {/* Breadcrumb */}
      <div className="bg-slate-50 dark:bg-surface pt-20">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-muted" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
            <span aria-hidden>/</span>
            <Link href="/treks" className="hover:text-emerald-600 transition-colors">Adventures</Link>
            <span aria-hidden>/</span>
            <span className="text-foreground font-medium">{trek.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero Banner — wallpaper slideshow of the trek's photos */}
      <WallpaperCarousel
        slides={heroSlides}
        label={`Photos from the ${trek.name}`}
        controls="top"
        className="h-[50vh] min-h-[350px]"
        scrimClassName="bg-gradient-to-t from-black/80 via-black/40 to-black/20"
        fallback={<NoPhoto className="w-full h-full" />}
      >
        {/* Wishlist & Share */}
        <div className="absolute top-6 right-6 flex items-center gap-3">
          {shareMsg && (
            <motion.span
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={transition("base")}
              className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm"
              role="status"
            >
              {shareMsg}
            </motion.span>
          )}
          <button
            onClick={() => setWished((w) => !w)}
            aria-pressed={wished}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-150 ease-out"
          >
            <svg className={`w-5 h-5 transition-transform duration-150 ease-out motion-reduce:transition-none ${wished ? "scale-110 text-red-400" : ""}`} fill={wished ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>
          <button
            onClick={handleShare}
            aria-label="Share this trek"
            className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-150 ease-out"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <span
                className="px-3 py-1 text-white text-xs font-bold rounded-full"
                style={{ backgroundColor: DIFFICULTY_COLORS[trek.difficulty] }}
              >
                {trek.difficulty}
              </span>
              {trek.rating && (
                <span className="flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                  <svg className="w-3.5 h-3.5 text-amber-400 fill-current" viewBox="0 0 20 20" aria-hidden>
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {trek.rating} ({trek.reviewCount} Reviews)
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{trek.name}</h1>
            <p className="flex flex-wrap items-center gap-2 text-white/80">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {trek.location || trek.region}
              {trek.startsFrom && (
                <span className="ml-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
                  Starts from {trek.startsFrom}
                </span>
              )}
            </p>
          </div>
        </div>
      </WallpaperCarousel>

      {/* Trek Statistics Cards */}
      <section className="bg-white dark:bg-background border-b border-slate-100 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon="clock" label="Duration" value={`${trek.days} Days`} />
            <StatCard icon="mountain" label="Max Elevation" value={`${trek.maxAltitude}m`} sub={`${Math.round(trek.maxAltitude * 3.28084)} ft`} />
            <StatCard icon="people" label="Group Size" value={`${trek.groupSize || 15}`} />
            <StatCard icon="calendar" label="Best Season" value={trek.bestSeason} />
          </div>
        </div>
      </section>

      {/* Main Content + Sticky Sidebar */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-28 sm:px-6 lg:px-8 lg:pb-16">
        {/* Full-width sticky tab bar — sticks against the whole page, stays visible past the Trek Cost card */}
        <div className="sticky top-16 z-30 -mx-4 mb-8 bg-white/95 dark:bg-background/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10 sm:mx-0 sm:rounded-t-2xl sm:border-x sm:border-t">
          <div className="overflow-x-auto">
            <div role="tablist" aria-label="Trek details" className="flex min-w-max px-2">
              {TABS.map((tab, index) => (
                <button
                  key={tab}
                  ref={(el) => {
                    tabRefs.current[index] = el;
                  }}
                  role="tab"
                  id={`trek-tab-${index}`}
                  aria-selected={activeTab === tab}
                  aria-controls={`trek-tabpanel-${index}`}
                  tabIndex={activeTab === tab ? 0 : -1}
                  onClick={() => goToTab(tab)}
                  onKeyDown={(e) => onTabKeyDown(e, index)}
                  className={`relative min-h-11 px-3.5 py-3.5 text-xs sm:px-5 sm:text-sm font-semibold whitespace-nowrap transition-colors duration-150 ease-out ${
                    activeTab === tab ? "text-emerald-700 dark:text-emerald-400" : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  {tab}
                  {activeTab === tab &&
                    (shouldReduceMotion ? (
                      <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                    ) : (
                      <motion.span
                        layoutId="trek-tab-underline"
                        transition={transition("base")}
                        className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-emerald-600 dark:bg-emerald-400"
                      />
                    ))}
                </button>
              ))}
            </div>
          </div>
          {/* Mobile scroll hint */}
          <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 flex items-center bg-gradient-to-l from-white/95 via-white/70 to-transparent pl-2 pr-1 py-2 rounded-l-xl md:hidden dark:from-background/95 dark:via-background/70">
            <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Tab Content */}
          <div className="lg:w-2/3">
            {/* Tab Content: every panel is in the static HTML so search engines can read the
                itinerary, inclusions and packing list; inactive panels are `hidden`. */}
            <div id="trek-tabpanels" className="scroll-mt-36">
              {TABS.map((tab, index) => (
                <TabPanel key={tab} index={index} active={activeTab === tab} reduceMotion={!!shouldReduceMotion}>
                  {tab === "Overview" && <OverviewTab trek={trek} />}
                  {tab === "Dates" && <DatesTab trek={trek} dates={dates} onRegister={registerForDate} />}
                  {tab === "Itinerary" && (
                    <ItineraryTab
                      key={trek.slug}
                      trek={trek}
                      onChoosePackage={(sharing) => {
                        if (sharing) setBookingForm((form) => ({ ...form, sharing }));
                        goToTab("Make Reservation");
                      }}
                    />
                  )}
                  {tab === "T&C" && <TermsConditions />}
                  {tab === "Photo Gallery" && <GalleryTab trek={trek} />}
                  {tab === "Scholarships" && <ScholarshipsTab trek={trek} />}
                  {tab === "What's Included" && <IncludedTab trek={trek} onNav={goToTab} />}
                  {tab === "Packing List" && <PackingListTab />}
                  {tab === "Make Reservation" && (
                    <ReservationTab
                      trek={trek}
                      dates={dates}
                      form={bookingForm}
                      setForm={setBookingForm}
                      onSubmit={handleBookingSubmit}
                      bookingIssue={bookingIssue}
                      // Online payment needs Supabase (the booking row) and a numeric group size to price.
                      payHref={
                        payBookingId && isSupabaseConfigured && /^\d+$/.test(bookingForm.groupSize)
                          ? `/checkout?booking=${payBookingId}`
                          : undefined
                      }
                    />
                  )}
                </TabPanel>
              ))}
            </div>
          </div>

          {/* Right: Sticky Sidebar */}
          <div className="lg:w-1/3">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Booking Card */}
              <BookingCard
                trek={trek}
                dates={dates}
                onViewDates={() => goToTab("Dates")}
                onContact={() => setShowContact(true)}
                onNav={(tab) => goToTab(tab)}
              />

              {/* Elevation Profile Mini */}
              <div className="bg-white dark:bg-card rounded-2xl border border-slate-200 dark:border-white/10 p-5 sm:p-6">
                <h4 className="text-lg font-semibold text-foreground mb-3">Elevation Profile</h4>
                <MiniElevationChart profile={trek.elevationProfile} itinerary={trek.itinerary} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed mobile details band */}
      <div
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-background/95 backdrop-blur border-t border-slate-200 dark:border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex-shrink-0 leading-tight">
            <div className="text-[11px] leading-none text-muted mb-0.5">From</div>
            <div className="text-base sm:text-lg font-bold leading-none text-foreground"><Price inr={trek.price} /></div>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowContact(true)}
            className="flex-shrink-0 px-3.5 border-emerald-600/40 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          >
            Info
          </Button>
          <Button onClick={() => goToTab("Dates")} className="min-w-0 flex-1 px-3 font-bold">
            <span className="truncate">View Dates &amp; Register →</span>
          </Button>
        </div>
        <PriceRoute trek={trek} className="-mt-2 px-4 pb-2 text-[11px] font-medium text-muted" />
      </div>

      <ContactPopup
        open={showContact}
        onClose={() => setShowContact(false)}
        requesterName={bookingForm.name.trim() || user?.user_metadata?.full_name}
        defaultMessage={`I'd like details about the ${trek.name} trek. Please share available dates and booking details.`}
      />

      <ScrollProgressRing className="bottom-28 right-4 lg:bottom-8 lg:right-6" />
    </div>
  );
}

/**
 * One tab's panel. All panels stay mounted (their text is in the static HTML for crawlers,
 * and form/gallery state survives tab switches); inactive ones are `hidden`, so their lazy
 * images and videos don't load until shown. The fade-in runs only when a panel is switched
 * to after load, never on first paint, and not at all with reduced motion.
 */
function TabPanel({ index, active, reduceMotion, children }: { index: number; active: boolean; reduceMotion: boolean; children: ReactNode }) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const wasActive = useRef(active);

  useEffect(() => {
    if (active && !wasActive.current && !reduceMotion && scope.current) {
      animate(scope.current, { opacity: [0, 1], y: [10, 0] }, { duration: DURATION.base, ease: EASE.out });
    }
    wasActive.current = active;
  }, [active, reduceMotion, animate, scope]);

  return (
    <div
      ref={scope}
      id={`trek-tabpanel-${index}`}
      role="tabpanel"
      aria-labelledby={`trek-tab-${index}`}
      tabIndex={0}
      hidden={!active}
      className="focus:outline-none"
    >
      {children}
    </div>
  );
}

/* What the price covers, Indiahikes-style ("Joshimath to Joshimath"); nothing when the trek has no pickup town. */
function PriceRoute({ trek, className }: { trek: Trek; className: string }) {
  const route = priceRoute(trek);
  if (!route) return null;
  return (
    <p className={`flex items-center gap-1 ${className}`}>
      <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-600" strokeWidth={2} aria-hidden />
      <span className="sr-only">Price covers </span>
      {route}
    </p>
  );
}

/* ─── Booking / Cost Breakup Card ─── */
const DATES_BADGE = {
  open: { label: "Dates Open", tone: "emerald" },
  filling: { label: "Filling Fast", tone: "amber" },
  waitlist: { label: "Join Waitlist", tone: "slate" },
} as const;

function BookingCard({
  trek,
  dates,
  onViewDates,
  onContact,
  onNav,
}: {
  trek: Trek;
  dates: DeparturesState;
  onViewDates: () => void;
  onContact: () => void;
  onNav: (tab: Tab) => void;
}) {
  const oldPrice = Math.round((trek.price / 0.9) / 10) * 10;
  const discount = Math.round((1 - trek.price / oldPrice) * 100);
  const rating = trek.rating;
  const reviews = trek.reviewCount ?? 0;
  // Kept after closing (open: false) so the dialog can animate out with its content.
  const [includedInfo, setIncludedInfo] = useState<{ id: QuickInfoId; open: boolean } | null>(null);

  // Only real batches earn a badge; none listed (or not loaded yet) shows none.
  const badgeKind = datesBadge(dates.departures);
  const badge = badgeKind ? DATES_BADGE[badgeKind] : null;
  const nextBatch = dates.departures.find(isBookable);

  const INCLUDED_UI: { icon: string; tone: Tone; label: string; info: QuickInfoId }[] = [
    { icon: "tent", tone: "amber", label: trek.stay?.label ?? "Twin Sharing Tent Accommodation", info: "inc-tent" },
    { icon: "card", tone: "sky", label: "All Permits & Entry Fees", info: "inc-permits" },
    { icon: "med", tone: "emerald", label: "Daily Medical & Safety Check-ups", info: "inc-medical" },
    { icon: "meal", tone: "orange", label: "Freshly Cooked Meals on Trail", info: "inc-meals" },
  ];

  const BOOKING_ICONS: Record<string, LucideIcon> = {
    tent: Tent,
    card: FileCheck2,
    med: HeartPulse,
    meal: UtensilsCrossed,
    taxi: Car,
    backpack: Backpack,
    bed: BedDouble,
  };
  const icon = (name: string, cls: string) => {
    if (name === "star") {
      return (
        <svg className={`text-emerald-500 shrink-0 ${cls}`} width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.4 4.32a1 1 0 00.95.69h4.56c.97 0 1.37 1.24.59 1.81l-3.69 2.68a1 1 0 00-.36 1.12l1.4 4.32c.3.92-.75 1.69-1.54 1.12l-3.68-2.68a1 1 0 00-1.18 0l-3.68 2.68c-.79.57-1.85-.2-1.55-1.12l1.4-4.32a1 1 0 00-.36-1.12L2 9.75c-.78-.57-.38-1.81.6-1.81h4.55a1 1 0 00.95-.69l1.4-4.32z" />
        </svg>
      );
    }
    const Icon = BOOKING_ICONS[name];
    return Icon ? <Icon className={cn("shrink-0", cls)} strokeWidth={1.75} aria-hidden /> : null;
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-xl shadow-emerald-900/10 dark:border-emerald-500/30 dark:bg-card">
      <div className="sr-only">Trek cost details</div>

      {/* Price header */}
      <div className="relative z-10 border-b border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-sky-50/60 px-5 pb-5 pt-5 sm:px-6 sm:pt-6 dark:border-white/10 dark:from-emerald-500/10 dark:via-transparent dark:to-sky-500/5">
        <div className="flex items-start justify-between gap-3">
          <h4 className="text-lg font-semibold tracking-[-0.01em] text-foreground">Trek Cost</h4>
          {badge && <Badge tone={badge.tone} className="shrink-0">{badge.label}</Badge>}
        </div>

        <div className="mt-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-slate-500 line-through decoration-2 decoration-red-500/70">
              <Price inr={oldPrice} />
            </span>
            <Badge tone="emerald">{discount}% OFF</Badge>
          </div>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
            {trek.roomSharing && <span className="text-sm text-muted">From</span>}
            <span className="text-5xl font-bold tracking-tight text-foreground tabular-nums"><Price inr={trek.price} /></span>
            <span className="text-sm text-muted">/ person</span>
          </div>
          <PriceRoute
            trek={trek}
            className="mt-3 w-fit rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-slate-700 ring-1 ring-emerald-200 dark:bg-white/5 dark:text-slate-200 dark:ring-emerald-500/30"
          />
          <PriceNote inr={trek.price} className="mt-2 text-muted" />
        </div>
      </div>

      <div className="relative z-10 p-5 pt-4 sm:p-6 sm:pt-5">
        {trek.roomSharing && (
          <ul className="mb-4 divide-y divide-slate-200/80 overflow-hidden rounded-xl bg-slate-50 text-sm ring-1 ring-slate-200/80 dark:divide-white/10 dark:bg-white/5 dark:ring-white/10">
            {trek.roomSharing.map((r) => (
              <li key={r.label} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                <span className="text-slate-700 dark:text-slate-200">
                  {r.label} <span className="text-xs text-muted">· {r.perRoom} per room</span>
                </span>
                <span className="font-bold text-foreground tabular-nums"><Price inr={r.price} /></span>
              </li>
            ))}
          </ul>
        )}

        {/* Trust + rating */}
        <div className="space-y-2">
          {rating != null && (
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-amber-700 ring-1 ring-amber-200/70 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20">
                <Star className="h-3.5 w-3.5 fill-current" aria-hidden />
                <span>{rating}</span>
              </span>
              {reviews > 0 && (
                <span className="font-medium text-muted">· {reviews >= 1000 ? `${(reviews / 1000).toFixed(1)}k+` : `${reviews}+`} people rated this trek</span>
              )}
            </p>
          )}
          <p className="text-xs text-muted">All-inclusive · No-cost EMI · Free Trek Date Change</p>
        </div>

      {/* Included */}
      <div className="relative z-10 mt-5">
        <p className="mb-2.5 mt-5 text-sm font-semibold text-foreground">What&apos;s Included</p>
        <ul className="space-y-2.5">
          {INCLUDED_UI.map((item) => (
            <li key={item.label} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
              <span className={cn("flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ring-1", TILE_TONES[item.tone])}>
                {icon(item.icon, "h-5 w-5")}
              </span>
              <span className="flex-1 break-words">{item.label}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIncludedInfo({ id: item.info, open: true })}
                aria-label={`More about ${item.label}`}
                className="-my-1 -mr-2 h-11 w-11 flex-shrink-0 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
              >
                <Info className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
        {includedInfo && (
          <QuickInfoModal
            id={includedInfo.id}
            open={includedInfo.open}
            label={INCLUDED_UI.find((i) => i.info === includedInfo.id)?.label ?? "Included"}
            trek={trek}
            onClose={() => setIncludedInfo((s) => s && { ...s, open: false })}
          />
        )}
        {nextBatch && (
          <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-0.5 rounded-xl bg-emerald-50/70 px-3 py-2.5 text-sm ring-1 ring-emerald-100 dark:bg-emerald-500/10 dark:ring-emerald-500/20">
            <CalendarDays className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
            <span className="text-xs font-semibold text-muted">Next batch</span>
            <span className="font-semibold text-foreground">{batchLabel(nextBatch.start, trek.days)}</span>
            <span className={`text-xs font-bold ${SEAT_STYLE[seatStatus(nextBatch)].text}`}>{seatLabel(nextBatch)}</span>
          </p>
        )}
        <Button
          variant="outline"
          size="lg"
          onClick={onViewDates}
          className="mt-4 w-full font-bold text-foreground shadow-sm hover:border-emerald-300 hover:bg-emerald-50"
        >
          View full package &amp; dates
        </Button>
        {/* Three quick doors into the detail tabs */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          {(
            [
              { tab: "What's Included" as Tab, label: "Inclusions & Exclusions", icon: ClipboardList, tone: "emerald" as Tone },
              { tab: "T&C" as Tab, label: "Terms & Conditions", icon: ShieldCheck, tone: "sky" as Tone },
              { tab: "Scholarships" as Tab, label: "Scholarships & Waivers", icon: GraduationCap, tone: "amber" as Tone },
            ]
          ).map((box) => (
            <button
              key={box.tab}
              onClick={() => onNav(box.tab)}
              className="group flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-1.5 py-3 text-center transition-[color,background-color,border-color,transform] duration-150 ease-out hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:border-white/10 dark:bg-card dark:hover:bg-emerald-950/30"
            >
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ring-1 transition-transform duration-200 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100",
                  TILE_TONES[box.tone]
                )}
              >
                <box.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="text-[11px] font-bold leading-tight text-foreground">{box.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="my-6 h-px w-full bg-slate-200 dark:bg-white/10" />

      {/* Optional extras */}
      <div className="relative z-10 mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
        <p className="mb-2 text-sm font-semibold text-foreground">Optional</p>
        <ul className="space-y-2.5">
          <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 ring-1 ring-slate-200/70 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10">
              {icon("backpack", "h-5 w-5")}
            </span>
            <span>
              Backpack Offloading — <span className="font-bold text-foreground">avail on request, extra cost</span>
            </span>
          </li>
          <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 ring-1 ring-slate-200/70 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10">
              {icon("bed", "h-5 w-5")}
            </span>
            <span>
              Single Tent / Hotel Room Occupancy — <span className="font-bold text-foreground">on request, extra cost</span>
            </span>
          </li>
        </ul>
      </div>

      {/* Trust row */}
      <div className="relative z-10 mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-[13px] font-semibold leading-snug text-slate-600 ring-1 ring-slate-200/70 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10">
        <div className="flex items-start gap-2">
          <Lock className="mt-px h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2} aria-hidden />
          <span>Secure payment</span>
        </div>
        <div className="flex items-start gap-2">
          <BadgeCheck className="mt-px h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2} aria-hidden />
          <span>Pay 30% advance or in full</span>
        </div>
      </div>

      {/* Call experts */}
      <div className="relative z-10 mt-5 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 p-4 text-center ring-1 ring-orange-100 dark:from-orange-950/30 dark:to-amber-950/10 dark:ring-orange-400/20">
        <p className="flex items-center justify-center gap-2.5 text-base font-semibold text-foreground">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600 ring-1 ring-orange-200/70 dark:from-orange-400/20 dark:to-orange-400/5 dark:text-orange-300 dark:ring-orange-400/20">
            <Phone className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
          </span>
          Call Our Mountain Experts!
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-1 text-sm text-slate-800 dark:text-slate-200">
          <a href="tel:+917817912062" className="inline-flex min-h-11 items-center rounded-xl px-2.5 font-semibold tabular-nums transition-colors duration-150 ease-out hover:bg-orange-100 hover:underline dark:hover:bg-orange-400/10">+91 78179 12062</a>
          <span className="h-4 w-px bg-slate-900/30 dark:bg-white/30" aria-hidden />
          <a href="tel:+918650561564" className="inline-flex min-h-11 items-center rounded-xl px-2.5 font-semibold tabular-nums transition-colors duration-150 ease-out hover:bg-orange-100 hover:underline dark:hover:bg-orange-400/10">+91 86505 61564</a>
        </div>
      </div>

      {/* CTA */}
      <div className="relative z-10 mt-4 space-y-2">
        <Button size="lg" onClick={onViewDates} className="h-12 w-full text-base shadow-lg shadow-emerald-900/20">
          View All Dates &amp; Register
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={onContact}
          className="w-full border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-600 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
        >
          Request Information
        </Button>
      </div>
      </div>
    </div>
  );
}

/* ─── Stat Card ─── */
const STAT_ICONS: Record<string, { Icon: LucideIcon; tone: Tone }> = {
  clock: { Icon: Timer, tone: "sky" },
  mountain: { Icon: Mountain, tone: "emerald" },
  people: { Icon: Users, tone: "orange" },
  calendar: { Icon: CalendarDays, tone: "amber" },
};

function StatCard({ icon, label, value, sub }: { icon: string; label: string; value: string; sub?: string }) {
  const stat = STAT_ICONS[icon];
  return (
    <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-surface">
      {stat && (
        <div className={cn("flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ring-1", TILE_TONES[stat.tone])}>
          <stat.Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
        </div>
      )}
      <div className="min-w-0">
        <div className="text-base font-bold leading-tight text-foreground">{value}</div>
        <div className="text-xs font-medium text-muted">{label}</div>
        {sub && <div className="text-[11px] text-muted">{sub}</div>}
      </div>
    </div>
  );
}

/* ─── Overview Tab ─── */
/* ─── Quick Info strip (IndiaHikes-style) ─── */
type Tone = "emerald" | "sky" | "amber" | "orange";

// Brand colours only. Soft gradient chip, hairline ring, readable icon colour in light and dark.
const TILE_TONES: Record<Tone, string> = {
  emerald: "from-emerald-100 to-emerald-50 text-emerald-600 ring-emerald-200/70 dark:from-emerald-400/20 dark:to-emerald-400/5 dark:text-emerald-300 dark:ring-emerald-400/20",
  sky: "from-sky-100 to-sky-50 text-sky-600 ring-sky-200/70 dark:from-sky-400/20 dark:to-sky-400/5 dark:text-sky-300 dark:ring-sky-400/20",
  amber: "from-amber-100 to-amber-50 text-amber-600 ring-amber-200/70 dark:from-amber-400/20 dark:to-amber-400/5 dark:text-amber-300 dark:ring-amber-400/20",
  orange: "from-orange-100 to-orange-50 text-orange-600 ring-orange-200/70 dark:from-orange-400/20 dark:to-orange-400/5 dark:text-orange-300 dark:ring-orange-400/20",
};

function QuickInfo({ trek }: { trek: Trek }) {
  const totalHours = trek.itinerary.reduce((sum, d) => sum + d.hours, 0);
  const ft = Math.round(trek.maxAltitude * 3.28084);
  // ponytail: age/fitness heuristics keyed off difficulty — replace with per-trek data if it ever matters
  const AGE_BY_DIFFICULTY: Record<string, string> = {
    Easy: "8 – 62 years",
    Moderate: "10 – 60 years",
    Challenging: "14 – 55 years",
    Strenuous: "16 – 50 years",
  };
  const FITNESS_BY_DIFFICULTY: Record<string, string> = {
    Easy: "5 km in 45 mins",
    Moderate: "5 km in 40 mins",
    Challenging: "5 km in 35 mins",
    Strenuous: "10 km in 60 mins",
  };
  // Kept after closing (open: false) so the dialog can animate out with its content.
  const [openModal, setOpenModal] = useState<{ id: QuickInfoId; open: boolean } | null>(null);

  const items: { id: QuickInfoId; label: string; value: string; color?: string; icon: LucideIcon; tone: Tone }[] = [
    { id: "difficulty", label: "Trek Difficulty", value: trek.difficulty, color: DIFFICULTY_COLORS[trek.difficulty], icon: Gauge, tone: "emerald" },
    { id: "duration", label: "Trek Duration", value: `${trek.days} Days · ${totalHours}h Trekking`, icon: Timer, tone: "sky" },
    {
      id: "altitude",
      label: "Highest Altitude",
      value: `${trek.maxAltitude.toLocaleString("en-IN")} m (${ft.toLocaleString("en-IN")} ft)`,
      icon: Mountain,
      tone: "emerald",
    },
    { id: "season", label: "Best Season", value: trek.bestSeason, icon: Sun, tone: "amber" },
    { id: "group", label: "Group Size", value: trek.groupSize ? `Max ${trek.groupSize} Trekkers` : "Small Groups", icon: Users, tone: "sky" },
    { id: "basecamp", label: "Basecamp", value: trek.location ?? trek.region, icon: MapPin, tone: "orange" },
    { id: "age", label: "Suitable For", value: AGE_BY_DIFFICULTY[trek.difficulty], icon: UserCheck, tone: "emerald" },
    { id: "accommodation", label: "Accommodation", value: trek.stay?.label ?? "Tents & Mountain Lodges", icon: Tent, tone: "amber" },
    { id: "fitness", label: "Fitness Criteria", value: FITNESS_BY_DIFFICULTY[trek.difficulty], icon: Footprints, tone: "orange" },
    { id: "offloading", label: "Offloading", value: "Available", icon: Backpack, tone: "sky" },
    { id: "cloakroom", label: "Cloakroom", value: "Available at Basecamp", icon: Luggage, tone: "emerald" },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setOpenModal({ id: item.id, open: true })}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-[border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-900/10 active:translate-y-0 active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 dark:border-white/10 dark:bg-card dark:hover:border-emerald-700"
          >
            <div className="flex items-start justify-between">
              <div
                className={cn(
                  "mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ring-1 transition-transform duration-200 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100",
                  !item.color && TILE_TONES[item.tone]
                )}
                style={
                  item.color
                    ? { backgroundImage: `linear-gradient(135deg, ${item.color}2e, ${item.color}0d)`, color: item.color, boxShadow: `inset 0 0 0 1px ${item.color}33` }
                    : undefined
                }
              >
                <item.icon className="h-[22px] w-[22px]" strokeWidth={1.75} aria-hidden />
              </div>
              <ChevronRight
                className="mt-1 h-4 w-4 text-muted opacity-40 transition-[color,opacity,transform] duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-emerald-600 group-hover:opacity-100 motion-reduce:transition-none"
                strokeWidth={2.25}
                aria-hidden
              />
            </div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted">{item.label}</h4>
            <p className="mt-0.5 text-[15px] font-bold leading-snug text-foreground">{item.value}</p>
            {/* Always shown on touch screens; a hover hint where there's a mouse. */}
            <span className="mt-1 block text-[11px] font-semibold text-emerald-700 transition-opacity duration-150 ease-out pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 pointer-fine:group-focus-visible:opacity-100">
              Know more
            </span>
          </button>
        ))}
      </div>
      {openModal && (
        <QuickInfoModal
          id={openModal.id}
          open={openModal.open}
          label={items.find((i) => i.id === openModal.id)?.label ?? ""}
          trek={trek}
          onClose={() => setOpenModal((s) => s && { ...s, open: false })}
        />
      )}
    </div>
  );
}

function OverviewTab({ trek }: { trek: Trek }) {
  return (
    <div>
      <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em] text-foreground mb-6">Key Facts</h2>

      {/* About This Trek */}
      <div className="mb-6 rounded-2xl border border-emerald-100 bg-white p-5 sm:p-6 shadow-sm dark:border-emerald-800/30 dark:bg-card">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          About This Trek
          <span className="h-px flex-1 bg-emerald-200/70 dark:bg-emerald-800/40" aria-hidden />
        </h3>
        <p className="mt-2.5 text-sm leading-relaxed text-muted">{trek.blurb}</p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-emerald-50/70 px-2 py-2.5 text-center dark:bg-emerald-950/20">
            <p className="text-sm font-bold text-foreground">{trek.days} days</p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted">{trek.itinerary.reduce((s, d) => s + d.hours, 0)}h trek</p>
          </div>
          <div className="rounded-xl bg-emerald-50/70 px-2 py-2.5 text-center dark:bg-emerald-950/20">
            <p className="text-sm font-bold text-foreground">{trek.maxAltitude.toLocaleString("en-IN")}</p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted">m max altitude</p>
          </div>
          <div className="rounded-xl bg-emerald-50/70 px-2 py-2.5 text-center dark:bg-emerald-950/20">
            <p className="text-sm font-bold text-foreground">{trek.groupSize ?? 15}</p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted">group size</p>
          </div>
        </div>
        <p className="mt-4 mb-2 text-[11px] font-bold uppercase tracking-wider text-muted">Highlights</p>
        <ul className="space-y-1.5">
          {[
            `Small-group departure — capped at ${trek.groupSize ?? 15} trekkers`,
            "All permits & national park entry fees arranged",
            "Experienced local trek leaders on every batch",
            "All camping equipment provided · Freshly cooked meals on trail",
            "First-aid kit & safety gear carried by the crew",
          ].map((h) => (
            <li key={h} className="flex items-start gap-2 text-sm text-foreground">
              <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </div>

      <QuickInfo trek={trek} />
    </div>
  );
}

/* ─── Dates / Availability Tab ─── */

// Icon and colour for a month's highlight ("Clearest views"), matched on its words.
const HIGHLIGHT_ICONS = [
  { test: /snow|frozen|thaw/i, Icon: Snowflake, cls: "text-sky-700" },
  { test: /bloom|rhododendron|flower/i, Icon: Flower2, cls: "text-amber-700" },
  { test: /colour/i, Icon: Leaf, cls: "text-orange-700" },
  { test: /green|meadow|bugyal|monsoon/i, Icon: Sprout, cls: "text-emerald-700" },
  { test: /view|skies|window/i, Icon: Mountain, cls: "text-sky-700" },
];

function MonthHighlight({ text, className = "" }: { text?: string; className?: string }) {
  if (!text) return null;
  const match = HIGHLIGHT_ICONS.find((h) => h.test.test(text));
  const Icon = match?.Icon ?? Sun;
  return (
    <span className={`inline-flex items-center gap-1 font-semibold ${match?.cls ?? "text-amber-700"} ${className}`}>
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      {text}
    </span>
  );
}

/**
 * Indiahikes-style batch list: months as accordions, each batch with its live seats.
 * Batches load after mount (useDepartures); the "When to go" strip below is static, so the
 * season facts are in the page HTML for search engines.
 */
function DatesTab({ trek, dates, onRegister }: { trek: Trek; dates: DeparturesState; onRegister: (iso: string) => void }) {
  const reduceMotion = useReducedMotion();
  const months = useMemo(() => groupByMonth(dates.departures), [dates.departures]);
  const highlights = MONTH_HIGHLIGHTS[trek.slug] ?? {};
  // Until the visitor opens or closes a month, the first month with an open batch is open.
  const [picked, setPicked] = useState<string | null | undefined>(undefined);
  const open = picked !== undefined ? picked : ((months.find((m) => m.departures.some(isBookable)) ?? months[0])?.key ?? null);
  const askHref = `${WHATSAPP}?text=${encodeURIComponent(`Hi! When is the next ${trek.name} batch?`)}`;

  return (
    <div>
      <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em] text-foreground mb-2">Select a Date to Register</h2>
      <p className="text-muted mb-5">Seats update live. Tap an open batch to register.</p>

      <ul className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted" aria-label="What the labels mean">
        {(Object.keys(SEAT_STYLE) as SeatStatus[]).map((k) => (
          <li key={k} className="inline-flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${SEAT_STYLE[k].dot}`} aria-hidden />
            {SEAT_STYLE[k].legend}
          </li>
        ))}
      </ul>

      {dates.status === "loading" ? (
        <div className="space-y-3" aria-busy="true" aria-label="Loading dates">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex h-[52px] items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3.5 w-14" />
            </div>
          ))}
        </div>
      ) : months.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm sm:p-6 dark:border-white/10 dark:bg-white/5">
          <p className="font-semibold text-foreground">
            {dates.status === "unavailable" ? "Live dates couldn't load right now." : "No batches are listed for the coming months yet."}
          </p>
          <p className="mt-1 text-muted">
            Best season: {trek.bestSeason}. Message us for the next batch, or book a private departure for 2 or more on a date that suits you.
          </p>
          <a
            href={askHref}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ className: "mt-4" })}
          >
            Ask for dates on WhatsApp
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {months.map((m) => {
            const isOpen = open === m.key;
            const openCount = m.departures.filter(isBookable).length;
            return (
              <div key={m.key} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-card">
                <button
                  type="button"
                  onClick={() => setPicked(isOpen ? null : m.key)}
                  aria-expanded={isOpen}
                  aria-controls={`month-${m.key}`}
                  className="flex min-h-11 w-full items-center justify-between gap-3 bg-slate-50 px-4 py-3.5 text-left transition-colors duration-150 ease-out hover:bg-slate-100 focus-visible:outline-offset-[-2px] dark:bg-white/5 dark:hover:bg-white/10"
                >
                  <span className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-bold text-foreground">{FULL_MONTHS[m.month]} {m.year}</span>
                    <MonthHighlight text={highlights[MONTHS[m.month]]} className="text-sm" />
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="text-xs font-semibold text-muted">{openCount === 0 ? "Full" : `${openCount} open`}</span>
                    <svg className={`h-5 w-5 text-emerald-700 transition-transform duration-150 ease-out motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.ul
                      id={`month-${m.key}`}
                      initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      animate={reduceMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                      exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={reduceMotion ? { duration: 0 } : transition("base")}
                      className="divide-y divide-slate-100 overflow-hidden dark:divide-white/5"
                    >
                      {m.departures.map((d) => (
                        <DepartureRow key={d.id} d={d} trek={trek} onRegister={onRegister} />
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      <section aria-labelledby="when-to-go" className="mt-8">
        <h3 id="when-to-go" className="text-lg font-bold text-foreground">When to go</h3>
        <p className="mt-1 text-sm text-muted">Best season: {trek.bestSeason}</p>
        <ol className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {seasonStrip(trek.bestSeason, highlights).map((m) => (
            <li
              key={m.name}
              className={`rounded-xl border px-3 py-2 ${m.inSeason ? "border-emerald-200 bg-emerald-50/60" : "border-slate-200 bg-slate-50 text-slate-500"}`}
            >
              <span className={`block text-sm font-semibold ${m.inSeason ? "text-foreground" : ""}`}>{FULL_MONTHS[m.month]}</span>
              {m.inSeason ? (
                m.highlight ? <MonthHighlight text={m.highlight} className="text-xs" /> : <span className="text-xs font-semibold text-emerald-700">In season</span>
              ) : (
                <span className="text-xs">Off season</span>
              )}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function DepartureRow({ d, trek, onRegister }: { d: Departure; trek: Trek; onRegister: (iso: string) => void }) {
  const status = seatStatus(d);
  const label = batchLabel(d.start, trek.days);
  const bookable = isBookable(d);
  const row = "flex w-full items-center gap-3 px-4 py-3 text-left text-sm";
  const dateCell = (
    <span className="flex min-w-0 flex-1 flex-col items-start gap-1">
      <span className={`font-semibold ${bookable ? "text-foreground" : "text-slate-400"}`}>{label}</span>
      {d.tag && <Badge tone="amber">{d.tag}</Badge>}
    </span>
  );
  const seats = <span className={`text-xs font-bold uppercase tracking-wide ${SEAT_STYLE[status].text}`}>{seatLabel(d)}</span>;

  if (status === "closed") {
    return <li className={row}>{dateCell}{seats}</li>;
  }
  if (status === "full") {
    const text = encodeURIComponent(`Hi! The ${trek.name} batch ${label} is full. Please add me to the waitlist.`);
    return (
      <li>
        <a
          href={`${WHATSAPP}?text=${text}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${label} is full. Join the waitlist on WhatsApp`}
          className={`${row} min-h-11 transition-colors duration-150 ease-out hover:bg-slate-50 focus-visible:outline-offset-[-2px] dark:hover:bg-white/5`}
        >
          {dateCell}
          <span className="flex shrink-0 flex-col items-end gap-0.5">
            {seats}
            <span className="text-xs font-semibold text-emerald-700 underline underline-offset-2">Join waitlist</span>
          </span>
        </a>
      </li>
    );
  }
  return (
    <li>
      <button
        type="button"
        onClick={() => onRegister(d.start)}
        aria-label={`Register for ${label}, ${seatLabel(d).toLowerCase()}`}
        className={`${row} group min-h-11 transition-colors duration-150 ease-out hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-emerald-500 dark:hover:bg-emerald-950/30`}
      >
        {dateCell}
        {seats}
        <svg className="h-4 w-4 shrink-0 text-emerald-700 transition-transform duration-150 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </li>
  );
}

/* ─── Day by Day Tab ─── */
function ItineraryTab({ trek, onChoosePackage }: { trek: Trek; onChoosePackage: (sharing?: string) => void }) {
  const [blocked, setBlocked] = useState(false);
  const [expandedDays, setExpandedDays] = useState(() => new Set(trek.itinerary.map((day) => day.day)));
  const reduceMotion = useReducedMotion();
  const allExpanded = expandedDays.size === trek.itinerary.length;
  const packageInfo = getTrekPackage(trek);
  const packageOptions = trek.roomSharing?.length
    ? trek.roomSharing.map((room) => ({
        name: room.label,
        detail: `${room.perRoom} per room · ${priceRoute(trek) ?? trek.location ?? trek.region}`,
        price: room.price,
        sharing: room.label,
      }))
    : [{
        name: `${trek.name} package`,
        detail: priceRoute(trek) ?? trek.location ?? trek.region,
        price: trek.price,
        sharing: undefined,
      }];
  const toggleAll = () => setExpandedDays(allExpanded ? new Set() : new Set(trek.itinerary.map((day) => day.day)));
  const toggleDay = (day: number) => setExpandedDays((current) => {
    const next = new Set(current);
    if (next.has(day)) next.delete(day);
    else next.add(day);
    return next;
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em] text-foreground">Day-by-Day Itinerary</h2>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={toggleAll} aria-expanded={allExpanded}>
            {allExpanded ? "Collapse all" : "Expand all"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setBlocked(!printItinerary(trek))}
            className="border-emerald-600/40 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Save itinerary as PDF
          </Button>
        </div>
        {blocked && (
          <p role="status" className="w-full text-sm text-amber-700 dark:text-amber-300">
            Your browser blocked the itinerary window. Allow pop-ups for this site and try again.
          </p>
        )}
      </div>
      <div className="space-y-4">
        {trek.itinerary.map((day) => {
          const expanded = expandedDays.has(day.day);
          const panelId = `itinerary-${trek.slug}-day-${day.day}`;
          return (
          <div key={day.day} className="bg-white dark:bg-card rounded-2xl border border-slate-200 dark:border-white/10 p-5 sm:p-6 shadow-sm">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-11 h-11 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                {day.day}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold leading-snug text-foreground">
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    onClick={() => toggleDay(day.day)}
                    className="flex min-h-11 w-full items-start justify-between gap-3 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <span>{day.title}</span>
                    <svg className={`mt-1 h-5 w-5 shrink-0 text-emerald-700 transition-transform duration-150 ease-out motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted mt-1.5 mb-2">
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                    {day.altitude.toLocaleString()}m
                  </span>
                  {day.hours > 0 && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {day.hours} hrs
                    </span>
                  )}
                </div>
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-label={`Day ${day.day} itinerary details`}
                      initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      animate={reduceMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                      exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={{ duration: reduceMotion ? 0 : DURATION.base, ease: EASE.out }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-slate-100 pt-4 dark:border-white/5">
                <p className="text-muted text-sm leading-relaxed">{day.description}</p>
                {day.note && (
                  <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-bold leading-relaxed text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                    Note: {day.note}
                  </p>
                )}
                <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 11-6 0 3.354 3.354 0 016 0zm2.25-3.75a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM12 18.75a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>
                    Meals: {day.meals || "B/L/D"}
                  </span>
                </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
          );
        })}
      </div>
      <section aria-labelledby="package-options-title" className="mt-10">
        <div className="mb-4">
          <h3 id="package-options-title" className="text-2xl font-bold tracking-[-0.02em] text-foreground">Package options</h3>
          <p className="mt-1 text-sm text-muted">Choose a package to continue to the reservation form. Prices are per person.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {packageOptions.map((option) => (
            <article key={option.name} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-lg font-semibold text-foreground">{option.name}</h4>
                  <p className="mt-1 text-sm text-muted">{option.detail}</p>
                </div>
                <Badge tone="emerald" className="shrink-0">{trek.days} days</Badge>
              </div>
              <p className="mt-4 text-3xl font-bold text-foreground"><Price inr={option.price} /> <span className="text-sm font-normal text-muted">/ person</span></p>
              <details className="mt-4 border-t border-slate-100 pt-4 text-sm dark:border-white/10">
                <summary className="flex min-h-11 cursor-pointer items-center font-semibold text-emerald-700 marker:text-emerald-600 dark:text-emerald-300">Show package details</summary>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <h5 className="font-semibold text-foreground">Price includes</h5>
                    <ul className="mt-2 space-y-2 text-muted">
                      {packageInfo.included.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold text-foreground">Not included</h5>
                    <ul className="mt-2 space-y-2 text-muted">
                      {packageInfo.excluded.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                </div>
              </details>
              <Button type="button" size="lg" className="mt-5 w-full" onClick={() => onChoosePackage(option.sharing)}>
                Choose package
              </Button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ─── Photo Gallery Tab (with lightbox) ─── */
const isVideo = (src: string) => /\.(mp4|mov)$/i.test(src);

function GalleryTab({ trek }: { trek: Trek }) {
  // No photos of its own → no stand-in stock gallery either.
  const images = galleryMedia(trek);
  const reduceMotion = useReducedMotion();
  // The index is kept after closing so the viewer can animate out on the photo it showed.
  const [viewer, setViewer] = useState({ index: 0, open: false });
  const step = (by: number) => setViewer((v) => ({ ...v, index: (v.index + by + images.length) % images.length }));
  const current = images[viewer.index];

  const navButton =
    "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-150 ease-out hover:bg-white/20";

  return (
    <div>
      <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em] text-foreground mb-6">Photo Gallery</h2>
      {images.length === 0 && (
        <EmptyState
          className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12 dark:border-white/10 dark:bg-card"
          icon={
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5a1.5 1.5 0 001.5 1.5z" />
            </svg>
          }
          title="Photos from this trek are coming soon."
          description="Ask us on WhatsApp and we'll send pictures from our recent batches."
        />
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setViewer({ index: i, open: true })}
            aria-label={`View photo ${i + 1} of ${images.length}`}
            className="relative aspect-[4/3] rounded-xl overflow-hidden group cursor-pointer"
          >
            {isVideo(img) ? (
              <LazyVideo src={img} muted className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
            ) : (
              <SmartImage src={img} alt={`${trek.name} — photo ${i + 1}`} className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100">
              {isVideo(img) ? (
                <svg className="w-10 h-10 text-white drop-shadow" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              ) : (
                <svg className="w-8 h-8 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 7.5v6m3-3h-6M21 21l-5.2-5.2" />
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>

      {images.length > 0 && (
        <Dialog open={viewer.open} onOpenChange={(open) => setViewer((v) => ({ ...v, open }))}>
          <DialogContent
            size="full"
            tone="dark"
            hideClose
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") step(1);
              else if (e.key === "ArrowLeft") step(-1);
            }}
          >
            <DialogTitle className="sr-only">{`${trek.name} photo viewer`}</DialogTitle>
            {/* Tapping the dark area around the photo closes the viewer, as before. */}
            <motion.div
              className="relative flex h-full w-full touch-pan-y items-center justify-center p-4"
              onClick={(e) => e.target === e.currentTarget && setViewer((v) => ({ ...v, open: false }))}
              onPanEnd={(_, info) => {
                if (isVideo(current)) return; // dragging a video scrubs it instead
                // Swipe left/right on phones moves between photos.
                if (Math.abs(info.offset.x) > 50 && Math.abs(info.offset.x) > Math.abs(info.offset.y)) step(info.offset.x < 0 ? 1 : -1);
              }}
            >
              <DialogClose
                aria-label="Close photo viewer"
                className="absolute top-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-150 ease-out hover:bg-white/20"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </DialogClose>
              <button type="button" onClick={() => step(-1)} aria-label="Previous photo" className={`${navButton} left-2 sm:left-4`}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              {isVideo(current) ? (
                <motion.div
                  key={viewer.index}
                  initial={reduceMotion ? { opacity: 0 } : { scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={transition("base")}
                  className="max-h-[85vh] max-w-[92vw]"
                >
                  <video
                    src={current}
                    controls
                    controlsList="nodownload"
                    autoPlay
                    muted
                    playsInline
                    preload="metadata"
                    className="max-h-[85vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
                  />
                </motion.div>
              ) : (
                <motion.img
                  key={viewer.index}
                  src={current}
                  alt={`${trek.name} — photo ${viewer.index + 1}`}
                  draggable={false}
                  initial={reduceMotion ? { opacity: 0 } : { scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={transition("base")}
                  className="max-h-[85vh] max-w-[92vw] select-none rounded-xl object-contain shadow-2xl"
                />
              )}
              <button type="button" onClick={() => step(1)} aria-label="Next photo" className={`${navButton} right-2 sm:right-4`}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/80" aria-live="polite">
                {viewer.index + 1} / {images.length}
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

/* ─── What's Included Tab ─── */
function IncludedTab({ trek, onNav }: { trek: Trek; onNav: (tab: Tab) => void }) {
  const pkg = useMemo(() => getTrekPackage(trek), [trek]);
  return (
    <div>
      <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em] text-foreground mb-2">Inclusions &amp; Exclusions</h2>
      <p className="text-muted mb-6">What your fee covers on the {trek.name}, and what you&apos;ll arrange yourself.</p>
      <dl className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {pkg.facts.map((f) => (
          <div key={f.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-card">
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted">{f.label}</dt>
            <dd className="mt-0.5 text-sm font-semibold leading-snug text-foreground">{f.value}</dd>
          </div>
        ))}
      </dl>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-emerald-700 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Included
          </h3>
          <ul className="space-y-3">
            {pkg.included.map((item) => (
              <li key={item} className="flex items-center gap-3 text-foreground">
                <span className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Not Included
          </h3>
          <ul className="space-y-3">
            {pkg.excluded.map((item) => (
              <li key={item} className="flex items-center gap-3 text-foreground">
                <span className="w-5 h-5 bg-red-100 text-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-8 text-sm text-muted">
        Anything not listed under Included isn&apos;t part of the package. Getting your own gear sorted?{" "}
        <Button variant="link" onClick={() => onNav("Packing List")} className="inline p-0 align-baseline text-sm">
          See the Packing List
        </Button>
        .
      </p>
    </div>
  );
}

/* ─── Packing List Tab ─── */
const PACKING_GROUPS: {
  title: string;
  note?: string;
  items: { name: string; why: string; pro?: string }[];
}[] = [
  {
    title: "Major Gears",
    items: [
      { name: "Waterproof, Ankle-Height Trekking Boots", why: "Stiff rubber soles prevent water entry and protect ankles.", pro: "Must be fully broken in before the trek." },
      { name: "Trekking Poles (Pair)", why: "Extra points of contact for stability and knee relief on descents.", pro: "Use together to distribute pack weight." },
      { name: "Waterproof Gloves (2 Pairs)", why: "Protect against cold injury while keeping hands warm.", pro: "Keep the shell dry for a waterproof layer." },
      { name: "Gaiters", why: "Seal the gap between boots and trousers so snow stays out.", pro: "Put them on as soon as you reach the snowline." },
      { name: "High-Grade SPF Sunscreen & Lip Balm", why: "Reflected snow UV burns exposed skin fast at altitude.", pro: "Reapply every 2 hours on the snow." },
      { name: "Sunglasses (Category 4)", why: "Protect against temporary snow blindness.", pro: "Never remove them while on snow." },
    ],
  },
  {
    title: "Clothing — The Layering System",
    items: [
      { name: "Warm Beanie / Balaclava", why: "A large percentage of body heat is lost from the head.", pro: "Must cover the ears completely." },
      { name: "Moisture-Wicking T-Shirts (2)", why: "Synthetic or merino keeps you dry; cotton makes you cold.", pro: "Short or long sleeve both work." },
      { name: "Thermal Base Layer (1)", why: "Locks in body heat as the start of your layering system." },
      { name: "Fleece Jacket (1)", why: "Best warmth-to-weight ratio; worn alone or under your shell." },
      { name: "Insulated Puff Jacket (1)", why: "Your main heat source for cold nights and the summit push.", pro: "Rated for 0°C and below." },
      { name: "Waterproof & Windproof Jacket (1)", why: "Keeps rain, snow and wind out.", pro: "Prefer a taped-seam shell." },
      { name: "Quick-Dry Trekking Pants (2)", why: "Synthetic, stretchable trousers dry fast and move well." },
      { name: "Waterproof Rain Pants (1)", why: "Protect your base layers in rain or snow." },
      { name: "Trekking Socks (4–5 pairs)", why: "Wool or synthetic blend manages moisture and prevents blisters.", pro: "Keep 1–2 thick pairs for nights." },
      { name: "Camp Shoes", why: "Let your feet rest and boots dry at camp." },
    ],
  },
  {
    title: "Equipment & Essentials",
    items: [
      { name: "Main Rucksack (50–60 L)", why: "Carried by the porter; needs a good frame and hip belt." },
      { name: "Daypack (20–30 L)", why: "Daily carry — water, layers, snacks, camera, gloves." },
      { name: "Sleeping Bag (Rated to −10°C)", why: "Warmth on cold mountain nights.", pro: "Confirm whether your operator provides one." },
      { name: "Sleeping Bag Liner", why: "Adds warmth and keeps the bag clean." },
      { name: "Insulated Water Bottles (2 × 1 L)", why: "Hydration bladders freeze at altitude — use insulated bottles." },
      { name: "Hydration Tablets / ORS", why: "Replaces electrolytes lost at high altitude." },
      { name: "Headlamp with Spare Batteries", why: "Essential for early-morning pass crossings.", pro: "Pack extra batteries." },
      { name: "Basic First-Aid Kit", why: "Plasters, antiseptic, pain relief and any personal medication." },
    ],
  },
  {
    title: "Essential Documents & Cash",
    note: "Carry copies in waterproof/ziplock bags.",
    items: [
      { name: "Government Photo ID", why: "Verification at basecamp and forest checkpoints — Aadhaar/Voter ID/Passport." },
      { name: "ID Copies (2)", why: "Submitted to forest authorities for trekking permits." },
      { name: "Medical Certificate & Undertaking Form", why: "Confirms you are fit for high-altitude trekking." },
      { name: "Cash", why: "No ATMs on the trail — carry enough for personal expenses." },
    ],
  },
];

function PackingListTab() {
  return (
    <div>
      <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em] text-foreground mb-3">Packing List</h2>
      <p className="mb-6 text-sm text-muted">
        Pack for safety and performance. Our treks call for an<strong> essential-over-extras</strong> approach — every
        item below is a genuine need on a high-altitude Himalayan trek.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {[
          { t: "Extremity Protection", d: "UV sunglasses, waterproof gloves and a warm balaclava to protect exposed areas." },
          { t: "Layering System", d: "Multiple synthetic or wool layers to manage temperature and moisture — never cotton." },
          { t: "Waterproof Footwear", d: "Mid-calf waterproof boots so your feet and ankles stay protected on snow and ice." },
        ].map((c) => (
          <div key={c.t} className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 dark:border-emerald-800/30 dark:bg-emerald-950/20">
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{c.t}</p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{c.d}</p>
          </div>
        ))}
      </div>

      <div className="space-y-10">
        {PACKING_GROUPS.map((group) => (
          <div key={group.title}>
            <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
              {group.title}
            </h3>
            {group.note && <p className="mb-3 text-xs text-muted">{group.note}</p>}
            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
              <ul className="divide-y divide-slate-100 dark:divide-white/10">
                {group.items.map((item) => (
                  <li key={item.name} className="flex items-start gap-3 bg-white px-4 py-3.5 dark:bg-card">
                    <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground">{item.name}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted">{item.why}</p>
                      {item.pro && (
                        <p className="mt-1.5 inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                          Pro-tip: {item.pro}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6 dark:border-white/10 dark:bg-card">
        <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-foreground">
          <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5l-3 3-4.5-4.5M19.5 10.5a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Trek Leader Tips
        </h3>
        <ul className="space-y-3 text-sm text-foreground">
          <li className="flex gap-2"><span className="font-bold text-emerald-600">Three Second Rule:</span><span>If you can&apos;t immediately think of a reason to pack it, don&apos;t pack it.</span></li>
          <li className="flex gap-2"><span className="font-bold text-emerald-600">Test Everything:</span><span>Break in your boots and set up your sleeping system at home before the trek.</span></li>
          <li className="flex gap-2"><span className="font-bold text-emerald-600">Leave No Trace:</span><span>Carry everything out and stick to established trails.</span></li>
          <li className="flex gap-2"><span className="font-bold text-emerald-600">Tell Someone:</span><span>Share your itinerary and guide contacts with family before you leave.</span></li>
        </ul>
      </div>
    </div>
  );
}

/* ─── Reservation Tab ─── */
function ReservationTab({
  trek, dates, form, setForm, onSubmit, payHref, bookingIssue,
}: {
  trek: Trek;
  dates: DeparturesState;
  form: { name: string; email: string; phone: string; date: string; groupSize: string; message: string; sharing: string };
  setForm: (f: typeof form) => void;
  onSubmit: () => void;
  payHref?: string;
  bookingIssue?: string | null;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const reduceMotion = useReducedMotion();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [minDate, setMinDate] = useState("");

  // Set the date floor client-side only, to avoid a hydration mismatch at midnight.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMinDate(new Date().toISOString().slice(0, 10)), []);

  // With listed batches the date is a batch picker; "another date" is a private departure.
  const batches = dates.departures.filter(isBookable);
  const [otherDate, setOtherDate] = useState(false);
  const pickBatch = batches.length > 0 && !otherDate;
  const batch = batches.find((d) => d.start === form.date);

  const update = (key: keyof typeof form, value: string) => {
    setForm({ ...form, [key]: value });
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Enter a valid email address.";
    if (form.phone.replace(/\D/g, "").length < 7) next.phone = "Enter a valid phone number.";
    if (!form.date) next.date = pickBatch ? "Pick a batch." : "Pick a preferred date.";
    else if (minDate && form.date < minDate) next.date = "Choose a date in the future.";
    const persons = Number.parseInt(form.groupSize, 10);
    if (batch && persons > batch.seatsLeft) {
      next.groupSize = `Only ${batch.seatsLeft} ${batch.seatsLeft === 1 ? "seat is" : "seats are"} left on this batch. Make the group smaller or pick another batch.`;
    }
    return next;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setSubmitting(true);
    setTimeout(() => {
      onSubmit();
      setSubmitting(false);
      setSent(true);
    }, 900);
  };

  if (sent && bookingIssue) {
    return (
      <div className="py-8">
        <WhatsAppFallback
          message={`${bookingIssue} Your details are ready to send to us on WhatsApp so we can book it for you.`}
          details={[
            `Hi! I'd like to book the ${trek.name}.`,
            form.date && `Date: ${form.date}`,
            `Group: ${form.groupSize}`,
            form.sharing && `Room: ${form.sharing}`,
            form.name && `Name: ${form.name}`,
            form.phone && `Phone: ${form.phone}`,
            form.message && `Message: ${form.message}`,
          ].filter((line): line is string => Boolean(line))}
        />
        <Button variant="link" onClick={() => setSent(false)} className="mt-4 min-h-11">
          Try again
        </Button>
      </div>
    );
  }

  if (sent) {
    return (
      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={transition("slow")}
        className="text-center py-12"
      >
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Reservation Request Sent!</h3>
        <p className="text-muted max-w-sm mx-auto">
          Thanks{form.name ? `, ${form.name.split(" ")[0]}` : ""} — our team will confirm availability
          {form.sharing ? ` and your ${form.sharing.toLowerCase()} room` : ""} for {trek.name} within 24 hours.
        </p>
        {payHref && (
          <Link href={payHref} className={buttonVariants({ size: "lg", className: "mt-5" })}>
            Pay online with UPI
          </Link>
        )}
        <Button variant="link" onClick={() => setSent(false)} className="mt-4 mx-auto flex min-h-11">
          Make another request
        </Button>
      </motion.div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em] text-foreground mb-2">Make a Reservation</h2>
      <p className="text-muted mb-6">Fill out the form below and we&apos;ll get back to you within 24 hours.</p>
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="grid md:grid-cols-2 gap-5">
          <Field id="res-name" label="Full Name" value={form.name} onChange={(v) => update("name", v)} required error={errors.name} autoComplete="name" />
          <Field id="res-email" label="Email" type="email" value={form.email} onChange={(v) => update("email", v)} required error={errors.email} autoComplete="email" />
          <Field id="res-phone" label="Phone Number" type="tel" value={form.phone} onChange={(v) => update("phone", v)} required error={errors.phone} autoComplete="tel" />
          {pickBatch ? (
            <div>
              <Label htmlFor="res-date">Batch</Label>
              <Select
                id="res-date"
                value={batch ? form.date : ""}
                onChange={(e) => {
                  if (e.target.value === "other") {
                    setOtherDate(true);
                    update("date", "");
                  } else update("date", e.target.value);
                }}
                required
                invalid={!!errors.date}
                aria-describedby={errors.date ? "res-date-err" : undefined}
              >
                <option value="">Choose a batch</option>
                {batches.map((d) => (
                  <option key={d.id} value={d.start}>
                    {batchLabel(d.start, trek.days)} {d.start.slice(0, 4)} · {seatLabel(d)}
                  </option>
                ))}
                <option value="other">Another date (private departure)</option>
              </Select>
              {errors.date && <FieldError id="res-date-err">{errors.date}</FieldError>}
            </div>
          ) : (
            <div>
              <Field id="res-date" label="Preferred Date" type="date" value={form.date} onChange={(v) => update("date", v)} required min={minDate || undefined} error={errors.date} />
              {otherDate && (
                <Button variant="link" onClick={() => setOtherDate(false)} className="mt-1 py-2 text-xs">
                  Back to the listed batches
                </Button>
              )}
            </div>
          )}
        </div>
        <div>
          <Label htmlFor="res-group">Group Size</Label>
          <Select
            id="res-group"
            value={form.groupSize}
            onChange={(e) => update("groupSize", e.target.value)}
            invalid={!!errors.groupSize}
            aria-describedby={errors.groupSize ? "res-group-err" : undefined}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? "Person" : "Persons"}</option>
            ))}
            <option value="10+">10+ Persons (Group)</option>
          </Select>
          {errors.groupSize && <FieldError id="res-group-err">{errors.groupSize}</FieldError>}
        </div>
        {trek.roomSharing && (
          <div>
            <Label htmlFor="res-sharing">Room Sharing</Label>
            <Select id="res-sharing" value={form.sharing} onChange={(e) => update("sharing", e.target.value)}>
              {trek.roomSharing.map((r) => (
                <option key={r.label} value={r.label}>{r.label} ({r.perRoom} per room)</option>
              ))}
            </Select>
            <p className="mt-1.5 text-xs text-muted">
              Per person: {trek.roomSharing.map((r, i) => (
                <span key={r.label}>{i > 0 && " · "}{r.label.replace(/ sharing$/i, "")} <Price inr={r.price} /></span>
              ))}
            </p>
          </div>
        )}
        <div>
          <Label htmlFor="res-message">Additional Message</Label>
          <Textarea
            id="res-message"
            rows={4}
            value={form.message}
            onChange={(e) => update("message", e.target.value)}
            placeholder="Custom requests, dietary needs, transport questions..."
          />
        </div>
        <Button type="submit" size="lg" loading={submitting} className="w-full">
          {submitting ? "Sending…" : "Send Reservation Request"}
        </Button>
      </form>
    </div>
  );
}

function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return <p id={id} className="mt-1.5 text-xs font-medium text-red-600">{children}</p>;
}

/** A labelled kit Input with its error line (linked by aria-describedby). */
function Field({ label, id, type = "text", value, onChange, required, min, error, placeholder, autoComplete }: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  min?: string;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <TextInput
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        min={min}
        placeholder={placeholder}
        autoComplete={autoComplete}
        invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
      />
      {error && <FieldError id={`${id}-err`}>{error}</FieldError>}
    </div>
  );
}

/* ─── Interactive Elevation Chart ─── */
function MiniElevationChart({ profile, itinerary }: { profile: number[]; itinerary: Trek["itinerary"] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(...profile);
  const min = Math.min(...profile);
  const range = max - min || 1;
  const w = 320;
  const h = 140;
  const padL = 8;
  const padR = 8;
  const padT = 20;
  const padB = 28;
  const denom = profile.length > 1 ? profile.length - 1 : 1;

  const pts = profile.map((v, i) => ({
    x: padL + (i / denom) * (w - padL - padR),
    y: padT + (1 - (v - min) / range) * (h - padT - padB),
    alt: v,
    day: itinerary[Math.min(i, itinerary.length - 1)],
  }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${line} L ${pts[pts.length - 1].x} ${h - padB} L ${pts[0].x} ${h - padB} Z`;
  const active = hovered !== null ? pts[hovered] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full"
        onMouseLeave={() => setHovered(null)}
        role="img"
        aria-label={`Elevation profile ranging from ${min.toLocaleString()}m to ${max.toLocaleString()}m across ${profile.length} points`}
      >
        <defs>
          <linearGradient id="elevFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((frac) => {
          const y = padT + frac * (h - padT - padB);
          return <line key={frac} x1={padL} y1={y} x2={w - padR} y2={y} stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="4 3" />;
        })}

        {/* Area fill */}
        <path d={area} fill="url(#elevFill)" />

        {/* Line */}
        <path d={line} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Hover vertical line */}
        {active && (
          <line x1={active.x} y1={padT} x2={active.x} y2={h - padB} stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
        )}

        {/* Data points */}
        {pts.map((p, i) => {
          const isHovered = hovered === i;
          return (
            <g key={i}>
              {/* Hover target (invisible larger hitbox) */}
              <circle
                cx={p.x}
                cy={p.y}
                r="14"
                fill="transparent"
                onMouseEnter={() => setHovered(i)}
                className="cursor-pointer"
              />
              {/* Visible dot */}
              <circle
                cx={p.x}
                cy={p.y}
                r={isHovered ? 5 : 3}
                fill={isHovered ? "#10b981" : "white"}
                stroke="#10b981"
                strokeWidth={isHovered ? 2.5 : 2}
                filter={isHovered ? "url(#glow)" : undefined}
                className="pointer-events-none"
              />
              {/* Peak marker (highest point) */}
              {p.alt === max && !isHovered && (
                <circle cx={p.x} cy={p.y} r="6" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.4" className="pointer-events-none" />
              )}
            </g>
          );
        })}

        {/* Min/Max labels */}
        <text x={padL + 2} y={padT - 6} className="fill-emerald-600 text-[8px] font-semibold">
          {max.toLocaleString()}m
        </text>
        <text x={w - padR - 2} y={h - padB + 14} textAnchor="end" className="fill-slate-400 text-[7px]">
          Day {pts[pts.length - 1].day?.day ?? pts.length}
        </text>
        <text x={padL + 2} y={h - padB + 14} className="fill-slate-400 text-[7px]">
          Day {pts[0].day?.day ?? 1}
        </text>
      </svg>

      {/* Tooltip */}
      {active && active.day && (
        <div
          className="absolute z-10 pointer-events-none"
          style={{
            left: `${(active.x / w) * 100}%`,
            top: `${(active.y / h) * 100 - 8}%`,
            transform: `translate(${active.x > w * 0.7 ? "-100%" : "0"}, -100%)`,
          }}
        >
          <div className="bg-primary text-white rounded-xl px-3 py-2 shadow-xl min-w-[140px]">
            <div className="text-[10px] text-white/60 font-medium">Day {active.day.day}</div>
            <div className="text-xs font-semibold leading-tight mt-0.5">{active.day.title}</div>
            <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-white/15">
              <span className="text-[10px] text-emerald-300 font-bold">{active.alt.toLocaleString()}m</span>
              <span className="text-[10px] text-white/50">{active.day.hours}h trek</span>
            </div>
            {/* Tooltip arrow */}
            <div className="absolute -bottom-1.5 left-3 w-3 h-3 bg-primary rotate-45" />
          </div>
        </div>
      )}

      {/* Day labels (first, middle, last) */}
      <div className="flex justify-between text-[10px] text-muted mt-1 px-1">
        <span>Start</span>
        <span className="text-emerald-600 font-semibold">Peak {max.toLocaleString()}m</span>
        <span>End</span>
      </div>
    </div>
  );
}
