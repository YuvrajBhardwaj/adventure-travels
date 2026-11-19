// Spam guards for signed-out course bookings, which email whatever address is typed in.

const COURSE_LIMIT_PER_HOUR = 3;

// Hidden "website" field: people never see it, form-filling bots do.
const isHoneypotHit = (body) => typeof body?.website === "string" && body.website.trim() !== "";

// True when this email already made COURSE_LIMIT_PER_HOUR course bookings in the last hour.
async function tooManyCourseBookings(db, email, now = Date.now()) {
  const since = new Date(now - 60 * 60 * 1000).toISOString();
  const { count, error } = await db
    .from("course_bookings")
    .select("id", { count: "exact", head: true })
    .eq("contact_email", email)
    .gte("created_at", since);
  if (error) throw error;
  return (count ?? 0) >= COURSE_LIMIT_PER_HOUR;
}

module.exports = { isHoneypotHit, tooManyCourseBookings, COURSE_LIMIT_PER_HOUR };
