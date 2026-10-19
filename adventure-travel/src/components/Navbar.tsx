"use client";

import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/auth";
import { treks, DIFFICULTY_COLORS } from "@/data/treks";
import DesktopSearch from "@/components/DesktopSearch";
import CurrencySwitcher from "@/components/CurrencySwitcher";
import Price from "@/components/Price";
import NoPhoto from "@/components/NoPhoto";

const EASE = [0.16, 1, 0.3, 1] as const;
const WHATSAPP = "https://wa.me/917817912062";

type MenuId = "treks" | "activities" | "account";

const NAV: { label: string; href: string; menu?: MenuId }[] = [
  { label: "Treks", href: "/treks", menu: "treks" },
  { label: "Destinations", href: "/destinations" },
  { label: "Courses", href: "/courses" },
  { label: "Activities", href: "/activities", menu: "activities" },
  { label: "Contact", href: "/contact" },
];

// Shown in the Treks menu: treks with our own photos, so the menu shows real trails.
const MENU_TREK_SLUGS = ["kedarkantha", "valley-of-flowers", "har-ki-dun", "kuari-pass"];
const MENU_TREKS = MENU_TREK_SLUGS.map((s) => treks.find((t) => t.slug === s)).filter((t): t is (typeof treks)[number] => Boolean(t));
const REGION_LINKS = ["Uttarakhand", "Himachal Pradesh"].map((region) => ({
  region,
  count: treks.filter((t) => t.region === region).length,
}));
const DIFFICULTY_LINKS = (["Easy", "Moderate", "Challenging", "Strenuous"] as const).map((difficulty) => ({
  difficulty,
  count: treks.filter((t) => t.difficulty === difficulty).length,
}));

const icon = (d: string) => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

const activities = [
  {
    label: "Trekking",
    href: "/treks",
    description: "Guided Himalayan treks",
    icon: icon("M3 20l6.5-11 4 6.5 2.5-4L21 20H3zM14 6a2 2 0 100-4 2 2 0 000 4z"),
  },
  {
    label: "Skiing & Snowboarding",
    href: "/activities#skiing",
    description: "7-day courses in Auli",
    icon: icon("M4 20l16-6M7 4l4 9M9.5 7.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM13 13l3 3"),
  },
  {
    label: "Camping",
    href: "/activities#camping",
    description: "Riverside & mountain camps",
    icon: icon("M2 20h20M12 4L4 20M12 4l8 16M12 4v16M9.5 20L12 15l2.5 5"),
  },
  {
    label: "Paragliding",
    href: "/activities#paragliding",
    description: "Tandem flights in Bir Billing",
    icon: icon("M3 9c3-4 15-4 18 0M3 9l9 8 9-8M12 17v3M8 9.5l4 7.5M16 9.5l-4 7.5"),
  },
];

