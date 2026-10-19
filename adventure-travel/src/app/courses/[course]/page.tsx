import type { Metadata } from "next";
import Link from "next/link";
import { courses, type Course } from "@/data/courses";
import { absoluteUrl, fitDescription, fitTitle, ORGANIZATION_ID, pageMetadata, SITE_URL } from "@/lib/seo";
import { shareImage } from "@/lib/shareImage";
import CourseDetailClient from "./CourseDetailClient";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/** "From …" sentence that matches the tiers: their base price excludes stay and meals. */
function priceSentence(course: Course): string {
  if (!course.tiers?.length) return `From ${inr(course.price)} per person.`;
  const base = Math.min(...course.tiers.map((t) => t.priceBase));
  const full = Math.min(...course.tiers.map((t) => t.priceFull));
  return `From ${inr(base)} for training only, or ${inr(full)} with stay and meals.`;
}

export function generateStaticParams() {
  return courses.map((course) => ({ course: course.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ course: string }> }): Promise<Metadata> {
  const { course: slug } = await params;
  const course = courses.find((c) => c.slug === slug);
  if (!course) return { title: "Course Not Found" };

  return pageMetadata({
    title: fitTitle(`${course.name} in Auli`),
    description: fitDescription([
      course.shortDescription,
      priceSentence(course),
      `${course.duration} in ${course.location}, ${course.dates}.`,
    ]),
    path: `/courses/${course.slug}`,
    ...shareImage(`course-${course.slug}`),
    imageAlt: `${course.name} — Himalayan snow sports in Auli`,
    type: "article",
  });
}

export default async function CourseDetailPage({ params }: { params: Promise<{ course: string }> }) {
  const { course: slug } = await params;
  const course = courses.find((c) => c.slug === slug);

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Course Not Found</h1>
          <Link href="/courses" className="text-sky-600 hover:underline">
            Back to All Courses
          </Link>
        </div>
      </div>
    );
  }

  const url = absoluteUrl(`/courses/${course.slug}`);
  const days = Number.parseInt(course.duration, 10);
  // Our own Auli photos only (local files), cover first.
  const images = [course.image, ...(course.gallery ?? [])]
    .filter((src, i, all) => src.startsWith("/") && all.indexOf(src) === i)
    .slice(0, 6)
    .map(absoluteUrl);
  // No aggregateRating: the old fixed 4.9 / 150 on every course had no collected reviews behind it.
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Course",
        "@id": `${url}#course`,
        name: course.name,
        description: course.description,
        url,
        image: images,
        educationalLevel: course.level,
        provider: { "@id": ORGANIZATION_ID },
        offers: {
          "@type": "Offer",
          url,
          category: "Paid",
          price: course.price,
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
          validFrom: new Date().toISOString(),
        },
        hasCourseInstance: {
          "@type": "CourseInstance",
          courseMode: "Onsite",
          location: { "@type": "Place", name: course.location },
          ...(Number.isFinite(days) && { courseWorkload: `P${days}D` }),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Courses", item: absoluteUrl("/courses") },
          { "@type": "ListItem", position: 3, name: course.name, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <CourseDetailClient course={course} />
    </>
  );
}
