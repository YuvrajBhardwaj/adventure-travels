import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

// Account page: kept out of search results. Crawlable (not in robots.txt) so Google sees the noindex.
export const metadata: Metadata = {
  title: "Sign up",
  robots: { index: false, follow: false },
  alternates: { canonical: `${SITE_URL}/signup` },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