const ChevronDown = ({ open }: { open: boolean }) => (
  <svg
    className={`h-3.5 w-3.5 opacity-60 transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.2}
    aria-hidden
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

const ArrowRight = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

const WhatsAppIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.45 9.45 0 01-4.82-1.32l-.35-.2-3.58.94.96-3.49-.23-.36a9.43 9.43 0 01-1.45-5.03C2.56 6.83 6.8 2.6 12.05 2.6a9.4 9.4 0 016.69 2.78 9.4 9.4 0 012.77 6.7c0 5.23-4.25 9.42-9.47 9.42zm8.05-17.48A11.32 11.32 0 0012.04.7C5.77.7.66 5.8.66 12.08c0 2 .52 3.96 1.52 5.69L.57 23.3l5.67-1.49a11.35 11.35 0 005.43 1.38h.01c6.27 0 11.38-5.1 11.38-11.38 0-3.04-1.18-5.9-3.33-8.05z" />
  </svg>
);

/** Fade-and-settle for the desktop menus; a plain fade for reduced motion. */
function MenuPanel({ reduce, className, children, id, label }: { reduce: boolean; className: string; children: ReactNode; id: string; label: string }) {
  return (
    <motion.div
      id={id}
      role="region"
      aria-label={label}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8, filter: "blur(4px)" }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, filter: "blur(2px)" }}
      transition={{ duration: reduce ? 0.12 : 0.22, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Navbar() {
  const { user } = useAuth();
  const router = useRouter();
  const reduce = Boolean(useReducedMotion());
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileActivityOpen, setMobileActivityOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const isAdmin = user?.app_metadata?.role === "admin";
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "";
  const initial = (firstName[0] || "U").toUpperCase();

  const handleLogout = async () => {
    setOpenMenu(null);
    await signOut();
    router.push("/");
  };

  // Hover opens a menu straight away; leaving waits a beat so the pointer can travel
  // from the trigger into the panel without it snapping shut.
  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }, []);
  const openNow = (id: MenuId) => {
    cancelClose();
    setOpenMenu(id);
  };
  const closeSoon = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenMenu(null), 160);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close everything on navigation.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpenMenu(null);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!openMenu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const trigger = document.getElementById(`nav-trigger-${openMenu}`);
      setOpenMenu(null);
      trigger?.focus();
    };
    const onDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [openMenu]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => cancelClose, [cancelClose]);

  const solid = scrolled || openMenu !== null;

  return (
    <>
      <nav
        ref={navRef}
        aria-label="Main"
        onPointerLeave={(e) => e.pointerType === "mouse" && closeSoon()}
        className="fixed inset-x-0 top-0 z-50"
      >
        <div
          className={`relative border-b backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-300 motion-reduce:transition-none ${
            solid ? "border-white/10 bg-[#0B1222]/95 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)]" : "border-white/[0.06] bg-[#0F172A]/80"
          }`}
        >
          <div className={`mx-auto flex max-w-7xl items-center gap-4 px-4 transition-[height] duration-300 motion-reduce:transition-none sm:px-6 lg:px-8 ${scrolled ? "h-16" : "h-[72px]"}`}>
            {/* Brand */}
            <Link href="/" className="group flex shrink-0 items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400" aria-label="Himalayan Arc Adventure — home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/badge.png"
                alt=""
                width={192}
                height={192}
                className={`w-auto rounded-full ring-1 ring-white/15 transition-[height,transform] duration-300 group-hover:scale-[1.03] motion-reduce:transition-none ${scrolled ? "h-10" : "h-11 sm:h-12"}`}
              />
              <span className="hidden flex-col leading-none sm:flex lg:hidden xl:flex">
                <span className="font-nav text-[17px] font-bold tracking-[-0.02em] text-white">Himalayan Arc</span>
                <span className="mt-1 font-nav text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-300/90">Adventure</span>
              </span>
            </Link>

            {/* Desktop links */}
            {/* Not positioned, so the Treks panel spans the whole bar rather than this list. */}
            <ul className="ml-2 hidden items-center lg:flex" onPointerLeave={() => setHovered(null)}>
              {NAV.map((item) => {
                const active = isActive(item.href);
                const open = item.menu ? openMenu === item.menu : false;
                const highlight = hovered === item.label || open;
                const label = (
                  <>
                    {highlight && (
                      <motion.span
                        layoutId={reduce ? undefined : "nav-hover"}
                        transition={{ type: "spring", stiffness: 520, damping: 42 }}
                        className="absolute inset-0 -z-10 rounded-full bg-white/[0.08]"
                        aria-hidden
                      />
                    )}
                    {item.label}
                    {item.menu && <ChevronDown open={open} />}
                    {active && <span aria-hidden className="absolute -bottom-[3px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />}
                  </>
                );
                const linkClass = `relative z-0 flex items-center gap-1.5 rounded-full px-3.5 py-2 font-nav text-[15px] font-medium tracking-[-0.01em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  active || highlight ? "text-white" : "text-white/70"
                }`;
                return (
                  <li
                    key={item.label}
                    onPointerEnter={(e) => {
                      if (e.pointerType !== "mouse") return;
                      setHovered(item.label);
                      if (item.menu) openNow(item.menu);
                      else closeSoon();
                    }}
                    className={item.menu === "activities" ? "relative" : undefined}
                  >
                    {item.menu ? (
                      <button
                        id={`nav-trigger-${item.menu}`}
                        type="button"
                        aria-expanded={open}
                        aria-controls={`nav-menu-${item.menu}`}
                        onClick={() => setOpenMenu(open ? null : item.menu!)}
                        className={linkClass}
                      >
                        {label}
                      </button>
                    ) : (
                      <Link href={item.href} aria-current={active ? "page" : undefined} className={linkClass}>
                        {label}
                      </Link>
                    )}

                    {/* Activities: a compact menu under its own trigger */}
                    {item.menu === "activities" && (
                      <AnimatePresence>
                        {open && (
                          <MenuPanel
                            reduce={reduce}
                            id="nav-menu-activities"
                            label="Activities"
                            className="absolute left-1/2 top-full mt-3 w-[340px] -translate-x-1/2 overflow-hidden rounded-2xl border border-white/10 bg-[#0B1222] p-2 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.75)]"
                          >
                            {activities.map((act) => (
                              <Link
                                key={act.label}
                                href={act.href}
                                onClick={() => setOpenMenu(null)}
                                className="group flex items-center gap-3.5 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.06] focus-visible:bg-white/[0.06] focus-visible:outline-none"
                              >
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300 ring-1 ring-inset ring-emerald-300/15 transition-colors group-hover:bg-emerald-400 group-hover:text-[#0B1222]">
                                  {act.icon}
                                </span>
                                <span className="min-w-0">
                                  <span className="block text-sm font-semibold text-white">{act.label}</span>
                                  <span className="block text-xs text-white/55">{act.description}</span>
                                </span>
                              </Link>
                            ))}
                            <Link
                              href="/activities"
                              onClick={() => setOpenMenu(null)}
                              className="mt-1 flex items-center justify-between rounded-xl border-t border-white/[0.06] px-3 py-3 text-sm font-semibold text-emerald-300 transition-colors hover:bg-white/[0.04]"
                            >
                              All activities
                              <ArrowRight />
                            </Link>
                          </MenuPanel>
                        )}
                      </AnimatePresence>
                    )}

                    {/* Treks: full-width menu built from the trek catalogue */}
                    {item.menu === "treks" && (
                      <AnimatePresence>
                        {open && (
                          <MenuPanel
                            reduce={reduce}
                            id="nav-menu-treks"
                            label="Treks"
                            className="absolute inset-x-0 top-full border-b border-white/10 bg-[#0B1222] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)]"
                          >
                            <div className="mx-auto grid max-w-7xl grid-cols-[220px_1fr] gap-10 px-8 py-8 xl:grid-cols-[240px_1fr]">
                              <div className="space-y-7">
                                <div>
                                  <p className="mb-2.5 font-nav text-xs font-semibold text-white/45">By region</p>
                                  <ul className="space-y-0.5">
                                    {REGION_LINKS.map((r) => (
                                      <li key={r.region}>
                                        <Link
                                          href={`/treks?region=${encodeURIComponent(r.region)}`}
                                          onClick={() => setOpenMenu(null)}
                                          className="-mx-2 flex items-center justify-between rounded-lg px-2 py-1.5 text-[15px] font-medium text-white/85 transition-colors hover:bg-white/[0.06] hover:text-white"
                                        >
                                          {r.region}
                                          <span className="text-xs tabular-nums text-white/40">{r.count}</span>
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <p className="mb-2.5 font-nav text-xs font-semibold text-white/45">By difficulty</p>
                                  <ul className="space-y-0.5">
                                    {DIFFICULTY_LINKS.map((d) => (
                                      <li key={d.difficulty}>
                                        <Link
                                          href={`/treks?difficulty=${d.difficulty}`}
                                          onClick={() => setOpenMenu(null)}
                                          className="-mx-2 flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[15px] font-medium text-white/85 transition-colors hover:bg-white/[0.06] hover:text-white"
                                        >
                                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: DIFFICULTY_COLORS[d.difficulty] }} aria-hidden />
                                          {d.difficulty}
                                          <span className="ml-auto text-xs tabular-nums text-white/40">{d.count}</span>
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>

                              <div>
                                <div className="mb-3 flex items-baseline justify-between">
                                  <p className="font-nav text-xs font-semibold text-white/45">Featured treks</p>
                                  <Link
                                    href="/treks"
                                    onClick={() => setOpenMenu(null)}
                                    className="group/all flex items-center gap-1.5 text-sm font-semibold text-emerald-300 hover:text-emerald-200"
                                  >
                                    All {treks.length} treks
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover/all:translate-x-0.5 motion-reduce:transition-none" />
                                  </Link>
                                </div>
                                <ul className="grid grid-cols-4 gap-4">
                                  {MENU_TREKS.map((t) => (
                                    <li key={t.slug}>
                                      <Link href={`/treks/${t.slug}`} onClick={() => setOpenMenu(null)} className="group/card block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
                                        <span className="relative block aspect-[4/3] overflow-hidden rounded-xl bg-white/5">
                                          {t.image ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                              src={t.image}
                                              alt=""
                                              loading="lazy"
                                              decoding="async"
                                              className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-[1.05] motion-reduce:transition-none"
                                            />
                                          ) : (
                                            <NoPhoto className="h-full w-full" />
                                          )}
                                          <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" aria-hidden />
                                          <span
                                            className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
                                            style={{ backgroundColor: DIFFICULTY_COLORS[t.difficulty] }}
                                          >
                                            {t.difficulty}
                                          </span>
                                        </span>
                                        <span className="mt-2.5 block text-[15px] font-semibold leading-snug text-white group-hover/card:text-emerald-200">{t.name}</span>
                                        <span className="mt-0.5 block text-[13px] text-white/55">
                                          {t.days} days · {t.maxAltitude.toLocaleString("en-IN")} m · from <Price inr={t.price} />
                                        </span>
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                                <a
                                  href={WHATSAPP}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-6 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/75 transition-colors hover:border-emerald-400/30 hover:bg-emerald-400/[0.06] hover:text-white"
                                >
                                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
                                    <WhatsAppIcon />
                                  </span>
                                  <span>
                                    <span className="font-semibold text-white">Not sure which trek suits you?</span> Ask our mountain experts on WhatsApp.
                                  </span>
                                  <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-white/40" />
                                </a>
                              </div>
                            </div>
                          </MenuPanel>
                        )}
                      </AnimatePresence>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Right side */}
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <DesktopSearch />
              <CurrencySwitcher />

              {user ? (
                <div className="relative hidden lg:block" onPointerEnter={(e) => e.pointerType === "mouse" && openNow("account")}>
                  <button
                    id="nav-trigger-account"
                    type="button"
                    aria-expanded={openMenu === "account"}
                    aria-controls="nav-menu-account"
                    onClick={() => setOpenMenu(openMenu === "account" ? null : "account")}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-1 pr-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 font-nav text-sm font-bold text-[#0B1222]">{initial}</span>
                    <span className="max-w-[9rem] truncate">{firstName}</span>
                    <ChevronDown open={openMenu === "account"} />
                  </button>
                  <AnimatePresence>
                    {openMenu === "account" && (
                      <MenuPanel
                        reduce={reduce}
                        id="nav-menu-account"
                        label="Account"
                        className="absolute right-0 top-full mt-3 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#0B1222] p-1.5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.75)]"
                      >
                        <p className="truncate px-3 pb-2 pt-2 text-xs text-white/45">{user.email}</p>
                        <Link href="/dashboard" onClick={() => setOpenMenu(null)} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-white/85 hover:bg-white/[0.06] hover:text-white">
                          My bookings
                        </Link>
                        {isAdmin && (
                          <Link href="/admin/bookings" onClick={() => setOpenMenu(null)} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-white/85 hover:bg-white/[0.06] hover:text-white">
                            Admin
                          </Link>
                        )}
                        <button type="button" onClick={() => void handleLogout()} className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-white/60 hover:bg-white/[0.06] hover:text-white">
                          Log out
                        </button>
                      </MenuPanel>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden items-center gap-1 lg:flex">
                  <Link href="/login" className="whitespace-nowrap rounded-full px-3.5 py-2 font-nav text-[15px] font-medium text-white/75 transition-colors hover:bg-white/[0.06] hover:text-white">
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="whitespace-nowrap rounded-full bg-emerald-500 px-5 py-2.5 font-nav text-[15px] font-semibold text-[#0B1222] shadow-[0_6px_20px_-6px_rgba(16,185,129,0.65)] transition-[background-color,transform,box-shadow] hover:bg-emerald-400 hover:shadow-[0_8px_26px_-6px_rgba(16,185,129,0.8)] active:scale-[0.97] motion-reduce:transition-none"
                  >
                    Sign up
                  </Link>
                </div>
              )}

              {/* Mobile toggle — morphing hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                className="relative z-50 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10 active:scale-95 lg:hidden"
              >
                <span className="relative block h-4 w-5">
                  <motion.span
                    className="absolute left-0 top-0 block h-0.5 w-5 rounded-full bg-white"
                    animate={reduce ? {} : mobileOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                    transition={{ duration: 0.22, ease: EASE }}
                  />
                  <motion.span
                    className="absolute left-0 top-[7px] block h-0.5 w-5 rounded-full bg-white"
                    animate={reduce ? {} : mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                    transition={{ duration: 0.18, ease: EASE }}
                    style={{ transformOrigin: "center" }}
                  />
                  <motion.span
                    className="absolute left-0 top-[14px] block h-0.5 w-5 rounded-full bg-white"
                    animate={reduce ? {} : mobileOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                    transition={{ duration: 0.22, ease: EASE }}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu — spring drawer with stagger */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0.15 : 0.25, ease: EASE }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-[#020617]/60 backdrop-blur-sm lg:hidden"
              aria-hidden
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              initial={reduce ? { opacity: 0 } : { transform: "translateX(100%)" }}
              animate={reduce ? { opacity: 1 } : { transform: "translateX(0%)" }}
              exit={reduce ? { opacity: 0 } : { transform: "translateX(100%)" }}
              transition={reduce ? { duration: 0.15 } : { type: "spring", duration: 0.45, bounce: 0.12 }}
              drag={reduce ? false : "x"}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.x > 80 || info.velocity.x > 300) setMobileOpen(false);
              }}
              className="fixed inset-y-0 right-0 z-40 flex w-[88%] max-w-[380px] flex-col overflow-y-auto bg-[#0B1222] px-5 pb-8 pt-[88px] shadow-2xl shadow-black/50 lg:hidden"
              style={{ willChange: "transform" }}
            >
              <motion.div
                initial="hidden"
                animate="show"
                exit="hidden"
                variants={{ hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : 0.04, delayChildren: reduce ? 0 : 0.06 } } }}
                className="flex flex-col"
              >
                {[{ label: "Home", href: "/" }, ...NAV.filter((n) => n.menu !== "activities" && n.href !== "/contact")].map((link) => (
                  <MobileItem key={link.href} reduce={reduce}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={isActive(link.href) ? "page" : undefined}
                      className={`flex items-center justify-between border-b border-white/10 py-4 font-nav text-[22px] font-semibold tracking-[-0.02em] transition-colors ${
                        isActive(link.href) ? "text-white" : "text-white/85 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        {isActive(link.href) && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" aria-hidden />}
                        {link.label}
                      </span>
                      <svg className="h-4 w-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    {link.href === "/treks" && (
                      <div className="flex flex-wrap gap-2 border-b border-white/10 py-3">
                        {REGION_LINKS.map((r) => (
                          <Link
                            key={r.region}
                            href={`/treks?region=${encodeURIComponent(r.region)}`}
                            onClick={() => setMobileOpen(false)}
                            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm font-medium text-white/80 active:scale-[0.97]"
                          >
                            {r.region}
                          </Link>
                        ))}
                        {DIFFICULTY_LINKS.slice(0, 2).map((d) => (
                          <Link
                            key={d.difficulty}
                            href={`/treks?difficulty=${d.difficulty}`}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm font-medium text-white/80 active:scale-[0.97]"
                          >
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: DIFFICULTY_COLORS[d.difficulty] }} aria-hidden />
                            {d.difficulty}
                          </Link>
                        ))}
                      </div>
                    )}
                  </MobileItem>
                ))}

                {/* Activities — collapsible */}
                <MobileItem reduce={reduce} className="border-b border-white/10 py-1">
                  <button
                    onClick={() => setMobileActivityOpen((v) => !v)}
                    aria-expanded={mobileActivityOpen}
                    className="flex w-full items-center justify-between py-3 text-left"
                  >
                    <span className="font-nav text-[22px] font-semibold tracking-[-0.02em] text-white/85">Activities</span>
                    <motion.span
                      animate={{ rotate: mobileActivityOpen ? 180 : 0 }}
                      transition={{ duration: reduce ? 0 : 0.22, ease: EASE }}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white"
                    >
                      <ChevronDown open={false} />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {mobileActivityOpen && (
                      <motion.div
                        initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                        animate={reduce ? { opacity: 1 } : { opacity: 1, height: "auto" }}
                        exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                        transition={{ duration: reduce ? 0.15 : 0.28, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col gap-1 pb-3">
                          {activities.map((act) => (
                            <Link
                              key={act.label}
                              href={act.href}
                              onClick={() => setMobileOpen(false)}
                              className="flex items-center gap-3 rounded-xl bg-white/[0.04] px-3 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.08] hover:text-white active:scale-[0.98]"
                            >
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">{act.icon}</span>
                              <span className="flex flex-col">
                                <span className="font-semibold">{act.label}</span>
                                <span className="text-xs text-white/50">{act.description}</span>
                              </span>
                            </Link>
                          ))}
                          <Link
                            href="/activities"
                            onClick={() => setMobileOpen(false)}
                            className="mt-1 flex items-center justify-center gap-2 rounded-xl border border-emerald-400/30 px-4 py-3 text-sm font-semibold text-emerald-300 active:scale-[0.98]"
                          >
                            All activities
                            <ArrowRight />
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </MobileItem>

                <MobileItem reduce={reduce}>
                  <Link
                    href="/contact"
                    onClick={() => setMobileOpen(false)}
                    aria-current={isActive("/contact") ? "page" : undefined}
                    className="flex items-center justify-between border-b border-white/10 py-4 font-nav text-[22px] font-semibold tracking-[-0.02em] text-white/85 transition-colors hover:text-white"
                  >
                    Contact
                    <svg className="h-4 w-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </MobileItem>

                <MobileItem reduce={reduce} className="mt-6">
                  <a
                    href={WHATSAPP}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-4 text-base font-semibold text-[#0B1222] shadow-[0_10px_30px_-10px_rgba(16,185,129,0.7)] active:scale-[0.98]"
                  >
                    <WhatsAppIcon className="h-5 w-5" />
                    Talk to our mountain experts
                  </a>
                </MobileItem>

                {user ? (
                  <MobileItem reduce={reduce} className="mt-4 flex flex-col gap-2">
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 font-nav text-sm font-bold text-[#0B1222]">{initial}</span>
                      My bookings
                    </Link>
                    {isAdmin && (
                      <Link href="/admin/bookings" onClick={() => setMobileOpen(false)} className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/80">
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        void handleLogout();
                        setMobileOpen(false);
                      }}
                      className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/60"
                    >
                      Log out
                    </button>
                  </MobileItem>
                ) : (
                  <MobileItem reduce={reduce} className="mt-3 flex gap-3">
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex flex-1 items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3.5 text-sm font-semibold text-white active:scale-[0.98]"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileOpen(false)}
                      className="flex flex-1 items-center justify-center rounded-full bg-white px-5 py-3.5 text-sm font-semibold text-[#0B1222] active:scale-[0.98]"
                    >
                      Sign up
                    </Link>
                  </MobileItem>
                )}

              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function MobileItem({ reduce, className, children }: { reduce: boolean; className?: string; children: ReactNode }) {
  return (
    <motion.div
      variants={{
        hidden: reduce ? { opacity: 0 } : { opacity: 0, transform: "translateY(10px)" },
        show: reduce ? { opacity: 1 } : { opacity: 1, transform: "translateY(0px)" },
      }}
      transition={{ duration: 0.3, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
