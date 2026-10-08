import type { Metadata } from "next";

export const SITE_NAME = "Himalayan Arc Adventure";
export const SITE_URL = "https://www.himalayanarcadventure.com";
export const SOCIAL_IMAGE = {
  url: `${SITE_URL}/opengraph-image.png`,
  width: 1200,
  height: 630,
  alt: "Himalayan Arc Adventure — guided Himalayan treks and Auli snow school",
};
export const SOCIAL_PROFILES = [
  "https://facebook.com/himalayan_arc_adventure",
  "https://instagram.com/himalayan_arc_adventure",
  "https://youtube.com/@himalayan_arc_adventure",
];

export function pageMetadata({
  title,
  description,
  path,
  socialTitle: providedSocialTitle,
  socialDescription = description,
  image = SOCIAL_IMAGE.url,
  imageAlt = SOCIAL_IMAGE.alt,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  socialTitle?: string;
  socialDescription?: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
}): Metadata {
  const socialTitle = providedSocialTitle ?? (title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`);
  const socialImage = { ...SOCIAL_IMAGE, url: image, alt: imageAlt };

  return {
    title,
    description,
    openGraph: {
      type,
      locale: "en_IN",
      url: `${SITE_URL}${path}`,
      siteName: SITE_NAME,
      title: socialTitle,
      description: socialDescription,
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: socialDescription,
      creator: "@himalayan_arc_adventure",
      images: [socialImage],
    },
    alternates: { canonical: `${SITE_URL}${path}` },
  };
}
