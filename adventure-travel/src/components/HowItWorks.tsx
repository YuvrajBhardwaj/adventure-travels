"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { processSteps, treks } from "@/data/treks";
import { ElevationLine } from "@/components/ElevationLine";
import { FadeUp } from "./MotionWrapper";

export default function HowItWorks() {
  // A real route's profile runs across the top of the steps: the plan is a climb.
  const route = [...treks].sort((a, b) => b.elevationProfile.length - a.elevationProfile.length)[0];

  return (
    <section className="relative bg-surface py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <p className="sr-only">HOW IT WORKS</p>
          <div className="grid gap-5 lg:grid-cols-12 lg:items-end">
            <h2 className="font-heading text-4xl font-medium leading-[1.04] tracking-[-0.025em] text-foreground sm:text-5xl lg:col-span-7 lg:text-6xl">
              From first idea to summit day
            </h2>
            <p className="max-w-sm text-base leading-relaxed text-muted lg:col-span-4 lg:col-start-9">
              Five steps. We handle the logistics so you can focus on the climb.
            </p>
          </div>
        </FadeUp>

        <div className="mt-12 hidden h-20 text-emerald-500 lg:block" aria-hidden>
          <ElevationLine profile={route.elevationProfile} peak strokeWidth={1.5} />
        </div>

        <ol className="mt-8 grid border-t border-foreground/20 lg:mt-0 lg:grid-cols-5 lg:border-t-0">
          {processSteps.map((step) => (
            <li
              key={step.n}
              className="grid grid-cols-[3.5rem_1fr] gap-x-4 border-b border-foreground/15 py-6 lg:block lg:border-b-0 lg:border-l lg:border-foreground/15 lg:px-5 lg:py-2 lg:first:border-l-0 lg:first:pl-0"
            >
              <span className="font-heading text-5xl font-normal leading-none tabular-nums text-foreground/30 lg:text-6xl">
                {step.n}
              </span>
              <div className="lg:mt-5">
                <h3 className="font-heading text-xl font-medium leading-tight text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <FadeUp delay={0.1}>
          <div className="mt-12 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-6">
            <Link href="/treks" className={cn(buttonVariants({ size: "lg" }), "px-7")}>
              Choose your route
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center text-sm font-semibold text-foreground underline decoration-foreground/30 decoration-2 underline-offset-[6px] transition-colors duration-150 ease-out hover:text-primary hover:decoration-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Ask us a question
            </Link>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
