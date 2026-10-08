import { pageMetadata } from "@/lib/seo";
import CancellationPolicyPageClient from "./CancellationPolicyPageClient";

export const metadata = pageMetadata({
  title: "Cancellation & Refund Policy",
  description:
    "Transparent cancellation and refund policy for Himalayan trek bookings. Understand refund tiers, rescheduling options, and no-show scenarios.",
  socialTitle: "Cancellation & Refund Policy | Himalayan Arc Adventure",
  socialDescription: "Transparent cancellation and refund policy for trek bookings.",
  path: "/cancellation-policy",
});

export default function CancellationPolicyPage() {
  return <CancellationPolicyPageClient />;
}
