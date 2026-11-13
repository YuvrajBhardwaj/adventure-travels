import Link from "next/link";
import type { ReactNode } from "react";
import { TOUR_CONTACT } from "@/data/tours";
import { absoluteUrl, ORGANIZATION_ID, SITE_URL } from "@/lib/seo";
import Price from "@/components/Price";
import NoPhoto from "@/components/NoPhoto";
import { BrandIcon } from "@/components/BrandIcon";
import { buttonVariants } from "@/components/ui/button";

export interface TourDay {
  day: number;
  title: string;
  /** Bullet points, or one paragraph in `text`. */
  points?: readonly string[];
  text?: string;
  meals?: string;
  stay?: string;
  note?: string;
}

const H2 = "font-heading text-3xl font-medium tracking-[-0.02em] text-slate-900 sm:text-4xl";

/** A two-column page section: heading on the left, content on the right (stacked on phones). */
export function TourSection({ id, title, intro, first, children }: { id: string; title: string; intro?: ReactNode; first?: boolean; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className={first ? "lg:grid lg:grid-cols-12 lg:gap-10" : "border-t border-slate-200 pt-12 lg:grid lg:grid-cols-12 lg:gap-10"}>
      <div className="lg:col-span-3">
        <h2 id={id} className={H2}>{title}</h2>
        {intro && <p className="mt-3 max-w-xs text-sm text-slate-500">{intro}</p>}
      </div>
      <div className="relative mt-6 lg:col-span-9 lg:mt-0">{children}</div>
    </section>
  );
}

/**
 * The layout every tour page shares (/tours/<slug>), so Auli, Chopta and later tours look
 * the same: header with prices, the tour's own price table, itinerary, inclusions, good to
 * know, and the booking block. Server-rendered, so all of it is in the static HTML.
 */
