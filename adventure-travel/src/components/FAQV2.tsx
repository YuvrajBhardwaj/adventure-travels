"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { faqItems } from "@/data/treks";
import { FadeUp, StaggerContainer, StaggerItem } from "./MotionWrapper";

function FAQItem({ faq, isOpen, onToggle }: { faq: (typeof faqItems)[0]; isOpen: boolean; onToggle: () => void }) {
  return (
    <motion.div
      whileHover={{ x: 4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`rounded-2xl overflow-hidden transition-colors duration-200 ${
        isOpen ? "bg-primary/5 border border-primary/10" : "bg-white dark:bg-card border border-gray-100 dark:border-white/10"
      }`}
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <span className="font-heading text-base md:text-lg font-semibold text-foreground pr-4">
          {faq.q}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
            isOpen ? "bg-primary text-white" : "bg-surface text-foreground"
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="px-6 pb-6">
              <p className="text-muted leading-relaxed">{faq.a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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
    <section className="py-section px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <FadeUp className="text-center mb-12">
          <span className="font-nav text-xs font-bold uppercase tracking-[0.3em] text-accent">FAQ</span>
          <h2 className="mt-4 font-heading text-display-lg font-bold text-foreground leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-muted leading-relaxed">
            Find answers to common questions about our trekking services
          </p>
        </FadeUp>

        {/* Search */}
        <FadeUp delay={0.1} className="mb-8">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-card border border-gray-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-4 text-foreground placeholder-muted outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-muted"
            >
              No questions match your search. Try a different term.
            </motion.div>
          )}
        </StaggerContainer>
      </div>
    </section>
  );
}
