---
description: Add a data-driven page using the server/client split pattern
---

Add a new data-driven page to the adventure-travel site: $ARGUMENTS

Pattern to follow exactly (see `adventure-travel/src/app/treks/[id]/page.tsx` + `TrekDetailClient.tsx`):

1. Server component page: resolves data (static params / slug lookup) and renders metadata.
2. A sibling `<Name>Client.tsx` `"use client"` component holds all interactive UI + framer-motion animations, gated on `useReducedMotion()`.
3. Content comes from a module under `src/data/` — hardcoded TypeScript only, no backend/API calls.
4. Use path alias `@/*`, Tailwind v4 theme tokens from `globals.css` (`bg-primary`, `glass-card`, `py-section`, `text-display-*`).
5. Verify with `npm run build` from `adventure-travel/` — static generation must succeed for all params.
