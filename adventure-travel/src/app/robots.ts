import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /login, /signup and /reset-password stay crawlable so Google can see their noindex tag.
        disallow: ["/dashboard", "/checkout", "/admin"],
      },
      // AI search and answer crawlers (ChatGPT search, Claude, Perplexity): allowed, so the site can be
      // found and cited in AI answers (GEO). They fetch pages to answer a question; they don't train models.
      {
        userAgent: ["OAI-SearchBot", "ChatGPT-User", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User"],
        allow: "/",
        disallow: ["/dashboard", "/checkout", "/admin"],
      },
      // AI training/scraping crawlers: blocked so our photos and copy aren't bulk-copied into datasets.
      // Search engines (Googlebot, Bingbot) are unaffected; Google-Extended only controls Gemini training
      // (Google's AI Overviews use Googlebot, so they still see the site).
      {
        userAgent: ["GPTBot", "ClaudeBot", "CCBot", "Google-Extended", "Bytespider", "Amazonbot", "Applebot-Extended", "meta-externalagent"],
        disallow: "/",
      },
    ],
    sitemap: "https://www.himalayanarcadventure.com/sitemap.xml",
  };
}
