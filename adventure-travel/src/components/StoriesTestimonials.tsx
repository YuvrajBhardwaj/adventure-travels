"use client";

import Link from "next/link";
import { stories } from "@/data/stories";
import { FadeUp } from "./MotionWrapper";
import SmartImage from "./SmartImage";
import { SwipeRail, RailItem } from "./SwipeRail";

export default function StoriesTestimonials() {
  const featuredStories = stories.slice(0, 3);
  const [firstStory, ...moreStories] = featuredStories;

  return (
    <section className="relative bg-card py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="sr-only">FROM THE TRAIL</p>
        <FadeUp>
          <h2 className="max-w-4xl font-heading text-4xl font-medium leading-[1.04] tracking-[-0.025em] text-foreground sm:text-5xl lg:text-6xl">
            Stories from the mountains
          </h2>
        </FadeUp>

        {/* Phones and tablets: stories as tall photo cards */}
        <div className="mt-10 lg:hidden">
          <p className="font-nav text-xs font-semibold uppercase tracking-[0.14em] text-muted">Stories</p>
          <SwipeRail label="Stories" className="mt-5">
            {featuredStories.map((story) => (
              <RailItem key={story.id}>
                <Link
                  href={story.href}
                  className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-3xl bg-navy p-5 text-white transition-transform duration-150 ease-out active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary motion-reduce:active:scale-100"
                >
                  <SmartImage
                    src={story.image}
                    alt={story.title}
                    className="absolute inset-0 z-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
                  />
                  <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/40 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 font-nav text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground shadow-sm">
                    {story.category}
                  </span>
                  <span className="relative">
                    <span className="block font-heading text-2xl font-medium leading-tight tracking-[-0.015em]">{story.title}</span>
                    <span className="mt-2 block font-nav text-xs text-white/70">
                      {story.author}
                    </span>
                  </span>
                </Link>
              </RailItem>
            ))}
          </SwipeRail>
        </div>

        {/* Stories: one large, two ruled rows */}
        <div className="mt-14 hidden gap-10 border-t border-foreground/20 pt-10 lg:mt-20 lg:grid lg:grid-cols-12 lg:gap-14">
          <Link
            href={firstStory.href}
            className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary lg:col-span-7"
          >
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-surface">
              <SmartImage
                src={firstStory.image}
                alt={firstStory.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            </div>
            <p className="font-nav mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-muted">{firstStory.category}</p>
            <h3 className="mt-2 font-heading text-3xl font-medium leading-tight tracking-[-0.02em] text-foreground group-hover:text-primary sm:text-4xl">
              {firstStory.title}
            </h3>
            <p className="mt-3 line-clamp-2 max-w-xl text-base leading-relaxed text-muted">{firstStory.excerpt}</p>
            <p className="font-nav mt-4 text-xs font-medium text-muted">
              {firstStory.author}
            </p>
          </Link>

          <ul className="lg:col-span-5">
            {moreStories.map((story, i) => (
              <li key={story.id} className={`py-6 first:pt-0 ${i < moreStories.length - 1 ? "border-b border-foreground/15" : ""}`}>
                <Link
                  href={story.href}
                  className="group flex gap-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  <span className="relative block h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-surface sm:h-32 sm:w-40">
                    <SmartImage
                      src={story.image}
                      alt={story.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                  </span>
                  <span className="block min-w-0">
                    <span className="font-nav block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{story.category}</span>
                    <h3 className="mt-1 font-heading text-xl font-medium leading-tight text-foreground group-hover:text-primary">
                      {story.title}
                    </h3>
                    <span className="mt-2 line-clamp-2 block text-sm leading-relaxed text-muted">{story.excerpt}</span>
                    <span className="font-nav mt-2 block text-xs text-muted">
                      {story.author}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
