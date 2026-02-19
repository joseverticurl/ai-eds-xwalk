# Implementation Plan: Quotes Card Block

**Specific Functionality:** quotescard (Career Quotes Cards)  
**Guide:** [creating-eds-block](../../implementation-guide.md)  
**User Story:** [quotescard.md](../../quotescard.md)  
**Version:** v1  
**Date:** 2026-02-19  

---

## Overview

Implement the **quotescard** block: a parent-child EDS block with scroll-driven image updates, common CTA, and responsive layout. Desktop: image left, quote cards right, CTA below image. Mobile: image top, stacked quote cards, CTA. Scroll (Intersection Observer) updates the displayed image to match the visible quote on both breakpoints.

**Design Reference:**
- Desktop: [Figma node 1-1505](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=1-1505)
- Mobile: [Figma node 1-1551](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=1-1551)

---

## Structure Contract (Index-Based)

**Verified from [quotescard.html](quotescard.html) (user-provided HTML):**

**Parent block (quotescard):**
- `block.children[0]` = CTA link row (cell 0: `<a>`)
- `block.children[1]` = CTA text row (cell 0: text)
- `block.children[2]` = CTA target row (cell 0: _self|_blank)
- `block.children[3+]` = Quote card item rows

**Per quote card row:**
- `row.children[0]` = Image cell (picture/img; alt from img.alt)
- `row.children[1]` = Quote text cell
- `row.children[2]` = Author name cell
- `row.children[3]` = Author title cell
- `row.children[4]` = Author location cell

---

## Phase 0: Pre-Implementation

### Task 0.1: Verify Design Specifications
- [ ] Confirm Figma designs (desktop 1-1505, mobile 1-1551) match requirements in [quotescard.md](../../quotescard.md)
- [ ] Document colors, typography, spacing from Figma (orange gradient, black CTA, white quote cards, rounded corners)
- [ ] Confirm breakpoint: 900px (default per implementation guide)

### Task 0.2: Verify User Story
- [ ] User story updated: mobile uses scroll (not tap) — see [quotescard.md](../../quotescard.md)
- [ ] CTA button and URL confirmed as parent-level fields

---

## Phase 1: Backend — XWalk Configuration

**Reference:** This project uses block-level `_*.json` files merged via `../blocks/*/_*.json` pointers. Create `blocks/quotescard/_quotescard.json`.

### Task 1.1: Create Block XWalk Configuration File
- [x] Create `blocks/quotescard/_quotescard.json`
- [ ] Add **parent definition** (quotescard) with `model` and `filter` (parent has CTA fields)
- [ ] Add **child definition** (quotecard) with `model` for item
- [ ] Add **parent model** (quotescard): fields `ctaLink` (aem-content/text), `ctaText` (text), `ctaTarget` (text, optional)
- [ ] Add **child model** (quotecard): fields `image` (reference), `imageAlt` (text), `quote` (richtext), `authorName` (text), `authorTitle` (text), `authorLocation` (text)
- [ ] Add **filter** (quotescard): `components: ["quotecard"]`

**Structure for `_quotescard.json`:**
```json
{
  "definitions": [
    {
      "title": "Quotes Card",
      "id": "quotescard",
      "plugins": {
        "xwalk": {
          "page": {
            "resourceType": "core/franklin/components/block/v1/block",
            "template": {
              "name": "QuotesCard",
              "model": "quotescard",
              "filter": "quotescard"
            }
          }
        }
      }
    },
    {
      "title": "Quote Card",
      "id": "quotecard",
      "plugins": {
        "xwalk": {
          "page": {
            "resourceType": "core/franklin/components/block/v1/block/item",
            "template": {
              "name": "QuoteCard",
              "model": "quotecard"
            }
          }
        }
      }
    }
  ],
  "models": [
    {
      "id": "quotescard",
      "fields": [
        { "component": "aem-content", "name": "ctaLink", "label": "CTA Link" },
        { "component": "text", "name": "ctaText", "label": "CTA Text", "value": "" },
        { "component": "text", "name": "ctaTarget", "label": "CTA Target", "value": "_self" }
      ]
    },
    {
      "id": "quotecard",
      "fields": [
        { "component": "reference", "name": "image", "label": "Image", "multi": false },
        { "component": "text", "name": "imageAlt", "label": "Alt", "value": "" },
        { "component": "richtext", "name": "quote", "label": "Quote", "value": "", "valueType": "string" },
        { "component": "text", "name": "authorName", "label": "Author Name", "valueType": "string" },
        { "component": "text", "name": "authorTitle", "label": "Title", "valueType": "string" },
        { "component": "text", "name": "authorLocation", "label": "Location", "valueType": "string" }
      ]
    }
  ],
  "filters": [
    { "id": "quotescard", "components": ["quotecard"] }
  ]
}
```

