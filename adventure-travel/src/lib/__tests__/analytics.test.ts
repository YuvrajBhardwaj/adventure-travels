import { describe, expect, it } from "vitest";
import { stripPageView } from "../analytics";

const B = "https://www.himalayanarcadventure.com";

describe("stripPageView (analytics privacy filter)", () => {
  it("drops booking ids and reset codes from the address", () => {
    expect(stripPageView({ type: "pageview", url: `${B}/checkout?booking=85bc8880-ca05-407a-a91c-4b0d03b0f25c` })?.url).toBe(`${B}/checkout`);
    expect(stripPageView({ type: "pageview", url: `${B}/reset-password?token_hash=abc&type=recovery#x` })?.url).toBe(`${B}/reset-password`);
  });

  it("keeps ordinary pages as they are", () => {
    expect(stripPageView({ type: "pageview", url: `${B}/treks/kuari-pass` })).toEqual({ type: "pageview", url: `${B}/treks/kuari-pass` });
  });

  it("doesn't count the admin area", () => {
    expect(stripPageView({ type: "pageview", url: `${B}/admin` })).toBeNull();
    expect(stripPageView({ type: "pageview", url: `${B}/admin/payments?x=1` })).toBeNull();
    expect(stripPageView({ type: "pageview", url: `${B}/administration-guide` })).not.toBeNull();
  });
});
