# Implementation Plan: Related Articles Block

**Functionality:** Related Articles ("You May Also Like")  
**Guide:** [implementation-guide.md](../../implementation-guide.md)  
**User Story:** [relatedarticlesstory.md](../../relatedarticlesstory.md)  
**Date:** 2026-02-19  
**Version:** v1

---

## Summary

Create a new EDS block `relatedarticles` that displays 3 related article cards with:
- Section title "You may also like" (parent field)
- Each card: featured image, category tag, article title, article link
- **Desktop:** 3-column horizontal layout, whole card clickable, no separate CTA button, hover feedback
- **Mobile:** Single-column stacked layout, "Read more" CTA button with arrow icon visible
- Parent-child pattern (parent block + relatedarticle child items)

---

## Design References

| Viewport | Figma URL | Node ID |
|----------|-----------|---------|
| Desktop | [Components - TCCC](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=1-1691) | 1-1691 |
| Mobile | [Components - TCCC](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=1-1703) | 1-1703 |

**Design Notes:**
- Section title: "You may also like" (large, bold, centered)
- Cards: Rounded corners, shadow, image overlay for text legibility
- Category tag: Pill-shaped, top-left of card (e.g., "Sustainability")
- Desktop: No CTA button; entire card links to article
- Mobile: "Read more" CTA with arrow icon at bottom of each card

---

## Content Structure (XWalk Model)

### Parent Block: `relatedarticles`
| Field | Component | Label | Notes |
|-------|-----------|-------|-------|
| sectionTitle | text | Section Title | Default: "You may also like" |

### Child Block: `relatedarticle`
| Field | Component | Label | Notes |
|-------|-----------|-------|-------|
| image | reference | Image | Featured image |
| imageAlt | text | Alt | Alt text for image |
| category | text | Category | Tag (e.g., "Sustainability") |
| title | text | Title | Article title |
| link | aem-content | Link | Article URL |

---

## File Path Reference

- **Implementation guide:** `specs/eds-guide/EDS-2026.1.0/creating-eds-block/implementation-guide.md`
- **Block config (project uses block-level JSON):** `blocks/relatedarticles/_relatedarticles.json`
- **Block JS:** `blocks/relatedarticles/relatedarticles.js`
- **Block CSS:** `blocks/relatedarticles/relatedarticles.css`
- **Section filter (add relatedarticles):** `models/_section.json`

---

## Implementation Tasks

### Phase 0: Pre-Implementation ✓ (Complete)

Requirements have been gathered:
- [x] Figma design URLs (desktop, mobile)
- [x] User story and acceptance criteria ([relatedarticlesstory.md](../../relatedarticlesstory.md))
- [x] Content structure mapped (parent: section title; child: image, alt, category, title, link)
- [x] CTA visibility rule: Mobile only
- [x] Similar block reference: `quotescard` (parent-child with items), `cards` (parent-child)

---

### Phase 1: Backend – XWalk Configuration

#### Task 1.1: Create block-level XWalk configuration ✓

**File:** `blocks/relatedarticles/_relatedarticles.json`

Create the file with:
- **Definitions:** Parent `relatedarticles` (with `model` and `filter`), child `relatedarticle` (with `model`)
- **Models:** `relatedarticles` (sectionTitle), `relatedarticle` (image, imageAlt, category, title, link)
- **Filters:** `relatedarticles` → `["relatedarticle"]`

**Parent definition template:**
```json
{
  "title": "Related Articles",
  "id": "relatedarticles",
  "plugins": {
    "xwalk": {
      "page": {
        "resourceType": "core/franklin/components/block/v1/block",
        "template": {
          "name": "RelatedArticles",
          "model": "relatedarticles",
          "filter": "relatedarticles"
        }
      }
    }
  }
}
```

**Child definition template:**
```json
{
  "title": "Related Article",
  "id": "relatedarticle",
  "plugins": {
    "xwalk": {
      "page": {
        "resourceType": "core/franklin/components/block/v1/block/item",
        "template": {
          "name": "RelatedArticle",
          "model": "relatedarticle"
        }
      }
    }
  }
}
```

**Field order (structure contract for JS):**
- Parent row: `block.children[0]` = section title
- Child rows: `block.children[1]`, `block.children[2]`, `block.children[3]` = article cards
- Per child row: `row.children[0]` = image, `[1]` = imageAlt, `[2]` = category, `[3]` = title, `[4]` = link