### Task 1.2: Register Block in Section Filter
- [x] Edit `models/_section.json`
- [x] Add `"quotescard"` to the section `components` array in the section filter
- [ ] Reference: `{"id":"section","components":["text","image","button","title","hero","cards","columns","fragment","quotescard"]}`

### Task 1.3: Run Build and Validate
- [x] Run `npm run build:json`
- [x] Verify `component-definition.json`, `component-models.json`, `component-filters.json` include quotescard definitions

### Task 1.4: HUMAN TEST — Backend Configuration
- [ ] **Human:** Deploy to AEM/Universal Editor (or use local preview if available)
- [ ] **Human:** Add the Quotes Card block to a page
- [ ] **Human:** Configure CTA fields (link, text)
- [ ] **Human:** Add 2–3 quote card items with all fields
- [ ] **Human:** Extract the semantic HTML (view source or DevTools) and provide to Cursor for Phase 2
- [ ] **Human:** Verify block appears in component browser and authoring UI works

---

## Phase 2: User-Provided Semantic HTML (MANDATORY)

### Task 2.1: Obtain Authoring HTML
- [x] **Human:** Provide the semantic HTML output from Universal Editor for the configured quotescard block (see [quotescard.html](quotescard.html))
- [ ] Include block root element: `<div class="quotescard">...</div>`
- [ ] Include at least 2 quote card items
- [ ] Include CTA row (with and without optional target if applicable)

### Task 2.2: Document Structure Contract
- [x] Analyze user-provided HTML to confirm field indices (rows and cells)
- [x] Document: which row index = CTA, which rows = quote cards
- [x] Document: per-row cell order (image, quote, authorName, authorTitle, authorLocation — no separate alt cell)
- [x] Document: empty-field behavior (verified from HTML)
- [x] Update structure contract in this plan (see above)

---

## Phase 3: Frontend — JavaScript

### Task 3.1: Create Block JavaScript File
- [x] Create `blocks/quotescard/quotescard.js`
- [ ] Add JSDoc with structure contract (based on user-provided HTML)
- [ ] Import: `createOptimizedPicture`, `moveInstrumentation`, `loadBlock` utilities as needed
- [ ] Export default `decorate(block)` function

### Task 3.2: Implement Index-Based Data Extraction
- [x] Extract CTA rows (block.children[0,1,2]): link, text, target using robust extraction (see [implementation guide](../../implementation-guide.md) Pattern 6)
- [x] Extract quote card rows (block.children[3+]): image, quote, authorName, authorTitle, authorLocation per row
- [x] Handle `wrapTextNodes()`: check for wrapped `<p>` and `querySelector('p a')` when extracting links/text
- [x] Use optional chaining and nullish coalescing for safe access

### Task 3.3: Implement DOM Transformation
- [x] Build desktop layout: left column (image + CTA), right column (quote cards)
- [x] Build mobile layout: top image, stacked quote cards, CTA
- [x] Use `moveInstrumentation()` when replacing/moving elements
- [x] Add CSS classes: `quotescard-wrapper`, `quotescard-image-container`, `quotescard-cta`, `quotescard-cards`, `quotescard-card`, etc.
- [x] Optimize images with `createOptimizedPicture()` for breakpoints (750, 1440)

