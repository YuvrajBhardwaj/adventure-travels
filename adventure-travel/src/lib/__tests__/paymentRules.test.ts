import { describe, expect, it } from "vitest";
import { advanceAmount, balanceDueDate, isAdvanceAllowed, isOverdue, istToday } from "../paymentRules";
// The server's rules. The browser copy is display-only, so it must never disagree with what we charge.
import pricing from "../../../api/_lib/pricing.js";

describe("paymentRules mirrors the server's money rules", () => {
  it("rounds the 30% advance exactly like the server", () => {
    for (let paise = 100; paise <= 2_000_000; paise += 137) {
      expect(advanceAmount(paise)).toBe(pricing.advanceAmount(paise));
    }
  });

  it("agrees on today's date in India around midnight", () => {
    for (const t of ["2026-10-15T18:29:00Z", "2026-10-15T18:30:00Z", "2026-10-15T18:31:00Z", "2026-12-31T18:30:00Z"]) {
      expect(istToday(new Date(t))).toBe(pricing.istDate(new Date(t)));
    }
  });

  it("agrees on when an advance is allowed (the 15/16-day edge)", () => {
    const now = new Date("2026-10-16T06:00:00Z");
    for (let d = -2; d <= 40; d++) {
      const start = pricing.addDays("2026-10-16", d);
      for (const paid of [0, 330000]) {
        expect(isAdvanceAllowed(start, paid, now)).toBe(pricing.isAdvanceAllowed(start, paid, now));
      }
    }
  });

  it("puts the balance due date on the same day", () => {
    for (const start of ["2027-01-08", "2027-03-01", "2026-12-31", "2028-03-14"]) {
      expect(balanceDueDate(start)).toBe(pricing.balanceDueDate(start));
    }
  });

  it("calls a balance overdue only after its due date", () => {
    expect(isOverdue("advance_paid", "2026-11-15", "2026-11-16")).toBe(true);
    expect(isOverdue("advance_paid", "2026-11-16", "2026-11-16")).toBe(false);
    expect(isOverdue("fully_paid", "2026-11-01", "2026-11-16")).toBe(false);
  });
});
