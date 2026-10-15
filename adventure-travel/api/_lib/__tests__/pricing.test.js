import { describe, expect, it } from "vitest";
import pricing from "../pricing.js";

const {
  trekAmount,
  courseAmount,
  advanceAmount,
  balanceAmount,
  istDate,
  isFutureStart,
  isAdvanceAllowed,
  balanceDueDate,
  isValidIsoDate,
} = pricing;

// Shaped like api/_lib/catalog.js and api/_lib/courseCatalog.js.
const plainTrek = { name: "Kedarkantha Trek", price: 6000 };
const tieredTrek = {
  name: "Tungnath Trek",
  price: 5499,
  roomSharing: { "Quad sharing": 5499, "Triple sharing": 5999, "Double sharing": 6499 },
};
const tieredCourse = {
  name: "7-Day Skiing Course",
  price: 10000,
  tiers: [
    { id: "basic", priceBase: 10000, priceFull: 20000 },
    { id: "premium", priceBase: 15000, priceFull: 30000 },
  ],
};
const flatCourse = { name: "Backcountry", price: 35000, tiers: [] };

describe("trekAmount", () => {
  it("prices a plain trek per person in paise", () => {
    expect(trekAmount(plainTrek, 2, undefined)).toBe(1200000);
  });
  it("uses the chosen room tier", () => {
    expect(trekAmount(tieredTrek, 2, "Double sharing")).toBe(1299800);
  });
  it("falls back to the base tier when no room is chosen", () => {
    expect(trekAmount(tieredTrek, 1, undefined)).toBe(549900);
  });
  it("refuses unknown room labels and rooms on untiered treks", () => {
    expect(trekAmount(tieredTrek, 1, "Penthouse")).toBeNull();
    expect(trekAmount(plainTrek, 1, "Quad sharing")).toBeNull();
  });
  it("only prices groups of 1–10", () => {
    expect(trekAmount(plainTrek, 0)).toBeNull();
    expect(trekAmount(plainTrek, 1)).toBe(600000);
    expect(trekAmount(plainTrek, 10)).toBe(6000000);
    expect(trekAmount(plainTrek, 11)).toBeNull();
    expect(trekAmount(plainTrek, 2.5)).toBeNull();
  });
  it("refuses a missing trek", () => {
    expect(trekAmount(undefined, 1)).toBeNull();
  });
});

describe("courseAmount", () => {
  it("uses the tier's base or full-stay price", () => {
    expect(courseAmount(tieredCourse, "premium", "base", 1)).toBe(1500000);
    expect(courseAmount(tieredCourse, "premium", "full", 2)).toBe(6000000);
  });
  it("defaults to the first tier for an unknown tier id", () => {
    expect(courseAmount(tieredCourse, "nope", "base", 1)).toBe(1000000);
  });
  it("uses the flat price when the course has no tiers", () => {
    expect(courseAmount(flatCourse, undefined, undefined, 1)).toBe(3500000);
  });
  it("only prices groups of 1–20", () => {
    expect(courseAmount(flatCourse, undefined, undefined, 20)).toBe(70000000);
    expect(courseAmount(flatCourse, undefined, undefined, 21)).toBeNull();
  });
});

describe("advance and balance", () => {
  it("takes 30% rounded up to a whole rupee", () => {
    // Rs.5,499 × 2 = Rs.10,998 → 30% = Rs.3,299.40 → Rs.3,300
    expect(advanceAmount(1099800)).toBe(330000);
    expect(advanceAmount(1200000)).toBe(360000);
  });
  it("leaves the rest as balance and never goes negative", () => {
    expect(balanceAmount(1099800, 330000)).toBe(769800);
    expect(balanceAmount(1000, 5000)).toBe(0);
  });
});

describe("dates in India time", () => {
  it("rolls over to the next day at 18:30 UTC", () => {
    expect(istDate(new Date("2026-10-15T18:29:00Z"))).toBe("2026-10-15");
    expect(istDate(new Date("2026-10-15T18:31:00Z"))).toBe("2026-10-16");
  });
  it("validates ISO dates", () => {
    expect(isValidIsoDate("2027-01-08")).toBe(true);
    expect(isValidIsoDate("2027-02-30")).toBe(false);
    expect(isValidIsoDate("08-01-2027")).toBe(false);
  });
  it("requires a start date after today", () => {
    const now = new Date("2026-10-16T06:00:00Z"); // 16 Oct in IST
    expect(isFutureStart("2026-10-16", now)).toBe(false);
    expect(isFutureStart("2026-10-17", now)).toBe(true);
  });
  it("allows an advance only when the start is more than 15 days away and nothing is paid", () => {
    const now = new Date("2026-10-16T06:00:00Z");
    expect(isAdvanceAllowed("2026-10-31", 0, now)).toBe(false); // exactly 15 days
    expect(isAdvanceAllowed("2026-11-01", 0, now)).toBe(true); // 16 days
    expect(isAdvanceAllowed("2026-11-01", 330000, now)).toBe(false); // already paid something
  });
  it("puts the balance due date 15 days before the start", () => {
    expect(balanceDueDate("2027-01-08")).toBe("2026-12-24");
    expect(balanceDueDate("2027-03-01")).toBe("2027-02-14");
  });
});
