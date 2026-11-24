import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { guides, guideBySlug, guideForTrek, type GuideBlock } from "../../data/guides";
import { treks } from "../../data/treks";

const APP = path.join(process.cwd(), "src", "app");

/** Every piece of text in a guide, so links can be checked wherever they appear. */
function texts(block: GuideBlock): string[] {
  if ("p" in block) return [block.p];
  if ("list" in block) return block.list;
  if ("steps" in block) return block.steps.flatMap((s) => [s.title, s.text]);
  return block.table.rows.flat();
}

/** Does an internal path match a page in src/app (static folder or a known dynamic slug)? */
function pageExists(href: string): boolean {
  const clean = href.split(/[?#]/)[0].replace(/\/$/, "");
  const [, first, second] = clean.split("/");
  if (first === "treks" && second) return treks.some((t) => t.slug === second);
  if (first === "guides" && second) return !!guideBySlug(second);
  return existsSync(path.join(APP, ...clean.split("/").filter(Boolean), "page.tsx"));
}

describe("guides", () => {
  it("have unique slugs and non-empty sections", () => {
    expect(new Set(guides.map((g) => g.slug)).size).toBe(guides.length);
    for (const g of guides) {
      expect(g.sections.length).toBeGreaterThan(2);
      for (const s of g.sections) expect(s.blocks.length).toBeGreaterThan(0);
    }
  });

  it("only link to pages that exist", () => {
    for (const g of guides) {
      const all = [g.summary, ...g.sections.flatMap((s) => s.blocks.flatMap(texts))].join("\n");
      for (const [, , href] of all.matchAll(/\[([^\]]+)\]\((\/[^)]*)\)/g)) {
        expect(pageExists(href), `${g.slug} links to ${href}`).toBe(true);
      }
    }
  });

  it("take the Kuari Pass facts from the trek data", () => {
    const kuari = treks.find((t) => t.slug === "kuari-pass")!;
    const guide = guideForTrek("kuari-pass")!;
    expect(guide).toBeDefined();
    expect(guide.summary).toContain(kuari.maxAltitude.toLocaleString("en-IN"));
    expect(guide.summary).toContain(`${kuari.days} days`);
    const cheapest = Math.min(kuari.price, ...(kuari.packages ?? []).map((p) => p.price));
    expect(guide.summary).toContain(`Rs.${cheapest.toLocaleString("en-IN")}`);
  });
});
