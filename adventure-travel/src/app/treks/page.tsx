import { treks } from "@/data/treks";
import { absoluteUrl, breadcrumbLd, fitDescription, fitTitle, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { shareImage } from "@/lib/shareImage";

import TreksPageClient from "./TreksPageClient";

const fromJoshimath = treks.filter((t) => t.startsFrom === "Joshimath").length;

export const metadata = pageMetadata({
  title: fitTitle("Himalayan Treks in Uttarakhand & Himachal"),
  description: fitDescription([
    `${treks.length} guided Himalayan treks, ${fromJoshimath} of them priced Joshimath to Joshimath: Kuari Pass, Pangarchula, Dronagiri, Valley of Flowers and the Mana and Niti permit tours.`,
    "Filter by difficulty, days and price.",
  ]),
  path: "/treks",
  ...shareImage("kuari-pass"),
  imageAlt: "Kuari Pass Trek, Uttarakhand",
});

export default function TreksPage() {
  return (
    <>
      <JsonLd
        graph={[
          {
            "@type": "ItemList",
            name: "Guided Himalayan treks",
            numberOfItems: treks.length,
            itemListElement: treks.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, url: absoluteUrl(`/treks/${t.slug}`) })),
          },
          breadcrumbLd([["Treks", "/treks"]]),
        ]}
      />
      <TreksPageClient />
    </>
  );
}
