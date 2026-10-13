const Razorpay = require("razorpay");
const catalog = require("./_lib/catalog");
const { getAdmin, getUserFromRequest, clientIp } = require("./_lib/supabaseAdmin");
const { logActivity } = require("./_lib/payments");

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// POST { bookingId } + Authorization: Bearer <supabase access token>
// The amount is derived here from the booking + price catalog. The browser never sends it.
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
  const bookingId = typeof body.bookingId === "string" ? body.bookingId : "";
  if (!UUID.test(bookingId)) return res.status(400).json({ error: "Invalid booking." });

  try {
    const { data: booking, error: bookingError } = await db
      .from("trek_bookings")
      .select("id, user_id, trek_name, trek_slug, trek_date, group_size, status")
      .eq("id", bookingId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (bookingError) throw bookingError;
    if (!booking) return res.status(404).json({ error: "Booking not found." });
    if (booking.status === "cancelled") return res.status(409).json({ error: "This booking was cancelled." });

    const trek = catalog[booking.trek_slug];
    const persons = Number(String(booking.group_size).trim());
    if (!trek || !Number.isInteger(persons) || persons < 1 || persons > 10) {
      return res.status(422).json({ error: "This booking needs custom group pricing. Please contact us on WhatsApp." });
    }
    const amount = trek.price * persons * 100; // paise

    const { data: paid } = await db
      .from("payments")
      .select("id")
      .eq("booking_id", booking.id)
      .eq("status", "paid")
      .limit(1);
    if (paid && paid.length > 0) return res.status(409).json({ error: "This booking is already paid." });

    const profile = {
      name: user.user_metadata?.full_name || "",
      email: user.email || "",
      contact: user.user_metadata?.phone || "",
    };

    // Reuse an unpaid order for the same amount so refreshes/retries don't pile up orders.
    const { data: existing } = await db
      .from("payments")
      .select("id, razorpay_order_id, amount, currency")
      .eq("booking_id", booking.id)
      .neq("status", "paid")
      .eq("amount", amount)
      .order("created_at", { ascending: false })
      .limit(1);

    const reply = (row) => ({
      keyId: RAZORPAY_KEY_ID,
      orderId: row.razorpay_order_id,
      amount: row.amount,
      currency: row.currency,
      description: `${booking.trek_name} · ${persons} ${persons === 1 ? "person" : "persons"}`,
      prefill: profile,
    });

    if (existing && existing.length > 0) return res.status(200).json(reply(existing[0]));

    const razorpay = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `bk_${booking.id.slice(0, 8)}_${Date.now().toString(36)}`,
      notes: { booking_id: booking.id, user_id: user.id, trek: booking.trek_slug },
    });

    const { data: row, error: insertError } = await db
      .from("payments")
      .insert({
        user_id: user.id,
        booking_id: booking.id,
        razorpay_order_id: order.id,
        amount,
        currency: "INR",
      })
      .select("id, razorpay_order_id, amount, currency")
      .single();
    if (insertError) throw insertError;

    await logActivity(db, user.id, "PAYMENT_INITIATED", {
      order_id: order.id,
      amount,
      trek_name: booking.trek_name,
      booking_id: booking.id,
      ip: clientIp(req),
    });

    return res.status(200).json(reply(row));
  } catch (error) {
    console.error("create-order failed:", error instanceof Error ? error.message : error);
    return res.status(502).json({ error: "We couldn't start the payment. Please try again." });
  }
};
