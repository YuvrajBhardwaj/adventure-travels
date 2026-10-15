"use client";

import { useCurrency } from "@/contexts/CurrencyContext";

/**
 * Renders an INR catalogue price in the visitor's display currency. Inline text only,
 * so it drops into any existing price markup. Converted amounts carry a "≈" because
 * they are indicative — the amount actually charged is always the INR one.
 */
export default function Price({ inr, approx = true }: { inr: number; approx?: boolean }) {
  const { format, converted } = useCurrency();
  return (
    <>
      {converted && approx ? "≈ " : ""}
      {format(inr)}
    </>
  );
}

/** "Shown in CAD (estimate). You're billed Rs.6,000 in INR." — renders only when converted. */
export function PriceNote({ inr, className = "" }: { inr: number; className?: string }) {
  const { currency, converted } = useCurrency();
  if (!converted) return null;
  return (
    <p className={`text-xs leading-snug ${className}`}>
      Shown in {currency} as an estimate. You&apos;re billed <strong>Rs.{Math.round(inr).toLocaleString("en-IN")}</strong>{" "}
      in INR — your card issuer converts it at their own rate.
    </p>
  );
}
