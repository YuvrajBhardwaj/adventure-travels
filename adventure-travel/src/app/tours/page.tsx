import Link from "@/components/Link";
import { CHOPTA_TREK, TOURS } from "@/data/tours";
import { AULI_ESCAPE } from "@/data/auliEscape";
import { absoluteUrl, fitDescription, fitTitle, pageMetadata, SITE_URL } from "@/lib/seo";
import Price from "@/components/Price";
import NoPhoto from "@/components/NoPhoto";
import { tourPhotos } from "@/lib/tourPhotos";
import { shareImage } from "@/lib/shareImage";
import EnquireTab from "@/components/EnquireTab";

export const metadata = pageMetadata({
  title: fitTitle("Uttarakhand Trips & Tours", [TOURS.map((t) => t.name.split(/\s/)[0]).join(" & ") + " Getaways"]),
  description: fitDescription([
    `Short Uttarakhand tours with Himalayan Arc Adventure: ${TOURS.map((t) => t.name).join(", ")}.`,
    "Drives, stays and guided sightseeing; no trekking needed.",
  ]),
  socialTitle: "Uttarakhand Tours | Himalayan Arc Adventure",
  path: "/tours",
  ...shareImage(`tour-${TOURS[0].slug}`),
  imageAlt: TOURS[0].name,
});

// Who the tours suit, from the tours' own data (src/data/auliEscape.ts, tours.ts).
const WHO_FOR = [
  {
    title: "No trekking needed",
    text: "The Auli Winter Escape is drives, stays and guided sightseeing. Skiing and the chairlift are optional extras.",
  },
  {
    title: "Friends and families",
    text: `Groups of ${AULI_ESCAPE.groupFrom} or more pay Rs.${AULI_ESCAPE.groupPrice.toLocaleString("en-IN")} each on the Auli trip, with a bonfire included.`,
  },
  {
    title: "Short getaways",
    text: `${AULI_ESCAPE.days} days from Rishikesh to Auli, or ${CHOPTA_TREK.days} days from Delhi to Chopta and Tungnath.`,
  },
];

export default function ToursPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: "Tours",
        numberOfItems: TOURS.length,
        itemListElement: TOURS.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, url: absoluteUrl(t.href) })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Tours", item: absoluteUrl("/tours") },
        ],
      },
    ],
  };

  return (
    <main id="main" className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* Runs under the fixed navbar, so there's no light strip between the two. */}
      <header className="bg-navy text-white">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-28 sm:px-6 lg:px-8 lg:pb-16 lg:pt-36">
          <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-sm text-white/60">
            <Link href="/" className="inline-flex min-h-11 items-center transition-colors duration-150 ease-out hover:text-white">Home</Link>
            <span aria-hidden>/</span>
            <span className="text-white/90">Tours</span>
          </nav>
          <h1 className="font-heading text-5xl font-medium leading-[0.98] tracking-[-0.02em] sm:text-6xl xl:text-7xl">Uttarakhand Trips &amp; Tours</h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
            Short Himalayan getaways for friends and families: scenic drives, comfortable stays and guided sightseeing, no trekking needed.
          </p>
        </div>
      </header>

      <div className="py-section-sm mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TOURS.map((tour) => ({ ...tour, image: tour.image ?? tourPhotos(tour.slug)[0] })).map((t) => (
            <li key={t.slug}>
              <Link
                href={t.href}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-150 ease-out hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                {t.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.image} alt={t.name} className="aspect-[4/3] w-full object-cover" />
                ) : (
                  <NoPhoto profile={t.profile} label={t.name} className="aspect-[4/3] w-full" />
                )}
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <p className="font-nav text-xs uppercase tracking-[0.14em] text-slate-500">
                    {t.days} days{t.nights ? ` / ${t.nights} nights` : ""}
                  </p>
                  <h2 className="mt-2 font-heading text-2xl font-medium tracking-[-0.015em] text-slate-900 group-hover:text-emerald-700">{t.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{t.route.join(" – ")}</p>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">{t.blurb}</p>
                  <div className="mt-auto pt-5">
                    <p className="font-heading text-2xl font-medium tabular-nums text-slate-900">
                      {t.priceFrom && <span className="mr-1.5 font-sans text-sm font-normal text-slate-500">From</span>}
                      <Price inr={t.price} /> <span className="font-sans text-sm font-normal text-slate-500">/ person</span>
                    </p>
                    {t.priceNote && <p className="mt-1 text-sm text-emerald-700">{t.priceNote}</p>}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <section aria-labelledby="who-for-h" className="mt-14 border-t border-slate-200 pt-10 lg:mt-20">
          <h2 id="who-for-h" className="font-heading text-3xl font-medium tracking-[-0.015em] text-slate-900">Who the tours suit</h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-3">
            {WHO_FOR.map((w) => (
              <li key={w.title}>
                <p className="font-nav text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">{w.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{w.text}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <EnquireTab subject="a tour" kind="tour" heading="Questions about a tour?" message="I'd like to know more about your tours: dates, price and availability." />
    </main>
  );
}
