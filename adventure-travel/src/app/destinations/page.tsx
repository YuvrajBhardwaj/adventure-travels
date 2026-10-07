import type { Metadata } from "next";
import DestinationsPageClient from "./DestinationsPageClient";

export const metadata: Metadata = {
  title: "Destinations — Himalayan Trekking Regions",
  description:
    "Explore trekking destinations across Uttarakhand and Himachal Pradesh. From the Valley of Flowers to Hampta Pass, find your perfect Himalayan adventure.",
  openGraph: {
    title: "Destinations | Himalayan Arc Adventure",
    description:
      "Explore trekking destinations across Uttarakhand and Himachal Pradesh.",
    url: "https://himalayanarcadventure.com/destinations",
  },
  alternates: {
    canonical: "https://himalayanarcadventure.com/destinations",
  },
};

export default function DestinationsPage() {
  return <DestinationsPageClient />;
}
