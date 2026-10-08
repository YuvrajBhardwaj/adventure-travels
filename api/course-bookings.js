const nodemailer = require("nodemailer");

const text = (value, max) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const booking = {
    courseName: text(body.courseName, 120),
    courseType: text(body.courseType, 60),
    name: text(body.name, 120),
    email: text(body.email, 254),
    phone: text(body.phone, 30),
    date: text(body.date, 10),
    groupSize: Number(body.groupSize),
    packageDetails: text(body.packageDetails, 200),
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

  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !Number.isInteger(SMTP_PORT)) {
    return res.status(503).json({ error: "Online booking email is temporarily unavailable. Please contact us on WhatsApp." });
  }

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
        `Name: ${booking.name}`,
        `Email: ${booking.email}`,
        `Phone: ${booking.phone}`,
        `Message: ${booking.message || "—"}`,
      ].join("\n"),
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Course booking email failed:", error instanceof Error ? error.message : "unknown SMTP error");
    return res.status(502).json({ error: "We couldn't send your request. Please try again or contact us on WhatsApp." });
  }
};
