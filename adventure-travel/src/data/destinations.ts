export interface Destination {
  id: string;
  name: string;
  slug: string;
  region: string;
  country: string;
  image: string;
  /** Set for a Wikimedia Commons photo: shown as a small credit line. */
  credit?: { author: string; license: string; url: string };
  description: string;
  popularTreks: { name: string; slug: string }[];
  category: string;
}

export const destinations: Destination[] = [
  {
    id: "1",
    name: "Uttarakhand Himalayas",
    slug: "uttarakhand-himalayas",
    region: "Uttarakhand",
    country: "India",
    image: "/assets/pangarchula-peak-trek/IMG_3734.jpeg",
    description: "Treks in the Uttarakhand Himalayas run from the Valley of Flowers to the sacred Satopanth Lake. Expect alpine meadows, glacial lakes and old pilgrimage routes.",
    popularTreks: [
      { name: "Valley of Flowers", slug: "valley-of-flowers" },
      { name: "Satopanth Lake", slug: "satopanth-lake" },
      { name: "Har Ki Dun", slug: "har-ki-dun" },
      { name: "Kedarkantha", slug: "kedarkantha" },
      { name: "Brahmatal", slug: "brahmatal" },
      { name: "Roopkund", slug: "roopkund" },
      { name: "Kuari Pass", slug: "kuari-pass" },
      { name: "Pangarchula Peak", slug: "pangarchula-peak" },
      { name: "Nandi Kund", slug: "nandi-kund" },
      { name: "Kalindi Khal", slug: "kalindi-khal" },
      { name: "Gupt Khal", slug: "gupt-khal" },
      { name: "Panpatia Col", slug: "panpatia-col" },
      { name: "Dronagiri Base Camp", slug: "dronagiri-base-camp" },
      { name: "Nanda Devi Base Camp", slug: "nanda-devi-base-camp" },
      { name: "Mana Pass", slug: "mana-pass" },
      { name: "Niti Pass", slug: "niti-pass" },
      { name: "Rimkhim", slug: "rimkhim" },
    ],
    category: "Himalayan Range",
  },
  {
    id: "2",
    name: "Garhwal Region",
    slug: "garhwal-region",
    region: "Garhwal, Uttarakhand",
    country: "India",
    image: "/assets/dronagiri/85943898-e5e5-4bb4-93b0-84cd940cd6b6.jpeg",
    description: "The Garhwal Himalayas of Uttarakhand hold some of India's highest peaks and most revered trails. Treks here range from technical summit climbs to easier ridge walks with 360° mountain views.",
    popularTreks: [
      { name: "Pangarchula Peak", slug: "pangarchula-peak" },
      { name: "Kuari Pass", slug: "kuari-pass" },
      { name: "Roopkund", slug: "roopkund" },
      { name: "Valley of Flowers", slug: "valley-of-flowers" },
      { name: "Satopanth Lake", slug: "satopanth-lake" },
      { name: "Har Ki Dun", slug: "har-ki-dun" },
      { name: "Kedarkantha", slug: "kedarkantha" },
      { name: "Brahmatal", slug: "brahmatal" },
      { name: "Nandi Kund", slug: "nandi-kund" },
      { name: "Kalindi Khal", slug: "kalindi-khal" },
      { name: "Gupt Khal", slug: "gupt-khal" },
      { name: "Panpatia Col", slug: "panpatia-col" },
      { name: "Dronagiri Base Camp", slug: "dronagiri-base-camp" },
      { name: "Mana Pass", slug: "mana-pass" },
      { name: "Niti Pass", slug: "niti-pass" },
      { name: "Rimkhim", slug: "rimkhim" },
    ],
    category: "Mountain Region",
  },
  {
    id: "8",
    name: "Kumaon Region",
    slug: "kumaon-region",
    region: "Kumaon, Uttarakhand",
    country: "India",
    image: "/commons/panchachuli-munsiyari.jpg",
    credit: { author: "Abhijit Kar Gupta", license: "CC BY 2.0", url: "https://commons.wikimedia.org/wiki/File:Panchchuli_mountain_Peak_as_seen_from_Munsiyari,_in_the_Pithoragarh_District_of_Uttarakhand,_India.jpg" },
    description: "Trek Uttarakhand's eastern Himalayas, from Munsiyari and the Johar Valley to the Nanda Devi East Base Camp.",
    popularTreks: [
      { name: "Nanda Devi Base Camp", slug: "nanda-devi-base-camp" },
    ],
    category: "Mountain Region",
  },
  {
    id: "3",
    name: "High Altitude Lakes",
    slug: "high-altitude-lakes",
    region: "Uttarakhand & Himachal Pradesh",
    country: "India",
    image: "/assets/nandi-kund-trek/65a896f6-83b2-41aa-9726-171f369a2b12.jpeg",
    description: "Treks to the sacred glacial lakes of the Himalayas in Uttarakhand and Himachal, where turquoise water reflects the peaks above. Several of these lakes are pilgrimage sites as well as trek destinations.",
    popularTreks: [
      { name: "Satopanth Lake", slug: "satopanth-lake" },
      { name: "Roopkund", slug: "roopkund" },
      { name: "Brahmatal", slug: "brahmatal" },
      { name: "Nandi Kund", slug: "nandi-kund" },
      { name: "Bhrigu Lake", slug: "bhrigu-lake" },
      { name: "Hampta Pass & Chandratal", slug: "hampta-pass" },
    ],
    category: "Glacial Lakes",
  },
  {
    id: "4",
    name: "Beginner-Friendly Treks",
    slug: "beginner-friendly-treks",
    region: "Uttarakhand & Himachal",
    country: "India",
    image: "/assets/kedarkantha-trek/IMG_1269.JPG.jpeg",
    description: "Good first treks in Uttarakhand and Himachal: gentle trails through rhododendron forest, alpine meadows and mountain villages. Marked paths, moderate altitudes and comfortable camps make them an easy start to Himalayan trekking.",
    popularTreks: [
      { name: "Kedarkantha", slug: "kedarkantha" },
      { name: "Har Ki Dun", slug: "har-ki-dun" },
    ],
    category: "Easy Access",
  },
  {
    id: "5",
    name: "Technical Summit Treks",
    slug: "technical-summit-treks",
    region: "Uttarakhand",
    country: "India",
    image: "/assets/panpatia-col-trek/IMG_6015.jpeg",
    description: "Summit treks and high passes in the Garhwal Himalayas for experienced mountaineers. They need fitness, acclimatization and technical skills, and they reach the highest viewpoints in the Garhwal Himalayas.",
    popularTreks: [
      { name: "Pangarchula Peak", slug: "pangarchula-peak" },
      { name: "Roopkund", slug: "roopkund" },
      { name: "Kalindi Khal", slug: "kalindi-khal" },
      { name: "Gupt Khal", slug: "gupt-khal" },
      { name: "Panpatia Col", slug: "panpatia-col" },
      { name: "Nanda Devi Base Camp", slug: "nanda-devi-base-camp" },
      { name: "Mana Pass", slug: "mana-pass" },
      { name: "Niti Pass", slug: "niti-pass" },
    ],
    category: "Summit Climbs",
  },
  {
    id: "6",
    name: "Himachal Pradesh",
    slug: "himachal-pradesh",
    region: "Himachal Pradesh",
    country: "India",
    image: "/assets/hampta-pass/IMG_7578.jpeg",
    description: "Treks in Himachal Pradesh, from the Hampta Pass crossover to Chandratal Lake and Bhrigu Lake above Manali. The country changes from the green Kullu valleys to the bare Lahaul desert.",
    popularTreks: [
      { name: "Hampta Pass", slug: "hampta-pass" },
      { name: "Bhrigu Lake", slug: "bhrigu-lake" },
    ],
    category: "State Region",
  },
  {
    id: "7",
    name: "Winter Snow Treks",
    slug: "winter-snow-treks",
    region: "Uttarakhand",
    country: "India",
    image: "/assets/kedarkantha-trek/IMG_1268.JPG.jpeg",
    description: "Winter snow treks in Uttarakhand, run only in the snow season, on trails that freeze over: frozen lakes, snow-covered peaks and clear winter skies.",
    popularTreks: [
      { name: "Kedarkantha", slug: "kedarkantha" },
      { name: "Brahmatal", slug: "brahmatal" },
    ],
    category: "Seasonal",
  },
];

export const regions = [
  "All Regions",
  "Uttarakhand",
  "Himachal Pradesh",
  "Indian Himalayas",
  "Garhwal",
];

export const categories = [
  "All Categories",
  "Himalayan Range",
  "Mountain Region",
  "Glacial Lakes",
  "Easy Access",
  "Summit Climbs",
  "State Region",
  "Seasonal",
];

export const sortOptions = [
  { value: "popularity", label: "Sort by Popularity" },
  { value: "trekCount", label: "Most Adventures" },
  { value: "name", label: "Name A-Z" },
];
