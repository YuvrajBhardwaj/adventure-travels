import { describe, expect, it } from "vitest";
import { assembleExport, EXPORT_TABLES, NOT_INCLUDED } from "../dataExport";

describe("assembleExport", () => {
  const account = {
    id: "u1",
    email: "a@example.com",
    created_at: "2026-11-01T00:00:00Z",
    user_metadata: { full_name: "A", phone: "+91 98" },
  };
  const tables = Object.fromEntries(EXPORT_TABLES.map(({ table }) => [table, [{ table }]]));
  const out = assembleExport(account, tables, new Date("2026-11-24T10:00:00Z"));

  it("includes the account and every exported table", () => {
    expect(out.account).toMatchObject({ id: "u1", email: "a@example.com", details: account.user_metadata });
    for (const { table } of EXPORT_TABLES) expect(out).toHaveProperty(table);
  });

  it("dates the export and says what isn't in it", () => {
    expect(out.exported_at).toBe("2026-11-24T10:00:00.000Z");
    expect(out.not_included).toEqual(NOT_INCLUDED);
  });

  it("only exports tables the user can read under RLS (no outbox or audit tables)", () => {
    const names: string[] = EXPORT_TABLES.map((t) => t.table);
    expect(names).not.toContain("notifications");
    expect(names).not.toContain("booking_status_events");
  });
});
