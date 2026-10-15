// GET → { country } from the CDN's IP lookup (follows a VPN, unlike browser locale).
// Deliberately NOT cacheable: the answer is different for every visitor, so a shared
// cache would hand one person's country to everyone else.
module.exports = function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }
  const country = String(req.headers["x-vercel-ip-country"] || "").trim().toUpperCase();
  return res.status(200).json({ country: /^[A-Z]{2}$/.test(country) ? country : null });
};
