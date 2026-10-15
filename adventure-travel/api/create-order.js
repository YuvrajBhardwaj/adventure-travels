const Razorpay = require("razorpay");
const trekCatalog = require("./_lib/catalog");
const { getAdmin, getUserFromRequest, clientIp } = require("./_lib/supabaseAdmin");
const { logActivity } = require("./_lib/payments");

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Resolves what is being paid for and how much, entirely server-side.
// Returns { kind, id, label, amount (paise) }.
async function loadPayable(db, user, body) {
  if (typeof body.courseBookingId === "string") {
    if (!UUID.test(body.courseBookingId)) throw new HttpError(400, "Invalid booking.");
    const { data: b, error } = await db
      .from("course_bookings")
      .select("id, user_id, course_name, package_name, group_size, amount, contact_email, status")
      .eq("id", body.courseBookingId)
      .maybeSingle();
    if (error) throw error;
    if (!b) throw new HttpError(404, "Booking not found.");

    // A booking made while logged out becomes the user's once their *verified* email matches.
    let owner = b.user_id;
    if (!owner && user.email_confirmed_at && String(user.email || "").toLowerCase() === b.contact_email.toLowerCase()) {
      await db.from("course_bookings").update({ user_id: user.id }).eq("id", b.id).is("user_id", null);
      owner = user.id;
    }
    if (owner !== user.id) throw new HttpError(404, "Booking not found.");
    if (b.status === "cancelled") throw new HttpError(409, "This booking was cancelled.");
    if (!b.amount) throw new HttpError(422, "This booking needs a custom quote. Please contact us on WhatsApp.");

    return {
      kind: "course",
      id: b.id,
      amount: b.amount,
      label: `${b.course_name}${b.package_name ? ` · ${b.package_name}` : ""} · ${b.group_size} ${b.group_size === 1 ? "person" : "persons"}`,
    };
  }

  const bookingId = typeof body.bookingId === "string" ? body.bookingId : "";
  if (!UUID.test(bookingId)) throw new HttpError(400, "Invalid booking.");
  // "*" rather than a column list: room_sharing only exists once supabase-room-sharing.sql has run.
  const { data: booking, error } = await db
    .from("trek_bookings")
    .select("*")
    .eq("id", bookingId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw error;
  if (!booking) throw new HttpError(404, "Booking not found.");
  if (booking.status === "cancelled") throw new HttpError(409, "This booking was cancelled.");

  const trek = trekCatalog[booking.trek_slug];
  const persons = Number(String(booking.group_size).trim());
  if (!trek || !Number.isInteger(persons) || persons < 1 || persons > 10) {
    throw new HttpError(422, "This booking needs custom group pricing. Please contact us on WhatsApp.");
  }

  // Room-tier treks charge the stored tier; no room stored → the base (cheapest) tier.
  const room = booking.room_sharing;
  let unit = trek.price;
  if (trek.roomSharing) {
    // Column missing: the room may only be in the free-text message, so don't guess a price.
    if (room === undefined) throw new HttpError(422, "Please confirm your room choice with us on WhatsApp.");
    if (room) unit = Object.hasOwn(trek.roomSharing, room) ? trek.roomSharing[room] : undefined;
  } else if (room) {
    unit = undefined;
  }
  if (!Number.isInteger(unit)) throw new HttpError(422, "This booking needs a custom quote. Please contact us on WhatsApp.");

  return {
    kind: "trek",
    id: booking.id,
    amount: unit * persons * 100,
    label: `${booking.trek_name}${room ? ` · ${room}` : ""} · ${persons} ${persons === 1 ? "person" : "persons"}`,
  };
}

// POST { bookingId } (trek) or { courseBookingId } (course) + Authorization: Bearer <supabase token>
// The amount is derived here from the stored booking + price catalog. The browser never sends it.
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

  try {
    const payable = await loadPayable(db, user, body);
    const bookingColumn = payable.kind === "course" ? "course_booking_id" : "booking_id";

    const { data: paid } = await db
      .from("payments")
      .select("id")
      .eq(bookingColumn, payable.id)
      .eq("status", "paid")
      .limit(1);
    if (paid && paid.length > 0) return res.status(409).json({ error: "This booking is already paid." });

    const profile = {
      name: user.user_metadata?.full_name || "",
      email: user.email || "",
      contact: user.user_metadata?.phone || "",
    };

    const reply = (row) => ({
      keyId: RAZORPAY_KEY_ID,
      orderId: row.razorpay_order_id,
      amount: row.amount,
      currency: row.currency,
      description: payable.label,
      prefill: profile,
    });

    // Reuse an unpaid order for the same amount so refreshes/retries don't pile up orders.
    const { data: existing } = await db
      .from("payments")
      .select("id, razorpay_order_id, amount, currency")
      .eq(bookingColumn, payable.id)
      .neq("status", "paid")
      .eq("amount", payable.amount)
      .order("created_at", { ascending: false })
      .limit(1);
    if (existing && existing.length > 0) return res.status(200).json(reply(existing[0]));

    const razorpay = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
    const order = await razorpay.orders.create({
      amount: payable.amount,
      currency: "INR",
      receipt: `${payable.kind === "course" ? "cb" : "bk"}_${payable.id.slice(0, 8)}_${Date.now().toString(36)}`,
      notes: { booking_id: payable.id, booking_type: payable.kind, user_id: user.id },
    });

    const { data: row, error: insertError } = await db
      .from("payments")
      .insert({
        user_id: user.id,
        [bookingColumn]: payable.id,
        razorpay_order_id: order.id,
        amount: payable.amount,
        currency: "INR",
      })
      .select("id, razorpay_order_id, amount, currency")
      .single();
    if (insertError) throw insertError;

    await logActivity(db, user.id, "PAYMENT_INITIATED", {
      order_id: order.id,
      amount: payable.amount,
      booking_id: payable.id,
      booking_type: payable.kind,
      description: payable.label,
      ip: clientIp(req),
    });

    return res.status(200).json(reply(row));
  } catch (error) {
    if (error instanceof HttpError) return res.status(error.status).json({ error: error.message });
    console.error("create-order failed:", error instanceof Error ? error.message : error);
    return res.status(502).json({ error: "We couldn't start the payment. Please try again." });
  }
};
