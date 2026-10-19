# SEO + SMO audit and plan (2026-10-19)

Scope: live site https://www.himalayanarcadventure.com (indexing and off-page signals) plus the code on branch `preview/trek-slideshows` (the version that will ship), for on-page fixes. Competitor research used our search tool, which is **not Google**, so treat "who ranks" as a guide rather than exact Google positions.

---

## 1. Summary: why we are "not on top"

1. **We are not in the race yet.** The domain is 19 days old (registered 2026-09-30), has no referring links, and neither `site:himalayanarcadventure.com` nor the brand name returns anything. Nothing can rank before it is indexed. This is normal for a new domain. It is not a penalty.
2. **On-site, the code hides our best content from crawlers.** On trek and course pages only the active tab is in the HTML, so the day-by-day itinerary, inclusions, packing list and gallery are invisible to search engines. Each trek page has about 500 indexable words, most of them navbar and footer, against about 11,000 on Indiahikes. In production, `/treks` ships as a loading skeleton with no trek links. On the live site Dronagiri, Panpatia Col, Gupt Khal and Nandi Kund have **zero** internal links.
3. **Invented trust signals are a liability.** These had no evidence behind them: an Organization rating of 4.8 from 692 reviews (the same number as the Valley of Flowers `reviewCount`), 4.9 from 150 on every course, a `|| 100` fallback review count, footer text "4.9 Based on 1,200+ Google Reviews" and "since 2010", and a computed "10% OFF" strike-through price. They risk Google manual actions and breach India's CCPA dark-pattern guidelines (false urgency, drip pricing). The structured-data ones are removed in this change; the visible ones remain.
4. **Where we can win:** no operator owns "treks from Joshimath", Dronagiri, the Mana, Niti and Rimkhim permit tours, or a transparent Auli ski-school price list. Results for those are blogs, marketplace listings and thin pages. A Joshimath team with its own photos and videos fits those queries better than any aggregator.

## 2. Honest expectations for a 19-day-old domain

| Window | What is realistic | What it depends on |
|---|---|---|
| Weeks 0–3 | Pages indexed; brand query and very long-tail queries start showing (e.g. "rimkhim expedition", "dronagiri base camp trek from joshimath") | Sitemap submitted, indexing requested, this branch deployed |
| Months 1–3 | Top-10 for thin-competition trek queries: Dronagiri, Rimkhim, Niti Pass, Panpatia Col, "kuari pass trek from joshimath", "auli ski course price" | Tab content visible in HTML, Joshimath hub page, Google Business Profile live, first 10–20 genuine reviews, 5–10 relevant links |
| Months 3–9 | Page 1–2 for mid-volume trek names: "kuari pass trek", "pangarchula trek", "satopanth lake trek" | Depth content per trek, YouTube videos, steady reviews, links from tourism or partner sites |
| 12–24 months+ | Head terms like "kedarkantha trek", "valley of flowers trek" and "best trekking company india" | These are held by Indiahikes, Trek The Himalayas and Thrillophilia, with 10+ years of links and thousands of reviews. Getting there takes years of authority, not on-page tweaks |

"#1 in India" is not one ranking but thousands of queries. The plan is to own the Joshimath and Chamoli queries first (where we are the real local expert), then grow out. Content must go live **2–3 months before each season**: winter content by October, Valley of Flowers by April–May, and high passes by March.

## 3. What I changed in code (this session)

| File | Change |
|---|---|
| `src/components/Preloader.tsx` | `<h1>HIMALAYAN ARC</h1>` is now `<p class="font-heading …">` with the same look. Every page now has exactly one h1. |
| `src/lib/seo.ts` | New `absoluteUrl()`, `fitTitle()` (60 characters or fewer, primary query first, brand shortened to "Himalayan Arc" when needed), `fitDescription()` (160 characters or fewer), and `ORGANIZATION_ID` / `WEBSITE_ID`. `pageMetadata()` now makes images absolute and no longer stamps 1200×630 on photos that aren't that size. Removed the invalid `twitter:creator` (23 characters; X handles allow at most 15). `SOCIAL_PROFILES` is trimmed to Instagram, because the Facebook URL returns 400 and the YouTube URL returns 404. |
| `src/app/layout.tsx` | Home title and description rewritten (60 / 147 characters). Organization JSON-LD is now an `@graph`: a `TravelAgency` with `@id`, Joshimath `PostalAddress` (Near Military Hospital, 246443), both phones as `ContactPoint`, the Gurugram office as `department`, `priceRange` computed from `src/data` (₹5,000–₹95,000), and the **invented `aggregateRating` 4.8/692 removed**. Added a `WebSite` node, which supports the site-name display in Google. |
| `src/app/treks/[id]/page.tsx` | Fitted titles (e.g. "Kuari Pass Trek from Joshimath: 5 Days \| Himalayan Arc") and descriptions with price and "Joshimath to Joshimath". `AggregateRating` is emitted **only when `rating` and `reviewCount` are both set** (the `\|\| 100` is gone). Absolute image URLs. `BreadcrumbList` added. `provider` links to the Organization `@id`. `Offer` gains `url` and a "Price covers …" description. `numberOfItems` now matches the itinerary length (Tungnath has 3 days and 4 entries). Fixed the "Ghiya Vinayak Pass (Nandi Kund Trek) Trek" and "… Expedition Trek" names. |
| `src/app/courses/[course]/page.tsx` | **Removed the invented `aggregateRating` 4.9/150** that sat on all five courses. Fitted titles ("7-Day Skiing Course in Auli \| Himalayan Arc Adventure"). Descriptions follow the tier model ("₹10,000 for training only, or ₹20,000 with stay and meals"). Added `CourseInstance` (Onsite, Auli), `offers.category`, absolute own-photo `image[]`, and `BreadcrumbList`. |
| `src/app/sitemap.ts` | Uses `SITE_URL`. Adds an **image sitemap** of 87 own photos (trek cover plus course galleries; Unsplash stock excluded). Tungnath and Madhyamaheshwar, missing from the live sitemap, are included automatically. |
| `src/app/treks/page.tsx`, `courses/page.tsx`, `destinations/page.tsx`, `activities/page.tsx`, `contact/page.tsx`, `faq/page.tsx` | Titles of 60 characters or fewer and descriptions of 160 or fewer. Counts and prices are generated from `src/data`, which fixes the `/courses` contradiction ("all meals included, from Rs.30,000" against a real ₹10,000 training-only price). |

