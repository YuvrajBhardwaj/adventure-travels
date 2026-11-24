import type { Metadata } from "next";
import { formatRupees } from "@/lib/utils";
import Link from "@/components/Link";
import { treks, priceRoute } from "@/data/treks";
import { absoluteUrl, fitDescription, fitTitle, ORGANIZATION_ID, pageMetadata, SITE_URL } from "@/lib/seo";
import { shareImage } from "@/lib/shareImage";
import TrekDetailClient from "./TrekDetailClient";
import RelatedTreks from "@/components/RelatedTreks";
import { guideBySlug, guideForTrek } from "@/data/guides";

/** Links to the guides about this trek and its start town (server-rendered, so Google sees them). */
function TrekGuides({ trek }: { trek: (typeof treks)[number] }) {
  const list = [guideForTrek(trek.slug), trek.startsFrom === "Joshimath" ? guideBySlug("how-to-reach-joshimath") : undefined].filter(
    (g): g is NonNullable<typeof g> => !!g
  );
  if (!list.length) return null;
  return (
    <section aria-labelledby="trek-guides" className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h2 id="trek-guides" className="font-heading text-2xl font-medium tracking-[-0.02em] text-slate-900 sm:text-3xl">Guides</h2>
        <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
          {list.map((g) => (
            <li key={g.slug}>
              <Link href={`/guides/${g.slug}`} className="inline-flex min-h-11 items-center font-semibold text-emerald-700 hover:underline">
                {g.title} →
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// "Kalindi Khal Expedition" and "Ghiya Vinayak Pass (Nandi Kund Trek)" already say what they are.
const trekTitle = (name: string) => (/\b(trek|expedition)\)?$/i.test(name) ? name : `${name} Trek`);


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
    `From ${formatRupees(trek.price)} per person${route ? `, ${route}` : ""}.`,
    `Best season: ${trek.bestSeason}.`,
    trek.blurb,
    trek.groupSize ? `Groups of up to ${trek.groupSize}.` : undefined,
  ]);
  return pageMetadata({
    title,
    description,
    path: `/treks/${trek.slug}`,
    // Our own trek photo as a 1200×630 preview; stock or no photo → the site's default image.
    ...shareImage(trek.slug),
    imageAlt: `${name}, a Himalayan trek in ${trek.region}`,
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
        offers: trek.packages
          ? trek.packages.map((p) => ({
              "@type": "Offer",
              url,
              name: p.label,
              price: p.price,
              priceCurrency: "INR",
              description: `Price covers ${p.from} pickup and drop`,
              availability: "https://schema.org/InStock",
              validFrom: new Date().toISOString(),
            }))
          : {
              "@type": "Offer",
              url,
              price: trek.price,
              priceCurrency: "INR",
              description: route ? `Price covers ${route}` : undefined,
              availability: "https://schema.org/InStock",
              validFrom: new Date().toISOString(),
            },
        provider: { "@id": ORGANIZATION_ID },
        // No aggregateRating until verified review collection exists.
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
      <TrekDetailClient
        trek={trek}
        related={
          <>
            <TrekGuides trek={trek} />
            <RelatedTreks trek={trek} />
          </>
        }
      />
    </>
  );
}
