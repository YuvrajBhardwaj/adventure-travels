import type { Trek } from "./treks";

export interface TrekPackage {
  /** Quick facts shown above the lists. */
  facts: { label: string; value: string }[];
  included: string[];
  excluded: string[];
}

/** B/L/D shorthand counts as three; otherwise count named meals (tea & snacks don't count). */
function mealCount(meals?: string) {
  if (!meals) return 0;
  if (/B\s*\/\s*L\s*\/\s*D/i.test(meals)) return 3;
  return (meals.match(/breakfast|lunch|dinner/gi) ?? []).length;
}

/**
 * Builds a trek's inclusions/exclusions from its own data (itinerary meals, permit
 * type, altitude, difficulty) so each trek page differs, and nothing here can drift
 * from the itinerary shown on the same page. Safety claims mirror the FAQ.
 */
export function getTrekPackage(trek: Trek): TrekPackage {
  const mealDays = trek.itinerary.filter((d) => mealCount(d.meals) > 0);
  const totalMeals = trek.itinerary.reduce((n, d) => n + mealCount(d.meals), 0);
  const demanding = trek.difficulty === "Challenging" || trek.difficulty === "Strenuous";

  const facts: TrekPackage["facts"] = [
    { label: "Duration", value: `${trek.days} days` },
    { label: `Day ${trek.itinerary[0]?.day ?? 1}`, value: trek.itinerary[0]?.title ?? "As per itinerary" },
    { label: "Highest point", value: `${trek.maxAltitude.toLocaleString("en-IN")} m` },
    { label: "Group size", value: `Up to ${trek.groupSize ?? 15} trekkers` },
  ];
  if (totalMeals > 0) facts.push({ label: "Meals", value: `${totalMeals} across ${mealDays.length} days` });

  const included = [
    "A licensed local trek leader and support crew",
    trek.permitTour
      ? "Inner Line Permit processing and frontier-zone paperwork"
      : "Forest, park and entry permits for the route",
    trek.stay
      ? trek.stay.detail
      : trek.permitTour
        ? "Accommodation as listed in the day-wise itinerary"
        : "Twin-sharing tent accommodation on the trail",
    totalMeals > 0
      ? `${totalMeals} meals, marked day by day in the itinerary`
      : "Meals as listed in the day-wise itinerary",
    trek.startsFrom
      ? `Road transfers from ${trek.startsFrom} and back, as listed in the itinerary`
      : "Road transfers along the route, as listed in the itinerary",
    "Daily medical and safety check-ups on the trail",
    "First-aid kit and group camping equipment",
  ];
  if (trek.maxAltitude > 3000) included.push("Acclimatization time built into the itinerary");
  if (demanding) included.push("Gamow bag and pulse oximeter carried with the team");

  const excluded = [
    trek.startsFrom
      ? `Getting to ${trek.startsFrom} and back home (flights, trains, buses)`
      : "Getting to the starting town (flights, trains, buses)",
    "Personal trekking gear — see the Packing List tab",
    "Travel and medical insurance",
    "Emergency evacuation and hospital costs",
    "Tips for guides, cooks and porters",
    "Personal expenses such as extra snacks and shopping",
    "Backpack offloading and single-occupancy tent or room (optional, on request)",
  ];
  if (totalMeals > 0 && mealDays.length < trek.itinerary.length) {
    excluded.push("Meals on days not marked in the itinerary");
  }

  return { facts, included, excluded };
}