---

#### Task 1.2: Register block in section filter ✓

**File:** `models/_section.json`

Add `"relatedarticles"` to the section's `components` array in the `filters` section:
```json
"filters":[{"id":"section","components":["text","image","button","title","hero","cards","columns","fragment","quotescard","relatedarticles"]}]
```

---

#### Task 1.3: Run build and validate JSON ✓

**Command:** `npm run build:json`

- [x] Verify `component-definition.json` includes Related Articles and Related Article definitions
- [x] Verify `component-models.json` includes `relatedarticles` and `relatedarticle` models
- [x] Verify `component-filters.json` includes `relatedarticles` filter and section filter has `relatedarticles`
- [x] Run `npm run lint` to validate JSON syntax (relatedarticles.js passes; component-models.json has pre-existing xwalk rule warnings)

---

#### Task 1.4: **[HUMAN TEST]** Deploy and verify authoring

- [ ] Deploy XWalk configuration to AEM/Universal Editor environment (or use local preview if applicable)
- [ ] Confirm block "Related Articles" appears in component browser under Sections
- [ ] Add Related Articles block to a page
- [ ] Confirm section title field and ability to add 3 Related Article items
- [ ] Add sample content: section title, 3 articles with image, category, title, link
- [ ] Save and confirm page renders (raw AEM HTML structure expected at this stage)

---

### Phase 0.5: Request User-Provided Semantic HTML (MANDATORY)

#### Task 0.5.1: Obtain semantic HTML from Universal Editor

**Prerequisite:** Phase 1 complete and deployed.

**Prompt to user:**
> Please author the Related Articles block in Adobe Universal Editor with sample content, then provide the semantic HTML output:
> 1. Add the block to a page
> 2. Set section title (e.g., "You may also like")
> 3. Add exactly 3 Related Article items with image, category, title, and link
> 4. Copy the generated HTML (view page source or DevTools)
> 5. Paste the HTML here (include the block root element, e.g. `<div class="relatedarticles">...</div>`)

**Deliverable:** User provides HTML. Document in implementation:
- Which indices map to which fields
- Empty field behavior (missing cells vs empty cells)
- Actual row/cell structure

**Important:** Do NOT proceed with frontend (JS/CSS) until user-provided HTML is received. The HTML is the source of truth for DOM structure.

---

### Phase 2: Frontend – JavaScript Implementation

**Prerequisite:** User-provided HTML received (Phase 0.5).

#### Task 2.1: Create block folder and placeholder files ✓

- [x] Create `blocks/relatedarticles/` directory
- [x] Create `blocks/relatedarticles/relatedarticles.js` with placeholder `decorate(block)` export
- [x] Create `blocks/relatedarticles/relatedarticles.css` with placeholder `.relatedarticles {}`

---

#### Task 2.2: Implement decorate() – structure contract

**File:** `blocks/relatedarticles/relatedarticles.js`

Document the structure contract in JSDoc based on **user-provided HTML** (not assumed). Example pattern:

```javascript
/**
 * Related Articles Block
 *
 * Structure contract (from user-provided HTML):
 * - block.children[0] = Section title row
 * - block.children[1..3] = Article item rows
 *
 * Per article row:
 * - row.children[0] = Image cell
 * - row.children[1] = Alt cell
 * - row.children[2] = Category cell
 * - row.children[3] = Title cell
 * - row.children[4] = Link cell
 */
```

Use index-based access only. No `data-*` attributes for structure.

---

#### Task 2.3: Implement decorate() – data extraction

- [ ] Extract section title from first row
- [ ] Extract per article: image src, alt, category, title, link (with fallbacks for `wrapTextNodes` and `.href`)
- [ ] Use optional chaining and nullish coalescing
- [ ] Handle wrapped `<p>` tags and link extraction per [implementation-guide.md](../../implementation-guide.md) patterns

---

#### Task 2.4: Implement decorate() – DOM transform

