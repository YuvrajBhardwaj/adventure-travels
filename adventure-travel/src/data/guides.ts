import { treks, type Trek } from "./treks";
import { DEPARTURE_CALENDAR, MONTH_HIGHLIGHTS } from "./trekSeasons";

/**
 * Long-form guides (/guides/<slug>), written for searches like "kuari pass" and "how to reach
 * Joshimath". Every fact comes from the site's own data (treks.ts, trekSeasons.ts, the FAQ and
 * the contact page) or is computed from it, so prices, altitudes and days stay in step with the
 * trek pages. Don't add facts here that the rest of the site doesn't state.
 *
 * Text may contain [label](/path) links; the guide page turns them into <Link>s.
 */

export type GuideBlock =
  | { p: string }
  | { list: string[] }
  | { steps: { title: string; text: string }[] }
  | { table: { head: string[]; rows: string[][] } };

export interface GuideSection {
  id: string;
  heading: string;
  blocks: GuideBlock[];
}

export interface Guide {
  slug: string;
  /** The h1, and the start of the Google title. */
  title: string;
  /** Extra words for the Google title, used while it fits in 60 characters. */
  titleDetails: string[];
  description: string;
  /** One-paragraph answer at the top: what someone searching wants to know first. */
  summary: string;
  image?: string;
  imageAlt?: string;
  /** Trek the guide is about; its page links back here. */
  trekSlug?: string;
  updated: string;
  sections: GuideSection[];
}

const inr = (n: number) => `Rs.${n.toLocaleString("en-IN")}`;
const ft = (m: number) => Math.round(m * 3.28084).toLocaleString("en-IN");
const m = (n: number) => n.toLocaleString("en-IN");

const MONTH_ORDER = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
const MONTH_LONG: Record<string, string> = {
  Jan: "January", Feb: "February", Mar: "March", Apr: "April", May: "May", Jun: "June",
  Jul: "July", Aug: "August", Sep: "September", Oct: "October", Nov: "November", Dec: "December",
};
/** "09-15" → "15 September" */
const dayMonth = (mmdd: string) => `${Number(mmdd.slice(3))} ${MONTH_LONG[MONTH_ORDER[Number(mmdd.slice(0, 2)) - 1]]}`;

function trek(slug: string): Trek {
  const t = treks.find((x) => x.slug === slug);
  if (!t) throw new Error(`guides.ts: no trek "${slug}"`);
  return t;
}

// ---------------------------------------------------------------- Kuari Pass

const kuari = trek("kuari-pass");
const kuariCal = DEPARTURE_CALENDAR["kuari-pass"];
const kuariMonths = MONTH_HIGHLIGHTS["kuari-pass"] ?? {};
const kuariFrom = Math.min(...(kuari.packages ?? []).map((p) => p.price), kuari.price);
const longestDay = [...kuari.itinerary].sort((a, b) => (b.hours ?? 0) - (a.hours ?? 0))[0];
const kuariNotes = kuari.itinerary.filter((d) => d.note);

