import { describe, expect, it } from "vitest";
import { seasonMonths } from "../season";

describe("seasonMonths", () => {
  it("reads every bestSeason style in src/data/treks.ts", () => {
    expect(seasonMonths("Dec–Apr (snow trek)")).toEqual([0, 1, 2, 3, 11]);
    expect(seasonMonths("Dec-March (Snow Trek)")).toEqual([0, 1, 2, 11]);
    expect(seasonMonths("Mar–Jun & Sept–Dec")).toEqual([2, 3, 4, 5, 8, 9, 10, 11]);
    expect(seasonMonths("May–Jun, Sep–Nov")).toEqual([4, 5, 8, 9, 10]);
    expect(seasonMonths("Mid-May to October")).toEqual([4, 5, 6, 7, 8, 9]);
    expect(seasonMonths("Oct–Feb")).toEqual([0, 1, 9, 10, 11]);
  });

  it("wraps past December and ignores bracketed notes", () => {
    expect(seasonMonths("Sep–Jun (snow Dec–Mar)")).toEqual([0, 1, 2, 3, 4, 5, 8, 9, 10, 11]);
  });

  it("returns nothing for text without a month range", () => {
    expect(seasonMonths("All year")).toEqual([]);
  });
});
