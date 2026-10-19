import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

// Account page: kept out of search results. Crawlable (not in robots.txt) so Google sees the noindex.
export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false, follow: false },
  alternates: { canonical: `${SITE_URL}/reset-password` },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
