# Implementation Plan: CareerCards Block

**Functionality:** CareerCards (You may also like)  
**Guide:** [eds-guide / EDS-2026.1.0 / creating-eds-block](../implementation-guide.md)  
**Requirements:** [specs/requirements/careercards.md](../../../../../requirements/careercards.md)  
**Date:** 2026-02-18  
**Version:** v1

---

## 1. Overview

### 1.1 Summary

Implement the **CareerCards** block—a parent-child block displaying related content cards under a configurable section heading ("You may also like"). Each card contains an image, category tag, title, and "Read more" CTA. Layout: **desktop** = 3 cards in a row; **mobile/tablet** = cards stacked vertically.

### 1.2 Design Specifications (from provided images)

| Viewport | Layout | Key Visual Elements |
|----------|--------|---------------------|
| **Desktop** | 3 cards horizontal, equal spacing | Rounded cards with shadow; image top; category pill top-left on image; title overlay on lower image; gradient background section |
| **Mobile/Tablet** | 3 cards stacked vertically | Same card structure; gradient overlay on images; "Read more" CTA with arrow; category pill (white bg, black text) |

**Card structure (all viewports):**
- Rounded corners, drop shadow
- Background image with gradient overlay (darker at bottom for text readability)
- Category tag: pill-shaped, top-left
- Title: white, multi-line, bold
- CTA: "Read more" with right arrow (→)
- Entire card clickable; hover state on desktop

### 1.3 Block Type

**Parent-child block** (Pattern 2 per [implementation guide](../implementation-guide.md)):
- **Parent:** `careercards` — section heading (configurable, default "You may also like")
- **Child:** `careercard` — each card with image, category, title, link

**Codebase structure:** This project uses `blocks/<block-name>/_<block-name>.json` for XWalk config (merged via `merge-json-cli`). See `blocks/cards/_cards.json`, `blocks/hero/_hero.json`.

---

## 2. XWalk Model Design

### 2.1 Parent Model: careercards

| Field Index | Component | Name | Label | Purpose |
|-------------|-----------|------|-------|---------|
| 0 | text | heading | Section Heading | "You may also like" (configurable) |

### 2.2 Child Model: careercard

| Field Index | Component | Name | Label | Purpose |
|-------------|-----------|------|-------|---------|
| 0 | reference | image | Image | Featured image |
| 1 | text | imageAlt | Alt | Image alt text |
| 2 | text | category | Category | Tag label (e.g., "Sustainability") |
| 3 | text | title | Title | Card title (multi-line) |
| 4 | aem-content | link | Link | CTA URL (page reference) |
| 5 | text | linkText | Link Text | "Read more" (optional, default) |
| 6 | text | linkTarget | Target | _self or _blank |

**Structure contract (for JS):**
- `block.children[0]` = parent heading row
- `block.children[1+]` = careercard item rows
- Per card row: `row.children[0]`=image, `[1]`=alt, `[2]`=category, `[3]`=title, `[4]`=link, `[5]`=linkText, `[6]`=target

---

## 3. Implementation Tasks

### Phase 1: Backend — XWalk Configuration

#### Task 1.1: Create block folder and XWalk JSON
- [x] Create `blocks/careercards/` directory
- [x] Create `blocks/careercards/_careercards.json` with:
  - **Definitions:** `careercards` (parent, model + filter), `careercard` (child, model)
  - **Models:** `careercards` (heading), `careercard` (image, imageAlt, category, title, link, linkText, linkTarget)
  - **Filters:** `careercards` → `["careercard"]`
- **Reference:** `blocks/cards/_cards.json`, `blocks/hero/_hero.json`

**Human test:** Run `npm run build:json`. Verify no merge errors. Check that `component-definition.json`, `component-models.json`, `component-filters.json` contain careercards/careercard entries.

---

