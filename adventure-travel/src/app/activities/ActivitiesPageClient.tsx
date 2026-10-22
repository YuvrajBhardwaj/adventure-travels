"use client";

import Link from "next/link";
import SmartImage from "@/components/SmartImage";
import CampingSection from "@/components/CampingSection";
import ActivityRequestForm from "@/components/ActivityRequestForm";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/MotionWrapper";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const activities = [
  {
    id: "trekking",
    name: "Trekking",
    tagline: "Walk the Himalayas",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
    description: "From gentle valley walks to challenging high-altitude expeditions, discover 17 handcrafted treks across Uttarakhand and Himachal Pradesh.",
    features: [
      "Valley of Flowers — 6 days through alpine meadows",
      "Kedarkantha — perfect beginner winter summit",
      "Roopkund — mysterious high-altitude lake trek",
      "Har Ki Dun — ancient valley with panoramic peaks",
    ],
    stats: { treks: "9+", difficulty: "Easy to Expert", duration: "4-12 Days" },
    cta: { label: "Explore Treks", href: "/treks" },
  },
  {
    id: "camping",
    name: "Camping",
    tagline: "Under the Himalayan stars",
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80",
    description: "Riverside camps in Rishikesh, mountain camps in Uttarakhand, and basecamp setups for treks. Sleep under a billion stars.",
    features: [
      "Rishikesh riverside camps with bonfires",
      "Mountain basecamp experiences",
      "Swiss tents with modern amenities",
      "Stargazing & nature walks",
    ],
    stats: { locations: "5+", type: "Riverside & Mountain", season: "Year-round" },
    cta: { label: "View Camps", href: "/contact" },
  },
  {
    id: "paragliding",
    name: "Paragliding",
    tagline: "Soar over the valleys",
    image: "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=800&q=80",
    description: "Tandem paragliding flights in Bir Billing and Mussoorie. Experience the Himalayas from above with certified pilots.",
    features: [
      "Tandem flights for beginners",
      "Certified & experienced pilots",
      "GoPro footage included",
      "Bir Billing — world's best site",
    ],
    stats: { duration: "15-30 min", altitude: "2,000m+", location: "Bir & Mussoorie" },
    cta: { label: "Book Flight", href: "/contact" },
  },
];

// The restricted-area places (Inner Line Permit). The first one also supplies the number in the page header.
const RESTRICTED = [
  {
    slug: "mana-pass",
    name: "Mana Pass",
    altitude: "5,616m",
    region: "Chamoli, Uttarakhand",
    description: "India's highest motorable pass. Ancient Indo-Tibetan trade route. Raw, desolate, breathtaking.",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
    status: "Restricted — ILP Required",
  },
  {
    slug: "niti-pass",
    name: "Niti Pass",
    altitude: "5,360m",
    region: "Chamoli, Uttarakhand",
    description: "Ancient Himalayan trade route at the Indo-Tibetan border. Pristine glacial landscapes untouched by tourism.",
    image: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=600&q=80",
    status: "Restricted — ILP Required",
  },
  {
    slug: "rimkhim",
    name: "Rimkhim",
    altitude: "4,500m+",
    region: "Chamoli, Uttarakhand",
    description: "Remote border village near the Tibet frontier. Untouched wilderness, zero crowds, pure Himalayan solitude.",
    image: "https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=600&q=80",
    status: "Restricted — ILP Required",
  },
];

// Skills Academy tracks: three levels per track, shown as coloured dots (beginner / intermediate / advanced).
const LEVEL_DOTS = ["bg-emerald-500", "bg-sky-500", "bg-red-500"];

const H2 = "font-heading text-3xl font-semibold tracking-[-0.02em] sm:text-4xl";
const CONTAINER = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";
const ZOOM = "transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100";
const HAIRLINE = "border-slate-200 dark:border-white/10";

const waLink = (text: string) => `https://wa.me/917817912062?text=${encodeURIComponent(text)}`;

