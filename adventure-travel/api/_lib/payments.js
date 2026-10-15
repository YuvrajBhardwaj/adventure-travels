const crypto = require("crypto");
const notify = require("./notify");

function hmacHex(secret, data) {
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

function safeEqual(a, b) {
  const x = Buffer.from(String(a || ""), "utf8");
  const y = Buffer.from(String(b || ""), "utf8");
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

async function logActivity(db, userId, actionType, metadata) {
  const { error } = await db
    .from("activity_logs")
    .insert({ user_id: userId, action_type: actionType, metadata: metadata || {} });
  if (error) console.error("activity log failed:", error.message);
}

// Receipt to the customer + alert to the business, after the payment is committed.
// Dedupe keys make a second report of the same payment (webhook + browser) a no-op.
async function notifyPaymentApplied(db, state, { paymentId, method }) {
  try {
    let ctx;
    if (state.booking_type === "course") {
      const { data: b } = await db
        .from("course_bookings")
        .select("course_name, package_name, contact_name, contact_email")
        .eq("id", state.booking_id)
        .maybeSingle();
      ctx = { item: b?.course_name, option: b?.package_name, name: b?.contact_name, email: b?.contact_email };
    } else {
      const { data: b } = await db
        .from("trek_bookings")
        .select("trek_name, room_sharing, user_id")
        .eq("id", state.booking_id)
        .maybeSingle();
      const { data: p } = b?.user_id
        ? await db.from("profiles").select("full_name, email").eq("id", b.user_id).maybeSingle()
        : { data: null };
      ctx = { item: b?.trek_name, option: b?.room_sharing, name: p?.full_name, email: p?.email };
    }
    Object.assign(ctx, {
      bookingType: state.booking_type,
      bookingId: state.booking_id,
      kind: state.kind,
      paid: state.payment_amount,
      method,
      total: state.amount,
      totalPaid: state.amount_paid,
      balanceDueDate: state.balance_due_date,
      paymentState: state.payment_state,
    });
    const key = paymentId || state.payment_id;
    const link = { bookingType: state.booking_type, bookingId: state.booking_id, paymentId: state.payment_id };
    // Runs only after apply_payment has committed — an email failure can't undo the payment (FR-032).
    await notify.enqueueAndSend(db, [
      { kind: "payment_receipt", dedupeKey: `payment_receipt:${key}`, recipient: ctx.email, ctx, replyTo: notify.businessInbox(), ...link },
      { kind: "payment_alert", dedupeKey: `payment_alert:${key}`, recipient: notify.businessInbox(), ctx, replyTo: ctx.email, ...link },
    ]);
  } catch (error) {
    console.error("payment notification failed:", error instanceof Error ? error.message : error);
  }
}

// Applies a captured payment through the database's apply_payment(), which locks the
// payment and booking rows so the webhook and /api/verify-payment can both report the
// same payment without double-counting it (research R5, FR-025).
async function applyPayment(db, { orderId, paymentId, amount, method }) {
  const { data, error } = await db.rpc("apply_payment", {
    p_order_id: orderId,
    p_payment_id: paymentId || null,
    p_amount: amount == null ? null : Number(amount),
    p_method: method || null,
  });
  if (error) throw error;
  const state = data || {};
  if (state.result === "applied") await notifyPaymentApplied(db, state, { paymentId, method });
  const ok = state.result === "applied" || state.result === "already";
  return { ok, already: state.result === "already", reason: ok ? undefined : state.result, state };
}

/** Current payment state and status of a booking, e.g. to answer a repeat report of a payment. */
async function bookingState(db, bookingType, bookingId) {
  const { data, error } = await db
    .from(bookingType === "course" ? "course_bookings" : "trek_bookings")
    .select("payment_state, status")
    .eq("id", bookingId)
    .maybeSingle();
  if (error) throw error;
  return data ? { paymentState: data.payment_state, bookingStatus: data.status } : { paymentState: null, bookingStatus: null };
}

async function markFailed(db, { orderId, reason, ip }) {
  const { data: updated, error } = await db
    .from("payments")
    .update({ status: "failed", failure_reason: String(reason || "Payment failed").slice(0, 300) })
    .eq("razorpay_order_id", orderId)
    .eq("status", "created")
    .select()
    .maybeSingle();
  if (error) throw error;
  if (!updated) return { ok: true, ignored: true };
  await logActivity(db, updated.user_id, "PAYMENT_FAILED", {
    order_id: orderId,
    reason: updated.failure_reason,
    amount: updated.amount,
    booking_id: updated.booking_id,
    ip,
  });
  return { ok: true };
}

module.exports = { hmacHex, safeEqual, logActivity, applyPayment, bookingState, markFailed };
