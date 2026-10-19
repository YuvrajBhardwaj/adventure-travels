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
      // AI training/scraping crawlers: blocked so our photos and copy aren't bulk-copied into datasets.
      // Search engines (Googlebot, Bingbot) are unaffected; Google-Extended only controls Gemini training.
      {
        userAgent: ["GPTBot", "ClaudeBot", "CCBot", "Google-Extended", "Bytespider", "PerplexityBot", "Amazonbot", "Applebot-Extended", "meta-externalagent"],
        disallow: "/",
      },
    ],
    sitemap: "https://www.himalayanarcadventure.com/sitemap.xml",
  };
}
