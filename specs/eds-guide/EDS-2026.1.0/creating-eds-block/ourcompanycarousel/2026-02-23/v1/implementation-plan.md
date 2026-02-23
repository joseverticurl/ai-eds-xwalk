# Implementation Plan: Our Company Carousel Block

**Functionality:** Our Company Carousel (Leadership / People Carousel)  
**Guide:** [implementation-guide.md](../../../implementation-guide.md)  
**User Story:** [ourcompanycarouselstory.md](../../../ourcompanycarouselstory.md)  
**Date:** 2026-02-23  
**Version:** v1

---

## Summary

Create a new EDS block `ourcompanycarousel` that displays leadership/profile cards in an interactive carousel:

- **Parent fields:** Section title, section-level CTA (link + text)
- **Child items:** Image, name, title, per-item profile link
- **Desktop:** Horizontal carousel with multiple cards visible; left/right arrow controls; mouse/trackpad drag; gradient background
- **Mobile:** One primary card with peek of next; swipe gestures; left/right arrow controls at bottom
- **Interactions:** No autoplay; loop enabled; keyboard accessible
- **Accessibility:** Tab-focusable controls, aria-labels, focus states, swipe does not block vertical scroll

---

## Design References

| Viewport | Figma URL | Node ID |
|----------|-----------|---------|
| Desktop | [Components - TCCC](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=149-1072) | 149-1072 |
| Mobile | [Components - TCCC](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=149-1996) | 149-1996 |

**Design Notes:**
- Section title: "Meet the people leading the way" (large, bold; centered desktop, left-aligned mobile)
- Cards: Rounded corners, shadow; headshot image; name (bold) + title below; circular CTA button with arrow per card
- Desktop: Central "Drag" control with left/right arrows; multiple cards visible; gradient background (reddish-orange to grey)
- Mobile: Stacked card layout with one prominent; name/title overlayed on image (white text); pink circular arrow buttons at bottom
- Section CTA: "Meet all our leaders" (black button) below carousel

---

## Content Structure (XWalk Model)

### Parent Block: `ourcompanycarousel`
| Field | Component | Label | Notes |
|-------|-----------|-------|-------|
| sectionTitle | text | Section Title | Default: "Meet the people leading the way" |
| ctaLink | aem-content | CTA Link | URL for "Meet all our leaders" button |
| ctaText | text | CTA Text | Button label, default: "Meet all our leaders" |

### Child Block: `ourcompanycarouselitem`
| Field | Component | Label | Notes |
|-------|-----------|-------|-------|
| image | reference | Image | Leader headshot |
| imageAlt | text | Alt | Alt text for image |
| name | text | Name | Leader name |
| title | text | Title | Role/title (e.g., "Chairman and CEO") |
| link | aem-content | Link | Profile page URL (per-card CTA) |

---

## File Path Reference

- **Implementation guide:** `specs/eds-guide/EDS-2026.1.0/creating-eds-block/implementation-guide.md`
- **Block config (project uses block-level JSON):** `blocks/ourcompanycarousel/_ourcompanycarousel.json`
- **Block JS:** `blocks/ourcompanycarousel/ourcompanycarousel.js`
- **Block CSS:** `blocks/ourcompanycarousel/ourcompanycarousel.css`
- **Section filter:** `models/_section.json` (add `ourcompanycarousel`)

---

## Implementation Tasks

### Phase 0: Pre-Implementation ✓ (Complete)

Requirements gathered:
- [x] Figma design URLs (desktop, mobile)
- [x] User story and acceptance criteria ([ourcompanycarouselstory.md](../../../ourcompanycarouselstory.md))
- [x] Content structure mapped (parent: section title, CTA link, CTA text; child: image, alt, name, title, link)
- [x] Carousel behavior: No autoplay; loop; drag + arrows (desktop); swipe + arrows (mobile)
- [x] Similar block references: `quotescard` (parent-child + CTA), `relatedarticles` (parent-child + cards), `cards` (parent-child items)

---

### Phase 1: Backend – XWalk Configuration

#### Task 1.1: Create block-level XWalk configuration ✓

**File:** `blocks/ourcompanycarousel/_ourcompanycarousel.json`

Create the file with definitions, models, and filters. Project uses merge-json-cli; block-level `_*.json` is merged from `blocks/*/_*.json`.

