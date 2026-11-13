# Graph Report - src  (2026-11-13)

## Corpus Check
- 146 files · ~111,615 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 1 file(s) not represented in the graph (top: .css 1)

## Summary
- 855 nodes · 3204 edges · 30 communities (28 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `47402266`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- cn
- TrekDetailClient.tsx
- TreksPageClient.tsx
- dashboard/page.tsx
- transition
- CheckoutClient.tsx
- admin.ts
- CampingSection.tsx
- ActivityFeed.tsx
- app/page.tsx
- courses.ts
- app/layout.tsx
- BookingsAdminClient.tsx
- FadeUp
- CustomersAdminClient.tsx
- PaymentsAdminClient.tsx
- [course]/page.tsx
- motion.ts
- fitTitle
- AdminGate.tsx
- FooterV2.tsx
- ref_next
- treks
- AscentHero.tsx
- sitemap.ts
- route.tsx
- courseSeason.ts
- Logo.tsx
- Badge
- cancellation-policy/page.tsx

## God Nodes (most connected - your core abstractions)
1. `cn()` - 121 edges
2. `Button` - 61 edges
3. `buttonVariants()` - 54 edges
4. `transition()` - 52 edges
5. `Input` - 42 edges
6. `FadeUp()` - 39 edges
7. `Price()` - 35 edges
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
- `WINTER_TREKS` --calls--> `seasonMonths()`  [EXTRACTED]
  adventure-travel/src/app/winter-treks-uttarakhand/page.tsx → adventure-travel/src/lib/season.ts
- `WinterTreksPage()` --calls--> `TrekHub()`  [EXTRACTED]
  adventure-travel/src/app/winter-treks-uttarakhand/page.tsx → adventure-travel/src/components/TrekHub.tsx

## Import Cycles
- None detected.

## Communities (30 total, 2 thin omitted)

### Community 0 - "cn"
Cohesion: 0.06
Nodes (76): Collapse(), ContactPage(), FAQS, courseDays(), CourseDetailClient(), CourseTabPanel(), INC_ICONS, isValidPhone() (+68 more)

### Community 1 - "TrekDetailClient.tsx"
Cohesion: 0.05
Nodes (88): BatchesSkeleton(), BatchRow(), DeparturesAdminClient(), SEAT_TONE, TREKS, WEEKDAYS, AdminDeparturesPage(), metadata (+80 more)

### Community 2 - "TreksPageClient.tsx"
Cohesion: 0.05
Nodes (73): fromPrice, JOSHIMATH_TREKS, metadata, PERMIT_TOURS, TreksFromJoshimathPage(), esc(), inr(), list() (+65 more)

### Community 3 - "dashboard/page.tsx"
Cohesion: 0.07
Nodes (54): cap(), DashboardPage(), day(), KIND_LABEL, LABELS, Money(), Pill(), Row (+46 more)

### Community 4 - "transition"
Cohesion: 0.06
Nodes (55): noSubscribe(), Template(), GalleryTab(), isVideo(), DesktopSearch(), activities, ArrowRight(), ChevronDown() (+47 more)

### Community 5 - "CheckoutClient.tsx"
Cohesion: 0.06
Nodes (45): CheckoutClient(), describePaid(), loadRazorpay(), longDate(), Phase, RazorpayFailure, RazorpayInstance, RazorpaySuccess (+37 more)

### Community 6 - "admin.ts"
Cohesion: 0.08
Nodes (37): Payable, actionsFor(), addDepartures(), AdminBooking, AdminCustomer, AdminDeparture, AdminPayment, BookingEvent (+29 more)

### Community 7 - "CampingSection.tsx"
Cohesion: 0.14
Nodes (21): activities, ActivitiesPage(), LEVEL_DOTS, RESTRICTED, waLink(), ALL_MOMENTS, Camp, CampingSection() (+13 more)

### Community 8 - "ActivityFeed.tsx"
Cohesion: 0.17
Nodes (21): CustomerDetail(), AddBatches(), defaultCapacity(), DeparturesAdmin(), ACTIONS, ActivityFeed(), browserLabel(), FALLBACK (+13 more)

### Community 9 - "app/page.tsx"
Cohesion: 0.17
Nodes (17): FAQV2, Home(), FindYourTrek(), FloatingWhatsApp(), HowItWorks(), SmoothScrollProvider(), SnowSchool(), initials() (+9 more)

### Community 10 - "courses.ts"
Cohesion: 0.09
Nodes (18): Props, CoursesPage(), durations, metadata, tiers, trainingFrom, Course, CourseInclusion (+10 more)

### Community 11 - "app/layout.tsx"
Cohesion: 0.12
Nodes (14): fraunces, inter, metadata, spaceGrotesk, viewport, metadata, metadata, metadata (+6 more)

### Community 12 - "BookingsAdminClient.tsx"
Cohesion: 0.18
Nodes (19): BookingsAdmin(), BookingsAdminClient(), describeEvent(), FilterSelect(), HistoryDrawer(), PAYMENT_STATES, ServerFilters, STATUSES (+11 more)

### Community 13 - "FadeUp"
Cohesion: 0.21
Nodes (17): CancellationPolicyPage(), MailIcon(), REFUND_NOTE, REFUND_TIERS, VOUCHER_POINTS, FAQItem(), FAQV2(), AnimationProps (+9 more)

### Community 14 - "CustomersAdminClient.tsx"
Cohesion: 0.19
Nodes (15): CustomersAdmin(), CustomersAdminClient(), Detail, AdminCustomersPage(), metadata, KIND_LABEL, PAYMENT_STATE_LABEL, PAYMENT_STATE_TONE (+7 more)

### Community 15 - "PaymentsAdminClient.tsx"
Cohesion: 0.26
Nodes (13): AdminPaymentsPage(), metadata, FailedEmails(), PaymentsAdmin(), PaymentsAdminClient(), PaymentsSkeleton(), cap(), dateTime() (+5 more)

### Community 16 - "[course]/page.tsx"
Cohesion: 0.27
Nodes (12): CourseDetailPage(), generateMetadata(), inr(), priceSentence(), generateMetadata(), inr(), TrekDetailPage(), trekTitle() (+4 more)

### Community 17 - "motion.ts"
Cohesion: 0.22
Nodes (8): CoursesPageClient(), GALLERY_WALLPAPERS, HERO_MEDIA, EnquireTab(), WallpaperSlide, Bezier, DURATION, EASE

### Community 18 - "fitTitle"
Cohesion: 0.14
Nodes (6): metadata, metadata, metadata, FAQ_DATA, metadata, fitTitle()

### Community 19 - "AdminGate.tsx"
Cohesion: 0.29
Nodes (8): AdminActivityClient(), AdminActivityPage(), metadata, AdminGate(), AdminNav(), TABS, ThemeScope(), useAuth()

### Community 20 - "FooterV2.tsx"
Cohesion: 0.20
Nodes (11): RootLayout(), CurrencySwitcher(), destinations, FooterV2(), instagramImages, legalLinks, MobileAccordion(), popularTreks (+3 more)

### Community 21 - "ref_next"
Cohesion: 0.22
Nodes (4): metadata, dynamic, MobileSearchButton(), SheetTrigger

### Community 22 - "treks"
Cohesion: 0.20
Nodes (7): metadata, fromPrice, metadata, SNOW_TREKS, WINTER_TREKS, WinterTreksPage(), treks

### Community 23 - "AscentHero.tsx"
Cohesion: 0.29
Nodes (7): AscentHero(), FROM_PRICE, MAX_DAYS, MIN_DAYS, SLIDES, Stage(), TOP

### Community 24 - "sitemap.ts"
Cohesion: 0.38
Nodes (5): COURSE_ROUTES, dynamic, ownImages(), STATIC_ROUTES, TREK_ROUTES

### Community 26 - "courseSeason.ts"
Cohesion: 0.60
Nodes (4): courseSeason(), courseStartDates(), iso(), MONTHS

### Community 27 - "Logo.tsx"
Cohesion: 0.60
Nodes (4): Logo(), LogoMark(), Mark(), Variant

### Community 28 - "Badge"
Cohesion: 0.50
Nodes (3): Badge(), BadgeProps, badgeVariants

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `TrekDetailClient.tsx`, `TreksPageClient.tsx`, `dashboard/page.tsx`, `transition`, `CheckoutClient.tsx`, `CampingSection.tsx`, `ActivityFeed.tsx`, `app/page.tsx`, `BookingsAdminClient.tsx`, `FadeUp`, `CustomersAdminClient.tsx`, `PaymentsAdminClient.tsx`, `motion.ts`, `AdminGate.tsx`, `FooterV2.tsx`, `AscentHero.tsx`, `Badge`?**
  _High betweenness centrality (0.105) - this node is a cross-community bridge._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.05786163522012579 - nodes in this community are weakly interconnected._
- **Why does `Button` connect `cn` to `TrekDetailClient.tsx`, `TreksPageClient.tsx`, `dashboard/page.tsx`, `CheckoutClient.tsx`, `CampingSection.tsx`, `ActivityFeed.tsx`, `BookingsAdminClient.tsx`, `CustomersAdminClient.tsx`, `PaymentsAdminClient.tsx`, `FooterV2.tsx`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Should `TrekDetailClient.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.050475635798874006 - nodes in this community are weakly interconnected._
- **Why does `transition()` connect `transition` to `cn`, `TrekDetailClient.tsx`, `TreksPageClient.tsx`, `CheckoutClient.tsx`, `ActivityFeed.tsx`, `FadeUp`, `motion.ts`, `FooterV2.tsx`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Should `TreksPageClient.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05143570536828964 - nodes in this community are weakly interconnected._
- **Should `dashboard/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07259615384615385 - nodes in this community are weakly interconnected._