const pricing = require("./_lib/pricing");
const notify = require("./_lib/notify");
const { safeEqual } = require("./_lib/payments");
const { getAdmin } = require("./_lib/supabaseAdmin");

const MAX_ATTEMPTS = 3;
const RETRY_BATCH = 50;
// An email queued this recently may still be mid-send by the request that queued it.
const PENDING_GRACE_MS = 10 * 60 * 1000;

const TYPES = [
  { type: "trek", table: "trek_bookings", item: (b) => b.trek_name },
  { type: "course", table: "course_bookings", item: (b) => b.course_name },
];

async function emailsFor(db, rows) {
  const ids = [...new Set(rows.map((r) => r.user_id).filter(Boolean))];
  if (ids.length === 0) return new Map();
  const { data, error } = await db.from("profiles").select("id, full_name, email").in("id", ids);
  if (error) throw error;
  return new Map((data || []).map((p) => [p.id, p]));
}

// 1–2. Balance reminders 7 days before and on the due date (FR-020d). The dedupe key makes
// a second run on the same day send nothing.
async function queueReminders(db, today) {
  const in7 = pricing.addDays(today, 7);
  let reminders = 0;
  for (const t of TYPES) {
    const { data: rows, error } = await db
      .from(t.table)
      .select("*")
      .eq("payment_state", "advance_paid")
      .neq("status", "cancelled")
      .in("balance_due_date", [today, in7]);
    if (error) throw error;
    if (!rows || rows.length === 0) continue;

    const profiles = await emailsFor(db, rows);
    for (const b of rows) {
      const kind = b.balance_due_date === in7 ? "balance_reminder_7d" : "balance_reminder_due";
      const profile = profiles.get(b.user_id);
      const recipient = t.type === "course" ? b.contact_email || profile?.email : profile?.email;
      const { queued } = await notify.enqueueAndSend(db, [
        {
          kind,
          dedupeKey: `${kind}:${b.id}`,
          recipient,
          replyTo: notify.businessInbox(),
          bookingType: t.type,
          bookingId: b.id,
          ctx: {
            bookingType: t.type,
            bookingId: b.id,
            item: t.item(b),
            name: t.type === "course" ? b.contact_name : profile?.full_name,
            balance: pricing.balanceAmount(b.amount, b.amount_paid),
            dueDate: b.balance_due_date,
          },
        },
      ]);
      reminders += queued;
    }
  }
  return reminders;
}

// 3. Retry failed emails (up to 3 attempts in all), plus any queued while SMTP wasn't set up.
async function retryEmails(db) {
  if (!notify.smtpReady()) return 0;
  const before = new Date(Date.now() - PENDING_GRACE_MS).toISOString();
  const { data: rows, error } = await db
    .from("notifications")
    .select("*")
    .or(`and(status.eq.failed,attempts.lt.${MAX_ATTEMPTS}),and(status.eq.pending,created_at.lt.${before})`)
    .order("created_at", { ascending: true })
    .limit(RETRY_BATCH);
  if (error) throw error;
  let retried = 0;
  for (const row of rows || []) {
    await notify.sendOne(db, row);
    retried++;
  }
  return retried;
}

// 4. Overdue balances are only counted and shown to the admin; nothing changes automatically (FR-020e).
async function countOverdue(db, today) {
  let overdue = 0;
  for (const t of TYPES) {
    const { count, error } = await db
      .from(t.table)
      .select("id", { count: "exact", head: true })
      .eq("payment_state", "advance_paid")
      .neq("status", "cancelled")
      .lt("balance_due_date", today);
    if (error) throw error;
    overdue += count || 0;
  }
  return overdue;
}

// GET /api/cron — run daily by Vercel Cron (vercel.json, 03:30 UTC = 09:00 IST).
// Vercel sends Authorization: Bearer <CRON_SECRET>; anyone else gets 401.
module.exports = async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (!secret || !safeEqual(req.headers.authorization, `Bearer ${secret}`)) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  const db = getAdmin();
  if (!db) return res.status(503).json({ error: "Database not configured." });

  try {
    const today = pricing.istDate();
    const reminders = await queueReminders(db, today);
    const retried = await retryEmails(db);
    const overdue = await countOverdue(db, today);
    return res.status(200).json({ reminders, retried, overdue });
  } catch (error) {
    console.error("cron failed:", error instanceof Error ? error.message : error);
    return res.status(500).json({ error: "Cron run failed." });
  }
};
