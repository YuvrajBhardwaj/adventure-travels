const Razorpay = require("razorpay");
const trekCatalog = require("./_lib/catalog");
const pricing = require("./_lib/pricing");
const { getAdmin, getUserFromRequest, clientIp } = require("./_lib/supabaseAdmin");
const { logActivity } = require("./_lib/payments");

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const KIND_SUFFIX = { advance: " — 30% advance", balance: " — balance", full: "" };

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const persons = (n) => `${n} ${Number(n) === 1 ? "person" : "persons"}`;

// Loads the caller's booking in one shape for both types. Amounts come from the booking
// row, where api/bookings locked them (FR-016) — never from the catalog or the browser.
async function loadBooking(db, user, bookingType, bookingId) {
  if (!UUID.test(bookingId)) throw new HttpError(400, "Invalid booking.");

  if (bookingType === "course") {
    const { data: b, error } = await db.from("course_bookings").select("*").eq("id", bookingId).maybeSingle();
    if (error) throw error;
    if (!b) throw new HttpError(404, "Booking not found.");

    // A course booked while signed out becomes the user's once their *verified* email matches.
    let owner = b.user_id;
    if (!owner && user.email_confirmed_at && String(user.email || "").toLowerCase() === String(b.contact_email).toLowerCase()) {
      await db.from("course_bookings").update({ user_id: user.id }).eq("id", b.id).is("user_id", null);
      owner = user.id;
    }
    if (owner !== user.id) throw new HttpError(404, "Booking not found.");

    return {
      type: "course",
      column: "course_booking_id",
      id: b.id,
      status: b.status,
      paymentState: b.payment_state,
      quoteRequired: Boolean(b.quote_required),
      amount: b.amount,
      amountPaid: b.amount_paid || 0,
      startDate: b.preferred_date,
      balanceDueDate: b.balance_due_date,
      label: `${b.course_name}${b.package_name ? ` · ${b.package_name}` : ""} · ${persons(b.group_size)}`,
    };
  }

  const { data: b, error } = await db.from("trek_bookings").select("*").eq("id", bookingId).eq("user_id", user.id).maybeSingle();
  if (error) throw error;
  if (!b) throw new HttpError(404, "Booking not found.");

  let amount = b.amount;
  // Trek bookings made before payments v2 have no stored amount. Price them once from the
  // catalog and store it, so from here on the price is locked like any other booking.
  if (amount === null && !b.quote_required && b.status !== "cancelled" && b.payment_state === "unpaid") {
    const group = Number(String(b.group_size).trim());
    amount = pricing.trekAmount(trekCatalog[b.trek_slug], group, b.room_sharing || null);
    if (amount !== null) {
      const { error: lockError } = await db.from("trek_bookings").update({ amount }).eq("id", b.id).is("amount", null);
      if (lockError) throw lockError;
    }
  }

  return {
    type: "trek",
    column: "booking_id",
    id: b.id,
    status: b.status,
    paymentState: b.payment_state,
    quoteRequired: Boolean(b.quote_required),
    amount,
    amountPaid: b.amount_paid || 0,
    startDate: b.trek_date,
    balanceDueDate: b.balance_due_date,
    label: `${b.trek_name}${b.room_sharing ? ` · ${b.room_sharing}` : ""} · ${persons(b.group_size)}`,
  };
}

// POST { bookingType: "trek"|"course", bookingId, kind: "advance"|"balance"|"full" }
// + Authorization: Bearer <supabase token>. Contract: specs/001-persistent-backend/contracts/http-api.md
module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
  const db = getAdmin();
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET || !db) {
    return res.status(503).json({ error: "Online payments are temporarily unavailable. Please contact us on WhatsApp." });
  }

  const user = await getUserFromRequest(db, req);
  if (!user) return res.status(401).json({ error: "Please sign in to continue." });

  const body = req.body && typeof req.body === "object" ? req.body : {};
  // Older checkout pages sent { courseBookingId } or { bookingId } with no kind.
  const bookingType = body.bookingType === "course" || typeof body.courseBookingId === "string" ? "course" : "trek";
  const bookingId = String(body.bookingId || body.courseBookingId || "");
  const kind = typeof body.kind === "string" ? body.kind : "full";

  try {
    const booking = await loadBooking(db, user, bookingType, bookingId);
    const rule = pricing.orderAmount(booking, kind);
    if (rule.error) throw new HttpError(rule.status, rule.error);
    const amount = rule.amount;

    const summary = {
      total: booking.amount,
      paid: booking.amountPaid,
      dueAfterThis: booking.amount - booking.amountPaid - amount,
      balanceDueDate:
        kind === "advance" ? pricing.balanceDueDate(booking.startDate) : kind === "balance" ? null : booking.balanceDueDate || null,
    };
    const description = `${booking.label}${KIND_SUFFIX[kind]}`;
    const reply = (row) => ({
      keyId: RAZORPAY_KEY_ID,
      orderId: row.razorpay_order_id,
      amount: row.amount,
      currency: row.currency,
      kind,
      description,
      prefill: { name: user.user_metadata?.full_name || "", email: user.email || "", contact: user.user_metadata?.phone || "" },
      summary,
    });

    // Reuse an unpaid order of the same kind and amount, so refreshes and retries don't pile up orders.
    const { data: existing, error: existingError } = await db
      .from("payments")
      .select("id, razorpay_order_id, amount, currency")
      .eq(booking.column, booking.id)
      .eq("kind", kind)
      .eq("amount", amount)
      .neq("status", "paid")
      .order("created_at", { ascending: false })
      .limit(1);
    if (existingError) throw existingError;
    if (existing && existing.length > 0) return res.status(200).json(reply(existing[0]));

    const razorpay = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `${booking.type === "course" ? "cb" : "bk"}_${booking.id.slice(0, 8)}_${kind[0]}_${Date.now().toString(36)}`,
      notes: { booking_id: booking.id, booking_type: booking.type, kind, user_id: user.id },
    });

    const { data: row, error: insertError } = await db
      .from("payments")
      .insert({
        user_id: user.id,
        [booking.column]: booking.id,
        razorpay_order_id: order.id,
        amount,
        currency: "INR",
        kind,
      })
      .select("id, razorpay_order_id, amount, currency")
      .single();
    if (insertError) throw insertError;

    await logActivity(db, user.id, "PAYMENT_INITIATED", {
      order_id: order.id,
      amount,
      kind,
      booking_id: booking.id,
      booking_type: booking.type,
      description,
      ip: clientIp(req),
    });

    return res.status(200).json(reply(row));
  } catch (error) {
    if (error instanceof HttpError) return res.status(error.status).json({ error: error.message });
    console.error("create-order failed:", error instanceof Error ? error.message : error);
    return res.status(502).json({ error: "We couldn't start the payment. Please try again." });
  }
};
