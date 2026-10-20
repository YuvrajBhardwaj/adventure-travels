# Feature Specification: Site-wide UI Consistency and Polish

**Feature Branch**: `002-ui-polish-consistency`

**Created**: 2026-10-21

**Status**: Draft

**Input**: User description: "Check the whole website for UI inconsistency and make it the best-looking version of itself. Keep the existing brand colors unchanged. Make the UI and the skeleton loading states modern, using shadcn/ui-style components consistently, and make every interaction and transition silky smooth."

## Context: what is inconsistent today

A survey of the site on 2026-10-21 found these concrete problems. They are the starting point, not an exhaustive list; the audit in FR-001 completes it.

- **Loading looks different everywhere:**
  - some areas show a plain "Loading…" text (6 places, including the customer dashboard and admin feed)
  - some use spinners (7 places)
  - some use one of two different shimmer placeholders.
- **Colours drift off-brand:**
  - an off-palette cyan accent appears in 3 files (8 uses)
  - 34 colours are typed in by hand instead of using the brand's named colours.
- **Controls aren't consistent:** only 15 of about 118 buttons use the site's shared button. The rest are hand-styled, with three different corner shapes (fully round, large-round, small-round) for the same kind of action.
- **Pages feel like three different sites:**
  - account pages (log in, sign up, dashboard, reset password) are dark navy, with their own input and card styles
  - marketing pages are white
  - checkout and admin use a separate light/dark theme.
- **Content can be hidden or delayed on arrival:**
  - a full-screen preloader covers every page until the site's scripts load, plus a fixed delay
  - photos stay invisible until scripts run
  - several home-page sections start invisible.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - One coherent brand on every page (Priority: P1)

A visitor moves between the home page, trek list, a trek page, courses, contact, sign-up, their dashboard and checkout. Every button, input, card, badge, menu, tab and dialog looks and behaves like part of one product, in the same brand colours. Same-purpose elements look the same wherever they appear.

**Why this priority**: inconsistency is the most visible quality problem, and it erodes trust right where people decide to book and pay. The other stories build on a single shared set of components.

**Independent Test**: open each page family (marketing, trek and course detail, account, checkout, admin) side by side. Compare the primary button, secondary button, text input, select, card, badge and dialog on each. Delivers a visibly unified site even before loading and motion work.

**Acceptance Scenarios**:

1. **Given** any two pages, **When** a reviewer compares elements with the same purpose (for example the main "book" action, or a form input), **Then** they share the same shape, size steps, colours, typography and states.
2. **Given** the brand palette (emerald primary, amber accent, sky secondary, orange call-to-action, navy chrome), **When** any page is inspected, **Then** it uses only those colours and their established neutrals. The off-palette cyan accents are replaced with the matching brand colour.
3. **Given** a page family with its own background (dark account pages, light marketing pages, themed admin and checkout), **When** the visitor uses its controls, **Then** the controls are the same components in the correct light or dark variant, not a separate look.

---

### User Story 2 - Modern, layout-true loading states (Priority: P2)

Whenever something is loading, the visitor sees a calm placeholder shaped like the content that is about to appear. This covers bookings, payments, admin lists, the activity feed, checkout and photos. The page never shows a bare "Loading…" line, an empty gap or a jump when the real content arrives.

**Why this priority**: loading is when a site feels cheap or premium. Mismatched placeholders and layout jumps are the second most visible inconsistency.

**Independent Test**: throttle the connection and open the dashboard, checkout, the admin lists and a photo-heavy trek page. Every waiting area shows a matching placeholder, and nothing shifts when the data arrives.

**Acceptance Scenarios**:

1. **Given** a slow connection, **When** the customer dashboard loads, **Then** each section (bookings, payments, profile) shows a placeholder that mirrors its final rows, never the text "Loading…".
2. **Given** content finishes loading, **When** it replaces its placeholder, **Then** the surrounding page doesn't move.
3. **Given** an action in progress (paying, saving the profile, signing in), **When** the visitor has pressed the button, **Then** the button shows an in-progress state and can't be pressed twice. This is the one place a spinner is used.
4. **Given** a visitor who prefers reduced motion, **When** placeholders are visible, **Then** they don't shimmer or pulse.

---

### User Story 3 - Silky-smooth, interruptible motion (Priority: P3)

Opening the navbar menus, the mobile drawer, tabs, dialogs, the photo lightbox and the slideshows, and moving between pages, all feel fluid. Motion is quick, consistent in timing and easing, never stutters, and can be interrupted mid-way. Nothing blocks the content when a page first appears.

**Why this priority**: smoothness turns a correct site into a delightful one, but it depends on the shared components from Story 1.

