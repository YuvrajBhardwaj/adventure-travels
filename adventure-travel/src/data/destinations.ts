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
    description: "Discover the crown jewels of the Indian Himalayas — from the Valley of Flowers to the sacred Satopanth Lake. Uttarakhand offers unparalleled alpine meadows, glacial lakes, and spiritual journeys through ancient pilgrimage routes.",
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
    description: "The heart of the Garhwal Himalayas — home to India's highest peaks and most revered trails. Experience dramatic landscapes from technical summit climbs to accessible ridge walks with 360° mountain panoramas.",
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
    description: "Explore Uttarakhand's eastern Himalayas from Munsiyari and the Johar Valley to the Nanda Devi East Base Camp.",
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
    description: "Journey to the sacred glacial lakes of the Himalayas — pristine turquoise waters reflecting towering peaks. These high-altitude gems offer some of the most spiritually significant and visually stunning treks in the region.",
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
    description: "Perfect for first-time trekkers — gentle trails through rhododendron forests, alpine meadows, and charming mountain villages. Well-marked paths, moderate altitudes, and comfortable camping make these ideal introductions to Himalayan trekking.",
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
    description: "For experienced mountaineers seeking true summit challenges. These treks demand fitness, acclimatization, and technical skills — rewarding you with unmatched panoramas from the roof of the Garhwal Himalayas.",
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
    description: "The adventure capital of India — from the dramatic crossover of Hampta Pass to the serene beauty of Chandratal Lake. Himachal offers diverse landscapes from lush Kullu valleys to stark Lahaul deserts.",
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
    description: "Experience the magic of the Himalayas under a blanket of snow. These winter-exclusive treks transform familiar trails into pristine white wonderlands with frozen lakes, snow-covered peaks, and crystal-clear skies.",
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
