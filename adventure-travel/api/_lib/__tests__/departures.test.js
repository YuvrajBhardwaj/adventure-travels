import { describe, expect, it } from "vitest";
import departures from "../departures.js";

const { seatProblem, findDeparture, seatsFor } = departures;

const fakeDb = (result) => ({ rpc: async () => result });

describe("seatProblem", () => {
  it("lets any date through that isn't a listed batch (a private departure)", () => {
    expect(seatProblem(null, 4)).toBeNull();
  });

  it("allows a group that fits", () => {
    expect(seatProblem({ closed: false, seats_left: 4 }, 4)).toBeNull();
  });

  it("refuses closed and full batches, and groups bigger than the seats left", () => {
    expect(seatProblem({ closed: true, seats_left: 10 }, 1)).toMatch(/closed/);
    expect(seatProblem({ closed: false, seats_left: 0 }, 1)).toMatch(/full/);
    expect(seatProblem({ closed: false, seats_left: 1 }, 2)).toBe(
      "Only 1 seat is left on this batch. Make the group smaller or pick another date."
    );
    expect(seatProblem({ closed: false, seats_left: 3 }, 5)).toMatch(/^Only 3 seats are left/);
  });
});

describe("seatsFor", () => {
  it("reads stored group sizes, counting a 10+ quote as 10", () => {
    expect(seatsFor("4")).toBe(4);
    expect(seatsFor("10+")).toBe(10);
    expect(seatsFor(12)).toBe(12);
    expect(seatsFor("")).toBe(1);
  });
});

describe("findDeparture", () => {
  it("finds the batch on that start date", async () => {
    const db = fakeDb({ data: [{ start_date: "2026-11-07", seats_left: 3 }, { start_date: "2026-11-14", seats_left: 9 }], error: null });
    expect(await findDeparture(db, "kuari-pass", "2026-11-14")).toEqual({ start_date: "2026-11-14", seats_left: 9 });
    expect(await findDeparture(db, "kuari-pass", "2026-11-08")).toBeNull();
  });

  it("treats a database without the departures migration as having no batches", async () => {
    expect(await findDeparture(fakeDb({ data: null, error: { code: "PGRST202" } }), "kuari-pass", "2026-11-07")).toBeNull();
  });

  it("passes other database errors on", async () => {
    await expect(findDeparture(fakeDb({ data: null, error: { code: "500", message: "down" } }), "kuari-pass", "2026-11-07")).rejects.toEqual({
      code: "500",
      message: "down",
    });
  });
});

describe("holdSeats", () => {
  const booking = { id: "b1", slug: "kuari-pass", startDate: "2026-11-07", seats: 3 };
  const rpcDb = (handlers) => ({ rpc: async (name, args) => handlers[name](args) });

  it("holds the seats and passes on the hold's end time", async () => {
    let called;
    const db = rpcDb({
      hold_trek_seats: (args) => {
        called = args;
        return { data: [{ ok: true, closed: false, seats_left: 2, held_until: "2026-10-29T06:00:00Z" }], error: null };
      },
    });
    expect(await departures.holdSeats(db, booking)).toEqual({ problem: null, heldUntil: "2026-10-29T06:00:00Z" });
    expect(called).toEqual({ p_booking: "b1", p_minutes: departures.HOLD_MINUTES });
  });

  it("explains why when the group doesn't fit or the batch is closed", async () => {
    const short = rpcDb({ hold_trek_seats: () => ({ data: [{ ok: false, closed: false, seats_left: 1, held_until: null }], error: null }) });
    expect(await departures.holdSeats(short, booking)).toEqual({
      problem: "Only 1 seat is left on this batch. Make the group smaller or pick another date.",
      heldUntil: null,
    });
    const closed = rpcDb({ hold_trek_seats: () => ({ data: [{ ok: false, closed: true, seats_left: 0, held_until: null }], error: null }) });
    expect((await departures.holdSeats(closed, booking)).problem).toMatch(/closed/);
  });

  it("lets a private-departure date through with no hold", async () => {
    const db = rpcDb({ hold_trek_seats: () => ({ data: [{ ok: true, closed: false, seats_left: null, held_until: null }], error: null }) });
    expect(await departures.holdSeats(db, booking)).toEqual({ problem: null, heldUntil: null });
  });

  it("falls back to the plain seat check before the migration is run", async () => {
    const db = rpcDb({
      hold_trek_seats: () => ({ data: null, error: { code: "PGRST202" } }),
      trek_departure_availability: () => ({ data: [{ start_date: "2026-11-07", closed: false, seats_left: 0 }], error: null }),
    });
    expect((await departures.holdSeats(db, booking)).problem).toMatch(/full/);
  });

  it("passes other database errors on", async () => {
    const db = rpcDb({ hold_trek_seats: () => ({ data: null, error: { code: "500", message: "down" } }) });
    await expect(departures.holdSeats(db, booking)).rejects.toEqual({ code: "500", message: "down" });
  });
});

