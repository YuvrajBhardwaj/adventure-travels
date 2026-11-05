"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Snowflake, Timer } from "lucide-react";
import { courses, coursePhotos } from "@/data/courses";
import { FadeUp } from "./MotionWrapper";
import SmartImage from "./SmartImage";
import CardSlideshow from "./CardSlideshow";
import { SwipeRail, RailItem } from "./SwipeRail";
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
            className="group block rounded-3xl bg-card p-5 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.35)] ring-1 ring-foreground/[0.07] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary sm:p-7 lg:col-span-8 lg:rounded-none lg:bg-transparent lg:p-0 lg:shadow-none lg:ring-0"
          >
            <p className="font-nav text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">
              <span className="lg:hidden">Featured · </span>
              {featured.type}
            </p>
            {/* Phones and tablets: dates and duration as pills; desktop: as the headline */}
            <p className="mt-3 flex flex-wrap gap-2 lg:hidden">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-800 ring-1 ring-sky-200">
                <CalendarDays className="h-4 w-4" aria-hidden />
                {featured.dates}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-800 ring-1 ring-sky-200">
                <Timer className="h-4 w-4" aria-hidden />
                {featured.duration}
              </span>
            </p>
            <p className="mt-3 hidden font-heading text-3xl font-medium leading-tight tracking-[-0.02em] text-foreground sm:text-4xl lg:block">
              {featured.dates} <span className="text-foreground/35">·</span> {featured.duration}
            </p>
            <h3 className="mt-4 font-heading text-2xl font-medium leading-tight text-foreground lg:mt-3 lg:text-xl lg:text-foreground/80">{featured.title}</h3>
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
                <span className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(2,132,199,0.7)] transition-colors duration-150 ease-out group-hover:bg-sky-700 lg:w-auto lg:justify-start lg:rounded-none lg:bg-transparent lg:px-0 lg:text-sky-700 lg:shadow-none lg:group-hover:bg-transparent lg:group-hover:underline">
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
          <SwipeRail label="More snow courses" className="mt-12 lg:mt-14" desktop="lg:grid lg:grid-cols-3 lg:gap-x-6 lg:gap-y-10">
            {rest.map((course) => (
              <RailItem key={course.slug}>
                <Link
                  href={`/courses/${course.slug}`}
                  className="group flex h-full flex-col transition-transform duration-150 ease-out active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary motion-reduce:active:scale-100"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-navy sm:aspect-[4/3] lg:aspect-[16/10] lg:rounded-2xl">
                    <CardSlideshow
                      images={coursePhotos(course)}
                      alt={course.name}
                      className="z-0 transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                    <div aria-hidden className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-navy-deep/50 to-transparent" />
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 font-nav text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-800 shadow-sm">
                      {course.type}
                    </span>
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-navy-deep/60 px-3 py-1 font-nav text-xs font-medium text-white ring-1 ring-white/20 backdrop-blur-md">
                      <Timer className="h-3.5 w-3.5" aria-hidden />
                      {course.duration}
                    </span>
                  </div>
                  <h4 className="mt-4 font-heading text-xl font-medium leading-tight text-foreground">{course.name}</h4>
                  <p className="font-nav mt-1 text-xs text-muted">{course.level}</p>
                  <p className="mt-auto flex items-center justify-between pt-4 text-sm text-foreground">
                    <span>
                      <Price inr={course.price} />
                      <span className="text-muted"> / person</span>
                    </span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200 transition-transform duration-150 ease-out group-hover:translate-x-0.5">
                      <span className="sr-only">View</span>
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </span>
                  </p>
                </Link>
              </RailItem>
            ))}
            {/* The row ends on the full list (phones and tablets only) */}
            <RailItem className="lg:hidden">
              <Link
                href="/courses"
                className="group relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 to-navy-hero p-6 text-white transition-transform duration-150 ease-out active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary motion-reduce:active:scale-100 sm:aspect-[4/3]"
              >
                <Snowflake className="h-10 w-10 text-white/80" aria-hidden />
                <span>
                  <span className="block font-heading text-3xl font-medium leading-tight">All {courses.length} snow courses</span>
                  <span className="mt-2 block text-sm text-white/75">Skiing, snowboarding and backcountry courses in Auli, December to March.</span>
                  <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-sky-800">
                    See courses
                    <ArrowRight className="h-4 w-4 transition-transform duration-150 ease-out group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </span>
              </Link>
            </RailItem>
          </SwipeRail>
        )}
      </div>
    </section>
  );
}
