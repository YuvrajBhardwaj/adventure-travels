import type { Metadata } from "next";
import AdminRedirect from "./AdminRedirect";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminRedirect />;
}
