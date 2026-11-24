import { describe, expect, it } from "vitest";
import { tourPhotos } from "../tourPhotos";

describe("tourPhotos", () => {
  it("lists each tour photo once, without the .800 phone copies", () => {
    for (const slug of ["auli-winter-escape", "chopta-tungnath"]) {
      const photos = tourPhotos(slug);
      expect(photos.length).toBeGreaterThan(0);
      expect(photos.filter((p) => /\.800\.[a-z]+$/i.test(p))).toEqual([]);
      expect(new Set(photos).size).toBe(photos.length);
    }
  });

  it("returns nothing for an unknown tour", () => {
    expect(tourPhotos("no-such-tour")).toEqual([]);
  });
});
