"use client";

import { useState } from "react";
import { LocateFixed } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { BASE_CURRENCY, SWITCHER_CURRENCIES } from "@/lib/currency";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

/**
 * Compact currency picker. "Auto" follows the visitor's location (so a VPN changes it);
 * choosing a currency pins it. A native <select> keeps it keyboard- and screen-reader-
 * friendly with no extra code. It only sits on the navy chrome (navbar, footer), so it
 * always renders the kit's dark field.
 */
export default function CurrencySwitcher({ className = "" }: { className?: string }) {
  const { currency, mode, detected, rates, setCurrency } = useCurrency();

  // Only offer currencies we actually have a rate for (INR always works).
  const options = SWITCHER_CURRENCIES.filter((c) => c === BASE_CURRENCY || rates?.[c]);
  if (!options.includes(currency)) options.push(currency);

  return (
    <label className={cn("dark inline-flex items-center", className)}>
      <span className="sr-only">Display currency</span>
      <Select
        value={mode === "auto" ? "auto" : currency}
        onChange={(e) => setCurrency(e.target.value)}
        title="Prices are converted for display only. You are billed in INR."
        wrapperClassName="w-auto"
        className="h-11 w-auto pl-3 pr-9 font-nav font-semibold lg:h-10 lg:pl-2.5 lg:pr-8 lg:text-xs dark:hover:bg-white/10"
      >
        <option value="auto">Auto ({detected})</option>
        {options.map((code) => (
          <option key={code} value={code}>
            {code}
          </option>
        ))}
      </Select>
    </label>
  );
}

/**
 * Indian or foreign-national price list. "Auto" follows the visitor's location (outside
 * India → foreign); the booking form still asks, and the server charges by that answer.
 */
export function NationalitySwitcher({ className = "" }: { className?: string }) {
  const { country, nationality, nationalitySource, setNationality } = useCurrency();
  const autoForeign = Boolean(country && country.toUpperCase() !== "IN");
  return (
    <label className={cn("dark inline-flex items-center", className)}>
      <span className="sr-only">Show prices for</span>
      <Select
        value={nationalitySource === "auto" ? "auto" : nationality}
        onChange={(e) => setNationality(e.target.value as "indian" | "foreign" | "auto")}
        title="Foreign nationals pay a higher price that covers their permits and local arrangements."
        wrapperClassName="w-auto"
        className="h-11 w-auto pl-3 pr-9 font-nav font-semibold lg:h-10 lg:pl-2.5 lg:pr-8 lg:text-xs dark:hover:bg-white/10"
      >
        <option value="auto">Auto ({autoForeign ? "foreign national" : "Indian"} prices)</option>
        <option value="indian">Indian national prices</option>
        <option value="foreign">Foreign national prices</option>
      </Select>
    </label>
  );
}

/**
 * "Use my location": sets country, currency and price list from the device's location
 * (GPS/Wi-Fi) instead of the IP guess, which follows VPNs and some mobile networks.
 * The browser asks permission first; nothing is asked on page load.
 */
export function LocateButton({ className = "", label = "Use my location" }: { className?: string; label?: string }) {
  const { locate, locating, country, countrySource } = useCurrency();
  const [note, setNote] = useState("");
  const onClick = async () => {
    setNote("");
    const result = await locate();
    if (result === "denied") setNote("Location is blocked for this site. Pick your prices with the switch instead.");
    else if (result === "unavailable") setNote("Couldn't find your location. Pick your prices with the switch instead.");
  };
  return (
    <span className={cn("inline-flex flex-wrap items-center gap-x-2", className)}>
      <button
        type="button"
        onClick={onClick}
        disabled={locating}
        className="inline-flex min-h-11 items-center gap-1.5 font-semibold underline underline-offset-2 disabled:opacity-60 md:min-h-0"
      >
        <LocateFixed className="h-3.5 w-3.5" aria-hidden />
        {locating ? "Finding you…" : label}
      </button>
      {countrySource === "device" && country && !note && <span aria-live="polite">Location: {regionName(country)}</span>}
      {note && <span role="status">{note}</span>}
    </span>
  );
}

function regionName(code: string) {
  try {
    return new Intl.DisplayNames(["en-IN"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}
