"use client";

import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { cn, formatPaise } from "@/lib/utils";

export type PaymentChoiceValue = "advance" | "full";

const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/**
 * Pay a 30% advance or the full amount (FR-020). Amounts are paise and always INR,
 * because that's what is charged — never the visitor's display currency.
 */
export function PaymentChoice({
  total,
  advance,
  advanceAllowed,
  balanceDueDate,
  value,
  onChange,
  noun = "trek",
}: {
  total: number;
  advance: number;
  advanceAllowed: boolean;
  balanceDueDate: string | null;
  value: PaymentChoiceValue;
  onChange: (value: PaymentChoiceValue) => void;
  /** What the customer booked, for the "starts within 15 days" message. */
  noun?: "trek" | "course";
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="mb-2 text-sm font-semibold">How much would you like to pay now?</legend>

      <Option
        checked={value === "advance"}
        disabled={!advanceAllowed}
        onSelect={() => onChange("advance")}
        title="Pay 30% advance"
        amount={formatPaise(advance)}
      >
        {advanceAllowed ? (
          <>
            {formatPaise(total - advance)} due by {balanceDueDate ? shortDate(balanceDueDate) : "15 days before you start"}. The
            advance is non-refundable —{" "}
            <Link href="/cancellation-policy" className="font-medium underline underline-offset-2">
              cancellation policy
            </Link>
            .
          </>
        ) : (
          `Your ${noun} starts within 15 days, so full payment is needed.`
        )}
      </Option>

      <Option checked={value === "full"} onSelect={() => onChange("full")} title="Pay in full" amount={formatPaise(total)}>
        Nothing more to pay later.
      </Option>
    </fieldset>
  );
}

function Option({
  checked,
  disabled = false,
  onSelect,
  title,
  amount,
  children,
}: {
  checked: boolean;
  disabled?: boolean;
  onSelect: () => void;
  title: string;
  amount: string;
  children: React.ReactNode;
}) {
  return (
    <label
      className={cn(
        "relative flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors motion-reduce:transition-none",
        checked
          ? "border-emerald-500 bg-emerald-50/70 ring-1 ring-emerald-500 dark:bg-emerald-400/10"
          : "border-slate-200 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20",
        disabled && "cursor-not-allowed opacity-60 hover:border-slate-200 dark:hover:border-white/10"
      )}
    >
      <input
        type="radio"
        name="payment-choice"
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        onChange={onSelect}
      />
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500 peer-focus-visible:ring-offset-2",
          checked ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 dark:border-white/30"
        )}
      >
        {checked && <CircleCheck className="h-5 w-5" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-3">
          <span className="font-semibold">{title}</span>
          <span className="whitespace-nowrap text-base font-bold">{amount}</span>
        </span>
        <span className="mt-1 block text-sm text-slate-600 dark:text-slate-300">{children}</span>
      </span>
    </label>
  );
}
