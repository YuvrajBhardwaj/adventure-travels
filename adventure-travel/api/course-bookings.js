const nodemailer = require("nodemailer");
const catalog = require("./_lib/courseCatalog");
const { getAdmin, getUserFromRequest } = require("./_lib/supabaseAdmin");
const { logActivity } = require("./_lib/payments");

const text = (value, max) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Per-person price for the chosen course / tier / stay, from the server-side catalog.
function resolvePackage(course, tierId, stay) {
  if (!course) return null;
  if (!course.tiers || course.tiers.length === 0) {
    return { packageName: "", stay: "", unitPrice: course.price };
  }
  const tier = course.tiers.find((t) => t.id === tierId) || course.tiers[0];
  const useFull = stay === "full";
  return {
    packageName: tier.name,
    stay: useFull ? "full" : "base",
    unitPrice: useFull ? tier.priceFull : tier.priceBase,
  };
}

// POST — stores the booking (Supabase, when configured) and emails the team (SMTP, when
// configured). Either one succeeding is enough, so a missing email setup no longer
// loses a booking. An optional "Authorization: Bearer <token>" ties it to the account.
module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const courseSlug = text(body.courseSlug, 80);
  const course = courseSlug ? catalog[courseSlug] : null;
  if (courseSlug && !course) return res.status(400).json({ error: "Unknown course." });

  const pkg = resolvePackage(course, text(body.tierId, 40), text(body.stay, 8));
  const booking = {
    courseName: course ? course.name : text(body.courseName, 120),
    courseType: course ? course.type : text(body.courseType, 60),
    name: text(body.name, 120),
    email: text(body.email, 254),
    phone: text(body.phone, 30),
    date: text(body.date, 10),
    groupSize: Number(body.groupSize),
    packageDetails: pkg && pkg.packageName ? `${pkg.packageName} (${pkg.stay === "full" ? "with stay & meals" : "without stay"})` : text(body.packageDetails, 200),
    message: text(body.message, 2000),
  };
  const parsedDate = /^\d{4}-\d{2}-\d{2}$/.test(booking.date) ? new Date(`${booking.date}T00:00:00Z`) : null;
  const validDate = parsedDate && Number.isFinite(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === booking.date;

  if (
    !booking.courseName || !booking.courseType || !booking.name ||
    !emailPattern.test(booking.email) || booking.phone.replace(/\D/g, "").length < 7 ||
    !validDate ||
    !Number.isInteger(booking.groupSize) || booking.groupSize < 1 || booking.groupSize > 20
  ) {
    return res.status(400).json({ error: "Check the booking details and try again." });
  }

  const amount = pkg ? pkg.unitPrice * booking.groupSize * 100 : null; // paise

  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
  const smtpReady = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS && Number.isInteger(SMTP_PORT));
  const db = getAdmin();

  if (!db && !smtpReady) {
    return res.status(503).json({ error: "Online booking is temporarily unavailable. Please contact us on WhatsApp." });
  }

  // 1. Persist the record first so nothing depends on email delivery.
  let bookingId = null;
  if (db) {
    try {
      const user = await getUserFromRequest(db, req);
      const { data, error } = await db
        .from("course_bookings")
        .insert({
          user_id: user ? user.id : null,
          course_slug: courseSlug,
          course_name: booking.courseName,
          course_type: booking.courseType,
          package_name: pkg ? pkg.packageName : "",
          stay: pkg ? pkg.stay : "",
          preferred_date: booking.date,
          group_size: booking.groupSize,
          amount,
          contact_name: booking.name,
          contact_email: booking.email.toLowerCase(),
          contact_phone: booking.phone,
          message: booking.message,
        })
        .select("id")
        .single();
      if (error) throw error;
      bookingId = data.id;
      if (user) {
        await logActivity(db, user.id, "COURSE_BOOKING_CREATED", {
          booking_id: bookingId,
          course_name: booking.courseName,
          group_size: booking.groupSize,
          amount,
        });
      }
    } catch (error) {
      console.error("Course booking save failed:", error instanceof Error ? error.message : "unknown error");
      if (!smtpReady) {
        return res.status(502).json({ error: "We couldn't save your booking. Please try again or contact us on WhatsApp." });
      }
    }
  }

  // 2. Notify the team (best effort once the booking is stored).
  let emailed = false;
  if (smtpReady) {
    try {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });
      await transporter.sendMail({
        from: { name: "Himalayan Arc Adventure", address: SMTP_USER },
        to: process.env.BOOKING_TO_EMAIL || "himalayanarcadventure@gmail.com",
        replyTo: booking.email,
        subject: "New course booking request",
        text: [
          `Course: ${booking.courseName} (${booking.courseType})`,
          `Package: ${booking.packageDetails || "Standard"}`,
          `Preferred date: ${booking.date}`,
          `Group size: ${booking.groupSize}`,
          amount ? `Total: Rs.${(amount / 100).toLocaleString("en-IN")}` : null,
          `Name: ${booking.name}`,
          `Email: ${booking.email}`,
          `Phone: ${booking.phone}`,
          `Message: ${booking.message || "—"}`,
          bookingId ? `Booking ID: ${bookingId}` : null,
        ].filter(Boolean).join("\n"),
      });
      emailed = true;
    } catch (error) {
      console.error("Course booking email failed:", error instanceof Error ? error.message : "unknown SMTP error");
      if (!bookingId) {
        return res.status(502).json({ error: "We couldn't send your request. Please try again or contact us on WhatsApp." });
      }
    }
  }

  return res.status(200).json({ ok: true, bookingId, amount, emailed });
};