describe("holdDecision (seat-hold limits)", () => {
  const { holdDecision, HOLD_LIMITS } = departures;
  const now = new Date("2026-11-25T10:00:00Z");
  const inMin = (m) => new Date(now.getTime() + m * 60_000).toISOString();

  it("reuses a hold with time left instead of extending it", () => {
    expect(holdDecision({ heldUntil: inMin(10), now, recentHolds: 99, otherActiveHolds: 99 }).action).toBe("reuse");
  });

  it("takes a fresh hold when none is running or it is nearly over", () => {
    expect(holdDecision({ heldUntil: null, now, recentHolds: 0, otherActiveHolds: 0 }).action).toBe("hold");
    expect(holdDecision({ heldUntil: inMin(2), now, recentHolds: 1, otherActiveHolds: 1 }).action).toBe("hold");
  });

  it("refuses after the daily number of holds for one booking", () => {
    const d = holdDecision({ heldUntil: null, now, recentHolds: HOLD_LIMITS.perBookingPerDay, otherActiveHolds: 0 });
    expect(d.action).toBe("refuse");
    expect(d.message).toMatch(/WhatsApp/);
  });

  it("refuses when the user already holds seats on too many other bookings", () => {
    expect(holdDecision({ heldUntil: null, now, recentHolds: 0, otherActiveHolds: HOLD_LIMITS.otherActive }).action).toBe("refuse");
  });
});

describe("dateProblem (generated dates limited to the group size)", () => {
  const { dateProblem } = departures;
  // A fake db: no listed batch on the date; `taken` seats on generated dates.
  const db = (taken, listed = []) => ({
    rpc: async (name) =>
      name === "trek_departure_availability"
        ? { data: listed, error: null }
        : { data: [{ start_date: "2026-12-02", seats_taken: taken }], error: null },
  });

  it("allows a group that fits the trek's group size", async () => {
    expect(await dateProblem(db(10), "kuari-pass", "2026-12-02", 5, 15)).toBeNull();
  });

  it("refuses a group that doesn't fit, saying how many seats are left", async () => {
    expect(await dateProblem(db(12), "kuari-pass", "2026-12-02", 4, 15)).toMatch(/Only 3 seats are left/);
    expect(await dateProblem(db(15), "kuari-pass", "2026-12-02", 1, 15)).toMatch(/full/);
  });

  it("uses a listed batch's own seats instead", async () => {
    const listed = [{ start_date: "2026-12-02", seats_left: 1, closed: false }];
    expect(await dateProblem(db(0, listed), "kuari-pass", "2026-12-02", 2, 15)).toMatch(/Only 1 seat is left/);
  });

  it("doesn't limit anything when the counts function isn't deployed yet", async () => {
    const missing = { rpc: async (name) => (name === "trek_departure_availability" ? { data: [], error: null } : { data: null, error: { code: "PGRST202" } }) };
    expect(await dateProblem(missing, "kuari-pass", "2026-12-02", 10, 15)).toBeNull();
  });
});
