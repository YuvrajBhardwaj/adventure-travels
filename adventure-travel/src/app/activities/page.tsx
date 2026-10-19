import { fitTitle, pageMetadata } from "@/lib/seo";
import ActivitiesPageClient from "./ActivitiesPageClient";

export const metadata = pageMetadata({
  title: fitTitle("Treks, Skiing & Camping in the Himalayas"),
  description:
    "Himalayan treks, skiing and snowboarding in Auli, camping, paragliding in Bir Billing and rock climbing. Guided adventures in Uttarakhand and Himachal Pradesh.",
  path: "/activities",
});

export default function ActivitiesPage() {
  return <ActivitiesPageClient />;
}
