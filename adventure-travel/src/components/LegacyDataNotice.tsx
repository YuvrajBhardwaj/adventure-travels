"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";

/** Keys the old browser-only accounts wrote (src/lib/auth.ts and the deleted src/lib/auth-store.ts). */
const LEGACY_KEYS = ["eht_users", "eht_session", "eht_bookings", "eht_trek_bookings", "eht_activity_bookings"];

// Before accounts moved to the server, some visitors' accounts and bookings lived only in
// this browser. That data is wiped on first sight (FR-051) and the visitor is told once
// how to get set up again (FR-050). Focus trap, Escape and scroll lock come from Dialog.
export default function LegacyDataNotice() {
  const [open, setOpen] = useState(false);
  const firstButton = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    try {
      const found = LEGACY_KEYS.some((k) => localStorage.getItem(k) !== null);
      if (found) LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (found) setOpen(true);
    } catch {
      /* storage blocked: nothing could have been saved there either */
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        title="We've upgraded accounts"
        size="sm"
        tone="dark"
        hideClose
        className="max-w-md"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          firstButton.current?.focus();
        }}
      >
        <div className="px-6 pb-6">
          <p className="mt-1 text-sm leading-relaxed text-white/75">
            Please sign up again to keep your bookings safe across devices. Booked with us before? Message us on WhatsApp and
            we&apos;ll sort it out.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link ref={firstButton} href="/signup" onClick={() => setOpen(false)} className={buttonVariants()}>
              Sign up
            </Link>
            <a
              href="https://wa.me/917817912062"
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline" })}
            >
              WhatsApp
            </a>
            <DialogClose asChild>
              <Button variant="ghost" className="ml-auto text-white/70">
                Close
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
