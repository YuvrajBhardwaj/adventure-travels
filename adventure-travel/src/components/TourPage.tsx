import Link from "next/link";
import type { ReactNode } from "react";
import { TOUR_CONTACT } from "@/data/tours";
import { REFUND_NOTE, REFUND_TIERS } from "@/data/cancellationPolicy";
import { absoluteUrl, ORGANIZATION_ID, SITE_URL } from "@/lib/seo";
import Price from "@/components/Price";
import NoPhoto from "@/components/NoPhoto";
import TourGallery from "@/components/TourGallery";
import WallpaperCarousel from "@/components/WallpaperCarousel";
import TourAttractions, { type TourAttraction } from "@/components/TourAttractions";
import { TourBookingProvider, TourEnquiry, TourPackages, type TourPackage } from "@/components/TourBooking";
import { BrandIcon } from "@/components/BrandIcon";
import { buttonVariants } from "@/components/ui/button";

export type { TourPackage };

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

/** A page section: heading (and a short intro) above its content. */
export function TourSection({ id, title, intro, first, children }: { id: string; title: string; intro?: ReactNode; first?: boolean; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className={first ? "scroll-mt-24" : "scroll-mt-24 border-t border-slate-200 pt-12"}>
      <h2 id={id} className={H2}>{title}</h2>
      {intro && <p className="mt-3 max-w-2xl text-sm text-slate-500">{intro}</p>}
      <div className="relative mt-6">{children}</div>
    </section>
  );
}

/**
 * The layout every tour page shares (/tours/<slug>), so Auli, Chopta and later tours look
 * the same: header with prices; then package options, the tour's own price table, itinerary,
 * photos, top attractions, inclusions, know before you go, policies and booking, with an
 * enquiry box alongside. Server-rendered, so all of it is in the static HTML.
 */
