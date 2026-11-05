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
