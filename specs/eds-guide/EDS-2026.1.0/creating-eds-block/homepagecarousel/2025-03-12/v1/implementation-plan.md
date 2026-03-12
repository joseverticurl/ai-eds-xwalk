# Implementation Plan: Homepage Carousel (homepagecarousel)

**Functionality:** Homepage Hero Carousel  
**Guide:** [EDS-2026.1.0 creating-eds-block](../../implementation-guide.md)  
**Spec:** [homepagecarousel.md](../../homepagecarousel.md)  
**Date:** 2025-03-12  
**Version:** v1  

**Design:** [Desktop](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=241-1640&m=dev) | [Mobile](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=241-2289&m=dev)  
**Reference Block:** [blocks/featurecardscarousel](../../../../../blocks/featurecardscarousel)

---

## 1. Overview

### 1.1 Purpose

Implement an EDS block **homepagecarousel** — a hero carousel for the homepage that showcases featured stories/campaigns with slides (image or video backgrounds), brand icons as navigation and progress indicators, configurable auto-transition, and gradient/aura effects. Desktop shows left headline + right carousel; mobile hides headline and displays brand icons horizontally above the carousel.

### 1.2 Design References (Figma)

| Viewport | Figma URL |
|----------|-----------|
| Desktop | [node 241:1640](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=241-1640&m=dev) |
| Mobile | [node 241:2289](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=241-2289&m=dev) |

### 1.3 Design Specifications (from Figma)

**Desktop layout:**
- Left: Static headline (e.g., "We refresh the world to make a difference") — large typography
- Right: Carousel card with media background, category badge (e.g., News), paragraph text, CTA button
- Brand icons: Vertical stack on right edge of card; each icon = one slide; active icon shows progress

**Mobile layout:**
- Headline hidden
- Brand icons: Horizontal row above carousel
- Carousel card: Full width

**Breakpoints (project standard):**
- Mobile: default (< 900px)
- Desktop: `width >= 900px`

**Typography (from Figma):**
- Desktop Headline 1: 72px, TCCC-UnityHeadline Medium
- Desktop Headline 4: 38px (card text)
- Mobile Headline 4: 28px
- Label XS: 12px (badge)
- Label L: 16px (CTA)

---

## 2. XWalk Model (Content Structure)

### 2.1 Parent Block Fields (homepagecarousel)

| Index | Field Name | Component | Label | Notes |
|-------|------------|-----------|-------|-------|
| 0 | sectionHeadline | richtext | Section Headline | Desktop left column headline |
| 1 | transitionDuration | number | Transition Duration (sec) | Slide duration, e.g. 3–5, default 5 |
| 2 | autoplay | select | Autoplay | yes/no, default yes |
| 3 | loopSlides | select | Loop Slides | yes/no, default yes |
| 4 | enableAuraEffect | select | Enable Aura Effect | yes/no, default yes |
| 5 | auraGradient | text | Aura Gradient | Optional; CSS gradient string for aura |

### 2.2 Child Block Fields (homepagecarouselitem)

| Index | Field Name | Component | Label | Notes |
|-------|------------|-----------|-------|-------|
| 0 | mediaType | select | Media Type | image \| video |
| 1 | image | reference | Background Image | Used when mediaType=image |
| 2 | imageAlt | text | Image Alt | Alt text for image |
| 3 | video | reference | Background Video | Used when mediaType=video |
| 4 | videoAlt | text | Video Alt | Alt text for video |
| 5 | categoryTag | text | Category Tag | Optional (e.g., News) |
| 6 | paragraphs | richtext | Paragraphs | Multiple `<p>`; alignment via CSS |
| 7 | ctaLink | aem-content | CTA Link | Link URL |
| 8 | ctaLabel | text | CTA Label | Button text |
| 9 | brandIcon | reference | Brand Icon | Icon for slide/navigation |
| 10 | brandIconAlt | text | Brand Icon Alt | Alt for brand icon |
| 11 | overlayGradient | text | Overlay Gradient | Optional; CSS gradient for text readability |

**Structure contract (from user-provided [homepagecarousel.html](../../homepagecarousel.html)):**
- Parent: `block.children[0]` = sectionHeadline, `[1]` = transitionDuration, `[2]` = autoplay, `[3]` = loopSlides, `[4]` = enableAuraEffect, `[5]` = auraGradient
- Each slide row (`block.children[6+]`): `row.children[0]` = mediaType, `[1]` = image (picture) or video URL (link), `[2]` = video URL (link), `[3]` = categoryTag, `[4]` = paragraphs, `[5]` = ctaLink, `[6]` = ctaLabel, `[7]` = brandIcon (picture), `[8]` = brandIconAlt/overlayGradient (optional)