**Independent Test**: on a mid-range phone, open and close every menu, drawer, dialog and tab set quickly and repeatedly, swipe the slideshows and navigate between pages. Watch for stutter, inconsistent speeds, or motion that can't be interrupted.

**Acceptance Scenarios**:

1. **Given** a visitor arriving from search, **When** the page appears, **Then** its main content is visible straight away. No full-screen overlay delays it, and no section starts invisible waiting for scripts.
2. **Given** any opening or closing interaction, **When** the visitor reverses it mid-animation, **Then** it changes direction smoothly from where it is, without jumping or restarting.
3. **Given** two different overlays (for example the account menu and a confirmation dialog), **When** each opens, **Then** both use the same timing and easing family for their size.
4. **Given** a visitor who prefers reduced motion, **When** they use any part of the site, **Then** movement is replaced with simple fades or no animation, and everything still works.

---

### User Story 4 - Best version of every page (Priority: P4)

Each page reaches a finished visual standard:
- clear typographic hierarchy
- a consistent spacing rhythm between and inside sections
- aligned edges
- consistent empty and error states
- correct layout from small phones to large desktops
- visible keyboard focus.

The recently redesigned navbar and the trek hub pages set the bar.

**Why this priority**: page-by-page refinement gives the most value once the shared foundation (Stories 1–3) is in place.

**Independent Test**: review each page at 360px, 768px, 1280px and 1920px against the visual checklist from the audit (FR-001). Each page passes with no open items.

**Acceptance Scenarios**:

1. **Given** any page at any width from 320px to 1920px, **When** it is viewed, **Then** there is no sideways scrolling, nothing overlaps, and text stays readable.
2. **Given** an empty state (no bookings, no payments, no search results), **When** it appears, **Then** it uses the shared empty-state design with a clear next step.
3. **Given** a keyboard user, **When** they tab through any page, **Then** every interactive element shows the same clearly visible focus style.

---

### Edge Cases

- **Scripts slow or blocked:** pages still show all their content and photos. Nothing depends on scripts to become visible.
- **A photo fails to load:** the shared "no photo" panel appears at the same size, with no broken-image icon and no layout jump.
- **Long names and values** (long trek names, large amounts, long email addresses): they wrap or truncate consistently and never break the layout.
- **Page zoomed to 200%, or a very small phone (320px):** the layout still works without sideways scrolling.
- **Dark and light variants:** dark account pages and the dark theme in admin and checkout use the dark variants of the same components, with readable contrast.
- **Very fast data:** a placeholder never flashes for a split second. Content that is already available appears directly.
- **Repeated rapid taps** on menus, drawers and tabs: the interface ends in the state the visitor last asked for, with no stuck half-open panels.
- **No backend connection:** the existing fallback messages (for example the WhatsApp fallback) use the shared error-state design.

## Requirements *(mandatory)*

### Functional Requirements

**Audit and scope**
- **FR-001**: A written UI audit MUST list every inconsistency found, page by page, with its category (colour, component, shape, typography, spacing, loading, motion, responsiveness, accessibility) and how it is resolved. It covers all public pages, trek and course detail pages, hub pages, account pages, checkout and admin.
- **FR-002**: The work MUST NOT change page content, copy, URLs, the information shown, booking and payment behaviour, or what search engines can read in each page.

**Brand colours**
- **FR-003**: The site MUST keep its existing brand palette unchanged: emerald primary, amber accent, sky secondary, orange call-to-action, navy dark chrome, and the existing neutrals and semantic difficulty colours.
- **FR-004**: Every colour MUST come from the named brand palette. Off-palette colours (such as the cyan accents) and hand-typed colours MUST be replaced with the matching named brand colour. No new brand colours are introduced.

**One component system**
- **FR-005**: Buttons, links styled as buttons, text inputs, selects, checkboxes, cards, badges, tabs, menus, dialogs and drawers, tooltips, placeholders, empty states and error states MUST come from one shared component set. Every page uses it.
- **FR-006**: Buttons MUST offer a small fixed set of visual roles (main action, secondary or outline, quiet, destructive, text link) and sizes. Each role looks the same everywhere.
- **FR-007**: Each element type MUST follow one corner-shape rule (for example one for controls, one for cards, fully round only for small tags), applied site-wide.
- **FR-008**: Each component MUST have a light and a dark variant, so dark account pages and themed admin and checkout use the same components as light pages.
- **FR-009**: Typography MUST follow one heading scale and one body text style site-wide, in the brand's current typefaces.
- **FR-010**: Section spacing, content widths and spacing inside cards MUST follow one consistent scale across pages.

