import type { BookingStatus, PaymentState } from "@/lib/auth";

// Shared wording and badge colours for the admin screens.

export type Tone = "emerald" | "sky" | "amber" | "red" | "slate";

export const STATUS_TONE: Record<BookingStatus, Tone> = {
  pending: "amber",
  confirmed: "emerald",
  cancelled: "red",
};

export const PAYMENT_STATE_LABEL: Record<PaymentState, string> = {
  unpaid: "Unpaid",
  advance_paid: "Advance paid",
  fully_paid: "Fully paid",
  refunded: "Refunded",
};

export const PAYMENT_STATE_TONE: Record<PaymentState, Tone> = {
  unpaid: "slate",
  advance_paid: "sky",
  fully_paid: "emerald",
  refunded: "red",
};

export const PAYMENT_STATUS_TONE: Record<"created" | "paid" | "failed", Tone> = {
  created: "slate",
  paid: "emerald",
  failed: "red",
};

export const KIND_LABEL = { advance: "Advance", balance: "Balance", full: "Full" } as const;

export const TYPE_LABEL = { trek: "Trek", course: "Course", activity: "Activity" } as const;

export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");

/** "8 Jan 2027" for a YYYY-MM-DD date (read as a calendar day, not shifted by time zone). */
export function shortDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T00:00:00Z`) : new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: /T/.test(iso) ? undefined : "UTC" });
}

export function dateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
}

/**
 * Legacy class string for admin fields that aren't kit components yet (the Departures
 * screen). Same look as the kit's Input/Select box (ui/input.tsx `fieldClasses`), but
 * without its width and height so existing layouts keep their sizes. New code: use
 * <Input> / <Select> from @/components/ui.
 */
export const FIELD =
  "h-10 rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm shadow-slate-900/[0.03] outline-none transition-[border-color,box-shadow] duration-150 ease-out focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none sm:text-sm dark:border-white/10 dark:bg-white/5 dark:text-white dark:shadow-none dark:focus-visible:border-emerald-400 dark:focus-visible:ring-emerald-400/25 dark:[&>option]:bg-navy";
