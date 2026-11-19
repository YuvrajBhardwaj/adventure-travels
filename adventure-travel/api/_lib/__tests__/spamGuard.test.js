import { describe, expect, it } from "vitest";
import spamGuard from "../spamGuard.js";

const { isHoneypotHit, tooManyCourseBookings } = spamGuard;

// Records the query and answers with the given count/error.
function fakeDb(result) {
  const calls = {};
  const q = {
    select: (_c, opts) => ((calls.opts = opts), q),
    eq: (col, v) => ((calls.eq = [col, v]), q),
    gte: (col, v) => ((calls.gte = [col, v]), Promise.resolve(result)),
  };
  return { calls, from: (t) => ((calls.table = t), q) };
}

describe("isHoneypotHit", () => {
  it("flags a filled hidden field only", () => {
    expect(isHoneypotHit({ website: "http://spam.example" })).toBe(true);
    expect(isHoneypotHit({ website: "  " })).toBe(false);
    expect(isHoneypotHit({ website: "" })).toBe(false);
    expect(isHoneypotHit({})).toBe(false);
    expect(isHoneypotHit(undefined)).toBe(false);
  });
});

describe("tooManyCourseBookings", () => {
  const now = Date.parse("2026-11-20T12:00:00Z");

  it("counts this email's course bookings in the last hour", async () => {
    const db = fakeDb({ count: 2, error: null });
    expect(await tooManyCourseBookings(db, "a@b.in", now)).toBe(false);
    expect(db.calls.table).toBe("course_bookings");
    expect(db.calls.eq).toEqual(["contact_email", "a@b.in"]);
    expect(db.calls.gte).toEqual(["created_at", "2026-11-20T11:00:00.000Z"]);
  });

  it("refuses from the third booking on", async () => {
    expect(await tooManyCourseBookings(fakeDb({ count: 3, error: null }), "a@b.in", now)).toBe(true);
  });

  it("throws when the database fails, rather than letting spam through", async () => {
    await expect(tooManyCourseBookings(fakeDb({ count: null, error: new Error("down") }), "a@b.in", now)).rejects.toThrow("down");
  });
});
