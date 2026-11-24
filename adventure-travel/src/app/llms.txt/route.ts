import { treks, priceRoute } from "@/data/treks";
import { courses } from "@/data/courses";
import { TOURS } from "@/data/tours";
import { REFUND_TIERS } from "@/data/cancellationPolicy";
import { absoluteUrl, SITE_NAME } from "@/lib/seo";

export const dynamic = "force-static";

const rs = (n: number) => `Rs.${n.toLocaleString("en-IN")}`;
/** First sentence only: AI readers get the gist; the page has the rest. */
const firstSentence = (text: string) => text.match(/^.*?[.!?](\s|$)/)?.[0].trim() ?? text;

/**
 * /llms.txt (llmstxt.org): a plain summary of the site for AI assistants and AI search (GEO),
 * built from src/data so prices, days and altitudes always match the pages.
 */
export function GET() {
  const lines = [
    `# ${SITE_NAME}`,
    "",
    "> Guided Himalayan treks in Uttarakhand and Himachal Pradesh, short tours, and a ski and snowboard school in Auli, run by a local team based in Joshimath (Chamoli, Uttarakhand 246443, India). Prices are in Indian rupees per person. Enquiries and bookings: WhatsApp or call +91 78179 12062, email himalayanarcadventure@gmail.com.",
    "",
    "## Treks",
    "",
    ...treks.map((t) => {
      const route = priceRoute(t);
      return `- [${t.name}](${absoluteUrl(`/treks/${t.slug}`)}): ${t.days} days, highest point ${t.maxAltitude.toLocaleString("en-IN")} m, ${t.difficulty}, from ${rs(t.price)}${route ? ` (${route})` : ""}. Best season: ${t.bestSeason}. ${firstSentence(t.blurb)}`;
    }),
    "",
    "## Ski and snowboard courses in Auli",
    "",
    ...courses.map((c) => `- [${c.name}](${absoluteUrl(`/courses/${c.slug}`)}): ${c.duration}, ${c.level}, from ${rs(c.price)}. ${firstSentence(c.description)}`),
    "",
    "## Tours",
    "",
    ...TOURS.map((t) => `- [${t.name}](${absoluteUrl(t.href)}): ${t.days} days, ${t.route.join(" to ")}, ${t.priceFrom ? "from " : ""}${rs(t.price)}. ${firstSentence(t.blurb)}`),
    "",
    "## Guides and hubs",
    "",
    `- [Treks from Joshimath](${absoluteUrl("/treks-from-joshimath")}): every trek that starts and ends in Joshimath.`,
    `- [Winter treks in Uttarakhand](${absoluteUrl("/winter-treks-uttarakhand")}): snow treks by month.`,
    `- [Trekking FAQ](${absoluteUrl("/faq")}): booking, fitness, gear, altitude sickness and safety.`,
    "",
    "## Booking and policies",
    "",
    `- [Cancellation and refund policy](${absoluteUrl("/cancellation-policy")}): ${REFUND_TIERS.map((t) => `${t.window}: ${t.cash.toLowerCase()}`).join("; ")}.`,
    `- [Terms and conditions](${absoluteUrl("/terms")})`,
    `- [Privacy policy](${absoluteUrl("/privacy")})`,
    `- [Contact](${absoluteUrl("/contact")}): Joshimath office (near Military Hospital, Chamoli, Uttarakhand 246443) and Gurugram office (M3M Marina, Sector 68, Gurugram 122101).`,
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
