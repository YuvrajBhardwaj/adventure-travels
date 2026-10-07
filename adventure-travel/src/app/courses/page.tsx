import type { Metadata } from "next";
import CoursesPageClient from "./CoursesPageClient";

export const metadata: Metadata = {
  title: "Skiing & Snowboarding Courses in Auli | Himalayan Arc Adventure",
  description:
    "Book certified 7-day skiing, snowboarding, and backcountry touring courses in Auli, Uttarakhand. All equipment, accommodation, and meals included. From Rs.30,000 per person.",
  openGraph: {
    title: "Skiing & Snowboarding Courses | Himalayan Arc Adventure",
    description:
      "Certified 7-day skiing, snowboarding, and backcountry courses in Auli, Uttarakhand. All-inclusive packages from Rs.30,000.",
    url: "https://himalayanarcadventure.com/courses",
  },
  alternates: {
    canonical: "https://himalayanarcadventure.com/courses",
  },
};

export default function CoursesPage() {
  return <CoursesPageClient />;
}
