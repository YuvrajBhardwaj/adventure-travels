import type { Metadata } from "next";
import Link from "next/link";
import { courses } from "@/data/courses";
import { pageMetadata } from "@/lib/seo";
import CourseDetailClient from "./CourseDetailClient";

export function generateStaticParams() {
  return courses.map((course) => ({ course: course.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ course: string }> }): Promise<Metadata> {
  const { course: slug } = await params;
  const course = courses.find((c) => c.slug === slug);
  if (!course) return { title: "Course Not Found" };

  const title = `${course.name} — ${course.duration} | Auli, Uttarakhand`;
  const description = `${course.shortDescription} ${course.duration} ${course.type.toLowerCase()} course in ${course.location}. From ${course.currency}${course.price.toLocaleString("en-IN")} per person. Book with Himalayan Arc Adventure.`;
  return pageMetadata({
    title,
    description,
    path: `/courses/${course.slug}`,
    image: course.image,
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            name: course.name,
            description: course.description,
            url: `https://www.himalayanarcadventure.com/courses/${course.slug}`,
            image: course.image,
            provider: {
              "@type": "TravelAgency",
              name: "Himalayan Arc Adventure",
              url: "https://www.himalayanarcadventure.com",
            },
            offers: {
              "@type": "Offer",
              price: course.price,
              priceCurrency: "INR",
              availability: "https://schema.org/InStock",
              validFrom: new Date().toISOString(),
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: 4.9,
              reviewCount: 150,
            },
          }),
        }}
      />
      <CourseDetailClient course={course} />
    </>
  );
}
