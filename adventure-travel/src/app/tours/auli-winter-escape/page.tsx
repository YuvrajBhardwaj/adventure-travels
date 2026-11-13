import Link from "next/link";
import { AULI_ESCAPE as P, AULI_GROUP_OFFERS, groupOffer } from "@/data/auliEscape";
import { absoluteUrl, fitDescription, fitTitle, ORGANIZATION_ID, pageMetadata, SITE_URL } from "@/lib/seo";
import Price from "@/components/Price";
import { BrandIcon } from "@/components/BrandIcon";
import { buttonVariants } from "@/components/ui/button";

const PATH = `/tours/${P.slug}`;
const ROUTE = P.route.join(" – ");
const WHATSAPP = `https://wa.me/917817912062?text=${encodeURIComponent(
  `Hi! I'd like to book the ${P.name} (${P.days} days / ${P.nights} nights).\nDate: \nGroup size: `
)}`;

export const metadata = pageMetadata({
  title: fitTitle(P.name, [`${P.days} Days from Rishikesh`]),
  description: fitDescription([
    `${P.days}-day Auli trip from Rishikesh: ${P.nights} nights in Auli, guided sightseeing, Gorson Bugyal views.`,
    `Rs.${P.price.toLocaleString("en-IN")} per person; Rs.${P.groupPrice.toLocaleString("en-IN")} each for groups of ${P.groupFrom}+.`,
  ]),
  socialTitle: `${P.name} | Himalayan Arc Adventure`,
  path: PATH,
  image: P.shareImage,
  imageAlt: "Skiing on the slopes of Auli",
});

const H2 = "font-heading text-3xl font-medium tracking-[-0.02em] text-slate-900 sm:text-4xl";
const inr = (n: number) => `Rs.${n.toLocaleString("en-IN")}`;

export default function AuliWinterEscapePage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TouristTrip",
        name: P.name,
        description: P.intro,
        url: absoluteUrl(PATH),
        image: absoluteUrl(P.image),
        touristType: ["Families", "Groups of friends"],
        itinerary: {
          "@type": "ItemList",
          itemListElement: P.itinerary.map((d, i) => ({ "@type": "ListItem", position: i + 1, name: `Day ${d.day}: ${d.title}` })),
        },
        offers: {
          "@type": "Offer",
          url: absoluteUrl(PATH),
          price: P.price,
          priceCurrency: "INR",
          description: `Per person. ${inr(P.groupPrice)} per person for groups of ${P.groupFrom} or more.`,
          availability: "https://schema.org/InStock",
        },
        provider: { "@id": ORGANIZATION_ID },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Tours", item: absoluteUrl("/tours") },
          { "@type": "ListItem", position: 3, name: P.name, item: absoluteUrl(PATH) },
        ],
      },
    ],
  };
  const th = "px-3 py-3 text-left text-xs font-medium text-slate-500";

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
              <span className="text-white/90">{P.name}</span>
            </nav>
            <p className="font-nav text-sm uppercase tracking-[0.14em] text-white/60">
              {P.days} days / {P.nights} nights · {ROUTE}
            </p>
            <h1 className="mt-3 font-heading text-5xl font-medium leading-[0.98] tracking-[-0.02em] sm:text-6xl xl:text-7xl">{P.name}</h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">{P.intro}</p>
            <div className="mt-8 flex flex-wrap items-end gap-x-8 gap-y-4">
              <p>
                <span className="block text-sm text-white/60">Per person</span>
                <span className="font-heading text-4xl font-medium tabular-nums"><Price inr={P.price} /></span>
              </p>
              <p>
                <span className="block text-sm text-white/60">Groups of {P.groupFrom}+</span>
                <span className="font-heading text-4xl font-medium tabular-nums text-emerald-300"><Price inr={P.groupPrice} /></span>
                <span className="ml-2 text-sm text-white/60">each, save 20%</span>
              </p>
            </div>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className={buttonVariants({ size: "lg", className: "mt-8" })}>
              <BrandIcon brand="whatsapp" className="h-5 w-5" />
              Book on WhatsApp
            </a>
          </div>
          <div className="lg:col-span-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={P.image} alt="Skiing on the slopes of Auli" className="aspect-[4/3] w-full rounded-2xl object-cover" />
          </div>
        </div>
      </header>

      <div className="py-section-sm mx-auto max-w-7xl space-y-16 px-4 sm:px-6 lg:px-8">
        <section aria-labelledby="group-offers" className="lg:grid lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-3">
            <h2 id="group-offers" className={H2}>Group offers</h2>
            <p className="mt-3 max-w-xs text-sm text-slate-500">
              Travel with friends and save more. Savings are worked out against the regular {inr(P.price)} per person for the whole group.
            </p>
          </div>
          <div className="relative mt-6 lg:col-span-9 lg:mt-0">
            {/* Phones: one card per group size, so the totals don't sit off-screen in a scrolling table. */}
            <ul className="divide-y divide-slate-200 border-y border-slate-200 sm:hidden">
              <li className="py-4">
                <p className="font-heading text-lg font-medium text-slate-900">1–3 people</p>
                <p className="mt-1 text-sm text-slate-600">Regular price: {inr(P.price)} per person</p>
              </li>
              {AULI_GROUP_OFFERS.map((o) => {
                const g = groupOffer(o);
                return (
                  <li key={o.people} className="py-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="font-heading text-lg font-medium text-slate-900">{o.people} people</p>
                      <p className="font-heading text-lg font-medium tabular-nums text-slate-900"><Price inr={g.total} /></p>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{o.offer}</p>
                    <p className="mt-1 text-sm tabular-nums text-emerald-700">You save <Price inr={g.savings} /> ({g.percent}%)</p>
                  </li>
                );
              })}
            </ul>
            <table className="hidden w-full border-y border-slate-200 text-sm sm:table">
              <thead className="border-b border-slate-300">
                <tr>
                  <th scope="col" className={th}>Group size</th>
                  <th scope="col" className={th}>Special offer</th>
                  <th scope="col" className={`${th} text-right`}>Total group price</th>
                  <th scope="col" className={`${th} text-right`}>You save</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="align-top">
                  <th scope="row" className="px-3 py-4 text-left font-heading text-lg font-medium text-slate-900">1–3 people</th>
                  <td className="px-3 py-4 text-slate-600">Regular price: {inr(P.price)} per person</td>
                  <td className="px-3 py-4 text-right text-slate-400">—</td>
                  <td className="px-3 py-4 text-right text-slate-400">—</td>
                </tr>
                {AULI_GROUP_OFFERS.map((o) => {
                  const g = groupOffer(o);
                  return (
                    <tr key={o.people} className="align-top">
                      <th scope="row" className="px-3 py-4 text-left font-heading text-lg font-medium text-slate-900">{o.people} people</th>
                      <td className="px-3 py-4 text-slate-600">{o.offer}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-right font-heading text-lg font-medium tabular-nums text-slate-900"><Price inr={g.total} /></td>
                      <td className="whitespace-nowrap px-3 py-4 text-right tabular-nums text-emerald-700">
                        <Price inr={g.savings} /> ({g.percent}%)
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-slate-500">
              Special offers apply to the package price and are confirmed when you book. Other group sizes: message us for the price.
            </p>
          </div>
        </section>

        <section aria-labelledby="itinerary" className="border-t border-slate-200 pt-12 lg:grid lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-3">
            <h2 id="itinerary" className={H2}>Your 3-day itinerary</h2>
          </div>
          <ol className="mt-6 space-y-4 lg:col-span-9 lg:mt-0">
            {P.itinerary.map((d) => (
              <li key={d.day} className="rounded-2xl border border-slate-200 p-5 sm:p-6">
                <div className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">{d.day}</span>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold leading-snug text-slate-900">Day {d.day}: {d.title}</h3>
                    <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-600">
                      {d.points.map((p) => <li key={p}>{p}</li>)}
                    </ul>
                    <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                      <span>Meals: {d.meals}</span>
                      {d.stay && <span>Overnight: {d.stay}</span>}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="included" className="border-t border-slate-200 pt-12 lg:grid lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-3">
            <h2 id="included" className={H2}>What&apos;s included</h2>
          </div>
          <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:col-span-9 lg:mt-0">
            <div>
              <h3 className="font-semibold text-slate-900">Included</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {P.included.map((x) => <li key={x} className="flex gap-2"><span aria-hidden className="text-emerald-600">✓</span>{x}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Not included</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {P.excluded.map((x) => <li key={x} className="flex gap-2"><span aria-hidden className="text-slate-400">✕</span>{x}</li>)}
              </ul>
            </div>
          </div>
        </section>

        <section aria-labelledby="good-to-know" className="border-t border-slate-200 pt-12 lg:grid lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-3">
            <h2 id="good-to-know" className={H2}>Good to know</h2>
          </div>
          <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:col-span-9 lg:mt-0">
            <div>
              <h3 className="font-semibold text-slate-900">Transport</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                {P.transport.map((x) => <li key={x}>{x}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Important information</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                {P.notes.map((x) => <li key={x}>{x}</li>)}
              </ul>
            </div>
          </div>
        </section>

        <section aria-labelledby="book" className="rounded-2xl bg-navy px-6 py-10 text-white sm:px-10">
          <h2 id="book" className="font-heading text-3xl font-medium tracking-[-0.02em] sm:text-4xl">Book your Auli getaway</h2>
          <p className="mt-3 max-w-xl text-white/75">Bring your friends, save more as a group, and make memories in the Himalayas. Tell us your dates and group size.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className={buttonVariants({ size: "lg" })}>
              <BrandIcon brand="whatsapp" className="h-5 w-5" />
              Book on WhatsApp
            </a>
            {P.contact.phones.map((ph) => (
              <a key={ph} href={`tel:${ph.replace(/\s/g, "")}`} className={buttonVariants({ size: "lg", variant: "outline", className: "border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white" })}>
                Call {ph}
              </a>
            ))}
          </div>
          <p className="mt-5 text-sm text-white/60">
            Email: <a href={`mailto:${P.contact.email}`} className="text-white/90 underline decoration-white/30 underline-offset-4 hover:text-white">{P.contact.email}</a>
          </p>
        </section>
      </div>
    </main>
  );
}
