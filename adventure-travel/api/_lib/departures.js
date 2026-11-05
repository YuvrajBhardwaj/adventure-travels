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

/** Seats a stored group size takes: "10+" (a quote request) counts as 10. */
function seatsFor(groupSize) {
  const n = Number.parseInt(String(groupSize), 10);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

const HOLD_MINUTES = 15;

/**
 * Holds a pending booking's seats while its owner pays (hold_trek_seats in
 * supabase-departures.sql). The database locks the batch, so two checkouts for the last
 * seats can't both succeed. Returns { problem, heldUntil }: problem is the message to show
 * when the group doesn't fit, heldUntil is null for a private-departure date.
 */
async function holdSeats(db, booking, minutes = HOLD_MINUTES) {
  const { data, error } = await db.rpc("hold_trek_seats", { p_booking: booking.id, p_minutes: minutes });
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

module.exports = { seatProblem, findDeparture, seatsFor, holdSeats, HOLD_MINUTES };
