"use client";

import Link from "next/link";
import { processSteps } from "@/data/treks";
import { FadeUp, StaggerContainer, StaggerItem } from "./MotionWrapper";

export default function HowItWorks() {
  return (
    <section className="relative bg-surface py-section">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeUp>
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-primary" aria-hidden />
            <span className="font-nav text-xs font-bold uppercase tracking-[0.3em] text-primary">
              HOW IT WORKS
            </span>
          </div>
          <h2 className="mt-4 font-heading text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-display-lg">
            From first idea to summit day
          </h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Five steps. We handle the logistics so you can focus on the climb.
          </p>
        </FadeUp>

        <div className="relative mt-12">
          {/* the "trail" connecting the steps — horizontal on desktop, vertical on mobile */}
          <span aria-hidden className="absolute left-6 top-6 bottom-6 w-px border-l-2 border-dashed border-primary/30 lg:hidden" />
          <span aria-hidden className="absolute left-6 right-[20%] top-6 hidden h-px border-t-2 border-dashed border-primary/30 lg:block" />

          <StaggerContainer className="relative grid gap-8 lg:grid-cols-5 lg:gap-6" staggerDelay={0.1}>
            {processSteps.map((step) => (
              <StaggerItem key={step.n}>
                <div className="relative flex gap-5 lg:block">
                  <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background font-heading text-sm font-bold text-primary shadow-sm">
                    {step.n}
                  </span>
                  <div className="lg:mt-5">
                    <h3 className="font-heading text-lg font-bold text-foreground">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{step.text}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>

        <FadeUp delay={0.15}>
          <div className="mt-12 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/treks"
              className="rounded-2xl bg-emerald-600 px-7 py-3.5 text-center text-base font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              Choose your route
            </Link>
            <Link
              href="/contact"
              className="rounded-2xl border border-foreground/15 bg-card px-7 py-3.5 text-center text-base font-semibold text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Ask us a question
            </Link>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
