import { AULI_ESCAPE } from "./auliEscape";

/**
 * Tours: short road-and-stay trips (not treks), listed on /tours, in the Tours menu and the
 * sitemap. Each has its own page at /tours/<slug>. Chopta joins once the owner sends its brief.
 */
export interface TourSummary {
  slug: string;
  name: string;
  days: number;
  nights: number;
  route: readonly string[];
  /** Per person, INR. */
  price: number;
  /** One line under the price, e.g. a group offer. */
  priceNote?: string;
  blurb: string;
  image: string;
}

export const TOURS: TourSummary[] = [
  {
    slug: AULI_ESCAPE.slug,
    name: AULI_ESCAPE.name,
    days: AULI_ESCAPE.days,
    nights: AULI_ESCAPE.nights,
    route: AULI_ESCAPE.route,
    price: AULI_ESCAPE.price,
    priceNote: `Rs.${AULI_ESCAPE.groupPrice.toLocaleString("en-IN")} each for groups of ${AULI_ESCAPE.groupFrom}+`,
    blurb: AULI_ESCAPE.intro,
    image: AULI_ESCAPE.image,
  },
];