- [ ] Build container with section heading (use semantic `<h2>`)
- [ ] Build card elements: each card is an `<a>` wrapping image, category tag, title
- [ ] On mobile: add "Read more" CTA with arrow icon inside each card (visible via CSS at mobile breakpoint)
- [ ] Use `createOptimizedPicture()` for images (reference `blocks/cards/cards.js`, `blocks/quotescard/quotescard.js`)
- [ ] Use `moveInstrumentation()` when replacing/moving elements
- [ ] Whole card is clickable (anchor wraps content)

---

#### Task 2.5: **[HUMAN TEST]** Verify JavaScript with user HTML

- [ ] Replace block content in test page with user-provided HTML (or use authored page)
- [ ] Run `npm run dev` or serve project
- [ ] Confirm block loads and transforms without console errors
- [ ] Confirm section title renders
- [ ] Confirm 3 cards render with image, category, title
- [ ] Confirm each card is a link to the correct URL

---

### Phase 3: Frontend – CSS Styling

#### Task 3.1: Base and desktop styles

**File:** `blocks/relatedarticles/relatedarticles.css`

- [ ] Section title: large, bold, centered (match Figma desktop)
- [ ] Cards container: 3-column grid on desktop (`display: grid`, `grid-template-columns: repeat(3, 1fr)`)
- [ ] Card: rounded corners, shadow, overflow hidden
- [ ] Image: aspect ratio, `object-fit: cover`, overlay for text readability
- [ ] Category tag: pill-shaped, top-left, white text on dark/solid background
- [ ] Title: white text over image overlay, bottom of card
- [ ] Hover: subtle elevation/shadow or image zoom per design
- [ ] Use `(width >= 900px)` for desktop breakpoint (per implementation guide)

---

#### Task 3.2: Mobile styles

- [ ] Single-column layout (stack cards vertically)
- [ ] Full-width cards with adequate spacing
- [ ] "Read more" CTA visible only on mobile (e.g. `display: none` on desktop, `display: flex` below breakpoint)
- [ ] CTA: "Read more" text + arrow icon (use existing icon/SVG if available, or inline SVG)
- [ ] Ensure touch target size for CTA

---

#### Task 3.3: Responsive breakpoints

- [ ] Mobile-first or desktop-first: align with project convention
- [ ] Breakpoint `900px` for desktop (consistent with implementation guide)
- [ ] Verify layout at 320px, 768px, 900px, 1200px

---

#### Task 3.4: **[HUMAN TEST]** Visual and responsive verification

- [ ] Desktop: 3-column layout, no CTA button, hover feedback
- [ ] Mobile: single column, "Read more" CTA visible
- [ ] Images scale and overlay renders correctly
- [ ] Text readable over images
- [ ] Spacing matches design intent

---

### Phase 4: Accessibility & Polish

#### Task 4.1: Accessibility

- [ ] Alt text for all images
- [ ] Card links have descriptive `aria-label` or visible text (title)
- [ ] Keyboard navigation works (card and CTA focusable)
- [ ] Color contrast meets WCAG

---

#### Task 4.2: Final integration test

- [ ] Add block in Universal Editor, author content, save
- [ ] View in publish/preview mode
- [ ] Confirm layout, links, and CTA behavior
- [ ] Confirm exactly 3 cards (authoring enforces this; document if different)

---

## Structure Contract Summary (To Be Validated by User HTML)

| Index | Meaning |
|-------|---------|
| `block.children[0]` | Section title row |
| `block.children[1]` | First article row |
| `block.children[2]` | Second article row |
| `block.children[3]` | Third article row |
| `row.children[0]` | Image |
| `row.children[1]` | Alt |
| `row.children[2]` | Category |
| `row.children[3]` | Title |
| `row.children[4]` | Link |

**Note:** Update this table after analyzing user-provided HTML if structure differs.

---

## Key References

- [Implementation Guide](../../implementation-guide.md) – patterns, anti-patterns, index-based access
- [User Story](../../relatedarticlesstory.md)
- `blocks/quotescard/quotescard.js` – parent-child, CTA, image optimization
- `blocks/cards/cards.js` – parent-child, image handling
- `models/_section.json` – section filter

---

## Success Criteria

- [ ] Block appears in AEM authoring and can be configured
- [ ] 3 related article cards render with image, category, title
- [ ] Desktop: 3-column, no CTA, whole card clickable, hover feedback
- [ ] Mobile: single column, "Read more" CTA visible
- [ ] Accessibility and responsiveness meet requirements
