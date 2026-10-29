"use client";

import { useState } from "react";
import ContactPopup from "./ContactPopup";
import { BrandIcon } from "@/components/BrandIcon";

const WHATSAPP_PHONE = "917817912062";

export default function FloatingWhatsApp() {
  const [showPopup, setShowPopup] = useState(false);

  const whatsappHref = `https://wa.me/${WHATSAPP_PHONE}?text=Hi%20Himalayan%20Arc%20Adventure%2C%20I%27d%20like%20to%20know%20more%20about%20your%20treks.`;

  return (
    <>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-transform duration-150 ease-out hover:scale-105 active:scale-95 motion-reduce:transition-none motion-reduce:hover:scale-100"
      >
        <BrandIcon brand="whatsapp" className="h-7 w-7" />
        <span className="sr-only">Chat on WhatsApp</span>
      </a>
      <ContactPopup open={showPopup} onClose={() => setShowPopup(false)} />
    </>
  );
}
