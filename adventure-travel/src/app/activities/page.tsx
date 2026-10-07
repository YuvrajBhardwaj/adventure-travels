import type { Metadata } from "next";
import ActivitiesPageClient from "./ActivitiesPageClient";

export const metadata: Metadata = {
  title: "Activities — Trekking, Skiing, Camping & More",
  description:
    "Himalayan treks, skiing & snowboarding in Auli, riverside camping, paragliding in Bir Billing, rock climbing and mountaineering courses. Guided adventures in Uttarakhand & Himachal.",
  openGraph: {
    title: "Activities | Himalayan Arc Adventure",
    description:
      "Trekking, skiing, camping, paragliding and mountaineering in the Indian Himalayas.",
    url: "https://himalayanarcadventure.com/activities",
  },
  alternates: {
    canonical: "https://himalayanarcadventure.com/activities",
  },
};

export default function ActivitiesPage() {
  return <ActivitiesPageClient />;
}
