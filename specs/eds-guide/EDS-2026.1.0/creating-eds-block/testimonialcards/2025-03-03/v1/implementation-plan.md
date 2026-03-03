# Implementation Plan: Testimonial Cards Block

**Functionality:** Talent/Testimonial Media Cards (testimonialcards)  
**Guide:** [implementation-guide.md](../../../implementation-guide.md)  
**User Story:** [testimonialcards.md](../../../testimonialcards.md)  
**Date:** 2025-03-03  
**Version:** v1

---

## Summary

Create a new EDS block `testimonialcards` that displays talent/testimonial media cards in an interactive carousel:

- **Parent fields:** Section title (2 lines), description, CTA (label + link), background styling option
- **Child items:** Image, name, role, quote text (optional; for Quote-type cards), media type (None/Video/Audio), media source, media thumbnail, optional error message override
- **Desktop:** Multi-card layout (up to 3 visible); drag interaction; gradient ellipses + noise texture background; central "Drag" control
- **Mobile:** Single prominent card; swipe/scroll; left/right arrow nav below cards; **same background** as desktop
- **Card variants:** Quote-type (quote text + profile) when media=None and quote present; Video-type (image + play + profile bar) when media=Video/Audio
- **Media:** Play control only; "Media unavailable" on load failure; image fallback placeholder on image failure
- **Accessibility:** Keyboard-focusable CTA and media controls; aria-labels; screen-reader support

---

## Design References

| Viewport | Figma URL | Node ID |
|----------|-----------|---------|
| Desktop | [Components - TCCC](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=1-1605&m=dev) | 1-1605 |
| Mobile | [Components - TCCC](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=1-1635&m=dev) | 1-1635 |

