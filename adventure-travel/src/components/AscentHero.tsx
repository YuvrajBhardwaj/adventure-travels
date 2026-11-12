"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Snowflake } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { treks } from "@/data/treks";
import Price from "@/components/Price";

// The pitch's facts come from the trek data, so they stay true when treks change.
const FROM_PRICE = Math.min(...treks.map((t) => t.price));
const MIN_DAYS = Math.min(...treks.map((t) => t.days));
const MAX_DAYS = Math.max(...treks.map((t) => t.days));
const TOP = Math.max(...treks.map((t) => t.maxAltitude));
const BASE = 1875; // Joshimath, where every group starts

/**
 * Home hero: our own Panpatia Col photo in three layers — the photo, a giant
 * "HIMALAYA" and the same photo's mountains cut out (public/assets/hero/ascent-fg.webp),
 * so the word sits behind the peaks. All three share one 4:3 "stage" that covers the
 * screen the way object-fit: cover would, so the word lines up with the ridge at any size.
 * The copy sits on the snowfield in dark ink. Visible from the first paint; scroll only
 * adds depth (each layer moves at its own speed), gated on reduced motion.
 */
export default function AscentHero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const skyY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const wordY = useTransform(scrollYProgress, [0, 1], ["0%", "34%"]);
  const ridgeY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  return (
    <section
      ref={ref}
      aria-labelledby="hero-heading"
      className="relative isolate h-[100svh] min-h-[640px] overflow-hidden bg-[#020617]"
    >
      {/* The stage: 4:3 like the photo, at least as wide and as tall as the hero. */}
      <div
        aria-hidden
        className="absolute left-1/2 top-[28%] aspect-[4/3] -translate-x-1/2 -translate-y-[28%] [container-type:inline-size]"
        style={{ width: "max(100%, calc(max(100svh, 640px) * 4 / 3))" }}
      >
        <motion.img
          src="/assets/hero/ascent-bg.webp"
          alt=""
          fetchPriority="high"
          decoding="async"
          style={reduce ? undefined : { y: skyY }}
          className="absolute inset-0 h-full w-full select-none"
        />
        <motion.span
          style={reduce ? undefined : { y: wordY }}
          className="absolute inset-x-0 bottom-[61%] block select-none text-center font-heading font-semibold leading-none tracking-[-0.045em] text-white [font-size:min(19cqw,20.5vw,30svh)] [text-shadow:0_2px_40px_rgba(2,6,23,0.35)]"
        >
          HIMALAYA
        </motion.span>
        <motion.img
          src="/assets/hero/ascent-fg.webp"
          alt=""
          decoding="async"
          style={reduce ? undefined : { y: ridgeY }}
          className="absolute inset-0 h-full w-full select-none"
        />
      </div>

      {/* Snow fades into the page, so the dark copy reads over rock and snow alike. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-background via-background/80 to-transparent"
      />

      {/* Copy: top line on the sky, the pitch on the snow. */}
      <motion.div
        style={reduce ? undefined : { y: copyY }}
        className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-between px-4 pb-8 pt-24 sm:px-6 sm:pb-10 lg:px-8"
      >
        <div className="flex items-start justify-between gap-4 font-nav text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75">
          <p>
            <span className="text-primary">●</span> Base · Joshimath {BASE.toLocaleString("en-IN")} m
          </p>
          <p className="hidden text-right sm:block">Highest route · {TOP.toLocaleString("en-IN")} m</p>
        </div>

        <div className="grid items-end gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h1
              id="hero-heading"
              className="font-heading text-[clamp(2.4rem,6vw,4.75rem)] font-semibold leading-[0.95] tracking-[-0.035em] text-navy-deep"
            >
              One range.
              <br />
              Two seasons.
            </h1>
            <p className="mt-4 max-w-lg text-base font-medium leading-relaxed text-slate-700 md:text-lg">
              Guided {MIN_DAYS}–{MAX_DAYS} day treks from <Price inr={FROM_PRICE} />, with permits, guide and meals
              included. Ski and snowboard courses at Auli in winter.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/treks" className={cn(buttonVariants({ size: "lg" }), "bg-navy-deep px-7 text-white hover:bg-navy")}>
                Browse treks
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/courses"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "border-navy-deep/25 bg-white/60 px-7 text-navy-deep backdrop-blur-sm hover:bg-white"
                )}
              >
                <Snowflake className="h-4 w-4" aria-hidden />
                Auli ski courses
              </Link>
            </div>
          </div>
          <dl className="hidden grid-cols-2 gap-x-8 gap-y-1 font-nav text-navy-deep lg:col-span-5 lg:grid lg:justify-self-end">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Treks</dt>
              <dd className="text-sm font-semibold">Jan – Dec</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Auli snow</dt>
              <dd className="text-sm font-semibold">Dec – Mar</dd>
            </div>
            <p className="col-span-2 mt-3 text-xs text-slate-500">Photo: on our Panpatia Col trek.</p>
          </dl>
        </div>
      </motion.div>
    </section>
  );
}
