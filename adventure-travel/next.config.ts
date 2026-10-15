import path from "node:path";
import type { NextConfig } from "next";

// Accounts and bookings need Supabase; there is no browser-storage fallback any more.
// Refuse a PRODUCTION deploy without it rather than ship a site where nobody can log in
// or book (specs/001-persistent-backend, research R10). Local and preview builds are unaffected.
if (
  process.env.VERCEL_ENV === "production" &&
  (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
) {
  throw new Error(
    "Production build stopped: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel → Settings → Environment Variables (Production)."
  );
}

const nextConfig: NextConfig = {
  output: "export",
  turbopack: {
    // ponytail: outer repo has its own package-lock.json — pin the workspace root to this app
    root: path.resolve(import.meta.dirname),
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Security headers — note: headers() config doesn't work with output:"export"
  // These are applied via meta tags in layout.tsx instead.
};

export default nextConfig;
