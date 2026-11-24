import type { Metadata } from "next";

export const SITE_NAME = "Himalayan Arc Adventure";
/** Shorter brand for titles where the full name would push past the length limit. */
const SITE_SHORT_NAME = "Himalayan Arc";
export const SITE_URL = "https://www.himalayanarcadventure.com";
/** Stable JSON-LD ids, so trek and course schema can point at the one Organization node in layout.tsx. */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export const SOCIAL_IMAGE = {
  url: `${SITE_URL}/social-share.png`,
  width: 1200,
  height: 630,
  alt: "Himalayan Arc Adventure: guided Himalayan treks and Auli snow school",
};

/**
 * Social profiles listed in the Organization `sameAs`. Only profiles that exist belong here.
 * Checked 2026-10-19: facebook.com/himalayan_arc_adventure returns HTTP 400 (Facebook usernames
 * can't contain "_"), so it stays out until the owner confirms the real URL. YouTube is
 * @HimalayanArcAdventure (owner, 24 Nov 2026).
 */
export const SOCIAL_PROFILES = [
  "https://www.instagram.com/himalayan_arc_adventure/",
  "https://www.youtube.com/@HimalayanArcAdventure",
];

/** Absolute URL on this site for a path such as "/assets/kuari-pass-trek/x.jpeg"; full URLs pass through. */
export function absoluteUrl(pathOrUrl: string): string {
  return new URL(pathOrUrl, SITE_URL).href;
}

const TITLE_MAX = 60;
const DESCRIPTION_MAX = 160;

/**
 * A title of at most 60 characters: the primary query first, then as many `details` as fit,
 * then the brand (the full name, or "Himalayan Arc" when space is short). Returned as
 * `absolute` so the layout's "%s | Himalayan Arc Adventure" template doesn't add the brand twice.
 */
export function fitTitle(primary: string, details: string[] = []): { absolute: string } {
  const suffixes = [` | ${SITE_NAME}`, ` | ${SITE_SHORT_NAME}`];
  for (let n = details.length; n >= 0; n--) {
    const head = n ? `${primary}: ${details.slice(0, n).join(", ")}` : primary;
    for (const suffix of suffixes) {
      if (head.length + suffix.length <= TITLE_MAX) return { absolute: head + suffix };
    }
  }
  return { absolute: primary };
}

/**
 * A meta description of at most 160 characters. Sentences are added in order and any that
 * would overflow are skipped; a first sentence that is too long on its own is cut at a word.
 */
export function fitDescription(sentences: (string | false | null | undefined)[]): string {
  let out = "";
  for (const raw of sentences) {
    const sentence = raw && raw.trim();
    if (!sentence) continue;
    const next = out ? `${out} ${sentence}` : sentence;
    if (next.length <= DESCRIPTION_MAX) out = next;
    else if (!out) out = `${sentence.slice(0, DESCRIPTION_MAX - 1).replace(/\s+\S*$/, "")}…`;
  }
  return out;
}

export function pageMetadata({
  title,
  description,
  path,
  socialTitle: providedSocialTitle,
  socialDescription = description,
  image,
  imageAlt,
  imageWidth,
  imageHeight,
  type = "website",
}: {
  /** A plain title gets the layout's brand template; use `fitTitle()` to control the full text. */
  title: string | { absolute: string };
  description: string;
  path: string;
  socialTitle?: string;
  socialDescription?: string;
  /** Share image path or URL; defaults to the 1200×630 site image. */
  image?: string;
  imageAlt?: string;
  /** Only pass real pixel sizes; when omitted for a custom image, no width/height is declared. */
  imageWidth?: number;
  imageHeight?: number;
  type?: "website" | "article";
}): Metadata {
  const plainTitle = typeof title === "string" ? title : title.absolute;
  const socialTitle =
    providedSocialTitle ??
    (typeof title !== "string" || plainTitle.includes(SITE_NAME) ? plainTitle : `${plainTitle} | ${SITE_NAME}`);
  // A custom photo must not inherit the default image's 1200×630: scrapers crop by the declared size.
  const socialImage = image
    ? {
        url: absoluteUrl(image),
        alt: imageAlt ?? SOCIAL_IMAGE.alt,
        ...(imageWidth && imageHeight ? { width: imageWidth, height: imageHeight } : {}),
      }
    : SOCIAL_IMAGE;
  const url = absoluteUrl(path);

  return {
    title,
    description,
    openGraph: {
      type,
      locale: "en_IN",
      url,
      siteName: SITE_NAME,
      title: socialTitle,
      description: socialDescription,
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: socialDescription,
      images: [socialImage],
    },
    alternates: { canonical: url },
  };
}

/** BreadcrumbList JSON-LD: Home, then each [name, path] in order (the last one is the page itself). */
export function breadcrumbLd(trail: [name: string, path: string][]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [["Home", "/"] as const, ...trail].map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: path === "/" ? `${SITE_URL}/` : absoluteUrl(path),
    })),
  };
}

/** A WebPage node tied to the site and the business, for pages with no richer type. */
export function webPageLd(type: "WebPage" | "ContactPage" | "CollectionPage" | "AboutPage", path: string, name: string, description: string) {
  return {
    "@type": type,
    "@id": `${absoluteUrl(path)}#webpage`,
    url: absoluteUrl(path),
    name,
    description,
    inLanguage: "en-IN",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORGANIZATION_ID },
  };
}