**Definitions:**
```json
{
  "definitions": [
    {
      "title": "Our Company Carousel",
      "id": "ourcompanycarousel",
      "plugins": {
        "xwalk": {
          "page": {
            "resourceType": "core/franklin/components/block/v1/block",
            "template": {
              "name": "OurCompanyCarousel",
              "model": "ourcompanycarousel",
              "filter": "ourcompanycarousel"
            }
          }
        }
      }
    },
    {
      "title": "Our Company Carousel Item",
      "id": "ourcompanycarouselitem",
      "plugins": {
        "xwalk": {
          "page": {
            "resourceType": "core/franklin/components/block/v1/block/item",
            "template": {
              "name": "OurCompanyCarouselItem",
              "model": "ourcompanycarouselitem"
            }
          }
        }
      }
    }
  ]
}
```

**Models:**
```json
{
  "models": [
    {
      "id": "ourcompanycarousel",
      "fields": [
        { "component": "text", "valueType": "string", "name": "sectionTitle", "label": "Section Title", "value": "Meet the people leading the way" },
        { "component": "aem-content", "name": "ctaLink", "label": "CTA Link" },
        { "component": "text", "valueType": "string", "name": "ctaText", "label": "CTA Text", "value": "Meet all our leaders" }
      ]
    },
    {
      "id": "ourcompanycarouselitem",
      "fields": [
        { "component": "reference", "valueType": "string", "name": "image", "label": "Image", "multi": false },
        { "component": "text", "valueType": "string", "name": "imageAlt", "label": "Alt", "value": "" },
        { "component": "text", "valueType": "string", "name": "name", "label": "Name", "value": "" },
        { "component": "text", "valueType": "string", "name": "title", "label": "Title", "value": "" },
        { "component": "aem-content", "name": "link", "label": "Link" }
      ]
    }
  ]
}
```

**Filters:**
```json
{
  "filters": [
    { "id": "ourcompanycarousel", "components": ["ourcompanycarouselitem"] }
  ]
}
```

**Field order (structure contract for JS):**
- Parent rows: `block.children[0]` = sectionTitle, `[1]` = ctaLink, `[2]` = ctaText
- Child rows: `block.children[3]`, `block.children[4]`, ... = carousel item cards
- Per child row: `row.children[0]` = image, `[1]` = imageAlt, `[2]` = name, `[3]` = title, `[4]` = link

---

#### Task 1.2: Register block in section filter ✓

**File:** `models/_section.json`

Add `"ourcompanycarousel"` to the section's `components` array in the `filters` section:
```json
"filters":[{"id":"section","components":["text","image","button","title","hero","cards","columns","fragment","quotescard","relatedarticles","ourcompanycarousel"]}]
```

---

#### Task 1.3: Run build and validate JSON ✓

**Command:** `npm run build:json`

- [x] Verify `component-definition.json` includes Our Company Carousel and Our Company Carousel Item definitions
- [x] Verify `component-models.json` includes `ourcompanycarousel` and `ourcompanycarouselitem` models
- [x] Verify `component-filters.json` includes `ourcompanycarousel` filter and section filter has `ourcompanycarousel`
- [x] Run `npm run lint` to validate JSON syntax (pre-existing xwalk rule warnings in component-models.json; our block config is valid)

---

#### Task 1.4: **[HUMAN TEST]** Deploy and verify authoring

- [ ] Deploy XWalk configuration to AEM/Universal Editor (or use local preview)
- [ ] Confirm block "Our Company Carousel" appears in component browser
- [ ] Add Our Company Carousel block to a page
- [ ] Confirm section title, CTA link, CTA text fields and ability to add multiple carousel items
- [ ] Add sample content: section title, CTA, 4+ items with image, name, title, link
- [ ] Save and confirm page renders (raw AEM HTML structure expected at this stage)

---

### Phase 0.5: Request User-Provided Semantic HTML

#### Task 0.5.1: Obtain semantic HTML from Universal Editor

**Prerequisite:** Phase 1 complete and deployed.

