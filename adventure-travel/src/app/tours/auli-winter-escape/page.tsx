import { AULI_ESCAPE as P, AULI_GROUP_OFFERS, groupOffer } from "@/data/auliEscape";
import { fitDescription, fitTitle, pageMetadata } from "@/lib/seo";
import Price from "@/components/Price";
import { TOUR_TH as th, TourPage, TourSection } from "@/components/TourPage";

const inr = (n: number) => `Rs.${n.toLocaleString("en-IN")}`;

export const metadata = pageMetadata({
  title: fitTitle(P.name, [`${P.days} Days from Rishikesh`]),
  description: fitDescription([
    `${P.days}-day Auli trip from Rishikesh: ${P.nights} nights in Auli, guided sightseeing, Gorson Bugyal views.`,
    `${inr(P.price)} per person; ${inr(P.groupPrice)} each for groups of ${P.groupFrom}+.`,
  ]),
  socialTitle: `${P.name} | Himalayan Arc Adventure`,
  path: `/tours/${P.slug}`,
  image: P.shareImage,
  imageAlt: P.imageAlt,
});

function GroupOffers() {
  return (
    <TourSection
      first
      id="group-offers"
      title="Group offers"
      intro={`Travel with friends and save more. Savings are worked out against the regular ${inr(P.price)} per person for the whole group.`}
    >
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
    </TourSection>
  );
}

export default function AuliWinterEscapePage() {
  return (
    <TourPage
      path={`/tours/${P.slug}`}
      name={P.name}
      days={P.days}
      nights={P.nights}
      route={P.route}
      intro={P.intro}
      image={P.image}
      imageAlt={P.imageAlt}
      heroPrices={[
        { label: "Per person", inr: P.price },
        { label: `Groups of ${P.groupFrom}+`, inr: P.groupPrice, note: "each, save 20%", accent: true },
      ]}
      pricing={<GroupOffers />}
      itinerary={P.itinerary}
      included={P.included}
      excluded={P.excluded}
      goodToKnow={[
        { title: "Transport", items: P.transport },
        { title: "Important information", items: P.notes },
      ]}
      bookTitle="Book your Auli getaway"
      bookText="Bring your friends, save more as a group, and make memories in the Himalayas. Tell us your dates and group size."
      offerDescription={`Per person. ${inr(P.groupPrice)} per person for groups of ${P.groupFrom} or more.`}
      price={P.price}
    />
  );
}
