import { breadcrumbLd, pageMetadata, webPageLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

const DESCRIPTION =
  "Cancellation and refund policy for Himalayan trek bookings: refund tiers, payment terms and free date changes.";
import CancellationPolicyPageClient from "./CancellationPolicyPageClient";

export const metadata = pageMetadata({
  title: "Cancellation & Refund Policy",
  description: DESCRIPTION,
  socialTitle: "Cancellation & Refund Policy | Himalayan Arc Adventure",
  socialDescription: "Cancellation and refund policy for trek bookings.",
  path: "/cancellation-policy",
});

export default function CancellationPolicyPage() {
  return (
    <>
      <JsonLd graph={[webPageLd("WebPage", "/cancellation-policy", "Cancellation & Refund Policy", DESCRIPTION), breadcrumbLd([["Cancellation & Refund Policy", "/cancellation-policy"]])]} />
      <CancellationPolicyPageClient />
    </>
  );
}
