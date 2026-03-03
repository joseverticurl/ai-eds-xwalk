# Implementation Plan: Related Cards Block

**Functionality:** Related Cards ("You May Also Like") — `relatedcards`  
**Guide:** [implementation-guide.md](../../../implementation-guide.md)  
**User Story:** [user-story-relatedcards.md](../../../user-story-relatedcards.md)  
**Date:** 2026-03-03  
**Version:** v1

---

## Clarifications & Assumptions

| Item | Status | Notes |
|------|--------|-------|
| **User story** | [user-story-relatedcards.md](../../../user-story-relatedcards.md) | Primary source for acceptance criteria and authoring. |
| **Design overlap** | Same Figma nodes as `relatedarticles` | Desktop (1-1691), Mobile (1-1703) — identical "You may also like" design. |
| **Card count** | Minimum 1, variable | Per [user-story-relatedcards.md](../../../user-story-relatedcards.md) — "minimum 1" recommendation card; not fixed at 3. |
| **Desktop scroll** | Next/Scroll control when >3 cards | Per user story: if more cards than visible, provide Next/Scroll control (circular arrow button). |
| **Image failure** | Placeholder required | Per user story: default placeholder image when card image fails to load. |
| **Background styling** | Per Figma mobile | Mobile: gradient ellipses + noise texture; desktop: subtle gradient. |

---

## Summary

Create a new EDS block `relatedcards` that displays recommendation cards per [user-story-relatedcards.md](../../../user-story-relatedcards.md):

- **Section title:** "You may also like" (parent field)
- **Each card:** category tag, card image, card title, link; CTA text (default "Read more") for mobile
- **Desktop:** Horizontal row (e.g. 3 visible); whole card clickable; **Next/Scroll control** when more cards exist; subtle gradient background
- **Mobile:** Vertical stacked layout; "Read more" CTA (text + icon) per card; gradient ellipses + noise texture
- **Image failure:** Default placeholder when image fails to load
- **Parent-child pattern:** Parent `relatedcards` + child `relatedcard` items (variable count, minimum 1)

---

## Design References

| Viewport | Figma URL | Node ID |
|----------|-----------|---------|
| Desktop | [Components - TCCC](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=1-1691&m=dev) | 1-1691 |
| Mobile | [Components - TCCC](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=1-1703&m=dev) | 1-1703 |

**Design Notes:**

- **Section title:** "You may also like" — large, bold, centered (desktop 64px; mobile 34px)
- **Cards:** Rounded corners (desktop 24px, mobile 16px); image + gradient overlay; category pill top-left; title over image
- **Desktop:** 3 cards visible in row; entire card links; hand cursor on hover; **circular arrow button** (Next/Scroll) when more cards exist
- **Mobile:** Cards stacked; "Read more" CTA (text + icon) at bottom of each card; gradient ellipses + noise texture
- **Typography:** Desktop/Label XS 12px; Desktop/Headline 5 26px; Mobile/Headline 5 22px; Mobile/Label L 16px

---

## Content Structure (XWalk Model)

Per [user-story-relatedcards.md](../../../user-story-relatedcards.md) Authoring section:

### Parent Block: `relatedcards`

| Field | Component | Label | Notes |
|-------|-----------|-------|-------|
| sectionTitle | text | Section Title | Max 42 chars (info note) |
| maxItems | number | Max items to display | Optional |
| recommendationsSource | text | Recommendations Source | Optional: Manual / Automatic (By tag) |

### Child Block: `relatedcard` (4 cells, per xwalk max-cells rule)

| Field | Component | Label | Notes |
|-------|-----------|-------|-------|
| image | reference | Card Image | From DAM; alt from img element |
| category | text | Category Tag/Label | Max 20 chars (info note) |
| title | text | Card Title | Max 80 chars (info note) |
| link | aem-content | Link | AEM Page or external URL |

---

## File Path Reference

- **Implementation guide:** `specs/eds-guide/EDS-2026.1.0/creating-eds-block/implementation-guide.md`
- **Block config:** `blocks/relatedcards/_relatedcards.json`
- **Block JS:** `blocks/relatedcards/relatedcards.js`
- **Block CSS:** `blocks/relatedcards/relatedcards.css`
- **Section filter:** `models/_section.json` (add `relatedcards`)

---

## Implementation Tasks

### Phase 0: Pre-Implementation ✓

Requirements gathered:

- [x] Figma design URLs (desktop, mobile) — node-id 1-1691, 1-1703
- [x] User story and acceptance criteria ([user-story-relatedcards.md](../../../user-story-relatedcards.md))
- [x] Content structure mapped (parent: section title; child: image, category, title, link; 4 cells per xwalk rule)
- [x] CTA visibility rule: Mobile only; Desktop: Next/Scroll control when >3 cards
- [x] Reference blocks: `blocks/ourcompanycarousel`, `blocks/testimonialcards`

---

### Phase 1: Backend – XWalk Configuration

#### Task 1.1: Create block-level XWalk configuration ✓

**File:** `blocks/relatedcards/_relatedcards.json`

Created with:

