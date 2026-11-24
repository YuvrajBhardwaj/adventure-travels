// Batch calendar checks (supabase-departures.sql). A trek date that matches a listed batch
// must have room; any other date is a private-departure request and isn't limited here.

/** Why `persons` can't join this batch, or null when they can (or it isn't a listed batch). */
function seatProblem(departure, persons) {
  if (!departure) return null;
  if (departure.closed) return "This batch is closed. Please pick another date.";
  const left = Number(departure.seats_left);
  if (left <= 0) return "This batch is full. Pick another date, or message us on WhatsApp to join the waitlist.";
  if (left < persons) {
    return `Only ${left} ${left === 1 ? "seat is" : "seats are"} left on this batch. Make the group smaller or pick another date.`;
  }
  return null;
}

/** The listed batch for this trek and start date, with its seats left, or null. */
async function findDeparture(db, slug, date) {
  const { data, error } = await db.rpc("trek_departure_availability", { p_slug: slug });
  if (error) {
    // supabase-departures.sql not run yet: no batches are listed, so nothing to enforce.
    if (error.code === "PGRST202") return null;
    throw error;
  }
  return (data || []).find((d) => d.start_date === date) || null;
}

/**
 * Seats already taken on a date an admin hasn't listed (supabase-date-seats.sql), or 0 when
 * the function isn't in the database yet.
 */
async function dateSeatsTaken(db, slug, date) {
  const { data, error } = await db.rpc("trek_date_seats", { p_slug: slug });
  if (error) {
    if (error.code === "PGRST202") return 0;
    throw error;
  }
  return (data || []).find((d) => d.start_date === date)?.seats_taken ?? 0;
}

/**
 * Why `persons` can't book `date`: a listed batch uses its own seat count; any other date
 * is limited to the trek's group size (`capacity`). Null when they can.
 */
async function dateProblem(db, slug, date, persons, capacity) {
  const listed = await findDeparture(db, slug, date);
  if (listed) return seatProblem(listed, persons);
  if (!capacity) return null;
  return seatProblem({ closed: false, seats_left: Math.max(capacity - (await dateSeatsTaken(db, slug, date)), 0) }, persons);
}

/** Seats a stored group size takes: "10+" (a quote request) counts as 10. */
function seatsFor(groupSize) {
  const n = Number.parseInt(String(groupSize), 10);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

// Checkout closes Razorpay at the hold's end (CheckoutClient: timeout from seatsHeldUntil).
// shortcut: a UPI collect payment approved after that can still land late and overbook;
// apply_payment() flags such oddities for refund (supabase-payment-guard.sql) as the backstop.
const HOLD_MINUTES = 15;

/**
 * Holds a pending booking's seats while its owner pays (hold_trek_seats in
 * supabase-departures.sql). The database locks the batch, so two checkouts for the last
 * seats can't both succeed. With booking.capacity (the trek's group size), dates an admin
 * hasn't listed are limited to it too (supabase-date-seats.sql). Returns { problem, heldUntil }:
 * problem is the message to show when the group doesn't fit.
 */
async function holdSeats(db, booking, minutes = HOLD_MINUTES) {
  const args = { p_booking: booking.id, p_minutes: minutes };
  let { data, error } = await db.rpc("hold_trek_seats", booking.capacity ? { ...args, p_capacity: booking.capacity } : args);
  // supabase-date-seats.sql not run yet: the 2-argument hold (listed batches only).
  if (error && error.code === "PGRST202" && booking.capacity) ({ data, error } = await db.rpc("hold_trek_seats", args));
  if (error) {
    // Migration not run yet: fall back to the plain (non-locking) check.
    if (error.code === "PGRST202") {
      return { problem: seatProblem(await findDeparture(db, booking.slug, booking.startDate), booking.seats), heldUntil: null };
    }
    throw error;
  }
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || row.ok) return { problem: null, heldUntil: row?.held_until ?? null };
  return { problem: seatProblem({ closed: row.closed, seats_left: row.seats_left }, booking.seats), heldUntil: null };
}

// Seat-hold limits (18 Nov test report: one user could keep a batch's seats held for ever by
// calling create-order every 15 minutes). No database change: holds are counted from the
// activity log (PAYMENT_INITIATED rows with metadata.seats_held = true).
const HOLD_LIMITS = {
  /** Reuse a hold that still has at least this long to run, instead of extending it. */
  reuseMinutes: 5,
  /** Fresh holds per booking in 24 hours. */
  perBookingPerDay: 4,
  /** Other unpaid bookings of the same user that may hold seats at the same time. */
  otherActive: 2,
};

/**
 * What create-order does about seats for an unpaid, pending trek booking:
 * "reuse" the hold it has, take a fresh "hold", or "refuse" with a message.
 */
function holdDecision({ heldUntil, now = new Date(), recentHolds, otherActiveHolds }) {
  const left = heldUntil ? new Date(heldUntil).getTime() - now.getTime() : 0;
  if (left >= HOLD_LIMITS.reuseMinutes * 60_000) return { action: "reuse" };
  if (recentHolds >= HOLD_LIMITS.perBookingPerDay) {
    return { action: "refuse", message: "Too many payment attempts for this booking today. Message us on WhatsApp and we'll help you finish it." };
  }
  if (otherActiveHolds >= HOLD_LIMITS.otherActive) {
    return { action: "refuse", message: "You're already paying for other bookings. Finish those payments, or try again in 15 minutes." };
  }
  return { action: "hold" };
}

module.exports = { seatProblem, findDeparture, dateSeatsTaken, dateProblem, seatsFor, holdSeats, holdDecision, HOLD_MINUTES, HOLD_LIMITS };