**Verification:** `npx tsc --noEmit` exits 0, and `npx eslint` on all 12 changed files exits 0. All 34 routes were re-fetched from the running dev server on :3000. Results: 34/34 return 200, each has one `<h1>`, all titles are 48–60 characters, all descriptions are 124–159 characters, all JSON-LD parses, and the sitemap has 34 URLs and 87 `image:loc` entries. `npm run build` was not run because the dev server is up. Not committed. **CHANGELOG.md and TODO.md were not touched** (another agent owns them), so these changes still need entries there.

### Second pass (same day): on-page blockers

| File | Change |
|---|---|
| `src/app/treks/[id]/TrekDetailClient.tsx` | All 9 tab panels are rendered into the HTML via a new `TabPanel`; inactive ones carry `hidden`. The tab UI, roving tabindex and arrow keys are unchanged; each tab now has `aria-controls` pointing at its own panel. The fade-in runs only when a panel is switched to (framer `useAnimate`, never on first paint) and is skipped with reduced motion. Panels stay mounted, so the reservation form state survives tab switches. |
| `src/app/courses/[course]/CourseDetailClient.tsx` | The same `CourseTabPanel` pattern for its 6 tabs. The scroll-reveal wrappers and hero now start visible (`initial={false}`; the hero uses a CSS `motion-safe` fade, so the h1 shows without JS). The lightbox portal is gated on a hydration-safe `isClient`, because the gallery panel is now server-rendered. |
| `src/app/treks/TreksPageClient.tsx` | Removed `Suspense` and `useSearchParams`. Filters start at "all", so the static HTML lists all 21 treks; `?search/destination/region/difficulty` are applied in an effect after mount. |
| `src/app/template.tsx` | No `opacity:0` on first load (`initial={false}` while hydrating, via `useSyncExternalStore`). Routes mounted by client-side navigation still fade in. Reduced motion uses the same element tree and never starts faded, which also removes a hydration-mismatch and remount risk. |
| `src/app/loading.tsx`, `src/app/treks/[id]/loading.tsx`, `src/app/courses/[course]/loading.tsx` | **Deleted.** In the static export they pushed every page's content into `<div hidden id="S:0">` after the footer. |
| `src/components/FooterV2.tsx` | The "Popular Treks" links (site-wide) are now picked by slug from `src/data`: Kuari Pass, Pangarchula, Dronagiri, Valley of Flowers, Panpatia Col, Kedarkantha. |

**Proof** (dev server on :3000; "visible" means outside `<script>`):
- `/treks/kuari-pass` HTML contains the Day 2 and Day 3 itinerary titles, "Day-by-Day Itinerary", "Packing List" and its items, "Inclusions & Exclusions" with the include and exclude lines, T&C, and the reservation form. There are 9 tabpanels, 8 of them `hidden`, and 0 streamed `S:n` blocks. Visible words rose from about 500 to about 2,360. All 12 gallery `<img>` tags are `loading="lazy"`, with 0 `<video src>` up front.
- `/treks` HTML has an h1 and links to **21/21** trek slugs ("Showing 21 of 21").
- No `opacity:0` wrapper around main content: the template wrapper renders `opacity:1`. The only `opacity:0` nodes left are the Preloader splash overlay and 6 footer stagger items.
- Headless Chrome (CDP), with zero console errors or warnings across these pages:
  - Trek page: clicking a tab shows its panel at opacity 1 and hides the others; ArrowRight moves focus.
  - The reservation name survives switching tabs away and back.
  - Gallery-only photos were fetched 0 times before the gallery tab opened.
  - `/treks?difficulty=Easy` shows "Showing 3 of 21".
  - The course gallery lightbox opens.
  - On client-side navigation to `/faq`, the page fades in (opacity 0, then 0.22, 0.94, 0.98).
- `tsc` passes. `eslint` passes with 0 errors and 1 pre-existing `no-img-element` warning (the course lightbox).

**New finding for the owner:** departure availability is synthetic. `getDepartures()` (`treks/[id]/trekContent.ts`) and `getCourseBatches()` give fixed 8th/22nd dates and cycle "Available / Few Seats Left / Sold Out" from a constant (`AVAIL_CYCLE`, `C_CYCLE`). The "Filling Fast" badge depends on it. This is the same class of claim as the "10% OFF". It is now also in the static HTML, because the Dates panel renders server-side, so it needs real batch data or neutral wording.

**Still not done (files outside my scope):** `SmartImage` keeps every card and gallery photo at `opacity-0` until JavaScript runs. The home hero slides (`SeasonSplitHero`) and many home sections render at `opacity:0` until in view. Home `FAQV2` is still a streamed `next/dynamic` block.

**Still to decide (owner):** trek `AggregateRating` is still emitted for 19 of 21 treks, because `src/data/treks.ts:98–666` holds `rating`/`reviewCount` values with no evidence behind them. Google does not show review stars for `TouristTrip` anyway, so this markup carries all of the risk and none of the reward. Unless the owner can show where the counts come from, delete those fields (the UI at `TrekDetailClient.tsx:364,670` reads them too).

## 4. On-site audit findings

### 4.1 Indexing and technical

