/** Cancellation and refund terms, shown on /cancellation-policy and summarised on tour pages. */

// The refund ladder: the percentage is the visual, the colour only says "more" (green) to "none" (orange).
export const REFUND_TIERS = [
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

export const REFUND_NOTE = [
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
