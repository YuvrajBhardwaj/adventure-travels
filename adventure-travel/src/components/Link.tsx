"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";

/**
 * next/link without viewport prefetching. In production Next.js otherwise downloads the page
 * data of every link that scrolls into view (about 55 requests per desktop home visit), all
 * counted against the Vercel quota. In the App Router prefetch={false} also stops prefetch on
 * hover, so this link prefetches when it's actually about to be used: pointer over it, a finger
 * on it, or keyboard focus. Pass prefetch explicitly to get Next's own behaviour back.
 */
export default function Link({ prefetch, onMouseEnter, onTouchStart, onFocus, ...props }: ComponentProps<typeof NextLink>) {
  const router = useRouter();
  if (prefetch !== undefined) return <NextLink prefetch={prefetch} onMouseEnter={onMouseEnter} onTouchStart={onTouchStart} onFocus={onFocus} {...props} />;

  const href = typeof props.href === "string" ? props.href : null;
  // Only our own pages: mailto:, tel:, https://wa.me and #anchors have nothing to prefetch.
  const internal = href !== null && href.startsWith("/") && !href.startsWith("//");
  const warm = () => {
    if (internal) router.prefetch(href);
  };

  return (
    <NextLink
      prefetch={false}
      onMouseEnter={(e) => {
        warm();
        onMouseEnter?.(e);
      }}
      onTouchStart={(e) => {
        warm();
        onTouchStart?.(e);
      }}
      onFocus={(e) => {
        warm();
        onFocus?.(e);
      }}
      {...props}
    />
  );
}
