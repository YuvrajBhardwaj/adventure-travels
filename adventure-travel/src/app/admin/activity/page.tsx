import type { Metadata } from "next";
import AdminActivityClient from "./AdminActivityClient";

export const metadata: Metadata = {
  title: "Activity | Admin",
  robots: { index: false, follow: false },
};

export default function AdminActivityPage() {
  return <AdminActivityClient />;
}
