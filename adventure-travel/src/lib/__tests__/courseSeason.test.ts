import { describe, expect, it } from "vitest";
import { courseSeason, courseStartDates } from "../courseSeason";
import { courses } from "../../data/courses";

describe("courseSeason", () => {
  it("reads a season that wraps past December", () => {
    expect(courseSeason("Dec 2026 — Mar 2027")).toEqual({ from: "2026-12-01", to: "2027-03-31" });
  });
  it("reads a season with one year", () => {
    expect(courseSeason("Jan — Mar 2027")).toEqual({ from: "2027-01-01", to: "2027-03-31" });
  });
  it("returns null for text it can't read", () => {
    expect(courseSeason("On request")).toBeNull();
  });
  it("can read every course's dates", () => {
    for (const c of courses) expect(courseSeason(c.dates), c.slug).not.toBeNull();
  });
});

describe("courseStartDates", () => {
  it("starts at the season's first day when today is well before it", () => {
    const d = courseStartDates("Dec 2026 — Mar 2027", 7, "2026-11-13");
    expect(d[0]).toBe("2026-12-01");
    expect(d.at(-1)).toBe("2027-03-25"); // a 7-day course ends on 31 Mar
  });
  it("keeps the lead time inside the season", () => {
    expect(courseStartDates("Dec 2026 — Mar 2027", 7, "2027-01-10")[0]).toBe("2027-01-13");
  });
  it("is empty after the season", () => {
    expect(courseStartDates("Dec 2026 — Mar 2027", 7, "2027-04-01")).toEqual([]);
  });
});
