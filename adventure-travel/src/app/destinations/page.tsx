import { fitTitle, pageMetadata } from "@/lib/seo";
import DestinationsPageClient from "./DestinationsPageClient";

export const metadata = pageMetadata({
  title: fitTitle("Himalayan Trekking Destinations"),
  description:
    "Trekking destinations across Uttarakhand and Himachal Pradesh, from the Valley of Flowers to Hampta Pass, with the guided Himalayan treks we run in each region.",
  path: "/destinations",
});

export default function DestinationsPage() {
  return <DestinationsPageClient />;
}