- **Definitions:** Parent `relatedcards` (with `model` and `filter`), child `relatedcard` (with `model`)
- **Models:** `relatedcards` (sectionTitle, maxItems?, recommendationsSource?); `relatedcard` (link, title, category, image, imageAlt, ctaText)
- **Filters:** `relatedcards` → `["relatedcard"]`

**Parent definition template:**

```json
{
  "title": "Related Cards",
  "id": "relatedcards",
  "plugins": {
    "xwalk": {
      "page": {
        "resourceType": "core/franklin/components/block/v1/block",
        "template": {
          "name": "RelatedCards",
          "model": "relatedcards",
          "filter": "relatedcards"
        }
      }
    }
  }
}
```

**Child definition template:**

```json
{
  "title": "Related Card",
  "id": "relatedcard",
  "plugins": {
    "xwalk": {
      "page": {
        "resourceType": "core/franklin/components/block/v1/block/item",
        "template": {
          "name": "RelatedCard",
          "model": "relatedcard"
        }
      }
    }
  }
}
```

**Field order (structure contract for JS):**

- Parent row: `block.children[0]` = section title
- Child rows: `block.children[1..N]` = card rows (variable, minimum 1)
- Per child row: indices TBD from user-provided HTML (fields per user story: link, title, category, image, imageAlt, ctaText)

---

#### Task 1.2: Register block in section filter ✓

**File:** `models/_section.json`

Added `"relatedcards"` to the section's `components` array.

---

#### Task 1.3: Run build and validate JSON ✓

**Command:** `npm run build:json`

- [x] Verify `component-definition.json` includes Related Cards and Related Card definitions
- [x] Verify `component-models.json` includes `relatedcards` and `relatedcard` models
- [x] Verify `component-filters.json` includes `relatedcards` filter and section filter has `relatedcards`
- [x] Run `npm run lint:fix` (relatedcards.js passes; component-models.json has pre-existing xwalk rule warnings)

---

#### Task 1.4: **[HUMAN TEST]** Deploy and verify authoring

- [ ] Deploy XWalk configuration to AEM/Universal Editor (or use local preview)
- [ ] Confirm block "Related Cards" appears in component browser under Sections
- [ ] Add Related Cards block to a page
- [ ] Confirm section title field and ability to add Related Card items (minimum 1, variable count)
- [ ] Add sample content: section title, cards with image, category, title, link
- [ ] Save and confirm page renders (raw AEM HTML structure expected at this stage)

---

### Phase 0.5: Request User-Provided Semantic HTML

#### Task 0.5.1: Obtain semantic HTML from Universal Editor ✓ (sample provided)

**Prerequisite:** Phase 1 complete and deployed.

**Deliverable:** Sample HTML in [relatedcards.html](../../../relatedcards.html) — row structure: [0]=image, [1]=category, [2]=title, [3]=link

**Prompt to user:**

> Please author the Related Cards block in Adobe Universal Editor with sample content, then provide the semantic HTML output:
> 1. Add the block to a page
> 2. Set section title (e.g., "You may also like")
> 3. Add Related Card items (at least 1; suggest 4+ to test Next/Scroll control on desktop)
> 4. Populate link, title, category, image, alt, CTA text per card
> 5. Copy the generated HTML (view page source or DevTools)
> 6. Paste the HTML here (include the block root, e.g. `<div class="relatedcards">...</div>`)

**Deliverable:** User provides HTML. Document in implementation:

- Which indices map to which fields
- Empty field behavior
- Actual row/cell structure

**Important:** Do NOT proceed with frontend (JS/CSS) until user-provided HTML is received.

---

### Phase 2: Frontend – JavaScript Implementation

**Prerequisite:** User-provided HTML received (Phase 0.5).

#### Task 2.1: Create block folder and placeholder files ✓

- [x] Create `blocks/relatedcards/` directory
- [x] Create `blocks/relatedcards/relatedcards.js` with full `decorate(block)` implementation
- [x] Create `blocks/relatedcards/relatedcards.css` with full styling

---

#### Task 2.2: Implement decorate() – structure contract ✓

**File:** `blocks/relatedcards/relatedcards.js`

Structure contract documented in JSDoc (relatedcards.html):

```javascript
/**
 * Structure contract (from user-provided HTML):
 * - block.children[0] = Section title row
 * - block.children[1..N] = Card rows (variable, minimum 1)
 * Per card row: indices TBD from user-provided HTML (link, title, category, image, imageAlt, ctaText)
 */
```

Use index-based access only. No `data-*` attributes for structure.

---

#### Task 2.3: Implement decorate() – data extraction ✓

- [x] Extract section title from first row
- [x] Extract per card: image src, alt (from img), category, title, link (with fallbacks)
- [x] Use optional chaining and nullish coalescing
- [x] findLinkInRow() for robust link extraction

---

#### Task 2.4: Implement decorate() – DOM transform ✓

