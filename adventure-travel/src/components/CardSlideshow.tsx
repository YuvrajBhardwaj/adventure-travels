"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const FADE_MS = 700;

/** A stable 0–899 ms offset per card, so cards in a row don't all change photo on the same beat. */
function offsetFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h) % 900;
}

/**
 * A card's photos, cross-fading every `interval` ms (default 1.8 s) with a slow zoom, while the card
 * is on screen. The first photo is an ordinary image in the static HTML; each next photo is only
 * fetched one step ahead, and the change waits until it has loaded. One photo, or reduced motion:
 * a still image. Fills its positioned parent.
 */
export default function CardSlideshow({
  images,
  alt,
  interval = 1800,
  className,
}: {
  images: string[];
  alt: string;
  interval?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const ready = useRef(new Set<number>());
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState(1);
  const [onScreen, setOnScreen] = useState(false);
  const [retry, setRetry] = useState(0);
  const cycles = images.length > 1 && !reduce;

  useEffect(() => {
    const el = ref.current;
    if (!cycles || !el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setOnScreen(entry.isIntersecting);
        // On screen: fetch the second photo now, so it has the whole first interval to load.
        if (entry.isIntersecting) setMounted((m) => Math.max(m, 2));
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [cycles]);

  useEffect(() => {
    if (!cycles || !onScreen) return;
    const next = (index + 1) % images.length;
    const wait = (index === 0 && retry === 0 ? offsetFor(images[0]) : 0) + interval;
    const t = setTimeout(() => {
      if (document.hidden || !ready.current.has(next)) {
        setRetry((r) => r + 1);
        return;
      }
      setIndex(next);
      // Fetch the photo after it, so it has the whole interval to load.
      setMounted((m) => Math.max(m, Math.min(next + 2, images.length)));
    }, wait);
    return () => clearTimeout(t);
  }, [cycles, onScreen, index, retry, images, interval]);

  const running = cycles && onScreen;

  return (
    <div ref={ref} className={cn("absolute inset-0 overflow-hidden", className)}>
      {images.slice(0, Math.max(mounted, 1)).map((src, i) => {
        const active = i === index;
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt={i === 0 ? alt : ""}
            aria-hidden={i === 0 ? undefined : true}
            loading={i === 0 ? "lazy" : "eager"}
            decoding="async"
            ref={(img) => {
              if (img?.complete && img.naturalWidth) ready.current.add(i);
            }}
            onLoad={() => ready.current.add(i)}
            className="absolute inset-0 h-full w-full object-cover ease-out will-change-[opacity,transform]"
            style={{
              opacity: active ? 1 : 0,
              transform: `scale(${active && running ? 1.08 : 1})`,
              // Fade in/out; the zoom runs across the photo's whole turn, and resets only once it is hidden.
              transitionProperty: "opacity, transform",
              transitionDuration: active ? `${FADE_MS}ms, ${interval + FADE_MS * 2}ms` : `${FADE_MS}ms, 0ms`,
              transitionDelay: active ? "0ms, 0ms" : `0ms, ${FADE_MS}ms`,
            }}
          />
        );
      })}
    </div>
  );
}
