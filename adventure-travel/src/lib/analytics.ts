/**
 * Privacy filter for Vercel Web Analytics (src/components/SiteAnalytics.tsx). Some of our
 * addresses carry private values (checkout ?booking= ids, password-reset ?token_hash= codes),
 * so the query string and #hash are dropped before anything is sent, and the admin area
 * isn't counted at all. /privacy describes this; keep the two in step.
 */
export function stripPageView<T extends { url: string }>(event: T): T | null {
  const url = new URL(event.url);
  if (url.pathname === "/admin" || url.pathname.startsWith("/admin/")) return null;
  url.search = "";
  url.hash = "";
  return { ...event, url: url.toString() };
}
