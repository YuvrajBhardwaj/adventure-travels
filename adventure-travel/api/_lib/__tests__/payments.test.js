import { describe, expect, it } from "vitest";
import payments from "../payments.js";

const { hmacHex, safeEqual } = payments;

describe("Razorpay signature helpers", () => {
  it("computes the HMAC-SHA256 hex digest Razorpay uses", () => {
    // order_id|payment_id signed with the key secret, as in Razorpay's docs.
    const sig = hmacHex("secret", "order_123|pay_456");
    expect(sig).toMatch(/^[0-9a-f]{64}$/);
    expect(hmacHex("secret", "order_123|pay_456")).toBe(sig);
    expect(hmacHex("other", "order_123|pay_456")).not.toBe(sig);
  });

  it("safeEqual accepts identical strings", () => {
    expect(safeEqual("abc123", "abc123")).toBe(true);
  });

  it("safeEqual rejects different strings of the same length", () => {
    expect(safeEqual("abc123", "abc124")).toBe(false);
  });

  it("safeEqual rejects different lengths without throwing", () => {
    expect(safeEqual("abc", "abcd")).toBe(false);
  });

  it("safeEqual treats missing input as empty and never matches a real signature", () => {
    expect(safeEqual(undefined, "abc")).toBe(false);
    expect(safeEqual(undefined, undefined)).toBe(true); // both empty — callers must reject empty signatures first
  });
});
