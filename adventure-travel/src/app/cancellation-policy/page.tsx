import { pageMetadata } from "@/lib/seo";
import CancellationPolicyPageClient from "./CancellationPolicyPageClient";

export const metadata = pageMetadata({
  title: "Cancellation & Refund Policy",
  description:
    "Cancellation and refund policy for Himalayan trek bookings: refund tiers, trek vouchers, rescheduling options and what happens on a no-show.",
  socialTitle: "Cancellation & Refund Policy | Himalayan Arc Adventure",
  socialDescription: "Cancellation and refund policy for trek bookings.",
  path: "/cancellation-policy",
});

export default function CancellationPolicyPage() {
  return <CancellationPolicyPageClient />;
}
