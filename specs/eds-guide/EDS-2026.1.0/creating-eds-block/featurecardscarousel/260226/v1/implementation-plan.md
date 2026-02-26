# Implementation Plan: Feature Cards Carousel

**Guide:** [eds-guide / EDS-2026.1.0 / creating-eds-block](../implementation-guide.md)  
**Specific Functionality:** featurecardscarousel  
**Date:** 260226  
**Version:** v1  
**Requirements:** [CC-Feature Cards Carousel-260226-085021.pdf](../../../../requirements/CC-Feature%20Cards%20Carousel-260226-085021.pdf)  
**Design:** [Desktop](https://www.figma.com/design/ll3RkqQHJd5djDIcbnpnF2/bibigo?node-id=13969-74649) | [Tablet](https://www.figma.com/design/ll3RkqQHJd5djDIcbnpnF2/bibigo?node-id=13969-74765) | [Mobile](https://www.figma.com/design/ll3RkqQHJd5djDIcbnpnF2/bibigo?node-id=13969-74877)  
**Reference Block:** [blocks/cards](../../../../blocks/cards)

---

## Summary

Implement a **Feature Cards Carousel** block that displays a title section with CTAs, a large center image that changes per selected card, and 2–4 cards in a carousel. Cards auto-scroll (4–5 sec configurable), support click selection, and on tablet/mobile show one card at a time with swipe. First card is selected by default.

---

## Requirements Summary (from PDF)

| Element | Spec |
|---------|------|
| **Title** | Main headline, max 42 chars |
| **Tag** | Optional, max 24 chars |
| **Sub heading** | Optional, max 150 chars |
| **CTAs** | Max 2, max 25 char each (Our Story, Shop Now) |
| **Cards** | Min 2, Max 4 |
| **Card fields** | Image (center), Logo, Title (max 35 char), Description (optional, max 52 char) |
| **Carousel lag** | Configurable 1–5 sec |
| **Desktop** | 4 cards visible, carousel indicators |
| **Tablet/Mobile** | 1 card at a time, swipe |
| **< 4 cards** | Cards expand to full space |

*Dev note: Char limits as info notes per requirements; no validation implemented.*

---

## Breakpoints (from Figma)

| Viewport | Width | Notes |
|----------|-------|-------|
| Mobile | 350px | Single card, stacked CTAs |
| Tablet | 680px | Single card, horizontal CTAs |
| Desktop | 1120–1280px | 4 cards, center image |

*Use project standard breakpoints if different: 600px, 900px, 1200px.*

---

## Implementation Tasks

### Phase 0: Pre-Implementation

- [x] **0.1** Verify requirements and design access. Confirm Figma links and PDF are accessible.
- [x] **0.2** Review [implementation guide](../implementation-guide.md) Part 1 and Part 2.

---

### Phase 1: Backend - XWalk Configuration (Step 1)

**Reference:** [Implementation Guide - Part 2: Backend Code Generation](../implementation-guide.md#part-2-backend-code-generation)

#### Step 1.1: Create Block-Level JSON and Add Definitions

- [x] **1.1.1** Create `blocks/featurecardscarousel/_featurecardscarousel.json`.
- [x] **1.1.2** Add **parent block definition** (Feature Cards Carousel) with `model` and `filter` in template (parent has authoring fields).
- [x] **1.1.3** Add **child block definition** (Feature Cards Carousel Item) with `model` and `block/item` resource type.

**Parent definition structure:**
```json
{
  "title": "Feature Cards Carousel",
  "id": "featurecardscarousel",
  "plugins": {
    "xwalk": {
      "page": {
        "resourceType": "core/franklin/components/block/v1/block",
        "template": {
          "name": "FeatureCardsCarousel",
          "model": "featurecardscarousel",
          "filter": "featurecardscarousel"
        }
      }
    }
  }
}
```

**Child definition structure:**
```json
{
  "title": "Feature Cards Carousel Item",
  "id": "featurecardscarouselitem",
  "plugins": {
    "xwalk": {
      "page": {
        "resourceType": "core/franklin/components/block/v1/block/item",
        "template": {
          "name": "FeatureCardsCarouselItem",
          "model": "featurecardscarouselitem"
        }
      }
    }
  }
}
```

**Human test:** [ ] Run `npm run build:json` and verify `component-definition.json` contains the new block definitions.

---

#### Step 1.2: Add Parent Model (featurecardscarousel)

- [x] **1.2.1** Add model `featurecardscarousel` with fields in this order (field order = structure contract):

| Field | Component | Name | Label | Notes |
|-------|-----------|------|-------|-------|
| 1 | text | title | Title | Max 42 chars (info note) |
| 2 | text | tag | Tag | Optional, max 24 chars |
| 3 | richtext | subheading | Sub heading | Optional, max 150 chars |
| 4 | aem-content | cta1Link | CTA 1 Link | Primary |
| 5 | text | cta1Text | CTA 1 Text | Max 25 chars |
| 6 | select | cta1Type | CTA 1 Type | primary/secondary |
| 7 | aem-content | cta2Link | CTA 2 Link | Secondary |
| 8 | text | cta2Text | CTA 2 Text | Max 25 chars |
| 9 | select | cta2Type | CTA 2 Type | primary/secondary |
| 10 | number | carouselLagTime | Carousel Lag (sec) | 1–5, default 4 |

**Human test:** [ ] Run `npm run build:json` and verify `component-models.json` contains the parent model.

---

#### Step 1.3: Add Child Model (featurecardscarouselitem)

- [x] **1.3.1** Add model `featurecardscarouselitem` with fields in this order:

| Field | Component | Name | Label | Notes |
|-------|-----------|------|-------|-------|
| 1 | reference | centerImage | Center Image | Large background image |
| 2 | text | centerImageAlt | Center Image Alt | |
| 3 | reference | logo | Logo | Card icon/logo |
| 4 | text | logoAlt | Logo Alt | |
| 5 | text | title | Title | Max 35 chars |
| 6 | richtext | description | Description | Optional, max 52 chars |

**Human test:** [ ] Run `npm run build:json` and verify `component-models.json` contains the child model.

---

#### Step 1.4: Add Filter and Register Block in Section

- [x] **1.4.1** Add filter to `_featurecardscarousel.json`: `{"id":"featurecardscarousel","components":["featurecardscarouselitem"]}`.
- [x] **1.4.2** Add `featurecardscarousel` to section's allowed components in `models/_section.json` (edit `components` array to include `"featurecardscarousel"`).

**Human test:** [ ] Run `npm run build:json`. Verify `component-filters.json` has `featurecardscarousel` filter and section includes `featurecardscarousel`.

---

#### Step 1.5: Backend Validation

- [x] **1.5.1** Validate JSON syntax (ESLint or JSON validator).
- [ ] **1.5.2** Deploy to AEM/Universal Editor environment (or local equivalent).

**Human test:** [ ] Open AEM/Universal Editor, add Feature Cards Carousel block to a page, confirm authoring UI shows all fields and child items can be added.

---

### Phase 2: User Provides Semantic HTML (Step 2 – MANDATORY)

**Reference:** [Implementation Guide - Step 2: User Provides Semantic HTML](../implementation-guide.md#step-2-user-provides-semantic-html)

**Structure contract (from [featurecardscarousel.html](../../../../requirements/featurecardscarousel.html)):**
- block.children[0–9] = parent fields (title, tag, subheading, cta1Link, cta1Text, cta1Type, cta2Link, cta2Text, cta2Type, carouselLagTime)
- block.children[10+] = card rows; each row: children[0]=centerImage, [1]=logo, [2]=title, [3]=description

- [x] **2.1** Request user to author the block in Adobe Universal Editor with sample content:
  - Title, tag (optional), subheading (optional)
  - Both CTAs (Our Story, Shop Now)
  - 2–4 cards with full content (center image, logo, title, description)
- [x] **2.2** User provides the generated HTML (view source or DevTools).
- [x] **2.3** Document structure contract from user-provided HTML:
  - Parent row indices (title, tag, subheading, cta1, cta2, carouselLagTime)
  - Child item row structure (centerImage, logo, title, description)
  - Empty/optional field behavior

**Human test:** [ ] Confirm HTML structure is documented before proceeding to frontend.

---

### Phase 3: Frontend - JavaScript Implementation (Step 3)

**Reference:** [Implementation Guide - Part 3: Frontend Code Generation](../implementation-guide.md#part-3-frontend-code-generation)

#### Step 3.1: Create Block Files

- [x] **3.1.1** Create `blocks/featurecardscarousel/featurecardscarousel.js`.
- [x] **3.1.2** Create `blocks/featurecardscarousel/featurecardscarousel.css`.

**Human test:** [ ] Verify files exist and block folder structure matches `blocks/cards/`.

---

#### Step 3.2: Implement decorate() – Structure Extraction

- [x] **3.2.1** Add JSDoc with structure contract (based on user-provided HTML).
- [x] **3.2.2** Extract parent fields using index-based access (title, tag, subheading, CTAs, carouselLagTime).
- [x] **3.2.3** Extract child items (each row = one card: centerImage, logo, title, description).
- [x] **3.2.4** Use `moveInstrumentation()` when transforming DOM.
- [x] **3.2.5** Use optional chaining for link extraction; handle wrapped `<p>` tags.

**Human test:** [ ] Run block with user-provided HTML; verify data extraction in console.

---

#### Step 3.3: Implement DOM Transformation

- [x] **3.3.1** Build title section (tag, title, subheading).
- [x] **3.3.2** Build CTA buttons (primary, secondary) with inline pattern.
- [x] **3.3.3** Build center image container (background image changes per selected card).
- [x] **3.3.4** Build cards container (cards at bottom, each with logo, title, description).
- [x] **3.3.5** Build carousel indicators (dots) via Swiper pagination.
- [x] **3.3.6** Replace block content with transformed structure.

**Human test:** [ ] Verify transformed DOM structure in browser DevTools.

---

#### Step 3.4: Implement Carousel Logic (Swiper JS)

- [x] **3.4.1** Set first card as selected by default (Swiper default).
- [x] **3.4.2** On card click: select card, update center image, update indicators (Swiper slideTo).
- [x] **3.4.3** Auto-scroll: Swiper autoplay with `carouselLagTime` (sec).
- [x] **3.4.4** On hover/selected: increase card size, show description (CSS).
- [x] **3.4.5** Swiper handles touch/swipe natively.

**Human test:** [ ] Test desktop: click cards, verify auto-scroll, verify center image updates.

---

#### Step 3.5: Implement Touch/Swipe (Tablet/Mobile)

- [x] **3.5.1** Swiper breakpoints: 1 slide on tablet/mobile, 4 on desktop.
- [x] **3.5.2** Swiper handles touch/swipe natively.
- [x] **3.5.3** Pagination updates on slide change.

**Human test:** [ ] Test on tablet/mobile viewport; verify swipe works.

---

#### Step 3.6: Image Optimization

- [x] **3.6.1** Use `createOptimizedPicture()` for card logos; center image as img (swap src on slide change).
- [x] **3.6.2** Use `loading="lazy"` for center image and card images.
- [x] **3.6.3** Center image can be LCP if first section; consider eager for first slide.

**Human test:** [ ] Verify images load correctly; check Network tab for optimized srcset.

---

### Phase 4: Frontend - CSS Implementation

#### Step 4.1: Base Styles

- [x] **4.1.1** Style title section (tag, title, subheading) per Figma.
- [x] **4.1.2** Style CTA buttons (primary dark green, secondary outline) with hover states.
- [x] **4.1.3** Style center image container (gradient overlay, rounded corners).
- [x] **4.1.4** Style cards (background, border, logo, title, description).
- [x] **4.1.5** Style carousel indicators (Swiper pagination bullets).

**Human test:** [ ] Verify desktop layout matches Figma.

---

#### Step 4.2: Responsive Styles

- [x] **4.2.1** Tablet (680px): single card via Swiper breakpoints.
- [x] **4.2.2** Mobile (350px): single card, full-width CTAs.
- [x] **4.2.3** Handle < 4 cards: CSS flex, Swiper slidesPerView: Math.min(cards.length, 4).

**Human test:** [ ] Test at 1280px, 680px, 350px; verify layout matches Figma.

---

#### Step 4.3: Interactive States

- [x] **4.3.1** Selected card: larger size, description visible.
- [x] **4.3.2** Hover state: same as selected (per requirements).
- [x] **4.3.3** CTA hover: primary lighter shade, secondary outline change.

**Human test:** [ ] Verify hover and selected states.

---

### Phase 5: Integration and Validation

- [ ] **5.1** Run `npm run build:json` (if any backend changes).
- [ ] **5.2** Test in AEM authoring interface: add block, edit fields, save.
- [ ] **5.3** Test in publish mode: verify content renders.
- [ ] **5.4** Run Lighthouse; target score 100 (see [EDS Performance & Lighthouse](../implementation-guide.md#appendix-a-eds-performance--lighthouse-best-practices) if needed).

**Human test:** [ ] Full regression: author, publish, verify all breakpoints and interactions.

---

## Assumptions and Decisions

| Item | Decision |
|------|----------|
| CTA structure | Two separate link rows (cta1Link/cta1Text/cta1Type, cta2Link/cta2Text/cta2Type) |
| Logo | `reference` field (image asset) |
| Carousel lag | `number` field, 1–5 sec, default 4 |
| Breakpoints | Figma: 350px mobile, 680px tablet, 1120px desktop |
| Section filter | Edit `models/_section.json` to add featurecardscarousel |
| Carousel library | Swiper JS v11 (loaded via loadScript/CDN) |

---

## Traceability

| Requirement | Implementation |
|-------------|----------------|
| Title, tag, subheading | Parent model fields |
| 2 CTAs | cta1*, cta2* fields |
| 2–4 cards | Child items, filter |
| Center image per card | featurecardscarouselitem.centerImage |
| Logo per card | featurecardscarouselitem.logo |
| Auto-scroll 4–5 sec | carouselLagTime, Swiper autoplay |
| Card click selects | Swiper slideTo |
| Tablet/mobile swipe | Swiper touch |
| < 4 cards expand | CSS flex/grid |

---

## References

- [Implementation Guide](../implementation-guide.md)
- [Requirements PDF](../../../../requirements/CC-Feature%20Cards%20Carousel-260226-085021.pdf)
- [Figma Desktop](https://www.figma.com/design/ll3RkqQHJd5djDIcbnpnF2/bibigo?node-id=13969-74649)
- [Figma Tablet](https://www.figma.com/design/ll3RkqQHJd5djDIcbnpnF2/bibigo?node-id=13969-74765)
- [Figma Mobile](https://www.figma.com/design/ll3RkqQHJd5djDIcbnpnF2/bibigo?node-id=13969-74877)
- [blocks/cards](../../../../blocks/cards) (reference)
- [blocks/hero](../../../../blocks/hero) (CTA reference)
