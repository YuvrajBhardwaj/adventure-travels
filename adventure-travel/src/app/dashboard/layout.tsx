import type { Metadata } from "next";

// Account page: keep it out of search results (robots.txt also disallows the path).
export const metadata: Metadata = { title: "My bookings", robots: { index: false, follow: false } };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
