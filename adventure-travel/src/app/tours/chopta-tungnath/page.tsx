import { CHOPTA_SLUG, CHOPTA_TREK as T, TOURS } from "@/data/tours";
import { getTrekPackage } from "@/data/trekPackage";
import { fitDescription, fitTitle, pageMetadata } from "@/lib/seo";
import Price from "@/components/Price";
import { TOUR_TH as th, TourPage, TourSection } from "@/components/TourPage";

const tour = TOURS.find((t) => t.slug === CHOPTA_SLUG)!;
const inr = (n: number) => `Rs.${n.toLocaleString("en-IN")}`;
const rooms = T.roomSharing ?? [{ label: "Per person", perRoom: 0, price: T.price }];
const pkg = getTrekPackage(T);

export const metadata = pageMetadata({
  title: fitTitle(`${tour.name} Tour`, [`${T.days} Days from ${T.startsFrom ?? "Delhi"}`]),
  description: fitDescription([
    `${T.days}-day Chopta trip from ${T.startsFrom ?? "Delhi"}: Tungnath temple, Chandrashila summit and Deoria Tal.`,
    `From ${inr(T.price)} per person.`,
  ]),
  socialTitle: `${tour.name} Tour | Himalayan Arc Adventure`,
  path: tour.href,
});

function RoomSharing() {
  return (
    <TourSection first id="room-sharing" title="Room sharing" intro="Prices are per person and depend on how many share a room or tent at the camp or cottage.">
      {/* Phones: one card per option, like the Auli group offers. */}
      <ul className="divide-y divide-slate-200 border-y border-slate-200 sm:hidden">
        {rooms.map((r) => (
          <li key={r.label} className="flex items-baseline justify-between gap-3 py-4">
            <div>
              <p className="font-heading text-lg font-medium text-slate-900">{r.label}</p>
              {r.perRoom > 0 && <p className="mt-1 text-sm text-slate-600">{r.perRoom} per room</p>}
            </div>
            <p className="font-heading text-lg font-medium tabular-nums text-slate-900"><Price inr={r.price} /></p>
          </li>
        ))}
      </ul>
      <table className="hidden w-full border-y border-slate-200 text-sm sm:table">
        <thead className="border-b border-slate-300">
          <tr>
            <th scope="col" className={th}>Room sharing</th>
            <th scope="col" className={th}>People per room</th>
            <th scope="col" className={`${th} text-right`}>Price per person</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {rooms.map((r) => (
            <tr key={r.label} className="align-top">
              <th scope="row" className="px-3 py-4 text-left font-heading text-lg font-medium text-slate-900">{r.label}</th>
              <td className="px-3 py-4 text-slate-600">{r.perRoom > 0 ? r.perRoom : "—"}</td>
              <td className="whitespace-nowrap px-3 py-4 text-right font-heading text-lg font-medium tabular-nums text-slate-900"><Price inr={r.price} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-xs text-slate-500">
        Pick your room sharing when you book. Prices cover {T.startsFrom ?? "Delhi"} and back, as in the itinerary below.
      </p>
    </TourSection>
  );
}

export default function ChoptaTungnathPage() {
  const [cheapest, ...others] = rooms;
  const dearest = others.at(-1);
  return (
    <TourPage
      path={tour.href}
      name={tour.name}
      days={T.days}
      route={tour.route}
      intro={T.blurb}
      image={T.image}
      imageAlt={`${tour.name}, Uttarakhand`}
      profile={T.elevationProfile}
      heroPrices={[
        { label: `Per person, ${cheapest.label.toLowerCase()}`, inr: cheapest.price },
        ...(dearest ? [{ label: dearest.label, inr: dearest.price }] : []),
      ]}
      pricing={<RoomSharing />}
      itinerary={T.itinerary.map((d) => ({ day: d.day, title: d.title, text: d.description, meals: d.meals, note: d.note }))}
      included={pkg.included}
      excluded={pkg.excluded}
      goodToKnow={[
        { title: "Stay", items: [T.stay?.detail ?? "Accommodation as listed in the itinerary"] },
        {
          title: "Season and altitude",
          items: [
            `Best season: ${T.bestSeason}`,
            `Highest point: ${T.maxAltitude.toLocaleString("en-IN")} m (Chandrashila)`,
            `Group size: up to ${T.groupSize ?? 15} people`,
          ],
        },
      ]}
      bookTitle="Book your Chopta trip"
      bookText="Tell us your dates, group size and room sharing on WhatsApp, or book and pay online."
      bookOnline={`/treks/${T.slug}`}
      offerDescription={`Per person, ${cheapest.label.toLowerCase()}.`}
      price={T.price}
    />
  );
}