const KUARI: Guide = {
  slug: "kuari-pass-trek-guide",
  title: "Kuari Pass Trek Guide",
  titleDetails: ["Season, Cost"],
  description: `Kuari Pass (${m(kuari.maxAltitude)} m) in Uttarakhand: best time to go, the ${kuari.days}-day itinerary from Joshimath, cost from ${inr(kuariFrom)}, difficulty, snow months and what to pack.`,
  summary:
    `Kuari Pass is a ${m(kuari.maxAltitude)} m (${ft(kuari.maxAltitude)} ft) pass in the Garhwal Himalaya of Uttarakhand, on Lord Curzon's old trail above Joshimath in Chamoli district. ` +
    `Our trek takes ${kuari.days} days, is graded ${kuari.difficulty.toLowerCase()}, and runs ${kuari.bestSeason.replace("–", " to ")}. ` +
    `From the top you see Nanda Devi, Dronagiri, Changabang, Trishul, Kamet and Neelkanth. It costs from ${inr(kuariFrom)} per person, Joshimath to Joshimath.`,
  image: kuari.image,
  imageAlt: "Trekkers on the Kuari Pass trail above Joshimath",
  trekSlug: kuari.slug,
  updated: "2026-11-25",
  sections: [
    {
      id: "at-a-glance",
      heading: "Kuari Pass at a glance",
      blocks: [
        {
          table: {
            head: ["", ""],
            rows: [
              ["Highest point", `${m(kuari.maxAltitude)} m (${ft(kuari.maxAltitude)} ft), the pass`],
              ["Duration", `${kuari.days} days, Rishikesh to Rishikesh (Joshimath to Joshimath is shorter)`],
              ["Difficulty", kuari.difficulty],
              ["Starts from", `${kuari.startsFrom}, Chamoli district, Uttarakhand (${m(kuari.itinerary[0].altitude)} m)`],
              ["Best season", kuari.bestSeason],
              ["Group size", `Up to ${kuari.groupSize} trekkers`],
              ["Cost", `From ${inr(kuariFrom)} per person`],
            ],
          },
        },
      ],
    },
    {
      id: "best-time",
      heading: "Best time for the Kuari Pass trek",
      blocks: [
        {
          p:
            `Groups leave every day from ${dayMonth(kuariCal.windows[0][0])} to ${dayMonth(kuariCal.windows[0][1])}. ` +
            "We don't run it in July and August, the monsoon months. " +
            "What each month is like:",
        },
        {
          table: {
            head: ["Month", "What to expect"],
            rows: MONTH_ORDER.filter((mo) => kuariMonths[mo]).map((mo) => [MONTH_LONG[mo], kuariMonths[mo] as string]),
          },
        },
        {
          p:
            "For snow, go from December to March. For the clearest mountain views, go in October and November. " +
            "In April and May the rhododendron forest below Khulara is in flower. See all our [winter treks in Uttarakhand](/winter-treks-uttarakhand).",
        },
      ],
    },
    {
      id: "itinerary",
      heading: `Kuari Pass itinerary (${kuari.days} days)`,
      blocks: [
        { steps: kuari.itinerary.map((d) => ({ title: `Day ${d.day}: ${d.title}`, text: `${d.description} Altitude: ${m(d.altitude)} m.` })) },
        {
          p:
            `The Rishikesh drive on day 1 and day ${kuari.days} is part of the Rishikesh, Haridwar or Dehradun package. ` +
            "If you choose the Joshimath package, you meet the group in Joshimath and the trek ends there.",
        },
      ],
    },
    {
      id: "cost",
      heading: "Kuari Pass trek cost",
      blocks: [
        { p: "Prices are per person, and depend on where you join and how many share a room:" },
        {
          table: {
            head: ["Join at", "Room", "Price per person"],
            // `from` and `sharing` are optional on a package: fall back to the start town and the label.
            rows: (kuari.packages ?? []).map((p) => [p.from ?? kuari.startsFrom ?? "", p.sharing ?? p.label, inr(p.price)]),
          },
        },
        {
          p:
            "You can pay 30% now to hold your place and the rest before the trek, or pay in full. " +
            `What's included and what isn't is listed on the [Kuari Pass trek page](/treks/${kuari.slug}), together with live dates. ` +
            "Our [cancellation policy](/cancellation-policy) explains refunds.",
        },
      ],
    },
    {
      id: "difficulty",
      heading: "How hard is the Kuari Pass trek?",
      blocks: [
        {
          p:
            `It's graded ${kuari.difficulty.toLowerCase()}. The longest day is day ${longestDay.day}, about ${longestDay.hours} hours on foot, ` +
            `climbing to the pass and coming down to camp. The first trekking day climbs about ${m(kuari.itinerary[1].altitude - kuari.itinerary[0].altitude)} m from Joshimath to Khulara.`,
        },
        {
          p:
            "You don't need trekking experience, but you should be able to walk 5–6 hours a day with a daypack. Start walking, jogging or climbing stairs a few weeks before. " +
            "Our [FAQ](/faq) covers fitness and beginner treks in more detail.",
        },
        {
          p:
            "Altitude sickness (AMS): our trek leaders check everyone each day, including oxygen level and pulse. If someone shows symptoms (headache, nausea, dizziness), " +
            "they stop going higher, and if they don't improve, they go down with a member of our staff.",
        },
      ],
    },
    ...(kuariNotes.length
      ? [
          {
            id: "weather",
            heading: "When the weather changes the route",
            blocks: [{ list: kuariNotes.map((d) => `Day ${d.day}: ${d.note}`) } as GuideBlock],
          },
        ]
      : []),
    {
      id: "packing",
      heading: "What to pack",
      blocks: [
        {
          list: [
            "Waterproof trekking shoes with ankle support",
            "3 warm layers: thermal inner, fleece jacket, waterproof outer shell",
            "Moisture-wicking trek pants",
            "Woollen gloves",
            "UV sunglasses",
            "Headlamp",
            "A 50–60 litre backpack",
          ],
        },
        {
          p:
            "Trekking poles, waterproof jackets, snow gaiters and microspikes can be rented at the start point. " +
            "Tell us what you need when you book, or on WhatsApp, so we can keep it ready.",
        },
      ],
    },
    {
      id: "reach",
      heading: "How to reach the start",
      blocks: [
        {
          p:
            "The trek starts in Joshimath. Read our guide on [how to reach Joshimath](/guides/how-to-reach-joshimath) by air, train and road, " +
            "or choose the Rishikesh, Haridwar or Dehradun package and we drive you there.",
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------- Reaching Joshimath

const joshimathTreks = treks.filter((t) => t.startsFrom === "Joshimath");
const JOSHIMATH_ALT = kuari.itinerary[0].altitude; // Joshimath, day 1 of every Joshimath trek

const JOSHIMATH: Guide = {
  slug: "how-to-reach-joshimath",
  title: "How to Reach Joshimath",
  titleDetails: ["Air, Train, Road"],
  description:
    `How to reach Joshimath (${m(JOSHIMATH_ALT)} m), the base for Auli and treks like Kuari Pass: nearest airport and railway, the 245–270 km road from Rishikesh, and our pickup packages.`,
  summary:
    `Joshimath is a hill town at ${m(JOSHIMATH_ALT)} m (${ft(JOSHIMATH_ALT)} ft) in Chamoli district, Uttarakhand, and the base for Auli and for treks such as Kuari Pass. ` +
    "There's no airport or railway in Joshimath itself: you come by road from Rishikesh, Haridwar or Dehradun, 245–270 km and about 9–10 hours up the Alaknanda valley. " +
    "The nearest airport is Jolly Grant (Dehradun) and the nearest railhead is Dehradun.",
  image: "/assets/tours/auli/IMG_3961.jpg",
  imageAlt: "Snow slopes and peaks at Auli above Joshimath",
  updated: "2026-11-25",
  sections: [
    {
      id: "summary",
      heading: "Joshimath travel at a glance",
      blocks: [
        {
          table: {
            head: ["", ""],
            rows: [
              ["Altitude", `${m(JOSHIMATH_ALT)} m (${ft(JOSHIMATH_ALT)} ft)`],
              ["District", "Chamoli, Uttarakhand"],
              ["Nearest airport", "Dehradun (Jolly Grant, DED)"],
              ["Nearest railhead", "Dehradun Railway Station"],
              ["By road from Rishikesh", "245–270 km, about 9–10 hours"],
            ],
          },
        },
      ],
    },
    {
      id: "air",
      heading: "By air",
      blocks: [
        {
          p:
            "Fly to Dehradun's Jolly Grant airport (DED). From there, continue by road towards Rishikesh and up the valley to Joshimath. " +
            "Arrive the day before your trek starts: the drive takes most of a day, and mountain roads can be slow.",
        },
      ],
    },
    {
      id: "train",
      heading: "By train",
      blocks: [
        {
          p:
            "Take a train to Dehradun, Haridwar or Rishikesh, then go on by road. Our Rishikesh, Haridwar or Dehradun packages pick you up in these towns " +
            "and include the drive to Joshimath and back.",
        },
      ],
    },
    {
      id: "road",
      heading: "By road from Rishikesh",
      blocks: [
        {
          p:
            "The road climbs up the Alaknanda valley past the sacred river confluences: Devprayag, Rudraprayag and Karnaprayag, then Chamoli and Helang, to Joshimath. " +
            "It's 245–270 km and takes about 9–10 hours. Our group drives leave Rishikesh early (around 5:30 AM) to reach Joshimath by evening.",
        },
        {
          list: [
            "Overnight buses and shared taxis run to Joshimath from Rishikesh, Haridwar and Dehradun.",
            "A private taxi is the most flexible: you can stop at the confluences on the way.",
            "Landslides can close the road for a few hours, especially in the July–August monsoon. Keep a spare day before your trek if you can.",
          ],
        },
      ],
    },
    {
      id: "auli",
      heading: "Joshimath to Auli",
      blocks: [
        {
          p:
            "Auli, the ski slopes above Joshimath, is a short drive up by local taxi. Our [ski and snowboard courses](/courses) and the " +
            "[Auli Winter Escape](/tours/auli-winter-escape) tour include this transfer.",
        },
      ],
    },
    {
      id: "treks",
      heading: "Treks that start in Joshimath",
      blocks: [
        { p: `${joshimathTreks.length} of our treks start and end in Joshimath, priced Joshimath to Joshimath:` },
        {
          list: joshimathTreks.map(
            (t) => `[${t.name}](/treks/${t.slug}): ${t.days} days, up to ${m(t.maxAltitude)} m, ${t.difficulty.toLowerCase()}, from ${inr(t.price)}`
          ),
        },
        { p: "Compare them side by side on [treks from Joshimath](/treks-from-joshimath), or read our [Kuari Pass trek guide](/guides/kuari-pass-trek-guide)." },
      ],
    },
    {
      id: "office",
      heading: "Our office in Joshimath",
      blocks: [
        {
          p:
            "Our team is based in Joshimath, near the Military Hospital. Message us on WhatsApp before you travel and we'll help with the route, " +
            "pickups and where to stay. All our details are on the [contact page](/contact).",
        },
      ],
    },
  ],
};

export const guides: Guide[] = [KUARI, JOSHIMATH];

export function guideBySlug(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}

/** The guide about a trek, for a link on the trek's page. */
export function guideForTrek(trekSlug: string): Guide | undefined {
  return guides.find((g) => g.trekSlug === trekSlug);
}
