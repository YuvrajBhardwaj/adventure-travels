# UI Audit: Site-wide UI Consistency and Polish (FR-001)

**Date**: 2026-10-22 | **Spec**: [spec.md](./spec.md) | **Checks**: [quickstart.md](./quickstart.md)

One row per inconsistency, by group of pages. Status flow: `fixed` (code change landed) → `verified` (passes its quickstart check) · `deferred` (needs a reason and the owner's approval). Everything below is `fixed`; `verified` is set only after the checks in "Verification" at the end are recorded.

Categories: colour · component · shape · typography · spacing · loading · motion · responsive · accessibility.

## Shared foundation (lead)

| ID | Area | Category | Found | Resolution | Status |
|---|---|---|---|---|---|
| A-CORE-01 | Navy chrome | colour | 34 hex classes for `#0F172A`, `#0B1222`, `#0B1D33`, `#020617`, `#0b0f17` | Named tokens `navy`, `navy-deep`, `navy-hero` in `globals.css` | fixed |
| A-CORE-02 | Component kit | component | Only button, card, badge, skeleton, avatar existed; 103 raw buttons | Added input, textarea, label, select, checkbox, spinner, empty-state, dialog, sheet, dark-scope; Button gained `destructive`, `link`, `loading` | fixed |
| A-CORE-03 | `buttonVariants` | component | Caller classes (e.g. `bg-white`) competed with variant classes | `buttonVariants` now merges with `tailwind-merge` | fixed |
| A-CORE-04 | Loading placeholders | loading | `.skeleton` class (background-position shimmer) plus pulse `Skeleton`; no show delay | One `Skeleton`: transform-only shimmer, 150ms fade-in delay, static for reduced motion; legacy `.skeleton` class removed | fixed |
| A-CORE-05 | Motion | motion | 12+ durations, 6+ curves | `src/lib/motion.ts` (fast/base/slow, out/inOut, sheet spring); Tailwind `ease-out`/`ease-in-out` re-pointed to the same curves | fixed |
| A-CORE-06 | Preloader | motion | Full-screen overlay hid every page until hydration + 600ms | Component deleted and removed from `layout.tsx` | fixed |
| A-CORE-07 | `SmartImage` | loading | Photos at `opacity-0` until hydration | Visible on first paint over a `Skeleton` underlay that is removed on load | fixed |
| A-CORE-08 | `MotionWrapper` | motion | Reveals started at `opacity:0` in the static HTML | Visible server render; only elements fully below the fold are hidden after mount and revealed on scroll | fixed |
| A-CORE-09 | Fonts | typography | Poppins downloaded but unused | Removed from `layout.tsx` | fixed |
| A-CORE-10 | Overlays | component | 7 hand-built overlays with their own focus and scroll handling | Radix-based `Dialog` and `Sheet` with framer-motion enter/exit | fixed |

## Account pages (login, signup, reset-password, dashboard) · LegacyDataNotice · WhatsAppFallback

| ID | Area | Category | Resolution | Status |
|---|---|---|---|---|
| A-ACCOUNT-01 | Four account pages | colour | `bg-[#0F172A]` → `DarkScope` + `bg-navy` | fixed |
| A-ACCOUNT-02 | LegacyDataNotice | colour | Hex surface → Dialog dark tone | fixed |
| A-ACCOUNT-03 | All four pages | component | Hand-styled `bg-white/5` inputs and labels → `Input`/`Label` | fixed |
| A-ACCOUNT-04 | Account pages | component | ~14 raw buttons → `Button`/`buttonVariants` | fixed |
| A-ACCOUNT-05 | Dashboard | component | Hand-written status pills → `Badge` | fixed |
| A-ACCOUNT-06 | Dashboard | component | Hand-styled cards and rows → `Card` dark, `rounded-2xl` | fixed |
| A-ACCOUNT-07 | GoogleSignInButton | component | White hand-styled button → outline `Button` with spinner | fixed |
| A-ACCOUNT-08 | Dashboard | loading | Four "Loading…" texts and empty "—" profile values → layout-true skeletons with `aria-busy` | fixed |
| A-ACCOUNT-09 | Reset password | loading | Waiting card gained `role="status"` | fixed |
| A-ACCOUNT-10 | Dashboard | component | Plain-text empty states → `EmptyState` with a next step | fixed |
| A-ACCOUNT-11 | WhatsAppFallback | shape / component | Rebuilt on `EmptyState` (amber), `rounded-2xl` | fixed |
| A-ACCOUNT-12 | LegacyDataNotice | motion / accessibility | Bespoke dialog → kit Dialog (focus trap, scroll lock, tokens) | fixed |
| A-ACCOUNT-13 | Login, signup | accessibility | Inputs lacked `id`/`htmlFor` → added | fixed |
| A-ACCOUNT-14 | Account pages | accessibility | Sub-44px text-link buttons → `min-h-11` | fixed |
| A-ACCOUNT-15 | Account pages | typography / spacing | h1, card padding → scale | fixed |

## Trek detail (`/treks/[id]`) · QuickInfoModal · ScholarshipsTab

| ID | Area | Category | Resolution | Status |
|---|---|---|---|---|
| A-TREK-01 | Reservation form | component | 5 hand-styled fields → `Input`/`Select`/`Textarea`/`Label` | fixed |
| A-TREK-02 | Reservation submit | loading | Inline SVG spinner → `Button loading` | fixed |
| A-TREK-03 | Booking card, bottom bar, itinerary, packing | component | 12+ raw action buttons → `Button`/`buttonVariants` | fixed |
| A-TREK-04 | Booking card | component | Hand-made status pills → `Badge` | fixed |
| A-TREK-05 | Dates loading | loading | `.skeleton` → `Skeleton` shaped like the rows | fixed |
| A-TREK-06 | Gallery empty | component | Hand-built box → `EmptyState` | fixed |
| A-TREK-07 | Gallery lightbox | component / accessibility | Hand-built dialog → `Dialog size="full"`; swipe added | fixed |
| A-TREK-08 | QuickInfoModal | component | Hand-built portal → `Dialog` (bottom on phones) | fixed |
| A-TREK-09 | Booking card | shape | `rounded-3xl` and a blur blob → `rounded-2xl` | fixed |
| A-TREK-10 | Booking card, tabs | colour | `gray-*` → `slate-*` | fixed |
| A-TREK-11 | Whole page | motion | Inline durations, `transition-all` → tokens | fixed |
| A-TREK-12 | Touch targets | accessibility | 28px icons, tabs, links → ≥44px | fixed |
| A-TREK-13 | Overview tiles | accessibility | "Know more" hover-only → visible on touch | fixed |
| A-TREK-14 | Tab headings | typography | `text-2xl` → section scale | fixed |
| A-TREK-15 | Scholarships links | component | Hand-written link buttons → `buttonVariants` | fixed |
| A-TREK-16 | Mini elevation chart | colour | Hex `stroke`/`fill` attributes inside inline SVG (not classes); left as is | **deferred** (SVG attributes, not class colours; owner to confirm) |

## Treks list, hub pages, hero slideshow, NoPhoto

| ID | Area | Category | Resolution | Status |
|---|---|---|---|---|
| A-TREKS-01 | /treks filters | component | Raw input/select → `Label`/`Input`/`Select` | fixed |
| A-TREKS-02 | /treks reset | component | Raw text button → `Button ghost` | fixed |
| A-TREKS-03 | /treks no results | component | Plain text → `EmptyState` with "Clear all filters" | fixed |
| A-TREKS-04 | Sort select | accessibility | No label, <44px → aria-label, h-11 | fixed |
| A-TREKS-05 | TrekCard | shape | Mixed radii → `rounded-2xl`, pill rating, `buttonVariants` CTA | fixed |
| A-TREKS-06 | TrekCard | motion | `shadow-2xl` swap, 700ms scale → transform-only lift and zoom at 200/300ms | fixed |
| A-TREKS-07 | TrekCard | accessibility | No focus style → `focus-visible` lift; icons `aria-hidden` | fixed |
| A-TREKS-08 | TrekCard | typography | `text-xl font-bold` → `text-lg sm:text-xl font-semibold` | fixed |
| A-TREKS-09 | Sidebar panel | shape / spacing | Heavy shadow, mixed padding → border + `shadow-sm`, `p-5 sm:p-6` | fixed |
| A-TREKS-10 | /treks top | colour / responsive | Light strip above hero → navy strip under the navbar | fixed |
| A-TREKS-11 | TrekHub header | colour | Hex → `bg-navy` | fixed |
| A-TREKS-12 | WallpaperCarousel | colour | Hex → `bg-navy` | fixed |
| A-TREKS-13 | WallpaperCarousel | motion | `"easeInOut"` string and literal 1.2s → `EASE.inOut`, named constant | fixed |
| A-TREKS-14 | WallpaperCarousel controls | accessibility | 32px → 44px hit areas | fixed |
| A-TREKS-15 | Hub pages | typography / spacing | h2, panels, chips → scale, `min-h-11` | fixed |
| A-TREKS-16 | Hub tables | responsive | `relative overflow-x-auto` wrappers kept; verified no overflow | fixed |
| A-TREKS-17 | NoPhoto | component | Bare gradient → EmptyState look on navy tokens | fixed |

## Courses, activities, destinations, ActivityRequestForm, CourseVideoBackdrop

| ID | Area | Category | Resolution | Status |
|---|---|---|---|---|
| A-COURSES-01 | /courses hero | colour | `cyan-300/400` → `sky-300` | fixed |
| A-COURSES-02 | /courses hero and CTA | colour | `#0B1D33`, `#22d3ee` → `navy-hero`, sky gradient | fixed |
| A-COURSES-03 | Course detail | colour | `cyan-*`, violet/blue/indigo tags → `sky-*`, `Badge` tones | fixed |
| A-COURSES-04 | Course detail batches | colour | Inline hex dots → emerald/amber/red classes | fixed |
| A-COURSES-05 | /activities | colour | cyan/indigo/blue/violet/gray gradients → sky, navy, slate | fixed |
| A-COURSES-06 | Course booking form | component | Raw fields → `Label`/`Input`/`Select`/`Textarea` | fixed |
| A-COURSES-07 | Course CTAs | component | Hand-styled pills → `Button`/`buttonVariants` (all booking CTAs primary) | fixed |
| A-COURSES-08 | Course submit | loading | "Submitting..." text → `Button loading` | fixed |
| A-COURSES-09 | Course gallery | loading | `.skeleton` span → `Skeleton` | fixed |
| A-COURSES-10 | ActivityRequestForm | loading | "Loading…" → skeletons shaped like the form | fixed |
| A-COURSES-11 | ActivityRequestForm | component | Hand-made `field` class → kit | fixed |
| A-COURSES-12 | Destinations | component | Raw search/selects/links → kit | fixed |
| A-COURSES-13 | Destinations | component | Custom empty block → `EmptyState` | fixed |
| A-COURSES-14 | /activities | component | Hand-styled links → `buttonVariants` | fixed |
| A-COURSES-15 | Four pages | shape | `rounded-3xl`/`[2rem]`/`[2.5rem]`/`lg` → `2xl`/`xl` | fixed |
| A-COURSES-16 | /courses hero | motion | Variant/clip reveal on first paint → static first paint | fixed |
| A-COURSES-17 | Four pages | motion | Raw `whileInView`, `initial opacity 0`, `useReveal` → MotionWrapper reveals | fixed |
| A-COURSES-18 | Course tabs | motion | Inline spring/0.2s → `transition("base")` | fixed |
| A-COURSES-19 | Destination cards | motion | State-driven hover overlay → CSS group-hover | fixed |
| A-COURSES-20 | Cards | motion | `duration-500/700`, `scale-[1.07]` → `duration-300 ease-out`, reduced-motion variants | fixed |
| A-COURSES-21 | Course lightbox | component | Hand-rolled portal → `Dialog size="full"`; swipe added | fixed |
| A-COURSES-22 | /activities cards | responsive | Description hover-only (unreadable on phones) → always shown | fixed |
| A-COURSES-23 | Tabs, dots, back link | accessibility | <44px → 44px hit areas | fixed |
| A-COURSES-24 | Course tab panel | accessibility | `focus:outline-none` removed | fixed |
| A-COURSES-25 | CourseVideoBackdrop | motion | Hydration mismatch from `matchMedia` in `useState` → `useSyncExternalStore` | fixed |
| A-COURSES-26 | Headings and spacing | typography / spacing | → scale | fixed |
| A-COURSES-27 | /courses cards | responsive | "View Course" wrapped → `whitespace-nowrap` | fixed |

## Contact, FAQ, cancellation policy, ContactPopup, TermsConditions, FloatingWhatsApp

| ID | Area | Category | Resolution | Status |
|---|---|---|---|---|
| A-MKT-01 | FAQ and policy heroes | colour | Hex gradient stops → `navy` token | fixed |
| A-MKT-02 | Contact form | component | Hand-styled fields and submit → kit; ids, names, validation kept | fixed |
| A-MKT-03 | Contact result | component | Hand-styled link and button → `buttonVariants`, `Button link` | fixed |
| A-MKT-04 | Three heroes | motion | `opacity:0` entrances → plain elements visible in HTML | fixed |
| A-MKT-05 | Contact FAQ, policy | motion | Raw hover springs → CSS hover; `FadeUp`/`StaggerContainer` scroll-ins | fixed |
| A-MKT-06 | Contact FAQ | accessibility / SEO | Answers mounted only when open → always mounted, `hidden` when closed | fixed |
| A-MKT-07 | /faq | component | Raw search/buttons → `Input`, `Button`, `EmptyState` | fixed |
| A-MKT-08 | /faq | SEO / accessibility | Only the active category in HTML → all 15 categories (70 panels) mounted and `hidden` | fixed (adds text to the static HTML; expected in the V3 diff) |
| A-MKT-09 | /faq tabs | shape / accessibility | `rounded-lg`, no `aria-pressed`, ~36px → pills, `min-h-11`, `aria-pressed` | fixed |
| A-MKT-10 | /faq CTA | component / shape | Hand-styled links, `rounded-3xl` → `buttonVariants`, `rounded-2xl` | fixed |
| A-MKT-11 | Policy voucher CTA | component | Hand-styled link → `buttonVariants` | fixed |
| A-MKT-12 | Three pages | typography / spacing | h2, containers, cards, `gray-*` → scale, `slate-*` | fixed |
| A-MKT-13 | ContactPopup | component / motion | Hand-built overlay → kit Dialog (bottom on phones) | fixed |
| A-MKT-14 | TermsConditions | component / accessibility | Conditional panels, ~36px tabs → mounted + `hidden`, `min-h-11` (T&C text now in the static HTML on trek pages) | fixed |
| A-MKT-15 | FloatingWhatsApp | motion / responsive | No reduced-motion guard, ignored safe area → tokens, `motion-reduce`, safe-area inset | fixed |
| A-MKT-16 | Contact info cards | accessibility | Short link targets → padded, `break-words` | fixed |

## Home page sections

| ID | Area | Category | Resolution | Status |
|---|---|---|---|---|
| A-HOME-01 | Hero | motion | Staggered entrance from `opacity:0` → heading, copy and CTAs visible at first paint | fixed |
| A-HOME-02 | Hero CTAs | component | Hand-built links → `buttonVariants lg` | fixed |
| A-HOME-03 | Hero dots | accessibility | ~6px dots, overlapping → 44px hit areas, centred per half | fixed |
| A-HOME-04 | Hero | motion | `"easeInOut"` strings, scroll cue looped under reduced motion → tokens, static | fixed |
| A-HOME-05 | WelcomeChooser | colour | `bg-[#0b0f17]` → `bg-navy-deep` | fixed |
| A-HOME-06 | WelcomeChooser | shape / typography / motion | h2 size, radii, `duration-500`, `transition-all`, no focus ring → scale, tokens, global ring | fixed |
| A-HOME-07 | Camping, Unlock | colour | `#0F172A` → `bg-navy`, `text-navy` | fixed |
| A-HOME-08 | Camping, Video | component / accessibility | Hand-rolled `role=dialog` overlays → Radix Dialog | fixed |
| A-HOME-09 | Camping, Unlock, HowItWorks | component | Hand-styled buttons → `Button`/`buttonVariants` | fixed |
| A-HOME-10 | CallToActionV2 | component / shape | `rounded-[2rem]`, gradient overlay buttons, spin ignoring reduced motion → `rounded-2xl`, `buttonVariants`, `motion-reduce` | fixed |
| A-HOME-11 | HimalayanMap | colour | Violet `#8B5CF6` → cta orange; `gray-*` → `slate-*` | fixed |
| A-HOME-12 | HimalayanMap | motion | Panel animation not reduced-motion aware → tokens, `initial={false}` | fixed |
| A-HOME-13 | FAQV2 | component / motion | Hand-styled input, hover spring → kit `Input`, tokens | fixed |
| A-HOME-14 | All sections | typography | Mixed h2 sizes → `text-3xl sm:text-4xl font-bold tracking-[-0.02em]` | fixed |
| A-HOME-15 | All sections | typography | Mixed card titles → `text-lg font-semibold` | fixed |
| A-HOME-16 | All sections | spacing | `px-6`, `p-6`/`p-4` → `max-w-7xl px-4 sm:px-6 lg:px-8`, `p-5 sm:p-6` | fixed |
| A-HOME-17 | Cards | shape | 14 `rounded-3xl` → `rounded-2xl` | fixed |
| A-HOME-18 | Cards | motion | `transition-all`, `duration-700` zooms → specific properties at 200/300ms | fixed |
| A-HOME-19 | Link rows | accessibility | Under 44px → `min-h-11` | fixed |
| A-HOME-20 | StatsStrip | motion | Counters rendered 0 in the HTML → real values in the HTML; count-up only when below the fold | fixed |
| A-HOME-21 | ScrollProgressRing | motion | `transition-opacity` → `transition-colors duration-150` | fixed |

## Navbar, footer, search, page fade

| ID | Area | Category | Resolution | Status |
|---|---|---|---|---|
| A-CHROME-01 | Navbar | colour | Hex → `navy`/`navy-deep` | fixed |
| A-CHROME-02 | Footer | colour | `#0F172A`, `#1E293B` wave, `teal-500` → `bg-navy`, `fill-slate-800`, `emerald-600` | fixed |
| A-CHROME-03 | Navbar Sign up | component / shape | `rounded-full` link → `buttonVariants` primary, `rounded-xl` | fixed |
| A-CHROME-04 | Mobile drawer | component | Hand-rolled dialog → `Sheet side="right"` with swipe-to-close | fixed |
| A-CHROME-05 | Drawer actions | component / shape | Raw links → `buttonVariants`; WhatsApp stays primary | fixed |
| A-CHROME-06 | Navbar | motion | Local `EASE`, five different durations → `transition()` tokens | fixed |
| A-CHROME-07 | Menu rows | accessibility | Account rows had no focus style → shared inset ring | fixed |
| A-CHROME-08 | Drawer chips | accessibility | ~32px → `min-h-11` | fixed |
| A-CHROME-09 | Footer newsletter | component | Raw input + `motion.button` → `Input` + `Button` | fixed |
| A-CHROME-10 | Footer (mobile) | accessibility | 20px rows, 36px socials → 44px | fixed |
| A-CHROME-11 | Footer | motion | Custom curve, `whileHover` scale → tokens, CSS hover | fixed |
| A-CHROME-12 | Footer | accessibility | `text-white/30` and `/40` copy → `/50` and `/55` | fixed |
| A-CHROME-13 | Footer | shape | `rounded-lg` tiles → `rounded-xl` | fixed |
| A-CHROME-14 | CurrencySwitcher | component / shape | Raw `rounded-full` select → kit `Select` | fixed |
| A-CHROME-15 | DesktopSearch | component / responsive | Raw input; pushed "Sign up" off the bar at 1024 → `Input`, overlay | fixed |
| A-CHROME-16 | MobileSearchButton | component | Custom scrim + panel → bottom `Sheet`, `Input` | fixed |
| A-CHROME-17 | template.tsx | motion | `0.35s` custom curve → `transition("slow")` | fixed |

## Checkout and admin

| ID | Area | Category | Resolution | Status |
|---|---|---|---|---|
| A-CHK-01 | Pay button | loading | Inline `Loader2` → `Button loading` | fixed |
| A-CHK-02 | Pay button | component | Same weight as other CTAs → `min-h-14`, full width, emerald shadow | fixed |
| A-CHK-03 | Checkout loading | loading | 3 generic skeletons → layout-true skeleton | fixed |
| A-CHK-04 | WhatsApp fallbacks | component | Outline style → primary `buttonVariants` | fixed |
| A-CHK-05 | Error box | shape | `rounded-lg` → `rounded-2xl` | fixed |
| A-CHK-06 | Summary/balance box | shape | `rounded-xl` → `rounded-2xl` | fixed |
| A-CHK-07 | Back link | accessibility | h-5 → `min-h-11` | fixed |
| A-CHK-08 | Card and panel fades | motion | Raw 0.35s → tokens | fixed |
| A-CHK-09 | PaymentStatus | motion | Literals → tokens | fixed |
| A-CHK-10 | PaymentStatus | loading | `Loader2` → `Spinner size="md"` | fixed (documented exception: the continuing state of the Pay action) |
| A-CHK-11 | TrustSection | shape | `rounded-lg`/`xl`, hover lift on non-links → pills, no lift | fixed |
| A-CHK-12 | PaymentChoice | colour | No dark variants → added | fixed |
| A-ADM-01 | Bookings filters | component | Raw input/select → `Input`/`Select`/`Checkbox` | fixed |
| A-ADM-02 | Refund confirm | component | `bg-red-600` override → `variant="destructive"` with `loading` | fixed |
| A-ADM-03 | Refresh buttons (4) | loading | Hand-spun icon → `Button loading` | fixed |
| A-ADM-04 | Bookings/payments | loading | Flat skeleton stack → row-shaped placeholders | fixed |
| A-ADM-05 | History drawer | component | Bespoke aside + scrim → `Sheet side="right"` | fixed |
| A-ADM-06 | Drawer skeleton | loading | Two flat bars → timeline-shaped | fixed |
| A-ADM-07 | Empty tables | component | Plain `<p>` → `EmptyState` | fixed |
| A-ADM-08 | ActivityFeed | loading | "Loading…" in button → `Button loading` | fixed |
| A-ADM-09 | AdminNav | shape / accessibility | `rounded-lg`, ~36px → pills, 44px | fixed |
| A-ADM-10 | AdminGate | loading | Single `h-96` skeleton → tab-bar + panel placeholder | fixed |
| A-ADM-11 | Customers list | accessibility | 40px refresh → 44px | fixed |
| A-ADM-12 | `labels.ts` FIELD | component | Legacy field class → removed once Departures migrated | fixed |
| A-ADM-13 | Admin titles | typography | `text-base` → `text-lg font-semibold` | fixed |
| A-DEP-01 | Departures fields | component | Raw `input`/`select` with `FIELD` → kit | fixed |
| A-DEP-02 | Departures "Closed" toggle | component / accessibility | → `Checkbox`, 44px delete | fixed |
| A-DEP-03 | Departures refresh and toggle | loading / shape | → `Button loading`; toggle `rounded-xl` | fixed |
| A-DEP-04 | Departures loading and empty | loading / component | → `Skeleton` table, `EmptyState` | fixed |
| A-DEP-05 | `labels.ts` | component | `FIELD` removed | fixed |

## Open decisions for the owner (found during the audit; not changed)

| ID | Where | Finding |
|---|---|---|
| D-01 | Trek page | A signed-out visitor is sent to `/signup` before WhatsApp opens; the form details are lost (also in the traffic plan, D1) |
| D-02 | Trek page | Crossed-out "10% OFF" price is derived (`price / 0.9`), not real data |
| D-03 | Trek page | "No-cost EMI · Free Trek Date Change" is shown; the Scholarships tab only says "Ask us which cards work", and the terms call the advance non-refundable |
| D-04 | Course pages | Batch dates and "Filling Fast" / "Sold Out" labels come from a repeating cycle (`C_CYCLE`), not real seat counts |
| D-05 | /activities, footer, home CTA | Unsourced claims: "5,000+ Happy Adventurers", "100% Safety Record", "4.8/5", "4.9+ Rating", "4.9 / 1,200+ Google Reviews", "Since 2010" |
| D-06 | Home | SummerTreksRail hard-codes "18 treks"; the data has 21 routes |
| D-07 | Contact vs FAQ | Opening hours differ (Mon–Fri 9–6 vs Mon–Sat 9–7) |
| D-08 | Site | `FloatingWhatsApp` is mounted only on the home page |
| D-09 | Footer | Newsletter shows a success state with no backend |
| D-10 | Checkout | In headless Edge, `/checkout?booking=x` stayed at inline `opacity:0` after 10s (also before the polish; probably the signed-out redirect); needs a look with a real session |
| D-11 | Dashboard | Cancelling a booking uses `window.confirm`; swapping it for a Dialog would change the flow |
| D-12 | Mini elevation chart | Hex colours in SVG attributes (A-TREK-16) |

## Verification (2026-10-22)

V1–V5 results are in [quickstart.md](./quickstart.md) → Results. All rows above are `fixed`. They become `verified` once someone has done V6–V9 (slow-network walk, a real phone, keyboard and contrast pass, signed-in flows). A-COURSES-28 (found in the final pass): course pages overflowed sideways at 1024px; the main column now has `min-w-0` (responsive, fixed).
