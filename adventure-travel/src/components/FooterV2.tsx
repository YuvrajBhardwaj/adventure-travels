"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FadeUp, StaggerContainer, StaggerItem } from "./MotionWrapper";
import SmartImage from "./SmartImage";


const quickLinks = [
  { label: "All Treks", href: "/treks" },
  { label: "Destinations", href: "/destinations" },
  { label: "Activities", href: "/activities" },
  { label: "About Us", href: "/#about" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
  { label: "Cancellation Policy", href: "/cancellation-policy" },
];

const popularTreks = [
  { name: "Valley of Flowers", href: "/treks/valley-of-flowers" },
  { name: "Kedarkantha Trek", href: "/treks/kedarkantha" },
  { name: "Brahmatal Trek", href: "/treks/brahmatal" },
  { name: "Roopkund Trek", href: "/treks/roopkund" },
  { name: "Har Ki Dun", href: "/treks/har-ki-dun" },
];

const destinations = [
  "Uttarakhand Himalayas",
  "Himachal Pradesh",
  "Garhwal Region",
  "Winter Treks",
  "High Altitude Lakes",
];

const instagramImages = [
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=80",
  "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=200&q=80",
  "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=200&q=80",
  "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=200&q=80",
  "https://images.unsplash.com/photo-1448375240586-882707db888b?w=200&q=80",
];

const INSTAGRAM_URL = "https://instagram.com/himalayan_arc_adventure";

const socials = [
  { label: "Facebook", href: "https://facebook.com/himalayan_arc_adventure", icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
  { label: "Instagram", href: INSTAGRAM_URL, icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
  { label: "YouTube", href: "https://youtube.com/@himalayan_arc_adventure", icon: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
];

const legalLinks = [
  { label: "Booking & Cancellation", href: "/cancellation-policy" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function MobileAccordion({ title, children, id, openId, setOpenId }: { title: string; children: React.ReactNode; id: string; openId: string | null; setOpenId: (v: string | null) => void }) {
  const open = openId === id;
  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setOpenId(open ? null : id)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-3.5 text-left"
      >
        <span className="font-nav text-[13px] font-semibold uppercase tracking-[0.08em] text-white/90">{title}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-white/40">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }} className="overflow-hidden">
            <div className="pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FooterV2() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [openSection, setOpenSection] = useState<string | null>(null);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setStatus("error");
      return;
    }
    setStatus("success");
    setEmail("");
  };

  return (
    <footer className="bg-[#0F172A] text-white relative overflow-hidden">
      {/* Top Wave */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0]">
        <svg viewBox="0 0 1440 50" preserveAspectRatio="none" className="w-full h-6 md:h-10" aria-hidden>
          <path d="M0,50 L0,25 Q180,0 360,20 Q540,40 720,15 Q900,0 1080,25 Q1260,40 1440,10 L1440,50 Z" fill="#1E293B" />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-12 md:pt-24 pb-6 md:pb-8">
        {/* Desktop grid */}
        <StaggerContainer className="hidden md:grid md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8" staggerDelay={0.05}>
          {/* Brand */}
          <StaggerItem className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo-gem.png" alt="Himalayan Arc Adventure" width={40} height={40} className="h-10 w-10 rounded-full object-cover bg-white" />
              <span className="flex flex-col leading-none">
                <span className="font-nav text-[10px] font-bold uppercase tracking-[0.22em] text-white/60">Himalayan Arc</span>
                <span className="font-display text-[18px] font-[800] tracking-[-0.02em] text-white">Adventure</span>
              </span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs mb-6">
              Your trusted partner for epic Himalayan trekking adventures. Creating unforgettable memories since 2010.
            </p>

            <div className="flex gap-3">
              {socials.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow Himalayan Arc Adventure on ${social.label}`}
                  whileHover={{ scale: 1.15, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-primary/20 hover:border-primary/30 transition-all"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d={social.icon} />
                  </svg>
                </motion.a>
              ))}
            </div>

            {/* Google Reviews */}
            <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1" aria-hidden>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="h-4 w-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm font-semibold text-white">4.9</span>
              </div>
              <p className="text-xs text-white/40">Based on 1,200+ Google Reviews</p>
            </div>
          </StaggerItem>

          {/* Quick Links */}
          <StaggerItem>
            <h4 className="font-heading font-semibold text-sm mb-5 text-white/90">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/45 hover:text-primary transition-colors flex items-center gap-2 group">
                    <span className="h-1 w-1 rounded-full bg-white/20 group-hover:bg-primary transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </StaggerItem>

          {/* Popular Treks */}
          <StaggerItem>
            <h4 className="font-heading font-semibold text-sm mb-5 text-white/90">Popular Treks</h4>
            <ul className="space-y-3">
              {popularTreks.map((trek) => (
                <li key={trek.name}>
                  <Link href={trek.href} className="text-sm text-white/45 hover:text-primary transition-colors flex items-center gap-2 group">
                    <span className="h-1 w-1 rounded-full bg-white/20 group-hover:bg-primary transition-colors" />
                    {trek.name}
                  </Link>
                </li>
              ))}
            </ul>
          </StaggerItem>

          {/* Destinations */}
          <StaggerItem>
            <h4 className="font-heading font-semibold text-sm mb-5 text-white/90">Destinations</h4>
            <ul className="space-y-3">
              {destinations.map((dest) => (
                <li key={dest}>
                  <Link href="/destinations" className="text-sm text-white/45 hover:text-primary transition-colors flex items-center gap-2 group">
                    <svg className="h-3 w-3 text-primary/50 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    {dest}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Instagram Gallery */}
            <h4 className="font-heading font-semibold text-sm mt-6 mb-3 text-white/90">Instagram</h4>
            <div className="grid grid-cols-3 gap-2">
              {instagramImages.map((img, i) => (
                <a
                  key={i}
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View Himalayan Arc Adventure on Instagram"
                  className="relative rounded-lg overflow-hidden aspect-square group focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <SmartImage src={img} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </StaggerItem>

          {/* Contact & Newsletter */}
          <StaggerItem>
            <h4 className="font-heading font-semibold text-sm mb-5 text-white/90">Get in Touch</h4>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <svg className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <div>
                  <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">Gurugram Office</p>
                  <p className="text-sm text-white/50">M3M Marina, Sector 68 - 122101</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <div>
                  <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">Uttarakhand Office</p>
                  <p className="text-sm text-white/50">Chamoli, Joshimath - 246443</p>
                </div>
              </div>

              <a href="tel:+917817912062" className="flex items-center gap-3 hover:text-white transition-colors">
                <svg className="h-5 w-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                <div className="text-sm text-white/50">
                  <p>+91 78179 12062</p>
                </div>
              </a>

              <a href="mailto:himalayanarcadventure@gmail.com" className="flex items-center gap-3 hover:text-white transition-colors">
                <svg className="h-5 w-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <span className="text-sm text-white/50">himalayanarcadventure@gmail.com</span>
              </a>
            </div>

            <h5 className="text-sm font-semibold mb-3 text-white/70">Newsletter</h5>
            <form onSubmit={handleNewsletter} noValidate>
              <label htmlFor="footer-newsletter" className="sr-only">
                Email address for newsletter
              </label>
              <div className="flex">
                <input
                  id="footer-newsletter"
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status !== "idle") setStatus("idle");
                  }}
                  aria-invalid={status === "error"}
                  aria-describedby="footer-newsletter-msg"
                  className={`flex-1 min-w-0 bg-white/5 border rounded-l-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-colors ${
                    status === "error" ? "border-red-400/70" : "border-white/10 focus:border-primary/50"
                  }`}
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-r-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
                >
                  Subscribe
                </motion.button>
              </div>
              <div id="footer-newsletter-msg" aria-live="polite" className="min-h-[1.25rem]">
                <AnimatePresence mode="wait">
                  {status === "success" && (
                    <motion.p
                      key="ok"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-2 text-xs text-primary flex items-center gap-1.5"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Subscribed! Adventure updates are on the way.
                    </motion.p>
                  )}
                  {status === "error" && (
                    <motion.p
                      key="err"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-2 text-xs text-red-400"
                    >
                      Please enter a valid email address.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </StaggerItem>
        </StaggerContainer>

        {/* Mobile — compact accordion */}
        <div className="md:hidden">
          {/* Brand row — always visible, condensed */}
          <div className="flex items-center gap-3 pb-5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21l7.5-7.5L15 18l6-9 4.5 3L18 21H3z" />
              </svg>
            </div>
            <div>
              <p className="font-display text-[15px] font-[800] tracking-[-0.02em] text-white leading-none">Himalayan Arc Adventure</p>
              <p className="font-nav text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">Himalayan Expeditions · Est. 2010</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-white/50 pb-4">Your trusted partner for epic Himalayan treks.</p>
          <div className="flex gap-2 pb-5">
            {socials.map((social) => (
              <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label} className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d={social.icon} /></svg>
              </a>
            ))}
          </div>

          <MobileAccordion title="Quick Links" id="quick" openId={openSection} setOpenId={setOpenSection}>
            <ul className="grid grid-cols-2 gap-2">
              {quickLinks.map((l) => (
                <li key={l.label}><Link href={l.href} className="text-sm text-white/60 hover:text-white transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </MobileAccordion>
          <MobileAccordion title="Popular Treks" id="treks" openId={openSection} setOpenId={setOpenSection}>
            <ul className="space-y-2.5">
              {popularTreks.map((t) => (
                <li key={t.name}><Link href={t.href} className="text-sm text-white/60 hover:text-white transition-colors">{t.name}</Link></li>
              ))}
            </ul>
          </MobileAccordion>
          <MobileAccordion title="Destinations" id="dest" openId={openSection} setOpenId={setOpenSection}>
            <ul className="space-y-2">
              {destinations.map((d) => (
                <li key={d}><Link href="/destinations" className="text-sm text-white/60 hover:text-white transition-colors">{d}</Link></li>
              ))}
            </ul>
            <div className="grid grid-cols-3 gap-1.5 mt-4">
              {instagramImages.slice(0, 3).map((img, i) => (
                <a key={i} href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="rounded-lg overflow-hidden aspect-square"><SmartImage src={img} alt="" className="w-full h-full object-cover" /></a>
              ))}
            </div>
          </MobileAccordion>
          <MobileAccordion title="Contact & Newsletter" id="contact" openId={openSection} setOpenId={setOpenSection}>
            <div className="space-y-3 text-sm text-white/60">
              <p>M3M Marina, Sec 68, Gurugram · Chamoli, Joshimath</p>
              <a href="tel:+917817912062" className="block text-white/80">+91 78179 12062</a>
              <a href="mailto:himalayanarcadventure@gmail.com" className="block text-white/60 text-xs break-all">himalayanarcadventure@gmail.com</a>
              <form onSubmit={handleNewsletter} noValidate className="flex gap-2 pt-2">
                <input value={email} onChange={(e) => { setEmail(e.target.value); if (status !== "idle") setStatus("idle"); }} placeholder="Your email" aria-label="Email" className={`flex-1 min-w-0 rounded-xl bg-white/5 border px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none ${status === "error" ? "border-red-400/60" : "border-white/10"}`} />
                <button type="submit" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white">Join</button>
              </form>
            </div>
          </MobileAccordion>
        </div>

        {/* Bottom */}
        <FadeUp>
          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/30">
              &copy; {new Date().getFullYear()} Himalayan Arc Adventure. All rights reserved.
            </p>
            <div className="flex gap-6 text-xs text-white/30">
              {legalLinks.map((link) => (
                <Link key={link.label} href={link.href} className="hover:text-white transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </FadeUp>
      </div>
    </footer>
  );
}
