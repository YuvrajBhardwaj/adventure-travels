import { CHOPTA_SLUG, CHOPTA_TREK as T, TOURS } from "@/data/tours";
import { getTrekPackage } from "@/data/trekPackage";
import { trekPhotos } from "@/data/trekGalleries";
import { fitDescription, fitTitle, pageMetadata } from "@/lib/seo";
import { TourPage, type TourPackage } from "@/components/TourPage";
import { tourPhotos } from "@/lib/tourPhotos";

const tour = TOURS.find((t) => t.slug === CHOPTA_SLUG)!;
const inr = (n: number) => `Rs.${n.toLocaleString("en-IN")}`;
const from = T.startsFrom ?? "Delhi";
const rooms = T.roomSharing ?? [{ label: "Standard", perRoom: 0, price: T.price }];
const pkg = getTrekPackage(T);
const covers = (re: RegExp) => pkg.included.find((x) => re.test(x));

export const metadata = pageMetadata({
  title: fitTitle(`${tour.name} Tour`, [`${T.days} Days from ${from}`]),
  description: fitDescription([
    `${T.days}-day Chopta trip from ${from}: Tungnath temple, Chandrashila summit and Deoria Tal.`,
    `From ${inr(T.price)} per person.`,
  ]),
  socialTitle: `${tour.name} Tour | Himalayan Arc Adventure`,
  path: tour.href,
});

/** One package per room-sharing option; everything but the stay is the same trip. */
const packages: TourPackage[] = rooms.map((r) => ({
  id: r.label.toLowerCase().replace(/\s+/g, "-"),
  name: r.label.replace(/^\w/, (c) => c.toUpperCase()),
  length: `${T.days} days, ${from} to ${from}`,
  price: r.price,
  includes: [
    { label: "Stay", text: `${T.stay?.detail ?? "Accommodation as listed in the itinerary"}${r.perRoom ? ` (${r.perRoom} per room)` : ""}` },
    ...[
      { label: "Meals", text: covers(/meals/i) },
      { label: "Transfers", text: covers(/transfers/i) },
      { label: "Trek leader", text: covers(/trek leader/i) },
      { label: "Permits", text: covers(/permits/i) },
    ].filter((x): x is { label: string; text: string } => Boolean(x.text)),
  ],
}));

export default function ChoptaTungnathPage() {
  // Photos in public/assets/tours/tungnath/, else the Tungnath trek gallery.
  const own = tourPhotos(CHOPTA_SLUG);
  const photos = own.length ? own : trekPhotos(T, 12);
  const [cheapest, ...others] = rooms;
  const dearest = others.at(-1);
  return (
    <TourPage
      path={tour.href}
      name={tour.name}
      days={T.days}
      route={tour.route}
      intro={T.blurb}
      image={T.image ?? photos[0]}
      imageAlt={`${tour.name}, Uttarakhand`}
      profile={T.elevationProfile}
      heroPrices={[
        { label: `Per person, ${cheapest.label.toLowerCase()}`, inr: cheapest.price },
        ...(dearest ? [{ label: dearest.label, inr: dearest.price }] : []),
      ]}
      packages={packages}
      itinerary={T.itinerary.map((d) => ({ day: d.day, title: d.title, text: d.description, meals: d.meals, note: d.note }))}
      photos={photos}
      attractions={[
        { name: "Tungnath Temple", text: "The highest of the five Panch Kedar temples of Shiva: an old stone shrine on the ridge above Chopta, reached by a paved trail through the meadows." },
        { name: "Chandrashila summit", text: `A short, steep climb above Tungnath to ${T.maxAltitude.toLocaleString("en-IN")} m, with a wide view of Chaukhamba, Nanda Devi and Trishul.` },
        { name: "Deoria Tal", text: "A forest lake near Sari village that mirrors the Chaukhamba massif on a still morning, on the last day's walk." },
        { name: "Devprayag sangam", text: "Where the Bhagirathi and the Alaknanda meet and become the Ganga, visited at dawn on the drive up." },
      ]}
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
        {
          title: "What to carry",
          items: [
            "Warm layers, a cap and gloves: the summit is cold, even in summer",
            "Trekking shoes with a good grip",
            "A rain jacket or poncho and a water bottle",
            "A government photo ID for the camp or cottage check-in",
          ],
        },
      ]}
      bookTitle="Book your Chopta trip"
      bookText="Tell us your dates, group size and room sharing on WhatsApp, or book and pay online."
      bookOnline={`/treks/${T.slug}`}
      offerDescription={`Per person, covering ${from} and back.`}
    />
  );
}
