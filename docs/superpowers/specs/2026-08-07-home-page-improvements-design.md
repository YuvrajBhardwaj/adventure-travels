# Home Page Flow & Conversion Optimization Design

## Overview
This design improves the user journey, conversion funnel, social proof placement, and layout stability of the Himalayan Arc Adventure homepage (`adventure-travel/src/app/page.tsx`).

## Proposed Changes

### 1. Section Hierarchy Reordering
Reorder the components in `adventure-travel/src/app/page.tsx` to follow a natural conversion and trust funnel:

1. **HeroSplit** – Hero section with search & primary CTA
2. **TrustedBy** – Logos / trust badges immediately below hero for instant credibility
3. **PopularTreksV2** – Top featured treks near the top where user intent is highest
4. **HimalayanMap** – Interactive regional trek exploration map
5. **SplitSections** – Core value propositions & differentiators
6. **FeaturedDestinations** – Uttarakhand & Himachal destination guides
7. **SeasonalExplorer** – Treks filtered by season
8. **FeaturedAdventuresV2** – Specialized expeditions & skiing courses
9. **PermitTours** – Restricted area permits & tours
10. **AdventureStories** – Stories/blog previews
11. **InstagramGallery** – Community photo feed
12. **StatisticsV2** – Key numbers (5000+ trekkers, 4.9★ rating)
13. **TestimonialsV2** – Trekker reviews right before final call-to-action
14. **FAQV2** – Frequently asked questions
15. **CallToActionV2** – Lead capture & consultation CTA
16. **FooterV2** – Footer

### 2. Quick Contact / WhatsApp Floating Button
- Create `adventure-travel/src/components/FloatingWhatsApp.tsx`
- Fixed floating action button anchored at bottom-right (`bottom-6 right-6 z-50`)
- Deep links to WhatsApp chat (`wa.me/+917817912062`) or opens `ContactPopup`
- Includes subtle pulse animation and accessibility label

### 3. Layout Stability & CLS Reduction
- Update dynamic import loading skeletons in `adventure-travel/src/app/page.tsx` to match the exact vertical height of their respective rendered components.

## Testing & Verification
- Run `npm run build` from `adventure-travel/` to ensure no compile errors or broken imports.
- Run `npm run lint` from `adventure-travel/` to ensure code formatting and linting pass.
