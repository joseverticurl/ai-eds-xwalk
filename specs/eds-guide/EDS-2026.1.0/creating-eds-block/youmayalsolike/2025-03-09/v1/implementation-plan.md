# Implementation Plan: You May Also Like Block

**Specific functionality:** youmayalsolike  
**Guide:** [creating-eds-block](../../implementation-guide.md) (EDS-2026.1.0)  
**Requirements:** [youmayalsolike.md](../../../youmayalsolike.md)  
**Design:** [Figma Desktop](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=1-1691) · [Figma Mobile](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=1-1703)  
**Version:** v1  
**Date:** 2025-03-09

---

## Summary

Implement the **youmayalsolike** EDS block: a parent block with optional section title, configurable gradient aura (CSS class), and 2–3 related-article cards. Each card has background image, category tag, title, and link; mobile shows a “Read more” CTA. Layout is responsive (desktop 2–3 columns, tablet 2 columns, mobile 1 column). Implementation follows the [implementation guide](../../implementation-guide.md): **backend first → WAIT for user-provided semantic HTML → frontend**.

---

## Design and Requirements Summary

| Item | Source |
|------|--------|
| Section title | Authorable; default intent "You may also like" |
| Aura background | Author-selectable class: `aura-creative`, `aura-health`, `aura-sustainability`, `aura-light`, `aura-dark` |
| Card count | 2–3 cards; &lt;2 = do not render; &gt;3 = show first 3 only |
| Card fields | Image, category (badge), title, link; mobile “Read more” CTA (same link) |
| Layout | Desktop: 3-col or 2-col; Tablet: 2-col; Mobile: 1-col, stacked, full width |
| Typography (Figma) | Desktop: Headline 2 64px; Label XS 12px; Headline 5 26px. Mobile: Headline 2 34px; Headline 5 22px; Label L 16px (“Read more”) |

---

## Phase 0: Pre-Implementation

| # | Task | Details |
|---|------|--------|
| 0.1 | Requirements and design locked | Requirements in [youmayalsolike.md](../../../youmayalsolike.md); Figma Desktop (node 1:1691) and Mobile (node 1:1703) reviewed. |
| 0.2 | Block naming | Block folder and class: **youmayalsolike** (one word). Child item id: **youmayalsolikeitem**. |
| 0.3 | No similar block reference | User indicated no existing block to mirror; follow [cards](../../../../blocks/cards) and [featurecardscarousel](../../../../blocks/featurecardscarousel) patterns for parent+child. |

---

## Phase 1: Backend (XWalk) — Step 1

