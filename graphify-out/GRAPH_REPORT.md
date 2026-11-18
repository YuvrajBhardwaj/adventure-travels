# Graph Report - src  (2026-11-16)

## Corpus Check
- 154 files · ~116,016 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 1 file(s) not represented in the graph (top: .css 1)

## Summary
- 887 nodes · 3398 edges · 28 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6110bb4b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- TrekDetailClient.tsx
- cn
- transition
- TreksPageClient.tsx
- dashboard/page.tsx
- CheckoutClient.tsx
- treks
- ref_next
- chopta-tungnath/page.tsx
- DeparturesAdminClient.tsx
- PaymentsAdminClient.tsx
- admin.ts
- ref_react
- Price
- BookingsAdminClient.tsx
- MotionWrapper.tsx
- courses.ts
- app/page.tsx
- TrekHub.tsx
- ActivityFeed.tsx
- CustomersAdminClient.tsx
- FadeUp
- CurrencyContext.tsx
- FAQPageClient.tsx
- CancellationPolicyPageClient.tsx
- FooterV2.tsx
- sitemap.ts
- courseSeason.ts

## God Nodes (most connected - your core abstractions)
1. `cn()` - 123 edges
2. `Button` - 63 edges
3. `buttonVariants()` - 56 edges
4. `transition()` - 54 edges
5. `Input` - 44 edges
6. `Price()` - 43 edges
7. `FadeUp()` - 39 edges
8. `CourseDetailClient()` - 34 edges
9. `Skeleton()` - 33 edges
10. `DashboardPage()` - 30 edges

## Surprising Connections (you probably didn't know these)
- `AddBatches()` --indirect_call--> `dayLabel()`  [INFERRED]
  adventure-travel/src/app/admin/departures/DeparturesAdminClient.tsx → adventure-travel/src/lib/departures.ts
- `CoursesPage()` --calls--> `CoursesPageClient()`  [EXTRACTED]
  adventure-travel/src/app/courses/page.tsx → adventure-travel/src/app/courses/CoursesPageClient.tsx
- `ownImages()` --indirect_call--> `absoluteUrl()`  [INFERRED]
  adventure-travel/src/app/sitemap.ts → adventure-travel/src/lib/seo.ts
- `clampY()` --indirect_call--> `H()`  [INFERRED]
  adventure-travel/src/components/ElevationLine.tsx → adventure-travel/src/components/QuickInfoModal.tsx
- `CardFooter()` --calls--> `cn()`  [EXTRACTED]
  adventure-travel/src/components/ui/card.tsx → adventure-travel/src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (28 total, 0 thin omitted)

### Community 0 - "TrekDetailClient.tsx"
Cohesion: 0.05
Nodes (83): esc(), inr(), list(), printItinerary(), BookingCard(), DATES_BADGE, DatesTab(), FULL_MONTHS (+75 more)

### Community 1 - "cn"
Cohesion: 0.07
Nodes (67): Collapse(), ContactPage(), FAQS, courseDays(), CourseDetailClient(), CourseTabPanel(), INC_ICONS, isValidPhone() (+59 more)

### Community 2 - "transition"
Cohesion: 0.06
Nodes (73): GalleryTab(), ALL_MOMENTS, Camp, CampingSection(), CAMPS, CUSTOM_CAMP, FILM_CROPS, GENERAL_ENQUIRY (+65 more)

### Community 3 - "TreksPageClient.tsx"
Cohesion: 0.06
Nodes (59): ALTITUDE_HIGH, ALTITUDE_LOW, DIFFICULTIES, DIFFICULTY_ORDER, DURATION_OPTIONS, HERO_PHOTOS, HERO_SLIDES, MONTH_NAMES (+51 more)

### Community 4 - "dashboard/page.tsx"
Cohesion: 0.07
Nodes (57): actionsFor(), cap(), DashboardPage(), day(), KIND_LABEL, LABELS, Money(), Pill() (+49 more)

### Community 5 - "CheckoutClient.tsx"
Cohesion: 0.10
Nodes (29): CheckoutClient(), describePaid(), loadRazorpay(), longDate(), Phase, RazorpayFailure, RazorpayInstance, RazorpaySuccess (+21 more)

### Community 6 - "treks"
Cohesion: 0.12
Nodes (16): metadata, metadata, generateMetadata(), priceSentence(), metadata, FAQ_DATA, metadata, generateMetadata() (+8 more)

### Community 7 - "ref_next"
Cohesion: 0.10
Nodes (16): metadata, fraunces, inter, metadata, spaceGrotesk, viewport, metadata, metadata (+8 more)

### Community 8 - "chopta-tungnath/page.tsx"
Cohesion: 0.09
Nodes (20): dynamic, runtime, ChoptaTungnathPage(), covers(), DAYS, metadata, packages, pkg (+12 more)

### Community 9 - "DeparturesAdminClient.tsx"
Cohesion: 0.16
Nodes (26): AddBatches(), BatchesSkeleton(), BatchRow(), defaultCapacity(), DeparturesAdmin(), DeparturesAdminClient(), SEAT_TONE, TREKS (+18 more)

### Community 10 - "PaymentsAdminClient.tsx"
Cohesion: 0.15
Nodes (19): AdminActivityClient(), AdminActivityPage(), metadata, TableSkeleton(), AdminPaymentsPage(), metadata, PaymentsAdmin(), PaymentsAdminClient() (+11 more)

### Community 11 - "admin.ts"
Cohesion: 0.14
Nodes (24): CustomersAdmin(), AdminCustomer, AdminDeparture, bookingRef(), db(), DepartureChange, fetchBookings(), getBookingEvents() (+16 more)

