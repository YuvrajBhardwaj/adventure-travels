import type { Metadata } from "next";
import FAQPageClient from "./FAQPageClient";

export const metadata: Metadata = {
  title: "Frequently Asked Questions — Himalayan Trekking",
  description:
    "Everything you need to know about trekking in Uttarakhand and Himachal Pradesh — booking, fitness, gear, safety, weather, food, accommodation and trail experiences.",
  openGraph: {
    title: "FAQ | Himalayan Arc Adventure",
    description:
      "Everything you need to know about trekking in Uttarakhand and Himachal Pradesh.",
    url: "https://himalayanarcadventure.com/faq",
  },
  alternates: {
    canonical: "https://himalayanarcadventure.com/faq",
  },
};

const FAQ_DATA = [
  { q: "How does the booking process work for guided treks in Uttarakhand and Himachal?", a: "Booking your Himalayan trekking adventure is seamless. Select your preferred trek and departure batch on our website, fill in your personal and emergency contact details, and proceed to secure online payment." },
  { q: "What payment methods do you accept for trek reservations?", a: "We accept all major credit and debit cards, net banking, UPI (Google Pay, PhonePe, Paytm), and major wallet providers through our secure payment gateway." },
  { q: "Which Himalayan treks are best suited for absolute beginners?", a: "Beginner-friendly snow treks like Kedarkantha, Brahmatal, or Nag Tibba in Uttarakhand, as well as Triund and Kareri Lake in Himachal, are ideal." },
  { q: "What level of physical fitness is required for high-altitude trekking?", a: "High-altitude trekking demands cardiovascular endurance and leg strength. We recommend starting a cardio regimen 4 to 6 weeks before your trek." },
  { q: "What makes Kedarkantha Trek one of India's premier winter snow treks?", a: "Kedarkantha Trek offers pristine pine forests, snow-covered meadows, and a breathtaking 360-degree Himalayan summit panorama at 12,500 feet." },
  { q: "What is the best season for trekking in Uttarakhand and Himachal Pradesh?", a: "Summer (May-June) brings pleasant weather; Monsoon (July-August) transforms valleys lush green; Autumn (September-November) offers crystal-clear skies; Winter (December-March) provides magical snow landscapes." },
  { q: "What medical certifications and training do your trek leaders possess?", a: "All our lead guides are certified Mountaineering graduates from premier institutes and hold advanced Wilderness First Responder (WFR) and CPR certifications." },
  { q: "How do trek leaders manage Acute Mountain Sickness (AMS)?", a: "Our leaders conduct daily health screenings including oxygen saturation and pulse checks. If early symptoms appear, immediate descent protocol is initiated." },
];

export default function FAQPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_DATA.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <FAQPageClient />
    </>
  );
}
