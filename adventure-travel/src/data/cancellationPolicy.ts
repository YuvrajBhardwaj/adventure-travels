/**
 * Payment, cancellation and ski-course terms (owner, 20 Nov 2026). Shown on /cancellation-policy,
 * the trek T&C tab, tour pages, course pages and checkout. Edit the wording here, not in the pages.
 */

// The refund ladder: the percentage is the visual, the colour only says "more" (green) to "none" (orange).
export const REFUND_TIERS = [
  {
    window: "20+ days before",
    pct: "100%",
    cash: "Full refund",
    detail: "",
    tone: "text-emerald-600 dark:text-emerald-400",
  },
  {
    window: "10–19 days before",
    pct: "50%",
    cash: "50% refund",
    detail: "",
    tone: "text-amber-600 dark:text-amber-400",
  },
  {
    window: "Less than 10 days before",
    pct: "0%",
    cash: "No refund",
    detail: "One free date change in the same season instead.",
    tone: "text-orange-600 dark:text-orange-400",
  },
];

/** How payment works, for treks, tours and courses. */
export const PAYMENT_TERMS = [
  "Pay a 30% advance to confirm your booking, or the full amount.",
  "The balance is due 15 days before the trek or course starts.",
  "December ski batches: we confirm the batch 1 week before the start, once there's snow. You pay only after we confirm.",
];

/** Rules that apply to every refund. */
export const REFUND_NOTE = [
  { text: "Days are counted to the start date of your trek or course." },
  { text: "Less than 10 days before: no refund, but you can move once, free, to another date in the same season (subject to seats)." },
  { text: "Refunds are processed within 7–14 working days of cancellation, to your original payment method." },
  { text: "Bookings marked NON REFUNDABLE receive no refund." },
  { text: "Offloading, rental and travel fees are non-refundable." },
];

/** Ski and snowboard courses in Auli. */
export const SKI_TERMS = [
  {
    title: "No snow, no loss",
    text: "If there's no snow for your batch, you choose: a free date change (for example, to January) or a full refund, paid immediately.",
  },
  {
    title: "December batches",
    text: "We confirm a December batch 1 week before it starts, once there's snow on the slopes. You pay only after we confirm.",
  },
  {
    title: "Your certificate",
    text: "The Himalayan Arc Adventure Ski Course Certificate is a private ski school certificate, not a government certificate.",
  },
  {
    title: "No grades, a personal report",
    text: "We don't give A/B grades. On Day 13 of the 14-day course you get a Personal Ski Report: skill ratings, video analysis and your instructor's remarks.",
  },
];

/** Shown wherever the terms are. */
export const REGISTRATION_NOTE =
  "Himalayan Arc Adventure is registered with the Uttarakhand Tourism Development Board as an adventure company.";
