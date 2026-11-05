"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import ContactPopup from "./ContactPopup";
import { EASE } from "@/lib/motion";

/**
 * "Enquire": a slim frosted-ice tab on the right edge of trek and course pages, on phones and
 * desktop. Pale enough to sit over any content without shouting; a cold glint runs down it every
 * few seconds so a phone visitor notices it once, then it stays quiet. It opens the enquiry popup
 * with the trek or course already named, and the enquiry goes to WhatsApp like the site's others.
 */
export default function EnquireTab({
  subject,
  kind,
  photos,
  heading,
  message,
}: {
  subject: string;
  kind: "trek" | "course";
  photos?: string[];
  /** Overrides for list pages, where no single trek or course is in view. */
  heading?: string;
  message?: string;
}) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={heading ?? `Enquire about ${subject}`}
        initial={false}
        animate={reduce ? undefined : { x: [40, 0], opacity: [0, 1] }}
        transition={{ delay: 1.2, duration: 0.6, ease: EASE.out }}
        className="group fixed right-0 top-[60%] z-40 flex -translate-y-1/2 flex-col items-center gap-2 overflow-hidden rounded-l-2xl bg-gradient-to-b from-white/85 to-sky-50/80 py-3.5 pl-2.5 pr-2 text-sky-900 shadow-[-6px_10px_28px_-12px_rgba(12,74,110,0.45)] backdrop-blur-xl transition-[padding,background-color,transform] duration-200 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 motion-reduce:transition-none sm:top-1/2 sm:py-5 sm:pl-3 sm:pr-2.5 sm:hover:pr-4"
      >
        {/* The glint: a band of cold light sweeping down the tab, then a long rest. */}
        {!reduce && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-1/2 h-1/2 bg-gradient-to-b from-transparent via-white to-transparent opacity-80"
            animate={{ y: ["0%", "400%"] }}
            transition={{ duration: 1.4, ease: EASE.inOut, repeat: Infinity, repeatDelay: 5.5, delay: 2.4 }}
          />
        )}
        <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/10 text-sky-600 sm:h-8 sm:w-8">
          <MessageCircle className="h-4 w-4" strokeWidth={2} aria-hidden />
        </span>
        <span className="relative font-nav text-[11px] font-semibold uppercase tracking-[0.18em] [writing-mode:vertical-rl] sm:text-xs">
          Enquire
        </span>
      </motion.button>
      <ContactPopup
        open={open}
        onClose={() => setOpen(false)}
        heading={heading ?? `Enquire about ${subject}`}
        title={subject}
        gallery={photos}
        subtitle={`Ask about dates, price and availability${heading ? "" : ` for this ${kind}`}. Your message opens in WhatsApp, ready to send.`}
        defaultMessage={message ?? `I'd like to know more about the ${subject}: dates, price and availability.`}
      />
    </>
  );
}
