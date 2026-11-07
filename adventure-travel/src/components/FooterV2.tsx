"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { FadeUp, StaggerContainer, StaggerItem } from "./MotionWrapper";
import SmartImage from "./SmartImage";
import CurrencySwitcher from "./CurrencySwitcher";
import { POPULAR_TREK_SLUGS, treks } from "@/data/treks";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { transition } from "@/lib/motion";
import { BrandIcon } from "@/components/BrandIcon";
import { Check, ChevronDown, Mail, MapPin, Mountain, Phone } from "lucide-react";


const quickLinks = [
  { label: "All Treks", href: "/treks" },
  { label: "Destinations", href: "/destinations" },
  { label: "Activities", href: "/activities" },
  { label: "About Us", href: "/#about" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
  { label: "Cancellation Policy", href: "/cancellation-policy" },
];

// Site-wide links, so these carry the most internal weight: the routes we run from our
// Joshimath base first (Dronagiri and Panpatia Col had no other crawlable links).
// Picked by slug from the data, so a renamed or removed trek can't leave a dead link.
const popularTreks = [
  ...POPULAR_TREK_SLUGS.flatMap((slug) => {
    const trek = treks.find((t) => t.slug === slug);
    return trek ? [{ name: trek.name, href: `/treks/${trek.slug}` }] : [];
  }),
  // The two hub pages, so they're linked from every page too.
  { name: "Treks from Joshimath", href: "/treks-from-joshimath" },
  { name: "Winter treks in Uttarakhand", href: "/winter-treks-uttarakhand" },
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
  { label: "Facebook", href: "https://facebook.com/himalayan_arc_adventure", brand: "facebook" as const },
  { label: "Instagram", href: INSTAGRAM_URL, brand: "instagram" as const },
  { label: "YouTube", href: "https://youtube.com/@himalayan_arc_adventure", brand: "youtube" as const },
];

const legalLinks = [
  { label: "Booking & Cancellation", href: "/cancellation-policy" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function MobileAccordion({ title, children, id, openId, setOpenId }: { title: string; children: React.ReactNode; id: string; openId: string | null; setOpenId: (v: string | null) => void }) {
  const open = openId === id;
  const reduce = useReducedMotion();
  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setOpenId(open ? null : id)}
        aria-expanded={open}
        className="flex min-h-12 w-full items-center justify-between py-3.5 text-left"
      >
        <span className="font-nav text-[13px] font-semibold uppercase tracking-[0.08em] text-white/90">{title}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={reduce ? { duration: 0 } : transition("fast")} className="text-white/40">
          <ChevronDown className="h-4 w-4" aria-hidden />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={transition("base")}
            className="overflow-hidden"
          >
            <div className="pb-3">{children}</div>
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
  const reduce = useReducedMotion();

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setStatus("error");
      return;
    }
    // No newsletter list yet: open the visitor's email app with the request ready to send,
    // and say so plainly — never a false "subscribed".
    const subject = encodeURIComponent("Add me to Himalayan Arc Adventure updates");
    const body = encodeURIComponent(`Hi! Please send trek dates and updates to ${email.trim()}.`);
    window.location.href = `mailto:himalayanarcadventure@gmail.com?subject=${subject}&body=${body}`;
    setStatus("success");
  };

  return (
    <footer className="bg-navy text-white relative overflow-hidden">
      {/* Top Wave */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0]">
        <svg viewBox="0 0 1440 50" preserveAspectRatio="none" className="w-full h-6 md:h-10" aria-hidden>
          <path d="M0,50 L0,25 Q180,0 360,20 Q540,40 720,15 Q900,0 1080,25 Q1260,40 1440,10 L1440,50 Z" className="fill-slate-800" />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 md:pt-24 pb-6 md:pb-8">
        {/* Desktop grid */}
        <StaggerContainer className="hidden md:grid md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8" staggerDelay={0.05}>
          {/* Brand */}
          <StaggerItem className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/favicon.svg" alt="Himalayan Arc Adventure" width={40} height={40} className="h-10 w-10" />
              <span className="flex flex-col leading-none">
                <span className="font-nav text-[10px] font-bold uppercase tracking-[0.22em] text-white/60">Himalayan Arc</span>
                <span className="font-display text-[18px] font-[800] tracking-[-0.02em] text-white">Adventure</span>
              </span>
            </div>
            <p className="text-sm text-white/55 leading-relaxed max-w-xs mb-6">
              Guided Himalayan treks from Joshimath and ski courses in Auli, since 2010.
            </p>

            <div className="flex gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow Himalayan Arc Adventure on ${social.label}`}
                  className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-primary/20 hover:border-primary/30 hover:-translate-y-0.5 active:scale-95 transition-[color,background-color,border-color,transform] duration-150 ease-out motion-reduce:transition-colors motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100"
                >
                  <BrandIcon brand={social.brand} className="h-4 w-4" />
                </a>
              ))}
            </div>

            {/* No unverified rating claimed here until reviews are collected and linkable. */}
            
          </StaggerItem>

          {/* Quick Links */}
          <StaggerItem>
            <h4 className="font-heading font-semibold text-sm mb-5 text-white/90">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/55 hover:text-primary transition-colors duration-150 ease-out flex items-center gap-2 group">
                    <span className="h-1 w-1 rounded-full bg-white/20 group-hover:bg-primary transition-colors duration-150 ease-out" aria-hidden />
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
                  <Link href={trek.href} className="text-sm text-white/55 hover:text-primary transition-colors duration-150 ease-out flex items-center gap-2 group">
                    <span className="h-1 w-1 rounded-full bg-white/20 group-hover:bg-primary transition-colors duration-150 ease-out" aria-hidden />
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
                  <Link href="/destinations" className="text-sm text-white/55 hover:text-primary transition-colors duration-150 ease-out flex items-center gap-2 group">
                    <MapPin className="h-3 w-3 text-primary/50 group-hover:text-primary transition-colors" aria-hidden />
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
                  className="relative rounded-xl overflow-hidden aspect-square group"
                >
                  <SmartImage src={img} alt="" className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
                  <div className="absolute inset-0 bg-black/40 transition-opacity duration-150 ease-out flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100">
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
                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" aria-hidden />
                <div>
                  <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">Gurugram Office</p>
                  <p className="text-sm text-white/55">M3M Marina, Sector 68 - 122101</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" aria-hidden />
                <div>
                  <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">Uttarakhand Office</p>
                  <p className="text-sm text-white/55">Chamoli, Joshimath - 246443</p>
                </div>
              </div>

              <a href="tel:+917817912062" className="group flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" aria-hidden />
                <div className="text-sm text-white/55 transition-colors duration-150 ease-out group-hover:text-white">
                  <p>+91 78179 12062</p>
                  <p>+91 86505 61564</p>
                </div>
              </a>

              <a href="mailto:himalayanarcadventure@gmail.com" className="group flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" aria-hidden />
                <span className="min-w-0 break-all text-sm text-white/55 transition-colors duration-150 ease-out group-hover:text-white">himalayanarcadventure@gmail.com</span>
              </a>
            </div>

            <h5 className="text-sm font-semibold mb-3 text-white/70">Newsletter</h5>
            <form onSubmit={handleNewsletter} noValidate className="dark">
              <label htmlFor="footer-newsletter" className="sr-only">
                Email address for newsletter
              </label>
              <div className="flex flex-col gap-2 md:flex-row lg:flex-col">
                <Input
                  id="footer-newsletter"
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status !== "idle") setStatus("idle");
                  }}
                  invalid={status === "error"}
                  aria-describedby="footer-newsletter-msg"
                  className="min-w-0 md:flex-1 lg:flex-none dark:aria-[invalid=true]:border-red-400/70"
                />
                <Button type="submit" className="shrink-0 focus-visible:ring-offset-navy">
                  Subscribe
                </Button>
              </div>
              <div id="footer-newsletter-msg" aria-live="polite" className="min-h-[1.25rem]">
                <AnimatePresence mode="wait">
                  {status === "success" && (
                    <motion.p
                      key="ok"
                      initial={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, transition: transition("fast", "inOut") }}
                      transition={transition("base")}
                      className="mt-2 text-xs text-primary flex items-center gap-1.5"
                    >
                      <Check className="h-3.5 w-3.5" aria-hidden />
                      Your email app is opening. Send the message and we&apos;ll add you.
                    </motion.p>
                  )}
                  {status === "error" && (
                    <motion.p
                      key="err"
                      initial={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, transition: transition("fast", "inOut") }}
                      transition={transition("base")}
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
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0">
              <Mountain className="h-5 w-5 text-white" aria-hidden />
            </div>
            <div>
              <p className="font-display text-[15px] font-[800] tracking-[-0.02em] text-white leading-none">Himalayan Arc Adventure</p>
              <p className="mt-1 font-nav text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">Himalayan Expeditions · Est. 2010</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-white/55 pb-4">Guided Himalayan treks from Joshimath.</p>
          <div className="flex gap-2 pb-5">
            {socials.map((social) => (
              <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label} className="h-11 w-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 transition-colors duration-150 ease-out active:bg-white/10">
                <BrandIcon brand={social.brand} className="h-4 w-4" />
              </a>
            ))}
          </div>

          <MobileAccordion title="Quick Links" id="quick" openId={openSection} setOpenId={setOpenSection}>
            <ul className="grid grid-cols-2 gap-x-3">
              {quickLinks.map((l) => (
                <li key={l.label}><Link href={l.href} className="flex min-h-11 items-center text-sm text-white/65 hover:text-white transition-colors duration-150 ease-out">{l.label}</Link></li>
              ))}
            </ul>
          </MobileAccordion>
          <MobileAccordion title="Popular Treks" id="treks" openId={openSection} setOpenId={setOpenSection}>
            <ul>
              {popularTreks.map((t) => (
                <li key={t.name}><Link href={t.href} className="flex min-h-11 items-center text-sm text-white/65 hover:text-white transition-colors duration-150 ease-out">{t.name}</Link></li>
              ))}
            </ul>
          </MobileAccordion>
          <MobileAccordion title="Destinations" id="dest" openId={openSection} setOpenId={setOpenSection}>
            <ul>
              {destinations.map((d) => (
                <li key={d}><Link href="/destinations" className="flex min-h-11 items-center text-sm text-white/65 hover:text-white transition-colors duration-150 ease-out">{d}</Link></li>
              ))}
            </ul>
            <div className="grid grid-cols-3 gap-1.5 mt-3">
              {instagramImages.slice(0, 3).map((img, i) => (
                <a key={i} href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="rounded-xl overflow-hidden aspect-square"><SmartImage src={img} alt="" className="w-full h-full object-cover" /></a>
              ))}
            </div>
          </MobileAccordion>
          <MobileAccordion title="Contact & Newsletter" id="contact" openId={openSection} setOpenId={setOpenSection}>
            <div className="space-y-1 text-sm text-white/65">
              <p>M3M Marina, Sec 68, Gurugram · Chamoli, Joshimath</p>
              <a href="tel:+917817912062" className="flex min-h-11 items-center text-white/85">+91 78179 12062 · +91 86505 61564</a>
              <a href="mailto:himalayanarcadventure@gmail.com" className="flex min-h-11 items-center text-white/65 text-xs break-all">himalayanarcadventure@gmail.com</a>
              <form onSubmit={handleNewsletter} noValidate className="dark flex gap-2 pt-2">
                <Input value={email} onChange={(e) => { setEmail(e.target.value); if (status !== "idle") setStatus("idle"); }} placeholder="Your email" aria-label="Email" invalid={status === "error"} className="min-w-0 flex-1 dark:aria-[invalid=true]:border-red-400/60" />
                <Button type="submit" className="shrink-0 focus-visible:ring-offset-navy">Join</Button>
              </form>
            </div>
          </MobileAccordion>
        </div>

        {/* Bottom */}
        <FadeUp>
          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/50">
              &copy; {new Date().getFullYear()} Himalayan Arc Adventure. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-white/50">
              <CurrencySwitcher />
              {legalLinks.map((link) => (
                <Link key={link.label} href={link.href} className="inline-flex min-h-11 items-center hover:text-white transition-colors duration-150 ease-out md:min-h-0">
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
