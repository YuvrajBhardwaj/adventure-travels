"use client";

import { useEffect, useRef, useState, type VideoHTMLAttributes } from "react";

// ponytail: don't fetch below-fold videos until they're near the viewport,
// so thumbnails don't compete with the hero for bandwidth.
export default function LazyVideo({
  src,
  rootMargin = "400px",
  ...props
}: VideoHTMLAttributes<HTMLVideoElement> & { src: string; rootMargin?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    if (!("IntersectionObserver" in window)) {
      // Very old browsers: no way to wait for the viewport, so load straight away.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near, rootMargin]);

  return <video ref={ref} src={near ? src : undefined} {...props} />;
}
