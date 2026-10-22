"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { faqItems } from "@/data/treks";
import { FadeUp, StaggerContainer, StaggerItem } from "./MotionWrapper";
import { Input } from "@/components/ui/input";
import { transition } from "@/lib/motion";

function FAQItem({ faq, isOpen, onToggle }: { faq: (typeof faqItems)[0]; isOpen: boolean; onToggle: () => void }) {
  const reduce = useReducedMotion();
  return (
    <div className="border-t border-foreground/15">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="group flex min-h-14 w-full items-start justify-between gap-6 py-5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <span className="font-heading text-xl font-medium leading-snug tracking-[-0.01em] text-foreground group-hover:text-primary md:text-2xl">
          {faq.q}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={reduce ? { duration: 0 } : transition("fast")}
          className={`mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center ${isOpen ? "text-primary" : "text-foreground"}`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </motion.span>
      </button>

      {/* initial={false}: the answer open on first render is in the HTML at full opacity */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={transition("base", "inOut")}
            className="overflow-hidden"
          >
            <p className="max-w-2xl pb-6 pr-10 text-base leading-relaxed text-muted">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQV2() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqItems;
    const query = searchQuery.toLowerCase();
    return faqItems.filter(
      (faq) =>
        faq.q.toLowerCase().includes(query) ||
        faq.a.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <section className="bg-background py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
        <FadeUp className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <p className="sr-only">FAQ</p>
            <h2 className="font-heading text-4xl font-medium leading-[1.04] tracking-[-0.025em] text-foreground sm:text-5xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 max-w-xs text-base leading-relaxed text-muted">
              Find answers to common questions about our trekking services
            </p>

            {/* Search */}
            <div className="relative mt-6">
              <svg className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <Input
                type="text"
                placeholder="Search questions..."
                aria-label="Search questions"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pl-12"
              />
            </div>
          </div>
        </FadeUp>

        {/* FAQ List */}
        <StaggerContainer className="border-b border-foreground/15 lg:col-span-8" staggerDelay={0.05}>
          {filteredFaqs.map((faq, i) => (
            <StaggerItem key={i}>
              <FAQItem
                faq={faq}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            </StaggerItem>
          ))}
          {filteredFaqs.length === 0 && (
            <div className="border-t border-foreground/15 py-12 text-muted">
              No questions match your search. Try a different term.
            </div>
          )}
        </StaggerContainer>
      </div>
    </section>
  );
}