**Reference:** [Part 2: Backend Code Generation](../../implementation-guide.md#part-2-backend-code-generation). Do not proceed to frontend until Phase 2 (user HTML) is complete.

### 1.1 Create block folder and block-level JSON

| # | Task | Details |
|---|------|--------|
| 1.1.1 | Create directory | Create `blocks/youmayalsolike/`. |
| 1.1.2 | Create block-level JSON | Create `blocks/youmayalsolike/_youmayalsolike.json` with **definitions**, **models**, and **filters** as below. |

**Parent definition (youmayalsolike):**

- `resourceType`: `core/franklin/components/block/v1/block`
- `template.name`: e.g. `YouMayAlsoLike`
- `template.model`: `youmayalsolike` (parent has authoring fields: title, aura)
- `template.filter`: `youmayalsolike` (allows child items)

**Child definition (youmayalsolikeitem):**

- `resourceType`: `core/franklin/components/block/v1/block/item`
- `template.name`: e.g. `YouMayAlsoLikeItem`
- `template.model`: `youmayalsolikeitem`

**Parent model (id: `youmayalsolike`):**

- `title` (text) — section heading, e.g. “You may also like”
- `aura` (select) — options: `aura-creative`, `aura-health`, `aura-sustainability`, `aura-light`, `aura-dark`; applied as CSS class on block wrapper

**Child model (id: `youmayalsolikeitem`):**

- `image` (reference)
- `imageAlt` (text)
- `category` (text) — badge label, e.g. “Sustainability”, “Career”
- `title` (text) — article title
- `link` (aem-content) — article URL
- Optional: `ctaText` (text) — e.g. “Read more” for mobile; default in frontend if empty

**Filters:**

- `id`: `youmayalsolike`, `components`: `["youmayalsolikeitem"]`

**Example structure for `_youmayalsolike.json`** (field order defines structure contract for index-based access):

- **definitions:** Parent block (resourceType `block`, template with `model` and `filter`), child block (resourceType `block/item`, template with `model` only).
- **models:** Parent `youmayalsolike`: `title` (text), `aura` (select with options above). Child `youmayalsolikeitem`: `image` (reference), `imageAlt` (text), `category` (text), `title` (text), `link` (aem-content), optionally `ctaText` (text).
- **filters:** One object `{ "id": "youmayalsolike", "components": ["youmayalsolikeitem"] }`.

**Human test (Phase 1):**

- [x] Run `npm run build:json`. Confirm no errors.
- [x] Open `component-definition.json`, `component-models.json`, `component-filters.json` and confirm youmayalsolike and youmayalsolikeitem appear (definitions, models, and filter).

### 1.2 Register block in section filter

| # | Task | Details |
|---|------|--------|
| 1.2.1 | Add to section components | In `models/_section.json`, in the filter where `"id": "section"`, add `"youmayalsolike"` to the `components` array. |

**Human test (Phase 1):**

- [x] Run `npm run build:json` again. Confirm `component-filters.json` section entry includes `youmayalsolike`.

### 1.3 Deploy and author in Universal Editor

| # | Task | Details |
|---|------|--------|
| 1.3.1 | Deploy | Deploy to an AEM/Universal Editor environment so the block can be authored. |
| 1.3.2 | Author block | In Universal Editor: add the youmayalsolike block to a page, set section title and aura, add 2–3 items with image, category, title, link (and optionally ctaText). |

---

## Phase 2: WAIT — User Provides Semantic HTML (Mandatory)

**Reference:** [Step 2: User Provides Semantic HTML](../../implementation-guide.md#step-2-user-provides-semantic-html), [AI Governance Rules (Process)](../../implementation-guide.md#ai-governance-rules-process).

**Do not generate JavaScript or CSS until the user provides the actual HTML from Universal Editor.**

| # | Task | Details |
|---|------|--------|
| 2.1 | **CHECKPOINT — WAIT** | **STOP.** Do not implement frontend yet. |
| 2.2 | Request HTML | Ask user: *“Please author the youmayalsolike block in Adobe Universal Editor with sample content (title, aura, 2–3 cards with image, category, title, link). Then provide the semantic HTML output (view source or DevTools). Include the block root element and full structure.”* |
| 2.3 | Document structure contract | After user provides HTML: document which indices correspond to which content (e.g. `block.children[0]` = title row, `block.children[1..n]` = card rows; per-card row cells: image, category, title, link). Note empty/optional field behavior. |
| 2.4 | Proceed to Phase 3 | Only after 2.2 and 2.3 are done, proceed to Phase 3. |

---

## Phase 3: Frontend — After User-Provided HTML

**Prerequisite:** Phase 2 complete; structure contract documented from real HTML.

### 3.1 JavaScript — one file per block

| # | Task | Details |
|---|------|--------|
| 3.1.1 | Create block JS | Create `blocks/youmayalsolike/youmayalsolike.js`. Single default export: `decorate(block)`. |
| 3.1.2 | Structure contract | In JSDoc, document the index-based structure contract derived from user-provided HTML (e.g. first row = title/aura, remaining rows = cards; per-row cell order). |
| 3.1.3 | Validation (card count) | If fewer than 2 card rows, do not render (empty block or message per requirements). If more than 3 card rows, use only the first 3. |
| 3.1.4 | Extract and transform | Use index-based access only (no `data-*` for structure). Extract title, aura class, and per-card image, category, title, link (and optional ctaText). Use `moveInstrumentation()` when replacing/moving elements. |
| 3.1.5 | Markup | Build section heading (if title present), wrapper with aura class, and card list. Each card: link wrapping background image (or picture), category badge, title, and on mobile a “Read more” CTA (use ctaText or default “Read more”). Entire card is clickable (link). |
| 3.1.6 | Images | Use `createOptimizedPicture()` for card images; `loading="lazy"` for non-LCP. |
| 3.1.7 | Responsive behavior | No separate JS for layout; layout is CSS-driven (grid/flex and breakpoints). |

**Human test (Phase 3.1):**

- [ ] Load a page containing the block with user-provided content. Confirm block decorates without errors, card count 2–3 enforced, and structure matches design (title, aura class, cards with image, badge, title, link).

### 3.2 CSS — one file per block

| # | Task | Details |
|---|------|--------|
| 3.2.1 | Create block CSS | Create `blocks/youmayalsolike/youmayalsolike.css`. Style the **transformed** structure produced by `decorate()`, not the raw AEM HTML. |
| 3.2.2 | Section and aura | Style block wrapper; apply gradient/aura styles for classes `.aura-creative`, `.aura-health`, `.aura-sustainability`, `.aura-light`, `.aura-dark` per [youmayalsolike.md](../../../youmayalsolike.md). |
| 3.2.3 | Layout | Desktop: 3 columns for 3 cards, 2 columns for 2 cards; tablet: 2 columns; mobile: 1 column, stacked. Use CSS Grid or Flexbox; consistent gap (e.g. 20px from Figma). |
| 3.2.4 | Cards | Rounded corners (e.g. 24px desktop, 16px mobile from Figma), aspect ratio or min height (e.g. 400px desktop, 360px mobile), image as background or full-bleed with overlay gradient for text readability. |
| 3.2.5 | Typography | Align with Figma: Desktop Headline 2 (64px), Headline 5 (26px), Label XS (12px); Mobile Headline 2 (34px), Headline 5 (22px), Label L (16px). Use project font (e.g. TCCC-UnityHeadline) if available. |
| 3.2.6 | Badge and CTA | Category pill styling; “Read more” CTA visible on mobile (e.g. show below title on small viewports). |
| 3.2.7 | Breakpoints | Use project breakpoints (e.g. 600px, 900px, 1200px) for tablet/desktop. |

**Human test (Phase 3.2):**

- [ ] Verify desktop and mobile layouts, aura variants, and typography against Figma. Check hover/focus for cards and “Read more” link.

### 3.3 Accessibility and performance

| # | Task | Details |
|---|------|--------|
| 3.3.1 | Accessibility | Semantic heading for section title; alt text from `imageAlt`; entire card link has descriptive context (title/category); focus visible. |
| 3.3.2 | Performance | Lazy-load images; keep block JS/CSS minimal; avoid blocking main thread. |

**Human test (Phase 3.3):**

- [ ] Quick pass with keyboard and screen reader; confirm images have alt text and link purpose is clear.

---

## Phase 4: Integration and Validation

| # | Task | Details |
|---|------|--------|
| 4.1 | Lint | Run `npm run lint`; fix any issues in new JS/CSS/JSON. |
| 4.2 | AEM authoring | In Universal Editor, add/edit youmayalsolike block, change title, aura, and card content; save and refresh. |
| 4.3 | Publish view | Confirm block renders correctly in publish/preview with 2 and 3 cards, and that &lt;2 cards does not render (or shows agreed empty state). |
| 4.4 | Responsive | Test at desktop, tablet, and mobile widths; confirm column counts and “Read more” on mobile. |

---

## File and Reference Summary

| Artifact | Path / reference |
|----------|-------------------|
| Implementation guide | [implementation-guide.md](../../implementation-guide.md) |
| Requirements | [youmayalsolike.md](../../../youmayalsolike.md) |
| Block config | `blocks/youmayalsolike/_youmayalsolike.json` |
| Section filter | `models/_section.json` (add youmayalsolike to section components) |
| Block JS | `blocks/youmayalsolike/youmayalsolike.js` |
| Block CSS | `blocks/youmayalsolike/youmayalsolike.css` |
| Reference blocks | `blocks/cards/`, `blocks/featurecardscarousel/` |

---

## Critical Reminders

1. **Backend first:** Complete Phase 1 (and 1.2, 1.3) before any frontend work.
2. **Do not generate HTML:** Phase 2 is mandatory. Wait for user-provided semantic HTML from Universal Editor before implementing or refining JS/CSS.
3. **One JS, one CSS:** Exactly `youmayalsolike.js` and `youmayalsolike.css` in `blocks/youmayalsolike/`.
4. **Index-based only:** No `data-*` for structure; document and use the structure contract from the actual HTML.
5. **Card count:** &lt;2 cards → do not render; &gt;3 cards → show first 3 only.
6. **moveInstrumentation:** Use when replacing or moving elements so authoring instrumentation is preserved.

---

## Approval

- [x] Implementation plan reviewed and approved.
- [x] Phase 1 completed and backend tests passed.
- [ ] Phase 2 completed (user provided semantic HTML; structure contract documented).
- [ ] Phase 3 completed and frontend tests passed.
- [ ] Phase 4 integration and validation passed.
