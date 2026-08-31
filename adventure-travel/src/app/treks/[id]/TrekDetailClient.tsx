"use client";

import { useState, useEffect, useMemo, useRef, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { Trek } from "@/data/treks";
import ContactPopup from "@/components/ContactPopup";
import TermsConditions from "@/components/TermsConditions";
import { QuickInfoModal, type QuickInfoId } from "@/components/QuickInfoModal";
import SmartImage from "@/components/SmartImage";
import { useAuth } from "@/contexts/AuthContext";
import { createTrekBooking } from "@/lib/auth";
import { getDepartures, type Departure, type Availability, type MonthGroup } from "./trekContent";
import ScrollProgressRing from "@/components/ScrollProgressRing";

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "#22c55e",
  Moderate: "#f59e0b",
  Challenging: "#f97316",
  Strenuous: "#ef4444",
};

const AVAIL: Record<Availability, { color: string; label: string }> = {
  available: { color: "#16A34A", label: "Available" },
  few: { color: "#D97706", label: "Few Seats Left" },
  sold: { color: "#DC2626", label: "Sold Out" },
};

const TABS = ["Overview", "Dates", "Itinerary", "T&C", "Photo Gallery", "What's Included", "Packing List", "Make Reservation"] as const;
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

const INCLUDED = ["Accommodation", "Meals during trek", "Experienced Trek Guide", "National Park Entry Fees", "First Aid Kit", "Camping Equipment"];
const NOT_INCLUDED = ["Flights / Transport", "Travel Insurance", "Personal Trekking Equipment", "Tips for Guide & Porters", "Personal Expenses", "Emergency Evacuation"];

