import { describe, expect, it } from "vitest";
import {
  batchLabel,
  datesBadge,
  endDate,
  groupByMonth,
  inSeason,
  isBookable,
  mergeDepartures,
  seasonDates,
  seasonStrip,
  seatLabel,
  seatStatus,
  todayInIndia,
  weeklyDates,
  windowsLabel,
  type Departure,
} from "../departures";
import { seasonMonths, MONTHS } from "../season";
import { treks } from "../../data/treks";
import { DEPARTURE_CALENDAR, MONTH_HIGHLIGHTS } from "../../data/trekSeasons";

const dep = (start: string, seatsLeft: number, closed = false): Departure => ({
  id: start,
  start,
  capacity: 15,
  seatsLeft,
  closed,
  tag: "",
});

describe("seat status", () => {
  it("labels open, nearly full, full and closed batches", () => {
    expect([seatStatus(dep("2026-11-07", 9)), seatLabel(dep("2026-11-07", 9))]).toEqual(["available", "Available"]);
    expect([seatStatus(dep("2026-11-07", 3)), seatLabel(dep("2026-11-07", 3))]).toEqual(["few", "Filling fast"]);
    expect(seatLabel(dep("2026-11-07", 1))).toBe("Filling fast");
    expect([seatStatus(dep("2026-11-07", 0)), seatLabel(dep("2026-11-07", 0))]).toEqual(["full", "Full"]);
  });

  it("treats a closed batch as closed even with seats left", () => {
    expect(seatStatus(dep("2026-11-07", 12, true))).toBe("closed");
    expect(isBookable(dep("2026-11-07", 12, true))).toBe(false);
    expect(isBookable(dep("2026-11-07", 0))).toBe(false);
    expect(isBookable(dep("2026-11-07", 2))).toBe(true);
  });
});

describe("batch dates", () => {
  it("counts the start day as day 1, across month and year ends", () => {
    expect(endDate("2026-11-07", 5)).toBe("2026-11-11");
    expect(endDate("2026-11-28", 6)).toBe("2026-12-03");
    expect(endDate("2026-12-29", 5)).toBe("2027-01-02");
    expect(endDate("2027-02-27", 3)).toBe("2027-03-01");
  });

  it("formats a batch with weekdays", () => {
    expect(batchLabel("2026-11-07", 5)).toBe("Sat 7 Nov – Wed 11 Nov");
    expect(batchLabel("2026-12-26", 9)).toBe("Sat 26 Dec – Sun 3 Jan");
  });

  it("lists every Saturday, or every other one, in a range", () => {
    expect(weeklyDates("2026-10-21", "2026-11-14", 6)).toEqual(["2026-10-24", "2026-10-31", "2026-11-07", "2026-11-14"]);
    expect(weeklyDates("2026-10-24", "2026-11-30", 6, 2)).toEqual(["2026-10-24", "2026-11-07", "2026-11-21"]);
    expect(weeklyDates("2026-11-01", "2026-10-01", 6)).toEqual([]);
  });
});

describe("groupByMonth", () => {
  it("groups by start month, earliest first, whatever order they arrive in", () => {
    const months = groupByMonth([dep("2026-12-05", 4), dep("2026-11-21", 2), dep("2026-11-07", 9), dep("2027-01-02", 15)]);
    expect(months.map((m) => [m.key, m.year, m.month, m.departures.map((d) => d.start)])).toEqual([
      ["2026-11", 2026, 10, ["2026-11-07", "2026-11-21"]],
      ["2026-12", 2026, 11, ["2026-12-05"]],
      ["2027-01", 2027, 0, ["2027-01-02"]],
    ]);
  });
});

describe("datesBadge", () => {
  it("is empty with no batches, and says waitlist when none can be booked", () => {
    expect(datesBadge([])).toBeNull();
    expect(datesBadge([dep("2026-11-07", 0), dep("2026-11-14", 5, true)])).toBe("waitlist");
  });

  it("says filling fast only when one of the next three open batches is nearly full", () => {
    expect(datesBadge([dep("2026-11-07", 9), dep("2026-11-14", 2)])).toBe("filling");
    expect(datesBadge([dep("2026-11-07", 9), dep("2026-11-14", 9), dep("2026-11-21", 9), dep("2026-11-28", 1)])).toBe("open");
  });
});

