import { describe, expect, it } from "vitest";
import { summarize } from "../adminSummary";
import type { AdminBooking, AdminPayment } from "../admin";

const booking = (o: Partial<AdminBooking>): AdminBooking => ({
  type: "trek", id: "b", ref: "B", userId: "u", customer: { name: "A", email: "a@x.in", phone: "" },
  item: "Kuari Pass", option: "", startDate: "2026-12-01", groupSize: "1", amount: 1_000_000, amountPaid: 0,
  paymentState: "unpaid", balanceDueDate: null, quoteRequired: false, status: "confirmed", message: "",
  createdAt: "2026-11-01T00:00:00Z", overdue: false, ...o,
});
const payment = (o: Partial<AdminPayment>): AdminPayment => ({
  id: "p", userId: "u", bookingType: "trek", bookingId: "b", bookingRef: "B", item: "Kuari Pass", customer: "A",
  orderId: "o", paymentId: "pay", amount: 300_000, kind: "advance", method: "upi", status: "paid",
  failureReason: null, createdAt: "2026-11-20T00:00:00Z", paidAt: "2026-11-20T00:00:00Z", ...o,
});

describe("admin overview summary", () => {
  const now = Date.parse("2026-11-24T12:00:00Z");
  const s = summarize(
    [
      booking({ id: "1", amountPaid: 300_000, startDate: "2026-11-30", createdAt: "2026-11-23T00:00:00Z" }),
      booking({ id: "2", status: "pending", amount: 500_000, startDate: "2027-01-10" }),
      booking({ id: "3", status: "cancelled", startDate: "2026-11-25" }),
      booking({ id: "4", overdue: true, startDate: "2026-12-20" }),
      booking({ id: "5", amount: null, quoteRequired: true, startDate: "2026-11-24" }),
    ],
    [
      payment({ amount: 300_000 }),
      payment({ amount: 200_000, paidAt: "2026-10-05T00:00:00Z" }),
      payment({ amount: 999, status: "failed" }),
      payment({ amount: 750_000, failureReason: "Needs refund: booking cancelled" }),
    ],
    "2026-11-24",
    now,
  );

  it("adds up money collected this month and in total, ignoring failed payments", () => {
    expect(s.collectedThisMonth).toBe(1_050_000);
    expect(s.collectedTotal).toBe(1_250_000);
  });
  it("counts what is still owed on live priced bookings only", () => {
    // 1: 7,000 left; 2: 5,000; 4: 10,000. Cancelled 3 and unpriced 5 don't count.
    expect(s.outstanding).toBe(700_000 + 500_000 + 1_000_000);
  });
  it("lists overdue, pending, refunds and this week's new bookings", () => {
    expect(s.overdue.map((b) => b.id)).toEqual(["4"]);
    expect(s.pending.map((b) => b.id)).toEqual(["2"]);
    expect(s.needsRefund).toHaveLength(1);
    expect(s.newThisWeek).toBe(1);
  });
  it("lists live departures in the next 14 days, soonest first", () => {
    // 4 starts on 20 Dec, outside the 14 days; 3 is cancelled.
    expect(s.upcoming.map((b) => b.id)).toEqual(["5", "1"]);
  });
});
