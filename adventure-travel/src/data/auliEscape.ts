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
  image: "/assets/skiing/IMG_5017.JPG.jpeg",
  imageAlt: "A group on the Auli snow slopes below the Himalayan range",
  shareImage: "/assets/skiing/IMG_5017.JPG.jpeg",
  /** Our own Auli photos: the slopes, the range, the ropeway and groups on the snow. */
  gallery: [
    "/assets/skiing/IMG_5017.JPG.jpeg",
    "/assets/skiing/IMG_5022.JPG.jpeg",
    "/assets/skiing/IMG_5028.JPG.jpeg",
    "/assets/skiing/IMG_5036.JPG.jpeg",
    "/assets/skiing/IMG_4976.JPG.jpeg",
    "/assets/skiing/IMG_5009.JPG.jpeg",
    "/assets/skiing/IMG_4992.JPG.jpeg",
    "/assets/skiing/IMG_5038.JPG.jpeg",
  ],
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
  /**
   * Package options. Standard is the brief above; Deluxe is a better stay on the same trip,
   * priced on request until the owner sends its details (TODO.md).
   */
  packages: [
    {
      id: "standard",
      name: "Standard Package",
      includes: [
        { label: "Stay", text: "2 nights in Auli; room type confirmed before booking" },
        { label: "Meals", text: "Dinner on Day 1; breakfast and dinner on Day 2" },
        { label: "Transfers", text: "Rishikesh to Joshimath and back, plus a local taxi between Joshimath and Auli both ways" },
        { label: "Guide", text: "A local guide for Auli sightseeing on Day 2" },
        { label: "Extras", text: "Bonfire for groups of 4 or more, weather permitting" },
      ],
    },
    {
      id: "deluxe",
      name: "Deluxe Package",
      includes: [
        { label: "Stay", text: "2 nights in a higher-category hotel or resort in Auli; we share the property with you before you book" },
        { label: "Meals, transfers and guide", text: "Same as the Standard Package" },
        { label: "Price", text: "On request: tell us your dates and group size" },
      ],
    },
  ],
  attractions: [
    { name: "Auli Artificial Lake", text: "A man-made lake above the ski slopes, built to feed the snow-making for the runs. A quiet spot with the high peaks standing over it." },
    { name: "Gorson Bugyal", text: "A wide alpine meadow above Auli, reached on foot through oak and conifer forest: snow in winter, grass and flowers in summer, and a long line of peaks from the top." },
    { name: "Ski slopes and chairlift", text: "Auli is India's ski capital. Try a beginner ski session or ride the chairlift over the slopes when it's running (both at extra cost)." },
    { name: "Nanda Devi and the Garhwal peaks", text: "Auli looks straight across at Nanda Devi (7,816 m), India's second-highest peak, with Dronagiri, Hathi-Ghoda and Trishul around it." },
  ],
  whatToCarry: [
    "Warm layers, gloves and a cap: Auli is cold, and below freezing in winter",
    "Shoes or boots with a good grip for snow and ice",
    "Sunglasses and sunscreen for the glare off the snow",
    "A government photo ID for hotel check-in",
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