export default function TrekDetailClient({ trek }: { trek: Trek }) {
  const { user } = useAuth();
  const shouldReduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [showContact, setShowContact] = useState(false);
  const [wished, setWished] = useState(false);
  const [shareMsg, setShareMsg] = useState("");
  const [bookingForm, setBookingForm] = useState({
    name: "", email: "", phone: "", date: "", groupSize: "1", message: "",
  });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const departures = useMemo(() => getDepartures(trek), [trek]);

  const goToTab = (tab: Tab) => {
    setActiveTab(tab);
    const idx = TABS.indexOf(tab);
    tabRefs.current[idx]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    document.getElementById("trek-tabpanel")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    try {
      await createTrekBooking({
        user_id: user.id,
        trek_name: trek.name,
        trek_slug: trek.slug,
        trek_date: bookingForm.date,
        group_size: bookingForm.groupSize,
        message: bookingForm.message,
      });
    } catch {
      // Supabase insert failed — still open WhatsApp
    }
    const text = encodeURIComponent(
      `Trek: ${trek.name}\nDate: ${bookingForm.date}\nGroup: ${bookingForm.groupSize}\nName: ${bookingForm.name}\nPhone: ${bookingForm.phone}\nMessage: ${bookingForm.message}`
    );
    window.open(`https://wa.me/917817912062?text=${text}`, "_blank");
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: `${trek.name} — Expedition Happiness Treks`, text: trek.blurb, url });
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
      <div className="bg-gray-50 dark:bg-surface pt-20">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
            <span aria-hidden>/</span>
            <Link href="/treks" className="hover:text-emerald-600 transition-colors">Adventures</Link>
            <span aria-hidden>/</span>
            <span className="text-foreground font-medium">{trek.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero Banner */}
      <section className="relative h-[50vh] min-h-[350px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={trek.image} alt={trek.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        {/* Wishlist & Share */}
        <div className="absolute top-6 right-6 flex items-center gap-3">
          {shareMsg && (
            <motion.span
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-800 shadow"
              role="status"
            >
              {shareMsg}
            </motion.span>
          )}
          <button
            onClick={() => setWished((w) => !w)}
            aria-pressed={wished}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <svg className={`w-5 h-5 transition-transform ${wished ? "scale-110 text-red-400" : ""}`} fill={wished ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>
          <button
            onClick={handleShare}
            aria-label="Share this trek"
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
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
            <p className="flex items-center gap-2 text-white/80">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {trek.location || trek.region}
            </p>
          </div>
        </div>
      </section>

      {/* Trek Statistics Cards */}
      <section className="bg-white dark:bg-background border-b border-gray-100 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon="clock" label="Duration" value={`${trek.days} Days`} />
            <StatCard icon="mountain" label="Max Elevation" value={`${trek.maxAltitude}m`} sub={`${Math.round(trek.maxAltitude * 3.28084)} ft`} />
            <StatCard icon="people" label="Group Size" value={`${trek.groupSize || 15}`} />
            <StatCard icon="calendar" label="Best Season" value={trek.bestSeason} />
          </div>
        </div>
      </section>

      {/* Main Content + Sticky Sidebar */}
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-28 lg:pb-8">
        {/* Full-width sticky tab bar — sticks against the whole page, stays visible past the Trek Cost card */}
        <div className="sticky top-16 z-30 -mx-6 mb-8 bg-white/95 dark:bg-background/95 backdrop-blur-md border-b border-gray-200 dark:border-white/10 sm:mx-0 sm:rounded-2xl sm:rounded-b-none sm:border-x sm:border-t sm:rounded-t-2xl">
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
                  aria-controls="trek-tabpanel"
                  tabIndex={activeTab === tab ? 0 : -1}
                  onClick={() => goToTab(tab)}
                  onKeyDown={(e) => onTabKeyDown(e, index)}
                  className={`relative px-3.5 py-3.5 text-xs sm:px-5 sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                    activeTab === tab ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  {tab}
                  {activeTab === tab &&
                    (shouldReduceMotion ? (
                      <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                    ) : (
                      <motion.span
                        layoutId="trek-tab-underline"
                        transition={{ type: "spring", damping: 32, stiffness: 350 }}
                        className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-emerald-600 dark:bg-emerald-400"
                      />
                    ))}
                </button>
              ))}
            </div>
          </div>
          {/* Mobile scroll hint */}
          <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-gradient-to-l from-white/95 via-white/70 to-transparent pl-6 pr-3 py-2 rounded-l-xl md:hidden dark:from-background/95 dark:via-background/70">
            <span className="text-[11px] font-medium text-emerald-600">Scroll</span>
            <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Tab Content */}
          <div className="lg:w-2/3">
            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                id="trek-tabpanel"
                role="tabpanel"
                aria-labelledby={`trek-tab-${TABS.indexOf(activeTab)}`}
                tabIndex={0}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="scroll-mt-36 focus:outline-none"
              >
                {activeTab === "Overview" && <OverviewTab trek={trek} />}
                {activeTab === "Dates" && <DatesTab departures={departures} currency={trek.currency} onRegister={registerForDate} />}
                {activeTab === "Itinerary" && <ItineraryTab trek={trek} />}
                {activeTab === "T&C" && <TermsConditions />}
                {activeTab === "Photo Gallery" && <GalleryTab trek={trek} />}
                {activeTab === "What's Included" && <IncludedTab />}
                {activeTab === "Packing List" && <PackingListTab />}
                {activeTab === "Make Reservation" && (
                  <ReservationTab trek={trek} form={bookingForm} setForm={setBookingForm} onSubmit={handleBookingSubmit} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Sticky Sidebar */}
          <div className="lg:w-1/3">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Booking Card */}
              <BookingCard
                trek={trek}
                departures={departures}
                onViewDates={() => goToTab("Dates")}
                onContact={() => setShowContact(true)}
                onNav={(tab) => goToTab(tab)}
              />

              {/* Elevation Profile Mini */}
              <div className="bg-white dark:bg-card rounded-2xl border border-gray-200 dark:border-white/10 p-5">
                <h4 className="font-semibold text-foreground mb-3 text-sm">Elevation Profile</h4>
                <MiniElevationChart profile={trek.elevationProfile} itinerary={trek.itinerary} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed mobile details band */}
      <div
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-background/95 backdrop-blur border-t border-gray-200 dark:border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex-shrink-0 leading-tight">
            <div className="text-[11px] leading-none text-muted mb-0.5">From</div>
            <div className="text-base sm:text-lg font-bold leading-none text-foreground">{trek.currency}{trek.price.toLocaleString("en-IN")}</div>
          </div>
          <button
            onClick={() => setShowContact(true)}
            className="flex-shrink-0 self-center rounded-lg border border-emerald-600/40 bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-700 active:scale-95 transition"
          >
            Info
          </button>
          <button
            onClick={() => goToTab("Dates")}
            className="flex-1 self-center truncate rounded-lg bg-emerald-600 px-3 py-2.5 text-sm font-bold text-white shadow-md active:scale-95 transition"
          >
            View Dates &amp; Register →
          </button>
        </div>
      </div>

      <ContactPopup open={showContact} onClose={() => setShowContact(false)} />

      <ScrollProgressRing className="bottom-28 right-4 lg:bottom-8 lg:right-6" />
    </div>
  );
}

/* ─── Booking / Cost Breakup Card ─── */
function BookingCard({
  trek,
  departures,
  onViewDates,
  onContact,
  onNav,
}: {
  trek: Trek;
  departures: MonthGroup[];
  onViewDates: () => void;
  onContact: () => void;
  onNav: (tab: Tab) => void;
}) {
  const oldPrice = Math.round((trek.price / 0.9) / 10) * 10;
  const discount = Math.round((1 - trek.price / oldPrice) * 100);
  const rating = trek.rating ?? 4.8;
  const reviews = trek.reviewCount ?? 692;
  const shownDepartures = departures.flatMap((g) => g.departures).filter((d) => d.availability !== "sold").slice(0, 3);
  const [showIncludedInfo, setShowIncludedInfo] = useState<QuickInfoId | null>(null);

  const badge =
    shownDepartures.length === 0
      ? { label: "Join Waitlist", cls: "bg-slate-600" }
      : shownDepartures.some((d) => d.availability === "few")
        ? { label: "Filling Fast", cls: "bg-amber-500" }
        : { label: "Dates Open", cls: "bg-emerald-600" };

  const INCLUDED_UI = [
    { icon: "tent", label: "Twin Sharing Tent Accommodation", info: "inc-tent" as QuickInfoId },
    { icon: "card", label: "All Permits & Entry Fees", info: "inc-permits" as QuickInfoId },
    { icon: "med", label: "Daily Medical & Safety Check-ups", info: "inc-medical" as QuickInfoId },
    { icon: "meal", label: "Freshly Cooked Meals on Trail", info: "inc-meals" as QuickInfoId },
  ];

  const icon = (name: string, cls: string) => {
    const base = { className: `text-emerald-500 shrink-0 ${cls}` };
    switch (name) {
      case "tent":
        return <svg {...base} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5M4.5 22.5L12 6l7.5 16.5M8.25 14.25l3.75-6 3.75 6M12 6V3.75" /></svg>;
      case "card":
        return <svg {...base} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>;
      case "med":
        return <svg {...base} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>;
      case "meal":
        return <svg {...base} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 3.75v12.75M15.75 3.75a3.75 3.75 0 00-3.75 3.75v6h3.75M9.75 3.75v22.5" /></svg>;
      case "taxi":
        return <svg {...base} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M6 11.25L7.5 6h9l1.5 5.25M6 11.25h12M6 11.25a2.25 2.25 0 00-2.25 2.25v3a0.75 0 001.5 0v-3m14.25 0a0.75 0 001.5 0v3a2.25 2.25 0 01-2.25 2.25M6 11.25v7.5m12 3v-7.5" /></svg>;
      case "backpack":
        return <svg {...base} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M16 8V6a4 4 0 10-8 0v2M8 8h8M6 8h12a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2v-9a2 2 0 012-2zM9 20v-5h6v5" /></svg>;
      case "bed":
        return <svg {...base} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 3v18M21 6a2 2 0 00-2-2H9a2 2 0 00-2 2v8h14V6zM3 12h18M3 18h18" /></svg>;
      case "star":
        return <svg {...base} width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden><path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.4 4.32a1 1 0 00.95.69h4.56c.97 0 1.37 1.24.59 1.81l-3.69 2.68a1 1 0 00-.36 1.12l1.4 4.32c.3.92-.75 1.69-1.54 1.12l-3.68-2.68a1 1 0 00-1.18 0l-3.68 2.68c-.79.57-1.85-.2-1.55-1.12l1.4-4.32a1 1 0 00-.36-1.12L2 9.75c-.78-.57-.38-1.81.6-1.81h4.55a1 1 0 00.95-.69l1.4-4.32z" /></svg>;
      default:
        return null;
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-500 bg-white p-4 shadow-lg sm:p-5 dark:bg-card">
      <div className="pointer-events-none absolute left-0 top-0 h-[180px] w-full opacity-70 blur-[58px]" style={{ transform: "translate(100px,-40px)" }} aria-hidden />
      <div className="sr-only">Trek cost details</div>

      {/* Header */}
      <div className="relative z-10 flex items-start justify-between gap-3">
        <h4 className="text-3xl font-semibold text-foreground">Trek Cost</h4>
        <span className={`rounded-full ${badge.cls} px-2.5 py-1 text-[10px] font-bold text-white`}>{badge.label}</span>
      </div>

      {/* Price */}
      <div className="relative z-10 mt-2">
        <div className="flex items-baseline gap-2">
          <span className="text-md font-semibold text-slate-500 line-through decoration-2 decoration-rose-500/80">
            {trek.currency}{oldPrice.toLocaleString("en-IN")}
          </span>
          <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-600">{discount}% OFF</span>
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-4xl font-bold tracking-tight text-foreground">{trek.currency}{trek.price.toLocaleString("en-IN")}</span>
          <span className="text-sm text-muted">/ person</span>
        </div>
      </div>

      {/* Trust + rating */}
      <div className="relative z-10 mt-4 space-y-2">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
          <span className="flex" aria-hidden>{[...Array(5)].map((_, i) => <span key={i}>{icon("star", "h-4 w-4 text-amber-400")}</span>)}</span>
          <span>{rating}</span>
          <span className="font-medium text-muted">· {reviews >= 1000 ? `${(reviews / 1000).toFixed(1)}k+` : `${reviews}+`} people rated this trek</span>
        </p>
        <p className="text-xs text-muted">All-inclusive · No-cost EMI · Free Trek Date Change</p>
      </div>

      {/* Included */}
      <div className="relative z-10 mt-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">What&apos;s Included</p>
        <ul className="space-y-2.5">
          {INCLUDED_UI.map((item) => (
            <li key={item.label} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-100 dark:bg-emerald-500/10 dark:ring-emerald-500/20">
                {icon(item.icon, "h-5 w-5")}
              </span>
              <span className="flex-1 break-words">{item.label}</span>
              <button
                onClick={() => setShowIncludedInfo(item.info)}
                aria-label={`More about ${item.label}`}
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-emerald-600 transition-colors hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
              >
                <svg className="h-4.5 w-4.5" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
        {showIncludedInfo && (
          <QuickInfoModal
            id={showIncludedInfo}
            label={INCLUDED_UI.find((i) => i.info === showIncludedInfo)?.label ?? "Included"}
            trek={trek}
            onClose={() => setShowIncludedInfo(null)}
          />
        )}
        <button
          onClick={onViewDates}
          className="mt-4 w-full rounded-xl border border-gray-200 bg-white py-3 text-center font-bold text-foreground shadow-sm transition-colors hover:border-emerald-300 hover:bg-emerald-50 dark:bg-card dark:hover:bg-emerald-950/30"
        >
          View full package &amp; dates
        </button>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => onNav("Packing List")}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-300 dark:hover:bg-emerald-950/50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Package List
          </button>
          <button
            onClick={() => onNav("T&C")}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-bold text-foreground transition-colors hover:border-emerald-300 hover:bg-emerald-50 dark:bg-card dark:hover:bg-emerald-950/30"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            Terms &amp; Conditions
          </button>
        </div>
      </div>

      <div className="my-6 h-px w-full bg-gray-200 dark:bg-white/10" />

      {/* Optional extras */}
      <div className="relative z-10 mt-5 rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 p-4 dark:border-white/10 dark:bg-white/5">
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-muted">Optional</p>
        <ul className="space-y-2.5">
          <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-50 ring-1 ring-gray-100 dark:bg-white/5 dark:ring-white/10">
              {icon("backpack", "h-5 w-5")}
            </span>
            <span>
              Backpack Offloading — <span className="font-bold text-foreground">avail on request, extra cost</span>
            </span>
          </li>
          <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-50 ring-1 ring-gray-100 dark:bg-white/5 dark:ring-white/10">
              {icon("bed", "h-5 w-5")}
            </span>
            <span>
              Single Tent / Hotel Room Occupancy — <span className="font-bold text-foreground">on request, extra cost</span>
            </span>
          </li>
        </ul>
      </div>

      {/* Trust row */}
      <div className="relative z-10 mt-4 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 text-[13px] font-semibold leading-snug text-slate-500 dark:border-white/10 dark:text-gray-400">
        <div className="flex items-start gap-2">
          <span aria-hidden>🔒</span>
          <span>Secure payment</span>
        </div>
        <div className="flex items-start gap-2">
          <span aria-hidden className="text-emerald-600">✓</span>
          <span>Book by paying only 30% advance</span>
        </div>
      </div>

      {/* Call experts */}
      <div className="relative z-10 mt-5 rounded-2xl bg-orange-50 p-3 text-center dark:bg-orange-950/20">
        <p className="w-full rounded-2xl bg-orange-100 p-2 text-lg font-semibold text-foreground shadow-lg dark:bg-orange-900/30">
          Call Our Mountain Experts!
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[13px] text-gray-800 dark:text-gray-200">
          <a href="tel:+917817912062" className="font-semibold hover:underline">+91 78179 12062</a>
          <span className="h-4 w-px bg-black/50 dark:bg-white/30" aria-hidden />
          <a href="tel:+918650561564" className="font-semibold hover:underline">+91 86505 61564</a>
        </div>
      </div>

      {/* CTA */}
      <div className="relative z-10 mt-4 space-y-2">
        <button
          onClick={onViewDates}
          className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          View All Dates &amp; Register
        </button>
        <button
          onClick={onContact}
          className="w-full rounded-xl border-2 border-emerald-600 py-3 font-semibold text-emerald-600 transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
        >
          Request Information
        </button>
      </div>
    </div>
  );
}

/* ─── Stat Card ─── */
function StatCard({ icon, label, value, sub }: { icon: string; label: string; value: string; sub?: string }) {
  const icons: Record<string, ReactNode> = {
    clock: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    mountain: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
    people: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
    calendar: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>,
  };
  return (
    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-surface rounded-xl">
      <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
        {icons[icon]}
      </div>
      <div>
        <div className="font-bold text-foreground text-sm">{value}</div>
        <div className="text-xs text-muted">{label}</div>
        {sub && <div className="text-[10px] text-muted">{sub}</div>}
      </div>
    </div>
  );
}

/* ─── Overview Tab ─── */
/* ─── Quick Info strip (IndiaHikes-style) ─── */
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
  const [openModal, setOpenModal] = useState<QuickInfoId | null>(null);

  const items: { id: QuickInfoId; label: string; value: string; color?: string; icon: ReactNode }[] = [
    {
      id: "difficulty",
      label: "Trek Difficulty",
      value: trek.difficulty,
      color: DIFFICULTY_COLORS[trek.difficulty],
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M2 20h.01M7 20v-4M12 20v-8M17 20V8M22 4v16" />
        </svg>
      ),
    },
    {
      id: "duration",
      label: "Trek Duration",
      value: `${trek.days} Days · ${totalHours}h Trekking`,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      ),
    },
    {
      id: "altitude",
      label: "Highest Altitude",
      value: `${trek.maxAltitude.toLocaleString("en-IN")} m (${ft.toLocaleString("en-IN")} ft)`,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M8 3l4 8 5-5 5 15H2L8 3z" />
        </svg>
      ),
    },
    {
      id: "season",
      label: "Best Season",
      value: trek.bestSeason,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ),
    },
    {
      id: "group",
      label: "Group Size",
      value: trek.groupSize ? `Max ${trek.groupSize} Trekkers` : "Small Groups",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.128 9.128 0 002.625-.372M12 15a3 3 0 110-6 3 3 0 010 6zm6.874 4.124A5.998 5.998 0 0018.714 15m-1.028-6.418a5.99 5.99 0 00-1.929-.5M15 6.128a5.998 5.998 0 00-7.462 2.04M6.002 15.9a5.998 5.998 0 00-1.929.5" />
        </svg>
      ),
    },
    {
      id: "basecamp",
      label: "Basecamp",
      value: trek.location ?? trek.region,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
      ),
    },
    {
      id: "age",
      label: "Suitable For",
      value: AGE_BY_DIFFICULTY[trek.difficulty],
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
    },
    {
      id: "accommodation",
      label: "Accommodation",
      value: "Tents & Mountain Lodges",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 20L12 4l8 16H4zM12 4v6" />
        </svg>
      ),
    },
    {
      id: "fitness",
      label: "Fitness Criteria",
      value: FITNESS_BY_DIFFICULTY[trek.difficulty],
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
      ),
    },
    {
      id: "offloading",
      label: "Offloading",
      value: "Available",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 8l-9-5-9 5v8l9 5 9-5V8zM3 8l9 5 9-5M12 13v8" />
        </svg>
      ),
    },
    {
      id: "cloakroom",
      label: "Cloakroom",
      value: "Available at Basecamp",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 5.25h4a1 1 0 011 1v1h-6v-1a1 1 0 011-1zm-6.25 2.25h16.5" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setOpenModal(item.id)}
            className="group rounded-xl border border-gray-100 bg-white p-4 text-left transition-all hover:border-emerald-300 hover:shadow-md active:scale-[0.98] dark:border-white/10 dark:bg-card dark:hover:border-emerald-700"
          >
            <div className="flex items-start justify-between">
              <div
                className="mb-2 flex h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: `${item.color ?? "#10b981"}1a`, color: item.color ?? "#10b981" }}
              >
                {item.icon}
              </div>
              <svg
                className="mt-1 h-3.5 w-3.5 text-muted opacity-40 transition-all group-hover:translate-x-0.5 group-hover:text-emerald-600 group-hover:opacity-100"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted">{item.label}</h4>
            <p className="mt-0.5 text-sm font-bold leading-snug text-foreground">{item.value}</p>
            <span className="mt-1 block text-[10px] font-medium text-emerald-600 opacity-0 transition-opacity group-hover:opacity-100">
              Know more
            </span>
          </button>
        ))}
      </div>
      {openModal && (
        <QuickInfoModal
          id={openModal}
          label={items.find((i) => i.id === openModal)?.label ?? ""}
          trek={trek}
          onClose={() => setOpenModal(null)}
        />
      )}
    </div>
  );
}

function OverviewTab({ trek }: { trek: Trek }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Key Facts</h2>

      {/* About This Trek */}
      <div className="mb-6 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm dark:border-emerald-800/30 dark:bg-card">
        <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
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
function DatesTab({
  departures,
  currency,
  onRegister,
}: {
  departures: MonthGroup[];
  currency: string;
  onRegister: (iso: string) => void;
}) {
  const [open, setOpen] = useState<string | null>(departures[0]?.key ?? null);
  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Select a Date to Register</h2>
      <p className="text-muted mb-6">Live availability for upcoming departures — pick a batch and reserve your spot.</p>

      {/* Availability legend */}
      <div className="flex flex-wrap items-center gap-4 mb-5 text-xs">
        {(Object.keys(AVAIL) as Availability[]).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5 text-muted">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: AVAIL[k].color }} />
            {AVAIL[k].label}
          </span>
        ))}
      </div>

      <div className="space-y-3">
        {departures.map((m) => {
          const isOpen = open === m.key;
          return (
            <div key={m.key} className="rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden bg-white dark:bg-card">
              <button
                onClick={() => setOpen(isOpen ? null : m.key)}
                aria-expanded={isOpen}
                aria-controls={`month-${m.key}`}
                className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold text-foreground">{m.month} {m.year}</span>
                  {m.note && <span className="text-xs text-muted truncate hidden sm:inline">{m.note}</span>}
                </span>
                <svg className={`w-5 h-5 text-muted flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`month-${m.key}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-1 space-y-2.5 border-t border-gray-100 dark:border-white/5">
                      {m.departures.map((d) => (
                        <DepartureRow key={d.id} d={d} currency={currency} onRegister={onRegister} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DepartureRow({ d, currency, onRegister }: { d: Departure; currency: string; onRegister: (iso: string) => void }) {
  const a = AVAIL[d.availability];
  const sold = d.availability === "sold";
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg bg-gray-50 dark:bg-surface p-3">
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-foreground text-sm">{d.label}</div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted mt-1">
          <span>{d.days} Days</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: a.color }} />
            <span style={{ color: a.color }} className="font-medium">{a.label}</span>
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between sm:justify-end gap-3">
        <div className="text-right">
          <div className="font-bold text-foreground text-sm">{currency}{d.price.toLocaleString("en-IN")}</div>
          <div className="text-[11px] text-muted">/ person</div>
        </div>
        <button
          disabled={sold}
          onClick={() => onRegister(d.iso)}
          aria-label={sold ? `${d.label} sold out` : `Register for ${d.label}`}
          className={`rounded-full px-4 py-2 text-sm font-bold transition active:scale-95 ${
            sold ? "bg-gray-200 dark:bg-white/10 text-gray-400 cursor-not-allowed" : "bg-emerald-600 text-white hover:bg-emerald-700"
          }`}
        >
          {sold ? "Sold Out" : "Register"}
        </button>
      </div>
    </div>
  );
}

/* ─── Day by Day Tab ─── */
function ItineraryTab({ trek }: { trek: Trek }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Day-by-Day Itinerary</h2>
      <div className="space-y-4">
        {trek.itinerary.map((day) => (
          <div key={day.day} className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-white/10 p-5 hover:border-emerald-200 dark:hover:border-emerald-700 hover:shadow-md transition-all">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-11 h-11 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                {day.day}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground">{day.title}</h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted mt-1.5 mb-2">
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                    {day.altitude.toLocaleString()}m
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {day.hours} hrs
                  </span>
                </div>
                <p className="text-muted text-sm leading-relaxed">{day.description}</p>
                {day.note && (
                  <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-bold leading-relaxed text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Photo Gallery Tab (with lightbox) ─── */
function GalleryTab({ trek }: { trek: Trek }) {
  const trekGallery = TREK_GALLERIES[trek.slug];
  const images = trekGallery || [trek.image, ...GALLERY_IMAGES.slice(0, 7)];
  const [lightbox, setLightbox] = useState<number | null>(null);

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

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Photo Gallery</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setLightbox(i)}
            aria-label={`View photo ${i + 1} of ${images.length}`}
            className="relative aspect-[4/3] rounded-xl overflow-hidden group cursor-pointer"
          >
            {/\.(mp4|mov)$/i.test(img) ? (
              <video src={img} muted className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <SmartImage src={img} alt={`${trek.name} — photo ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              {/\.(mp4|mov)$/i.test(img) ? (
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

      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
            role="dialog"
            aria-modal="true"
            aria-label={`${trek.name} photo viewer`}
          >
            <button
              onClick={() => setLightbox(null)}
              aria-label="Close photo viewer"
              className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox((i) => (i === null ? i : (i - 1 + images.length) % images.length)); }}
              aria-label="Previous photo"
              className="absolute left-2 sm:left-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            {/\.(mp4|mov)$/i.test(images[lightbox]) ? (
              <motion.div
                key={lightbox}
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="max-h-[85vh] max-w-[92vw]"
              >
                <video
                  src={images[lightbox]}
                  controls
                  autoPlay
                  muted
                  playsInline
                  preload="metadata"
                  className="max-h-[85vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
                />
              </motion.div>
            ) : (
              <motion.img
                key={lightbox}
                src={images[lightbox]}
                alt={`${trek.name} — photo ${lightbox + 1}`}
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="max-h-[85vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
              />
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox((i) => (i === null ? i : (i + 1) % images.length)); }}
              aria-label="Next photo"
              className="absolute right-2 sm:right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/80">
              {lightbox + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── What's Included Tab ─── */
function IncludedTab() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">What&apos;s Included</h2>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-bold text-emerald-600 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Included
          </h3>
          <ul className="space-y-3">
            {INCLUDED.map((item) => (
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
          <h3 className="text-lg font-bold text-red-500 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Not Included
          </h3>
          <ul className="space-y-3">
            {NOT_INCLUDED.map((item) => (
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
      <h2 className="text-2xl font-bold text-foreground mb-3">Packing List</h2>
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
          <div key={c.t} className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 dark:border-emerald-800/30 dark:bg-emerald-950/20">
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{c.t}</p>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">{c.d}</p>
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
            <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10">
              <ul className="divide-y divide-gray-100 dark:divide-white/10">
                {group.items.map((item) => (
                  <li key={item.name} className="flex items-start gap-3 bg-white px-4 py-3.5 dark:bg-card">
                    <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground">{item.name}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted">{item.why}</p>
                      {item.pro && (
                        <p className="mt-1.5 inline-flex rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
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

      <div className="mt-10 rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-white/10 dark:bg-card">
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
  trek, form, setForm, onSubmit,
}: {
  trek: Trek;
  form: { name: string; email: string; phone: string; date: string; groupSize: string; message: string };
  setForm: (f: typeof form) => void;
  onSubmit: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [minDate, setMinDate] = useState("");

  // Set the date floor client-side only, to avoid a hydration mismatch at midnight.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMinDate(new Date().toISOString().slice(0, 10)), []);

  const update = (key: keyof typeof form, value: string) => {
    setForm({ ...form, [key]: value });
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Enter a valid email address.";
    if (form.phone.replace(/\D/g, "").length < 7) next.phone = "Enter a valid phone number.";
    if (!form.date) next.date = "Pick a preferred date.";
    else if (minDate && form.date < minDate) next.date = "Choose a date in the future.";
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

  if (sent) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Reservation Request Sent!</h3>
        <p className="text-muted max-w-sm mx-auto">
          Thanks{form.name ? `, ${form.name.split(" ")[0]}` : ""} — our team will confirm availability for {trek.name} within 24 hours.
        </p>
        <button onClick={() => setSent(false)} className="mt-4 text-emerald-600 font-semibold hover:underline">
          Make another request
        </button>
      </motion.div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Make a Reservation</h2>
      <p className="text-muted mb-6">Fill out the form below and we&apos;ll get back to you within 24 hours.</p>
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="grid md:grid-cols-2 gap-5">
          <Input id="res-name" label="Full Name" value={form.name} onChange={(v) => update("name", v)} required error={errors.name} autoComplete="name" />
          <Input id="res-email" label="Email" type="email" value={form.email} onChange={(v) => update("email", v)} required error={errors.email} autoComplete="email" />
          <Input id="res-phone" label="Phone Number" type="tel" value={form.phone} onChange={(v) => update("phone", v)} required error={errors.phone} autoComplete="tel" />
          <Input id="res-date" label="Preferred Date" type="date" value={form.date} onChange={(v) => update("date", v)} required min={minDate || undefined} error={errors.date} />
        </div>
        <div>
          <label htmlFor="res-group" className="block text-sm font-medium text-muted mb-1.5">Group Size</label>
          <select
            id="res-group"
            value={form.groupSize}
            onChange={(e) => update("groupSize", e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? "Person" : "Persons"}</option>
            ))}
            <option value="10+">10+ Persons (Group)</option>
          </select>
        </div>
        <div>
          <label htmlFor="res-message" className="block text-sm font-medium text-muted mb-1.5">Additional Message</label>
          <textarea
            id="res-message"
            rows={4}
            value={form.message}
            onChange={(e) => update("message", e.target.value)}
            placeholder="Custom requests, dietary needs, transport questions..."
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Sending…
            </>
          ) : (
            "Send Reservation Request"
          )}
        </button>
      </form>
    </div>
  );
}

function Input({ label, id, type = "text", value, onChange, required, min, error, placeholder, autoComplete }: {
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
      <label htmlFor={id} className="block text-sm font-medium text-muted mb-1.5">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        min={min}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-colors focus:ring-2 focus:ring-emerald-500 ${
          error ? "border-red-400 focus:border-red-400" : "border-gray-300 dark:border-white/10 focus:border-emerald-500"
        }`}
      />
      {error && <p id={`${id}-err`} className="mt-1 text-xs text-red-500">{error}</p>}
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
                className="pointer-events-none transition-all duration-200"
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
        <text x={w - padR - 2} y={h - padB + 14} textAnchor="end" className="fill-gray-400 text-[7px]">
          Day {pts.length}
        </text>
        <text x={padL + 2} y={h - padB + 14} className="fill-gray-400 text-[7px]">
          Day 1
        </text>
      </svg>

      {/* Tooltip */}
      {active && active.day && (
        <div
          className="absolute z-10 pointer-events-none transition-all duration-200"
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
