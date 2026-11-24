import { breadcrumbLd, fitTitle, pageMetadata, webPageLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { shareImage } from "@/lib/shareImage";

const DESCRIPTION =
  "Himalayan treks, skiing and snowboarding in Auli, camping, paragliding in Bir Billing and rock climbing. Guided adventures in Uttarakhand and Himachal Pradesh.";
import ActivitiesPageClient from "./ActivitiesPageClient";

export const metadata = pageMetadata({
  title: fitTitle("Treks, Ski School & Camping in the Himalayas"),
  description: DESCRIPTION,
  path: "/activities",
  ...shareImage("kuari-pass"),
  imageAlt: "Kuari Pass Trek, Uttarakhand",
});

export default function ActivitiesPage() {
  return (
    <>
      <JsonLd graph={[webPageLd("CollectionPage", "/activities", "Treks, Ski School and Camping in the Himalayas", DESCRIPTION), breadcrumbLd([["Activities", "/activities"]])]} />
      <ActivitiesPageClient />
    </>
  );
}
