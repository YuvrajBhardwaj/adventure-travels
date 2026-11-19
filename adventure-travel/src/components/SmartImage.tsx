"use client";

import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type SmartImageProps = React.ImgHTMLAttributes<HTMLImageElement>;

/**
 * Our own photos in /assets/ (not the hand-cut hero layers) have a phone-sized copy, name.800.jpeg,
 * written by scripts/prepare-photos.mjs. Returns the srcset for them, else undefined.
 */
export function photoSrcSet(src: unknown) {
  if (typeof src !== "string" || !src.startsWith("/assets/") || src.startsWith("/assets/hero/")) return undefined;
  const ext = /\.(jpe?g|png|webp)$/i.exec(src);
  if (!ext) return undefined;
  const url = (s: string) => s.replace(/ /g, "%20"); // a space would split a srcset entry
  return `${url(src.slice(0, ext.index))}.800${ext[0]} 800w, ${url(src)} 1600w`;
}

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
        srcSet={props.srcSet ?? photoSrcSet(props.src)}
        // Full width by default: never blurrier than before; callers that know the slot pass `sizes`.
        sizes={props.sizes ?? "100vw"}
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
