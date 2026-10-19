import type { Metadata } from "next";
import Link from "next/link";
import { treks, priceRoute } from "@/data/treks";
import { absoluteUrl, fitDescription, fitTitle, ORGANIZATION_ID, pageMetadata, SITE_URL } from "@/lib/seo";
import TrekDetailClient from "./TrekDetailClient";

// "Kalindi Khal Expedition" and "Ghiya Vinayak Pass (Nandi Kund Trek)" already say what they are.
const trekTitle = (name: string) => (/\b(trek|expedition)\)?$/i.test(name) ? name : `${name} Trek`);

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export function generateStaticParams() {
  return treks.map((trek) => ({ id: trek.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const trek = treks.find((t) => t.slug === id);
  if (!trek) return { title: "Trek Not Found" };

  const name = trekTitle(trek.name);
  const route = priceRoute(trek);
  // Primary query first ("kuari pass trek", "... from joshimath"), then days and grade if they fit.
  const title = fitTitle(`${name}${trek.startsFrom ? ` from ${trek.startsFrom}` : ""}`, [
    `${trek.days} Days`,
    trek.difficulty,
  ]);
  const description = fitDescription([
    `${name}: ${trek.days} days, ${trek.difficulty.toLowerCase()}, up to ${trek.maxAltitude.toLocaleString("en-IN")} m in ${trek.region}.`,
    `From ${inr(trek.price)} per person${route ? `, ${route}` : ""}.`,
    `Best season: ${trek.bestSeason}.`,
    trek.blurb,
    trek.groupSize ? `Groups of up to ${trek.groupSize}.` : undefined,
  ]);
  return pageMetadata({
    title,
    description,
    path: `/treks/${trek.slug}`,
    // No trek photo → the site's default share image (and its own alt text).
    ...(trek.image && {
      image: trek.image,
      imageAlt: `${name} — Himalayan adventure in ${trek.region}`,
    }),
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

  const url = absoluteUrl(`/treks/${trek.slug}`);
  const route = priceRoute(trek);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TouristTrip",
        "@id": `${url}#trip`,
        name: trekTitle(trek.name),
        description: trek.blurb,
        url,
        image: trek.image ? absoluteUrl(trek.image) : undefined,
        touristType: "Trekkers",
        itinerary: {
          "@type": "ItemList",
          numberOfItems: trek.itinerary.length,
          itemListElement: trek.itinerary.map((day, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: day.title,
            description: day.description,
          })),
        },
        offers: {
          "@type": "Offer",
          url,
          price: trek.price,
          priceCurrency: "INR",
          description: route ? `Price covers ${route}` : undefined,
          availability: "https://schema.org/InStock",
          validFrom: new Date().toISOString(),
        },
        provider: { "@id": ORGANIZATION_ID },
        // Only with a real count behind it — never a made-up fallback.
        aggregateRating:
          trek.rating && trek.reviewCount
            ? {
                "@type": "AggregateRating",
                ratingValue: trek.rating,
                reviewCount: trek.reviewCount,
              }
            : undefined,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Treks", item: absoluteUrl("/treks") },
          { "@type": "ListItem", position: 3, name: trek.name, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <TrekDetailClient trek={trek} />
    </>
  );
}