**Design Notes:**
- **Section title:** 2 lines; large, bold; desktop: centered; mobile: left-aligned, smaller
- **Cards:** Two variants — (1) Quote: colored box with quote + white pill (profile image, name, role); (2) Video: full image, overlay gradient, bottom bar with name/role + circular play button
- **Desktop:** Up to 3 cards visible; central black "Drag" control with arrows; gradient ellipses + noise texture background
- **Mobile:** Single prominent card; swipe; arrow buttons below; **same background** as desktop (gradient ellipses + noise texture)
- **CTA:** Black button, white text, rounded corners
- **Card accent colors:** aqua (#6cc9d0), yellow (#d5b85c), orange (#ff570f), green (#6acf7f) — rotate by card index or make authorable

---

## Content Structure (XWalk Model)

### Parent Block: `testimonialcards`

| Field | Component | Label | Notes |
|-------|-----------|-------|-------|
| sectionTitleLine1 | text | Section Title (Line 1) | Max 42 chars (info note) |
| sectionTitleLine2 | text | Section Title (Line 2) | Max 42 chars (info note) |
| description | text | Description/Body copy | Max 150 chars (info note) |
| ctaLabel | text | CTA Label | Max 25 chars (info note) |
| ctaLink | aem-content | CTA Link | URL |
| backgroundOption | text | Background styling option | Optional: default/none |

### Child Block: `testimonialcardsitem`

| Field | Component | Label | Notes |
|-------|-----------|-------|-------|
| image | reference | Image | Required; placeholder at runtime if missing |
| imageAlt | text | Alt | Alt text |
| name | text | Name/Title | Max 40 chars (info note) |
| role | text | Role/Label | Max 40 chars (info note) |
| quote | text | Quote text | Optional; for Quote-type cards (per [story](../../../testimonialcards.md); max 200 chars info note) |
| mediaType | text | Media type | None / Video / Audio |
| mediaSource | aem-content | Media source | If Video/Audio |
| mediaThumbnail | reference | Media thumbnail | Optional |
| errorMessageOverride | text | Error message override | Optional; default "Media unavailable" |

**Note:** Optional `quote` field supports Quote-type cards per [testimonialcards.md](../../../testimonialcards.md). When media=None and quote is present, render Quote variant; when media=Video/Audio, render Video variant.

---

## File Path Reference

- **Implementation guide:** `specs/eds-guide/EDS-2026.1.0/creating-eds-block/implementation-guide.md`
- **Block config:** `blocks/testimonialcards/_testimonialcards.json`
- **Block JS:** `blocks/testimonialcards/testimonialcards.js`
- **Block CSS:** `blocks/testimonialcards/testimonialcards.css`
- **Section filter:** `models/_section.json` (add `testimonialcards`)

---

## Implementation Tasks

### Phase 0: Pre-Implementation ✓ (Complete)

Requirements gathered:
- [x] Figma design URLs (desktop, mobile) — node-id 1-1605, 1-1635
- [x] User story and acceptance criteria ([testimonialcards.md](../../../testimonialcards.md))
- [x] Content structure mapped (parent: 2-line title, description, CTA, background; child: image, name, role, quote, media type/source/thumbnail, error override)
- [x] Carousel behavior: Desktop — drag + multi-card; Mobile — swipe + arrows, single card
- [x] Similar block references: `ourcompanycarousel` (carousel + cards), `quotescard` (parent-child + CTA), `relatedarticles` (cards)

---

### Phase 1: Backend – XWalk Configuration

#### Task 1.1: Create block-level XWalk configuration ✓

**File:** `blocks/testimonialcards/_testimonialcards.json`

Create the file with definitions, models, and filters.

**Definitions:**
```json
{
  "definitions": [
    {
      "title": "Testimonial Cards",
      "id": "testimonialcards",
      "plugins": {
        "xwalk": {
          "page": {
            "resourceType": "core/franklin/components/block/v1/block",
            "template": {
              "name": "TestimonialCards",
              "model": "testimonialcards",
              "filter": "testimonialcards"
            }
          }
        }
      }
    },
    {
      "title": "Testimonial Cards Item",
      "id": "testimonialcardsitem",
      "plugins": {
        "xwalk": {
          "page": {
            "resourceType": "core/franklin/components/block/v1/block/item",
            "template": {
              "name": "TestimonialCardsItem",
              "model": "testimonialcardsitem"
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
      "id": "testimonialcards",
      "fields": [
        { "component": "text", "valueType": "string", "name": "sectionTitleLine1", "label": "Section Title (Line 1)", "value": "" },
        { "component": "text", "valueType": "string", "name": "sectionTitleLine2", "label": "Section Title (Line 2)", "value": "" },
        { "component": "text", "valueType": "string", "name": "description", "label": "Description/Body copy", "value": "" },
        { "component": "text", "valueType": "string", "name": "ctaLabel", "label": "CTA Label", "value": "" },
        { "component": "aem-content", "name": "ctaLink", "label": "CTA Link" },
        { "component": "text", "valueType": "string", "name": "backgroundOption", "label": "Background styling option", "value": "default" }
      ]
    },
    {
      "id": "testimonialcardsitem",
      "fields": [
        { "component": "reference", "valueType": "string", "name": "image", "label": "Image", "multi": false },
        { "component": "text", "valueType": "string", "name": "imageAlt", "label": "Alt", "value": "" },
        { "component": "text", "valueType": "string", "name": "name", "label": "Name/Title", "value": "" },
        { "component": "text", "valueType": "string", "name": "role", "label": "Role/Label", "value": "" },
        { "component": "text", "valueType": "string", "name": "quote", "label": "Quote text", "value": "" },
        { "component": "text", "valueType": "string", "name": "mediaType", "label": "Media type", "value": "None" },
        { "component": "aem-content", "name": "mediaSource", "label": "Media source" },
        { "component": "reference", "valueType": "string", "name": "mediaThumbnail", "label": "Media thumbnail", "multi": false },
        { "component": "text", "valueType": "string", "name": "errorMessageOverride", "label": "Error message override", "value": "" }
      ]
    }
  ]
}
```

**Filters:**
```json
{
  "filters": [
    { "id": "testimonialcards", "components": ["testimonialcardsitem"] }
  ]
}
```

**Field order (structure contract for JS):**
- Parent rows: `block.children[0]` = sectionTitleLine1, `[1]` = sectionTitleLine2, `[2]` = description, `[3]` = ctaLabel, `[4]` = ctaLink, `[5]` = backgroundOption
- Child rows: `block.children[6]`, `block.children[7]`, ... = card items
- Per child row: `row.children[0]` = image, `[1]` = imageAlt, `[2]` = name, `[3]` = role, `[4]` = quote, `[5]` = mediaType, `[6]` = mediaSource, `[7]` = mediaThumbnail, `[8]` = errorMessageOverride

---

#### Task 1.2: Register block in section filter ✓

**File:** `models/_section.json`

Add `"testimonialcards"` to the section's `components` array in the `filters` section:
```json
"components": ["text","image","button","title","hero","cards","columns","fragment","quotescard","relatedarticles","ourcompanycarousel","testimonialcards"]
```

---

#### Task 1.3: Run build and validate JSON ✓

**Command:** `npm run build:json`

- [x] Verify `component-definition.json` includes Testimonial Cards and Testimonial Cards Item definitions
- [x] Verify `component-models.json` includes `testimonialcards` and `testimonialcardsitem` models
- [x] Verify `component-filters.json` includes `testimonialcards` filter and section filter has `testimonialcards`
- [x] Run `npm run lint` — block JS/CSS pass; xwalk rule warnings in component-models.json (max-cells) are known for blocks with many fields

---

#### Task 1.4: **[HUMAN TEST]** Deploy and verify authoring

- [ ] Deploy XWalk configuration to AEM/Universal Editor (or use local preview)
- [ ] Confirm block "Testimonial Cards" appears in component browser
- [ ] Add Testimonial Cards block to a page
- [ ] Confirm all parent fields (section title lines, description, CTA label/link, background option) and ability to add multiple card items
- [ ] Add sample content: titles, description, CTA, 4+ items with mix of Quote-type (quote + profile) and Video-type (image + media)
- [ ] Save and confirm page renders (raw AEM HTML structure expected at this stage)

> **Status:** Phase 1 backend complete. Placeholder block loads; full frontend (Phase 2.2+) requires user-provided HTML from Phase 0.5.

---

### Phase 0.5: Request User-Provided Semantic HTML

#### Task 0.5.1: Obtain semantic HTML from Universal Editor

**Prerequisite:** Phase 1 complete and deployed.

**Prompt to user:**
> Please author the Testimonial Cards block in Adobe Universal Editor with sample content, then provide the semantic HTML output:
> 1. Add the block to a page
> 2. Set section title (line 1 and line 2)
> 3. Set description and CTA label/link
> 4. Add at least 4 card items: mix of Quote-type (with quote text) and Video-type (with media source)
> 5. Copy the generated HTML (view page source or DevTools)
> 6. Paste the HTML here (include the block root element, e.g. `<div class="testimonialcards">...</div>`)

**Deliverable:** User provides HTML. Document:
- Which indices map to which fields (parent: 0–5; child rows 6+)
- Per-child row cell order
- Empty field behavior (missing cells vs empty cells)

**Important:** Do NOT proceed with frontend (JS/CSS) until user-provided HTML is received. The HTML is the source of truth for DOM structure.

---

### Phase 2: Frontend – JavaScript Implementation

**Prerequisite:** User-provided HTML received (Phase 0.5).

#### Task 2.1: Create block folder and placeholder files ✓

- [x] Create `blocks/testimonialcards/` directory
- [x] Create `blocks/testimonialcards/testimonialcards.js` with placeholder `decorate(block)` export
- [x] Create `blocks/testimonialcards/testimonialcards.css` with placeholder `.testimonialcards {}`

---

#### Task 2.2: Implement decorate() – structure contract

**File:** `blocks/testimonialcards/testimonialcards.js`

Document the structure contract in JSDoc based on **user-provided HTML** (to be saved as `testimonialcards.html`):

```javascript
/**
 * Testimonial Cards Block
 *
 * Structure contract (from user-provided HTML):
 * - block.children[0] = Section title line 1 row
 * - block.children[1] = Section title line 2 row
 * - block.children[2] = Description row
 * - block.children[3] = CTA label row
 * - block.children[4] = CTA link row
 * - block.children[5] = Background option row
 * - block.children[6+] = Card item rows
 *
 * Per item row: image, imageAlt, name, role, quote, mediaType, mediaSource, mediaThumbnail, errorMessageOverride
 */
```

Use index-based access only. No `data-*` attributes for structure.

---

#### Task 2.3: Implement decorate() – data extraction and DOM transform

- [ ] Extract section title lines, description, CTA label/link, background option from parent rows (0–5)
- [ ] Extract per item: image, alt, name, role, quote, mediaType, mediaSource, mediaThumbnail, errorMessageOverride
- [ ] Build DOM: heading (2-line title), carousel container with cards, description, CTA button
- [ ] Per card: render Quote-type (quote box + profile pill) or Video-type (image + play bar) based on mediaType and quote
- [ ] Use `createOptimizedPicture()` for images
- [ ] Use `moveInstrumentation()` when replacing/moving elements
- [ ] Image fallback: default placeholder on load error (`onerror` handler)
- [ ] Media fallback: show "Media unavailable" (or errorMessageOverride) on media load failure

---

#### Task 2.4: Implement carousel interaction logic

- [ ] Load Swiper via `loadScript()`/`loadCSS()` from `scripts/aem.js` (per implementation guide Pattern 7)
- [ ] **Desktop:** Swiper with `grabCursor`, multiple slides visible (up to 3), central "Drag" control (optional overlay or arrows)
- [ ] **Mobile:** `slidesPerView: 1`, swipe; arrow buttons below carousel
- [ ] No autoplay; loop enabled
- [ ] Breakpoints: ~390 (1 slide), ~768 (1–2), ~1280 (2–3), ~1920 (3)

---

#### Task 2.5: Implement media playback

- [ ] Video/Audio cards: play button triggers native `<video>`/`<audio>` or embed (YouTube, etc.)
- [ ] Show only play control per design (minimal player chrome)
- [ ] Media load failure: display "Media unavailable" or authored errorMessageOverride
- [ ] `aria-label="Play testimonial video"` (or "Play testimonial audio") on play button

---

#### Task 2.6: Add carousel and CTA accessibility

- [ ] Arrow buttons: `aria-label="Previous slide"`, `aria-label="Next slide"`
- [ ] CTA: keyboard-focusable, accessible name = authored label
- [ ] Media controls: keyboard accessible
- [ ] Carousel: `role="region"`, `aria-label="Testimonial cards"` (or similar)
- [ ] `touch-action: pan-x` on carousel track if needed (horizontal swipe; vertical scroll unaffected)

---

#### Task 2.7: **[HUMAN TEST]** Verify JavaScript with user HTML

- [ ] Replace block content in test page with user-provided HTML (or use authored page)
- [ ] Run `npm run dev` or serve project
- [ ] Confirm block loads and transforms without console errors
- [ ] Confirm section title, cards (Quote and Video types), description, CTA render
- [ ] Confirm carousel navigation: arrows, swipe (mobile), drag (desktop)
- [ ] Confirm media play works; "Media unavailable" on invalid media
- [ ] Confirm image placeholder on broken image

---

### Phase 3: Frontend – CSS Styling

#### Task 3.1: Base and desktop styles

**File:** `blocks/testimonialcards/testimonialcards.css`

- [ ] Section title: 2-line layout; large, bold; desktop centered
- [ ] Background: gradient ellipses + noise texture (same on desktop and mobile); conditional on backgroundOption
- [ ] Carousel: Swiper structure; cards 370px width (desktop); rounded corners; card accent colors (aqua, yellow, orange, green rotation)
- [ ] Quote card: colored box (e.g. aqua), quote text, white pill (profile image, name, role)
- [ ] Video card: full image, gradient overlay, bottom bar (accent color) with name/role + play button
- [ ] Central "Drag" control: black circle, arrows + "Drag" label (desktop)
- [ ] Section CTA: black background, white text, rounded
- [ ] Breakpoint `(width >= 900px)` or similar for desktop

---

#### Task 3.2: Mobile styles

- [ ] Section title: left-aligned, smaller (44px per Figma)
- [ ] Single card prominent; swipe/scroll
- [ ] Arrow buttons: below carousel
- [ ] Background: same gradient/pattern as desktop (per updated story)
- [ ] `touch-action`, adequate touch targets

---

#### Task 3.3: Card and media styles

- [ ] Card accent colors as CSS variables or classes
- [ ] Play button: circular, black; icon only
- [ ] "Media unavailable" message styling
- [ ] Image placeholder styling

---

#### Task 3.4: **[HUMAN TEST]** Visual and responsive verification

- [ ] Desktop: gradient, multi-card layout, Drag control, CTA
- [ ] Mobile: single card, swipe, arrows below
- [ ] Quote and Video card variants render correctly
- [ ] Typography, spacing match design
- [ ] Focus states on interactive elements

---

### Phase 4: Accessibility & Polish

#### Task 4.1: Accessibility checklist

- [ ] Alt text from img or name fallback
- [ ] CTA and media controls keyboard focusable
- [ ] aria-labels on controls
- [ ] Focus outline on interactive elements

---

#### Task 4.2: Final integration test

- [ ] Add block in Universal Editor, author content, save
- [ ] View in publish/preview
- [ ] Confirm layout, links, carousel, media playback, CTA
- [ ] Test keyboard navigation and screen reader if applicable

---

## Structure Contract Summary (To Be Validated from User-Provided HTML)

| Index | Meaning |
|-------|---------|
| `block.children[0]` | Section title line 1 row |
| `block.children[1]` | Section title line 2 row |
| `block.children[2]` | Description row |
| `block.children[3]` | CTA label row |
| `block.children[4]` | CTA link row |
| `block.children[5]` | Background option row |
| `block.children[6]` | First card row |
| ... | ... |
| `row.children[0]` | Image |
| `row.children[1]` | imageAlt |
| `row.children[2]` | name |
| `row.children[3]` | role |
| `row.children[4]` | quote |
| `row.children[5]` | mediaType |
| `row.children[6]` | mediaSource |
| `row.children[7]` | mediaThumbnail |
| `row.children[8]` | errorMessageOverride |

**Note:** Actual indices will be confirmed from user-provided HTML.

---

## Key References

- [Implementation Guide](../../../implementation-guide.md) – patterns, Swiper (Pattern 7), index-based access
- [User Story](../../../testimonialcards.md)
- [Our Company Carousel Plan](../ourcompanycarousel/2026-02-23/v1/implementation-plan.md) – carousel, Drag control
- `blocks/ourcompanycarousel/ourcompanycarousel.js` – native scroll carousel pattern
- `blocks/quotescard/quotescard.js` – parent-child, CTA
- `models/_section.json` – section filter

---

## Success Criteria

- [ ] Block appears in AEM authoring and can be configured
- [ ] Carousel displays Quote-type and Video-type cards
- [ ] Desktop: multi-card, drag, gradient background, central Drag control
- [ ] Mobile: single card, swipe + arrows
- [ ] Media play; "Media unavailable" on failure; image placeholder on image failure
- [ ] CTA and media controls keyboard and screen-reader accessible
- [ ] Responsive and matches Figma design intent