export default function ActivitiesPage() {
  const hero = RESTRICTED[0];
  const [featured, ...others] = activities.filter((act) => act.id !== "camping");
  const [placeFeature, ...placeRest] = RESTRICTED;

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      {/* Header — split: words on the left, one tall photo on the right */}
      <section className="bg-navy-hero text-white">
        <div className={cn(CONTAINER, "grid items-end gap-10 pb-12 pt-28 sm:pt-32 lg:grid-cols-12 lg:gap-14 lg:pb-20 lg:pt-36")}>
          <div className="lg:col-span-6">
            <p className="mb-5 text-sm text-white/70">Choose Your Adventure</p>
            <h1 className="font-heading text-6xl font-semibold leading-[0.98] tracking-[-0.03em] sm:text-7xl lg:text-8xl">
              Activities
            </h1>
            <p className="mt-6 max-w-lg text-lg text-white/80">
              From Himalayan treks to snow-covered slopes, riverside camps to tandem flights — find your perfect adventure in the Indian Himalayas.
            </p>
            <div className="mt-10 border-t border-white/20 pt-5">
              <p className="font-heading text-5xl font-semibold leading-none tracking-[-0.03em] sm:text-6xl">{hero.altitude}</p>
              <p className="mt-2 text-sm text-white/70">
                {hero.name} <span aria-hidden className="mx-1.5 text-white/40">·</span> {hero.region}
              </p>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-navy lg:col-span-6 lg:aspect-[5/4]">
            <SmartImage
              src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80"
              alt="Activities Banner"
              loading="eager"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Skiing & Snowboarding feature */}
      <section id="skiing" className="bg-sky-50 dark:bg-card">
        <div className={cn(CONTAINER, "grid items-center gap-8 pb-12 pt-14 md:pt-20 lg:grid-cols-12 lg:gap-14")}>
          <FadeUp className="lg:col-span-7">
            <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-navy">
              <SmartImage
                src="/assets/skiing/IMG_5035.JPG.jpeg"
                alt="Snowboarding the powder slopes of Auli"
                className={cn("h-full w-full object-cover", ZOOM)}
              />
            </div>
            {/* Backcountry secondary image */}
            <figure className="mt-3 flex items-center gap-3">
              <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-navy">
                <SmartImage
                  src="https://plus.unsplash.com/premium_photo-1754337730608-59a489f3c9fd?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Backcountry Ski & Snowboard Touring in the Himalayas"
                  className="h-full w-full object-cover"
                />
              </div>
              <figcaption className="text-sm text-muted">Backcountry</figcaption>
            </figure>
          </FadeUp>

          <FadeUp delay={0.08} className="lg:col-span-5">
            <p className="text-sm text-sky-800 dark:text-sky-300">Skiing &amp; Snowboarding · Auli</p>
            <h2 className="mt-3 font-heading text-4xl font-semibold leading-[1.05] tracking-[-0.025em] text-foreground md:text-5xl">
              Enjoy the Journey
            </h2>
            <p className="mt-5 text-lg font-medium text-foreground">
              Certified 7-day courses on the powder slopes of Auli.
            </p>
            <p className="mt-3 max-w-lg text-base text-muted">
              Learn to ski or snowboard with certified instructors — complete equipment provided,
              from beginner nursery slopes to intermediate runs, all beneath the gaze of Nanda Devi.
            </p>
            <div className="mt-8">
              <Link href="/courses" className={cn(buttonVariants({ size: "lg" }), "group px-7")}>
                View Courses
                <svg className="h-4 w-4 transition-transform duration-150 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </FadeUp>
        </div>

        {/* Skills Academy — a ruled list, one track per row */}
        <div id="skills-academy" className={cn(CONTAINER, "pb-16 md:pb-24")}>
          <FadeUp className="mb-8 max-w-2xl sm:mb-10">
            <h2 className={cn(H2, "text-foreground")}>Skills Academy</h2>
            <p className="mt-4 text-lg text-muted">
              From first-timers to seasoned adventurers — structured progression tracks taught by certified mountain guides. Learn at your pace, earn your level.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-foreground">
              <span className="flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500"></span> Beginner</span>
              <span className="flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 rounded-full bg-sky-500"></span> Intermediate</span>
              <span className="flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500"></span> Advanced</span>
            </div>
          </FadeUp>

          <StaggerContainer className={cn("divide-y border-y", HAIRLINE, "divide-slate-200 dark:divide-white/10")}>
            {[
              {
                key: "ski",
                title: <Link href="/courses/skiing-course" className="underline-offset-4 hover:underline">Alpine Skiing</Link>,
                sub: "Auli · 7-day certified course",
                levels: ["Snowplough", "Parallel Turns", "Off-Piste"],
                text: "Master stance, balance, and stopping on nursery slopes. Progress through linked turns to chairlift runs with an instructor at your side.",
                price: <>From ₹10,000 <span className="text-xs font-normal text-muted">/ 7 days</span></>,
                actions: (
                  <>
                    <Link href="/courses" className={buttonVariants()}>View Course</Link>
                    <a href={waLink("Hi! I'm interested in the Skiing course in Auli.")} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-400">Book</a>
                  </>
                ),
              },
              {
                key: "board",
                title: <Link href="/courses/snowboarding-course" className="underline-offset-4 hover:underline">Snowboarding</Link>,
                sub: "Auli · 7-day certified course",
                levels: ["Balance & Sliding", "Heel/Toe Turns", "Freestyle Basics"],
                text: "From first slides to linking turns on blue runs. Build confidence with progressive coaching and all equipment included.",
                price: <>₹35,000 <span className="text-xs font-normal text-muted">/ 7 days</span></>,
                actions: (
                  <>
                    <Link href="/courses" className={buttonVariants()}>View Course</Link>
                    <a href={waLink("Hi! I'm interested in the Snowboarding course in Auli.")} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-400">Book</a>
                  </>
                ),
              },
              {
                key: "climb",
                title: "Rock Climbing",
                sub: "Rishikesh & Himalayas · Day courses",
                levels: ["Top-Rope Basics", "Lead Climbing", "Multi-Pitch"],
                text: "Learn belaying, footwork, and route reading on natural rock. Progress from gym-style top-rope to outdoor multi-pitch routes.",
                price: <>₹5,000+ <span className="text-xs font-normal text-muted">/ session</span></>,
                actions: (
                  <a href={waLink("Hi! I'm interested in rock climbing courses.")} target="_blank" rel="noopener noreferrer" className={buttonVariants()}>Enquire</a>
                ),
              },
            ].map((t) => (
              <StaggerItem key={t.key}>
                <div className="grid gap-5 py-8 lg:grid-cols-12 lg:gap-10">
                  <div className="lg:col-span-4">
                    <h3 className="font-heading text-2xl font-semibold text-foreground">{t.title}</h3>
                    <p className="mt-1 text-sm text-muted">{t.sub}</p>
                  </div>
                  <div className="lg:col-span-5">
                    <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm font-medium text-foreground">
                      {t.levels.map((l, i) => (
                        <li key={l} className="flex items-center gap-2">
                          <span className={cn("inline-block h-2.5 w-2.5 rounded-full", LEVEL_DOTS[i])} />
                          {l}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-sm text-muted">{t.text}</p>
                  </div>
                  <div className="flex flex-col gap-3 lg:col-span-3 lg:items-end">
                    <p className="font-heading text-xl font-semibold text-foreground">{t.price}</p>
                    <div className="flex flex-wrap items-center gap-2">{t.actions}</div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Camping — detailed section (anchor target for #camping) */}
      <div id="camping" className="scroll-mt-24">
        <CampingSection />
      </div>

      {/* Trekking leads; the rest follow as a quieter list */}
      <section className="py-section-sm">
        <div className={CONTAINER}>
          <FadeUp className="mb-10 max-w-2xl sm:mb-14">
            <h2 className={cn(H2, "text-foreground")}>What Adventure Calls You?</h2>
            <p className="mt-4 text-lg text-muted">
              Every activity is guided, insured, and designed for unforgettable experiences. Pick your passion — we handle the rest.
            </p>
          </FadeUp>

          {/* Feature */}
          <FadeUp>
            <div id={featured.id} className="group grid items-center gap-8 lg:grid-cols-12 lg:gap-14">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-navy lg:col-span-7">
                <SmartImage src={featured.image} alt={featured.name} className={cn("h-full w-full object-cover", ZOOM)} />
              </div>
              <div className="lg:col-span-5">
                <h3 className="font-heading text-4xl font-semibold tracking-[-0.025em] text-foreground sm:text-5xl">{featured.name}</h3>
                <p className="mt-2 text-base text-muted">{featured.tagline}</p>
                <p className="mt-5 text-base leading-relaxed text-foreground/80">{featured.description}</p>
                <ul className={cn("mt-6 divide-y border-y text-sm text-foreground/80", HAIRLINE, "divide-slate-200 dark:divide-white/10")}>
                  {featured.features.map((f) => (
                    <li key={f} className="py-2.5">{f}</li>
                  ))}
                </ul>
                <p className="mt-5 text-sm text-muted">
                  {Object.values(featured.stats).map((val, i) => (
                    <span key={val}>
                      {i > 0 && <span aria-hidden className="mx-2 text-slate-300">·</span>}
                      {val}
                    </span>
                  ))}
                </p>
                <Link href={featured.cta.href} className={cn(buttonVariants({ size: "lg" }), "group/cta mt-6 px-6")}>
                  {featured.cta.label}
                  <svg className="h-4 w-4 transition-transform duration-150 ease-out group-hover/cta:translate-x-0.5 motion-reduce:transition-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </FadeUp>

          {/* The rest — quieter rows */}
          <div className={cn("mt-14 divide-y border-t", HAIRLINE, "divide-slate-200 dark:divide-white/10")}>
            {others.map((act) => (
              <FadeUp key={act.id}>
                <div id={act.id} className="group grid gap-5 py-8 md:grid-cols-12 md:gap-8">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-navy md:col-span-4">
                    <SmartImage src={act.image} alt={act.name} className={cn("h-full w-full object-cover", ZOOM)} />
                  </div>
                  <div className="md:col-span-8">
                    <h3 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">{act.name}</h3>
                    <p className="mt-1 text-sm text-muted">{act.tagline}</p>
                    <p className="mt-3 max-w-2xl text-base leading-relaxed text-foreground/80">{act.description}</p>
                    <ul className="mt-4 grid gap-x-8 gap-y-1.5 text-sm text-foreground/80 sm:grid-cols-2">
                      {act.features.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                    <p className="mt-4 text-sm text-muted">
                      {Object.values(act.stats).map((val, i) => (
                        <span key={val}>
                          {i > 0 && <span aria-hidden className="mx-2 text-slate-300">·</span>}
                          {val}
                        </span>
                      ))}
                    </p>
                    <Link href={act.cta.href} className={cn(buttonVariants(), "group/cta mt-5 px-6")}>
                      {act.cta.label}
                      <svg className="h-4 w-4 transition-transform duration-150 ease-out group-hover/cta:translate-x-0.5 motion-reduce:transition-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Restricted Border Treasures - ILP Section */}
      <section className="bg-navy-deep py-section-sm">
        <div className={CONTAINER}>
          <FadeUp className="mb-10 max-w-2xl sm:mb-14">
            <p className="mb-4 flex items-center gap-2 text-sm text-amber-300">
              <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              Inner Line Permit Required
            </p>
            <h2 className={cn(H2, "mb-4 text-white")}>Unlock Restricted Uttarakhand</h2>
            <p className="text-lg text-white/70">
              These forbidden border regions are off-limits without a permit. We handle the paperwork — you explore the unexplored.
            </p>
          </FadeUp>

          <StaggerContainer className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
            {[placeFeature, ...placeRest].map((place, i) => {
              const big = i === 0;
              return (
                <StaggerItem key={place.name} className={cn(big ? "lg:col-span-7 lg:row-span-2" : "lg:col-span-5")}>
                  <Link
                    href={`/treks/${place.slug}`}
                    className={cn(
                      "group relative block overflow-hidden rounded-2xl bg-navy",
                      big ? "h-96 lg:h-full lg:min-h-[28rem]" : "h-64"
                    )}
                  >
                    <SmartImage
                      src={place.image}
                      alt={place.name}
                      className={cn("absolute inset-0 h-full w-full object-cover", ZOOM)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

                    <svg className="absolute right-5 top-5 z-10 h-5 w-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>

                    {/* The description is always shown (no hover-only text on phones) */}
                    <div className="absolute inset-0 z-10 flex flex-col justify-end p-5 sm:p-6">
                      <span className="mb-2 text-xs text-amber-300">{place.status}</span>
                      <h3 className={cn("mb-1 font-heading font-semibold text-white", big ? "text-4xl" : "text-2xl")}>{place.name}</h3>
                      <p className="mb-2 text-sm text-white/70">
                        {place.altitude} <span aria-hidden className="mx-1.5 text-white/40">·</span> {place.region}
                      </p>
                      <p className="line-clamp-3 max-w-md text-sm leading-relaxed text-white/75">{place.description}</p>
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}
          </StaggerContainer>

          {/* Permit CTA */}
          <div className="mt-12 flex flex-col gap-5 border-t border-white/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-base font-semibold text-white">We handle the ILP permit for you</p>
              <p className="mt-1 text-sm text-white/65">Proper guidelines, hassle-free entry to restricted areas</p>
            </div>
            <a
              href="https://wa.me/917817912062?text=Hi!%20I'm%20interested%20in%20restricted%20area%20trekking%20(Mana/Niti/Rimkhim)."
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants(), "focus-visible:ring-offset-navy-deep")}
            >
              Get Permit Now
            </a>
          </div>
        </div>
      </section>

      {/* Why Our Activities Section — a plain data strip */}
      <section className="py-section-sm">
        <div className={CONTAINER}>
          <FadeUp className="mb-8 sm:mb-10">
            <h2 className={cn(H2, "text-foreground")}>Why Adventure With Us?</h2>
          </FadeUp>
          <dl className={cn("grid grid-cols-2 border-y md:grid-cols-4", HAIRLINE)}>
            {[
              { value: "5,000+", label: "Happy Adventurers" },
              { value: "100%", label: "Safety Record" },
              { value: "4.8/5", label: "Average Rating" },
              { value: "24/7", label: "Support" },
            ].map((stat, i) => (
              <div key={stat.label} className={cn("py-6 pr-4", i % 2 === 1 && "pl-4", i > 0 && "md:border-l md:pl-6", i >= 2 && "border-t md:border-t-0", HAIRLINE)}>
                <dd className="font-heading text-2xl font-semibold text-foreground">{stat.value}</dd>
                <dt className="mt-1 text-sm text-muted">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Saved to the customer's account; priced and confirmed by the team (FR-013) */}
      <ActivityRequestForm />

      {/* CTA Section */}
      <section className="bg-navy py-section-sm">
        <div className={CONTAINER}>
          <FadeUp className="max-w-2xl">
            <h2 className={cn(H2, "mb-5 text-white")}>Ready to Start Your Adventure?</h2>
            <p className="mb-8 text-lg text-white/80">
              Whether it&apos;s your first trek or your fiftieth, we&apos;ll make it unforgettable. Talk to our team to plan your perfect trip.
            </p>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-6">
              <Link href="/contact" className={cn(buttonVariants({ size: "lg" }), "px-8 focus-visible:ring-offset-navy")}>
                Plan My Trip
              </Link>
              <a
                href="https://wa.me/917817912062?text=Hi!%20I'm%20interested%20in%20an%20adventure."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center text-base font-semibold text-white underline underline-offset-4 hover:text-white/80"
              >
                Chat on WhatsApp
              </a>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
