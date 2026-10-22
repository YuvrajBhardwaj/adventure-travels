"use client";

import Link from "next/link";
import { stories } from "@/data/stories";
import { testimonials } from "@/data/treks";
import { FadeUp } from "./MotionWrapper";
import SmartImage from "./SmartImage";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-amber-500" aria-label={`Rated ${rating} out of 5`}>
      {Array.from({ length: rating }).map((_, i) => (
        <svg key={i} className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function StoriesTestimonials() {
  const featuredStories = stories.slice(0, 3);
  const picks = testimonials.slice(0, 3);
  const [lead, ...others] = picks;
  const [firstStory, ...moreStories] = featuredStories;

  return (
    <section className="relative bg-card py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="sr-only">FROM THE TRAIL</p>
        <FadeUp>
          <h2 className="max-w-4xl font-heading text-4xl font-medium leading-[1.04] tracking-[-0.025em] text-foreground sm:text-5xl lg:text-6xl">
            Stories and words from the mountains
          </h2>
        </FadeUp>

        {/* Quote block: one voice large, two beside it */}
        <div className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-16">
          <FadeUp className="lg:col-span-8">
            <figure>
              <Stars rating={lead.rating} />
              <blockquote className="mt-5 font-heading text-[1.7rem] font-normal leading-[1.25] tracking-[-0.015em] text-foreground sm:text-4xl lg:text-[2.6rem]">
                &ldquo;{lead.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-foreground/15 pt-4">
                <span className="font-heading text-lg font-medium text-foreground">{lead.name}</span>
                <span className="font-nav text-sm text-muted">
                  {lead.role} · {lead.location}
                </span>
              </figcaption>
            </figure>
          </FadeUp>

          <div className="space-y-10 lg:col-span-4">
            {others.map((t) => (
              <FadeUp key={t.name}>
                <figure className="border-t border-foreground/20 pt-5">
                  <Stars rating={t.rating} />
                  <blockquote className="mt-3 text-base leading-relaxed text-foreground/85">&ldquo;{t.quote}&rdquo;</blockquote>
                  <figcaption className="mt-3">
                    <span className="font-heading text-base font-medium text-foreground">{t.name}</span>
                    <span className="font-nav block text-xs text-muted">
                      {t.role} · {t.location}
                    </span>
                  </figcaption>
                </figure>
              </FadeUp>
            ))}
          </div>
        </div>

        {/* Stories: one large, two ruled rows */}
        <div className="mt-20 grid gap-10 border-t border-foreground/20 pt-10 lg:mt-28 lg:grid-cols-12 lg:gap-14">
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
              {firstStory.author} · {firstStory.readTime} min read
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
                      {story.author} · {story.readTime} min read
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
