import type { Metadata } from "next";
import PaymentsAdminClient from "./PaymentsAdminClient";

export const metadata: Metadata = {
  title: "Payments | Admin",
  robots: { index: false, follow: false },
};

export default function AdminPaymentsPage() {
  return <PaymentsAdminClient />;
}
