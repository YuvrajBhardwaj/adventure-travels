"use client";

import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type SmartImageProps = React.ImgHTMLAttributes<HTMLImageElement>;

/**
 * Drop-in replacement for a plain <img> (research R8). The image is visible
 * from the first paint, with no wait for scripts; until it decodes, a shimmer
 * placeholder shows through underneath and the image simply covers it. The
 * placeholder is removed once the image has loaded, so long lists don't keep
 * animating. The parent must be positioned (`relative`) and sized, so space is
 * reserved and nothing shifts — every image wrapper in this app already is.
 *
 * We keep a native <img> (not next/image) to match the existing Unsplash-URL
 * pattern across the site; the lint rule is intentionally suppressed here only.
 *
 * The mount-time `complete` check covers images that decode during hydration,
 * before React attaches onLoad.
 */
export default function SmartImage({ className, alt = "", onLoad, onError, ...props }: SmartImageProps) {
  const [settled, setSettled] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete) setSettled(true);
  }, []);

  return (
    <>
      {!settled && <Skeleton className="absolute inset-0 z-0 rounded-none" />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        alt={alt}
        {...props}
        loading={props.loading ?? "lazy"}
        decoding={props.decoding ?? "async"}
        onLoad={(e) => {
          setSettled(true);
          onLoad?.(e);
        }}
        onError={(e) => {
          setSettled(true);
          onError?.(e);
        }}
        className={cn("relative z-[1]", className)}
      />
    </>
  );
}
