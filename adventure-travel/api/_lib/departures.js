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

module.exports = { seatProblem, findDeparture, seatsFor };
