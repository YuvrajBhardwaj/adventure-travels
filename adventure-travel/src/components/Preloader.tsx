"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export default function Preloader() {
  const [loading, setLoading] = useState(true);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [reduceMotion]);

  if (reduceMotion || !loading) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-gradient-to-b from-emerald-900 via-emerald-800 to-gray-900"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wider mb-1">
            HIMALAYAN ARC
          </h1>
          <p className="text-emerald-300/60 text-sm tracking-[0.3em] uppercase">Adventure</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
