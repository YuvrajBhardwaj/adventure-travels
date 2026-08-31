"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/auth";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "🏔️ Adventures", href: "/treks" },
  { label: "Destinations", href: "/destinations" },
  { label: "⛷️ Courses", href: "/courses" },
];

const activities = [
  {
    label: "Trekking",
    href: "/treks",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    description: "Himalayan trekking expeditions",
  },
  {
    label: "⛷️ Skiing & 🏂 Snowboarding",
    href: "/activities#skiing",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    description: "7-day courses in Auli",
  },
  {
    label: "Camping",
    href: "/activities#camping",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    description: "Riverside & mountain camps",
  },
  {
    label: "Paragliding",
    href: "/activities#paragliding",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.115 5.19l.319 1.913A6 6 0 008.11 10.36L9.75 12l-.387.775c-.217.433-.132.956.21 1.298l1.348 1.348c.21.21.329.497.329.795v1.089c0 .426.24.815.622 1.006l.153.076c.433.217.956.132 1.298-.21l.723-.723a8.7 8.7 0 002.288-4.042 1.087 1.087 0 00-.358-1.099l-1.33-1.108c-.251-.21-.582-.299-.905-.245l-1.17.195a1.125 1.125 0 01-.98-.314l-.295-.295a1.125 1.125 0 010-1.591l.13-.132a1.125 1.125 0 011.3-.21l.603.302a.809.809 0 001.086-1.086L14.25 7.5l1.256-.837a4.5 4.5 0 001.528-1.732l.146-.292M6.115 5.19A9 9 0 1017.18 4.64M6.115 5.19A8.965 8.965 0 0112 3c1.929 0 3.72.608 5.18 1.64" />
      </svg>
    ),
    description: "Tandem flights in Bir Billing",
  },
];

