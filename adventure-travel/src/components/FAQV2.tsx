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
    <div
      className={`overflow-hidden rounded-2xl border transition-colors duration-200 ease-out ${
        isOpen ? "border-primary/10 bg-primary/5" : "border-slate-100 bg-white dark:border-white/10 dark:bg-card"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex min-h-11 w-full items-center justify-between rounded-2xl p-5 text-left sm:p-6"
      >
        <span className="pr-4 font-heading text-base font-semibold text-foreground md:text-lg">
          {faq.q}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={reduce ? { duration: 0 } : transition("fast")}
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-150 ease-out ${
            isOpen ? "bg-primary text-white" : "bg-surface text-foreground"
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </motion.div>
      </button>

      {/* initial={false}: the answer open on first render is in the HTML at full opacity */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={transition("base", "inOut")}
          >
            <div className="px-5 pb-5 sm:px-6 sm:pb-6">
              <p className="text-base leading-relaxed text-muted">{faq.a}</p>
            </div>
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
    <section className="py-section">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="mb-12 text-center">
          <span className="font-nav text-xs font-bold uppercase tracking-[0.3em] text-accent">FAQ</span>
          <h2 className="mt-4 font-heading text-3xl font-bold leading-tight tracking-[-0.02em] text-foreground sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">
            Find answers to common questions about our trekking services
          </p>
        </FadeUp>

        {/* Search */}
        <FadeUp delay={0.1} className="mb-8">
          <div className="relative">
            <svg className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-12"
            />
          </div>
        </FadeUp>

        {/* FAQ List */}
        <StaggerContainer className="space-y-3" staggerDelay={0.05}>
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
            <div className="py-12 text-center text-muted">
              No questions match your search. Try a different term.
            </div>
          )}
        </StaggerContainer>
      </div>
    </section>
  );
}
