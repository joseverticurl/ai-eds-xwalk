# Implementation Plan: PeopleCards

**Guide:** [eds-guide / EDS-2026.1.0 / creating-eds-block](../implementation-guide.md)  
**Specific Functionality:** peoplecards  
**Date:** 2025-03-12  
**Version:** v1  
**Requirements:** [peoplecard.md](../../peoplecard.md)  
**Design:** [Desktop](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=149-1072&m=dev) | [Mobile](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=149-1996&m=dev)  
**Reference Block:** [blocks/featurecardscarousel](../../../../blocks/featurecardscarousel) | [blocks/cards](../../../../blocks/cards)

---

## Summary

Implement a **PeopleCards** block that displays leadership profiles in a horizontal carousel with optional background aura gradient. Each card shows profile image, name, job title, and a profile link button. Desktop: 3–4 cards visible, drag + navigation arrows. Mobile: one primary card with partial peek of neighbors, swipe + pagination arrows/dots. Authors configure section headline, CTA, and background style (none | aura).

---

## Design Specifications (from Figma)

| Element | Desktop | Mobile |
|---------|---------|--------|
| **Headline** | 120px, TCCC-UnityHeadline Medium, black | 34px, leading 1.2 |
| **Card dimensions** | 440×590px, rounded 24px, padding 30px | ~335×426px primary, rounded 16px, padding 24px |
| **Card structure** | Image + gradient overlay, name (20px), title (14px), circular nav button 50px | Same, name 18px |
| **Background** | Gradient aura (Bg Mix) when Background Style = aura | Same |
| **CTA** | Pill button, black bg, white text, "Meet all our leaders" | Same |
| **Carousel** | 4 cards, gap 20px, drag + arrows overlay | 1 main + peek, swipe + prev/next arrows below |
| **Colors** | var(--background/off_white,#f2f2f2), var(--netural/black), var(--cta/background,black) | Same |

---

## Breakpoints (from Figma + requirements)

| Viewport | Width | Behavior |
|----------|-------|----------|
| Mobile | 375px | 1 card + peek, swipe, pagination arrows |
| Desktop | 1440px | 3–4 cards, drag, navigation arrows |

*Use project standard breakpoints if different (e.g. 600px, 900px, 1200px).*

---

## Implementation Tasks

### Phase 0: Pre-Implementation

- [x] **0.1** Verify requirements and design access. Confirm Figma links and [peoplecard.md](../../peoplecard.md) are accessible.
- [x] **0.2** Review [implementation guide](../implementation-guide.md) Part 1 and Part 2.

---

### Phase 1: Backend — XWalk Configuration (Step 1)

**Reference:** [Implementation Guide — Part 2: Backend Code Generation](../implementation-guide.md#part-2-backend-code-generation)

#### Step 1.1: Create Block-Level JSON and Add Definitions

- [x] **1.1.1** Create `blocks/peoplecards/_peoplecards.json`.
- [x] **1.1.2** Add **parent block definition** (PeopleCards) with `model` and `filter` in template (parent has authoring fields).
- [x] **1.1.3** Add **child block definition** (PeopleCards Item) with `model` and `block/item` resource type.

**Parent definition structure:**
```json
{
  "title": "PeopleCards",
  "id": "peoplecards",
  "plugins": {
    "xwalk": {
      "page": {
        "resourceType": "core/franklin/components/block/v1/block",
        "template": {
          "name": "PeopleCards",
          "model": "peoplecards",
          "filter": "peoplecards"
        }
      }
    }
  }
}
```

**Child definition structure:**
```json
{
  "title": "PeopleCards Item",
  "id": "peoplecardsitem",
  "plugins": {
    "xwalk": {
      "page": {
        "resourceType": "core/franklin/components/block/v1/block/item",
        "template": {
          "name": "PeopleCardsItem",
          "model": "peoplecardsitem"
        }
      }
    }
  }
}
```

**Human test:** [x] Run `npm run build:json` and verify `component-definition.json` contains the new block definitions.

---

#### Step 1.2: Add Parent Model (peoplecards)

- [x] **1.2.1** Add model `peoplecards` with fields in this order (field order = structure contract):

| Field | Component | Name | Label | Notes |
|-------|-----------|------|-------|-------|
| 1 | text | title | Title | Section headline |
| 2 | text | ctaLabel | CTA Label | Button label |
| 3 | aem-content | ctaLink | CTA Link | Button URL |
| 4 | select | backgroundStyle | Background Style | none \| aura, default none |

**Background Style options:**
```json
"options": [
  { "name": "None", "value": "none" },
  { "name": "PeopleCard Aura", "value": "aura" }
]
```

**Human test:** [x] Run `npm run build:json` and verify `component-models.json` contains the parent model.

---

#### Step 1.3: Add Child Model (peoplecardsitem)

- [x] **1.3.1** Add model `peoplecardsitem` with fields in this order:

| Field | Component | Name | Label | Notes |
|-------|-----------|------|-------|-------|
| 1 | reference | image | Image | Profile image |
| 2 | text | imageAlt | Image Alt | Alt text for image |
| 3 | text | name | Name | Person name |
| 4 | text | title | Title | Job title |
| 5 | aem-content | profileLink | Profile Link | Card CTA URL |

**Human test:** [x] Run `npm run build:json` and verify `component-models.json` contains the child model.

---

#### Step 1.4: Add Filter and Register Block in Section

- [x] **1.4.1** Add filter to `_peoplecards.json`: `{"id":"peoplecards","components":["peoplecardsitem"]}`.
- [x] **1.4.2** Add `peoplecards` to section's allowed components in `models/_section.json` (edit `components` array in filters).

**Human test:** [x] Run `npm run build:json`. Verify `component-filters.json` has `peoplecards` filter and section includes `peoplecards`.

---

#### Step 1.5: Deploy and Validate Backend

- [ ] **1.5.1** Deploy backend config to AEM/Universal Editor environment.
- [ ] **1.5.2** Open Universal Editor, add PeopleCards block to a page, confirm authoring UI shows all fields and child items can be added.

**Human test:** [ ] Open AEM/Universal Editor, add PeopleCards block, configure Title, CTA Label, CTA Link, Background Style, and add 3+ PeopleCards Items. Confirm all fields are editable and block renders (even without styling).

---

### Phase 2: WAIT — User Provides Semantic HTML (Step 2)

**CRITICAL:** Per [Implementation Guide — AI Governance Rules](../implementation-guide.md#ai-governance-rules-process), **do NOT generate JavaScript or CSS until the user provides semantic HTML from Universal Editor.**

#### Checkpoint 2.1: Request User HTML

- [ ] **2.1.1** Request from user:

> **Please provide the semantic HTML for the PeopleCards block:**
>
> 1. Author the block in Adobe Universal Editor with sample content (Title, CTA Label, CTA Link, Background Style, and 3+ PeopleCards Items)
> 2. Configure all relevant fields (include at least one card with Profile Link)
> 3. Copy the generated HTML (view page source or use DevTools)
> 4. Paste the HTML here
>
> Include the block's root element (e.g. `<div class="peoplecards">...</div>`) and its full structure.

- [ ] **2.1.2** **STOP.** Do not proceed to Phase 3 until user provides the HTML.

**Human action required:** [ ] User pastes semantic HTML from Universal Editor. AI documents structure contract (field indices, row structure) before proceeding.

---

### Phase 3: Frontend — JavaScript and CSS (Step 3)

**Prerequisite:** User-provided HTML received and structure contract documented.

**Reference:** [Implementation Guide — Part 3: Frontend Code Generation](../implementation-guide.md#part-3-frontend-code-generation), [Pattern 7: Carousel Block with Swiper](../implementation-guide.md#pattern-7-carousel-block-with-swiper)

#### Step 3.1: Create Block Files

- [ ] **3.1.1** Create `blocks/peoplecards/peoplecards.js`.
- [ ] **3.1.2** Create `blocks/peoplecards/peoplecards.css`.

**Human test:** [ ] Verify files exist and block is loadable (run project, add block to page — may show unstyled content).

---

#### Step 3.2: Implement decorate() — Structure Extraction

- [ ] **3.2.1** Add JSDoc with structure contract (field indices) from user-provided HTML.
- [ ] **3.2.2** Extract parent fields using index-based access (title, ctaLabel, ctaLink, backgroundStyle).
- [ ] **3.2.3** Extract card items (indices after parent rows); per card: image, imageAlt, name, title, profileLink.
- [ ] **3.2.4** Use `getLink()`, `getText()` helpers; use `createOptimizedPicture()` for images per [Pattern 5](../implementation-guide.md#pattern-5-image-optimization-index-based).

**Human test:** [ ] Run block; verify no console errors and DOM transforms without crashing.

---

#### Step 3.3: Build Section and Card Markup

- [ ] **3.3.1** Build section container with optional aura background class when `backgroundStyle === 'aura'`.
- [ ] **3.3.2** Build headline (title) element.
- [ ] **3.3.3** Build carousel wrapper with Swiper structure (swiper-wrapper, swiper-slide per card).
- [ ] **3.3.4** Each card: image with gradient overlay, name, title, profile link button (circular, with arrow icon).
- [ ] **3.3.5** Fetch arrow icon from Figma (node for right-arrow in card CTA) or use existing `icons/` asset; save as `icons/arrow-right.svg` if new.
- [ ] **3.3.6** Build CTA button below carousel (link + label).
- [ ] **3.3.7** Add Swiper navigation (prev/next) and pagination (bullets for mobile).
- [ ] **3.3.8** Use `moveInstrumentation()` when transforming DOM.

**Human test:** [ ] Visually verify block structure: headline, cards, CTA, and background aura (when selected) render.

---

#### Step 3.4: Implement Carousel Logic (Swiper)

- [ ] **3.4.1** Load Swiper via `loadCSS()` and `loadScript()` from `scripts/aem.js` (do not add to head.html).
- [ ] **3.4.2** Initialize Swiper with breakpoints:
  - Mobile (~375px): `slidesPerView: 1`, `slidesPerGroup: 1`, peek effect via `spaceBetween`, pagination bullets.
  - Desktop (~1280px+): `slidesPerView: 3` or `4`, `slidesPerGroup: 1`, navigation arrows.
- [ ] **3.4.3** Enable `grabCursor`, touch/swipe (Swiper default).
- [ ] **3.4.4** No autoplay (manual carousel per requirements).
- [ ] **3.4.5** Add ARIA labels to nav buttons (`aria-label="Previous slide"`, `aria-label="Next slide"`).

**Human test:** [ ] Test carousel: drag on desktop, swipe on mobile, prev/next buttons work, pagination updates.

---

#### Step 3.5: Responsive Styling (CSS)

- [ ] **3.5.1** Desktop: card 440×590px (or proportional), rounded 24px, padding 30px, gap 20px.
- [ ] **3.5.2** Mobile: card ~80–90% width, rounded 16px, padding 24px, partial peek of adjacent cards.
- [ ] **3.5.3** Typography: headline per Figma (120px desktop, 34px mobile); name 20px/18px, title 14px.
- [ ] **3.5.4** Background aura: gradient when `backgroundStyle === 'aura'` (reddish-orange to light grey per Figma).
- [ ] **3.5.5** CTA button: pill shape, black bg, white text.
- [ ] **3.5.6** Card gradient overlay: `from-[rgba(0,0,0,0)]` to `rgba(0,0,0,0.6)` for text readability.
- [ ] **3.5.7** Use project design tokens/CSS variables where applicable.

**Human test:** [ ] Compare desktop and mobile layouts to Figma. Verify aura background, card styling, CTA appearance.

---

#### Step 3.6: Accessibility

- [ ] **3.6.1** Add alt text to all images (from imageAlt field).
- [ ] **3.6.2** Ensure keyboard navigation works (Swiper supports it).
- [ ] **3.6.3** Verify WCAG AA contrast for text on card overlays.
- [ ] **3.6.4** Add `aria-label` to interactive elements where needed.

**Human test:** [ ] Run accessibility audit (browser DevTools, Lighthouse) and keyboard-navigate the carousel.

---

### Phase 4: Validation and Definition of Done

- [ ] **4.1** Component renders correctly on desktop and mobile.
- [ ] **4.2** Mobile cards show partial neighboring cards (peek effect).
- [ ] **4.3** Authors can configure Background Style (none | aura).
- [ ] **4.4** Cards are fully editable in Universal Editor.
- [ ] **4.5** Carousel supports drag/swipe.
- [ ] **4.6** CTA button and card profile links work.
- [ ] **4.7** Accessibility standards met (WCAG AA).

---

## Structure Contract (Placeholder)

*Document after receiving user-provided HTML. Example format:*

| Index | Field | Description |
|-------|-------|--------------|
| 0 | title | Section headline row |
| 1 | ctaLabel | CTA button label row |
| 2 | ctaLink | CTA link row |
| 3 | backgroundStyle | Background style row |
| 4+ | card rows | Each row: image, imageAlt, name, title, profileLink |

*Per-card structure will be confirmed from actual HTML.*

---

## Key References

| Item | Location |
|------|----------|
| Implementation guide | [implementation-guide.md](../implementation-guide.md) |
| User story | [peoplecard.md](../../peoplecard.md) |
| Pattern 7 (Swiper) | [Pattern 7: Carousel Block with Swiper](../implementation-guide.md#pattern-7-carousel-block-with-swiper) |
| Reference block | [blocks/featurecardscarousel](../../../../blocks/featurecardscarousel) |
| Section config | [models/_section.json](../../../../models/_section.json) |
