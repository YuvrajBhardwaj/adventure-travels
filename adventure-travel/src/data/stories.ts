export interface Story {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  authorRole: string;
  publishedAt: string;
  readTime: number;
  category: string;
  image: string;
  featured: boolean;
  href: string;
}

export const stories: Story[] = [
  {
    id: "1",
    title: "The Hidden Valley: A Trekker's Guide to Valley of Flowers",
    slug: "hidden-valley-guide",
    excerpt: "The alpine meadows and rare Himalayan flowers of the Valley of Flowers, a UNESCO World Heritage Site in Uttarakhand, and how to plan the trek.",
    content: "Full article content here...",
    author: "Himalayan Arc team",
    authorRole: "Joshimath",
    publishedAt: "2024-12-15",
    readTime: 8,
    category: "Trekking",
    image: "/assets/valley-of-flowers/IMG_5934.JPG.jpeg",
    featured: true,
    href: "/treks/valley-of-flowers",
  },
  {
    id: "2",
    title: "Winter Trekking in Uttarakhand: What You Need to Know",
    slug: "winter-trekking-guide",
    excerpt: "How to prepare for a winter trek in the Uttarakhand Himalayas, on snow-covered trails and past frozen lakes.",
    content: "Full article content here...",
    author: "Himalayan Arc team",
    authorRole: "Joshimath",
    publishedAt: "2024-11-20",
    readTime: 6,
    category: "Guide",
    image: "/assets/kedarkantha-trek/IMG_4137.JPG.jpeg",
    featured: false,
    href: "/treks",
  },
  {
    id: "3",
    title: "Skiing in Auli: India's Best-Kept Secret",
    slug: "skiing-in-auli",
    excerpt: "Why Auli's powder slopes and Nanda Devi views rival the world's top ski destinations.",
    content: "Full article content here...",
    author: "Himalayan Arc team",
    authorRole: "Joshimath",
    publishedAt: "2024-10-05",
    readTime: 5,
    category: "Skiing",
    image: "/assets/skiing/IMG_4963.JPG.jpeg",
    featured: false,
    href: "/activities#skiing",
  },
];