**Loading states**
- **FR-011**: Every area that waits for data MUST show a placeholder that mirrors the shape of its final content. Plain "Loading…" text MUST NOT appear anywhere.
- **FR-012**: Placeholders MUST share one subtle, modern style with a light and a dark variant. They are static for visitors who prefer reduced motion.
- **FR-013**: Spinners MUST appear only inside a control whose action is in progress. That control is disabled until the action finishes.
- **FR-014**: When loaded content or photos appear, the surrounding layout MUST NOT shift: space is reserved in advance.
- **FR-015**: Data that arrives very quickly MUST NOT cause a placeholder to flash briefly before it.

**Motion and first view**
- **FR-016**: A page's main content and photos MUST be visible on first view without waiting for scripts. No full-screen overlay or deliberate delay may hide content.
- **FR-017**: Hover, press, open/close, tab-change, page-change and slideshow transitions MUST use one consistent set of durations and easing, scaled by the size of the element that moves.
- **FR-018**: Every opening or closing interaction MUST be interruptible and reversible mid-way without jumping.
- **FR-019**: Animations MUST run without visible stutter on a mid-range phone.
- **FR-020**: Visitors who prefer reduced motion MUST get simple fades or no animation everywhere, with no loss of function.

**Quality of every page**
- **FR-021**: Every interactive element MUST show consistent hover (where hover exists), pressed, keyboard-focus, disabled and in-progress states.
- **FR-022**: Empty states and error states MUST use one shared design, each offering a clear next step.
- **FR-023**: Every page MUST work from 320px to 1920px wide with no sideways page scrolling. Touch targets must be at least 44 by 44 pixels.
- **FR-024**: All text and essential icons MUST meet accessible contrast (WCAG 2.2 AA) against their background, within the existing palette.

### Key Entities

- **Brand palette:** the named set of colours the site may use (brand colours, neutrals, difficulty colours), each with a light-surface and dark-surface use.
- **Design scale:** the shared steps for type sizes, spacing, corner shapes, shadows and motion (durations and easing).
- **Component set:** the shared building blocks (button, input, select, card, badge, tabs, menu, dialog or drawer, placeholder, empty state, error state) with their roles, sizes, states and light/dark variants.
- **Page family:** a group of pages that share a background treatment (marketing, detail, account, checkout, admin). It decides which variant of the components it uses, not which components.
- **Audit item:** one recorded inconsistency, with its page, category, before and after, and status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero off-palette colours remain anywhere on the site. Every colour in use maps to the named brand palette.
- **SC-002**: Zero plain-text loading placeholders. 100% of data-waiting areas show a layout-matching placeholder.
- **SC-003**: Content doesn't visibly jump when loading finishes: layout shift scores below 0.1 on the home page, trek list, a trek page, dashboard and checkout.
- **SC-004**: On a mid-range phone over a typical 4G connection, the main content of the home page and a trek page is visible within 2.5 seconds, with no overlay hiding it.
- **SC-005**: Menus, drawers, dialogs, tabs, slideshows and page changes animate at a steady 55 frames per second or more on a mid-range phone, with no visible stutter.
- **SC-006**: In a side-by-side review of all page families, a reviewer finds zero style differences between same-purpose elements (primary action, secondary action, input, card, badge, dialog).
- **SC-007**: 100% of pages pass at 320px, 768px, 1280px and 1920px with no sideways scrolling and visible keyboard focus. All text meets WCAG 2.2 AA contrast.
- **SC-008**: Zero regressions: sign-up, log in, booking, checkout and admin flows behave as before, and every page's searchable text is unchanged.
- **SC-009**: Every item in the UI audit (FR-001) is marked resolved or explicitly deferred with a reason, and the owner approves the result.

## Assumptions

- **Colours:** "keep the colours" means the brand palette defined in the site's theme (emerald `#10B981` primary, amber `#F59E0B` accent, sky `#0EA5E9` secondary, orange `#F97316` call-to-action, navy `#0F172A`/`#0B1222` chrome) plus the existing neutrals and difficulty colours. Off-palette usages count as inconsistencies to fix, not as colours to keep.
- **Component system:** the owner asked for shadcn/ui-style components. The site already has a small shadcn-style kit (button, card, badge, skeleton, avatar, theme scope), so the work extends that kit and adopts it everywhere rather than adding a second system.
- **Scope:** all pages are in scope (public, detail, hub, account, checkout, admin). Copy, content, page structure and features stay as they are; this is a visual consistency and polish effort, not a redesign of what the pages say or do.
- **Page backgrounds:** each page family keeps its current background (dark navy account pages, light marketing pages, themed checkout and admin) unless the audit shows a family breaks the brand. Any change of family background is called out for owner approval.
- **Benchmarks:** the recently redesigned navbar and the trek hub pages are the reference quality bar.
- **Performance and accessibility:** targets assume a mid-range Android phone on 4G. The accessibility baseline is WCAG 2.2 AA, including honouring the reduced-motion preference.
- **Search:** everything the static pages expose to search engines today must remain in the page.
