# Graph Report - src  (2026-11-07)

## Corpus Check
- 144 files · ~110,976 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 1 file(s) not represented in the graph (top: .css 1)

## Summary
- 854 nodes · 3191 edges · 38 communities (34 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3d58c66b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ref_react
- transition
- CheckoutClient.tsx
- TreksPageClient.tsx
- ref_next
- BookingsAdminClient.tsx
- admin.ts
- CourseDetailClient.tsx
- TrekDetailClient.tsx
- cn
- Price
- FadeUp
- departures.ts
- DeparturesAdminClient.tsx
- buttonVariants
- motion.ts
- app/layout.tsx
- CurrencyContext.tsx
- PaymentsAdminClient.tsx
- TrekHub.tsx
- AdminGate.tsx
- [course]/page.tsx
- FAQPageClient.tsx
- fitTitle
- Trek
- BookingCard
- FooterV2.tsx
- courses.ts
- courses/page.tsx
- sitemap.ts
- route.tsx
- ReservationTab
- CampingSection.tsx
- treks-from-joshimath/page.tsx
- Logo.tsx
- cancellation-policy/page.tsx
- dashboard/layout.tsx
- robots.ts

## God Nodes (most connected - your core abstractions)
1. `cn()` - 122 edges
2. `Button` - 60 edges
3. `buttonVariants()` - 54 edges
4. `transition()` - 50 edges
5. `Input` - 42 edges
6. `FadeUp()` - 41 edges
7. `CourseDetailClient()` - 34 edges
8. `Price()` - 34 edges
9. `Skeleton()` - 31 edges
10. `DashboardPage()` - 30 edges

## Surprising Connections (you probably didn't know these)
- `AddBatches()` --indirect_call--> `dayLabel()`  [INFERRED]
  adventure-travel/src/app/admin/departures/DeparturesAdminClient.tsx → adventure-travel/src/lib/departures.ts
- `CoursesPage()` --calls--> `CoursesPageClient()`  [EXTRACTED]
  adventure-travel/src/app/courses/page.tsx → adventure-travel/src/app/courses/CoursesPageClient.tsx
- `ownImages()` --indirect_call--> `absoluteUrl()`  [INFERRED]
  adventure-travel/src/app/sitemap.ts → adventure-travel/src/lib/seo.ts
- `TreksFromJoshimathPage()` --calls--> `TrekHub()`  [EXTRACTED]
  adventure-travel/src/app/treks-from-joshimath/page.tsx → adventure-travel/src/components/TrekHub.tsx
- `clampY()` --indirect_call--> `H()`  [INFERRED]
  adventure-travel/src/components/ElevationLine.tsx → adventure-travel/src/components/QuickInfoModal.tsx

## Import Cycles
- None detected.

## Communities (38 total, 4 thin omitted)

### Community 0 - "ref_react"
Cohesion: 0.06
Nodes (82): Collapse(), ContactPage(), FAQS, actionsFor(), cap(), DashboardPage(), day(), KIND_LABEL (+74 more)

### Community 1 - "transition"
Cohesion: 0.06
Nodes (63): noSubscribe(), Template(), GalleryTab(), isVideo(), DesktopSearch(), LEGACY_KEYS, LegacyDataNotice(), MobileSearchButton() (+55 more)

### Community 2 - "CheckoutClient.tsx"
Cohesion: 0.09
Nodes (33): CheckoutClient(), describePaid(), loadRazorpay(), longDate(), Phase, RazorpayFailure, RazorpayInstance, RazorpaySuccess (+25 more)

### Community 3 - "TreksPageClient.tsx"
Cohesion: 0.09
Nodes (32): Dest, DestinationsPage(), difficultyRanges, PopularTreks(), ALTITUDE_HIGH, ALTITUDE_LOW, DIFFICULTIES, DIFFICULTY_ORDER (+24 more)

### Community 4 - "ref_next"
Cohesion: 0.11
Nodes (26): LEVELS, regionStats, STEP_HEIGHT, topAltitude, getRegionTreks(), HimalayanMap(), regions, initials() (+18 more)

### Community 5 - "BookingsAdminClient.tsx"
Cohesion: 0.12
Nodes (30): BookingsAdmin(), BookingsAdminClient(), describeEvent(), FilterSelect(), HistoryDrawer(), PAYMENT_STATES, ServerFilters, STATUSES (+22 more)

### Community 6 - "admin.ts"
Cohesion: 0.10
Nodes (31): BatchRow(), addDepartures(), AdminCustomer, AdminPayment, BookingEvent, bookingRef(), BookingType, countDepartures() (+23 more)

### Community 7 - "CourseDetailClient.tsx"
Cohesion: 0.10
Nodes (31): AvailabilityView(), C_CYCLE, CAvail, CAVAIL, CMONTHS, CourseBatch, CourseBatchRow(), courseDays() (+23 more)

### Community 8 - "TrekDetailClient.tsx"
Cohesion: 0.09
Nodes (28): DATES_BADGE, FULL_MONTHS, GALLERY_IMAGES, galleryMedia(), getHeroSlides(), HIGHLIGHT_ICONS, OverviewTab(), PACKING_GROUPS (+20 more)

### Community 9 - "cn"
Cohesion: 0.17
Nodes (24): CustomerDetail(), CustomersAdmin(), AddBatches(), defaultCapacity(), DeparturesAdmin(), ACTIONS, ActivityFeed(), browserLabel() (+16 more)

### Community 10 - "Price"
Cohesion: 0.16
Nodes (20): CHILD_ELIGIBLE, OTHER_PERKS, ScholarshipsTab(), CardSlideshow(), offsetFor(), NoPhoto(), Price(), SmartImage() (+12 more)

### Community 11 - "FadeUp"
Cohesion: 0.16
Nodes (22): activities, ActivitiesPage(), LEVEL_DOTS, RESTRICTED, waLink(), CancellationPolicyPage(), MailIcon(), REFUND_NOTE (+14 more)

### Community 12 - "departures.ts"
Cohesion: 0.16
Nodes (22): DeparturesState, Row, useDepartures(), DEPARTURE_CALENDAR, DepartureCalendar, MONTH_HIGHLIGHTS, addDays(), Departure (+14 more)

### Community 13 - "DeparturesAdminClient.tsx"
Cohesion: 0.13
Nodes (15): BatchesSkeleton(), DeparturesAdminClient(), SEAT_TONE, TREKS, WEEKDAYS, AdminDeparturesPage(), metadata, LoadError() (+7 more)

### Community 14 - "buttonVariants"
Cohesion: 0.17
Nodes (18): FAQV2, Home(), Brand, BrandIcon(), BRANDS, CallToActionV2(), CampingSection(), ContactPopup() (+10 more)

### Community 15 - "motion.ts"
Cohesion: 0.13
Nodes (16): GALLERY_WALLPAPERS, HERO_MEDIA, CarouselLayer(), FROM_PRICE, MAX_DAYS, MIN_DAYS, SeasonSplitHero(), Slide (+8 more)

### Community 16 - "app/layout.tsx"
Cohesion: 0.12
Nodes (14): fraunces, inter, metadata, spaceGrotesk, viewport, metadata, metadata, metadata (+6 more)

### Community 17 - "CurrencyContext.tsx"
Cohesion: 0.18
Nodes (16): RootLayout(), Ctx, CurrencyCtx, CurrencyProvider(), Rates, readSaved(), Saved, useCurrency() (+8 more)

### Community 18 - "PaymentsAdminClient.tsx"
Cohesion: 0.24
Nodes (14): AdminPaymentsPage(), metadata, FailedEmails(), PaymentsAdmin(), PaymentsAdminClient(), PaymentsSkeleton(), cap(), dateTime() (+6 more)

### Community 19 - "TrekHub.tsx"
Cohesion: 0.21
Nodes (12): TrekCard(), fromPrice, metadata, SNOW_TREKS, WINTER_TREKS, WinterTreksPage(), TrekHub(), priceRoute() (+4 more)

### Community 20 - "AdminGate.tsx"
Cohesion: 0.20
Nodes (10): AdminActivityClient(), AdminActivityPage(), metadata, CustomersAdminClient(), AdminCustomersPage(), metadata, AdminGate(), AdminNav() (+2 more)

### Community 21 - "[course]/page.tsx"
Cohesion: 0.27
Nodes (12): CourseDetailPage(), generateMetadata(), inr(), priceSentence(), generateMetadata(), inr(), TrekDetailPage(), trekTitle() (+4 more)

### Community 22 - "FAQPageClient.tsx"
Cohesion: 0.20
Nodes (12): ChevronDownIcon(), Collapse(), FAQ_CATEGORIES, FAQCategory, FAQItemData, FAQPage(), MailIcon(), MessageCircleIcon() (+4 more)

### Community 23 - "fitTitle"
Cohesion: 0.15
Nodes (5): metadata, metadata, metadata, metadata, fitTitle()

### Community 24 - "Trek"
Cohesion: 0.26
Nodes (11): esc(), inr(), list(), printItinerary(), IncludedTab(), ItineraryTab(), PreviewItem, getTrekPackage() (+3 more)

### Community 25 - "BookingCard"
Cohesion: 0.27
Nodes (13): BookingCard(), DatesTab(), MonthDays(), MonthHighlight(), PriceRoute(), SelectedDate(), cadenceLabel(), datesBadge() (+5 more)

### Community 26 - "FooterV2.tsx"
Cohesion: 0.24
Nodes (9): CurrencySwitcher(), destinations, FooterV2(), instagramImages, legalLinks, MobileAccordion(), popularTreks, quickLinks (+1 more)

### Community 27 - "courses.ts"
Cohesion: 0.20
Nodes (8): CourseInclusion, CourseItineraryDay, CourseTestimonial, CourseTier, SKI14_BASIC_ITINERARY, SKI14_PREMIUM_ITINERARY, SKIING_LOCAL_GALLERY, SKIING_LOCAL_VIDEOS

### Community 28 - "courses/page.tsx"
Cohesion: 0.29
Nodes (5): CoursesPage(), durations, metadata, tiers, trainingFrom

### Community 29 - "sitemap.ts"
Cohesion: 0.38
Nodes (5): COURSE_ROUTES, dynamic, ownImages(), STATIC_ROUTES, TREK_ROUTES

### Community 31 - "ReservationTab"
Cohesion: 0.43
Nodes (7): Field(), FieldError(), ReservationTab(), tripLabel(), batchLabel(), dayLabel(), endDate()

### Community 32 - "CampingSection.tsx"
Cohesion: 0.29
Nodes (6): ALL_MOMENTS, Camp, CAMPS, CUSTOM_CAMP, FILM_CROPS, GENERAL_ENQUIRY

### Community 33 - "treks-from-joshimath/page.tsx"
Cohesion: 0.33
Nodes (5): fromPrice, JOSHIMATH_TREKS, metadata, PERMIT_TOURS, TreksFromJoshimathPage()

### Community 34 - "Logo.tsx"
Cohesion: 0.60
Nodes (4): Logo(), LogoMark(), Mark(), Variant

## Knowledge Gaps
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `ref_react`, `transition`, `CheckoutClient.tsx`, `TreksPageClient.tsx`, `ref_next`, `BookingsAdminClient.tsx`, `admin.ts`, `CourseDetailClient.tsx`, `TrekDetailClient.tsx`, `Price`, `FadeUp`, `DeparturesAdminClient.tsx`, `buttonVariants`, `motion.ts`, `CurrencyContext.tsx`, `PaymentsAdminClient.tsx`, `TrekHub.tsx`, `AdminGate.tsx`, `FAQPageClient.tsx`, `BookingCard`, `FooterV2.tsx`, `CampingSection.tsx`?**
  _High betweenness centrality (0.106) - this node is a cross-community bridge._
- **Should `ref_react` be split into smaller, more focused modules?**
  _Cohesion score 0.05660377358490566 - nodes in this community are weakly interconnected._
- **Why does `Button` connect `ref_react` to `CampingSection.tsx`, `transition`, `CheckoutClient.tsx`, `TreksPageClient.tsx`, `BookingsAdminClient.tsx`, `admin.ts`, `CourseDetailClient.tsx`, `TrekDetailClient.tsx`, `cn`, `DeparturesAdminClient.tsx`, `buttonVariants`, `PaymentsAdminClient.tsx`, `FAQPageClient.tsx`, `Trek`, `BookingCard`, `FooterV2.tsx`, `ReservationTab`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Should `transition` be split into smaller, more focused modules?**
  _Cohesion score 0.06164383561643835 - nodes in this community are weakly interconnected._
- **Why does `transition()` connect `transition` to `ref_react`, `CheckoutClient.tsx`, `TreksPageClient.tsx`, `ref_next`, `CourseDetailClient.tsx`, `TrekDetailClient.tsx`, `cn`, `Price`, `FadeUp`, `buttonVariants`, `motion.ts`, `FAQPageClient.tsx`, `BookingCard`, `FooterV2.tsx`, `ReservationTab`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Should `CheckoutClient.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0859465737514518 - nodes in this community are weakly interconnected._
- **Should `TreksPageClient.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08677098150782361 - nodes in this community are weakly interconnected._