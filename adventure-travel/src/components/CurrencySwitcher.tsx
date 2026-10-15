"use client";

import { useCurrency } from "@/contexts/CurrencyContext";
import { BASE_CURRENCY, SWITCHER_CURRENCIES } from "@/lib/currency";

/**
 * Compact currency picker. "Auto" follows the visitor's location (so a VPN changes it);
 * choosing a currency pins it. A native <select> keeps it keyboard- and screen-reader-
 * friendly with no extra code.
 */
export default function CurrencySwitcher({ className = "" }: { className?: string }) {
  const { currency, mode, detected, rates, setCurrency } = useCurrency();

  // Only offer currencies we actually have a rate for (INR always works).
  const options = SWITCHER_CURRENCIES.filter((c) => c === BASE_CURRENCY || rates?.[c]);
  if (!options.includes(currency)) options.push(currency);

  return (
    <label className={`inline-flex items-center ${className}`}>
      <span className="sr-only">Display currency</span>
      <select
        value={mode === "auto" ? "auto" : currency}
        onChange={(e) => setCurrency(e.target.value)}
        title="Prices are converted for display only — you are billed in INR."
        className="cursor-pointer rounded-full border border-white/25 bg-white/10 px-2.5 py-1 font-nav text-xs font-semibold text-white outline-none transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-emerald-400 [&>option]:bg-white [&>option]:text-slate-900"
      >
        <option value="auto">Auto ({detected})</option>
        {options.map((code) => (
          <option key={code} value={code}>
            {code}
          </option>
        ))}
      </select>
    </label>
  );
}
