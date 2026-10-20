"use client";

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
        title="Prices are converted for display only — you are billed in INR."
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