**Prompt to user:**
> Please author the Our Company Carousel block in Adobe Universal Editor with sample content, then provide the semantic HTML output:
> 1. Add the block to a page
> 2. Set section title (e.g., "Meet the people leading the way")
> 3. Set CTA link and CTA text (e.g., "Meet all our leaders")
> 4. Add at least 4 carousel items with image, name, title, and link
> 5. Copy the generated HTML (view page source or DevTools)
> 6. Paste the HTML here (include the block root element, e.g. `<div class="ourcompanycarousel">...</div>`)

**Deliverable:** User provides HTML. Document:
- Which indices map to which fields (parent: 0=sectionTitle, 1=ctaLink, 2=ctaText; child rows 3+)
- Per-child row cell order (image, imageAlt, name, title, link)
- Empty field behavior (missing cells vs empty cells)

**Important:** Do NOT proceed with frontend (JS/CSS) until user-provided HTML is received. The HTML is the source of truth for DOM structure.

---

### Phase 2: Frontend – JavaScript Implementation

**Prerequisite:** User-provided HTML received (Phase 0.5).

#### Task 2.1: Create block folder and placeholder files ✓

- [x] Create `blocks/ourcompanycarousel/` directory
- [x] Create `blocks/ourcompanycarousel/ourcompanycarousel.js` with placeholder `decorate(block)` export
- [x] Create `blocks/ourcompanycarousel/ourcompanycarousel.css` with placeholder `.ourcompanycarousel {}`

---

#### Task 2.2: Implement decorate() – structure contract

**File:** `blocks/ourcompanycarousel/ourcompanycarousel.js`

Document the structure contract in JSDoc based on **user-provided HTML**:

```javascript
/**
 * Our Company Carousel Block
 *
 * Structure contract (from user-provided HTML):
 * - block.children[0] = Section title row
 * - block.children[1] = CTA link row
 * - block.children[2] = CTA text row
 * - block.children[3+] = Carousel item rows
 *
 * Per item row: image, imageAlt, name, title, link
 */
```

Use index-based access only. No `data-*` attributes for structure.

---

#### Task 2.3: Implement decorate() – data extraction and DOM transform

- [ ] Extract section title, CTA link, CTA text from parent rows (0, 1, 2)
- [ ] Extract per item: image src, alt, name, title, link (with fallbacks for `wrapTextNodes` and `.href` per [implementation-guide.md](../../../implementation-guide.md))
- [ ] Build DOM structure:
  - Section heading (e.g., `<h2>`)
  - Carousel container with card elements (each card: image, name, title, circular CTA button; card links to profile via `link`)
  - Section CTA button ("Meet all our leaders") below carousel
- [ ] Use `createOptimizedPicture()` for images (reference `blocks/relatedarticles/relatedarticles.js`, `blocks/quotescard/quotescard.js`)
- [ ] Use `moveInstrumentation()` when replacing/moving elements

---

#### Task 2.4: Implement carousel interaction logic

- [ ] **Desktop:**
  - Horizontal scroll container (overflow-x: auto or scroll)
  - Left/right arrow buttons: scroll by one card width (or snap)
  - Optional: mouse/trackpad drag (pointer events)
- [ ] **Mobile:**
  - Single active card with partial peek of next
  - Swipe gestures (touchstart, touchmove, touchend) — left/right to change slide
  - Left/right arrow buttons at bottom (same behavior as desktop)
- [ ] **Loop:** After last item, next goes to first; before first, previous goes to last
- [ ] Use `window.matchMedia('(min-width: 900px)')` for desktop breakpoint (per implementation guide)
- [ ] No autoplay

---

#### Task 2.5: Add carousel accessibility

- [ ] Arrow buttons: `aria-label="Previous slide"` and `aria-label="Next slide"`
- [ ] Keyboard: Arrow buttons focusable (Tab); Enter/Space activate
- [ ] Optional: `role="region"` and `aria-label` on carousel container
- [ ] Ensure swipe does not block vertical scroll (use `touch-action: pan-y` or similar on carousel track)

---

#### Task 2.6: **[HUMAN TEST]** Verify JavaScript with user HTML

- [ ] Replace block content in test page with user-provided HTML (or use authored page)
- [ ] Run `npm run dev` or serve project
- [ ] Confirm block loads and transforms without console errors
- [ ] Confirm section title, cards, and section CTA render
- [ ] Confirm carousel navigation: arrows work (prev/next, loop)
- [ ] Desktop: multiple cards visible; arrows scroll
- [ ] Mobile: single card prominent; swipe and arrows change slide

