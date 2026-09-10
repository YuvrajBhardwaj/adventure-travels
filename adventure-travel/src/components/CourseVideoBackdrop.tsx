"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Fixed full-page cinematic video backdrop — the shared "experience" template
 * behind all course sub-pages. Original EHT design: looping muted footage,
 * mountain-dark scrim, static poster fallback for reduced-motion / video fail.
 */
export default function CourseVideoBackdrop({ video, poster }: { video: string; poster: string }) {
  const reduceMotion = useReducedMotion();
  const vidRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  // ponytail: poster-only on phones — a 44MB .MOV backdrop isn't worth the jank
  const [smallScreen, setSmallScreen] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const onChange = (e: MediaQueryListEvent) => setSmallScreen(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // ponytail: pause when tab hidden — saves battery, one line
  useEffect(() => {
    const v = vidRef.current;
    if (!v) return;
    const onVis = () => (document.hidden ? v.pause() : v.play().catch(() => {}));
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const showVideo = !reduceMotion && !failed && !smallScreen;

  return (
    <div className="fixed inset-0 z-0" aria-hidden>
      {/* poster under the video: instant paint, also the reduced-motion / error view */}
      <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" decoding="async" />
      {showVideo && (
        <video
          key={video}
          ref={vidRef}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}
          src={video}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onCanPlay={() => setReady(true)}
          onError={() => setFailed(true)}
        />
      )}
      {/* scrim: dark at top for the navbar, deepening to solid at the bottom for content */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/35 to-slate-950/85" />
    </div>
  );
}
