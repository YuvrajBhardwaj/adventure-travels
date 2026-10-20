"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { transition } from "@/lib/motion";
import { cn } from "@/lib/utils";

const PHONE = "917817912062";
const CONTACT_NAME = "Kuldeep Rawat";

interface ContactPopupProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  image?: string;
  /** Optional swipeable header photos (camping). Falls back to `image`. */
  gallery?: string[];
  defaultMessage?: string;
  requesterName?: string;
}

export default function ContactPopup({ open, onClose, title, subtitle, image, gallery, defaultMessage, requesterName }: ContactPopupProps) {
  const reduce = useReducedMotion();
  const requestMessage = (defaultMessage ?? "I'd like to know more about your Himalayan adventures.").replace(/^hi(?:\s+kuldeep)?[!,]\s*/i, "");
  const [form, setForm] = useState({ name: requesterName ?? "", phone: "", message: requestMessage });
  const [sent, setSent] = useState(false);
  const photos = gallery && gallery.length > 0 ? gallery : image ? [image] : [];
  const [photoIdx, setPhotoIdx] = useState(0);

  const senderName = form.name.trim() || requesterName?.trim() || "[Your Name]";
  const WA_LINK = `https://wa.me/${PHONE}?text=${encodeURIComponent(`Hi Kuldeep! I'm ${senderName}. ${requestMessage}`)}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = encodeURIComponent(`Hi Kuldeep! I'm ${form.name.trim()}. ${form.message.trim() || requestMessage} You can reach me at ${form.phone.trim()}.`);
    window.open(`https://wa.me/${PHONE}?text=${text}`, "_blank");
    setSent(true);
  };

  const photoNav =
    "absolute top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors duration-150 ease-out hover:bg-black/60";

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent
        size="md"
        tone="light"
        placement="bottom"
        className="max-w-md"
        closeClassName={photos.length > 0 ? "bg-black/30 text-white hover:bg-black/50 hover:text-white" : undefined}
      >
        {photos.length > 0 && (
          <div key={photos[0]} className="relative h-52 flex-shrink-0 overflow-hidden bg-slate-100">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.img
                key={photoIdx}
                src={photos[photoIdx]}
                alt={title ?? "Camp"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={transition(reduce ? "base" : "slow", "inOut")}
                className="absolute inset-0 h-full w-full object-cover"
                draggable={false}
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />
            {title && (
              <p className="absolute bottom-3 left-5 font-heading text-xl font-bold text-white">{title}</p>
            )}
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setPhotoIdx((i) => (i - 1 + photos.length) % photos.length)}
                  aria-label="Previous photo"
                  className={cn(photoNav, "left-3")}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoIdx((i) => (i + 1) % photos.length)}
                  aria-label="Next photo"
                  className={cn(photoNav, "right-3")}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
                <div className="absolute bottom-3 right-4 flex gap-1.5">
                  {photos.map((_, i) => (
                    <span key={i} className={`h-1.5 rounded-full transition-all duration-200 ease-out ${i === photoIdx ? "w-5 bg-white" : "w-1.5 bg-white/50"}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className={cn("px-6 pb-6 sm:px-8 sm:pb-8", photos.length > 0 ? "pt-6" : "pt-8")}>
          {/* asChild: Radix Slot joins classes without tailwind-merge, so the overrides go on DialogTitle. */}
          <DialogTitle asChild className="font-heading text-2xl font-bold tracking-normal text-primary mb-1 pr-10">
            <h3>{image ? "Enquire about this camp" : "Get in Touch"}</h3>
          </DialogTitle>
          <DialogDescription className="mt-0 text-sm text-muted mb-6">
            {subtitle ?? (
              <>Speak with <span className="font-semibold text-foreground">{CONTACT_NAME}</span>, your trek coordinator — call, WhatsApp, or send your details.</>
            )}
          </DialogDescription>

          <div className="flex gap-3 mb-6">
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ size: "lg" }), "flex-1 px-4 text-sm bg-green-600 shadow-green-900/20 hover:bg-green-700 hover:shadow-green-900/20")}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
            <a
              href={`tel:+${PHONE}`}
              className={cn(buttonVariants({ size: "lg" }), "flex-1 px-4 text-sm")}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              Call Us
            </a>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-white/10" /></div>
            <div className="relative flex justify-center text-sm"><span className="bg-white dark:bg-navy-deep px-3 text-muted">or send details</span></div>
          </div>

          {sent ? (
            <div role="status" className="text-center py-8">
              <svg className="h-12 w-12 text-emerald-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-semibold text-primary">Your message is ready</p>
              <p className="text-sm text-muted mt-1">Press Send in WhatsApp to reach our team.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label htmlFor="cp-name" className="sr-only">Your Name</Label>
                <Input
                  id="cp-name"
                  type="text"
                  placeholder="Your Name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="cp-phone" className="sr-only">Phone Number</Label>
                <Input
                  id="cp-phone"
                  type="tel"
                  placeholder="Phone Number"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="cp-message" className="sr-only">Your Message</Label>
                <Textarea
                  id="cp-message"
                  placeholder="Your Message (optional)"
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="min-h-0 resize-none"
                />
              </div>
              <Button type="submit" size="lg" className="w-full">
                Send via WhatsApp
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
