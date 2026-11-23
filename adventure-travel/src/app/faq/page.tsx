import { fitTitle, pageMetadata } from "@/lib/seo";
import FAQPageClient from "./FAQPageClient";

export const metadata = pageMetadata({
  title: fitTitle("Himalayan Trekking FAQs"),
  description:
    "Booking, fitness, gear, AMS and safety, weather, food and campsites: answers for trekking in Uttarakhand and Himachal Pradesh from our Joshimath team.",
  path: "/faq",
});

const FAQ_DATA = [
  { q: "How does the booking process work for guided treks in Uttarakhand and Himachal?", a: "Pick your trek, a start date and your group size on the trek page, sign in and send the booking. You get a booking email straight away and can pay online from your dashboard: a 30% advance when the trek is more than 15 days away, or the full amount." },
  { q: "What payment methods do you accept for trek reservations?", a: "Online payments go through Razorpay: UPI (Google Pay, PhonePe, Paytm), debit and credit cards, net banking and the other methods Razorpay shows at checkout." },
  { q: "Which Himalayan treks are best suited for absolute beginners?", a: "Beginner-friendly snow treks like Kedarkantha, Brahmatal, or Tungnath in Uttarakhand are ideal." },
  { q: "What level of physical fitness is required for high-altitude trekking?", a: "High-altitude trekking needs cardiovascular endurance and leg strength. We recommend starting a cardio regimen 4 to 6 weeks before your trek." },
  { q: "Why trek Kedarkantha in winter?", a: "Kedarkantha Trek has pine forests, snow-covered meadows and a 360-degree Himalayan view from the summit at 12,500 feet. Snow is reliable from December to April." },
  { q: "What is the best season for trekking in Uttarakhand and Himachal Pradesh?", a: "Summer (May-June) brings pleasant weather; Monsoon (July-August) turns the valleys green; Autumn (September-November) has the clearest skies; Winter (December-March) is for snow." },
  { q: "What medical certifications and training do your trek leaders possess?", a: "Our trek leaders are experienced Himalayan guides from the Joshimath area, trained in mountain first aid. Message us to know who is leading your batch and the training they hold." },
  { q: "How do trek leaders manage Acute Mountain Sickness (AMS)?", a: "Our leaders check on everyone each day, including oxygen level and pulse. If symptoms of AMS appear, the trekker stops going higher, and if they don't improve, goes down with a member of our staff." },
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
