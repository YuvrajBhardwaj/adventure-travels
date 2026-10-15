import type { Metadata } from "next";
import CustomersAdminClient from "./CustomersAdminClient";

export const metadata: Metadata = {
  title: "Customers | Admin",
  robots: { index: false, follow: false },
};

export default function AdminCustomersPage() {
  return <CustomersAdminClient />;
}
