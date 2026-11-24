import { courses } from "@/data/courses";
import { formatRupees } from "@/lib/utils";
import { absoluteUrl, breadcrumbLd, fitDescription, fitTitle, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { shareImage } from "@/lib/shareImage";

import CoursesPageClient from "./CoursesPageClient";

const tiers = courses.flatMap((c) => c.tiers ?? []);
// Tier base prices exclude stay and meals; courses without tiers have one all-in price.
const trainingFrom = Math.min(...courses.map((c) => (c.tiers?.length ? Math.min(...c.tiers.map((t) => t.priceBase)) : c.price)));
const withStayFrom = tiers.length ? Math.min(...tiers.map((t) => t.priceFull)) : undefined;
const durations = [...new Set(courses.map((c) => Number.parseInt(c.duration, 10)))].filter(Number.isFinite).sort((a, b) => a - b);

export const metadata = pageMetadata({
  title: fitTitle("Skiing in Auli, Uttarakhand", ["Ski & Snowboard School"]),
  description: fitDescription([
    `${durations.join("- and ")}-day skiing and snowboarding courses and backcountry touring in Auli, Uttarakhand.`,
    `Training from ${formatRupees(trainingFrom)}${withStayFrom ? `, or ${formatRupees(withStayFrom)} with stay and meals` : ""}.`,
    "Ski, board and safety equipment included.",
  ]),
  path: "/courses",
  ...shareImage("course-skiing-course"),
  imageAlt: "Skiing course in Auli, Uttarakhand",
});

export default function CoursesPage() {
  return (
    <>
      <JsonLd
        graph={[
          {
            "@type": "ItemList",
            name: "Ski and snowboard courses in Auli",
            numberOfItems: courses.length,
            itemListElement: courses.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, url: absoluteUrl(`/courses/${c.slug}`) })),
          },
          breadcrumbLd([["Courses", "/courses"]]),
        ]}
      />
      <CoursesPageClient />
    </>
  );
}
