export interface Destination {
  id: string;
  name: string;
  slug: string;
  region: string;
  country: string;
  image: string;
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
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800&q=80",
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