export default function Navbar() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [mobileActivityOpen, setMobileActivityOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const handleLogout = async () => { await signOut(); router.push("/"); };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActivityOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileOpen]);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 backdrop-blur-xl border-b ${
          scrolled ? "bg-[#0F172A]/95 border-white/10 shadow-lg shadow-black/20" : "bg-[#0F172A]/90 border-white/5"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between transition-all duration-500 ${scrolled ? "h-16" : "h-20"}`}>
            <Link href="/" className="flex items-center gap-3 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo.png" alt="Expedition Happiness Treks" width={40} height={40} className="h-10 w-10 rounded-full object-cover bg-white shadow-md shadow-black/20 transition-transform group-hover:scale-[1.02]" />
              <span className="flex flex-col leading-none">
                <span className="font-display text-[10px] font-bold uppercase tracking-[0.22em] text-white/60">Expedition</span>
                <span className="font-display text-lg sm:text-[22px] font-[800] tracking-[-0.02em] text-white">Happiness Treks</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`font-nav relative px-4 py-2 text-[13px] font-semibold uppercase tracking-[0.08em] transition-colors group ${
                    isActive(link.href) ? "text-white" : "text-white/70 hover:text-white"
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute bottom-0 h-0.5 bg-cyan-400 transition-all duration-300 ${
                      isActive(link.href)
                        ? "left-4 w-[calc(100%-2rem)]"
                        : "left-1/2 w-0 group-hover:left-4 group-hover:w-[calc(100%-2rem)]"
                    }`}
                  />
                </Link>
              ))}

              {/* Activities Dropdown */}
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setActivityOpen(!activityOpen)}
                  aria-expanded={activityOpen}
                  aria-haspopup="true"
                  className={`font-nav relative flex items-center gap-1 px-4 py-2 text-[13px] font-semibold uppercase tracking-[0.08em] transition-colors group ${
                    isActive("/activities") ? "text-white" : "text-white/70 hover:text-white"
                  }`}
                >
                  Activities
                  <svg
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${activityOpen ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-0 bg-cyan-400 transition-all duration-300 group-hover:left-4 group-hover:w-[calc(100%-2rem)]" />
                </button>

                {activityOpen && (
                  <div className="absolute top-full left-0 mt-2 w-80 rounded-2xl bg-white shadow-2xl shadow-black/10 border border-gray-100 py-2 overflow-hidden">
                    {activities.map((act) => (
                      <Link
                        key={act.label}
                        href={act.href}
                        onClick={() => setActivityOpen(false)}
                        className="flex items-center gap-4 px-5 py-3 hover:bg-cyan-50 transition-colors group"
                      >
                        <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                          {act.icon}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-primary group-hover:text-cyan-500 transition-colors">{act.label}</p>
                          <p className="text-xs text-muted">{act.description}</p>
                        </div>
                      </Link>
                    ))}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <Link
                        href="/activities"
                        onClick={() => setActivityOpen(false)}
                        className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-cyan-500 hover:bg-cyan-50 transition-colors"
                      >
                        View All Activities
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/contact"
                aria-current={isActive("/contact") ? "page" : undefined}
                className={`font-nav relative px-4 py-2 text-[13px] font-semibold uppercase tracking-[0.08em] transition-colors group ${
                  isActive("/contact") ? "text-white" : "text-white/70 hover:text-white"
                }`}
              >
                Contact
<span
                    className={`absolute bottom-0 h-0.5 bg-cyan-400 transition-all duration-300 ${
                      isActive("/contact")
                        ? "left-4 w-[calc(100%-2rem)]"
                        : "left-1/2 w-0 group-hover:left-4 group-hover:w-[calc(100%-2rem)]"
                    }`}
                  />
              </Link>
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  <Link href="/dashboard" className="font-nav text-[13px] font-medium tracking-wide text-white/70 hover:text-white transition-colors">
                    {user.user_metadata?.full_name?.split(" ")[0] || user.email}
                  </Link>
                  <button onClick={handleLogout} className="font-nav text-[13px] font-medium tracking-wide text-white/50 hover:text-white transition-colors">
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="font-nav text-[13px] font-semibold tracking-wide text-white/70 hover:text-white transition-colors">
                    Log In
                  </Link>
                  <Link href="/signup" className="font-nav rounded-full bg-white px-5 py-2.5 text-[13px] font-bold tracking-wide text-[#0F172A] transition-all hover:bg-white/90 hover:shadow-lg active:scale-[0.98]">
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Toggle — morphing hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white backdrop-blur-sm transition-colors hover:bg-white/10 active:scale-95 md:hidden"
            >
              <span className="relative block h-4 w-5">
                <motion.span
                  className="absolute left-0 top-0 block h-0.5 w-5 rounded-full bg-white"
                  animate={
                    shouldReduceMotion
                      ? {}
                      : mobileOpen
                        ? { rotate: 45, y: 7 }
                        : { rotate: 0, y: 0 }
                  }
                  transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                />
                <motion.span
                  className="absolute left-0 top-[7px] block h-0.5 w-5 rounded-full bg-white"
                  animate={
                    shouldReduceMotion
                      ? {}
                      : mobileOpen
                        ? { opacity: 0, scaleX: 0 }
                        : { opacity: 1, scaleX: 1 }
                  }
                  transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                  style={{ transformOrigin: "center" }}
                />
                <motion.span
                  className="absolute left-0 top-[14px] block h-0.5 w-5 rounded-full bg-white"
                  animate={
                    shouldReduceMotion
                      ? {}
                      : mobileOpen
                        ? { rotate: -45, y: -7 }
                        : { rotate: 0, y: 0 }
                  }
                  transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                />
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu — spring drawer with stagger */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0.15 }
                  : { duration: 0.25, ease: [0.23, 1, 0.32, 1] }
              }
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-[#020617]/60 backdrop-blur-sm md:hidden"
              aria-hidden
            />

            {/* Panel */}
            <motion.div
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { transform: "translateX(100%)", opacity: 0 }
              }
              animate={
                shouldReduceMotion
                  ? { opacity: 1 }
                  : { transform: "translateX(0%)", opacity: 1 }
              }
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { transform: "translateX(100%)", opacity: 0 }
              }
              transition={
                shouldReduceMotion
                  ? { duration: 0.15 }
                  : {
                      type: "spring",
                      duration: 0.45,
                      bounce: 0.15,
                    }
              }
              drag={shouldReduceMotion ? false : "x"}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.x > 80 || info.velocity.x > 300) {
                  setMobileOpen(false);
                }
              }}
              className="fixed inset-y-0 right-0 z-40 flex w-[88%] max-w-[360px] flex-col overflow-y-auto bg-[#0F172A] px-5 pb-8 pt-[72px] shadow-2xl shadow-black/50 md:hidden"
              style={{ willChange: "transform" }}
            >
              {/* Drag handle hint */}
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/15 md:hidden" />

              <motion.div
                initial="hidden"
                animate="show"
                exit="hidden"
                variants={{
                  hidden: {},
                  show: {
                    transition: {
                      staggerChildren: shouldReduceMotion ? 0 : 0.045,
                      delayChildren: shouldReduceMotion ? 0 : 0.08,
                    },
                  },
                }}
                className="flex flex-col"
              >
                {navLinks.map((link) => (
                  <motion.div
                    key={link.href}
                    variants={{
                      hidden: shouldReduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, transform: "translateY(10px)" },
                      show: shouldReduceMotion
                        ? { opacity: 1 }
                        : { opacity: 1, transform: "translateY(0px)" },
                    }}
                    transition={{
                      duration: 0.3,
                      ease: [0.23, 1, 0.32, 1] as const,
                    }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between border-b border-white/10 py-4 text-[22px] font-heading font-bold tracking-tight transition-colors ${
                        isActive(link.href)
                          ? "text-white"
                          : "text-white/90 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        {isActive(link.href) && (
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                        )}
                        {link.label}
                      </span>
                      <svg
                        className="h-4 w-4 text-white/30"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </motion.div>
                ))}

                {/* Mobile Activities — collapsible */}
                <motion.div
                  variants={{
                    hidden: shouldReduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, transform: "translateY(10px)" },
                    show: shouldReduceMotion
                      ? { opacity: 1 }
                      : { opacity: 1, transform: "translateY(0px)" },
                  }}
                  transition={{
                    duration: 0.3,
                    ease: [0.23, 1, 0.32, 1] as const,
                  }}
                  className="border-b border-white/10 py-1"
                >
                  <button
                    onClick={() => setMobileActivityOpen((v) => !v)}
                    aria-expanded={mobileActivityOpen}
                    className="flex w-full items-center justify-between py-4 text-left"
                  >
                    <span className="text-[22px] font-heading font-bold tracking-tight text-white/90">
                      Activities
                    </span>
                    <motion.span
                      animate={{ rotate: mobileActivityOpen ? 180 : 0 }}
                      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white"
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                        />
                      </svg>
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {mobileActivityOpen && (
                      <motion.div
                        initial={
                          shouldReduceMotion
                            ? { opacity: 0 }
                            : { opacity: 0, height: 0 }
                        }
                        animate={
                          shouldReduceMotion
                            ? { opacity: 1 }
                            : { opacity: 1, height: "auto" }
                        }
                        exit={
                          shouldReduceMotion
                            ? { opacity: 0 }
                            : { opacity: 0, height: 0 }
                        }
                        transition={{
                          duration: shouldReduceMotion ? 0.15 : 0.28,
                          ease: [0.23, 1, 0.32, 1] as const,
                        }}
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
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400">
                                {act.icon}
                              </span>
                              <span className="flex flex-col">
                                <span className="font-semibold leading-none">
                                  {act.label}
                                </span>
                                <span className="text-xs text-white/50">
                                  {act.description}
                                </span>
                              </span>
                            </Link>
                          ))}
                          <Link
                            href="/activities"
                            onClick={() => setMobileOpen(false)}
                            className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-cyan-400 active:scale-[0.98]"
                          >
                            View all activities
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                              aria-hidden
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                              />
                            </svg>
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div
                  variants={{
                    hidden: shouldReduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, transform: "translateY(10px)" },
                    show: shouldReduceMotion
                      ? { opacity: 1 }
                      : { opacity: 1, transform: "translateY(0px)" },
                  }}
                  transition={{
                    duration: 0.3,
                    ease: [0.23, 1, 0.32, 1] as const,
                  }}
                >
                  <Link
                    href="/contact"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between border-b border-white/10 py-4 text-[22px] font-heading font-bold tracking-tight text-white/90 hover:text-white"
                  >
                    Contact
                    <svg
                      className="h-4 w-4 text-white/30"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </motion.div>

                <motion.div
                  variants={{
                    hidden: shouldReduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, transform: "translateY(10px)" },
                    show: shouldReduceMotion
                      ? { opacity: 1 }
                      : { opacity: 1, transform: "translateY(0px)" },
                  }}
                  transition={{
                    duration: 0.3,
                    ease: [0.23, 1, 0.32, 1] as const,
                  }}
                  className="mt-6"
                >
                  <Link
                    href="/contact"
                    onClick={() => setMobileOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-sky-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/30 active:scale-[0.98]"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.36-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                      />
                    </svg>
                    Contact Us
                  </Link>
                </motion.div>

                {user ? (
                  <motion.div
                    variants={{
                      hidden: shouldReduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, transform: "translateY(10px)" },
                      show: shouldReduceMotion
                        ? { opacity: 1 }
                        : { opacity: 1, transform: "translateY(0px)" },
                    }}
                    transition={{
                      duration: 0.3,
                      ease: [0.23, 1, 0.32, 1] as const,
                    }}
                    className="mt-4 flex flex-col gap-2"
                  >
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm">
                        {(user.user_metadata?.full_name?.[0] || user.email?.[0] || "U").toUpperCase()}
                      </span>
                      My Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileOpen(false);
                      }}
                      className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/60"
                    >
                      Log Out
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    variants={{
                      hidden: shouldReduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, transform: "translateY(10px)" },
                      show: shouldReduceMotion
                        ? { opacity: 1 }
                        : { opacity: 1, transform: "translateY(0px)" },
                    }}
                    transition={{
                      duration: 0.3,
                      ease: [0.23, 1, 0.32, 1] as const,
                    }}
                    className="mt-4 flex gap-3"
                  >
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex flex-1 items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10 active:scale-[0.98]"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileOpen(false)}
                      className="flex flex-1 items-center justify-center rounded-full bg-white px-5 py-3.5 text-sm font-bold text-[#0F172A] shadow-lg transition-colors hover:bg-white/90 active:scale-[0.98]"
                    >
                      Sign Up
                    </Link>
                  </motion.div>
                )}

                {/* Footer hint — swipe to close */}
                <motion.p
                  variants={{
                    hidden: { opacity: 0 },
                    show: { opacity: 1 },
                  }}
                  transition={{
                    duration: 0.3,
                    delay: shouldReduceMotion ? 0 : 0.4,
                  }}
                  className="mt-8 text-center text-[11px] font-medium uppercase tracking-widest text-white/25"
                >
                  Swipe right to close
                </motion.p>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}