"use client";

import { motion } from "framer-motion";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/MotionWrapper";

// Inline SVG Icon components matching the codebase pattern
function ShieldCheckIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function MailIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function TicketIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-4.5-1.5h.008v.008h-.008v-.008zm0-3h.008v.008h-.008v-.008zm0-3h.008v.008h-.008v-.008zm0-3h.008v.008h-.008v-.008zm-3.75-4.5h7.5a2.25 2.25 0 012.25 2.25v.75a2.25 2.25 0 010 4.5v.75a2.25 2.25 0 01-2.25 2.25h-7.5a2.25 2.25 0 01-2.25-2.25v-.75a2.25 2.25 0 010-4.5v-.75a2.25 2.25 0 012.25-2.25z" />
    </svg>
  );
}

function CloudIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
    </svg>
  );
}

function ChevronRightIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

const REFUND_TIERS = [
  {
    window: "25+ days before",
    cash: "90% cash refund",
    voucher: "100% as a Trek Voucher",
    color: "bg-emerald-500",
    lightColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-200 dark:border-emerald-800/40",
  },
  {
    window: "24–15 days before",
    cash: "70% cash refund",
    voucher: "80% as a Trek Voucher",
    color: "bg-emerald-400",
    lightColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-200 dark:border-emerald-800/40",
  },
  {
    window: "14–10 days before",
    cash: "50% cash refund",
    voucher: "70% as a Trek Voucher",
    color: "bg-amber-500",
    lightColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800/40",
  },
  {
    window: "9–1 days before",
    cash: "No refund",
    voucher: "10% Trek Voucher",
    color: "bg-orange-500",
    lightColor: "bg-orange-50 dark:bg-orange-950/30",
    borderColor: "border-orange-200 dark:border-orange-800/40",
  },
];

const REFUND_NOTE = [
  { text: "The advance amount is non-refundable." },
  { text: "Trek Vouchers are issued only when the full amount has been paid." },
  { text: "No refund applies if only the advance amount was paid." },
  { text: "Refunds are processed within 7–14 working days of cancellation." },
  { text: "A 3% payment processing charge applies to all refunds." },
  { text: "5% GST is non-refundable." },
  { text: "Bookings marked NON REFUNDABLE receive no refund or voucher." },
  { text: "Offloading, rental, and travel fees are non-refundable. Trek Vouchers are issued only for the trek fee." },
];

const VOUCHER_POINTS = [
  "A Trek Voucher is credit added to your account, redeemable on any future fixed departure for one year.",
  "Vouchers are non-transferable — only the person they were issued to can redeem them.",
  "To redeem, reply to your voucher email or WhatsApp your trek coordinator on +91 78179 12062 with your voucher code and preferred batch date.",
];

