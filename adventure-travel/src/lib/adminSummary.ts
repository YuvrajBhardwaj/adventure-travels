// The admin overview's numbers. Pure (types only), so it runs in unit tests without Supabase.
import type { AdminBooking, AdminPayment } from "./admin";

export interface AdminSummary {
  /** Paise collected (paid payments) since the 1st of this month, and in total. */
  collectedThisMonth: number;
  collectedTotal: number;
  /** Paise still owed on live (not cancelled, not refunded) priced bookings. */
  outstanding: number;
  overdue: AdminBooking[];
  pending: AdminBooking[];
  newThisWeek: number;
  /** Paid payments the payment guard flagged ("Needs refund: …"). */
  needsRefund: AdminPayment[];
  /** Live bookings starting today or within the next 14 days, soonest first. */
  upcoming: AdminBooking[];
}

const DAY = 24 * 60 * 60 * 1000;
const isLive = (b: AdminBooking) => b.status !== "cancelled" && b.paymentState !== "refunded";

/** The numbers on the admin overview, from the same rows the other admin pages load. `today` is YYYY-MM-DD (IST). */
export function summarize(bookings: AdminBooking[], payments: AdminPayment[], today: string, now = Date.now()): AdminSummary {
  const monthStart = `${today.slice(0, 7)}-01`;
  const in14 = new Date(Date.parse(`${today}T00:00:00Z`) + 14 * DAY).toISOString().slice(0, 10);
  const paid = payments.filter((p) => p.status === "paid");
  return {
    collectedThisMonth: paid.filter((p) => (p.paidAt ?? p.createdAt).slice(0, 10) >= monthStart).reduce((s, p) => s + p.amount, 0),
    collectedTotal: paid.reduce((s, p) => s + p.amount, 0),
    outstanding: bookings.filter((b) => isLive(b) && b.amount !== null).reduce((s, b) => s + Math.max(0, (b.amount ?? 0) - b.amountPaid), 0),
    overdue: bookings.filter((b) => isLive(b) && b.overdue),
    pending: bookings.filter((b) => b.status === "pending"),
    newThisWeek: bookings.filter((b) => now - Date.parse(b.createdAt) <= 7 * DAY).length,
    needsRefund: paid.filter((p) => (p.failureReason ?? "").startsWith("Needs refund")),
    upcoming: bookings
      .filter((b) => isLive(b) && b.startDate >= today && b.startDate <= in14)
      .sort((a, b) => a.startDate.localeCompare(b.startDate)),
  };
}

