"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FadeUp } from "./MotionWrapper";

gsap.registerPlugin(ScrollTrigger);

const regions = [
  {
    id: "uttarakhand",
    name: "Uttarakhand",
    treks: 13,
    highlights: ["Valley of Flowers", "Kedarkantha", "Brahmatal"],
    color: "#10B981",
    path: "M150,80 L200,60 L250,80 L280,120 L260,160 L220,180 L180,170 L150,130 Z",
    labelX: 210,
    labelY: 120,
  },
  {
    id: "himachal",
    name: "Himachal Pradesh",
    treks: 2,
    highlights: ["Hampta Pass", "Pangarchula Peak"],
    color: "#0EA5E9",
    path: "M80,100 L140,70 L180,90 L200,130 L180,160 L140,170 L100,150 L80,120 Z",
    labelX: 140,
    labelY: 120,
  },
  {
    id: "garhwal",
    name: "Garhwal Region",
    treks: 10,
    highlights: ["Roopkund", "Har Ki Dun", "Kuari Pass"],
    color: "#F59E0B",
    path: "M200,50 L260,30 L310,50 L330,100 L310,140 L260,160 L220,150 L200,100 Z",
    labelX: 260,
    labelY: 95,
  },
  {
    id: "kumaon",
    name: "Kumaon Region",
    treks: 5,
    highlights: ["Pindari Glacier", "Milam Glacier", "Nanda Devi"],
    color: "#8B5CF6",
    path: "M260,40 L320,20 L370,40 L390,90 L370,130 L320,150 L280,140 L260,90 Z",
    labelX: 320,
    labelY: 85,
  },
];

export default function HimalayanMap() {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const mapWrapRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    if (!mapRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        mapRef.current,
        { rotateX: 0, rotateY: -5, transformPerspective: 1200 },
        {
          rotateX: 12,
          rotateY: 5,
          ease: "none",
          scrollTrigger: {
            trigger: mapWrapRef.current,
            start: "top 80%",
            end: "bottom 20%",
            scrub: 1,
          },
        }
      );
    }, mapWrapRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="py-section-sm bg-gradient-to-b from-background/70 via-background/40 to-accent/10 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <span className="font-nav text-xs font-bold uppercase tracking-[0.3em] text-accent">Explore</span>
          <h2 className="mt-3 sm:mt-4 font-heading text-2xl sm:text-3xl md:text-display-lg font-bold text-foreground leading-tight">
            Interactive Himalayan Map
          </h2>
          <p className="mt-3 text-base sm:text-lg text-muted leading-relaxed">
            Tap or hover over a region to discover trekking destinations in the Indian Himalayas.
          </p>
        </FadeUp>

        <div ref={mapWrapRef} className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-center">
          {/* Map SVG */}
          <FadeUp className="lg:col-span-2">
            <div ref={mapRef} className="relative bg-white dark:bg-card rounded-3xl p-8 shadow-lg shadow-black/5 border border-gray-100 dark:border-white/10" style={{ transformStyle: "preserve-3d" }}>
              <svg viewBox="0 0 450 250" className="w-full h-auto">
                {/* Background Grid */}
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-100 dark:text-white/5" />
                  </pattern>
                </defs>
                <rect width="450" height="250" fill="url(#grid)" />

                {/* Regions */}
                {regions.map((region) => (
                  <g key={region.id}>
                    <path
                      d={region.path}
                      fill={hoveredRegion === region.id ? region.color : `${region.color}33`}
                      stroke={region.color}
                      strokeWidth={hoveredRegion === region.id ? 3 : 1.5}
                      className="cursor-pointer transition-all duration-300 focus:outline-none"
                      tabIndex={0}
                      role="button"
                      aria-label={`${region.name}: ${region.treks} treks`}
                      onMouseEnter={() => setHoveredRegion(region.id)}
                      onMouseLeave={() => setHoveredRegion(null)}
                      onFocus={() => setHoveredRegion(region.id)}
                      onBlur={() => setHoveredRegion(null)}
                      onClick={() => setHoveredRegion(region.id)}
                    />
                    <text
                      x={region.labelX}
                      y={region.labelY}
                      textAnchor="middle"
                      className="text-xs font-semibold fill-foreground pointer-events-none"
                      style={{ fontSize: hoveredRegion === region.id ? "12px" : "10px" }}
                    >
                      {region.name}
                    </text>
                    <text
                      x={region.labelX}
                      y={region.labelY + 14}
                      textAnchor="middle"
                      className="text-[8px] fill-muted pointer-events-none"
                    >
                      {region.treks} treks
                    </text>
                  </g>
                ))}

                {/* Mountain Icons */}
                <g opacity="0.3">
                  <path d="M100,50 L110,30 L120,50 Z" fill="#10B981" />
                  <path d="M300,40 L315,15 L330,40 Z" fill="#0EA5E9" />
                  <path d="M350,60 L360,40 L370,60 Z" fill="#F59E0B" />
                </g>
              </svg>

              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                {regions.map((region) => (
                  <div key={region.id} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: region.color }} />
                    <span className="text-xs text-muted">{region.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>

          {/* Region Info Panel */}
          <FadeUp delay={0.2} className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {hoveredRegion ? (
                <motion.div
                  key={hoveredRegion}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-card rounded-3xl p-6 shadow-lg shadow-black/5 border border-gray-100 dark:border-white/10"
                >
                  {(() => {
                    const region = regions.find((r) => r.id === hoveredRegion);
                    if (!region) return null;
                    return (
                      <>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${region.color}20` }}>
                            <svg className="h-5 w-5" style={{ color: region.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-heading font-bold text-foreground">{region.name}</h3>
                            <p className="text-sm text-muted">{region.treks} treks available</p>
                          </div>
                        </div>

                        <div className="space-y-2 mb-6">
                          {region.highlights.map((trek) => (
                            <div key={trek} className="flex items-center gap-2 text-sm text-muted">
                              <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                              {trek}
                            </div>
                          ))}
                        </div>

                        <Link
                          href="/treks"
                          className="block text-center w-full bg-primary text-white font-semibold rounded-xl px-6 py-3 hover:bg-primary/90 transition-all"
                        >
                          Explore {region.name} Treks
                        </Link>
                      </>
                    );
                  })()}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white dark:bg-card rounded-3xl p-6 shadow-lg shadow-black/5 border border-gray-100 dark:border-white/10 text-center"
                >
                  <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <svg className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  </div>
                  <h3 className="font-heading font-bold text-foreground mb-2">Select a Region</h3>
                  <p className="text-sm text-muted">Tap or hover over any region on the map to see available treks and highlights.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
