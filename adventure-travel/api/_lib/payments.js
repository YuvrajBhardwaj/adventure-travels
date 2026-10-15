const crypto = require("crypto");

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

// Idempotent: the webhook and /api/verify-payment can both call this for the same
// order. Only the call that actually flips the row to "paid" confirms the booking
// and writes the PAYMENT_SUCCESS entry.
async function markPaid(db, { orderId, paymentId, amount, method, ip }) {
  const { data: row, error } = await db
    .from("payments")
    .select("*")
    .eq("razorpay_order_id", orderId)
    .maybeSingle();
  if (error) throw error;
  if (!row) return { ok: false, reason: "unknown_order" };

  // The amount comes from the order we created server-side; refuse anything that disagrees.
  if (amount != null && Number(amount) !== row.amount) {
    await logActivity(db, row.user_id, "PAYMENT_FAILED", {
      reason: "amount_mismatch",
      order_id: orderId,
      expected: row.amount,
      received: Number(amount),
      ip,
    });
    return { ok: false, reason: "amount_mismatch" };
  }

  if (row.status === "paid") {
    if (method && !row.method) await db.from("payments").update({ method }).eq("id", row.id);
    return { ok: true, already: true, row };
  }

  const { data: updated, error: updateError } = await db
    .from("payments")
    .update({
      status: "paid",
      razorpay_payment_id: paymentId || row.razorpay_payment_id,
      method: method || row.method,
      failure_reason: null,
      paid_at: new Date().toISOString(),
    })
    .eq("id", row.id)
    .neq("status", "paid")
    .select()
    .maybeSingle();
  if (updateError) throw updateError;
  if (!updated) return { ok: true, already: true, row }; // another call won the race

  // Confirm whichever booking this payment belongs to.
  const bookingTable = row.course_booking_id ? "course_bookings" : "trek_bookings";
  await db
    .from(bookingTable)
    .update({ status: "confirmed" })
    .eq("id", row.course_booking_id || row.booking_id)
    .neq("status", "cancelled");

  await logActivity(db, row.user_id, "PAYMENT_SUCCESS", {
    order_id: orderId,
    payment_id: paymentId,
    amount: row.amount,
    method: method || null,
    booking_id: row.booking_id || row.course_booking_id,
    booking_type: row.course_booking_id ? "course" : "trek",
    ip,
  });
  return { ok: true, row: updated };
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

module.exports = { hmacHex, safeEqual, logActivity, markPaid, markFailed };
