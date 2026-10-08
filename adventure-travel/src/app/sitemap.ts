import type { MetadataRoute } from "next";
import { treks } from "@/data/treks";
import { courses } from "@/data/courses";

export const dynamic = "force-static";

const BASE = "https://www.himalayanarcadventure.com";

const STATIC_ROUTES = [
  { url: BASE, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1.0 },
  { url: `${BASE}/treks`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
  { url: `${BASE}/courses`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
  { url: `${BASE}/destinations`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
  { url: `${BASE}/activities`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
  { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.5 },
  { url: `${BASE}/faq`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
  { url: `${BASE}/cancellation-policy`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
];

const TREK_ROUTES = treks.map((trek) => ({
  url: `${BASE}/treks/${trek.slug}`,
  lastModified: new Date(),
  changeFrequency: "monthly" as const,
  priority: 0.8,
}));

const COURSE_ROUTES = courses.map((course) => ({
  url: `${BASE}/courses/${course.slug}`,
  lastModified: new Date(),
  changeFrequency: "monthly" as const,
  priority: 0.8,
}));

export default function sitemap(): MetadataRoute.Sitemap {
  return [...STATIC_ROUTES, ...TREK_ROUTES, ...COURSE_ROUTES];
}
