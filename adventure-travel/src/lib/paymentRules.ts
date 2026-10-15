import type { PaymentState } from "@/lib/auth";

// Browser copies of the money and date rules in api/_lib/pricing.js, used only to show
// amounts and options. The server applies the real rules and ignores anything sent from here.

const DAY_MS = 86_400_000;
const ADVANCE_CUTOFF_DAYS = 15;

/** Today's date in India (Asia/Kolkata) as YYYY-MM-DD. */
export function istToday(now: Date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

const utc = (iso: string) => Date.parse(`${iso}T00:00:00Z`);

export function daysUntil(iso: string, now: Date = new Date()) {
  return Math.round((utc(iso) - utc(istToday(now))) / DAY_MS);
}

/** 30% of the amount, rounded up to a whole rupee (paise in, paise out). */
export function advanceAmount(amount: number) {
  return Math.ceil((amount * 0.3) / 100) * 100;
}

/** An advance is only offered before any payment, when the start is more than 15 days away. */
export function isAdvanceAllowed(startIso: string, amountPaid: number, now: Date = new Date()) {
  return amountPaid === 0 && daysUntil(startIso, now) > ADVANCE_CUTOFF_DAYS;
}

/** The balance is due 15 days before the start. */
export function balanceDueDate(startIso: string) {
  return new Date(utc(startIso) - ADVANCE_CUTOFF_DAYS * DAY_MS).toISOString().slice(0, 10);
}

/** Overdue = an advance was paid and the balance due date has passed in IST (FR-020e). */
export function isOverdue(paymentState: PaymentState | null | undefined, dueDate: string | null | undefined, today = istToday()) {
  return paymentState === "advance_paid" && Boolean(dueDate) && (dueDate as string) < today;
}
