"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import ContactPopup from "./ContactPopup";
import { EASE } from "@/lib/motion";

/**
 * "Enquire now": a vertical tab pinned to the right edge of trek and course pages, on phones and
 * desktop. It opens the enquiry popup with the trek or course already named, and the enquiry goes
 * to WhatsApp like the site's other enquiries.
 */
export default function EnquireTab({ subject, kind, photos }: { subject: string; kind: "trek" | "course"; photos?: string[] }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        initial={false}
        animate={reduce ? undefined : { x: [48, 0] }}
        transition={{ delay: 0.8, duration: 0.5, ease: EASE.out }}
        className="fixed right-0 top-1/2 z-40 flex -translate-y-1/2 rotate-180 items-center gap-2 rounded-r-xl bg-cta px-2.5 py-4 font-nav text-[12px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_10px_30px_-8px_rgba(249,115,22,0.7)] transition-[background-color,padding] duration-150 ease-out [writing-mode:vertical-rl] hover:bg-orange-600 hover:pr-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-cta sm:px-3 sm:py-5 sm:text-[13px]"
      >
        <MessageCircle className="h-4 w-4 rotate-90" aria-hidden />
        Enquire now
      </motion.button>
      <ContactPopup
        open={open}
        onClose={() => setOpen(false)}
        heading={`Enquire about ${subject}`}
        title={subject}
        gallery={photos}
        subtitle={`Ask about dates, price and availability for this ${kind}. Your message opens in WhatsApp, ready to send.`}
        defaultMessage={`I'd like to know more about the ${subject}: dates, price and availability.`}
      />
    </>
  );
}