export function TourPage({
  path,
  name,
  days,
  nights,
  route,
  intro,
  image,
  profile,
  heroPrices,
  packages,
  pricing,
  itinerary,
  photos,
  attractions,
  attractionsTitle = "Top attractions",
  included,
  excluded,
  goodToKnow,
  enquiryOffer,
  bookTitle,
  bookText,
  bookOnline,
  offerDescription,
}: {
  path: string;
  name: string;
  days: number;
  nights?: number;
  route: readonly string[];
  intro: string;
  image?: string;
  /** Alt text for the cover; the hero slideshow now labels its photos as a group, so it's unused there. */
  imageAlt?: string;
  /** Altitudes for the no-photo panel when there's no image. */
  profile?: number[];
  heroPrices: { label: string; inr: number; note?: string; accent?: boolean }[];
  /** Package options shown as selectable cards; the first is picked by default. */
  packages: TourPackage[];
  /** The tour's own extra price table, e.g. group offers. */
  pricing?: ReactNode;
  itinerary: readonly TourDay[];
  /** Our own photos for the gallery section; empty shows a "coming soon" note. */
  photos: readonly string[];
  attractions: TourAttraction[];
  /** Heading of the attractions list, e.g. "Auli top attractions". */
  attractionsTitle?: string;
  included: readonly string[];
  excluded: readonly string[];
  goodToKnow: { title: string; items: readonly string[] }[];
  /** A real offer line for the enquiry box, e.g. a group discount. */
  enquiryOffer?: string;
  bookTitle: string;
  bookText: string;
  /** Optional link to book and pay online (e.g. the matching trek page). */
  bookOnline?: string;
  offerDescription: string;
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
        offers: packages
          .filter((p) => p.price !== null)
          .map((p) => ({
            "@type": "Offer",
            url: absoluteUrl(path),
            name: p.name,
            price: p.price,
            priceCurrency: "INR",
            description: offerDescription,
            availability: "https://schema.org/InStock",
          })),
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

  const heroSlides = [...new Set([image, ...photos].filter((src): src is string => Boolean(src)))].map((src) => ({ src }));

  return (
    <main id="main" className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* Full-bleed slideshow of the tour's photos under the fixed navbar. A dark scrim (heavier on the
          left, where the copy sits) keeps the white text readable on bright snow and dark forest alike. */}
      <header className="bg-navy text-white">
        <WallpaperCarousel
          slides={heroSlides}
          label={`Photos from the ${name} tour`}
          className="min-h-[88vh]"
          scrimClassName="bg-[linear-gradient(to_right,rgba(2,6,23,0.85)_0%,rgba(2,6,23,0.6)_45%,rgba(2,6,23,0.25)_100%),linear-gradient(to_top,rgba(2,6,23,0.7),transparent_45%)]"
          fallback={<NoPhoto profile={profile} className="absolute inset-0 h-full w-full opacity-40" />}
        >
          <div className="mx-auto flex min-h-[88vh] max-w-7xl items-end px-4 pb-24 pt-28 sm:px-6 lg:px-8 lg:pb-28 lg:pt-36">
          <div className="max-w-3xl">
            <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-sm text-white/75">
              <Link href="/" className="inline-flex min-h-11 items-center transition-colors duration-150 ease-out hover:text-white">Home</Link>
              <span aria-hidden>/</span>
              <Link href="/tours" className="inline-flex min-h-11 items-center transition-colors duration-150 ease-out hover:text-white">Tours</Link>
              <span aria-hidden>/</span>
              <span className="text-white/90">{name}</span>
            </nav>
            <p className="font-nav text-sm uppercase tracking-[0.14em] text-white/75">
              {length} · {route.join(" – ")}
            </p>
            <h1 className="mt-3 font-heading text-5xl [text-shadow:0_2px_30px_rgba(2,6,23,0.6)] font-medium leading-[0.98] tracking-[-0.02em] sm:text-6xl xl:text-7xl">{name}</h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg [text-shadow:0_1px_12px_rgba(2,6,23,0.7)]">{intro}</p>
            <div className="mt-8 flex flex-wrap items-end gap-x-8 gap-y-4">
              {heroPrices.map((p) => (
                <p key={p.label}>
                  <span className="block text-sm text-white/75">{p.label}</span>
                  <span className={`font-heading text-4xl font-medium tabular-nums ${p.accent ? "text-emerald-300 [text-shadow:0_1px_12px_rgba(2,6,23,0.7)]" : ""}`}><Price inr={p.inr} /></span>
                  {p.note && <span className="ml-2 text-sm text-white/75">{p.note}</span>}
                </p>
              ))}
            </div>
            {whatsappButton("mt-8")}
          </div>
          </div>
        </WallpaperCarousel>
      </header>

      <TourBookingProvider initial={packages[0]?.id ?? ""}>
        <div className="py-section-sm mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8">
          <div className="min-w-0 space-y-16 lg:col-span-8">
            <TourSection first id="packages" title="Package options" intro="Prices are per person. Pick a package to see what it covers; your choice carries into the enquiry box.">
              <TourPackages packages={packages} />
            </TourSection>

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

            <TourSection id="photos" title="Photo gallery">
              <TourGallery name={name} photos={photos} />
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

            <TourSection id="know-before" title="Know before you go">
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

            <TourSection id="policies" title="Policies">
              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <h3 className="font-semibold text-slate-900">Cancellation and refunds</h3>
                  <ul className="mt-3 divide-y divide-slate-200 border-y border-slate-200 text-sm">
                    {REFUND_TIERS.map((t) => (
                      <li key={t.window} className="flex items-baseline justify-between gap-3 py-2.5">
                        <span className="text-slate-600">Cancel {t.window}</span>
                        <span className="text-right font-medium text-slate-900">{t.cash}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Payment and confirmation</h3>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                    {REFUND_NOTE.slice(0, 2).map((n) => <li key={n.text}>{n.text}</li>)}
                    {REFUND_NOTE.filter((n) => /processed|GST/.test(n.text)).map((n) => <li key={n.text}>{n.text}</li>)}
                  </ul>
                </div>
              </div>
              <p className="mt-5 text-sm">
                <Link href="/cancellation-policy" className="font-semibold text-emerald-700 underline decoration-emerald-700/30 underline-offset-4 hover:text-emerald-800">
                  Read the full cancellation and refund policy
                </Link>
              </p>
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

            {/* Last on the page, as the owner asked (18 Nov): what's around, in the "Choose Your Mountain" row style. */}
            <TourSection id="attractions" title={attractionsTitle}>
              <TourAttractions attractions={attractions} />
            </TourSection>
          </div>

          {/* Beside the page on desktop (stays in view while scrolling), after it on phones. */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <TourEnquiry tourName={name} packages={packages} offer={enquiryOffer} />
            </div>
          </aside>
        </div>
      </TourBookingProvider>
    </main>
  );
}

/** Table header cell style for tour price tables. */
export const TOUR_TH = "px-3 py-3 text-left text-xs font-medium text-slate-500";
