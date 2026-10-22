"use client";

import Link from "next/link";
import { courses } from "@/data/courses";
import { FadeUp } from "./MotionWrapper";
import SmartImage from "./SmartImage";
import Price from "@/components/Price";

export default function SnowSchool() {
  const featured = courses.find((c) => c.featured) ?? courses[0];
  const rest = courses.filter((c) => c.slug !== featured.slug).slice(0, 3);

  return (
    <section className="relative bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* The section opens on the mountain: the title sits on the photo */}
        <div className="relative isolate aspect-[4/5] overflow-hidden rounded-2xl bg-navy sm:aspect-[16/9] lg:aspect-[2/1]">
          <SmartImage src={featured.image} alt={featured.name} className="absolute inset-0 z-0 h-full w-full object-cover" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy-deep/85 via-navy-deep/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-8 lg:p-10">
            <p className="font-nav text-xs font-semibold tracking-[0.12em] text-sky-200">DEC – MAR · WINTER</p>
            <FadeUp>
              <h2 className="mt-3 max-w-3xl font-heading text-5xl font-medium leading-[1.02] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
                The Auli Snow School
              </h2>
            </FadeUp>
          </div>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <p className="text-base leading-relaxed text-foreground/75 sm:text-lg">
              Skiing, snowboarding, and backcountry courses under Nanda Devi. Certified instructors, 6:1 ratios, and a
              completion certificate.
            </p>
            <Link
              href="/courses"
              className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-sky-700 underline decoration-secondary decoration-2 underline-offset-[6px] transition-colors duration-150 ease-out hover:text-sky-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
            >
              All courses
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Featured course: its dates and duration are the headline */}
          <Link
            href={`/courses/${featured.slug}`}
            className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary lg:col-span-8"
          >
            <p className="font-nav text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">{featured.type}</p>
            <p className="mt-3 font-heading text-3xl font-medium leading-tight tracking-[-0.02em] text-foreground sm:text-4xl">
              {featured.dates} <span className="text-foreground/35">·</span> {featured.duration}
            </p>
            <h3 className="mt-3 font-heading text-xl font-medium text-foreground/80">{featured.title}</h3>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">{featured.shortDescription}</p>

            {/* dates and duration are the headline above; the rest sits on a ruled row */}
            <dl className="mt-6 grid grid-cols-2 items-end gap-y-3 border-t border-foreground/15 py-4 text-sm sm:grid-cols-[1fr_1fr_auto]">
              <div>
                <dt className="font-nav text-[11px] uppercase tracking-[0.14em] text-muted">Level</dt>
                <dd className="mt-1 font-medium text-foreground">{featured.level}</dd>
              </div>
              <div>
                <dt className="font-nav text-[11px] uppercase tracking-[0.14em] text-muted">From</dt>
                <dd className="mt-1 font-heading text-2xl text-foreground">
                  <Price inr={featured.price} />
                </dd>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-sky-700 group-hover:underline">
                  Book this course
                  <svg className="h-4 w-4 transition-transform duration-150 ease-out group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </div>
            </dl>

            {(featured.instructorRatio || featured.weeklyHours) && (
              <p className="text-xs text-muted">
                {featured.instructorRatio && <span>{featured.instructorRatio} · </span>}
                {featured.weeklyHours && <span>{featured.weeklyHours} · </span>}
                <span>Completion certificate</span>
              </p>
            )}
          </Link>
        </div>

        {rest.length > 0 && (
          <ul className="mt-14 grid gap-x-6 gap-y-10 sm:grid-cols-3">
            {rest.map((course) => (
              <li key={course.slug}>
                <Link
                  href={`/courses/${course.slug}`}
                  className="group flex h-full flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
                >
                  <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-navy">
                    <SmartImage
                      src={course.image}
                      alt={course.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                  </div>
                  <p className="font-nav mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-700">{course.type}</p>
                  <h4 className="mt-1 font-heading text-xl font-medium leading-tight text-foreground">{course.name}</h4>
                  <p className="font-nav mt-1 text-xs text-muted">
                    {course.duration} · {course.level}
                  </p>
                  <p className="mt-auto flex items-center justify-between pt-4 text-sm text-foreground">
                    <Price inr={course.price} />
                    <span className="text-sky-700 group-hover:underline">
                      <span className="sr-only">View</span>
                      <span aria-hidden>→</span>
                    </span>
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
