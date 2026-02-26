# Implementation Plan: Social Promo Block (socialpromo)

**Block Name:** socialpromo  
**Guide:** [eds-guide](specs/eds-guide/EDS-2026.1.0/creating-eds-block/implementation-guide.md)  
**Requirements:** [CC-Social promo content block-260226-064529.pdf](../../../../../../requirements/CC-Social%20promo%20content%20block-260226-064529.pdf)  
**Design:** Figma [Desktop](https://www.figma.com/design/ll3RkqQHJd5djDIcbnpnF2/bibigo?node-id=13969-74648) | [Tablet](https://www.figma.com/design/ll3RkqQHJd5djDIcbnpnF2/bibigo?node-id=13969-74764) | [Mobile](https://www.figma.com/design/ll3RkqQHJd5djDIcbnpnF2/bibigo?node-id=13969-74876)  
**Date:** 2026-02-26  
**Version:** v1  

**Phase 1 Status:** ✅ Complete (2026-02-26). Awaiting user-provided HTML before Phase 3.

---

## 1. Overview

### 1.1 User Story
As a user, I want to see the Social activity of Bibigo in card style, so that I can see the testimonials or Fanbase of Bibigo products.

### 1.2 Block Structure
- **Parent block (socialpromo):** Section title, CTA button (optional)
- **Child block (socialpromo-card):** Image, tag, caption per card
- **Max cards:** 10
- **Layout:** Marquee-style horizontal carousel (right-to-left), infinite loop, 5s lag; hover slows to 0.5x

### 1.3 Design Specifications (from Figma)

| Element | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| Section padding | 80px horizontal, 36px vertical | 44px horizontal, 28px vertical | 20px horizontal, 24px vertical |
| Title font size | 32px | 28px | 24px |
| Title color | #013b1c | #013b1c | #013b1c |
| Section background | #fffbe3 (bibigo-ivory) | #fffbe3 | #fffbe3 |
| CTA button | #004122 bg, white text, 16px | 14px | 14px |
| Card background | #289200 (green) | #289200 | #289200 |
| Card image aspect | 347:420 (~5:6) | 347:420 | 347:420 |
| Tag background | #004122 | #004122 | #004122 |

**Card themes (author-selectable):** Green, Light yellow, Dark Yellow, Pink, Dark green, White, Gradient, Brown, Orange, Blue

### 1.4 Development Order (per [Implementation Guide](specs/eds-guide/EDS-2026.1.0/creating-eds-block/implementation-guide.md))
1. **Step 1:** Backend — XWalk JSON, `npm run build:json`
2. **Step 2:** User provides semantic HTML from Universal Editor
3. **Step 3:** Frontend — JavaScript and CSS based on user-provided HTML

---

## 2. Implementation Tasks

### Phase 0: Pre-Implementation (Complete)
- [x] Design source: Figma URLs (Desktop, Tablet, Mobile)
- [x] Requirements: CC-Social promo content block PDF
- [x] Design analysis: Structure, tokens, breakpoints extracted
- [x] Content fields mapped to XWalk model

---

### Phase 1: Backend — XWalk Configuration

#### Task 1.1: Create block-level JSON file ✅
**File:** `blocks/socialpromo/_socialpromo.json`

Add definitions, models, and filters:

**Definitions:**
- `socialpromo` (parent): `core/franklin/components/block/v1/block`, model `socialpromo`, filter `socialpromo`
- `socialpromo-card` (child): `core/franklin/components/block/v1/block/item`, model `socialpromo-card`

**Parent model (socialpromo):**
| Field | Component | Label | Validation |
|-------|-----------|-------|------------|
| title | text | Title | maxLength: 42 |
| ctaLabel | text | CTA Label | optional |
| ctaLink | text | CTA Link (Instagram URL) | optional |

**Note:** CTA icon uses fixed SVG (no ctaIcon reference field) — implemented in Phase 3.

**Child model (socialpromo-card):**
| Field | Component | Label | Validation |
|-------|-----------|-------|------------|
| image | reference | Image | required, 5:6 aspect |
| imageAlt | text | Alt Text | optional |
| caption | text | Caption | optional, maxLength: 65 |
| tag | text | Tag | optional, maxLength: 12 |
| theme | select | Card Theme | options: green, light-yellow, dark-yellow, pink, dark-green, white, gradient, brown, orange, blue |

**Filter:** `socialpromo` → components: `["socialpromo-card"]`

**Reference:** [Part 2: Backend Code Generation](specs/eds-guide/EDS-2026.1.0/creating-eds-block/implementation-guide.md#part-2-backend-code-generation), `blocks/cards/_cards.json`, `blocks/hero/_hero.json`

---

#### Task 1.2: Update section filter ✅
**File:** `models/_section.json`

Add `socialpromo` to the section filter's `components` array. Current value: `["text","image","button","title","hero","cards","columns","fragment"]`. Update to include `"socialpromo"`.

**Reference:** `models/_section.json` line with `"id":"section"` and `components` array.

---

#### Task 1.3: Run build and verify ✅
**Command:** `npm run build:json`

**Verification:**
- [x] `component-definition.json` contains `socialpromo` and `socialpromo-card` definitions
- [x] `component-models.json` contains `socialpromo` and `socialpromo-card` models
- [x] `component-filters.json` contains `socialpromo` filter and `section` includes `socialpromo`

---

#### Task 1.4: **[HUMAN TEST]** Verify backend configuration
- [ ] Run `npm run build:json` successfully
- [ ] Open `component-definition.json`, `component-models.json`, `component-filters.json` and confirm socialpromo entries exist
- [ ] Validate JSON syntax (no parse errors)

---

### Phase 2: User Provides Semantic HTML (BLOCKING)

#### Task 2.1: Request user-provided HTML
**Action:** Prompt the user:

> Please author the socialpromo block in Adobe Universal Editor with sample content, then provide the semantic HTML output.
>
> 1. Add the socialpromo block to a page
> 2. Configure: Title (e.g., "Fans Around the World"), CTA Label ("Follow us on Instagram"), CTA Link (Instagram URL)
> 3. Add 3–5 socialpromo-card items with image, caption, tag, and theme
> 4. Copy the generated HTML (view source or DevTools)
> 5. Paste the HTML here

**Critical:** Per [AI Governance Rules](specs/eds-guide/EDS-2026.1.0/creating-eds-block/implementation-guide.md#ai-governance-rules-process), do NOT generate HTML. User-provided HTML is the source of truth for DOM structure.

---

#### Task 2.2: Document structure contract
After receiving user-provided HTML:

- [ ] Document which rows/cells map to which fields (index = meaning)
- [ ] Document empty/optional field behavior
- [ ] Document parent vs child row structure
- [ ] Create index mapping table for `decorate()` implementation

---

### Phase 3: Frontend — JavaScript Implementation

**Prerequisite:** Task 2.2 complete (structure contract documented)

#### Task 3.1: Create block JavaScript file
**File:** `blocks/socialpromo/socialpromo.js`

**Requirements:**
- Export default `decorate(block)` function
- Use **index-based access only** (no `data-*` attributes)
- Use `moveInstrumentation()` when transforming/moving elements
- Import `createOptimizedPicture` from `../../scripts/aem.js` for image optimization
- Import `moveInstrumentation` from `../../scripts/scripts.js`

**Structure contract (to be validated against user HTML):**
- Row 0: Parent header (title, CTA) — or first card if title/CTA optional
- Rows 1..N: Child cards (image, caption, tag per row)

**Logic:**
1. Extract parent row (title, ctaLabel, ctaLink)
2. Extract child rows (image, caption, tag, theme)
3. Build DOM: section header (title + CTA button) + marquee container with cards
4. Apply `createOptimizedPicture` for images (5:6 aspect)
5. Implement marquee: horizontal scroll, right-to-left, 5s delay, infinite loop; hover → 0.5x speed

**Reference:** `blocks/cards/cards.js`, [Part 3b: JavaScript Implementation](specs/eds-guide/EDS-2026.1.0/creating-eds-block/implementation-guide.md#part-3b-javascript-implementation)

---

#### Task 3.2: **[HUMAN TEST]** Verify JavaScript with static HTML
- [ ] Create a test HTML file or use browser DevTools to inject user-provided HTML
- [ ] Load `socialpromo.js` and call `decorate(block)` with the block element
- [ ] Verify DOM transformation (no console errors, structure correct)

---

### Phase 4: Frontend — CSS Styling

#### Task 4.1: Create block CSS file
**File:** `blocks/socialpromo/socialpromo.css`

**Requirements:**
- Section: background #fffbe3, responsive padding (80px/44px/20px horizontal, 36px/28px/24px vertical)
- Title: #013b1c, font sizes 32px/28px/24px (desktop/tablet/mobile), semi-bold
- CTA button: #004122 bg, white text, rounded corners, hover state
- Cards: 395px max-width, rounded corners, theme-based background colors
- Card image: 5:6 aspect ratio (347/420), object-fit cover
- Tag: #004122 bg, white text, rounded pill
- Marquee: horizontal scroll, overflow hidden, CSS animation or JS-driven scroll

**Breakpoints:**
- Desktop: 1280px
- Tablet: 768px
- Mobile: 350px (or default)

**Card theme classes:** `.socialpromo-card--green`, `.socialpromo-card--light-yellow`, etc.

**Reference:** [Part 3c: CSS Implementation](specs/eds-guide/EDS-2026.1.0/creating-eds-block/implementation-guide.md#part-3c-css-implementation), Figma design tokens

---

#### Task 4.2: Implement marquee behavior
- [ ] Horizontal scroll animation (right-to-left)
- [ ] 5 second delay between scroll steps
- [ ] Infinite loop (duplicate content or seamless scroll)
- [ ] Hover: reduce speed to 0.5x (CSS `animation-play-state` or JS)

---

#### Task 4.3: **[HUMAN TEST]** Verify responsive layout
- [ ] Test at 1280px (desktop): partial cards visible on left/right
- [ ] Test at 768px (tablet): one full card + two partial
- [ ] Test at 350px (mobile): two partial cards, CTA below title (center-aligned)
- [ ] Verify marquee scroll and hover behavior

---

### Phase 5: CTA Link Behavior

#### Task 5.1: Implement CTA click handler
- [ ] CTA opens `ctaLink` URL in new tab (`target="_blank"`, `rel="noopener noreferrer"`)
- [ ] Use fixed SVG icon for Instagram/follow (no ctaIcon reference field)
- [ ] Per requirements: Bibigo global → global Instagram; Bibigo-KR → KR Instagram (author configures link)

---

### Phase 6: Integration & Validation

#### Task 6.1: Deploy to AEM / Universal Editor
- [ ] Deploy block config and frontend to AEM environment
- [ ] Block appears in component browser

---

#### Task 6.2: **[HUMAN TEST]** AEM authoring validation
- [ ] Add block to page in Universal Editor
- [ ] Edit title (max 42 char), CTA (label, link, icon)
- [ ] Add/edit/delete cards (max 10)
- [ ] Set card theme per card
- [ ] Save and verify content persists
- [ ] Verify publish mode renders correctly

---

#### Task 6.3: **[HUMAN TEST]** End-to-end acceptance
- [ ] Section displays title and CTA
- [ ] CTA opens Instagram in new tab
- [ ] Cards show image, tag, caption
- [ ] Marquee scrolls right-to-left, 5s lag, infinite
- [ ] Hover slows carousel to 0.5x
- [ ] Responsive: desktop/tablet/mobile layouts match design

---

## 3. File Summary

| File | Purpose |
|------|---------|
| `blocks/socialpromo/_socialpromo.json` | XWalk definition, model, filter |
| `blocks/socialpromo/socialpromo.js` | Block decoration, marquee logic |
| `blocks/socialpromo/socialpromo.css` | Styles, responsive, themes |

---

## 4. Traceability

| Requirement | Implementation |
|-------------|----------------|
| Section displays Title and CTA | Parent model: title, ctaLabel, ctaLink (CTA icon: fixed SVG) |
| CTA opens Instagram in new tab | Task 5.1: target="_blank", rel="noopener noreferrer" |
| Card: image, tag, caption | Child model: image, imageAlt, caption, tag |
| Marquee right-to-left, 5s lag, infinite | Task 4.2: CSS/JS marquee |
| Hover slows to 0.5x | Task 4.2: animation-play-state or JS |
| Max 10 cards | Enforced by authoring UI / validation |
| Card themes (10 options) | Child model: theme select field |
| Image 5:6 aspect | Model note + CSS aspect-ratio |
| Title max 42 char, Caption max 65, Tag max 12 | Validation in model |

---

## 5. References

- [Implementation Guide: Creating a New EDS Block](specs/eds-guide/EDS-2026.1.0/creating-eds-block/implementation-guide.md)
- [Requirements: CC-Social promo content block](../../../../../../requirements/CC-Social%20promo%20content%20block-260226-064529.pdf)
- Figma: [Desktop](https://www.figma.com/design/ll3RkqQHJd5djDIcbnpnF2/bibigo?node-id=13969-74648) | [Tablet](https://www.figma.com/design/ll3RkqQHJd5djDIcbnpnF2/bibigo?node-id=13969-74764) | [Mobile](https://www.figma.com/design/ll3RkqQHJd5djDIcbnpnF2/bibigo?node-id=13969-74876)
- Existing blocks: `blocks/cards/`, `blocks/hero/`