---

## 3. Implementation Tasks

### Phase 0: Pre-Implementation

- [ ] **0.1** Verify Figma links are accessible.
- [ ] **0.2** Review [implementation guide](../../implementation-guide.md) Parts 1–3.
- [ ] **0.3** Confirm [homepagecarousel spec](../../homepagecarousel.md) and acceptance criteria.

---

### Phase 1: Backend — XWalk Configuration (Step 1)

**Reference:** [Implementation Guide - Part 2: Backend Code Generation](../../implementation-guide.md#part-2-backend-code-generation)

#### Task 1.1: Create block-level JSON and definitions

- [ ] **1.1.1** Create `blocks/homepagecarousel/` directory.
- [ ] **1.1.2** Create `blocks/homepagecarousel/_homepagecarousel.json` with:
  - **Parent definition:** id `homepagecarousel`, title `Homepage Carousel`, resourceType `core/franklin/components/block/v1/block`, model `homepagecarousel`, filter `homepagecarousel`
  - **Child definition:** id `homepagecarouselitem`, title `Homepage Carousel Slide`, resourceType `core/franklin/components/block/v1/block/item`, model `homepagecarouselitem`
  - **Filter:** `{"id":"homepagecarousel","components":["homepagecarouselitem"]}`

**Parent definition structure (within definitions array):**
```json
{
  "title": "Homepage Carousel",
  "id": "homepagecarousel",
  "plugins": {
    "xwalk": {
      "page": {
        "resourceType": "core/franklin/components/block/v1/block",
        "template": {
          "name": "HomepageCarousel",
          "model": "homepagecarousel",
          "filter": "homepagecarousel"
        }
      }
    }
  }
}
```

**Child definition structure:**
```json
{
  "title": "Homepage Carousel Slide",
  "id": "homepagecarouselitem",
  "plugins": {
    "xwalk": {
      "page": {
        "resourceType": "core/franklin/components/block/v1/block/item",
        "template": {
          "name": "HomepageCarouselSlide",
          "model": "homepagecarouselitem"
        }
      }
    }
  }
}
```

**Human test:** [ ] Run `npm run build:json` and verify `component-definition.json` contains both block definitions.

---

#### Task 1.2: Add parent model (homepagecarousel)

- [ ] **1.2.1** Add model `homepagecarousel` with fields per §2.1 in `_homepagecarousel.json`.

**autoplay / loopSlides / enableAuraEffect select format:**
```json
{
  "component": "select",
  "name": "autoplay",
  "label": "Autoplay",
  "valueType": "string",
  "value": "true",
  "options": [
    { "name": "Yes", "value": "true" },
    { "name": "No", "value": "false" }
  ]
}
```

**Human test:** [ ] Run `npm run build:json`; verify `component-models.json` contains `homepagecarousel` with 6 fields.

---

#### Task 1.3: Add child model (homepagecarouselitem)

- [ ] **1.3.1** Add model `homepagecarouselitem` with fields per §2.2 in `_homepagecarousel.json`.

**mediaType select format:**
```json
{
  "component": "select",
  "name": "mediaType",
  "label": "Media Type",
  "valueType": "string",
  "value": "image",
  "options": [
    { "name": "Image", "value": "image" },
    { "name": "Video", "value": "video" }
  ]
}
```

**Human test:** [ ] Run `npm run build:json`; verify `component-models.json` contains `homepagecarouselitem` with 12 fields.

---

#### Task 1.4: Register block in section filter

- [ ] **1.4.1** Add `"homepagecarousel"` to the `components` array in `models/_section.json`.

**Human test:** [ ] Run `npm run build:json`; verify `component-filters.json` and section filter include `homepagecarousel`.

---

#### Task 1.5: Backend validation

- [ ] **1.5.1** Validate JSON syntax.
- [ ] **1.5.2** Deploy to AEM/Universal Editor (or local XWalk) and add Homepage Carousel block; confirm all parent and child fields are editable.

**Human test:** [ ] Add block in Universal Editor; add 2+ slides with sample content; save; verify authoring UI works.

---

### Phase 2: User Provides Semantic HTML (Step 2 — MANDATORY)

> **CRITICAL:** Do NOT generate HTML or proceed to Phase 3 until the user provides HTML from Universal Editor. Cursor output can differ from Universal Editor; user-provided HTML is the source of truth.

**Reference:** [Implementation Guide - Step 2: User Provides Semantic HTML](../../implementation-guide.md#step-2-user-provides-semantic-html)

#### Task 2.1: Request user-provided HTML

- [ ] **2.1** **WAIT for user:** Author the Homepage Carousel block in Adobe Universal Editor with sample content:
  - Section headline (e.g., "We refresh the world to make a difference")
  - Transition duration, autoplay, loop enabled
  - 2–3 slides with:
    - Mix of image and (optionally) video backgrounds
    - Category tag (e.g., News)
    - Multiple paragraphs
    - CTA (label + link)
    - Brand icon per slide
- [ ] **2.2** User provides the generated HTML (view source or DevTools).

#### Task 2.2: Document structure contract

- [ ] **2.3** Document the structure contract from user-provided HTML:
  - Parent row indices (sectionHeadline, transitionDuration, autoplay, loopSlides, enableAuraEffect, auraGradient)
  - Child item row structure (mediaType, image, imageAlt, video, videoAlt, categoryTag, paragraphs, ctaLink, ctaLabel, brandIcon, brandIconAlt, overlayGradient)
  - Empty/optional field behavior
  - How AEM combines or splits rows (e.g., media + alt in same row)

**Human test:** [ ] Confirm structure contract is documented and reviewed before Phase 3.

---

### Phase 3: Frontend — JavaScript Implementation (Step 3)

**Reference:** [Implementation Guide - Part 3: Frontend Code Generation](../../implementation-guide.md#part-3-frontend-code-generation)

*Proceed only after Phase 2 is complete and structure contract is documented.*

#### Task 3.1: Create block files

- [ ] **3.1.1** Create `blocks/homepagecarousel/homepagecarousel.js`.
- [ ] **3.1.2** Create `blocks/homepagecarousel/homepagecarousel.css`.

**Human test:** [ ] Verify files exist and match `blocks/featurecardscarousel` structure.

---

#### Task 3.2: Implement `decorate()` — structure extraction

- [ ] **3.2.1** Add JSDoc with structure contract (from user-provided HTML).
- [ ] **3.2.2** Extract parent fields: sectionHeadline, transitionDuration, autoplay, loopSlides, enableAuraEffect, auraGradient.
- [ ] **3.2.3** Extract child items: each slide row with mediaType, image/video, categoryTag, paragraphs, ctaLink, ctaLabel, brandIcon.
- [ ] **3.2.4** Use `moveInstrumentation()` when transforming DOM.
- [ ] **3.2.5** Use optional chaining; handle wrapped `<p>` and richtext innerHTML.

**Human test:** [ ] Run block with user-provided HTML; verify data extraction (e.g., via console or DOM inspect).

---

#### Task 3.3: Implement DOM transformation

- [ ] **3.3.1** Build desktop layout: left headline section, right carousel container.
- [ ] **3.3.2** Build carousel slides: media background (image or video), category tag, paragraphs (with align-left/right/center pattern), CTA button.
- [ ] **3.3.3** Build brand icon navigation container (vertical on desktop, horizontal on mobile).
- [ ] **3.3.4** Apply paragraph alignment pattern: 1st→left, 2nd→right, 3rd→center, repeat.
- [ ] **3.3.5** Replace block content with transformed structure.

**Human test:** [ ] Verify transformed DOM in DevTools; check layout and classes.

---

#### Task 3.4: Implement carousel logic

- [ ] **3.4.1** Use Swiper JS (or similar) for slide transitions; load via `loadScript()` if not already present.
- [ ] **3.4.2** Brand icons = slide navigation; clicking icon goes to that slide.
- [ ] **3.4.3** Active icon: show progress animation (CSS animation or SVG stroke-dasharray).
- [ ] **3.4.4** Autoplay: use `transitionDuration` (sec) for delay; respect `autoplay` setting.
- [ ] **3.4.5** Loop: respect `loopSlides`; reset timer on manual navigation.
- [ ] **3.4.6** Video slides: muted autoplay, loop; pause when not visible if needed.

**Human test:** [ ] Test desktop: auto-rotation, icon click navigation, progress animation on active icon.

---

#### Task 3.5: Responsive behavior

- [ ] **3.5.1** Desktop (≥900px): headline visible left; carousel right; icons vertical.
- [ ] **3.5.2** Mobile (<900px): headline hidden; carousel full width; icons horizontal above carousel.
- [ ] **3.5.3** Swiper breakpoints for touch/swipe on mobile.

**Human test:** [ ] Test at 900px, 600px, 375px; verify layout switches correctly.

---

#### Task 3.6: Media and image handling

- [ ] **3.6.1** Use `createOptimizedPicture()` for images; video element for video with `muted loop autoplay playsinline`.
- [ ] **3.6.2** Use `loading="lazy"` where appropriate; consider `eager` for first slide.
- [ ] **3.6.3** Apply `overlayGradient` as background on text overlay when provided; default gradient if empty.

**Human test:** [ ] Verify image and video slides render; check performance.

---

### Phase 4: Frontend — CSS Implementation

#### Task 4.1: Base styles

- [ ] **4.1.1** Style section container; apply aura gradient when `enableAuraEffect` is true (use `auraGradient` or default).
- [ ] **4.1.2** Style headline (desktop): typography per Figma (e.g., 72px, TCCC-UnityHeadline).
- [ ] **4.1.3** Style carousel card: rounded corners, shadow, media background, overlay.
- [ ] **4.1.4** Style category badge, paragraphs, CTA button.
- [ ] **4.1.5** Style brand icons: 50px desktop, 40px mobile; active state with progress ring.

**Human test:** [ ] Desktop layout matches Figma.

---

#### Task 4.2: Responsive styles

- [ ] **4.2.1** Media query `@media (width >= 900px)` for desktop layout.
- [ ] **4.2.2** Below 900px: hide headline; full-width carousel; horizontal icon row.
- [ ] **4.2.3** Card padding and typography scale per viewport (see §1.3).

**Human test:** [ ] Layout matches Figma at desktop and mobile breakpoints.

---

#### Task 4.3: Interactive and accessibility

- [ ] **4.3.1** CTA buttons: keyboard accessible, focus visible.
- [ ] **4.3.2** Brand icons: keyboard navigable; `aria-label` or equivalent for slide selection.
- [ ] **4.3.3** Ensure WCAG contrast for text; use overlay gradient for readability.
- [ ] **4.3.4** All images/icons use alt text from authoring.

**Human test:** [ ] Keyboard navigation; screen reader basics; contrast check.

---

### Phase 5: Integration and Validation

- [ ] **5.1** Run `npm run build:json` if backend changed.
- [ ] **5.2** Test in AEM authoring: add block, edit fields, add/remove slides, save.
- [ ] **5.3** Test in publish mode: verify content and carousel behavior.
- [ ] **5.4** Run Lighthouse; address any regressions.

**Human test:** [ ] Full flow: author → publish → verify desktop/mobile and interactions.

---

## 4. Assumptions and Decisions

| Item | Decision |
|------|----------|
| CTA | Single CTA per slide; `aem-content` for ctaLink, `text` for ctaLabel |
| auraGradient / overlayGradient | `text` component; author enters CSS gradient string or leave empty for default |
| autoplay / loopSlides / enableAuraEffect | `select` with yes/no (value true/false) |
| Paragraph alignment | Frontend: apply `.align-left`, `.align-right`, `.align-center` by index (1→L, 2→R, 3→C, repeat) |
| Breakpoints | Project standard: 900px desktop; mobile default |
| Carousel library | Swiper JS (same as featurecardscarousel) or native CSS/JS |
| Video | `muted loop autoplay playsinline` per spec |

---

## 5. Traceability

| Acceptance Criterion | Implementation |
|----------------------|----------------|
| Multiple carousel slides | Child items (homepagecarouselitem) |
| Image or video backgrounds | mediaType, image, video fields |
| Configurable transition timing | transitionDuration |
| Brand icons as navigation | brandIcon per slide; click to navigate |
| Active icon progress animation | CSS animation in Task 4.1.5 |
| Auto transition | autoplay + Swiper autoplay |
| Desktop headline + carousel | sectionHeadline; layout in Task 3.3.1 |
| Mobile hides headline | CSS in Task 4.2.2 |
| Multiple paragraphs per slide | paragraphs richtext; alignment in Task 3.3.4 |
| Carousel loops | loopSlides + Swiper loop |

---

## 6. References

- [Implementation Guide](../../implementation-guide.md)
- [homepagecarousel spec](../../homepagecarousel.md)
- [Figma Desktop](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=241-1640&m=dev)
- [Figma Mobile](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=241-2289&m=dev)
- [blocks/featurecardscarousel](../../../../../blocks/featurecardscarousel)

---

*Implementation plan follows [EDS-2026.1.0 creating-eds-block](../../implementation-guide.md) and test-driven development with human verification checkpoints. Phase 2 MUST be completed before Phase 3 — AI must NOT generate HTML; user-provided HTML is required.*
