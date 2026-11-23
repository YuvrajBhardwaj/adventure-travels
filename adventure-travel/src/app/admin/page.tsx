import type { Metadata } from "next";
import OverviewAdminClient from "./OverviewAdminClient";

export const metadata: Metadata = {
  title: "Overview | Admin",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <OverviewAdminClient />;
}
