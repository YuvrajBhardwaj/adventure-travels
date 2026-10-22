"use client";

import { FadeUp, StaggerContainer, StaggerItem } from "@/components/MotionWrapper";
import { buttonVariants } from "@/components/ui/button";

function MailIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

// The refund ladder: the percentage is the visual, the colour only says "more" (green) to "none" (orange).
const REFUND_TIERS = [
  {
    window: "25+ days before",
    pct: "90%",
    cash: "90% cash refund",
    voucher: "100% as a Trek Voucher",
    tone: "text-emerald-600 dark:text-emerald-400",
  },
  {
    window: "24–15 days before",
    pct: "70%",
    cash: "70% cash refund",
    voucher: "80% as a Trek Voucher",
    tone: "text-emerald-600 dark:text-emerald-400",
  },
  {
    window: "14–10 days before",
    pct: "50%",
    cash: "50% cash refund",
    voucher: "70% as a Trek Voucher",
    tone: "text-amber-600 dark:text-amber-400",
  },
  {
    window: "9–1 days before",
    pct: "0%",
    cash: "No refund",
    voucher: "10% Trek Voucher",
    tone: "text-orange-600 dark:text-orange-400",
  },
];

const REFUND_NOTE = [
  { text: "You can pay a 30% advance or the full amount online. After an advance, the balance is due 15 days before departure." },
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

const HAIRLINE = "border-slate-200 dark:border-white/10";

export default function CancellationPolicyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-background">
      {/* ─── Header: words only, left aligned ─── */}
      <section className={`border-b ${HAIRLINE}`}>
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-28 sm:px-6 sm:pb-14 sm:pt-36 lg:px-8">
          <p className="mb-4 text-sm text-muted">Transparent &amp; Fair</p>
          <h1 className="max-w-4xl font-heading text-[2.5rem] font-semibold leading-[1.04] tracking-[-0.025em] text-foreground sm:text-6xl lg:text-7xl">
            Cancellation &amp; Refund Policy
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            Note: No refund on unutilized services of the package, if any.
          </p>
        </div>
      </section>

      {/* ─── Refund Schedule ─── */}
      <section className="py-section-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
            <FadeUp className="lg:col-span-4">
              <p className="text-sm text-muted">Refund Schedule</p>
              <h2 className="mt-2 font-heading text-3xl font-semibold leading-tight tracking-[-0.02em] text-foreground sm:text-4xl">
                When You Cancel, Here&apos;s What Happens
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted">
                To cancel your booking, email{" "}
                <strong className="text-foreground">support@himalayanarcadventure.com</strong>{" "}
                with your booking reference number. Cancellation requests cannot be
                taken over phone calls or messages.
              </p>
            </FadeUp>

            <StaggerContainer className={`divide-y border-y ${HAIRLINE} divide-slate-200 dark:divide-white/10 lg:col-span-8`} staggerDelay={0.08}>
              {REFUND_TIERS.map((tier) => (
                <StaggerItem key={tier.window}>
                  <div className="grid grid-cols-[5.5rem_1fr] items-center gap-4 py-5 sm:grid-cols-[8rem_1fr] sm:gap-6 sm:py-6">
                    <span className={`font-heading text-5xl font-semibold leading-none tracking-[-0.03em] tabular-nums sm:text-6xl ${tier.tone}`}>
                      {tier.pct}
                    </span>
                    <div>
                      <h3 className="font-heading text-lg font-semibold text-foreground sm:text-xl">{tier.window}</h3>
                      <p className="mt-1 text-sm font-semibold text-foreground">{tier.cash}</p>
                      <p className="text-sm leading-relaxed text-muted">or {tier.voucher}</p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>

          {/* Start day + the rules that apply to every refund */}
          <FadeUp className={`mt-14 grid gap-6 border-t pt-10 lg:grid-cols-12 lg:gap-16 ${HAIRLINE}`}>
            <div className="lg:col-span-4">
              <h3 className="font-heading text-xl font-semibold text-foreground">On the start day / no-show</h3>
              <p className="mt-3 leading-relaxed text-muted">
                <strong className="text-foreground">No refund, no voucher.</strong>
              </p>
            </div>
            <ul className={`divide-y text-sm leading-relaxed text-muted divide-slate-200 dark:divide-white/10 lg:col-span-8`}>
              {REFUND_NOTE.map((n) => (
                <li key={n.text} className="py-3 first:pt-0">
                  {n.text}
                </li>
              ))}
            </ul>
          </FadeUp>

          {/* ─── We cancel / abandoned mid-way / vouchers ─── */}
          <FadeUp className={`mt-14 grid gap-4 border-t pt-10 lg:grid-cols-12 lg:gap-16 ${HAIRLINE}`}>
            <h3 className="font-heading text-xl font-semibold text-foreground lg:col-span-4">
              In the rare event that we cancel a trek
            </h3>
            <p className="text-base leading-relaxed text-muted lg:col-span-8">
              We almost never cancel. But for lockdowns, natural calamities
              (snowstorms, thunderstorms, floods, landslides, earthquakes,
              bad weather), political unrest, curfews, or government orders,
              we issue a voucher for the <strong className="text-foreground">full amount</strong>{" "}
              paid — or arrange an alternate trek. The voucher is valid for
              one year and can be extended in emergencies.{" "}
              <strong className="text-foreground">No cash refund</strong> is
              made in this case.
            </p>
          </FadeUp>

          <FadeUp className={`mt-10 grid gap-4 border-t pt-10 lg:grid-cols-12 lg:gap-16 ${HAIRLINE}`}>
            <h3 className="font-heading text-xl font-semibold text-foreground lg:col-span-4">
              If a trek is abandoned mid-way
            </h3>
            <p className="text-base leading-relaxed text-muted lg:col-span-8">
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
          </FadeUp>

          <FadeUp className={`mt-10 grid gap-4 border-t pt-10 lg:grid-cols-12 lg:gap-16 ${HAIRLINE}`}>
            <h3 className="font-heading text-xl font-semibold text-foreground lg:col-span-4">Trek Vouchers</h3>
            <div className="lg:col-span-8">
              <ul className="space-y-3">
                {VOUCHER_POINTS.map((v) => (
                  <li key={v} className="text-base leading-relaxed text-muted">
                    {v}
                  </li>
                ))}
              </ul>
              <a
                href="https://wa.me/917817912062?text=Hi!%20I'd%20like%20to%20redeem%20my%20Trek%20Voucher."
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ className: "mt-6 px-6" })}
              >
                <MailIcon className="w-4 h-4" />
                Redeem your voucher
              </a>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
