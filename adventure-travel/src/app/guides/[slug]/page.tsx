import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { guideBySlug, guides, type GuideBlock } from "@/data/guides";
import { absoluteUrl, breadcrumbLd, fitTitle, ORGANIZATION_ID, pageMetadata, WEBSITE_ID } from "@/lib/seo";
import { shareImage } from "@/lib/shareImage";
import { JsonLd } from "@/components/JsonLd";
import { buttonVariants } from "@/components/ui/button";

// Server-rendered from src/data/guides.ts, so every word is in the exported HTML.

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const guide = guideBySlug((await params).slug);
  if (!guide) return {};
  const share = guide.trekSlug ? shareImage(guide.trekSlug) : guide.image ? { image: guide.image } : {};
  return pageMetadata({
    title: fitTitle(guide.title, guide.titleDetails),
    description: guide.description,
    path: `/guides/${guide.slug}`,
    type: "article",
    ...share,
    imageAlt: guide.imageAlt,
  });
}

const link = "font-semibold text-emerald-700 underline decoration-emerald-700/30 underline-offset-4 hover:decoration-emerald-700";

/** Turns "[label](/path)" in guide text into links; everything else stays plain text. */
function Rich({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const re = /\[([^\]]+)\]\((\/[^)]*)\)/g;
  let last = 0;
  for (const match of text.matchAll(re)) {
    const i = match.index ?? 0;
    if (i > last) parts.push(text.slice(last, i));
    parts.push(
      <Link key={i} href={match[2]} className={link}>
        {match[1]}
      </Link>
    );
    last = i + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

/** Plain text for structured data: "[label](/path)" → "label". */
const plain = (text: string) => text.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");

function Block({ block }: { block: GuideBlock }) {
  if ("p" in block) return <p className="text-base leading-relaxed text-slate-700 sm:text-lg"><Rich text={block.p} /></p>;
  if ("list" in block)
    return (
      <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-slate-700 marker:text-emerald-600 sm:text-lg">
        {block.list.map((item) => <li key={item}><Rich text={item} /></li>)}
      </ul>
    );
  if ("steps" in block)
    return (
      <ol className="space-y-6 border-l border-slate-200 pl-6">
        {block.steps.map((s) => (
          <li key={s.title}>
            <h3 className="font-heading text-xl font-medium text-slate-900">{s.title}</h3>
            <p className="mt-2 text-base leading-relaxed text-slate-700"><Rich text={s.text} /></p>
          </li>
        ))}
      </ol>
    );
  const headed = block.table.head.some(Boolean);
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-y border-slate-200 text-sm sm:text-base">
        {headed && (
          <thead className="border-b border-slate-300">
            <tr>
              {block.table.head.map((h) => (
                <th key={h} scope="col" className="px-3 py-3 text-left font-nav text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-slate-200">
          {block.table.rows.map((row) => (
            <tr key={row.join("|")} className="align-top">
              {row.map((cell, i) =>
                i === 0 && !headed ? (
                  <th key={i} scope="row" className="w-40 px-3 py-3 text-left font-medium text-slate-500">{cell}</th>
                ) : (
                  <td key={i} className="px-3 py-3 text-slate-800"><Rich text={cell} /></td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const guide = guideBySlug((await params).slug);
  if (!guide) notFound();
  const path = `/guides/${guide.slug}`;
  const updated = new Date(guide.updated).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <main id="main" className="min-h-screen bg-white">
      <JsonLd
        graph={[
          {
            "@type": "Article",
            "@id": `${absoluteUrl(path)}#article`,
            headline: guide.title,
            description: guide.description,
            url: absoluteUrl(path),
            ...(guide.image ? { image: absoluteUrl(guide.image) } : {}),
            dateModified: guide.updated,
            inLanguage: "en-IN",
            author: { "@id": ORGANIZATION_ID },
            publisher: { "@id": ORGANIZATION_ID },
            isPartOf: { "@id": WEBSITE_ID },
            abstract: plain(guide.summary),
          },
          breadcrumbLd([["Guides", "/guides"], [guide.title, path]]),
        ]}
      />

      <header className="bg-navy text-white">
        <div className="mx-auto max-w-4xl px-4 pb-12 pt-28 sm:px-6 lg:px-8 lg:pb-16 lg:pt-36">
          <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-sm text-white/60">
            <Link href="/" className="inline-flex min-h-11 items-center transition-colors duration-150 ease-out hover:text-white">Home</Link>
            <span aria-hidden>/</span>
            <Link href="/guides" className="inline-flex min-h-11 items-center transition-colors duration-150 ease-out hover:text-white">Guides</Link>
            <span aria-hidden>/</span>
            <span className="text-white/90">{guide.title}</span>
          </nav>
          <h1 className="font-heading text-5xl font-medium leading-[0.98] tracking-[-0.02em] sm:text-6xl">{guide.title}</h1>
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-white/80 sm:text-lg"><Rich text={guide.summary} /></p>
          <p className="mt-4 font-nav text-xs uppercase tracking-[0.14em] text-white/50">Updated {updated} · Himalayan Arc Adventure, Joshimath</p>
        </div>
      </header>

      {guide.image && (
        <div className="mx-auto max-w-4xl px-4 pt-10 sm:px-6 lg:px-8">
          {/* eslint-disable-next-line @next/next/no-img-element -- static export, our own web-sized photo */}
          <img src={guide.image} alt={guide.imageAlt ?? ""} className="aspect-[16/9] w-full rounded-2xl object-cover" />
        </div>
      )}

      <div className="py-section-sm mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <nav aria-label="On this page" className="mb-12 rounded-2xl border border-slate-200 p-5">
          <p className="font-nav text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">On this page</p>
          <ol className="mt-3 grid gap-2 sm:grid-cols-2">
            {guide.sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-emerald-700">{s.heading}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-14">
          {guide.sections.map((s) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-28 space-y-5">
              <h2 id={`${s.id}-h`} className="font-heading text-3xl font-medium tracking-[-0.02em] text-slate-900 sm:text-4xl">{s.heading}</h2>
              {s.blocks.map((b, i) => <Block key={i} block={b} />)}
            </section>
          ))}
        </div>

        <aside className="mt-16 rounded-2xl bg-navy p-6 text-white sm:p-8">
          <h2 className="font-heading text-2xl font-medium sm:text-3xl">Plan it with us</h2>
          <p className="mt-3 text-white/75">Our team is in Joshimath. Ask us anything about dates, the route or getting here.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {guide.trekSlug && (
              <Link href={`/treks/${guide.trekSlug}`} className={buttonVariants()}>See dates and book</Link>
            )}
            <a
              href={`https://wa.me/917817912062?text=${encodeURIComponent(`Hi, I read your guide "${guide.title}" and have a question.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline" })}
            >
              Message us on WhatsApp
            </a>
          </div>
        </aside>
      </div>
    </main>
  );
}
