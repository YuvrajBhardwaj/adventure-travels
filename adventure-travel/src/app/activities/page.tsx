import { pageMetadata } from "@/lib/seo";
import ActivitiesPageClient from "./ActivitiesPageClient";

export const metadata = pageMetadata({
  title: "Activities — Trekking, Skiing, Camping & More",
  description:
    "Himalayan treks, skiing & snowboarding in Auli, riverside camping, paragliding in Bir Billing, rock climbing and mountaineering courses. Guided adventures in Uttarakhand & Himachal.",
  socialTitle: "Activities | Himalayan Arc Adventure",
  socialDescription: "Trekking, skiing, camping, paragliding and mountaineering in the Indian Himalayas.",
  path: "/activities",
});

export default function ActivitiesPage() {
  return <ActivitiesPageClient />;
}
