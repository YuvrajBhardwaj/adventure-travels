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
