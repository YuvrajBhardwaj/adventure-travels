import { fitTitle, pageMetadata } from "@/lib/seo";
import ContactPageClient from "./ContactPageClient";

export const metadata = pageMetadata({
  title: fitTitle("Contact Our Joshimath Trek Team"),
  description:
    "Call or WhatsApp +91 78179 12062 to plan your trek or Auli ski course. Offices in Joshimath (Chamoli, Uttarakhand 246443) and Gurugram.",
  path: "/contact",
});

export default function ContactPage() {
  return <ContactPageClient />;
}
