import { AULI_ESCAPE } from "./auliEscape";
import { treks } from "./treks";

/**
 * Tours: short road-and-stay trips, listed on /tours, in the Tours menu and the sitemap.
 * Every tour has its own page at /tours/<slug>, laid out by components/TourPage.tsx.
 */
export interface TourSummary {
  slug: string;
  name: string;
  /** Always /tours/<slug>. */
  href: string;
  days: number;
  nights?: number;
  route: readonly string[];
  /** Per person, INR; the cheapest option when there are several. */
  price: number;
  priceFrom?: boolean;
  /** One line under the price, e.g. a group offer or the other room prices. */
  priceNote?: string;
  blurb: string;
  image?: string;
  /** Altitudes for the no-photo panel when there's no image. */
  profile?: number[];
}

/** Booking contacts shown on every tour page (from the owner's Auli brief, 13 Nov 2026). */
export const TOUR_CONTACT = AULI_ESCAPE.contact;

/**
 * Chopta–Tungnath is our Tungnath trek, presented as a tour. Prices, meals and stays come from the
 * trek's data, so the two pages can't disagree; online booking and payment stay on the trek page.
 * The intro and day-by-day text are the tour's own, so the two pages don't repeat each other in search.
 */
const tungnath = treks.find((t) => t.slug === "tungnath");
if (!tungnath) throw new Error('tours.ts: trek "tungnath" not found');
export const CHOPTA_TREK = tungnath;
export const CHOPTA_SLUG = "chopta-tungnath";
export const CHOPTA_INTRO =
  "A long weekend in the Garhwal Himalayas from Delhi. We drive you up overnight by tempo traveller, you stay two nights near Chopta, walk up to the Tungnath temple and the Chandrashila summit, and see Deoria Tal on the way home.";

const rs = (n: number) => `Rs.${n.toLocaleString("en-IN")}`;

export const TOURS: TourSummary[] = [
  {
    slug: AULI_ESCAPE.slug,
    name: AULI_ESCAPE.name,
    href: `/tours/${AULI_ESCAPE.slug}`,
    days: AULI_ESCAPE.days,
    nights: AULI_ESCAPE.nights,
    route: AULI_ESCAPE.route,
    price: AULI_ESCAPE.price,
    priceNote: `${rs(AULI_ESCAPE.groupPrice)} each for groups of ${AULI_ESCAPE.groupFrom}+`,
    blurb: AULI_ESCAPE.intro,
    image: AULI_ESCAPE.image,
  },
  {
    slug: CHOPTA_SLUG,
    name: "Chopta & Tungnath",
    href: `/tours/${CHOPTA_SLUG}`,
    days: tungnath.days,
    route: ["Delhi", "Chopta", "Tungnath", "Delhi"],
    price: tungnath.price,
    priceFrom: Boolean(tungnath.roomSharing),
    priceNote: tungnath.roomSharing
      ?.slice(1)
      .map((r) => `${r.label.replace(/ sharing$/i, "")} ${rs(r.price)}`)
      .join(" · "),
    blurb: CHOPTA_INTRO,
    image: tungnath.image,
    profile: tungnath.elevationProfile,
  },
];