- [x] Build container with section heading (semantic `<h2>`)
- [x] Build card elements: each card is an `<a>` wrapping image, category tag, title
- [x] On mobile: "Read more" CTA with arrow icon (visible via CSS; hidden on desktop)
- [x] `createOptimizedPicture()` + `onerror` handler for image placeholder (Scenario 5)
- [x] Desktop: when card count > 3, initScrollControl() adds circular arrow button
- [x] moveInstrumentation() for link and title row
- [x] Whole card is clickable (anchor wraps content)

---

#### Task 2.5: **[HUMAN TEST]** Verify JavaScript with user HTML

- [ ] Replace block content in test page with user-provided HTML (or use authored page)
- [ ] Run `npm run dev` or serve project
- [ ] Confirm block loads and transforms without console errors
- [ ] Confirm section title renders
- [ ] Confirm cards render with image, category, title (variable count)
- [ ] Confirm each card is a link to the correct URL
- [ ] If >3 cards: confirm Next/Scroll control appears on desktop

---

### Phase 3: Frontend – CSS Styling

#### Task 3.1: Base and desktop styles ✓

**File:** `blocks/relatedcards/relatedcards.css`

- [x] Section title: large, bold, centered (64px desktop, 34px mobile)
- [x] Cards container: horizontal row on desktop; scrollable when >3
- [x] Next/Scroll control: circular arrow button; visible only when >3 cards on desktop
- [x] Card: rounded corners (24px desktop, 16px mobile), shadow, overflow hidden
- [x] Image: aspect ratio, object-fit cover, gradient overlay; placeholder on error
- [x] Category tag: pill-shaped, white bg, black text (per Figma Badge)
- [x] Title: white text over overlay (26px desktop, 22px mobile)
- [x] Hover: elevation/shadow, image scale
- [x] Breakpoint `900px` for desktop

---

#### Task 3.2: Mobile styles

- [ ] Single-column layout (stack cards vertically)
- [ ] Full-width cards with adequate spacing (gap 20px per Figma)
- [ ] Card border-radius 16px on mobile
- [ ] "Read more" CTA visible only on mobile (display: none on desktop)
- [ ] CTA: "Read more" text + arrow icon (inline SVG), 16px label
- [ ] Ensure touch target size (min-height: 44px)
- [ ] Title 22px on mobile
- [ ] Optional: gradient ellipses + noise texture background (per Figma mobile; see testimonialcards for pattern)

---

#### Task 3.3: Responsive breakpoints ✓

- [x] Mobile-first base, desktop at 900px
- [x] Breakpoint `900px` for desktop

---

#### Task 3.4: **[HUMAN TEST]** Visual and responsive verification

- [ ] Desktop: horizontal row (3 visible), Next/Scroll control when >3 cards, hover feedback
- [ ] Mobile: single column, "Read more" CTA visible
- [ ] Images scale and overlay renders correctly; placeholder shows on image load failure
- [ ] Text readable over images
- [ ] Spacing matches design intent

---

### Phase 4: Accessibility & Polish

#### Task 4.1: Accessibility ✓

- [x] Section title: semantic `<h2>`
- [x] Card `aria-label`: Title and Category (from [cardTitle, category].join)
- [x] Card link and Next button: keyboard operable, visible focus state
- [x] Images: alt from img element; placeholder retains alt

---

#### Task 4.2: **[HUMAN TEST]** Final integration test

- [ ] Add block in Universal Editor, author content, save
- [ ] View in publish/preview mode
- [ ] Confirm layout, links, and CTA behavior
- [ ] Confirm variable card count (minimum 1)
- [ ] Confirm accessibility (keyboard nav, screen reader)

---

## Structure Contract Summary (Expected from Universal Editor HTML)

| Index | Meaning |
|-------|---------|
| `block.children[0]` | Section title row |
| `block.children[1..N]` | Card rows (variable, minimum 1) |
| `row.children[?]` | Per [user-story-relatedcards.md](../../../user-story-relatedcards.md): link, title, category, image, imageAlt, ctaText |

**Note:** Actual indices will be validated against user-provided HTML in Phase 0.5.

---

## Key References

- [Implementation Guide](../../../implementation-guide.md) – patterns, anti-patterns, index-based access
- [user-story-relatedcards.md](../../../user-story-relatedcards.md) – primary user story and acceptance criteria
- [relatedarticles Implementation Plan](../../../relatedarticles/2026-02-19/v1/implementation-plan.md) – same design, full reference
- `blocks/testimonialcards/testimonialcards.js`, `blocks/ourcompanycarousel/ourcompanycarousel.js` – carousel/scroll controls
- `blocks/relatedarticles/relatedarticles.js` – decorate, createOptimizedPicture, moveInstrumentation
- `models/_section.json` – section filter

---

## Success Criteria

- [ ] Block appears in AEM authoring and can be configured
- [ ] Recommendation cards render with image, category, title (variable count, minimum 1)
- [ ] Desktop: horizontal row (3 visible); Next/Scroll control when >3; whole card clickable, hover feedback
- [ ] Mobile: single column, "Read more" CTA visible
- [ ] Image placeholder on load failure
- [ ] Accessibility and responsiveness meet [user-story-relatedcards.md](../../../user-story-relatedcards.md)
