---
description: Add a new trek to src/data/treks.ts and generate its static route
---

Add a new trek to the adventure-travel site: $ARGUMENTS

Follow these rules strictly:

1. Read `adventure-travel/src/data/treks.ts` first. Match the existing `Trek` interface exactly and mimic the shape/style of existing trek objects.
2. The trek must be internally consistent: `maxAltitude` >= every `itinerary[].altitude` and every point in `elevationProfile`. UI charts these directly.
3. Do NOT touch routing — adding the object to `treks[]` automatically creates `/treks/<slug>` via `generateStaticParams()`. Use the exported `slugify()` for the slug.
4. Prices in INR (`Rs.`), copy targeted at an Indian audience (`en_IN`). Brand: "Expedition Happiness Treks" — Uttarakhand & Himachal Pradesh Himalayan treks.
5. Images are plain `<img loading="lazy" decoding="async">` with Unsplash URLs — never `next/image`.
6. After editing, verify from inside `adventure-travel/` with `npm run build` (no test framework exists).