| # | Finding | Evidence | Status / where |
|---|---|---|---|
| T1 | Apex redirects to www with **307 (temporary)**; `http://apex` takes two hops (308 to https apex, then 307 to www) | `curl -w %{http_code}` | Owner: Vercel → Domains, set apex to redirect permanently (308) to www |
| T2 | **Trek and course tabs render only the active tab.** The itinerary, inclusions, packing list and gallery are absent from the HTML (e.g. "Khulara" and "Tali via Kuari Pass" exist only in the RSC script, not in the visible DOM). Googlebot does not click tabs | `TrekDetailClient.tsx` tab panels; `CourseDetailClient.tsx` tab panels | **Fixed (second pass):** all panels are in the HTML, inactive ones `hidden` |
| T3 | Production `/treks` ships only the skeleton: about 153 words, no h1 besides the preloader, and **no trek links** | Live HTML; `useSearchParams()` at `TreksPageClient.tsx:90` inside `Suspense` at `:74` bails out to client rendering in a static export | **Fixed (second pass):** 21/21 trek links and the h1 are in the HTML; filters are applied after mount |
| T4 | Every page's content sits in `<div hidden id="S:0">` after the footer and is swapped in by script (streaming from `loading.tsx`), inside a `template.tsx` wrapper rendered with `style="opacity:0"`. Content and the LCP image are invisible until JavaScript runs, which hurts LCP and any non-JS crawler | Live `/treks/kuari-pass` HTML: h1 at byte 59,317 after footer at 17,220; `<div style="opacity:0">` | **Fixed (second pass):** the loading.tsx files are deleted and the template starts visible. Remaining (other files): `SmartImage` `opacity-0` until JS; home sections at `opacity:0` until in view |
| T5 | `/login` (live) is `index, follow` with canonical pointing at the **home page**, inherited from the layout. `/signup` and `/reset-password` are the same. Code `robots.ts` adds `/reset-password`; live robots.txt doesn't | Live HTML; `layout.tsx` `alternates` | Remaining. Add a tiny server `layout.tsx` with `robots: { index: false }` in `login/`, `signup/` and `reset-password/` (they are client pages, so they can't export metadata) |
| T6 | Sitemap `lastmod` is always the build time for every URL, so Google learns to ignore it | `sitemap.ts` | Low. Replace it with real content dates when available |
| T7 | Image sitemap entries are emitted before `<lastmod>` (Next.js ordering). Google accepts this | `/sitemap.xml` | Note only |
| T8 | Layout `<meta name="X-Frame-Options">` and similar tags have no effect: those are HTTP headers. The valid meta is `<meta name="referrer">` | `layout.tsx` `<head>` | Headers belong in `vercel.json` (other agent) |

### 4.2 On-page (titles, headings, schema, social)

