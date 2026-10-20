# Contract: Motion Tokens

One scale for every animation and transition on the site (FR-017 to FR-020). It is defined once in two forms that must agree:
- `adventure-travel/src/lib/motion.ts`, for framer-motion
- CSS variables in the `@theme inline` block of `src/app/globals.css`, for Tailwind `transition-*` and `duration-*` / `ease-*` classes.

## Durations

| Token | Seconds | Tailwind | Use |
|---|---|---|---|
| `fast` | 0.15 | `duration-150` | hover and press feedback, colour changes, small icon flips (chevrons) |
| `base` | 0.22 | `duration-200` (nearest step) | menus, dropdowns, popovers, tab panel fade, tooltips, scrim fade |
| `slow` | 0.32 | `duration-300` (nearest step) | dialogs, sheets (non-spring parts), page cross-fade, slideshow crossfade start |

Longer, deliberate motion is allowed only for ambient content that isn't an interaction response: slideshow photo crossfades (~1.2s) and slow Ken Burns zooms. These must never block interaction or reading.

## Easing

| Token | Curve | Use |
|---|---|---|
| `out` | `cubic-bezier(0.16, 1, 0.3, 1)` (`[0.16, 1, 0.3, 1]`) | anything entering or moving into place (the navbar's `EASE`, already the reference) |
| `inOut` | `cubic-bezier(0.65, 0, 0.35, 1)` | anything leaving, and colour/opacity cross-fades |
| `sheet` spring | `{ type: "spring", stiffness: 420, damping: 38 }` | sheets, drawers, drag-to-dismiss |

## Rules
1. **Animate only `transform` and `opacity`** (and `filter: blur()` sparingly on menu entrances). Never animate `width`, `top`/`left`, `margin` or `box-shadow`. The one exception is framer-motion's measured `height: auto` for disclosure/accordion content.
2. **Interruptible:** every open/close uses framer-motion state animations or CSS **transitions** (never CSS keyframes) for interactive state, so reversing mid-way continues from the current value.
3. **Scale by size:** small controls use `fast`, mid-size overlays `base`, full-screen or edge surfaces `slow` or the spring.
4. **Reduced motion:** with `useReducedMotion()` or `prefers-reduced-motion`:
   - no translate, scale or blur
   - opacity changes at most `base`
   - shimmers, Ken Burns and auto-advancing slideshows are static.
5. **First paint never animates in.** Content visible in the static HTML must not start at `opacity:0`. Entrances run only for elements mounted after hydration, or on scroll-in, and never hide above-the-fold content.
6. **One authored moment per surface:** a page or overlay has at most one signature motion (e.g. the navbar hover pill, the hero slideshow). Everything else uses the plain tokens.

## `src/lib/motion.ts` shape
```ts
export const DURATION = { fast: 0.15, base: 0.22, slow: 0.32 } as const;
export const EASE = { out: [0.16, 1, 0.3, 1], inOut: [0.65, 0, 0.35, 1] } as const;
export const SPRING = { sheet: { type: "spring", stiffness: 420, damping: 38 } } as const;
export const transition = (d: keyof typeof DURATION, e: keyof typeof EASE = "out") => ({ duration: DURATION[d], ease: EASE[e] });
```
Components import these values instead of writing numbers inline. An inline duration or easing outside this module counts as an audit item (category "motion").
