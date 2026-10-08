import { pageMetadata } from "@/lib/seo";
import DestinationsPageClient from "./DestinationsPageClient";

export const metadata = pageMetadata({
  title: "Destinations — Himalayan Trekking Regions",
  description:
    "Explore trekking destinations across Uttarakhand and Himachal Pradesh. From the Valley of Flowers to Hampta Pass, find your perfect Himalayan adventure.",
  socialTitle: "Destinations | Himalayan Arc Adventure",
  socialDescription: "Explore trekking destinations across Uttarakhand and Himachal Pradesh.",
  path: "/destinations",
});

export default function DestinationsPage() {
  return <DestinationsPageClient />;
}
