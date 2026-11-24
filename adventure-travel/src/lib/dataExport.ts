// Relative import (not "@/…") so vitest can load this file for the assembleExport tests.
import { createClient } from "./supabase/client";

// "Download my data" (DPDP Act right to access, GDPR art. 15/20). Runs in the browser with the
// user's own session, so row-level security decides what comes back: exactly the rows the
// user may read, nothing more. No server function needed.

/** Tables a signed-in user can read their own rows from (see the RLS policies in supabase-*.sql). */
export const EXPORT_TABLES = [
  { table: "profiles", owner: "id" },
  { table: "trek_bookings", owner: "user_id" },
  { table: "course_bookings", owner: "user_id" },
  { table: "activity_bookings", owner: "user_id" },
  { table: "payments", owner: "user_id" },
  { table: "activity_logs", owner: "user_id" },
] as const;

/** Held by us but not readable from the browser; the export says so instead of leaving them out silently. */
export const NOT_INCLUDED = [
  "Copies of the emails we sent you (they are in your inbox). Ask us on WhatsApp or by email for a copy.",
  "The history of status changes on your bookings. Ask us if you need it.",
  "Payment details held by Razorpay (card, UPI or bank). Razorpay keeps these, not us.",
];

export interface ExportAccount {
  id: string;
  email?: string | null;
  created_at?: string;
  last_sign_in_at?: string | null;
  user_metadata?: Record<string, unknown>;
}

/** Pure: builds the file's contents. Kept separate so it can be tested without a database. */
export function assembleExport(
  account: ExportAccount,
  tables: Record<string, unknown[]>,
  exportedAt: Date
) {
  return {
    about:
      "Your data held by Himalayan Arc Adventure (himalayanarcadventure.com). Amounts are in paise (100 paise = Rs.1). " +
      "To correct or delete it, see https://www.himalayanarcadventure.com/privacy.",
    exported_at: exportedAt.toISOString(),
    account: {
      id: account.id,
      email: account.email ?? null,
      created_at: account.created_at ?? null,
      last_sign_in_at: account.last_sign_in_at ?? null,
      details: account.user_metadata ?? {},
    },
    ...tables,
    not_included: NOT_INCLUDED,
  };
}

/** Reads everything the user can see about themselves and saves it as a JSON file. */
export async function downloadMyData(): Promise<void> {
  const supabase = createClient();
  if (!supabase) throw new Error("Accounts are temporarily unavailable. Please contact us on WhatsApp.");
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) throw new Error("Please sign in again to download your data.");
  const user = auth.user;

  const tables: Record<string, unknown[]> = {};
  for (const { table, owner } of EXPORT_TABLES) {
    const { data, error } = await supabase.from(table).select("*").eq(owner, user.id);
    if (error) throw new Error("Couldn't collect your data. Please try again, or ask us on WhatsApp.");
    tables[table] = data ?? [];
  }

  const file = assembleExport(user, tables, new Date());
  const blob = new Blob([JSON.stringify(file, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `himalayan-arc-my-data-${file.exported_at.slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
