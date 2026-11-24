"use client";

import { useCurrency } from "@/contexts/CurrencyContext";
import { priceForNationality } from "@/lib/paymentRules";
import { LocateButton } from "@/components/CurrencySwitcher";

/**
 * Renders an INR catalogue price in the visitor's display currency and price list. Inline text
 * only, so it drops into any existing price markup. Foreign nationals see 2× (the price they are
 * charged); converted amounts carry a "≈" because they are indicative — the amount actually
 * charged is always the INR one.
 */
export default function Price({ inr, approx = true }: { inr: number; approx?: boolean }) {
  const { format, converted, nationality } = useCurrency();
  return (
    <>
      {converted && approx ? "≈ " : ""}
      {format(priceForNationality(inr, nationality))}
    </>
  );
}

/**
 * Under a headline price: which price list it is (with a switch), and when converted, the INR
 * amount actually billed. Renders nothing for an Indian visitor seeing rupees.
 */
export function PriceNote({ inr, className = "" }: { inr: number; className?: string }) {
  const { currency, converted, nationality, setNationality } = useCurrency();
  const foreign = nationality === "foreign";
  if (!converted && !foreign) return null;
  const billed = Math.round(priceForNationality(inr, nationality)).toLocaleString("en-IN");
  return (
    <div className={`space-y-1 text-xs leading-snug ${className}`}>
      {foreign && (
        <p>
          Price for foreign nationals, which covers their permits and local arrangements.{" "}
          <button type="button" onClick={() => setNationality("indian")} className="font-semibold underline underline-offset-2">
            Indian national? See Indian prices
          </button>
        </p>
      )}
      {(foreign || converted) && <LocateButton label="Wrong country? Use my location" />}
      {converted && (
        <p>
          Shown in {currency} as an estimate. You&apos;re billed <strong>Rs.{billed}</strong> in INR. Your card issuer converts it at
          their own rate.
        </p>
      )}
    </div>
  );
}
