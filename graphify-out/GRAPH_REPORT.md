# Graph Report - src  (2026-11-20)

## Corpus Check
- 157 files · ~117,252 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 1 file(s) not represented in the graph (top: .css 1)

## Summary
- 898 nodes · 3454 edges · 40 communities (39 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ad2c0e66`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- CourseDetailClient.tsx
- cn
- CheckoutClient.tsx
- [id]/page.tsx
- utils.ts
- ref_next
- TrekDetailClient.tsx
- Price
- admin.ts
- BookingsAdminClient.tsx
- PaymentsAdminClient.tsx
- motion.ts
- buttonVariants
- CurrencyContext.tsx
- departures.ts
- WelcomeChooser.tsx
- DeparturesAdminClient.tsx
- app/page.tsx
- TreksPageClient.tsx
- ReservationTab
- FadeUp
- tours/page.tsx
- ActivitiesPageClient.tsx
- CustomersAdminClient.tsx
- chopta-tungnath/page.tsx
- TrekHub.tsx
- departures.test.ts
- QuickInfoModal.tsx
- treks.ts
- treks
- EmptyState
- FAQPageClient.tsx
- priceRoute
- ElevationLine
- FooterV2.tsx
- TheRange.tsx
- tourPhotos.ts
- useDepartures.ts
- courseSeason.ts
- cancellation-policy/page.tsx

## God Nodes (most connected - your core abstractions)
1. `cn()` - 123 edges
2. `Button` - 63 edges
3. `buttonVariants()` - 56 edges
4. `transition()` - 54 edges
5. `Price()` - 45 edges
6. `Input` - 44 edges
7. `FadeUp()` - 39 edges
8. `CourseDetailClient()` - 34 edges
9. `Skeleton()` - 33 edges
10. `DashboardPage()` - 30 edges

## Surprising Connections (you probably didn't know these)
- `AddBatches()` --indirect_call--> `dayLabel()`  [INFERRED]
  adventure-travel/src/app/admin/departures/DeparturesAdminClient.tsx → adventure-travel/src/lib/departures.ts
- `CoursesPage()` --calls--> `CoursesPageClient()`  [EXTRACTED]
  adventure-travel/src/app/courses/page.tsx → adventure-travel/src/app/courses/CoursesPageClient.tsx
- `TREK_MONTHS` --calls--> `seasonMonths()`  [EXTRACTED]
  adventure-travel/src/app/treks/TreksPageClient.tsx → adventure-travel/src/lib/season.ts
- `WINTER_TREKS` --calls--> `seasonMonths()`  [EXTRACTED]
  adventure-travel/src/app/winter-treks-uttarakhand/page.tsx → adventure-travel/src/lib/season.ts
- `clampY()` --indirect_call--> `H()`  [INFERRED]
  adventure-travel/src/components/ElevationLine.tsx → adventure-travel/src/components/QuickInfoModal.tsx

## Import Cycles
- None detected.

## Communities (40 total, 1 thin omitted)

### Community 0 - "CourseDetailClient.tsx"
Cohesion: 0.05
Nodes (97): FilterSelect(), Collapse(), ContactPage(), FAQS, courseDays(), CourseDetailClient(), CourseTabPanel(), INC_ICONS (+89 more)

### Community 1 - "cn"
Cohesion: 0.06
Nodes (71): noSubscribe(), Template(), GalleryTab(), QuickInfo(), CallToActionV2(), ALL_MOMENTS, Camp, CampingSection() (+63 more)

### Community 2 - "CheckoutClient.tsx"
Cohesion: 0.09
Nodes (32): CheckoutClient(), describePaid(), loadRazorpay(), longDate(), Phase, RazorpayFailure, RazorpayInstance, RazorpaySuccess (+24 more)

### Community 3 - "[id]/page.tsx"
Cohesion: 0.10
Nodes (21): metadata, metadata, generateMetadata(), priceSentence(), CoursesPage(), durations, metadata, tiers (+13 more)

### Community 4 - "utils.ts"
Cohesion: 0.11
Nodes (20): AdminActivityClient(), AdminActivityPage(), metadata, ACTIONS, ActivityFeed(), browserLabel(), FALLBACK, FeedSkeleton() (+12 more)

### Community 5 - "ref_next"
Cohesion: 0.09
Nodes (16): metadata, fraunces, inter, metadata, spaceGrotesk, viewport, metadata, metadata (+8 more)

### Community 6 - "TrekDetailClient.tsx"
Cohesion: 0.09
Nodes (29): DATES_BADGE, FULL_MONTHS, GALLERY_IMAGES, galleryMedia(), getHeroSlides(), HIGHLIGHT_ICONS, IncludedTab(), OverviewTab() (+21 more)

### Community 7 - "Price"
Cohesion: 0.14
Nodes (23): AuliWinterEscapePage(), GroupOffers(), inr(), metadata, CHILD_ELIGIBLE, OTHER_PERKS, ScholarshipsTab(), Price() (+15 more)

### Community 8 - "admin.ts"
Cohesion: 0.11
Nodes (28): CustomersAdmin(), addDepartures(), AdminCustomer, AdminPayment, BookingEvent, bookingRef(), BookingType, countDepartures() (+20 more)

### Community 9 - "BookingsAdminClient.tsx"
Cohesion: 0.14
Nodes (22): BookingsAdmin(), BookingsAdminClient(), describeEvent(), HistoryDrawer(), PAYMENT_STATES, ServerFilters, STATUSES, TableSkeleton() (+14 more)

### Community 10 - "PaymentsAdminClient.tsx"
Cohesion: 0.23
Nodes (20): CustomerDetail(), AddBatches(), defaultCapacity(), DeparturesAdmin(), AdminPaymentsPage(), metadata, FailedEmails(), PaymentsAdmin() (+12 more)

### Community 11 - "motion.ts"
Cohesion: 0.19
Nodes (15): CoursesPageClient(), GALLERY_WALLPAPERS, HERO_MEDIA, EnquireTab(), AnimationProps, reveal(), ScaleIn(), useDeferredReveal() (+7 more)

### Community 12 - "buttonVariants"
Cohesion: 0.15
Nodes (16): AscentHero(), FROM_PRICE, MAX_DAYS, MIN_DAYS, SLIDES, Stage(), TOP, COPY (+8 more)

### Community 13 - "CurrencyContext.tsx"
Cohesion: 0.17
Nodes (17): RootLayout(), CurrencySwitcher(), Ctx, CurrencyCtx, CurrencyProvider(), Rates, readSaved(), Saved (+9 more)

### Community 14 - "departures.ts"
Cohesion: 0.19
Nodes (18): tripLabel(), FULL, SHORT, StartDatePicker(), WEEKDAYS, addDays(), batchLabel(), dayLabel() (+10 more)

### Community 15 - "WelcomeChooser.tsx"
Cohesion: 0.22
Nodes (14): levelStats, NoPhoto(), related(), RelatedTreks(), SummerTreksRail(), TrekPhotoCard(), buildTiles(), PreviewItem (+6 more)

### Community 16 - "DeparturesAdminClient.tsx"
Cohesion: 0.15
Nodes (15): BatchesSkeleton(), BatchRow(), DeparturesAdminClient(), SEAT_TONE, TREKS, WEEKDAYS, AdminDeparturesPage(), metadata (+7 more)

### Community 17 - "app/page.tsx"
Cohesion: 0.18
Nodes (13): FAQV2, Home(), Brand, BrandIcon(), BRANDS, FloatingWhatsApp(), Chapter, CHAPTERS (+5 more)

### Community 18 - "TreksPageClient.tsx"
Cohesion: 0.12
Nodes (16): ALTITUDE_HIGH, ALTITUDE_LOW, DIFFICULTIES, DIFFICULTY_ORDER, DURATION_OPTIONS, HERO_PHOTOS, HERO_SLIDES, MONTH_NAMES (+8 more)

### Community 19 - "ReservationTab"
Cohesion: 0.21
Nodes (17): BookingCard(), DatesTab(), Field(), FieldError(), MonthDays(), MonthHighlight(), PriceRoute(), ReservationTab() (+9 more)

### Community 20 - "FadeUp"
Cohesion: 0.26
Nodes (12): CardSlideshow(), offsetFor(), FindYourTrek(), FadeUp(), SnowSchool(), StoriesTestimonials(), RailItem(), SwipeRail() (+4 more)

### Community 21 - "tours/page.tsx"
Cohesion: 0.18
Nodes (13): CourseDetailPage(), COURSE_ROUTES, dynamic, ownImages(), STATIC_ROUTES, TOUR_ROUTES, TREK_ROUTES, ChoptaTungnathPage() (+5 more)

### Community 22 - "ActivitiesPageClient.tsx"
Cohesion: 0.24
Nodes (12): activities, ActivitiesPage(), LEVEL_DOTS, RESTRICTED, waLink(), CancellationPolicyPage(), MailIcon(), VOUCHER_POINTS (+4 more)

### Community 23 - "CustomersAdminClient.tsx"
Cohesion: 0.22
Nodes (12): CustomersAdminClient(), Detail, AdminCustomersPage(), metadata, KIND_LABEL, PAYMENT_STATE_LABEL, PAYMENT_STATE_TONE, PAYMENT_STATUS_TONE (+4 more)

### Community 24 - "chopta-tungnath/page.tsx"
Cohesion: 0.17
Nodes (11): covers(), DAYS, metadata, packages, pkg, CHOPTA_INTRO, CHOPTA_SLUG, CHOPTA_TREK (+3 more)

### Community 25 - "TrekHub.tsx"
Cohesion: 0.18
Nodes (12): fromPrice, JOSHIMATH_TREKS, metadata, PERMIT_TOURS, TreksFromJoshimathPage(), TrekCard(), fromPrice, metadata (+4 more)

### Community 26 - "departures.test.ts"
Cohesion: 0.23
Nodes (9): DEPARTURE_CALENDAR, DepartureCalendar, MONTH_HIGHLIGHTS, seasonStrip(), SeatStatus, monthIndex(), MonthName, MONTHS (+1 more)

### Community 27 - "QuickInfoModal.tsx"
Cohesion: 0.24
Nodes (12): AGE, EXPERIENCE, FITNESS, H(), MONTHS, P(), QuickInfoId, quickInfoModalBody() (+4 more)

### Community 28 - "treks.ts"
Cohesion: 0.20
Nodes (10): LEVELS, regionStats, STEP_HEIGHT, topAltitude, DIFFICULTIES, DIFFICULTY_COLORS, faqItems, ItineraryDay (+2 more)

### Community 29 - "treks"
Cohesion: 0.18
Nodes (10): CourseInclusion, CourseItineraryDay, courses, CourseTier, SKI14_PREMIUM_ITINERARY, SKIING_LOCAL_GALLERY, SKIING_LOCAL_VIDEOS, treks (+2 more)

### Community 30 - "EmptyState"
Cohesion: 0.33
Nodes (6): Dest, DestinationsPage(), difficultyRanges, PopularTreks(), LoadError(), EmptyState()

### Community 31 - "FAQPageClient.tsx"
Cohesion: 0.29
Nodes (10): ChevronDownIcon(), Collapse(), FAQ_CATEGORIES, FAQCategory, FAQItemData, FAQPage(), MailIcon(), MessageCircleIcon() (+2 more)

### Community 32 - "priceRoute"
Cohesion: 0.35
Nodes (9): esc(), inr(), list(), printItinerary(), ItineraryTab(), getTrekPackage(), mealCount(), TrekPackage (+1 more)

### Community 33 - "ElevationLine"
Cohesion: 0.42
Nodes (10): area(), clampY(), ElevationLine(), line(), n(), Pt, ridge(), seeded() (+2 more)

### Community 34 - "FooterV2.tsx"
Cohesion: 0.22
Nodes (9): destinations, FooterV2(), instagramImages, legalLinks, MobileAccordion(), popularTreks, quickLinks, socials (+1 more)

### Community 35 - "TheRange.tsx"
Cohesion: 0.33
Nodes (8): BY_HEIGHT, peakPath(), RANGE, REGIONS, short(), TheRange(), y(), stats

### Community 36 - "tourPhotos.ts"
Cohesion: 0.29
Nodes (3): dynamic, runtime, TOUR_PHOTO_FOLDERS

### Community 37 - "useDepartures.ts"
Cohesion: 0.43
Nodes (6): DeparturesState, Row, useDepartures(), Departure, mergeDepartures(), todayInIndia()

### Community 38 - "courseSeason.ts"
Cohesion: 0.60
Nodes (4): courseSeason(), courseStartDates(), iso(), MONTHS

## Knowledge Gaps
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `CourseDetailClient.tsx`, `CheckoutClient.tsx`, `utils.ts`, `TrekDetailClient.tsx`, `Price`, `admin.ts`, `BookingsAdminClient.tsx`, `PaymentsAdminClient.tsx`, `motion.ts`, `buttonVariants`, `CurrencyContext.tsx`, `departures.ts`, `DeparturesAdminClient.tsx`, `app/page.tsx`, `TreksPageClient.tsx`, `ReservationTab`, `FadeUp`, `ActivitiesPageClient.tsx`, `CustomersAdminClient.tsx`, `TrekHub.tsx`, `EmptyState`, `FAQPageClient.tsx`, `ElevationLine`, `TheRange.tsx`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Should `CourseDetailClient.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05141113653699466 - nodes in this community are weakly interconnected._
- **Why does `Button` connect `CourseDetailClient.tsx` to `priceRoute`, `cn`, `CheckoutClient.tsx`, `FooterV2.tsx`, `utils.ts`, `TrekDetailClient.tsx`, `Price`, `admin.ts`, `BookingsAdminClient.tsx`, `PaymentsAdminClient.tsx`, `buttonVariants`, `departures.ts`, `DeparturesAdminClient.tsx`, `TreksPageClient.tsx`, `ReservationTab`, `CustomersAdminClient.tsx`, `EmptyState`, `FAQPageClient.tsx`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.06416978776529339 - nodes in this community are weakly interconnected._
- **Why does `buttonVariants()` connect `buttonVariants` to `CourseDetailClient.tsx`, `cn`, `CheckoutClient.tsx`, `TheRange.tsx`, `utils.ts`, `TrekDetailClient.tsx`, `Price`, `motion.ts`, `app/page.tsx`, `ReservationTab`, `FadeUp`, `ActivitiesPageClient.tsx`, `EmptyState`, `FAQPageClient.tsx`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Should `CheckoutClient.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09268292682926829 - nodes in this community are weakly interconnected._
- **Should `[id]/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0960960960960961 - nodes in this community are weakly interconnected._