| # | Finding (live) | Status |
|---|---|---|
| P1 | Titles: 31 of 32 over 60 characters (up to 103 for `/treks/nandi-kund`). Descriptions run 141–402 characters | **Fixed** (all 34 routes within limits) |
| P2 | Two `<h1>` on every page (Preloader) | **Fixed** |
| P3 | Home h1 is "ONE RANGE. TWO SEASONS.", which matches no query | Remaining: `SeasonSplitHero.tsx:300`. Keep the slogan visually, but make the h1 (or a visible line inside it) read e.g. "Himalayan treks from Joshimath & Auli ski school" |
| P4 | Organization rating 4.8/692; course rating 4.9/150 everywhere; trek `\|\| 100` | **Fixed in schema.** Visible claims remain (see 4.4) |
| P5 | `TouristTrip.image` relative (`/assets/...`) | **Fixed** (absolute) |
| P6 | No `BreadcrumbList` | **Fixed** (treks and courses). The visible crumb says "Adventures" (`TrekDetailClient.tsx:300`) while the schema says "Treks"; rename the visible label to "Treks" |
| P7 | og:image on trek pages declared 1200×630 for 1600×1200, 4080×1840 and portrait photos | **Fixed** (no false dimensions). Per-trek 1200×630 images still to do (S1 below) |
| P8 | `twitter:creator` "@himalayan_arc_adventure" can't exist (handle too long) | **Fixed** (removed) |
| P9 | `sameAs` lists Facebook (HTTP 400; usernames can't contain "_") and YouTube (404) | **Fixed in schema**. Footer links still broken: `FooterV2.tsx:46-51` |
| P10 | FAQPage on `/faq`: valid, but since August 2023 Google shows FAQ rich results only for government and health sites, so it earns no SERP feature for us. Its answers are shortened copies of the visible ones (acceptable). Some FAQs cover treks we don't sell (Triund, Kareri, Beas Kund, Nag Tibba) | Keep. Prune off-catalogue FAQs or link them to our equivalents |

### 4.3 Internal linking (live static HTML: pages linking to each detail page)

| Detail page | Inbound pages (live) | Note |
|---|---|---|
| Valley of Flowers, Kedarkantha, Brahmatal, Roopkund, Har Ki Dun | 31 each | Site-wide footer "Popular Treks" (`FooterV2.tsx:21-27`) |
| Kuari Pass, Pangarchula, Hampta Pass | 2 | home, /destinations |
| Mana, Niti, Rimkhim | 2 | home, /activities |
| Satopanth, Kalindi Khal, Nanda Devi BC, Bhrigu Lake | 1 | /destinations |
| **Dronagiri, Panpatia Col, Gupt Khal, Nandi Kund** | **0** | Orphans: only the sitemap knows them |
| Tungnath, Madhyamaheshwar (new) | 0 live | In production `/treks` won't link them either (T3) |

**Status (second pass):** `/treks` now links all 21 treks in static HTML, and the footer links Kuari Pass, Pangarchula, Dronagiri, Valley of Flowers, Panpatia Col and Kedarkantha on every page. Still open: a "Treks from Joshimath" footer link once the hub exists, and a related-treks block. Original fix list: point the footer "Popular Treks" at the edge treks (Kuari Pass, Pangarchula, Dronagiri, Valley of Flowers, Mana/Niti permit tours). Add a "Treks from Joshimath" footer link once the hub exists. Add a server-rendered "Related treks" block on every trek page (same `startsFrom` / region / season, generated from `src/data`).

### 4.4 Trust and content contradictions (report, don't pick a side)

| # | Contradiction or unverified claim | Where |
|---|---|---|
| C1 | "Price covers **Joshimath to Joshimath**", and the package excludes "Getting to Joshimath", yet Day 1 is "Rishikesh → Joshimath (255 km drive)" and the last day "Joshimath → Rishikesh" for Kuari Pass and Pangarchula. Valley of Flowers is the same (`location: "Rishikesh…"`, `startsFrom: "Joshimath"`). Is the Rishikesh drive in the price and in the day count? | `treks.ts:116,264,292`; `trekPackage.ts:48-60` |
| C2 | Global FAQ says the price includes "transfers from Dehradun/Haridwar" | `treks.ts:754+` (`faqItems`) |
| C3 | Strike-through "10% OFF" computed as `price / 0.9`: there was never a higher price. "Filling Fast" and "No-cost EMI" need to be real | `TrekDetailClient.tsx:578-579,636-640,589,674` |
| C4 | Footer: "4.9 Based on 1,200+ Google Reviews", "Creating unforgettable memories since 2010", "Est. 2010". The domain is 3 weeks old and no Google Business Profile was found | `FooterV2.tsx:125,147-160,352` |
| C5 | Per-trek `rating`/`reviewCount` (e.g. Mana Pass 4.9 from 12, Rimkhim 4.7 from 6) shown as "(341 Reviews)" and "341+ people rated this trek" | `treks.ts:98-666`; `TrekDetailClient.tsx:364,670` |
| C6 | Testimonials reuse the same names across files (Priya, Arjun, Sneha in both treks and courses). If they aren't real, consenting customers, remove them | `treks.ts:743-751`; `courses.ts:239,324,382,451,514` |
| C7 | "Uttarakhand's Trek of the Year" (Dronagiri blurb), "98% Success Rate" (stats), "India's highest motorable pass" (Mana Pass blurb; Umling La is higher) | `treks.ts:502,762`, Mana blurb |
| C8 | Dronagiri `maxAltitude: 4500`, but itinerary Day 7 reaches 4,920 m | `treks.ts:505` against `:514` |
| C9 | Pangarchula `maxAltitude: 4700`, while Indiahikes and most sources give about 4,590 m (15,069 ft). Owner to confirm | `treks.ts` Pangarchula |
| C10 | Panpatia Col's cover is an Unsplash photo although our own Panpatia photos and video exist in the gallery. Mana, Niti, Rimkhim, Kalindi Khal, Gupt Khal, Nanda Devi BC, Brahmatal and Roopkund also use stock (some share the same stock shot). The footer "Instagram" grid is stock too | `treks.ts:174,204,415,451,487,553,586,619,651`; `FooterV2.tsx:37-44` |

### 4.5 Images and media (weights from `ls`/`du` and sharp metadata)

| Asset | Size | Problem |
|---|---|---|
| `public/brand/badge.png` (Navbar logo, **every page**) | **1,799 KB**, 1254×1254 | Shown at about 40 px. Make it a 96×96 WebP/PNG of about 10 KB (`Navbar.tsx:221`) |
| `public/apple-touch-icon.png` | 347 KB, **3000×4000** | Must be a square 180×180 |
| `public/favicon.png` | 232 KB, 484×484 | Make it 48 or 96 px, a few KB |
| Home hero slides (LCP) | VoF `IMG_5934` 1,283 KB; Kuari `340648ba` 1,037 KB (1600×2133) | Resize to 1600 w WebP (about 200 KB), plus an 800 w `srcset` |
| Trek heroes / og | Dronagiri `c3de05f4` **3,430 KB** (4080×1840); VoF 455; Kuari 463; Hampta 470 (portrait); Bhrigu 492 (portrait); Satopanth 340 | Above WhatsApp's ~300 KB limit, or the wrong aspect ratio for previews |
| Course heroes / og | Backcountry `IMG_0711` **5,968 KB** (5712×4284); 14-day ski `IMG_5036` **3,233 KB**; gallery `IMG_5022` **13,857 KB** | Resize |
| `public/assets/` total | **215 MB**, including 35 `.mov`/`.mp4` clips (0.7–7.4 MB) | iPhone `.mov` files are often HEVC, which won't play in Chrome or Firefox. Re-encode to H.264 MP4 with a poster, and upload the originals to YouTube for video search |
| Hero `<img alt="">` on trek pages (the LCP image) | n/a | `WallpaperCarousel.tsx:164`. Pass descriptive alt text, e.g. "Kuari Pass trail above Joshimath, Oct batch" |

## 5. Competitor gaps by query

Pages inspected in depth (one fetch each, robots.txt respected): Indiahikes Kuari Pass and Pangarchulla, Bikat Auli skiing, Himalayan High Panpatia Col, Treks and Trails Valley of Flowers. Trek The Himalayas returned 429 and Uttarakhand Tourism returned an empty JavaScript shell, so neither was retried.

| Query | Who ranks (our search tool) | What wins | What we have | Change that beats it |
|---|---|---|---|---|
| kuari pass trek | [Indiahikes](https://indiahikes.com/kuari-pass), Treks and Trails, Trekup India, Aquaterra, Bikat, Outlook | Indiahikes: about 11,500 words, 19 H2 sections (inclusions, exclusions, quick itinerary, day-by-day, difficulty, best time, travel plan, stay, packing, fitness, FAQs), 5 video embeds, schema Organization + BreadcrumbList + Product + ItemList + FAQPage + VideoObject. Title "Kuari Pass Trek 2026 \| A Grand Pass-Climb for Beginners" (55) | About 500 indexable words; itinerary hidden in a tab; 12 own photos plus 1 `.mov` | T2 (tabs in HTML). Add "Kuari Pass from Joshimath: how we run it" (pickup point, road distances), "Winter vs autumn on our batches", a cost box that resolves C1, our clip on YouTube with an embed, and 6–8 trek-specific FAQs |
| pangarchula peak trek | [Indiahikes /pangarchulla](https://indiahikes.com/pangarchulla) (canonical `pangarchulla-peak-trek`), World Nomads, Himalaya Shelter, Bikat, Backpackers United | The double-L spelling "Pangarchulla" dominates. Summit-day detail, 7 videos | 8 own photos plus an mp4; the 4,700 m altitude conflicts with sources (C9) | Confirm the altitude. Use "Pangarchula (Pangarchulla)" once in the h1 subtitle and intro (a real variant spelling, not stuffing). Add a summit-day section from our own footage and a "Pangarchula vs Kuari Pass" comparison |
| dronagiri trek | Deccan Herald, Himalayan Club journal, Himalayan High and TTH Bagini Glacier pages, tourtravelworld listings, Wikipedia (a Maharashtra fort with the same name) | **No strong operator page**: trip reports and listings win | 5 photos plus 5 videos and a 9-day itinerary, but **0 internal links** on the live site | Biggest quick win. Link it site-wide (4.3). The title now leads with "Dronagiri Base Camp Trek from Joshimath". Fix C8. Add a "Jumma, Ruing, Dronagiri village, Bagini Glacier" section with distances (owner), village lore told first-hand, and drop "Trek of the Year" unless it can be sourced |
| valley of flowers trek package | [Treks and Trails](https://www.treksandtrails.org/tours/valley-of-flowers-48271), Holidify (3 packages), Backpackers United, Zingbus | Package framing and dual pricing (the search snippet shows ₹9,499 from Rishikesh and ₹7,499 from Joshimath). Their own page conflicts on pickup towns and altitude and has no how-to-reach section and 0 reviews | ₹8,000 "Joshimath to Joshimath", but the itinerary starts in Rishikesh (C1) | Resolve C1 and, if offered, show **both** prices plainly. Add how to reach Govindghat from Joshimath, Hemkund Sahib day details, park entry fee and opening dates (owner), and bloom-by-month photos from our own folder (`valley-of-flowers/`) |
| kedarkantha trek | [Indiahikes guide](https://indiahikes.com/kedarkantha-trek), Himalayan Dream Treks, Treks and Trails, Bajaj Finserv, insider.in | A head term with deep guides | Dehradun/Sankri pickup, so it's not our local edge; 10 own photos | Don't fight it head-on. Use it as the entry point of the winter hub and link to it from there |
| treks from joshimath | insider.in events, Trekup (Dharansi), TTH Bagini, Himalaya Shelter blog, Thrillophilia tag page, Holidify, Bikat blog | **No operator hub exists.** Results are tag pages and blogs | 8 treks with `startsFrom: "Joshimath"` plus the Auli school, but no hub | **Build `/treks-from-joshimath`** (outline in 7.2). This is the query that best matches who we are |
| auli skiing course | [Bikat](https://www.bikatadventures.com/Home/Itinerary/skiing-basic-course-auli-7-days) (price on request, 44 generic FAQs, 0 reviews, Service schema), YHAI, Outlook (GMVN 7/14-day courses; private ₹12k–25k), Tripoto, Himalaya Shelter | Old articles and opaque pricing | 5 courses with **published tier prices** and own photos and videos, but tabs are hidden (T2) | T2 on course pages. Add a "GMVN vs private ski school in Auli" comparison (owner facts), a snow and season calendar from our Joshimath base, the instructor certification body, and Joshimath-to-Auli access |
| winter treks uttarakhand | TTH (2 hub pages), Himalaya Shelter listicles, Vargis Khan, Ghughuti, Outlook | Listicle hubs linking out to trek pages, with month guidance | No hub. Winter-season treks in the data: Kedarkantha, Brahmatal, Kuari Pass, Pangarchula, Tungnath, Har Ki Dun (to Dec) | **Build `/winter-treks-uttarakhand`**, generated from `bestSeason`, by early November (7.3) |
| har ki dun trek | Treks and Trails, Himalaya Shelter (several subdomains), insider.in | Distance and village detail | 8 own photos | One result says camping in the valley is now prohibited. Confirm our itinerary complies (owner), then say so on the page: first-hand accuracy wins trust |
| satopanth lake trek | **[uttarakhandtourism.gov.in](https://uttarakhandtourism.gov.in/trek/satopanth-lake-trek)** first, then Trekup, Bikat, Himalaya Shelter, Wikipedia, TTH | Government authority | 8 own photos; the itinerary runs Haridwar–Badrinath while `location` says Joshimath | Get registered and listed with UTDB (8.2). Add Mana start details, forest permit (owner), and fix the location field |
| panpatia col trek | Trekup, Himalaya Shelter, Bikat (video), [Himalayan High](https://www.himalayanhigh.in/panpatia-col-trek) (TouristTrip + TravelAgency, about 7,100 words, "2026 \| Premium Private Expedition") | Long expedition guides | Own photos and a video in the gallery, but the cover and share image are **stock** (C10) | Set `image` to our own Panpatia photo. Add the acclimatisation profile (the chart exists), technical gear list and the Madhyamaheshwar exit |
| best trekking company india | TTH (7 of 9 results are its own "best company" pages), Indiahikes blog | Brand authority and self-promotion | Nothing | **Don't publish "best", "#1" or "top-rated" claims.** Instead write "How to choose a Himalayan trek operator" with checkable proof (UTDB registration, insurance, leader certificates, real reviews) |
| uttarakhand trek operators | TTH, Roopkund Heaven, 2009/2018 news, UTDB draft Trekking Rules 2022 PDF | The rules define a "Registered Operator" with UTDB | Not registered or listed (unknown) | Register with UTDB and get listed. It is legally relevant and gives a high-authority .gov.in citation |
| Mana / Niti ILP (permit tours) | Himalayan Dream Treks "how to get Mana Pass permit" blog, Statesman (online ILP), eUttaranchal | Explainers by non-locals | 3 permit tours, all on stock images | Write "Mana, Niti & Rimkhim permits from Joshimath: how the ILP works", from the team that files them at the SDM office (owner facts) |
| Himalayan Arc Adventure (brand) | Nothing about us | n/a | Not indexed | Google Search Console steps (section 9); Google Business Profile; consistent social profiles |

## 6. Prioritised actions

The **five that move rankings most** are #1–#5.

| # | Action | Why it wins (evidence) | Impact | Effort | Owner | Where |
|---|---|---|---|---|---|---|
| 1 | Deploy this branch, submit the sitemap, request indexing of 12–15 key URLs; set the apex redirect to permanent | Nothing is indexed (`site:` and brand searches empty); apex 307 | H | S | owner-offline | GSC; Vercel → Domains |
| 2 | **Done (second pass)**: render all trek and course tab panels in the HTML | Itinerary and inclusions are absent from the HTML (4.1 T2); Indiahikes ranks with ~11k words | H | M | code | `TrekDetailClient.tsx:461-468`; `CourseDetailClient.tsx:499-835` |
| 3 | **Done (second pass)**: server-render the `/treks` list and fix orphans through the footer. Still open: a "related treks" block on trek pages | Production `/treks` has 0 trek links; Dronagiri, Panpatia, Gupt Khal and Nandi Kund have 0 inbound links (4.3) | H | S–M | code | `TreksPageClient.tsx:74-90`; `FooterV2.tsx:21-27` |
| 4 | Remove or prove the visible trust claims: footer 4.9 / 1,200+ Google reviews, since 2010, "10% OFF", per-trek ratings, testimonials | Unprovable reviews and fake discounts risk manual actions and CCPA dark-pattern complaints; they undercut the "honest pricing" edge | H | S | code + owner | 4.4 C3–C7 |
| 5 | Create the Google Business Profile for the Joshimath office and start collecting reviews after every batch | Local pack and brand panel; the only rating source Google trusts for us | H | S | owner-offline | 8.1 |
| 6 | Build the "Treks from Joshimath" hub | No operator owns the query (5) | H | M | content + code | new `src/app/treks-from-joshimath/page.tsx`, generated from `treks.filter(startsFrom === "Joshimath")` |
| 7 | Build the "Winter treks in Uttarakhand" hub before November | Listicle hubs win (TTH); our winter departures run Dec–Apr | M–H | M | content + code | new route, generated from `bestSeason` |
| 8 | Fix pricing and altitude contradictions | C1, C2, C8, C9; trust and Google's quality raters | H | S | owner + content | `treks.ts`, `trekPackage.ts` |
| 9 | Per-trek 1200×630 JPEG share images under 300 KB | WhatsApp is our sales channel; 9 trek/course share images are over 300 KB (3 of them 3–6 MB), 2 are portrait, and 9 treks share stock photos | M | S | code | build script with `sharp` writing `public/og/<slug>.jpg`; reference it from `treks/[id]/page.tsx` |
| 10 | Shrink the logo badge (1.8 MB on every page), hero images and course heroes; (the loading.tsx and template parts are done) | LCP / Core Web Vitals (4.1 T4, 4.5) | M | S–M | code | `Navbar.tsx:221`; `public/`; `template.tsx:21` |
| 11 | Real social profiles (Facebook page, YouTube channel) and trek videos on YouTube | Facebook 400, YouTube 404; Indiahikes embeds 5–7 videos per trek | M | M | owner + code | `seo.ts` `SOCIAL_PROFILES`; `FooterV2.tsx:46-51` |
| 12 | UTDB registration and listing, plus citations (8.2) | A .gov page ranks first for Satopanth; the trekking rules require registration | M | M | owner-offline | 8.2 |
| 13 | Replace stock covers with our own photos (Panpatia first) | First-hand media is the edge; stock covers show in share previews | M | S | owner + code | `treks.ts:487` (Panpatia), then Mana, Niti, Rimkhim |
| 14 | noindex `/login`, `/signup`, `/reset-password` | They inherit `index, follow` and a home canonical | L | S | code | new `layout.tsx` in each folder |
| 15 | Home h1 with the primary query; descriptive hero alt text | h1 "ONE RANGE. TWO SEASONS."; hero `alt=""` | L–M | S | code | `SeasonSplitHero.tsx:300`; `WallpaperCarousel.tsx:164` |

## 7. Content plan (outlines; facts in section 10 are needed first)

### 7.1 Standard trek-page blocks (every trek, rendered in HTML)
1. Quick facts: days, max altitude, grade, season, group size, basecamp (from `src/data`).
2. **What the price covers**: "Joshimath to Joshimath" (or the real route), inclusions and exclusions (from `trekPackage.ts`), and optional add-ons with prices.
3. Day-by-day itinerary with km, hours and altitude (data exists; make it visible).
4. How to reach Joshimath or the trailhead: road distances and times, nearest rail (Rishikesh) and airport (Jolly Grant). *Owner: distances.*
5. Best time by month, plus what our last batches actually saw (snow line, trail state). *Owner: batch notes.*
6. Difficulty and fitness: the data's "5 km in 40 mins" target, and a 4–6 week plan.
7. Permits and fees (forest, national park, ILP). *Owner.*
8. Elevation chart (exists) and route map (*owner: GPX or a sketch*).
9. Our photos and one YouTube video, with photographer credit (the team).
10. Trek leader card: name, certifications, years on this route. *Owner.*
11. 6–8 trek-specific FAQs, visible on the page.
12. Related treks: same `startsFrom`, region or season.

### 7.2 Hub: Treks from Joshimath (`/treks-from-joshimath`)
- H1 "Treks from Joshimath". Intro: our office near Military Hospital, Joshimath 246443, and why starting here saves a day and some money (only if C1 confirms it).
- A generated table: trek · days · max altitude · grade · season · price, linking to each page. Rows: Kuari Pass, Pangarchula, Valley of Flowers, Dronagiri BC, Gupt Khal, Mana, Niti, Rimkhim, plus Satopanth (via Mana) if the owner confirms.
- Trailhead distances from Joshimath (owner). How to reach Joshimath. A season planner by month.
- Permit tours section (links to the ILP guide). Auli ski school section (links to `/courses`).
- One page for one real intent. **Do not** clone city pages ("treks from Delhi", "treks from Mumbai"): that is the doorway-page pattern.

### 7.3 Hub: Winter treks in Uttarakhand (`/winter-treks-uttarakhand`)
- Generated from treks whose `bestSeason` covers December–February: Kedarkantha (Dec–Apr), Brahmatal (Dec–Mar), Pangarchula (Dec–Mar), Kuari Pass (Oct–Feb), Tungnath (snow Dec–Mar), Har Ki Dun (to Dec).
- Month-by-month snow reality from Joshimath and Auli (first-hand), a gear list, and a comparison table (days, altitude, grade, price, pickup town).
- A link to the Auli ski courses (Dec–Mar).

### 7.4 Comparison: Kuari Pass vs Pangarchula
All numbers from `src/data`: 5 vs 6 days, 3,815 m vs 4,700 m (owner confirms), Moderate vs Challenging, ₹7,500 vs ₹9,500, Oct–Feb vs Dec–Mar. Add "who should pick which" from the leaders' experience.

### 7.5 Guide: Mana, Niti & Rimkhim permits (ILP) from Joshimath
Process at the SDM office, ITBP and Army steps, documents, processing days, online portal status, rules for foreign nationals, what we handle. *All owner facts; no invented fees.*

### 7.6 Auli ski school
GMVN vs private schools (owner facts), how the tiers differ (from `courses.ts` tiers), a snow calendar, the instructor certification body, Joshimath–Auli access and ropeway status.

## 8. Off-page

### 8.1 Google Business Profile checklist (Joshimath office)
- [ ] Name exactly "Himalayan Arc Adventure" (no keywords added to the name).
- [ ] Primary category "Tour operator" (or "Trekking agency" if offered); secondary "Travel agency", "Ski school".
- [ ] Address identical to the site: "Near Military Hospital, Joshimath, Chamoli, Uttarakhand 246443". Make the footer show the same line (it currently omits "Near Military Hospital": `FooterV2.tsx:256`).
- [ ] Phone +91 78179 12062 (same primary everywhere); website `https://www.himalayanarcadventure.com/?utm_source=google&utm_medium=organic&utm_campaign=gbp`.
- [ ] Hours, service area (Chamoli, Uttarakhand), services list matching the trek names, and the price "from" where allowed.
- [ ] 20+ own photos: office exterior and interior, team, campsites, Auli slopes. Upload trek videos.
- [ ] One post per week (departures, snow updates), and Q&A seeded with real customer questions.
- [ ] After each batch: a WhatsApp message with the GBP review link to every trekker. No incentives, no filtering of unhappy customers, and a reply to every review.
- [ ] A separate Gurugram profile only if staff are there during stated hours (Google's eligibility rules).
- [ ] Bing Places and Apple Business Connect with the identical NAP.

### 8.2 Citations and white-hat links
- **Uttarakhand Tourism Development Board**: registered operator status (Trekking Rules 2022 define "Registered Operator") and the directory listing if it exists.
- Adventure Tour Operators Association of India (ATOAI) membership listing; Incredible India and Ministry of Tourism approval (if eligible).
- TripAdvisor (operator listing and reviews), Justdial, Sulekha, IndiaMART, Facebook page, YouTube, LinkedIn company page, all with the same NAP.
- Partners: Joshimath and Auli homestays and hotels, ski equipment shops and transporters, who can link "our trek partner" honestly.
- Linkable assets only we can make: a weekly winter **Auli and Joshimath snow report** (photos plus date) that travel media and bloggers cite; the ILP permit guide; a photo library licensed with credit (Creative Commons BY) for bloggers.
- Expert commentary for Indian travel media on Joshimath road and snow conditions.
- **Never:** buying links, PBNs, link swaps at scale, paid "best operator" listicles.

## 9. Search Console steps
1. Deploy this branch first, so the sitemap includes Tungnath, Madhyamaheshwar and the image entries.
2. GSC (Domain property, already DNS-verified) → **Sitemaps** → submit `https://www.himalayanarcadventure.com/sitemap.xml`.
3. **URL Inspection → Request indexing** (about 10–12 a day): `/`, `/treks`, `/treks/kuari-pass`, `/treks/pangarchula-peak`, `/treks/dronagiri-base-camp`, `/treks/valley-of-flowers`, `/treks/mana-pass`, `/treks/niti-pass`, `/treks/rimkhim`, `/treks/panpatia-col`, `/courses`, `/courses/skiing-course`, `/contact`, then the rest.
4. Run the Rich Results Test on one trek, one course and the home page (BreadcrumbList; Organization is parsed but not a rich result).
5. After 7–14 days check **Pages**: "Discovered – currently not indexed" means authority (links and GBP); "Crawled – currently not indexed" means thin or duplicate content (fix T2 first).
6. Bing Webmaster Tools: import from GSC and submit the same sitemap.
7. Link GA4 to GSC; review queries weekly; record when each page first appears.

## 10. SMO

### 10.1 Profiles (one name: "Himalayan Arc Adventure")
| Network | Current link on the site | Status | Action |
|---|---|---|---|
| Instagram | `instagram.com/himalayan_arc_adventure` | Couldn't verify while logged out | Owner confirms; bio link with UTM (10.4) |
| Facebook | `facebook.com/himalayan_arc_adventure` | **HTTP 400** (usernames can't contain "_") | Create a Page, e.g. `facebook.com/himalayanarcadventure`, then update `FooterV2.tsx:49` and `SOCIAL_PROFILES` (`seo.ts`) |
| YouTube | `youtube.com/@himalayan_arc_adventure` | **404** | Create the channel (`@himalayanarcadventure` if free); upload trek videos |
| X | `@himalayan_arc_adventure` (meta tag only) | Impossible handle (over 15 characters) | Optional. Add `twitter.creator` back to `seo.ts`/`layout.tsx` only once a real handle exists |

### 10.2 Share previews (WhatsApp, Facebook, X, Instagram link stickers)
| Page | og:image | Weight / shape | WhatsApp |
|---|---|---|---|
| Home, list pages, Tungnath, Madhyamaheshwar | `social-share.png` 1200×630 | 217 KB | OK |
| Kedarkantha, Har Ki Dun, Pangarchula, Nandi Kund, 7-day ski, 7-day snowboard | own photo | 100–258 KB, 4:3 or portrait | Shows, but cropped |
| VoF, Kuari, Hampta, Satopanth, Bhrigu, 2-week snowboard | own photo | 340–492 KB; Hampta and Bhrigu portrait | Unreliable (over 300 KB) |
| Dronagiri, 14-day ski, backcountry | own photo | 3.2–6.0 MB | **No preview** |
| Brahmatal, Roopkund, Kalindi, Gupt Khal, Panpatia, Nanda Devi, Mana, Niti, Rimkhim | Unsplash stock | small | Shows **stock, not ours** |

Fix with #9: one 1200×630 JPEG of about 120 KB per trek, made from our own photo, with the trek name, days and "Joshimath to Joshimath ₹X" (from data) overlaid.

### 10.3 Content calendar, keyed to `bestSeason`
| Month | Push (departures this season or next) | Formats from our own media (`public/assets/`) |
|---|---|---|
| Oct–Nov | Kedarkantha and Brahmatal (Dec–Apr / Dec–Mar), Kuari Pass (Oct–Feb), Pangarchula (Dec–Mar), Auli ski courses (Dec 2026–Mar 2027), Har Ki Dun autumn | Reels: `pangarchula-peak-trek/*.mp4`, `kuari-pass-trek/*.mov`; carousel "Kuari Pass day by day"; "What Joshimath to Joshimath includes" explainer; Kedarkantha snow photos (10) |
| Dec–Feb | Live season: snow reports from Joshimath and Auli; ski school | Shorts from `skiing/*.MP4` (6), `snowboarding/*.MOV` (8), `backcountry touring/*.mov` (8); weekly snow-report story with date and location |
| Mar–Apr | Pre-sell May–Jun / Sept–Oct: Dronagiri, Satopanth, Roopkund, Panpatia, Nandi Kund, Nanda Devi BC; permit tours (Jun–Jul & Sept–Oct) | Dronagiri videos (5), `panpatia-col-trek/Panpateya.mov`, `nandi-kund-trek/*.mov`; "How ILP permits work" carousel |
| May–Jun | High-altitude departures; Valley of Flowers teaser (Jul–Sept); Bhrigu Lake (mid-May–Oct); Hampta (Jun–Sept) | `birgu-lake/*.mov` (4); Hampta photos; trek-leader tips (packing, AMS) |
| Jul–Sept | Valley of Flowers blooms; Hampta; permit tours | VoF photo carousels by bloom; Hemkund Sahib day Reel; monsoon road-safety updates from Joshimath |
| Sept–Oct | Autumn high passes; then back to winter | Satopanth (8 photos), Kalindi/Panpatia expedition stories |

Caption template: *Hook (one line) → what the day felt like (first-hand) → facts (days, altitude, season, "₹X Joshimath to Joshimath") → CTA "WhatsApp us, link in bio" → location tag.*
Location tags: Joshimath, Auli, Govindghat, Ghangaria, Valley of Flowers National Park, Mana Village, Niti Valley, Chamoli.
Hashtag sets (pick 5–8, rotate; no follower bait):
- Joshimath set: #joshimath #chamoli #garhwalhimalaya #uttarakhandtourism #himalayanarcadventure
- Trek set: #kuaripass #pangarchula #pangarchulla #dronagiri #valleyofflowers #wintertrek #uttarakhandtrekking
- Snow school set: #auli #auliskiing #skiinginindia #snowboardingindia #aulisnow
- Permit tours: #manavillage #nitivalley #innerlinepermit #indiatibetborder
**Banned:** bought followers, engagement pods, botting, reposting without permission, fake giveaways.

### 10.4 UTM conventions
`?utm_source={platform}&utm_medium={channel}&utm_campaign={season-or-trek}&utm_content={post-id}`, all lowercase with hyphens.
| Placement | Example |
|---|---|
| Instagram bio | `/?utm_source=instagram&utm_medium=social-bio&utm_campaign=evergreen` |
| Reel or post | `/treks/kuari-pass?utm_source=instagram&utm_medium=social-post&utm_campaign=winter-2026&utm_content=reel-kuari-01` |
| WhatsApp broadcast | `/treks/pangarchula-peak?utm_source=whatsapp&utm_medium=broadcast&utm_campaign=winter-2026&utm_content=2026-11-01` |
| YouTube description | `/treks/dronagiri-base-camp?utm_source=youtube&utm_medium=video&utm_campaign=summer-2027` |
| GBP website button | `/?utm_source=google&utm_medium=organic&utm_campaign=gbp` |
Never put UTMs on internal links. Canonical tags already strip them.

## 11. Facts needed from the owner (before content can be written)
1. **Reviews and claims:** where the per-trek `rating`/`reviewCount` values come from; the "4.9 / 1,200+ Google Reviews" footer; "since 2010" / "Est. 2010"; "98% success rate"; "Trek of the Year"; whether the testimonials are real customers who consented.
2. **Pricing:** does the price for Kuari, Pangarchula, Valley of Flowers, Dronagiri, Gupt Khal, Mana, Niti and Rimkhim include the Rishikesh to Joshimath drive and those days? Is there a Rishikesh-pickup price? What does ₹5,000 cover on the 8–10 day permit tours? Is any discount real (former price and dates)? Is no-cost EMI actually offered?
3. **Altitudes:** Pangarchula (4,700 m vs about 4,590 m elsewhere), Dronagiri maximum (4,500 m vs 4,920 m on Day 7), Mana Pass (5,616 m), and the "India's highest motorable pass" wording.
4. **Permits and fees:** Valley of Flowers park entry and opening dates; Nanda Devi National Park / forest fees for Kuari, Pangarchula and Dronagiri; the ILP process, days, documents and foreigner rules for Mana, Niti and Rimkhim; Har Ki Dun camping rules.
5. **Distances:** road km and time from Joshimath to each trailhead (Dhak/Tugasi, Govindghat, Jumma, Mana, Niti, Malari) and to Auli.
6. **Team:** trek leader and ski instructor names, certifications (institute and course), years on each route; whether female leaders are available (the FAQ claims they are); the real group-size caps.
7. **Business:** UTDB registration number; insurance; GST; exact Joshimath address and map pin; hours; primary phone; whether Gurugram is staffed for walk-ins; GBP status.
8. **Socials:** the real Instagram, Facebook, YouTube and X URLs.
9. **Departures:** dates per season (for the Dates tabs, posts and WhatsApp broadcasts).
10. **Media:** original video files (to re-encode HEVC `.mov` to MP4 and upload to YouTube); permission to show leader photos; own photos for Brahmatal, Roopkund, Kalindi Khal, Gupt Khal, Nanda Devi BC, Mana, Niti and Rimkhim.
