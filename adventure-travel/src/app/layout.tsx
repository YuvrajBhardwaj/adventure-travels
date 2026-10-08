import type { Metadata, Viewport } from "next";
import { Poppins, Inter, Fraunces, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Preloader from "@/components/Preloader";
import AssetProtection from "@/components/AssetProtection";
import Navbar from "@/components/Navbar";
import FooterV2 from "@/components/FooterV2";
import { AuthProvider } from "@/contexts/AuthContext";
import { SITE_NAME, SITE_URL, SOCIAL_IMAGE, SOCIAL_PROFILES } from "@/lib/seo";

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
    default: "Himalayan Arc Adventure | Premium Himalayan Adventures in Uttarakhand & Himachal",
    template: "%s | Himalayan Arc Adventure",
  },
  description:
    "Book guided Himalayan treks in Uttarakhand and Himachal Pradesh. Certified trek leaders, small groups, safety-first approach. Kedarkantha, Valley of Flowers, Hampta Pass, Brahmatal and more.",
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
    title: "Himalayan Arc Adventure | Premium Himalayan Adventures",
    description:
      "Explore the Himalayas with certified guides, small groups, and unforgettable experiences. Treks in Uttarakhand & Himachal Pradesh.",
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Himalayan Arc Adventure | Himalayan Adventures",
    description:
      "Certified guides, small groups, and epic Himalayan treks. Book Kedarkantha, Valley of Flowers, Hampta Pass and more.",
    images: [SOCIAL_IMAGE],
    creator: "@himalayan_arc_adventure",
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
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
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
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "Himalayan Arc Adventure",
    url: SITE_URL,
    logo: `${SITE_URL}/brand/logo.png`,
    description: "Premium guided Himalayan treks in Uttarakhand and Himachal Pradesh. Certified trek leaders, small groups, safety-first approach.",
    email: "himalayanarcadventure@gmail.com",
    telephone: "+917817912062",
    address: [
      {
        "@type": "PostalAddress",
        addressLocality: "Gurugram",
        addressRegion: "Haryana",
        addressCountry: "IN",
      },
      {
        "@type": "PostalAddress",
        addressLocality: "Joshimath",
        addressRegion: "Uttarakhand",
        addressCountry: "IN",
      },
    ],
    sameAs: SOCIAL_PROFILES,
    areaServed: ["Uttarakhand", "Himachal Pradesh"],
    priceRange: "₹5000–₹65000",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "692",
    },
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
        <AssetProtection />
        <AuthProvider>
          <Preloader />
          <Navbar />
          {children}
          <FooterV2 />
        </AuthProvider>
      </body>
    </html>
  );
}
