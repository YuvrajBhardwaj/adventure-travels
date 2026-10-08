import { pageMetadata } from "@/lib/seo";
import ContactPageClient from "./ContactPageClient";

export const metadata = pageMetadata({
  title: "Contact Us — Plan Your Himalayan Trek",
  description:
    "Get in touch with Himalayan Arc Adventure. Plan your guided Himalayan trek in Uttarakhand or Himachal Pradesh. WhatsApp, email, or call our trek experts.",
  socialTitle: "Contact Us | Himalayan Arc Adventure",
  socialDescription: "Plan your guided Himalayan trek. WhatsApp, email, or call our trek experts.",
  path: "/contact",
});

export default function ContactPage() {
  return <ContactPageClient />;
}
