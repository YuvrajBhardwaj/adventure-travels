const trekCatalog = require("./_lib/catalog");
const courseCatalog = require("./_lib/courseCatalog");
const pricing = require("./_lib/pricing");
const notify = require("./_lib/notify");
const { getAdmin, getUserFromRequest } = require("./_lib/supabaseAdmin");
const { logActivity } = require("./_lib/payments");

const text = (value, max) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Trek group sizes: 1–10 are priced online; "10+" (or a larger number) is a quote request.
function parseTrekGroup(value) {
  if (value === "10+") return { label: "10+", persons: null };
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 50) throw new HttpError(400, "Check the group size and try again.");
  return { label: String(n), persons: n <= pricing.MAX_TREK_GROUP ? n : null };
}

async function createTrek(db, user, body) {
  if (!user) throw new HttpError(401, "Please sign in to book a trek.");
  const slug = text(body.slug, 80);
  const trek = trekCatalog[slug];
  if (!trek) throw new HttpError(400, "Unknown trek.");
  const date = text(body.date, 10);
  if (!pricing.isFutureStart(date)) throw new HttpError(400, "Pick a start date in the future.");

  const group = parseTrekGroup(body.groupSize);
  const roomSharing = text(body.roomSharing, 40) || null;
  if (roomSharing && (!trek.roomSharing || !Object.prototype.hasOwnProperty.call(trek.roomSharing, roomSharing))) {
    throw new HttpError(400, "Choose one of the listed room options.");
  }
  // Price locked now, from the catalog — never from the browser (FR-016).
  const amount = group.persons ? pricing.trekAmount(trek, group.persons, roomSharing) : null;

  const { data, error } = await db
    .from("trek_bookings")
    .insert({
      user_id: user.id,
      trek_name: trek.name,
      trek_slug: slug,
      trek_date: date,
      group_size: group.label,
      room_sharing: roomSharing,
      message: text(body.message, 2000),
      amount,
      quote_required: amount === null,
    })
    .select("id")
    .single();
  if (error) throw error;

  return {
    type: "trek",
    id: data.id,
    amount,
    date,
    groupSize: group.label,
    item: trek.name,
    option: roomSharing,
    contact: { name: user.user_metadata?.full_name || "", email: user.email || "", phone: user.user_metadata?.phone || "" },
    message: text(body.message, 2000),
  };
}

async function createCourse(db, user, body) {
  const slug = text(body.slug, 80);
  const course = courseCatalog[slug];
  if (!course) throw new HttpError(400, "Unknown course.");
  const date = text(body.date, 10);
  if (!pricing.isFutureStart(date)) throw new HttpError(400, "Pick a start date in the future.");

  const groupSize = Number(body.groupSize);
  if (!Number.isInteger(groupSize) || groupSize < 1 || groupSize > pricing.MAX_COURSE_GROUP) {
    throw new HttpError(400, "Check the group size and try again.");
  }

  // Contact defaults to the signed-in profile when the form leaves it out.
  const c = body.contact && typeof body.contact === "object" ? body.contact : {};
  const contact = {
    name: text(c.name, 120) || (user ? text(user.user_metadata?.full_name, 120) : ""),
    email: (text(c.email, 254) || (user ? text(user.email, 254) : "")).toLowerCase(),
    phone: text(c.phone, 30) || (user ? text(user.user_metadata?.phone, 30) : ""),
  };
  if (!contact.name || !emailPattern.test(contact.email) || contact.phone.replace(/\D/g, "").length < 7) {
    throw new HttpError(400, "Check your name, email and phone number.");
  }

  const hasTiers = course.tiers && course.tiers.length > 0;
  const tier = hasTiers ? course.tiers.find((t) => t.id === body.tierId) || course.tiers[0] : null;
  const stay = hasTiers ? (body.stay === "full" ? "full" : "base") : "";
  const amount = pricing.courseAmount(course, tier ? tier.id : undefined, stay, groupSize);

  const { data, error } = await db
    .from("course_bookings")
    .insert({
      user_id: user ? user.id : null,
      course_slug: slug,
      course_name: course.name,
      course_type: course.type,
      package_name: tier ? tier.name : "",
      stay,
      preferred_date: date,
      group_size: groupSize,
      amount,
      quote_required: amount === null,
      contact_name: contact.name,
      contact_email: contact.email,
      contact_phone: contact.phone,
      message: text(body.message, 2000),
    })
    .select("id")
    .single();
  if (error) throw error;

  return {
    type: "course",
    id: data.id,
    amount,
    date,
    groupSize: String(groupSize),
    item: course.name,
    option: tier ? `${tier.name} · ${stay === "full" ? "with stay & meals" : "without stay"}` : "",
    contact,
    message: text(body.message, 2000),
  };
}

// POST /api/bookings — specs/001-persistent-backend/contracts/http-api.md
// Treks require a session; courses take an optional one (attaches the account).
module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const db = getAdmin();
  // No database → nothing is saved, so say so; the UI offers WhatsApp (FR-061).
  if (!db) return res.status(503).json({ error: "Online booking is temporarily unavailable. Please contact us on WhatsApp." });

  const body = req.body && typeof req.body === "object" ? req.body : {};

  try {
    const user = await getUserFromRequest(db, req);
    let booking;
    if (body.type === "trek") booking = await createTrek(db, user, body);
    else if (body.type === "course") booking = await createCourse(db, user, body);
    else throw new HttpError(400, "Unknown booking type.");

    if (user) {
      await logActivity(db, user.id, booking.type === "trek" ? "BOOKING_CREATED" : "COURSE_BOOKING_CREATED", {
        booking_id: booking.id,
        [booking.type === "trek" ? "trek_name" : "course_name"]: booking.item,
        trek_date: booking.type === "trek" ? booking.date : undefined,
        group_size: booking.groupSize,
        amount: booking.amount,
      });
    }

    const advanceAllowed = booking.amount !== null && pricing.isAdvanceAllowed(booking.date, 0);
    const advanceAmount = advanceAllowed ? pricing.advanceAmount(booking.amount) : null;

    // The booking is committed above; emails go out after and can never undo it (FR-032).
    const ctx = {
      bookingType: booking.type,
      bookingId: booking.id,
      item: booking.item,
      option: booking.option,
      date: booking.date,
      groupSize: booking.groupSize,
      amount: booking.amount,
      advanceAllowed,
      advanceAmount,
      name: booking.contact.name,
      email: booking.contact.email,
      phone: booking.contact.phone,
      message: booking.message,
    };
    const link = { bookingType: booking.type, bookingId: booking.id };
    const { queued } = await notify.enqueueAndSend(db, [
      { kind: "booking_received", dedupeKey: `booking_received:${booking.id}`, recipient: booking.contact.email, ctx, replyTo: notify.businessInbox(), ...link },
      { kind: "booking_alert", dedupeKey: `booking_alert:${booking.id}`, recipient: notify.businessInbox(), ctx, replyTo: booking.contact.email, ...link },
    ]);

    return res.status(201).json({
      bookingId: booking.id,
      type: booking.type,
      amount: booking.amount,
      quoteRequired: booking.amount === null,
      advanceAllowed,
      advanceAmount,
      emailQueued: queued > 0,
    });
  } catch (error) {
    if (error instanceof HttpError) return res.status(error.status).json({ error: error.message });
    console.error("bookings failed:", error instanceof Error ? error.message : error);
    return res.status(502).json({ error: "We couldn't save your booking. Please try again or contact us on WhatsApp." });
  }
};