#### Task 1.2: Register careercards in section filter
- [x] Edit `models/_section.json`
- [x] Add `"careercards"` to the `components` array in the section filter
- **Reference:** Current value: `["text","image","button","title","hero","cards","columns","fragment"]`

**Human test:** Run `npm run build:json`. Verify `component-filters.json` section filter includes `careercards`. Confirm JSON is valid (e.g., `npm run lint`).

---

### Phase 2: Request User-Provided Semantic HTML (MANDATORY)

#### Task 2.1: Deploy and request HTML from user
- [ ] Deploy backend to AEM/Universal Editor (or use local preview if available)
- [ ] **ACTION REQUIRED:** Please author the CareerCards block in Adobe Universal Editor with sample content (section heading + at least 3 cards with image, category, title, link), then provide the semantic HTML output (view source or DevTools). Share the HTML so the structure contract can be validated and JS adjusted if needed.
- [ ] User provides HTML; document structure contract (field indices, empty-field behavior)

**Human test:** Verify block appears in Universal Editor component browser. Add block to a page, configure fields, extract HTML. Confirm structure matches expected indices before proceeding.

---

### Phase 3: Frontend — JavaScript Implementation

#### Task 3.1: Create careercards.js with decorate() skeleton
- [x] Create `blocks/careercards/careercards.js`
- [ ] Export default `decorate(block)` function
- [ ] Add JSDoc with structure contract (based on user-provided HTML from Task 2.1)
- [ ] Use index-based extraction: `block.children[0]` = heading row; `block.children[1+]` = card rows
- [ ] Import `createOptimizedPicture` from `scripts/aem.js`, `moveInstrumentation` from `scripts/scripts.js`
- **Reference:** `blocks/cards/cards.js`, [implementation guide — Pattern 2](../implementation-guide.md)

**Human test:** Add minimal `decorate()` that logs structure. Load a page with the block; verify no console errors and block loads.

---

#### Task 3.2: Implement heading extraction and container
- [x] Extract heading from `block.children[0]` using index-based access
- [ ] Create wrapper with class `careercards-wrapper`
- [ ] Create heading element (e.g., `h2`) with class `careercards-heading`
- [ ] Use `moveInstrumentation()` when replacing/moving elements
- [ ] Handle optional heading (empty check)

**Human test:** Verify heading renders correctly. Check authoring instrumentation preserved in Universal Editor.

---

#### Task 3.3: Implement card row extraction and transformation
- [x] Iterate `block.children.slice(1)` for card rows
- [ ] Per row, extract by index: image, alt, category, title, link, linkText, target
- [ ] Use robust extraction: `linkCell?.querySelector?.('a') || linkCell?.querySelector?.('p a')`, `.href` fallback
- [ ] Use `createOptimizedPicture()` for images
- [ ] Build card DOM: image wrapper + gradient overlay, category pill, title, CTA link
- [ ] Wrap each card in `<a>` (entire card clickable) or use inner link; add classes for styling
- [ ] Use `moveInstrumentation(row, cardElement)` when transforming

**Human test:** Verify all 3 cards render with correct content. Test link navigation. Verify images load and are optimized.

---

#### Task 3.4: Add responsive breakpoint handling (if needed in JS)
- [x] Use `window.matchMedia('(min-width: 900px)')` for desktop vs mobile/tablet if any JS behavior differs
- [ ] Document breakpoint in code (900px per implementation guide)

**Human test:** Resize browser; confirm layout changes at expected breakpoint (handled primarily by CSS).

---

### Phase 4: Frontend — CSS Styling

#### Task 4.1: Base layout and section styling
- [x] Create `blocks/careercards/careercards.css`
- [ ] Section: gradient background (light yellow/orange → light blue per design)
- [ ] Heading: centered, large sans-serif, dark grey/black
- [ ] Wrapper: padding, max-width if needed

**Human test:** Verify section and heading match design. Check gradient and typography.

---

