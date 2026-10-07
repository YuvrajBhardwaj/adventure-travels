import type { Metadata } from "next";
import ContactPageClient from "./ContactPageClient";

export const metadata: Metadata = {
  title: "Contact Us — Plan Your Himalayan Trek",
  description:
    "Get in touch with Himalayan Arc Adventure. Plan your guided Himalayan trek in Uttarakhand or Himachal Pradesh. WhatsApp, email, or call our trek experts.",
  openGraph: {
    title: "Contact Us | Himalayan Arc Adventure",
    description:
      "Plan your guided Himalayan trek. WhatsApp, email, or call our trek experts.",
    url: "https://himalayanarcadventure.com/contact",
  },
  alternates: {
    canonical: "https://himalayanarcadventure.com/contact",
  },
};

export default function ContactPage() {
  return <ContactPageClient />;
}
