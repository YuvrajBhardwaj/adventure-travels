const { createClient } = require("@supabase/supabase-js");

// Service-role client: bypasses RLS. Server-side only — never import this from src/.
function getAdmin() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function bearerToken(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
}

// Resolves the signed-in user from the browser's Supabase access token.
async function getUserFromRequest(db, req) {
  const token = bearerToken(req);
  if (!token) return null;
  const { data, error } = await db.auth.getUser(token);
  return error || !data.user ? null : data.user;
}

function clientIp(req) {
  return String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || null;
}

module.exports = { getAdmin, getUserFromRequest, clientIp };
