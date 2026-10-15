const { getAdmin, clientIp } = require("./_lib/supabaseAdmin");
const { hmacHex, safeEqual, applyPayment, markFailed } = require("./_lib/payments");

// Razorpay signs the exact bytes it sends, so we need the raw body. Read the stream
// before anything touches req.body (Vercel parses it lazily on first access).
async function getRawBody(req) {
  if (!req.readableEnded && req.readable) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      req.on("data", (c) => chunks.push(c));
      req.on("end", () => resolve(Buffer.concat(chunks)));
      req.on("error", reject);
    });
  }
  // The platform already consumed the stream — fall back to what it parsed.
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === "string") return Buffer.from(req.body);
  return Buffer.from(JSON.stringify(req.body || {}));
}

// Razorpay Dashboard → Webhooks: URL https://<domain>/api/razorpay-webhook,
// events: payment.captured, order.paid, payment.failed, secret = RAZORPAY_WEBHOOK_SECRET.
async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { RAZORPAY_WEBHOOK_SECRET } = process.env;
  const db = getAdmin();
  if (!RAZORPAY_WEBHOOK_SECRET || !db) return res.status(503).json({ error: "Webhook not configured." });

  const raw = await getRawBody(req);
  const signature = String(req.headers["x-razorpay-signature"] || "");
  if (!safeEqual(hmacHex(RAZORPAY_WEBHOOK_SECRET, raw), signature)) {
    return res.status(400).json({ error: "Invalid signature." });
  }

  let event;
  try {
    event = JSON.parse(raw.toString("utf8"));
  } catch {
    return res.status(400).json({ error: "Invalid payload." });
  }

  const payment = event?.payload?.payment?.entity;
  const ip = clientIp(req);

  try {
    if ((event.event === "payment.captured" || event.event === "order.paid") && payment?.order_id) {
      // Idempotent: a replayed event, or one the browser already reported, changes nothing.
      // A captured amount that differs from the order is refused and logged by apply_payment.
      await applyPayment(db, {
        orderId: payment.order_id,
        paymentId: payment.id,
        amount: payment.amount,
        method: payment.method,
      });
    } else if (event.event === "payment.failed" && payment?.order_id) {
      await markFailed(db, {
        orderId: payment.order_id,
        reason: payment.error_description || payment.error_reason,
        ip,
      });
    }
    // Everything else is acknowledged and ignored so Razorpay stops retrying.
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("razorpay-webhook failed:", error instanceof Error ? error.message : error);
    return res.status(500).json({ error: "Processing failed." }); // non-2xx → Razorpay retries
  }
}

module.exports = handler;
module.exports.config = { api: { bodyParser: false } };
