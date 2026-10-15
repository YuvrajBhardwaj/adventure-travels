const { getAdmin, getUserFromRequest } = require("./_lib/supabaseAdmin");

// POST + Authorization: Bearer <token>
// Course bookings can be made while logged out. Once someone signs in with a *verified*
// email, attach the bookings made with that email to their account so they appear in
// the dashboard and can be paid online.
module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const db = getAdmin();
  if (!db) return res.status(503).json({ error: "Not configured." });

  const user = await getUserFromRequest(db, req);
  if (!user) return res.status(401).json({ error: "Please sign in." });
  if (!user.email || !user.email_confirmed_at) return res.status(200).json({ claimed: 0 });

  const { data, error } = await db
    .from("course_bookings")
    .update({ user_id: user.id })
    .eq("contact_email", user.email.toLowerCase()) // stored lowercased; exact match, no wildcards
    .is("user_id", null)
    .select("id");
  if (error) {
    console.error("claim-bookings failed:", error.message);
    return res.status(502).json({ error: "Couldn't update your bookings." });
  }
  return res.status(200).json({ claimed: data ? data.length : 0 });
};