### Task 3.4: Implement Scroll-Driven Image Update
- [x] Use `IntersectionObserver` to detect which quote card is in view
- [x] Update displayed image when a new card intersects viewport
- [x] Use breakpoint 900px (`window.matchMedia('(min-width: 900px)')`) to adapt behavior if needed
- [x] Debounce or throttle observer callbacks if performance is a concern

### Task 3.5: HUMAN TEST — JavaScript
- [ ] **Human:** Load a page with the quotescard block
- [ ] **Human:** Verify no console errors
- [ ] **Human:** Verify DOM structure transforms correctly (inspect elements)
- [ ] **Human:** Verify image updates when scrolling (desktop and mobile)

---

## Phase 4: Frontend — CSS

### Task 4.1: Create Block CSS File
- [x] Create `blocks/quotescard/quotescard.css`
- [x] Style the **transformed structure** (classes added by JavaScript), not raw AEM HTML

### Task 4.2: Desktop Layout
- [x] Two-column layout: image + CTA on left, quote cards on right
- [x] Image: rounded corners, aspect ratio from design (Figma: portrait/square)
- [x] CTA button: black background, white text, rounded (per Figma)
- [x] Quote cards: white background, rounded corners, separation between cards
- [x] Typography: quote (bold, large), author name/title/location (smaller)

### Task 4.3: Mobile Layout
- [x] Single column: image top, quote cards stacked below, CTA
- [x] Breakpoint: `@media (width >= 900px)` for desktop
- [x] Image and text scale for smaller screens

### Task 4.4: Responsive and Design Tokens
- [x] Use CSS variables where applicable
- [x] Match Figma colors (orange gradient background, black CTA)
- [x] Ensure accessibility: contrast, focus states

### Task 4.5: HUMAN TEST — CSS
- [ ] **Human:** Verify desktop layout matches Figma
- [ ] **Human:** Verify mobile layout matches Figma
- [ ] **Human:** Verify breakpoint transition at 900px
- [ ] **Human:** Test on real device or browser resize

---

## Phase 5: Integration and Validation

### Task 5.1: Lint and Build
- [ ] Run `npm run lint`
- [ ] Fix any lint errors
- [ ] Run `npm run build:json` to ensure config is current

### Task 5.2: AEM Authoring Validation
- [ ] **Human:** Test block in AEM authoring interface
- [ ] **Human:** Add/edit/remove quote cards
- [ ] **Human:** Edit CTA link and text
- [ ] **Human:** Verify content saves and renders in publish mode

### Task 5.3: Cross-Browser and Accessibility
- [ ] **Human:** Test in Chrome, Firefox, Safari (or available browsers)
- [ ] **Human:** Verify keyboard navigation
- [ ] **Human:** Verify screen reader compatibility (basic check)

---

## Phase 6: Final Checklist

- [x] XWalk config in `blocks/quotescard/_quotescard.json`
- [x] Section filter includes `quotescard`
- [x] `blocks/quotescard/quotescard.js` with index-based extraction and scroll-driven image
- [x] `blocks/quotescard/quotescard.css` with desktop and mobile layouts
- [x] User-provided HTML used to validate structure contract
- [ ] `moveInstrumentation()` used when transforming DOM
- [ ] No block-level JSON in wrong locations (follow project convention: `blocks/*/_*.json`)
- [ ] All human test tasks completed

---

## Key References

- [Implementation Guide](../../implementation-guide.md) — creating-eds-block
- [User Story](../../quotescard.md) — quotescard
- Figma Desktop: node 1-1505
- Figma Mobile: node 1-1551
- Project uses `blocks/*/_*.json` for XWalk config (merge from `../blocks/*/_*.json`)

---

## Traceability

| Requirement | Implementation |
|-------------|----------------|
| Scroll-driven image update | Task 3.4 — IntersectionObserver |
| Common CTA button + URL | Task 1.1 — parent model fields; Task 3.2 — CTA extraction |
| Mobile scroll (no tap) | [quotescard.md](../../quotescard.md) updated; Task 4.3 — mobile layout |
| Quote, author, title, location per card | Task 1.1 — quotecard model |
| 900px breakpoint | Task 3.4, Task 4.3 |
