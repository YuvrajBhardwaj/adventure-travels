import type { Metadata, Viewport } from "next";
import { Poppins, Inter, Fraunces, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Preloader from "@/components/Preloader";
import Navbar from "@/components/Navbar";
import FooterV2 from "@/components/FooterV2";
import { AuthProvider } from "@/contexts/AuthContext";
import { absoluteUrl, ORGANIZATION_ID, SITE_NAME, SITE_URL, SOCIAL_IMAGE, SOCIAL_PROFILES, WEBSITE_ID } from "@/lib/seo";
import { treks } from "@/data/treks";
import { courses } from "@/data/courses";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import LegacyDataNotice from "@/components/LegacyDataNotice";

const poppins = Poppins({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-nav",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#10B981",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    // The home page's title (page.tsx is a client component, so it can't export its own).
    default: "Himalayan Arc Adventure | Treks from Joshimath & Auli Skiing",
    template: "%s | Himalayan Arc Adventure",
  },
  description:
    "Guided Himalayan treks from our Joshimath base: Kuari Pass, Pangarchula, Dronagiri, Valley of Flowers and Kedarkantha, plus skiing courses in Auli.",
  keywords: [
    "Himalayan trekking",
    "Uttarakhand treks",
    "Himachal treks",
    "Kedarkantha trek",
    "Valley of Flowers",
    "Brahmatal trek",
    "Hampta Pass",
    "guided treks India",
    "snow treks",
    "winter trekking",
    "mountain camping",
    "adventure travel Uttarakhand",
    "Himalayan expedition",
    "Beginner treks India",
    "high altitude trekking",
  ],
  authors: [{ name: "Himalayan Arc Adventure" }],
  creator: "Himalayan Arc Adventure",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Himalayan Arc Adventure | Treks from Joshimath & Auli Skiing",
    description:
      "Kuari Pass, Pangarchula, Dronagiri and Valley of Flowers, led by our Joshimath team and priced Joshimath to Joshimath. Plus skiing in Auli.",
    images: [SOCIAL_IMAGE],
  },
  // No `creator`: "@himalayan_arc_adventure" is 23 characters and X handles max out at 15,
  // so it can't be a real account. Add the real handle once the owner has one.
  twitter: {
    card: "summary_large_image",
    title: "Himalayan Arc Adventure | Treks from Joshimath & Auli Skiing",
    description:
      "Kuari Pass, Pangarchula, Dronagiri and Valley of Flowers, led by our Joshimath team and priced Joshimath to Joshimath. Plus skiing in Auli.",
    images: [SOCIAL_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://www.himalayanarcadventure.com",
  },
  // Google takes the search-result favicon from these links on the home page, apple-touch-icon
  // included, so every file must be a real square image of its declared size.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48 256x256" },
      { url: "/favicon.png", type: "image/png", sizes: "192x192" },
    ],
    apple: { url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" },
    other: [
      { rel: "manifest", url: "/site.webmanifest" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Price range from the same data the pages and the payment API use, so it can't drift.
  const prices = [...treks.map((t) => t.price), ...courses.map((c) => c.price)];
  const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  // Name, address and phones match the footer (FooterV2) and contact page, so the NAP is consistent.
  // No aggregateRating: the old 4.8 / 692 had no collected reviews behind it, and Google
  // ignores self-served ratings on an Organization anyway. Add geo coordinates only once
  // they match the Google Business Profile pin.
  const organizationSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TravelAgency",
        "@id": ORGANIZATION_ID,
        name: SITE_NAME,
        alternateName: "Himalayan Arc",
        url: `${SITE_URL}/`,
        logo: { "@type": "ImageObject", url: absoluteUrl("/brand/logo.jpeg"), width: 457, height: 354 },
        image: SOCIAL_IMAGE.url,
        description:
          "Guided Himalayan treks in Uttarakhand and Himachal Pradesh and a ski and snowboard school in Auli, run from our office in Joshimath.",
        email: "himalayanarcadventure@gmail.com",
        telephone: "+91-78179-12062",
        address: {
          "@type": "PostalAddress",
          // As on the contact page; the footer shows only "Chamoli, Joshimath - 246443".
          streetAddress: "Near Military Hospital",
          addressLocality: "Joshimath",
          addressRegion: "Uttarakhand",
          postalCode: "246443",
          addressCountry: "IN",
        },
        contactPoint: ["+91-78179-12062", "+91-86505-61564"].map((telephone) => ({
          "@type": "ContactPoint",
          telephone,
          contactType: "customer service",
          areaServed: "IN",
        })),
        department: {
          "@type": "TravelAgency",
          name: `${SITE_NAME}, Gurugram office`,
          telephone: "+91-78179-12062",
          address: {
            "@type": "PostalAddress",
            streetAddress: "M3M Marina, Sector 68",
            addressLocality: "Gurugram",
            addressRegion: "Haryana",
            postalCode: "122101",
            addressCountry: "IN",
          },
        },
        sameAs: SOCIAL_PROFILES,
        areaServed: [
          { "@type": "State", name: "Uttarakhand" },
          { "@type": "State", name: "Himachal Pradesh" },
        ],
        priceRange: `${inr(Math.min(...prices))}–${inr(Math.max(...prices))}`,
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: SITE_NAME,
        alternateName: "Himalayan Arc",
        url: `${SITE_URL}/`,
        inLanguage: "en-IN",
        publisher: { "@id": ORGANIZATION_ID },
      },
    ],
  };

  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${poppins.variable} ${inter.variable} ${fraunces.variable} ${spaceGrotesk.variable}`}>
      <head>
        <meta name="X-Content-Type-Options" content="nosniff" />
        <meta name="X-Frame-Options" content="DENY" />
        <meta name="Referrer-Policy" content="strict-origin-when-cross-origin" />
        <meta name="Permissions-Policy" content="camera=(), microphone=(), geolocation=()" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AuthProvider>
          <CurrencyProvider>
            <Preloader />
            <LegacyDataNotice />
            <Navbar />
            {children}
            <FooterV2 />
          </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
