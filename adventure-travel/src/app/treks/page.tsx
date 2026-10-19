import { treks } from "@/data/treks";
import { fitDescription, fitTitle, pageMetadata } from "@/lib/seo";
import TreksPageClient from "./TreksPageClient";

const fromJoshimath = treks.filter((t) => t.startsFrom === "Joshimath").length;

export const metadata = pageMetadata({
  title: fitTitle("Himalayan Treks in Uttarakhand & Himachal"),
  description: fitDescription([
    `${treks.length} guided Himalayan treks, ${fromJoshimath} of them priced Joshimath to Joshimath: Kuari Pass, Pangarchula, Dronagiri, Valley of Flowers and the Mana and Niti permit tours.`,
    "Filter by difficulty, days and price.",
  ]),
  path: "/treks",
});

export default function TreksPage() {
  return <TreksPageClient />;
}
