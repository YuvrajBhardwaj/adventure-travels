import { describe, expect, it } from "vitest";
import notify from "../notify.js";

const { templates, WHATSAPP_LINE } = notify;

const base = {
  bookingId: "1a2b3c4d-0000-0000-0000-000000000000",
  bookingType: "trek",
  item: "Tungnath Trek",
  option: "Double sharing",
  name: "Asha",
  email: "asha@example.com",
  phone: "9608467877",
  date: "2027-01-08",
  groupSize: 2,
};

const customerKinds = ["booking_received", "payment_receipt", "balance_reminder_7d", "balance_reminder_due"];

const contexts = {
  booking_received: { ...base, amount: 1299800, advanceAllowed: true, advanceAmount: 390000 },
  booking_alert: { ...base, amount: null, message: "Veg meals" },
  payment_receipt: { ...base, kind: "advance", paid: 390000, total: 1299800, totalPaid: 390000, balanceDueDate: "2026-12-24", method: "upi" },
  payment_alert: { ...base, kind: "full", paid: 1299800, total: 1299800, totalPaid: 1299800, paymentState: "fully_paid" },
  balance_reminder_7d: { ...base, balance: 909800, dueDate: "2026-12-24" },
  balance_reminder_due: { ...base, balance: 909800, dueDate: "2026-12-24" },
};

describe("notification templates", () => {
  it("covers exactly the six contract kinds", () => {
    expect(Object.keys(templates).sort()).toEqual(Object.keys(contexts).sort());
  });

  for (const [kind, ctx] of Object.entries(contexts)) {
    it(`${kind} renders a subject and body`, () => {
      const { subject, bodyText } = templates[kind](ctx);
      expect(subject.length).toBeGreaterThan(5);
      expect(bodyText.length).toBeGreaterThan(20);
      expect(bodyText).not.toMatch(/undefined|NaN/);
    });
  }

  it.each(customerKinds)("%s includes the WhatsApp fallback", (kind) => {
    expect(templates[kind](contexts[kind]).bodyText).toContain(WHATSAPP_LINE);
  });

  it("shows amounts in INR with Indian grouping", () => {
    expect(templates.booking_received(contexts.booking_received).bodyText).toContain("Rs.12,998");
  });

  it("an advance receipt shows the balance, due date and non-refundable note", () => {
    const { bodyText } = templates.payment_receipt(contexts.payment_receipt);
    expect(bodyText).toContain("Rs.9,098");
    expect(bodyText).toContain("24 Dec 2026");
    expect(bodyText).toMatch(/non-refundable/);
    expect(bodyText).toContain("kind=balance");
  });

  it("a quote booking says a quote will follow instead of a price", () => {
    const { bodyText } = templates.booking_alert(contexts.booking_alert);
    expect(bodyText).toContain("QUOTE REQUIRED");
  });

  it("a course reminder links to the course checkout", () => {
    const { bodyText } = templates.balance_reminder_7d({ ...contexts.balance_reminder_7d, bookingType: "course" });
    expect(bodyText).toContain("checkout?course=");
  });
});