export function TourPage({
  path,
  name,
  days,
  nights,
  route,
  intro,
  image,
  imageAlt,
  profile,
  heroPrices,
  pricing,
  itinerary,
  included,
  excluded,
  goodToKnow,
  bookTitle,
  bookText,
  bookOnline,
  offerDescription,
  price,
}: {
  path: string;
  name: string;
  days: number;
  nights?: number;
  route: readonly string[];
  intro: string;
  image?: string;
  imageAlt: string;
  /** Altitudes for the no-photo panel when there's no image. */
  profile?: number[];
  heroPrices: { label: string; inr: number; note?: string; accent?: boolean }[];
  /** The tour's own price table, e.g. group offers or room sharing. */
  pricing: ReactNode;
  itinerary: readonly TourDay[];
  included: readonly string[];
  excluded: readonly string[];
  goodToKnow: { title: string; items: readonly string[] }[];
  bookTitle: string;
  bookText: string;
  /** Optional link to book and pay online (e.g. the matching trek page). */
  bookOnline?: string;
  offerDescription: string;
  /** Lowest per-person price, for structured data. */
  price: number;
}) {
  const length = `${days} days${nights ? ` / ${nights} nights` : ""}`;
  const whatsapp = `https://wa.me/917817912062?text=${encodeURIComponent(`Hi! I'd like to book the ${name} (${length}).\nDate: \nGroup size: `)}`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TouristTrip",
        name,
        description: intro,
        url: absoluteUrl(path),
        ...(image ? { image: absoluteUrl(image) } : {}),
        touristType: ["Families", "Groups of friends"],
        itinerary: {
          "@type": "ItemList",
          itemListElement: itinerary.map((d, i) => ({ "@type": "ListItem", position: i + 1, name: `Day ${d.day}: ${d.title}` })),
        },
        offers: {
          "@type": "Offer",
          url: absoluteUrl(path),
          price,
          priceCurrency: "INR",
          description: offerDescription,
          availability: "https://schema.org/InStock",
        },
        provider: { "@id": ORGANIZATION_ID },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Tours", item: absoluteUrl("/tours") },
          { "@type": "ListItem", position: 3, name, item: absoluteUrl(path) },
        ],
      },
    ],
  };
  const whatsappButton = (className?: string) => (
    <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={buttonVariants({ size: "lg", className })}>
      <BrandIcon brand="whatsapp" className="h-5 w-5" />
      Book on WhatsApp
    </a>
  );
  const outlineOnNavy = "border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white";

  return (
    <main id="main" className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* Runs under the fixed navbar, so there's no light strip between the two. */}
      <header className="bg-navy text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-12 pt-28 sm:px-6 lg:grid-cols-12 lg:items-end lg:gap-12 lg:px-8 lg:pb-16 lg:pt-36">
          <div className="lg:col-span-7">
            <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-sm text-white/60">
              <Link href="/" className="inline-flex min-h-11 items-center transition-colors duration-150 ease-out hover:text-white">Home</Link>
              <span aria-hidden>/</span>
              <Link href="/tours" className="inline-flex min-h-11 items-center transition-colors duration-150 ease-out hover:text-white">Tours</Link>
              <span aria-hidden>/</span>
              <span className="text-white/90">{name}</span>
            </nav>
            <p className="font-nav text-sm uppercase tracking-[0.14em] text-white/60">
              {length} · {route.join(" – ")}
            </p>
            <h1 className="mt-3 font-heading text-5xl font-medium leading-[0.98] tracking-[-0.02em] sm:text-6xl xl:text-7xl">{name}</h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">{intro}</p>
            <div className="mt-8 flex flex-wrap items-end gap-x-8 gap-y-4">
              {heroPrices.map((p) => (
                <p key={p.label}>
                  <span className="block text-sm text-white/60">{p.label}</span>
                  <span className={`font-heading text-4xl font-medium tabular-nums ${p.accent ? "text-emerald-300" : ""}`}><Price inr={p.inr} /></span>
                  {p.note && <span className="ml-2 text-sm text-white/60">{p.note}</span>}
                </p>
              ))}
            </div>
            {whatsappButton("mt-8")}
          </div>
          <div className="lg:col-span-5">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt={imageAlt} className="aspect-[4/3] w-full rounded-2xl object-cover" />
            ) : (
              <NoPhoto profile={profile} className="aspect-[4/3] w-full rounded-2xl ring-1 ring-white/10" />
            )}
          </div>
        </div>
      </header>

      <div className="py-section-sm mx-auto max-w-7xl space-y-16 px-4 sm:px-6 lg:px-8">
        {pricing}

        <TourSection id="itinerary" title={`Your ${days}-day itinerary`}>
          <ol className="space-y-4">
            {itinerary.map((d) => (
              <li key={d.day} className="rounded-2xl border border-slate-200 p-5 sm:p-6">
                <div className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">{d.day}</span>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold leading-snug text-slate-900">Day {d.day}: {d.title}</h3>
                    {d.points && (
                      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-600">
                        {d.points.map((p) => <li key={p}>{p}</li>)}
                      </ul>
                    )}
                    {d.text && <p className="mt-3 text-sm leading-relaxed text-slate-600">{d.text}</p>}
                    {d.note && (
                      <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold leading-relaxed text-amber-900">Note: {d.note}</p>
                    )}
                    {(d.meals || d.stay) && (
                      <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                        {d.meals && <span>Meals: {d.meals}</span>}
                        {d.stay && <span>Overnight: {d.stay}</span>}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </TourSection>

        <TourSection id="included" title="What's included">
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">Included</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {included.map((x) => <li key={x} className="flex gap-2"><span aria-hidden className="text-emerald-600">✓</span>{x}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Not included</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {excluded.map((x) => <li key={x} className="flex gap-2"><span aria-hidden className="text-slate-400">✕</span>{x}</li>)}
              </ul>
            </div>
          </div>
        </TourSection>

        <TourSection id="good-to-know" title="Good to know">
          <div className="grid gap-8 sm:grid-cols-2">
            {goodToKnow.map((g) => (
              <div key={g.title}>
                <h3 className="font-semibold text-slate-900">{g.title}</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                  {g.items.map((x) => <li key={x}>{x}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </TourSection>

        <section aria-labelledby="book" className="rounded-2xl bg-navy px-6 py-10 text-white sm:px-10">
          <h2 id="book" className="font-heading text-3xl font-medium tracking-[-0.02em] sm:text-4xl">{bookTitle}</h2>
          <p className="mt-3 max-w-xl text-white/75">{bookText}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {whatsappButton()}
            {bookOnline && (
              <Link href={bookOnline} className={buttonVariants({ size: "lg", variant: "outline", className: outlineOnNavy })}>
                Book online
              </Link>
            )}
            {TOUR_CONTACT.phones.map((ph) => (
              <a key={ph} href={`tel:${ph.replace(/\s/g, "")}`} className={buttonVariants({ size: "lg", variant: "outline", className: outlineOnNavy })}>
                Call {ph}
              </a>
            ))}
          </div>
          <p className="mt-5 text-sm text-white/60">
            Email: <a href={`mailto:${TOUR_CONTACT.email}`} className="text-white/90 underline decoration-white/30 underline-offset-4 hover:text-white">{TOUR_CONTACT.email}</a>
          </p>
        </section>
      </div>
    </main>
  );
}

/** Table header cell style for tour price tables. */
export const TOUR_TH = "px-3 py-3 text-left text-xs font-medium text-slate-500";
