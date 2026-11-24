"use client";

import { Analytics } from "@vercel/analytics/next";
import { stripPageView } from "@/lib/analytics";

/**
 * Vercel Web Analytics (owner, 25 Nov 2026): counts page visits without cookies. Every
 * address goes through stripPageView() first (no query strings, no admin pages); /privacy
 * describes this.
 */
export default function SiteAnalytics() {
  // Only the deployed site counts visits; under `npm run dev` the package would load a debug
  // script from va.vercel-scripts.com on every page.
  if (process.env.NODE_ENV !== "production") return null;
  return <Analytics beforeSend={stripPageView} />;
}
