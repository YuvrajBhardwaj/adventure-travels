import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

// Account page: kept out of search results. Crawlable (not in robots.txt) so Google sees the noindex.
export const metadata: Metadata = {
  title: "Log in",
  robots: { index: false, follow: false },
  alternates: { canonical: `${SITE_URL}/login` },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
