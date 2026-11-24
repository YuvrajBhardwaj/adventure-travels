const Razorpay = require("razorpay");
const trekCatalog = require("./_lib/catalog");
const pricing = require("./_lib/pricing");
const departures = require("./_lib/departures");
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
    amount = pricing.trekAmount(trekCatalog[b.trek_slug], group, b.room_sharing || null, b.nationality);
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
    slug: b.trek_slug,
    seats: departures.seatsFor(b.group_size),
    heldUntil: b.seats_held_until || null,
  };
}

/** Inputs for departures.holdDecision(): fresh holds on this booking in 24 h, and the user's other live holds. */
async function holdCounts(db, userId, booking) {
  const now = Date.now();
  if (booking.heldUntil && new Date(booking.heldUntil).getTime() - now >= departures.HOLD_LIMITS.reuseMinutes * 60_000) {
    return { recentHolds: 0, otherActiveHolds: 0 }; // reusing the current hold: nothing to count
  }
  const [recent, others] = await Promise.all([
    db
      .from("activity_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("action_type", "PAYMENT_INITIATED")
      .eq("metadata->>seats_held", "true")
      .eq("metadata->>booking_id", booking.id)
      .gte("created_at", new Date(now - 24 * 3600_000).toISOString()),
    db
      .from("trek_bookings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .neq("id", booking.id)
      .eq("status", "pending")
      .eq("payment_state", "unpaid")
      .gt("seats_held_until", new Date(now).toISOString()),
  ]);
  if (recent.error) throw recent.error;
  if (others.error) throw others.error;
  return { recentHolds: recent.count || 0, otherActiveHolds: others.count || 0 };
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
  // Test keys on the live site take no real money: shout about it in the Vercel logs.
  if (process.env.VERCEL_ENV === "production" && RAZORPAY_KEY_ID.startsWith("rzp_test_")) {
    console.error("create-order: production is using Razorpay TEST keys; no real payments will be taken.");
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

    // An unpaid, unconfirmed trek booking doesn't hold seats yet, so its batch may have
    // filled since it was made: hold the seats for the payment window before taking money
    // (supabase-departures.sql). The hold is atomic, so the last seats can't be sold twice.
    let seatsHeldUntil = null;
    if (booking.type === "trek" && booking.status === "pending" && booking.paymentState === "unpaid") {
      const decision = departures.holdDecision({ heldUntil: booking.heldUntil, ...(await holdCounts(db, user.id, booking)) });
      if (decision.action === "refuse") throw new HttpError(429, decision.message);
      if (decision.action === "reuse") {
        seatsHeldUntil = booking.heldUntil;
      } else {
        const hold = await departures.holdSeats(db, booking);
        if (hold.problem) throw new HttpError(409, hold.problem);
        seatsHeldUntil = hold.heldUntil;
        // Counted by holdCounts(): the per-booking daily limit.
        if (seatsHeldUntil) {
          await logActivity(db, user.id, "PAYMENT_INITIATED", {
            seats_held: true,
            booking_id: booking.id,
            booking_type: "trek",
            held_until: seatsHeldUntil,
            description: "Seats held for checkout",
          });
        }
      }
    }

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
      // When the seats stop being held for this checkout (null: nothing to hold).
      seatsHeldUntil,
    });

    // Reuse an unpaid order of the same kind and amount, so refreshes and retries don't pile up orders.
    const { data: existing, error: existingError } = await db
      .from("payments")
      .select("id, razorpay_order_id, amount, currency")
      .eq(booking.column, booking.id)
      .eq("kind", kind)
      .eq("amount", amount)
      .neq("status", "paid")
      .order("created_at", { ascending: true }) // the oldest, like the race check below
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

    // Two tabs can get here at once, both having found no open order. Hand every tab the oldest
    // open order of this kind and amount, so they all pay the same Razorpay order (which can be
    // paid once); a spare order that loses the race is left unpaid. 18 Nov test report.
    const { data: oldest, error: oldestError } = await db
      .from("payments")
      .select("id, razorpay_order_id, amount, currency")
      .eq(booking.column, booking.id)
      .eq("kind", kind)
      .eq("amount", amount)
      .neq("status", "paid")
      .order("created_at", { ascending: true })
      .limit(1);
    if (oldestError) throw oldestError;
    if (oldest && oldest.length > 0 && oldest[0].id !== row.id) return res.status(200).json(reply(oldest[0]));

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