describe("season data", () => {
  it("gives every in-season month of every trek a highlight, and no other month", () => {
    for (const trek of treks) {
      const highlights = MONTH_HIGHLIGHTS[trek.slug];
      expect(highlights, trek.slug).toBeDefined();
      const inSeason = seasonMonths(trek.bestSeason).map((i) => MONTHS[i]);
      expect(Object.keys(highlights).sort(), trek.slug).toEqual([...inSeason].sort());
    }
  });

  it("builds a Jan–Dec strip", () => {
    const strip = seasonStrip("Sep–Jun (snow Dec–Mar)", MONTH_HIGHLIGHTS["kuari-pass"]);
    expect(strip).toHaveLength(12);
    expect(strip.filter((m) => !m.inSeason).map((m) => m.name)).toEqual(["Jul", "Aug"]);
    expect(strip[10]).toEqual({ name: "Nov", month: 10, inSeason: true, highlight: "Clearest views" });
  });
});

describe("season departures", () => {
  it("starts every day of the season, after the lead time", () => {
    const dates = seasonDates({ cadence: "daily", windows: [["11-01", "11-30"]] }, "2026-11-06");
    expect(dates[0]).toBe("2026-11-09");
    expect(dates.slice(0, 22).at(-1)).toBe("2026-11-30");
    expect(dates.filter((d) => d.startsWith("2026-11"))).toHaveLength(22);
    expect(dates.at(-1)).toBe("2027-11-06");
  });

  it("wraps a window past December and skips the monsoon", () => {
    const dates = seasonDates(DEPARTURE_CALENDAR["kuari-pass"], "2026-11-06");
    const months = new Set(dates.map((d) => d.slice(5, 7)));
    expect(months.has("07")).toBe(false);
    expect(months.has("08")).toBe(false);
    expect(dates).toContain("2027-01-01");
    expect(dates).toContain("2027-06-30");
    expect(dates).not.toContain("2027-09-14");
    expect(dates).toContain("2027-09-15");
  });

  it("starts expeditions on Saturdays only, at least three weeks out", () => {
    const dates = seasonDates(DEPARTURE_CALENDAR["kalindi-khal"], "2027-05-20");
    expect(dates.every((d) => new Date(`${d}T00:00:00Z`).getUTCDay() === 6)).toBe(true);
    expect(dates[0] >= "2027-06-10").toBe(true);
    expect(new Set(dates.map((d) => d.slice(5, 7)))).toEqual(new Set(["06", "09"]));
  });

  it("checks a date against the season windows", () => {
    const cal = DEPARTURE_CALENDAR.kedarkantha;
    expect(inSeason(cal, "2027-01-15")).toBe(true);
    expect(inSeason(cal, "2027-05-01")).toBe(false);
    expect(windowsLabel(cal)).toBe("1 Dec – 30 Apr");
    expect(windowsLabel(DEPARTURE_CALENDAR["kalindi-khal"])).toBe("1 Jun – 30 Jun & 1 Sep – 30 Sep");
  });

  it("lets admin rows override a date and keeps extra admin dates", () => {
    const list = mergeDepartures(["2026-11-09", "2026-11-10"], [dep("2026-11-10", 0), dep("2026-11-08", 5)], 15);
    expect(list.map((d) => [d.start, seatStatus(d)])).toEqual([
      ["2026-11-08", "available"],
      ["2026-11-09", "available"],
      ["2026-11-10", "full"],
    ]);
    expect(list[1]).toMatchObject({ id: "gen-2026-11-09", capacity: 15, seatsLeft: 15, closed: false });
  });

  it("uses India's date, not the visitor's", () => {
    expect(todayInIndia(new Date("2026-11-06T20:00:00Z"))).toBe("2026-11-07");
    expect(todayInIndia(new Date("2026-11-06T10:00:00Z"))).toBe("2026-11-06");
  });

  it("gives every trek a calendar that sits inside its best season", () => {
    for (const trek of treks) {
      const cal = DEPARTURE_CALENDAR[trek.slug];
      expect(cal, trek.slug).toBeDefined();
      const season = new Set(seasonMonths(trek.bestSeason));
      const dates = seasonDates(cal, "2026-01-01", 730);
      expect(dates.length, trek.slug).toBeGreaterThan(0);
      for (const d of dates) expect(season.has(Number(d.slice(5, 7)) - 1), `${trek.slug} ${d}`).toBe(true);
    }
  });
});
