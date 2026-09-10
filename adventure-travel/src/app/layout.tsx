import type { Metadata, Viewport } from "next";
import { Poppins, Inter, Fraunces, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Preloader from "@/components/Preloader";
import AssetProtection from "@/components/AssetProtection";
import Navbar from "@/components/Navbar";
import FooterV2 from "@/components/FooterV2";
import { AuthProvider } from "@/contexts/AuthContext";

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
  metadataBase: new URL("https://expeditionhappiness.com"),
  title: {
    default: "Expedition Happiness Treks | Premium Himalayan Adventures in Uttarakhand & Himachal",
    template: "%s | Expedition Happiness Treks",
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
  authors: [{ name: "Expedition Happiness" }],
  creator: "Expedition Happiness",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://expeditionhappiness.com",
    siteName: "Expedition Happiness Treks",
    title: "Expedition Happiness Treks | Premium Himalayan Adventures",
    description:
      "Explore the Himalayas with certified guides, small groups, and unforgettable experiences. Treks in Uttarakhand & Himachal Pradesh.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Himalayan mountain trek view",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Expedition Happiness Treks | Himalayan Adventures",
    description:
      "Certified guides, small groups, and epic Himalayan treks. Book Kedarkantha, Valley of Flowers, Hampta Pass and more.",
    images: ["https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80"],
    creator: "@ExpeditionHappiness",
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
    canonical: "https://expeditionhappiness.com",
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
    name: "Expedition Happiness Treks",
    url: "https://expeditionhappiness.com",
    logo: "https://expeditionhappiness.com/favicon.svg",
    description: "Premium guided Himalayan treks in Uttarakhand and Himachal Pradesh. Certified trek leaders, small groups, safety-first approach.",
    email: "expeditionhappiness07@gmail.com",
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
    sameAs: [
      "https://www.instagram.com/expeditionhappiness",
      "https://www.youtube.com/@expeditionhappiness",
    ],
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