export default function CancellationPolicyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-background">
      {/* ─── Hero Section ─── */}
      <section className="relative h-[45vh] min-h-[320px] flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1400&q=80"
          alt="Himalayan mountain range"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/70 via-[#0F172A]/50 to-[#0F172A]/80" />
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6"
          >
            <ShieldCheckIcon className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-white/90">
              Transparent &amp; Fair
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight"
          >
            Cancellation &amp; Refund Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Note: No refund on unutilized services of the package, if any.
          </motion.p>
        </div>
      </section>

      {/* ─── Refund Schedule ─── */}
      <section className="py-section px-6 lg:px-8 bg-surface dark:bg-background">
        <div className="max-w-6xl mx-auto">
          <FadeUp className="text-center mb-14">
            <span className="text-sm font-semibold tracking-widest uppercase text-accent">
              Refund Schedule
            </span>
            <h2 className="mt-4 font-heading text-display-lg font-bold text-foreground leading-tight">
              When You Cancel, Here&apos;s What Happens
            </h2>
            <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
              To cancel your booking, email{" "}
              <strong className="text-foreground">support@expeditionhappinesstreks.com</strong>{" "}
              with your booking reference number. Cancellation requests cannot be
              taken over phone calls or messages.
            </p>
          </FadeUp>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-14" staggerDelay={0.1}>
            {REFUND_TIERS.map((tier) => (
              <StaggerItem key={tier.window}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`rounded-2xl p-6 border ${tier.lightColor} ${tier.borderColor}`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${tier.color} flex items-center justify-center mb-4`}
                  >
                    <span className="text-white font-heading font-bold text-lg">
                      {tier.cash.includes("90") ? "90%" : tier.cash.includes("70") ? "70%" : tier.cash.includes("50") ? "50%" : "0%"}
                    </span>
                  </div>
                  <h3 className="font-heading font-semibold text-foreground text-lg mb-3">
                    {tier.window}
                  </h3>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    {tier.cash}
                  </p>
                  <p className="text-sm text-muted leading-relaxed mt-1">
                    or {tier.voucher}
                  </p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <FadeUp>
            <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-card p-6 md:p-8">
              <h3 className="font-heading text-xl font-bold text-foreground mb-4">
                On the start day / no-show
              </h3>
              <p className="text-muted leading-relaxed">
                <strong className="text-foreground">No refund, no voucher.</strong>
              </p>
              <div className="h-px w-full bg-gray-200 dark:bg-white/10 my-6" />
              <ul className="grid gap-3 md:grid-cols-2">
                {REFUND_NOTE.map((n) => (
                  <li key={n.text} className="flex items-start gap-3 text-sm leading-relaxed text-muted">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <ChevronRightIcon className="w-3 h-3" />
                    </span>
                    <span>{n.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeUp>

          {/* ─── Bordered callout: we cancel / abandoned mid-way / vouchers ─── */}
          <FadeUp className="mt-8">
            <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/60 dark:bg-amber-950/20 dark:border-amber-700/40 p-6 md:p-8 mb-8">
              <div className="flex gap-3">
                <CloudIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-heading text-lg font-bold text-foreground">
                    In the rare event that we cancel a trek
                  </h3>
                  <p className="mt-2 text-sm md:text-base leading-relaxed text-muted">
                    We almost never cancel. But for lockdowns, natural calamities
                    (snowstorms, thunderstorms, floods, landslides, earthquakes,
                    bad weather), political unrest, curfews, or government orders,
                    we issue a voucher for the <strong className="text-foreground">full amount</strong>{" "}
                    paid — or arrange an alternate trek. The voucher is valid for
                    one year and can be extended in emergencies.{" "}
                    <strong className="text-foreground">No cash refund</strong> is
                    made in this case.
                  </p>
                </div>
              </div>
            </div>
          </FadeUp>

          <FadeUp>
            <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-card p-6 md:p-8 mb-8">
              <div className="flex gap-3">
                <ShieldCheckIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-heading text-lg font-bold text-foreground">
                    If a trek is abandoned mid-way
                  </h3>
                  <p className="mt-2 text-sm md:text-base leading-relaxed text-muted">
                    There is <strong className="text-foreground">no refund</strong>{" "}
                    if you cannot complete a trek due to natural calamities,
                    unrest, government orders, or if your trek leader sends you
                    back for a safety or health issue. Instead, use our{" "}
                    <strong className="text-foreground">
                      &ldquo;Come Back &amp; Trek Again&rdquo;
                    </strong>{" "}
                    feature (not applicable on winter treks): email us for a
                    Refcode, then rebook the <em>same</em> trek next season with it
                    — no extra trek fee. Offloading, travel, and rental fees are
                    not included.
                  </p>
                </div>
              </div>
            </div>
          </FadeUp>

          <FadeUp>
            <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-card p-6 md:p-8">
              <div className="flex gap-3">
                <TicketIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-heading text-lg font-bold text-foreground">
                    Trek Vouchers
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {VOUCHER_POINTS.map((v) => (
                      <li key={v} className="flex items-start gap-3 text-sm md:text-base leading-relaxed text-muted">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                        <span>{v}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="https://wa.me/917817912062?text=Hi!%20I'd%20like%20to%20redeem%20my%20Trek%20Voucher."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
                  >
                    <MailIcon className="w-4 h-4" />
                    Redeem your voucher
                  </a>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
