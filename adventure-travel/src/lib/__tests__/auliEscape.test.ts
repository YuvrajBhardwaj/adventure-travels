import { describe, expect, it } from "vitest";
import { AULI_GROUP_OFFERS, groupOffer } from "../../data/auliEscape";

describe("Auli Winter Escape group offers", () => {
  it("match the owner's price table", () => {
    expect(AULI_GROUP_OFFERS.map((o) => groupOffer(o))).toEqual([
      { total: 30000, savings: 10000, percent: 25 },
      { total: 36000, savings: 14000, percent: 28 },
      { total: 40000, savings: 20000, percent: 33.3 },
      { total: 64000, savings: 36000, percent: 36 },
    ]);
  });
});
