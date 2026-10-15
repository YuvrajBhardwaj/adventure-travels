// GET → { base: "INR", updatedAt, rates: { USD: 0.0115, ... } }
// Same for every visitor, so it IS cached at the edge: the upstream is hit about once
// every 6 hours no matter how much traffic the site gets.
// Rates: open.er-api.com (free, no key). Their terms ask for attribution — the
// currency switcher links to them.
module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const upstream = await fetch("https://open.er-api.com/v6/latest/INR", {
      signal: AbortSignal.timeout(5000),
    });
    if (!upstream.ok) throw new Error(`upstream ${upstream.status}`);
    const data = await upstream.json();
    if (data.result !== "success" || !data.rates || typeof data.rates !== "object") {
      throw new Error("unexpected upstream payload");
    }

    // Keep only sane positive numbers.
    const rates = {};
    for (const [code, value] of Object.entries(data.rates)) {
      if (/^[A-Z]{3}$/.test(code) && typeof value === "number" && Number.isFinite(value) && value > 0) {
        rates[code] = value;
      }
    }

    res.setHeader("Cache-Control", "public, s-maxage=21600, stale-while-revalidate=86400");
    return res.status(200).json({
      base: "INR",
      updatedAt: data.time_last_update_unix ? new Date(data.time_last_update_unix * 1000).toISOString() : null,
      rates,
    });
  } catch (error) {
    console.error("rates failed:", error instanceof Error ? error.message : error);
    // Not cached, so the next request retries. The client falls back to plain INR.
    res.setHeader("Cache-Control", "no-store");
    return res.status(502).json({ error: "Exchange rates are unavailable." });
  }
};
