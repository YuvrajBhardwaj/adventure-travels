"use client";

import { useCurrency } from "@/contexts/CurrencyContext";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

/**
 * "Nationality" on booking and enquiry forms. It is the site-wide price-list setting, so the
 * prices on the page always match what the form will be charged; the server prices the booking
 * from the value sent with it (foreign nationals pay 3×, api/_lib/pricing.js).
 */
export default function NationalityField({ id, className }: { id: string; className?: string }) {
  const { nationality, setNationality } = useCurrency();
  return (
    <div className={className}>
      <Label htmlFor={id}>Nationality</Label>
      <Select id={id} value={nationality} onChange={(e) => setNationality(e.target.value as "indian" | "foreign")}>
        <option value="indian">Indian national</option>
        <option value="foreign">Foreign national</option>
      </Select>
      {nationality === "foreign" && (
        <p className="mt-1.5 text-xs text-muted">Foreign nationals pay a higher price that covers their permits and local arrangements.</p>
      )}
    </div>
  );
}
