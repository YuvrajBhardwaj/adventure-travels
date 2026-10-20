# Contract: UI Component Kit (`adventure-travel/src/components/ui/`)

These are the components every page uses (FR-005). Each one follows shadcn conventions: `forwardRef` where a DOM ref is useful, `className` merged with `cn()`, variants defined with `cva`, and a dark rendering through `dark:` classes. Existing props stay compatible: a component that is only extended keeps its current call sites working.

The shared rules (radius, type, colours) are in [data-model.md](../data-model.md); motion is in [motion.md](./motion.md).

## Button (`button.tsx`, extended)
```ts
<Button variant? size? loading? asChild? disabled? {...buttonProps} />
buttonVariants({ variant, size, className })   // for <Link>/<a> styled as buttons
```
- **`variant`:** `default` (emerald solid) · `outline` · `ghost` · `destructive` (red) · `link`.
- **`size`:** `sm` (h-9) · `default` (h-11) · `lg` (h-12) · `icon` (h-10 w-10).
- **Shape:** `rounded-xl` always.
- **States:** hover (colour step, `fast`) · pressed (`scale-[0.98]`, off under reduced motion) · `focus-visible` ring (emerald, offset matches the surface) · `disabled` (opacity 60%, no pointer).
- **`loading` (new):** shows the `Spinner` before the label, sets `aria-busy` and disables the button. The width doesn't change, because the label stays.
- **Dark surfaces:** `outline` and `ghost` switch to white-alpha borders and fills under `dark:`.
- **Links:** an `<a>` or `<Link>` that looks like a button uses `buttonVariants(...)`, never hand-written classes.

## Input, Textarea, Label (`input.tsx`, `textarea.tsx`, `label.tsx`, new)
```ts
<Label htmlFor>…</Label>
<Input id type invalid? {...inputProps} />
<Textarea id rows invalid? {...textareaProps} />
```
- `rounded-xl`, h-11 (Input), `text-base` on phones (prevents iOS zoom) and `sm:text-sm` above.
- **Light:** white field, slate border. **Dark:** `white/5` field, `white/10` border, white text.
- **Focus:** emerald ring. **`invalid`:** red border and `aria-invalid`. The error message sits below, linked by `aria-describedby`.

## Select, Checkbox (`select.tsx`, `checkbox.tsx`, new)
- **Select:** a styled **native** `<select>` (same box as `Input`) with a chevron icon. The value stays in the HTML. Options use the system menu.
- **Checkbox:** a styled native checkbox (`accent-emerald-600`, 16px, rounded), wrapped with its label for a 44px touch target.

## Card (`card.tsx`, existing)
`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`. `rounded-2xl`, either a border or `shadow-sm` (never both heavy), and a dark rendering. Unchanged API.

## Badge (`badge.tsx`, existing)
`<Badge tone="emerald|sky|amber|red|slate">`, `rounded-full`. Unchanged API; it replaces the hand-written "pill" spans for statuses.

## Skeleton (`skeleton.tsx`, extended)
```ts
<Skeleton className="h-4 w-1/2" />          // shapes are composed by the caller
```
- **Light:** `bg-slate-200/70`. **Dark:** `bg-white/[0.06]`. A soft shimmer sweeps across using `transform` only.
- **Delay:** it fades in after 150ms (pure CSS), so fast data never flashes a placeholder.
- **Reduced motion:** static, no shimmer.
- **Accessibility:** `aria-hidden`. The loading region carries `aria-busy="true"` and an `sr-only` "Loading <thing>" label.
- **No more:** the `.skeleton` CSS class and plain "Loading…" text.

## Spinner (`spinner.tsx`, new)
A small icon (`Loader2`) at 16 or 20px, inheriting the current text colour, that spins (static under reduced motion). It is **only** used inside a control whose action is in progress (FR-013): `Button loading`, "Load more".

## Dialog, Sheet (`dialog.tsx`, `sheet.tsx`, new, built on `@radix-ui/react-dialog`)
```ts
<Dialog open onOpenChange>
  <DialogTrigger asChild>…</DialogTrigger>
  <DialogContent title description? size="sm|md|lg|full" tone="light|dark"> … </DialogContent>
</Dialog>

<Sheet open onOpenChange>
  <SheetContent side="right|left|bottom" title tone="light|dark"> … </SheetContent>
</Sheet>
```
- **Behaviour (Radix):** focus trap, return of focus to the trigger, Escape and scrim-click to close, scroll lock, `aria-modal`, and a required accessible title (it can be `sr-only`).
- **Motion:** framer-motion through `forceMount` + `AnimatePresence`. The scrim fades over `base`. A Dialog scales from 0.96 and fades over `slow` with `out`. A Sheet slides with the sheet spring, and swipe-to-close is kept where it exists today (mobile nav). Every transition can be reversed mid-way (FR-018). Under reduced motion it is opacity-only.
- **Surfaces:** `rounded-2xl` (a Sheet rounds only its inner edge), `tone="dark"` for the navy overlays (mobile nav, the legacy notice, the gallery lightbox).
- **Replaces:** `QuickInfoModal`, `LegacyDataNotice`, `VideoShowcase` and `CampingSection` modals, the trek gallery lightbox, the admin history drawer and the mobile nav drawer.

## EmptyState (`empty-state.tsx`, new)
```ts
<EmptyState icon? title description? action? />   // action = a Button or Link
```
Centred, a muted icon in a `rounded-2xl` tinted square, a title in `text-base font-semibold`, a description in `text-sm text-muted`, and one clear next step (FR-022). Light and dark renderings. It is used for no bookings, no payments, no search results, and "photos coming soon".

## Error state (`WhatsAppFallback.tsx`, restyled)
`<WhatsAppFallback message details? />`. Same API. It is restyled on the `EmptyState` layout with an amber tone and a primary "Send these details on WhatsApp" button (`buttonVariants`). It covers every "backend unavailable" path.

## Page-family scopes
- **`ThemeScope`** (existing): the visitor's light/dark toggle, used on checkout and admin.
- **`DarkScope`** (new, a few lines): forces `.dark` on its subtree, with no toggle. It wraps the account pages (`/login`, `/signup`, `/reset-password`, `/dashboard`) so kit components render their dark variant on the kept navy background.
