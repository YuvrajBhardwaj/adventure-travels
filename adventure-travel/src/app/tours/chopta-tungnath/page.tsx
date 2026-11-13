import { CHOPTA_INTRO, CHOPTA_SLUG, CHOPTA_TREK as T, TOURS } from "@/data/tours";
import { getTrekPackage } from "@/data/trekPackage";
import { trekPhotos } from "@/data/trekGalleries";
import { fitDescription, fitTitle, pageMetadata } from "@/lib/seo";
import { TourPage, type TourPackage } from "@/components/TourPage";
import { tourPhotos } from "@/lib/tourPhotos";
import { shareImage } from "@/lib/shareImage";

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
    `From ${inr(T.price)} per person, ${from} to ${from}, with stay and transfers.`,
    `From ${inr(T.price)} per person.`,
  ]),
  socialTitle: `${tour.name} Tour | Himalayan Arc Adventure`,
  path: tour.href,
  // The Tungnath trek's share image, once it has a photo of our own; until then the site image.
  ...shareImage(T.slug),
  imageAlt: `${tour.name}, Uttarakhand`,
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

/**
 * The tour's own day-by-day wording (the trek page has the long version). Same facts as the
 * trek itinerary: keep the times and distances in step when that changes.
 */
const DAYS: Record<number, { title: string; points: string[]; note?: string }> = {
  0: {
    title: "Leave Delhi at night",
    // The trek's note points at its Dates tab, which this page doesn't have.
    note: "You leave Delhi the night before Day 1 and are back early on the morning after Day 3, so keep four calendar days free.",
    points: [
      "Meet the group and your trek leader at Akshardham Metro Station, 10–11 PM",
      "A short briefing, then the tempo traveller drives through the night",
    ],
  },
  1: {
    title: "Devprayag, Dhari Devi and on to Chopta",
    points: [
      "Dawn at the Devprayag sangam, where the Bhagirathi and the Alaknanda become the Ganga",
      "A stop at the Dhari Devi temple on the Alaknanda",
      "On through Rudraprayag and Ukhimath to Chopta (about 150 km, 5–6 hrs)",
      "An easy evening at the camp or cottage",
    ],
  },
  2: {
    title: "Tungnath temple and Chandrashila summit",
    points: [
      "Early breakfast, then a paved trail through the meadows to Tungnath, the highest Panch Kedar temple",
      `A steeper last stretch to Chandrashila (${T.maxAltitude.toLocaleString("en-IN")} m) for Nanda Devi, Trishul and Chaukhamba`,
      "About 10 km there and back, 6–7 hrs; down at Chopta before sunset",
    ],
  },
  3: {
    title: "Deoria Tal and the drive home",
    points: [
      "Breakfast, check out and drive to Sari village",
      "Forest walk to Deoria Tal, about 3 km each way",
      "The Omkareshwar temple in Ukhimath, winter seat of Kedarnath",
      "Overnight drive; back in Delhi early the next morning",
    ],
  },
};

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
      intro={CHOPTA_INTRO}
      image={T.image ?? photos[0]}
      imageAlt={`${tour.name}, Uttarakhand`}
      profile={T.elevationProfile}
      heroPrices={[
        { label: `Per person, ${cheapest.label.toLowerCase()}`, inr: cheapest.price },
        ...(dearest ? [{ label: dearest.label, inr: dearest.price }] : []),
      ]}
      packages={packages}
      itinerary={T.itinerary.map((d) => ({
        day: d.day,
        meals: d.meals,
        note: d.note,
        ...(DAYS[d.day] ?? { title: d.title, text: d.description }),
      }))}
      photos={photos}
      attractions={[
        { name: "Tungnath Temple", text: "The highest of the five Panch Kedar temples of Shiva: an old stone shrine on the ridge above Chopta, reached by a paved trail through the meadows." },
        { name: "Chandrashila summit", text: `A short, steep climb above Tungnath to ${T.maxAltitude.toLocaleString("en-IN")} m, with a wide view of Chaukhamba, Nanda Devi and Trishul.` },
        { name: "Deoria Tal", text: "A forest lake near Sari village that mirrors the Chaukhamba massif on a still morning, on the last day's walk." },
        { name: "Devprayag sangam", text: "Where the Bhagirathi and the Alaknanda meet and become the Ganga, visited at dawn on the drive up." },
      ]}
      included={pkg.included}
      // The trek page's wording points at its Packing List tab; here the list is "What to carry".
      excluded={pkg.excluded.map((x) => x.replace("see the Packing List tab", "see What to carry below"))}
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
