// Email outbox (specs/001-persistent-backend, research R7; contracts/notifications.md).
// The booking/payment is always committed BEFORE anything here runs, and nothing here
// throws back to the caller — a failed email must never lose or block a booking (FR-032).

const nodemailer = require("nodemailer");

const WHATSAPP_LINE = "WhatsApp: +91 78179 12062 (https://wa.me/917817912062)";
const SITE = "https://www.himalayanarcadventure.com";

const businessInbox = () => process.env.BOOKING_TO_EMAIL || "himalayanarcadventure@gmail.com";

const inr = (paise) => `Rs.${Math.round(paise / 100).toLocaleString("en-IN")}`;
const ref = (id) => String(id || "").slice(0, 8).toUpperCase();
const day = (iso) =>
  iso
    ? new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
    : "";
const persons = (n) => `${n} ${Number(n) === 1 ? "person" : "persons"}`;
const kindLabel = { advance: "30% advance", balance: "balance", full: "full payment" };

function payLink(ctx) {
  const param = ctx.bookingType === "course" ? "course" : "booking";
  return `${SITE}/checkout?${param}=${ctx.bookingId}&kind=balance`;
}

/** kind → (ctx) → { subject, bodyText }. Plain text, INR only. */
const templates = {
  booking_received: (ctx) => ({
    subject: `Booking received: ${ctx.item} (${ref(ctx.bookingId)})`,
    bodyText: [
      `Hi ${ctx.name || "there"},`,
      "",
      `Thanks for booking with Himalayan Arc Adventure. Here are your details:`,
      "",
      `Reference: ${ref(ctx.bookingId)}`,
      `${ctx.item}${ctx.option ? ` · ${ctx.option}` : ""}`,
      `Start date: ${day(ctx.date)}`,
      `Group: ${persons(ctx.groupSize)}`,
      ctx.amount ? `Total: ${inr(ctx.amount)}` : "Price: we'll send you a quote shortly.",
      "",
      ctx.amount
        ? ctx.advanceAllowed
          ? `You can pay online from your dashboard: a 30% advance of ${inr(ctx.advanceAmount)} now (non-refundable), with the balance due 15 days before the start, or the full amount.`
          : "You can pay the full amount online from your dashboard."
        : "",
      `Your bookings: ${SITE}/dashboard`,
      "",
      WHATSAPP_LINE,
    ].filter((l) => l !== null).join("\n"),
  }),

  booking_alert: (ctx) => ({
    subject: `New ${ctx.bookingType} booking: ${ctx.item} (${ref(ctx.bookingId)})`,
    bodyText: [
      `Reference: ${ref(ctx.bookingId)} (${ctx.bookingId})`,
      `${ctx.item}${ctx.option ? ` · ${ctx.option}` : ""}`,
      `Start date: ${ctx.date}`,
      `Group: ${persons(ctx.groupSize)}`,
      ctx.amount ? `Total: ${inr(ctx.amount)}` : "Total: QUOTE REQUIRED",
      "",
      `Customer: ${ctx.name || "—"}`,
      `Email: ${ctx.email || "—"}`,
      `Phone: ${ctx.phone || "—"}`,
      `Message: ${ctx.message || "—"}`,
    ].join("\n"),
  }),

  payment_receipt: (ctx) => {
    const balance = Math.max(0, (ctx.total || 0) - (ctx.totalPaid || 0));
    return {
      subject: `Payment received: ${inr(ctx.paid)} for ${ctx.item}`,
      bodyText: [
        `Hi ${ctx.name || "there"},`,
        "",
        `We've received your ${kindLabel[ctx.kind] || "payment"} of ${inr(ctx.paid)}${ctx.method ? ` (${String(ctx.method).toUpperCase()})` : ""}.`,
        "",
        `${ctx.item} · reference ${ref(ctx.bookingId)}`,
        `Total: ${inr(ctx.total || 0)} · Paid so far: ${inr(ctx.totalPaid || 0)}`,
        balance > 0
          ? `Balance: ${inr(balance)}, due by ${day(ctx.balanceDueDate)}. Pay it here: ${payLink(ctx)}`
          : "You're fully paid. See you in the mountains!",
        ctx.kind === "advance" ? "Please note: the advance is non-refundable, as per our cancellation policy." : "",
        "",
        `Your bookings: ${SITE}/dashboard`,
        "",
        WHATSAPP_LINE,
      ].filter(Boolean).join("\n"),
    };
  },

  payment_alert: (ctx) => ({
    subject: `Payment ${inr(ctx.paid)} (${kindLabel[ctx.kind] || ctx.kind}): ${ctx.item} (${ref(ctx.bookingId)})`,
    bodyText: [
      `Booking: ${ref(ctx.bookingId)} (${ctx.bookingId})`,
      `Item: ${ctx.item}`,
      `Customer: ${ctx.name || "—"} <${ctx.email || "—"}>`,
      `Amount: ${inr(ctx.paid)} (${kindLabel[ctx.kind] || ctx.kind})${ctx.method ? ` via ${String(ctx.method).toUpperCase()}` : ""}`,
      `Total paid: ${inr(ctx.totalPaid || 0)} of ${inr(ctx.total || 0)}`,
      `Payment state: ${ctx.paymentState}`,
    ].join("\n"),
  }),

  balance_reminder_7d: (ctx) => ({
    subject: `Balance of ${inr(ctx.balance)} due on ${day(ctx.dueDate)}: ${ctx.item}`,
    bodyText: [
      `Hi ${ctx.name || "there"},`,
      "",
      `A friendly reminder: the balance of ${inr(ctx.balance)} for ${ctx.item} is due on ${day(ctx.dueDate)}.`,
      `Pay it here: ${payLink(ctx)}`,
      "",
      WHATSAPP_LINE,
    ].join("\n"),
  }),

  balance_reminder_due: (ctx) => ({
    subject: `Balance due today: ${inr(ctx.balance)} for ${ctx.item}`,
    bodyText: [
      `Hi ${ctx.name || "there"},`,
      "",
      `The balance of ${inr(ctx.balance)} for ${ctx.item} is due today.`,
      `Pay it here: ${payLink(ctx)}`,
      "",
      "Already paid or need more time? Just reply or message us.",
      WHATSAPP_LINE,
    ].join("\n"),
  }),
};

