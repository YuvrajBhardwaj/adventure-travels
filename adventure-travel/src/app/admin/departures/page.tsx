import type { Metadata } from "next";
import DeparturesAdminClient from "./DeparturesAdminClient";

export const metadata: Metadata = {
  title: "Departures | Admin",
  robots: { index: false, follow: false },
};

export default function AdminDeparturesPage() {
  return <DeparturesAdminClient />;
}