---

### Phase 3: Frontend – CSS Styling

#### Task 3.1: Base and desktop styles

**File:** `blocks/ourcompanycarousel/ourcompanycarousel.css`

- [ ] Section title: large, bold; centered on desktop (match Figma node 149-1072)
- [ ] Gradient background (reddish-orange to grey) — use CSS gradient or design tokens
- [ ] Carousel track: horizontal flex/grid; `overflow-x: auto` with scroll-snap
- [ ] Cards: rounded corners, shadow; image (headshot) top; name + title below; circular CTA button (bottom-right)
- [ ] Section CTA button: black background, white text, rounded corners; centered below carousel
- [ ] Arrow controls: circular; centered over carousel (desktop) or below (mobile)
- [ ] Use `(width >= 900px)` for desktop breakpoint

---

#### Task 3.2: Mobile styles

- [ ] Section title: left-aligned, may wrap to two lines
- [ ] One primary card visible with peek of next (stacked effect per design)
- [ ] Name and title overlayed on image bottom-left (white text)
- [ ] Circular CTA button per card (bottom-right)
- [ ] Arrow buttons: pink circular; centered at bottom below active card
- [ ] Swipe-friendly: adequate touch target size; no horizontal page scroll interference

---

#### Task 3.3: Carousel layout specifics

- [ ] Desktop: `scroll-snap-type: x mandatory` on track; `scroll-snap-align: start` on cards
- [ ] Mobile: Same snap behavior; card width ~90% viewport or full width with peek
- [ ] Hide native scrollbar if design specifies (e.g., `scrollbar-width: none` + custom arrows)

---

#### Task 3.4: **[HUMAN TEST]** Visual and responsive verification

- [ ] Desktop: gradient, multiple cards, arrows, section CTA
- [ ] Mobile: stacked card, swipe, arrows at bottom
- [ ] Images (headshots) scale correctly; text readable
- [ ] Spacing and typography match design intent
- [ ] Focus states visible on interactive elements

---

### Phase 4: Accessibility & Polish

#### Task 4.1: Accessibility checklist

- [ ] Alt text for all images (from img or imageAlt field)
- [ ] Card links have descriptive `aria-label` (e.g., "View profile of [name]")
- [ ] Arrow controls keyboard accessible
- [ ] Focus visible on buttons and links
- [ ] Swipe does not block vertical scroll (per [ourcompanycarouselstory.md](../../../ourcompanycarouselstory.md))

---

#### Task 4.2: Final integration test

- [ ] Add block in Universal Editor, author content, save
- [ ] View in publish/preview mode
- [ ] Confirm layout, links, carousel navigation, and section CTA
- [ ] Test keyboard navigation and screen reader if applicable

---

## Structure Contract Summary (To Validate from User HTML)

| Index | Meaning |
|-------|---------|
| `block.children[0]` | Section title row |
| `block.children[1]` | CTA link row |
| `block.children[2]` | CTA text row |
| `block.children[3]` | First carousel item row |
| `block.children[4]` | Second carousel item row |
| ... | ... |
| `row.children[0]` | Image |
| `row.children[1]` | Image Alt |
| `row.children[2]` | Name |
| `row.children[3]` | Title |
| `row.children[4]` | Link |

**Note:** Actual indices must be validated from user-provided HTML. Empty fields may omit cells.

---

## Key References

- [Implementation Guide](../../../implementation-guide.md) – patterns, anti-patterns, index-based access
- [User Story](../../../ourcompanycarouselstory.md)
- [Related Articles Plan](../relatedarticles/2026-02-19/v1/implementation-plan.md) – parent-child + cards pattern
- `blocks/quotescard/quotescard.js` – parent-child, CTA, image extraction
- `blocks/relatedarticles/relatedarticles.js` – cards, link extraction
- `models/_section.json` – section filter

---

## Success Criteria

- [ ] Block appears in AEM authoring and can be configured
- [ ] Carousel displays leadership cards with image, name, title, per-card link
- [ ] Desktop: horizontal scroll, arrows, drag (optional), section CTA
- [ ] Mobile: swipe + arrows, stacked card layout, section CTA
- [ ] No autoplay; loop enabled
- [ ] Keyboard and screen reader accessible
- [ ] Responsive and matches design
