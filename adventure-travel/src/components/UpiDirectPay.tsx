"use client";

import { UPI_GPAY_ID, UPI_PHONEPE_ID, UPI_QR_ID, upiLink } from "@/data/upi";
import { buttonVariants } from "@/components/ui/button";
import { BrandIcon } from "@/components/BrandIcon";

/**
 * "Pay directly by UPI": Google Pay / PhonePe buttons with the amount filled in (phones), a QR to
 * scan (desktop), and a WhatsApp link to send the screenshot. Nothing here marks the booking paid:
 * the owner confirms it by hand (see src/data/upi.ts).
 */
export default function UpiDirectPay({ amountInr, reference }: { amountInr?: number; reference?: string }) {
  const note = reference ? `Booking ${reference}` : "Himalayan Arc booking";
  const amount = amountInr && amountInr > 0 ? `Rs.${Math.round(amountInr).toLocaleString("en-IN")}` : null;
  const whatsapp = `https://wa.me/917817912062?text=${encodeURIComponent(
    `Hi! I've paid${amount ? ` ${amount}` : ""} by UPI${reference ? ` for booking ${reference}` : ""}. Screenshot attached.`
  )}`;
  const btn = buttonVariants({ variant: "outline", size: "lg", className: "w-full justify-center" });

  return (
    <section aria-labelledby="upi-direct" className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-white/10 dark:bg-card">
      <h3 id="upi-direct" className="font-heading text-xl font-medium text-foreground">Pay directly by UPI</h3>
      <p className="mt-1 text-sm text-muted">
        No card fees. {amount ? <>Pay <strong className="text-foreground">{amount}</strong>, then</> : "After paying,"} send us the screenshot on WhatsApp and we
        confirm your booking.
      </p>
      <div className="mt-4 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="space-y-3">
          {/* Phones: the app opens with the amount filled in. upi:// lets Android pick any UPI app. */}
          <a href={upiLink(UPI_GPAY_ID, amountInr, note, "tez://upi/pay")} className={btn}>Pay with Google Pay</a>
          <a href={upiLink(UPI_PHONEPE_ID, amountInr, note, "phonepe://pay")} className={btn}>Pay with PhonePe</a>
          <a href={upiLink(UPI_PHONEPE_ID, amountInr, note)} className={btn}>Other UPI app</a>
          <p className="text-xs text-muted">
            UPI IDs: <span className="font-mono">{UPI_PHONEPE_ID}</span> (PhonePe) · <span className="font-mono">{UPI_GPAY_ID}</span> (Google Pay)
          </p>
        </div>
        <figure className="mx-auto text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/upi-qr.png" alt={`UPI QR code for ${UPI_QR_ID}`} width={176} height={176} className="rounded-xl ring-1 ring-slate-200" />
          <figcaption className="mt-2 text-xs text-muted">Scan with any UPI app{amount ? `, enter ${amount}` : ""}</figcaption>
        </figure>
      </div>
      <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={buttonVariants({ size: "lg", className: "mt-5 w-full justify-center" })}>
        <BrandIcon brand="whatsapp" className="h-5 w-5" />
        Send payment screenshot on WhatsApp
      </a>
    </section>
  );
}
