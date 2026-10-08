import { pageMetadata } from "@/lib/seo";
import CoursesPageClient from "./CoursesPageClient";

export const metadata = pageMetadata({
  title: "Skiing & Snowboarding Courses in Auli",
  description:
    "Book certified 7-day skiing, snowboarding, and backcountry touring courses in Auli, Uttarakhand. All equipment, accommodation, and meals included. From Rs.30,000 per person.",
  socialTitle: "Skiing & Snowboarding Courses | Himalayan Arc Adventure",
  socialDescription: "Certified 7-day skiing, snowboarding, and backcountry courses in Auli, Uttarakhand. All-inclusive packages from Rs.30,000.",
  path: "/courses",
});

export default function CoursesPage() {
  return <CoursesPageClient />;
}
