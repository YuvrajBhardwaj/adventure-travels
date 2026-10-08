import type { Metadata } from "next";
import Link from "next/link";
import { treks } from "@/data/treks";
import { pageMetadata } from "@/lib/seo";
import TrekDetailClient from "./TrekDetailClient";

const trekTitle = (name: string) => (/\btrek$/i.test(name) ? name : `${name} Trek`);

export function generateStaticParams() {
  return treks.map((trek) => ({ id: trek.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const trek = treks.find((t) => t.slug === id);
  if (!trek) return { title: "Trek Not Found" };

  const title = `${trekTitle(trek.name)} — ${trek.days} Days, ${trek.difficulty} | ${trek.region}`;
  const description = `${trek.blurb} ${trek.days}-day ${trek.difficulty.toLowerCase()} trek in ${trek.region}. Max altitude ${trek.maxAltitude}m. From ${trek.currency}${trek.price.toLocaleString("en-IN")} per person. Book with Himalayan Arc Adventure.`;
  return pageMetadata({
    title,
    description,
    path: `/treks/${trek.slug}`,
    image: trek.image,
    imageAlt: `${trekTitle(trek.name)} — Himalayan adventure in ${trek.region}`,
    type: "article",
  });
}

export default async function TrekDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trek = treks.find((t) => t.slug === id);

  if (!trek) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Trek Not Found</h1>
          <Link href="/treks" className="text-emerald-600 hover:underline">
            Back to All Treks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TouristTrip",
            name: trekTitle(trek.name),
            description: trek.blurb,
            url: `https://www.himalayanarcadventure.com/treks/${trek.slug}`,
            image: trek.image,
            touristType: "Trekkers",
            itinerary: {
              "@type": "ItemList",
              numberOfItems: trek.days,
              itemListElement: trek.itinerary.map((day) => ({
                "@type": "ListItem",
                position: day.day,
                name: day.title,
                description: day.description,
              })),
            },
            offers: {
              "@type": "Offer",
              price: trek.price,
              priceCurrency: "INR",
              availability: "https://schema.org/InStock",
              validFrom: new Date().toISOString(),
            },
            provider: {
              "@type": "TravelAgency",
              name: "Himalayan Arc Adventure",
              url: "https://www.himalayanarcadventure.com",
            },
            aggregateRating: trek.rating
              ? {
                  "@type": "AggregateRating",
                  ratingValue: trek.rating,
                  reviewCount: trek.reviewCount || 100,
                }
              : undefined,
          }),
        }}
      />
      <TrekDetailClient trek={trek} />
    </>
  );
}
