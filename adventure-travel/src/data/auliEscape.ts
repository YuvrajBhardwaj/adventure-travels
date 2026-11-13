/**
 * "Auli Winter Escape": a 3-day road-and-stay package from Rishikesh (owner's brief, 13 Nov 2026).
 * Booked by WhatsApp or phone for now; the order API doesn't price it.
 */

export const AULI_ESCAPE = {
  slug: "auli-winter-escape",
  name: "Auli Winter Escape",
  days: 3,
  nights: 2,
  route: ["Rishikesh", "Joshimath", "Auli", "Rishikesh"],
  /** Per person, INR. */
  price: 10000,
  /** Per person for groups of 4 or more, INR. */
  groupPrice: 8000,
  groupFrom: 4,
  image: "/assets/skiing/IMG_5035.JPG.jpeg",
  shareImage: "/og/course-skiing-course.jpg",
  intro:
    "Escape to the Himalayas with a short Auli getaway: scenic mountain drives, comfortable stays, guided sightseeing, big views and optional snow adventures with your friends and family.",
  itinerary: [
    {
      day: 1,
      title: "Rishikesh to Joshimath to Auli",
      points: [
        "Depart from Rishikesh for a scenic drive through the Himalayan valleys.",
        "Reach Joshimath and transfer to a local taxi arranged by our team for Auli.",
        "Check in to your accommodation and relax.",
        "Enjoy dinner and the peaceful mountain atmosphere.",
        "Bonfire included for groups of 4 or more, subject to weather and local permissions.",
      ],
      meals: "Dinner",
      stay: "Auli",
    },
    {
      day: 2,
      title: "Explore Auli",
      points: [
        "Start the day with breakfast.",
        "Explore Auli with your local guide.",
        "Visit Auli Artificial Lake and take in the Himalayan views.",
        "Walk the trails towards Gorson Bugyal, depending on weather and trail conditions.",
        "Optional skiing or a chairlift/ropeway ride, at extra cost.",
        "Return to your accommodation for dinner.",
      ],
      meals: "Breakfast and dinner",
      stay: "Auli",
    },
    {
      day: 3,
      title: "Auli to Joshimath to Rishikesh",
      points: [
        "Check out and travel from Auli to Joshimath by local taxi.",
        "Continue the return journey from Joshimath to Rishikesh.",
        "Arrive in Rishikesh, depending on road and traffic conditions.",
      ],
      meals: "Not included",
      stay: undefined,
    },
  ],
  included: [
    "Return transport between Rishikesh and Joshimath",
    "Local taxi transfers between Joshimath and Auli, both ways",
    "2 nights' accommodation in Auli",
    "Dinner on Day 1",
    "Breakfast and dinner on Day 2",
    "Local guide for Auli sightseeing on Day 2",
    "Bonfire for groups of 4 or more",
  ],
  excluded: [
    "Lunch on Day 2 and all meals on Day 3",
    "Skiing lessons, equipment rental and activity charges",
    "Chairlift/ropeway tickets",
    "Personal expenses and anything not listed in the inclusions",
  ],
  transport: [
    "A Sumo or Ertiga may be arranged for smaller groups, subject to availability.",
    "Groups of more than about 8–10 people may need a separate Tempo Traveller.",
    "Final transport arrangements are confirmed before booking.",
  ],
  notes: [
    "Group discounts and special offers apply to the package price only.",
    "Optional activities and personal expenses are charged separately.",
    "Sightseeing and outdoor activities depend on weather, snowfall, trail access and local restrictions.",
    "Accommodation and transport are confirmed before booking.",
  ],
  contact: {
    phones: ["+91 78179 12062", "+91 86505 61564"],
    email: "himalayanarcadventure@gmail.com",
  },
} as const;

/** Group offers: who pays what. Totals and savings are worked out by `groupOffer()`. */
export const AULI_GROUP_OFFERS = [
  { people: 4, offer: "First 3 pay Rs.8,000 each; the 4th pays Rs.6,000", payments: [8000, 8000, 8000, 6000] },
  { people: 5, offer: "First 4 pay Rs.8,000 each; the 5th pays Rs.4,000", payments: [8000, 8000, 8000, 8000, 4000] },
  { people: 6, offer: "Pay for 5 at Rs.8,000 each; 1 goes free", payments: [8000, 8000, 8000, 8000, 8000] },
  { people: 10, offer: "Pay for 8 at Rs.8,000 each; 2 go free", payments: Array<number>(8).fill(8000) },
] as const;

/** Total, saving and saving % against the regular price for the whole group (% to one decimal). */
export function groupOffer(o: { people: number; payments: readonly number[] }) {
  const total = o.payments.reduce((sum, p) => sum + p, 0);
  const regular = o.people * AULI_ESCAPE.price;
  const savings = regular - total;
  return { total, savings, percent: Math.round((savings / regular) * 1000) / 10 };
}