### Community 12 - "ref_react"
Cohesion: 0.15
Nodes (15): noSubscribe(), Template(), AscentHero(), FROM_PRICE, MAX_DAYS, MIN_DAYS, SLIDES, Stage() (+7 more)

### Community 13 - "Price"
Cohesion: 0.17
Nodes (18): AuliWinterEscapePage(), GroupOffers(), inr(), metadata, CHILD_ELIGIBLE, OTHER_PERKS, ScholarshipsTab(), Price() (+10 more)

### Community 14 - "BookingsAdminClient.tsx"
Cohesion: 0.14
Nodes (22): BookingsAdmin(), BookingsAdminClient(), describeEvent(), FilterSelect(), HistoryDrawer(), PAYMENT_STATES, ServerFilters, STATUSES (+14 more)

### Community 15 - "MotionWrapper.tsx"
Cohesion: 0.19
Nodes (16): activities, ActivitiesPage(), LEVEL_DOTS, RESTRICTED, waLink(), CoursesPageClient(), GALLERY_WALLPAPERS, HERO_MEDIA (+8 more)

### Community 16 - "courses.ts"
Cohesion: 0.11
Nodes (17): Props, CoursesPage(), durations, metadata, tiers, trainingFrom, Course, CourseInclusion (+9 more)

### Community 17 - "app/page.tsx"
Cohesion: 0.18
Nodes (12): FAQV2, Home(), Brand, BrandIcon(), BRANDS, FloatingWhatsApp(), HowItWorks(), Chapter (+4 more)

### Community 18 - "TrekHub.tsx"
Cohesion: 0.17
Nodes (15): CourseDetailPage(), fromPrice, JOSHIMATH_TREKS, metadata, PERMIT_TOURS, TreksFromJoshimathPage(), TrekDetailPage(), TrekCard() (+7 more)

### Community 19 - "ActivityFeed.tsx"
Cohesion: 0.18
Nodes (13): ACTIONS, ActivityFeed(), browserLabel(), FALLBACK, FeedSkeleton(), normalize(), Tone, Avatar() (+5 more)

### Community 20 - "CustomersAdminClient.tsx"
Cohesion: 0.21
Nodes (14): CustomerDetail(), CustomersAdminClient(), Detail, AdminCustomersPage(), metadata, cap(), KIND_LABEL, PAYMENT_STATE_LABEL (+6 more)

### Community 21 - "FadeUp"
Cohesion: 0.27
Nodes (12): FindYourTrek(), FadeUp(), SnowSchool(), StoriesTestimonials(), item, RailItem(), SwipeRail(), PERKS (+4 more)

### Community 22 - "CurrencyContext.tsx"
Cohesion: 0.19
Nodes (14): Ctx, CurrencyCtx, CurrencyProvider(), Rates, readSaved(), Saved, writeSaved(), BASE_CURRENCY (+6 more)

### Community 23 - "FAQPageClient.tsx"
Cohesion: 0.29
Nodes (10): ChevronDownIcon(), Collapse(), FAQ_CATEGORIES, FAQCategory, FAQItemData, FAQPage(), MailIcon(), MessageCircleIcon() (+2 more)

### Community 24 - "CancellationPolicyPageClient.tsx"
Cohesion: 0.29
Nodes (6): CancellationPolicyPage(), MailIcon(), VOUCHER_POINTS, metadata, REFUND_NOTE, REFUND_TIERS

### Community 25 - "FooterV2.tsx"
Cohesion: 0.22
Nodes (9): destinations, FooterV2(), instagramImages, legalLinks, MobileAccordion(), popularTreks, quickLinks, socials (+1 more)

### Community 26 - "sitemap.ts"
Cohesion: 0.36
Nodes (6): COURSE_ROUTES, dynamic, ownImages(), STATIC_ROUTES, TOUR_ROUTES, TREK_ROUTES

### Community 27 - "courseSeason.ts"
Cohesion: 0.60
Nodes (4): courseSeason(), courseStartDates(), iso(), MONTHS

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `TrekDetailClient.tsx`, `transition`, `TreksPageClient.tsx`, `dashboard/page.tsx`, `CheckoutClient.tsx`, `DeparturesAdminClient.tsx`, `PaymentsAdminClient.tsx`, `admin.ts`, `ref_react`, `Price`, `BookingsAdminClient.tsx`, `MotionWrapper.tsx`, `app/page.tsx`, `TrekHub.tsx`, `ActivityFeed.tsx`, `CustomersAdminClient.tsx`, `FadeUp`, `FAQPageClient.tsx`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Should `TrekDetailClient.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05106382978723404 - nodes in this community are weakly interconnected._
- **Why does `Button` connect `cn` to `TrekDetailClient.tsx`, `transition`, `TreksPageClient.tsx`, `dashboard/page.tsx`, `CheckoutClient.tsx`, `DeparturesAdminClient.tsx`, `PaymentsAdminClient.tsx`, `admin.ts`, `BookingsAdminClient.tsx`, `ActivityFeed.tsx`, `CustomersAdminClient.tsx`, `FAQPageClient.tsx`, `FooterV2.tsx`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._
- **Why does `buttonVariants()` connect `cn` to `TrekDetailClient.tsx`, `transition`, `TreksPageClient.tsx`, `dashboard/page.tsx`, `CheckoutClient.tsx`, `PaymentsAdminClient.tsx`, `ref_react`, `Price`, `MotionWrapper.tsx`, `app/page.tsx`, `FadeUp`, `FAQPageClient.tsx`, `CancellationPolicyPageClient.tsx`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Should `transition` be split into smaller, more focused modules?**
  _Cohesion score 0.058002735978112174 - nodes in this community are weakly interconnected._
- **Should `TreksPageClient.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05754527162977867 - nodes in this community are weakly interconnected._