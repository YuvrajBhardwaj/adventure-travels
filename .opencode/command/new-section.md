---
description: Create a new animated section component matching project conventions
---

Create a new section component for the adventure-travel Next.js site: $ARGUMENTS

Conventions to follow:

1. Read 2–3 existing components in `adventure-travel/src/components/` first (prefer ones ending in `V2`) and copy their structure and style.
2. The component is `"use client"` and animates with inline framer-motion.
3. Every animation must be gated on `useReducedMotion()` so reduced-motion users get static output. Check `MotionWrapper.tsx` for shared wrappers (`FadeUp`, `SlideUp`, `StaggerContainer`, etc.) before re-implementing.
4. Use design tokens/utilities from `src/app/globals.css` (`bg-primary`, `text-muted`, `glass-card`, `text-display-*`, `py-section`) — no hardcoded colors or ad-hoc values.
5. Images: plain `<img loading="lazy" decoding="async">` with Unsplash URLs, not `next/image`.
6. CTAs / lead capture use WhatsApp deep links (`wa.me/...`), not forms.
7. Name the component with the `V2` suffix if it replaces nothing, or follow sibling naming.
8. Verify with `npm run build` from `adventure-travel/`.
