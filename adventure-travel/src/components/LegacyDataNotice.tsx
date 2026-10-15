"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/** Keys the old browser-only accounts wrote (src/lib/auth.ts and the deleted src/lib/auth-store.ts). */
const LEGACY_KEYS = ["eht_users", "eht_session", "eht_bookings", "eht_trek_bookings", "eht_activity_bookings"];

/**
 * Set for the tab session once the check has run: "notice" when old data was found (and
 * the notice shown), "clear" otherwise. WelcomeChooser waits for "clear" so the two
 * overlays never stack.
 */
export const LEGACY_CHECKED_KEY = "hac_legacy_checked";

// Before accounts moved to the server, some visitors' accounts and bookings lived only in
// this browser. That data is wiped on first sight (FR-051) and the visitor is told once
// how to get set up again (FR-050).
export default function LegacyDataNotice() {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const firstButton = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    try {
      const found = LEGACY_KEYS.some((k) => localStorage.getItem(k) !== null);
      if (found) LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
      sessionStorage.setItem(LEGACY_CHECKED_KEY, found ? "notice" : "clear");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (found) setOpen(true);
    } catch {
      /* storage blocked: nothing could have been saved there either */
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    firstButton.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="legacy-notice-title"
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0F172A] p-6 text-white shadow-2xl"
            initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: reduceMotion ? 0 : 0.25, ease: [0.23, 1, 0.32, 1] }}
          >
            <h2 id="legacy-notice-title" className="font-heading text-xl font-bold">
              We&apos;ve upgraded accounts
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/75">
              Please sign up again to keep your bookings safe across devices. Booked with us before? Message us on WhatsApp and
              we&apos;ll sort it out.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                ref={firstButton}
                href="/signup"
                onClick={() => setOpen(false)}
                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold hover:bg-emerald-700"
              >
                Sign up
              </Link>
              <a
                href="https://wa.me/917817912062"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold hover:bg-white/20"
              >
                WhatsApp
              </a>
              <button type="button" onClick={() => setOpen(false)} className="ml-auto px-3 py-2.5 text-sm text-white/70 hover:text-white">
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
