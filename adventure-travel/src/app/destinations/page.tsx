import { fitTitle, pageMetadata } from "@/lib/seo";
import DestinationsPageClient from "./DestinationsPageClient";

export const metadata = pageMetadata({
  title: fitTitle("Himalayan Trekking Destinations"),
  description:
    "Explore trekking destinations across Uttarakhand and Himachal Pradesh. From the Valley of Flowers to Hampta Pass, find your perfect Himalayan adventure.",
  path: "/destinations",
});

export default function DestinationsPage() {
  return <DestinationsPageClient />;
}
