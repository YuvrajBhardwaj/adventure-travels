import { breadcrumbLd, fitTitle, pageMetadata, webPageLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { shareImage } from "@/lib/shareImage";

const DESCRIPTION =
  "Trekking destinations across Uttarakhand and Himachal Pradesh, from the Valley of Flowers to Hampta Pass, with the guided Himalayan treks we run in each region.";
import DestinationsPageClient from "./DestinationsPageClient";

export const metadata = pageMetadata({
  title: fitTitle("Himalayan Trekking Destinations"),
  description: DESCRIPTION,
  path: "/destinations",
  ...shareImage("valley-of-flowers"),
  imageAlt: "Valley of Flowers, Uttarakhand",
});

export default function DestinationsPage() {
  return (
    <>
      <JsonLd graph={[webPageLd("CollectionPage", "/destinations", "Himalayan Trekking Destinations", DESCRIPTION), breadcrumbLd([["Destinations", "/destinations"]])]} />
      <DestinationsPageClient />
    </>
  );
}
