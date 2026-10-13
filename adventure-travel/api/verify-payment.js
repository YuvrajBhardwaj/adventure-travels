const { getAdmin, getUserFromRequest, clientIp } = require("./_lib/supabaseAdmin");
const { hmacHex, safeEqual, markPaid } = require("./_lib/payments");

// POST { razorpay_order_id, razorpay_payment_id, razorpay_signature }
// Called by the browser right after Razorpay Checkout succeeds so the user sees
// "paid" instantly. The webhook is the backstop if the tab is closed first.
module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { RAZORPAY_KEY_SECRET } = process.env;
  const db = getAdmin();
  if (!RAZORPAY_KEY_SECRET || !db) {
    return res.status(503).json({ error: "Online payments are temporarily unavailable." });
  }

  const user = await getUserFromRequest(db, req);
  if (!user) return res.status(401).json({ error: "Please sign in to continue." });

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const orderId = typeof body.razorpay_order_id === "string" ? body.razorpay_order_id : "";
  const paymentId = typeof body.razorpay_payment_id === "string" ? body.razorpay_payment_id : "";
  const signature = typeof body.razorpay_signature === "string" ? body.razorpay_signature : "";
  if (!orderId || !paymentId || !signature) return res.status(400).json({ error: "Missing payment details." });

  if (!safeEqual(hmacHex(RAZORPAY_KEY_SECRET, `${orderId}|${paymentId}`), signature)) {
    return res.status(400).json({ error: "Payment signature could not be verified." });
  }

  try {
    // The order must be one we created for this user.
    const { data: row, error } = await db
      .from("payments")
      .select("id")
      .eq("razorpay_order_id", orderId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) throw error;
    if (!row) return res.status(404).json({ error: "Payment not found." });

    const result = await markPaid(db, { orderId, paymentId, ip: clientIp(req) });
    if (!result.ok) return res.status(409).json({ error: "Payment could not be confirmed." });
    return res.status(200).json({ status: "paid" });
  } catch (error) {
    console.error("verify-payment failed:", error instanceof Error ? error.message : error);
    return res.status(502).json({ error: "We couldn't confirm the payment yet. It will update shortly." });
  }
};