function smtpReady() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS && Number.isInteger(Number(process.env.SMTP_PORT || 465)));
}

let transporter = null;
function getTransporter() {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 465);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

/** Inserts the outbox row. Returns it, or null when the dedupe_key already exists. */
async function enqueue(db, { kind, dedupeKey, recipient, ctx, bookingType, bookingId, paymentId }) {
  const render = templates[kind];
  if (!render) throw new Error(`Unknown notification kind: ${kind}`);
  const { subject, bodyText } = render(ctx || {});
  const { data, error } = await db
    .from("notifications")
    .upsert(
      {
        kind,
        dedupe_key: dedupeKey,
        recipient,
        subject,
        body_text: bodyText,
        booking_type: bookingType || null,
        booking_id: bookingId || null,
        payment_id: paymentId || null,
      },
      { onConflict: "dedupe_key", ignoreDuplicates: true }
    )
    .select();
  if (error) throw error;
  return data && data.length > 0 ? data[0] : null;
}

/** Sends one outbox row and records the outcome. Never throws. */
async function sendOne(db, row, replyTo) {
  try {
    await getTransporter().sendMail({
      from: { name: "Himalayan Arc Adventure", address: process.env.SMTP_USER },
      to: row.recipient,
      replyTo: replyTo || undefined,
      subject: row.subject,
      text: row.body_text,
    });
    await db.from("notifications").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", row.id);
    return true;
  } catch (error) {
    const message = (error instanceof Error ? error.message : String(error)).slice(0, 300);
    console.error(`notification ${row.kind} failed:`, message);
    await db
      .from("notifications")
      .update({ status: "failed", attempts: (row.attempts || 0) + 1, last_error: message })
      .eq("id", row.id);
    return false;
  }
}

/**
 * Queue and immediately try each email. Items: { kind, dedupeKey, recipient, ctx,
 * bookingType, bookingId, paymentId, replyTo }. Never throws (FR-032).
 */
async function enqueueAndSend(db, items) {
  let queued = 0;
  let sent = 0;
  for (const item of items) {
    try {
      if (!item.recipient) continue;
      const row = await enqueue(db, item);
      if (!row) continue; // already queued earlier — don't send twice
      queued++;
      if (smtpReady() && (await sendOne(db, row, item.replyTo))) sent++;
    } catch (error) {
      console.error("notification enqueue failed:", error instanceof Error ? error.message : error);
    }
  }
  return { queued, sent };
}

module.exports = { templates, enqueue, sendOne, enqueueAndSend, smtpReady, businessInbox, WHATSAPP_LINE };
