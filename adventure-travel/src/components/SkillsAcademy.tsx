import Link from "next/link";
import type { ReactNode } from "react";
import { courses } from "@/data/courses";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/MotionWrapper";
import Price from "@/components/Price";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Three levels per track, shown as coloured dots (beginner / intermediate / advanced).
const LEVEL_DOTS = ["bg-emerald-500", "bg-sky-500", "bg-red-500"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

const waLink = (text: string) => `https://wa.me/917817912062?text=${encodeURIComponent(text)}`;
const priceOf = (slug: string) => courses.find((c) => c.slug === slug)?.price;
const bookLink = "inline-flex min-h-11 items-center px-2 text-sm font-semibold text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-400";

interface Track {
  key: string;
  title: ReactNode;
  sub: string;
  levels: string[];
  text: string;
  price: ReactNode;
  actions: ReactNode;
}

function courseTrack(key: string, slug: string, name: string, levels: string[], text: string): Track {
  const price = priceOf(slug);
  return {
    key,
    title: <Link href={`/courses/${slug}`} className="underline-offset-4 hover:underline">{name}</Link>,
    sub: "Auli · 7-day certified course",
    levels,
    text,
    price: price ? <>From <Price inr={price} /> <span className="text-xs font-normal text-muted">/ 7 days</span></> : null,
    actions: (
      <>
        <Link href={`/courses/${slug}`} className={buttonVariants()}>View Course</Link>
        <a href={waLink(`Hi! I'm interested in the ${name} course in Auli.`)} target="_blank" rel="noopener noreferrer" className={bookLink}>Book</a>
      </>
    ),
  };
}

const TRACKS: Track[] = [
  courseTrack(
    "ski",
    "skiing-course",
    "Alpine Skiing",
    ["Snowplough", "Parallel Turns", "Off-Piste"],
    "Learn stance, balance and stopping on nursery slopes. Progress through linked turns to chairlift runs with an instructor at your side.",
  ),
  courseTrack(
    "board",
    "snowboarding-course",
    "Snowboarding",
    ["Balance & Sliding", "Heel/Toe Turns", "Freestyle Basics"],
    "From first slides to linking turns on blue runs. Coaching builds up day by day, and all equipment is included.",
  ),
  {
    key: "climb",
    title: "Rock Climbing",
    sub: "Rishikesh & Himalayas · Day courses",
    levels: ["Top-Rope Basics", "Lead Climbing", "Multi-Pitch"],
    text: "Learn belaying, footwork, and route reading on natural rock. Progress from gym-style top-rope to outdoor multi-pitch routes.",
    price: <><Price inr={5000} />+ <span className="text-xs font-normal text-muted">/ session</span></>,
    actions: (
      <a href={waLink("Hi! I'm interested in rock climbing courses.")} target="_blank" rel="noopener noreferrer" className={buttonVariants()}>Enquire</a>
    ),
  },
];

/** Skills Academy: beginner → intermediate → advanced tracks. On the home page and /activities. */
export default function SkillsAcademy({ className }: { className?: string }) {
  return (
    <div id="skills-academy" className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", className)}>
      <FadeUp className="mb-8 max-w-2xl sm:mb-10">
        <h2 className="font-heading text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">Skills Academy</h2>
        <p className="mt-4 text-lg text-muted">
          For first-timers and experienced people alike: step-by-step tracks taught by certified mountain guides. Learn at your pace, earn your level.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-foreground">
          {LEVELS.map((l, i) => (
            <span key={l} className="flex items-center gap-2">
              <span className={cn("inline-block h-2.5 w-2.5 rounded-full", LEVEL_DOTS[i])} /> {l}
            </span>
          ))}
        </div>
      </FadeUp>

      <StaggerContainer className="divide-y divide-slate-200 border-y border-slate-200 dark:divide-white/10 dark:border-white/10">
        {TRACKS.map((t) => (
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
                      <span className={cn("inline-block h-2.5 w-2.5 rounded-full", LEVEL_DOTS[i])} aria-hidden />
                      <span className="sr-only">{LEVELS[i]}: </span>
                      {l}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-sm text-muted">{t.text}</p>
              </div>
              <div className="flex flex-col gap-3 lg:col-span-3 lg:items-end">
                {t.price && <p className="font-heading text-xl font-semibold text-foreground">{t.price}</p>}
                <div className="flex flex-wrap items-center gap-2">{t.actions}</div>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  );
}
