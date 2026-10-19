import { courses } from "@/data/courses";
import { fitDescription, fitTitle, pageMetadata } from "@/lib/seo";
import CoursesPageClient from "./CoursesPageClient";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const tiers = courses.flatMap((c) => c.tiers ?? []);
// Tier base prices exclude stay and meals; courses without tiers have one all-in price.
const trainingFrom = Math.min(...courses.map((c) => (c.tiers?.length ? Math.min(...c.tiers.map((t) => t.priceBase)) : c.price)));
const withStayFrom = tiers.length ? Math.min(...tiers.map((t) => t.priceFull)) : undefined;
const durations = [...new Set(courses.map((c) => Number.parseInt(c.duration, 10)))].filter(Number.isFinite).sort((a, b) => a - b);

export const metadata = pageMetadata({
  title: fitTitle("Auli Skiing & Snowboarding Courses"),
  description: fitDescription([
    `${durations.join("- and ")}-day skiing and snowboarding courses and backcountry touring in Auli, Uttarakhand.`,
    `Training from ${inr(trainingFrom)}${withStayFrom ? `, or ${inr(withStayFrom)} with stay and meals` : ""}.`,
    "Ski, board and safety equipment included.",
  ]),
  path: "/courses",
});

export default function CoursesPage() {
  return <CoursesPageClient />;
}
