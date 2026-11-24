import Link from "@/components/Link";
import { guides } from "@/data/guides";
import { breadcrumbLd, fitTitle, pageMetadata, webPageLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

const DESCRIPTION = "Trek and travel guides from our team in Joshimath, Uttarakhand: the Kuari Pass trek, and how to reach Joshimath and Auli.";

export const metadata = pageMetadata({
  title: fitTitle("Uttarakhand Trek & Travel Guides"),
  description: DESCRIPTION,
  path: "/guides",
});

export default function GuidesPage() {
  return (
    <main id="main" className="min-h-screen bg-white">
      <JsonLd graph={[webPageLd("CollectionPage", "/guides", "Trek and travel guides", DESCRIPTION), breadcrumbLd([["Guides", "/guides"]])]} />
      <header className="bg-navy text-white">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-28 sm:px-6 lg:px-8 lg:pb-16 lg:pt-36">
          <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-sm text-white/60">
            <Link href="/" className="inline-flex min-h-11 items-center transition-colors duration-150 ease-out hover:text-white">Home</Link>
            <span aria-hidden>/</span>
            <span className="text-white/90">Guides</span>
          </nav>
          <h1 className="font-heading text-5xl font-medium leading-[0.98] tracking-[-0.02em] sm:text-6xl xl:text-7xl">Trek &amp; Travel Guides</h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">{DESCRIPTION}</p>
        </div>
      </header>
      <div className="py-section-sm mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ul className="grid gap-6 md:grid-cols-2">
          {guides.map((g) => (
            <li key={g.slug} className="rounded-2xl border border-slate-200 p-6">
              <h2 className="font-heading text-2xl font-medium text-slate-900">
                <Link href={`/guides/${g.slug}`} className="hover:text-emerald-700">{g.title}</Link>
              </h2>
              <p className="mt-3 text-slate-600">{g.description}</p>
              <Link href={`/guides/${g.slug}`} className="mt-4 inline-flex min-h-11 items-center font-semibold text-emerald-700 hover:underline">Read the guide</Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
