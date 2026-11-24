import { breadcrumbLd, fitTitle, pageMetadata, webPageLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

const DESCRIPTION =
  "Call or WhatsApp +91 78179 12062 to plan your trek or Auli ski course. Offices in Joshimath (Chamoli, Uttarakhand 246443) and Gurugram.";
import ContactPageClient from "./ContactPageClient";

export const metadata = pageMetadata({
  title: fitTitle("Contact Our Joshimath Trek Team"),
  description: DESCRIPTION,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <JsonLd graph={[webPageLd("ContactPage", "/contact", "Contact Himalayan Arc Adventure", DESCRIPTION), breadcrumbLd([["Contact", "/contact"]])]} />
      <ContactPageClient />
    </>
  );
}
