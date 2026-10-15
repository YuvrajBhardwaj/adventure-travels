const { getAdmin, getUserFromRequest } = require("./_lib/supabaseAdmin");

// POST { action } + Authorization: Bearer <supabase token>
// specs/001-persistent-backend/contracts/http-api.md — replaces api/claim-bookings.js.

// Course bookings can be made while signed out. Once someone signs in with a *verified*
// email, the bookings made with exactly that email join their account (FR-012). The email
// was stored lower-cased, so this is an exact match — never a pattern.
async function claim(db, user) {
  if (!user.email || !user.email_confirmed_at) return { claimed: 0 };
  const { data, error } = await db
    .from("course_bookings")
    .update({ user_id: user.id })
    .eq("contact_email", user.email.toLowerCase())
    .is("user_id", null)
    .select("id");
  if (error) throw error;
  return { claimed: data ? data.length : 0 };
}

// Deletes the sign-in and personal details but keeps bookings and payments, which the
// foreign keys re-point to null (supabase-payments-v2.sql, research R12, FR-070).
async function remove(db, user) {
  const { error: profileError } = await db
    .from("profiles")
    .update({
      full_name: "",
      phone: "",
      city: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      email: null,
      deleted_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (profileError) throw profileError;

  const { error: bookingError } = await db
    .from("course_bookings")
    .update({ contact_name: "Deleted user", contact_email: "", contact_phone: "" })
    .eq("user_id", user.id);
  if (bookingError) throw bookingError;

  const { error: authError } = await db.auth.admin.deleteUser(user.id);
  if (authError) throw authError;
  return { deleted: true };
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const db = getAdmin();
  if (!db) return res.status(503).json({ error: "Accounts are temporarily unavailable. Please contact us on WhatsApp." });

  const user = await getUserFromRequest(db, req);
  if (!user) return res.status(401).json({ error: "Please sign in." });

  const body = req.body && typeof req.body === "object" ? req.body : {};

  try {
    if (body.action === "claim") return res.status(200).json(await claim(db, user));
    if (body.action === "delete") {
      if (body.confirm !== "DELETE") return res.status(400).json({ error: "Type DELETE to confirm." });
      return res.status(200).json(await remove(db, user));
    }
    return res.status(400).json({ error: "Unknown action." });
  } catch (error) {
    console.error(`account ${body.action} failed:`, error instanceof Error ? error.message : error);
    return res.status(502).json({
      error: body.action === "delete" ? "We couldn't delete your account. Please contact us on WhatsApp." : "Couldn't update your bookings.",
    });
  }
};
