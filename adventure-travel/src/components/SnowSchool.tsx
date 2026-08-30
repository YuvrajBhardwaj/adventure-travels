"use client";

import Link from "next/link";
import { courses } from "@/data/courses";
import { FadeUp, StaggerContainer, StaggerItem, ScaleIn } from "./MotionWrapper";
import SmartImage from "./SmartImage";

export default function SnowSchool() {
  const featured = courses.find((c) => c.featured) ?? courses[0];
  const rest = courses.filter((c) => c.slug !== featured.slug).slice(0, 3);

  return (
    <section className="relative bg-gradient-to-b from-emerald-50/40 via-background to-sky-50/40 py-section">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeUp>
          <div className="flex items-center gap-3">
            <span className="h-[2px] w-8 bg-secondary" aria-hidden />
            <span className="font-nav text-xs font-bold uppercase tracking-[0.3em] text-secondary">
              DEC – MAR · WINTER
            </span>
          </div>
          <h2 className="mt-4 font-heading text-3xl font-bold leading-snug text-foreground sm:text-4xl md:text-display-lg">
            The Auli Snow School
          </h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-foreground/70 sm:text-lg">
            Skiing, snowboarding, and backcountry courses under Nanda Devi.
            Certified instructors, 6:1 ratios, and a completion certificate.
          </p>
          <Link
            href="/courses"
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-secondary transition-colors hover:text-secondary/80"
          >
            All courses
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </FadeUp>

        {/* Featured course */}
        <ScaleIn className="mt-10">
          <Link
            href={`/courses/${featured.slug}`}
            className="group grid overflow-hidden rounded-3xl border border-white/20 bg-slate-950 text-white shadow-2xl shadow-black/20 transition-all hover:shadow-black/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary lg:grid-cols-2"
          >
            <div className="relative min-h-[320px] overflow-hidden">
              <SmartImage
                src={featured.image}
                alt={featured.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col p-6 lg:p-8">
              <span className="inline-flex w-fit rounded-full bg-secondary/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-sky-300">
                {featured.type}
              </span>
              <h3 className="mt-4 font-heading text-2xl font-bold leading-tight lg:text-3xl">
                {featured.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                {featured.shortDescription}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-white/5 px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-white/50">
                    Level
                  </p>
                  <p className="font-semibold">{featured.level}</p>
                </div>
                <div className="rounded-xl bg-white/5 px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-white/50">
                    Duration
                  </p>
                  <p className="font-semibold">{featured.duration}</p>
                </div>
                <div className="rounded-xl bg-white/5 px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-white/50">
                    Dates
                  </p>
                  <p className="font-semibold">{featured.dates}</p>
                </div>
                <div className="rounded-xl bg-white/5 px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-white/50">
                    From
                  </p>
                  <p className="font-semibold">
                    {featured.currency}
                    {featured.price.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
              {(featured.instructorRatio || featured.weeklyHours) && (
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/60">
                  {featured.instructorRatio && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                      {featured.instructorRatio}
                    </span>
                  )}
                  {featured.weeklyHours && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                      {featured.weeklyHours}
                    </span>
                  )}
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    Completion certificate
                  </span>
                </div>
              )}
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-sky-300 group-hover:underline">
                Book this course
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </span>
            </div>
          </Link>
        </ScaleIn>

        {/* Secondary courses */}
        {rest.length > 0 && (
          <StaggerContainer
            className="mt-8 grid gap-6 sm:grid-cols-3"
            staggerDelay={0.06}
          >
            {rest.map((course) => (
              <StaggerItem key={course.slug}>
                <Link
                  href={`/courses/${course.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <SmartImage
                      src={course.image}
                      alt={course.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-foreground">
                      {course.type}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h4 className="font-heading text-base font-semibold leading-tight text-foreground">
                      {course.name}
                    </h4>
                    <p className="mt-1 text-xs text-muted">
                      {course.duration} · {course.level}
                    </p>
                    <div className="mt-auto flex items-center justify-between border-t border-foreground/10 pt-3">
                      <span className="text-sm font-bold text-foreground">
                        {course.currency}
                        {course.price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs font-semibold text-secondary group-hover:underline">
                        View →
                      </span>
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </section>
  );
}