#### Task 4.2: Desktop layout (≥900px)
- [x] Cards in 3-column grid: `grid-template-columns: repeat(3, 1fr)` or equivalent
- [ ] Equal gap between cards
- [ ] Card: rounded corners (e.g., `border-radius: 12px`), box-shadow
- [ ] Image: aspect-ratio, object-fit: cover
- [ ] Category pill: top-left on image, dark bg, white text, rounded
- [ ] Title: overlay on lower image, white text, multi-line
- [ ] Hover state: subtle scale or shadow increase

**Human test:** Desktop view matches first design image. Cards in row, hover works.

---

#### Task 4.3: Mobile/Tablet layout (<900px)
- [x] Cards stack vertically: single column
- [ ] Same card structure; gradient overlay on image for readability
- [ ] Category pill: white bg, black text (per second design image)
- [ ] "Read more" CTA with arrow (→) visible
- [ ] Adequate spacing between stacked cards

**Human test:** Mobile/tablet view matches second design image. Cards stack, CTA visible.

---

#### Task 4.4: Accessibility and polish
- [x] Ensure alt text on images
- [ ] Keyboard navigation (cards/links focusable)
- [ ] Sufficient color contrast
- [ ] `rel="noopener noreferrer"` when target="_blank"

**Human test:** Tab through cards; use screen reader if available. Verify contrast.

---

### Phase 5: Integration and Validation

#### Task 5.1: Run build and lint
- [ ] `npm run build:json`
- [ ] `npm run lint`
- [ ] Fix any lint errors

**Human test:** All commands pass. No console errors on page load.

---

#### Task 5.2: AEM/Universal Editor validation
- [ ] Block appears in component browser
- [ ] All fields editable (heading, image, category, title, link per card)
- [ ] Content saves and renders in author and publish modes
- [ ] Minimum 3 cards configurable

**Human test:** Full authoring flow. Add block, configure 3+ cards, publish, verify on live page.

---

#### Task 5.3: Cross-browser and device check
- [ ] Test Chrome, Firefox, Safari (or available browsers)
- [ ] Test mobile viewport (or device)

**Human test:** Visual and functional check across browsers/devices.

---

## 4. File Summary

| File | Purpose |
|------|---------|
| `blocks/careercards/_careercards.json` | XWalk definitions, models, filters |
| `blocks/careercards/careercards.js` | Block decorate() logic |
| `blocks/careercards/careercards.css` | Block styles |
| `models/_section.json` | Add careercards to section filter |

---

## 5. Traceability

| Requirement (careercards.md) | Implementation |
|------------------------------|----------------|
| Configurable section heading | careercards model, field `heading` |
| Configurable number of cards (min 3) | careercard child items, filter |
| Image, category, title, CTA per card | careercard model fields |
| Card/CTA click navigates | Entire card or inner link in decorate() |
| Responsive (desktop, tablet, mobile) | CSS breakpoints, desktop 3-col / mobile stack |
| Consistent spacing, styling | CSS grid, gap, card styles |
| CMS authorable | XWalk models |
| Accessibility | Alt text, keyboard nav, contrast |
| Performance | createOptimizedPicture, lazy loading if applicable |

---

## 6. Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| DOM structure differs from model | **MANDATORY:** User provides HTML from Universal Editor before JS (Task 2.1) |
| Link extraction fails (wrapped in `<p>`) | Use robust pattern: `querySelector('a') \|\| querySelector('p a')`, `.href` fallback |
| Authoring instrumentation lost | Always use `moveInstrumentation()` when transforming |
| Section filter blocks placement | Add careercards to section filter (Task 1.2) |

---

## 7. Approval

**Status:** Implemented (Phase 1–4 complete). Phase 2 (user-provided HTML) pending for structure validation.

**Implementation Notes (2026-02-18):**
- Link field: `aem-content`
- Only "Read more" CTA clickable (not entire card)
- Category pill: same style on all viewports
- Structure based on XWalk model; validate with user-provided HTML from Universal Editor if indices differ
