import type { Metadata } from "next";
import Link from "@/components/Link";
import { buttonVariants } from "@/components/ui/button";

// Overrides the layout's "index, follow" (Next also adds its own noindex tag to 404s).
export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: true } };

const LINKS = [
  { href: "/treks", label: "Treks" },
  { href: "/tours", label: "Tours" },
  { href: "/courses", label: "Ski courses" },
  { href: "/contact", label: "Contact us" },
];

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-screen items-center bg-navy text-white">
      <div className="mx-auto max-w-2xl px-4 pb-16 pt-28 sm:px-6 lg:pt-36">
        <p className="font-nav text-xs uppercase tracking-[0.14em] text-white/60">Error 404</p>
        <h1 className="mt-3 font-heading text-4xl font-medium tracking-[-0.02em] sm:text-5xl">This trail doesn&apos;t go anywhere</h1>
        <p className="mt-5 text-base leading-relaxed text-white/75 sm:text-lg">
          The page you were looking for has moved or never existed. Try one of these instead, or ask us on WhatsApp.
        </p>
        <ul className="mt-8 flex flex-wrap gap-3">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className={buttonVariants({ variant: "outline", className: "rounded-full border-white/20 bg-transparent text-white hover:bg-white/10" })}>
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <a href="https://wa.me/917817912062" target="_blank" rel="noopener noreferrer" className={buttonVariants({ className: "rounded-full" })}>
              WhatsApp +91 78179 12062
            </a>
          </li>
        </ul>
      </div>
    </main>
  );
}
