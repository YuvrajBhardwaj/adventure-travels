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
  image: "/assets/tours/auli/IMG_4294.jpg",
  imageAlt: "Auli under fresh snow, with the Garhwal peaks behind",
  /** Extra gallery photos outside public/assets/tours/auli/ (that folder is always shown first). */
  gallery: [] as string[],
  intro:
    "A short Auli trip from Rishikesh for friends and families: mountain drives, comfortable stays, guided sightseeing, big views, and optional skiing and snow activities.",
  itinerary: [
    {
      day: 1,
      title: "Rishikesh to Joshimath to Auli",
      points: [
        "Drive from Rishikesh up the Alaknanda valley.",
        "Reach Joshimath and transfer to a local taxi arranged by our team for Auli.",
        "Check in to your stay in Auli.",
        "Dinner at the stay.",
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
        "See Auli with your local guide.",
        "Visit the Auli Artificial Lake below the high peaks.",
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
  /** Top attractions, shown last on the page. `photo` only from our own photos; without one the row shows the NoPhoto mark. */
  attractions: [
    {
      name: "Ski slopes and chairlift",
      points: "Snow slopes • Chairlift • Beginner ski lessons",
      text: "Auli's open slopes are where India learns to ski. Try a beginner ski session with an instructor, or ride the chairlift over the runs for the view when it's running. Both cost extra and depend on snow and weather.",
      photo: "/assets/tours/auli/IMG_4059.jpeg",
      photoAlt: "Visitors on the Auli snow slopes by the resort huts",
    },
    {
      name: "Nanda Devi and the Garhwal peaks",
      points: "Nanda Devi 7,816 m • Dronagiri • Hathi-Ghoda",
      text: "From the Auli slopes you look across at Nanda Devi (7,816 m), India's second-highest peak, with Dronagiri, Hathi-Ghoda and Trishul around it. The view is clearest on winter mornings after fresh snow.",
      photo: "/assets/tours/auli/IMG_6352.jpeg",
      photoAlt: "A visitor in fresh snow at Auli with the Garhwal range behind",
    },
    {
      name: "Auli Artificial Lake",
      photo: "/assets/tours/auli/IMG_3961.jpg",
      photoAlt: "A visitor beside the frozen Auli Artificial Lake at sunset",
      points: "Snow-making lake • Peak views • Easy walk",
      text: "A man-made lake above the ski slopes, built to feed the snow-making for the runs. A quiet spot to sit for a while, with the high peaks standing over the water.",
    },
    {
      name: "Gorson Bugyal",
      photo: "/assets/tours/auli/gorson-bugyal.jpeg",
      photoAlt: "Gorson Bugyal meadow above Auli",
      points: "Alpine meadow • Forest walk • Snow in winter",
      text: "A wide alpine meadow above Auli, reached on foot through oak and conifer forest. Snow in winter, grass and flowers in summer, and a long line of peaks from the top.",
    },
    {
      name: "Chattrakund",
      photo: "/assets/tours/auli/chattrakund.jpeg",
      photoAlt: "Chattrakund lake, frozen in winter, in the forest above Auli",
      points: "Clear mountain lake • Beyond Gorson Bugyal • Quiet spot",
      text: "A small, clear lake a little beyond Gorson Bugyal, on the same walk. Worth the extra stretch on a fine day for the quiet and the reflections.",
    },
    {
      name: "Nanda Devi National Park",
      photo: "/assets/tours/auli/nanda-devi-national-park.jpeg",
      photoAlt: "Peaks of the Nanda Devi National Park",
      points: "UNESCO World Heritage Site • Protected wilderness",
      text: "The protected wilderness around Nanda Devi, listed by UNESCO as a World Heritage Site together with the Valley of Flowers. Its core is closed to visitors; from Auli you see the peaks that ring it.",
    },
    {
      name: "Joshimath",
      photo: "/commons/joshimath-narsingh-temple.jpg",
      photoAlt: "Narsingh Temple in Joshimath, with the town and mountains behind",
      credit: { author: "Rohanshah657", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Historic_Narsingh_Temple_complex_in_Joshimath.jpg" },
      points: "Narsingh temple • Jyotirmath • Ropeway to Auli",
      text: "The town below Auli that the tour passes through on the way up and back, and where the ropeway to Auli starts. Home to the Narsingh temple and Jyotirmath, the monastery founded by Adi Shankaracharya, and the gateway to Badrinath.",
    },
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
