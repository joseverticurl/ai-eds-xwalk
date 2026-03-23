# Implementation Plan: You May Also Like (`youmayalsolike`)

**Block name (folder / files):** `youmayalsolike`  
**Guide:** [eds-guide — creating-eds-block](../../../implementation-guide.md)  
**Requirements:** [youmayalsolike.pdf](../../../../youmayalsolike.pdf) — confirm file is present in workspace; extract any limits (max cards, analytics, a11y) not visible in Figma.  
**Design (Figma — Components TCCC, file `1uWBLEcq2rARuQXFnsqdQD`):**  
- **Desktop:** [node `1-1691` (dev)](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=1-1691&m=dev)  
- **Mobile:** [node `1-1703` (dev)](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=1-1703&m=dev)  
**Date:** 2026-03-23  
**Plan version:** v1.2  

---

## 0. Traceability

| Source | Role |
|--------|------|
| [Implementation guide](../../../implementation-guide.md) | Authoritative process: backend → user-provided UE HTML → frontend; index-only DOM; one folder / one JS / one CSS; `moveInstrumentation()` |
| This repo | **Phase 1:** [`blocks/youmayalsolike/_youmayalsolike.json`](../../../../../../../blocks/youmayalsolike/_youmayalsolike.json) added; `npm run build:json` run (2026-03-23). Reference patterns: [`blocks/cards/_cards.json`](../../../../../../../blocks/cards/_cards.json), [`blocks/cards/cards.js`](../../../../../../../blocks/cards/cards.js), [`blocks/featurecardscarousel/`](../../../../../../../blocks/featurecardscarousel/) (parent + items + Swiper if carousel) |
| [`models/_section.json`](../../../../../../../models/_section.json) | Section filter must allow the new block id once defined |

---

## 1. Overview

### 1.1 User story (draft — confirm against PDF / PO)

**As a** site visitor  
**I want** a “You may also like” section with related articles or items  
**So that** I can discover more content without leaving the page.

**Confidence:** ~90% — aligned with Figma; **finalize** acceptance criteria and any business rules from [youmayalsolike.pdf](../../../../youmayalsolike.pdf).

### 1.2 Block shape (Figma + EDS)

Parent + child items (same pattern as [`cards`](../../../../../../../blocks/cards/_cards.json)):

- **Parent block** `youmayalsolike`: section heading (authorable; design default copy **“You may also like”**).  
- **Child block** `youmayalsolikeitem` (component **“Cards / Related Article”** in Figma): each card = **background image**, **category badge** (pill), **title** (overlay), **destination link** (card should be navigable; mobile also shows **“Read more”** + arrow per Figma).

**Layout:** **Static grid** — desktop = **3 cards in a row** (not a carousel in Figma). Mobile = **vertical stack**. **No Swiper** unless PDF explicitly requires carousel behavior.

**Responsive UX difference (critical):**

| View | Figma reference | Cards | CTA |
|------|-----------------|-------|-----|
| Desktop | `1:1691` | 440×400px, 24px radius, 20px gap, 3 columns | Title + badge only; **no** separate “Read more” row in frame |
| Mobile | `1:1703` | 335×360px, 16px radius, 20px vertical gap | **“Read more”** (16px) + chevron icon (24×24) below title |

Implement **one** link target per card (e.g. `aem-content`); show **“Read more” + icon only at mobile breakpoint** via CSS (or match UE HTML if structure differs).

**Confidence:** ~88% for field list; **~95%** for layout/visual once CSS matches Figma. PDF may still impose **max items**, **analytics**, or **copy limits** — reconcile in Phase 0.

### 1.3 Design tokens & typography (from Figma MCP)

Use project fonts/CSS variables where available; otherwise map to the closest stack font.

| Element | Desktop (`1:1691`) | Mobile (`1:1703`) |
|--------|---------------------|-------------------|
| Section title | TCCC Unity Headline Medium **64px**, lh 1.2, tracking -1.92px, centered | **34px**, tracking -0.68px, centered |
| Card title | **26px** white | **22px** white |
| Badge / tag | **12px** black on white pill | Same |
| “Read more” | — | **16px** white + 24×24 icon |
| Card inner padding | 30px | 24px |
| Gradient overlay | Bottom-heavy (e.g. to `rgba(0,0,0,0.8)` on first card variant) | Similar to `rgba(0,0,0,0.6)` |

**Background:** Frames include decorative blurs/ellipses; treat **page/section** background separately from the block. Block scope: heading + card grid only unless PDF says otherwise.

### 1.4 Development order (mandatory — [guide §Quick Reference](../../../implementation-guide.md#quick-reference))

1. **Step 1 — Backend:** `blocks/youmayalsolike/_youmayalsolike.json`, then `npm run build:json`  
2. **Step 2 — STOP:** User provides **semantic HTML** from Adobe Universal Editor (no AI-generated HTML)  
3. **Step 3 — Frontend:** `youmayalsolike.js` + `youmayalsolike.css` from documented **structure contract** (indices from real HTML)

---

## 2. Test-driven / incremental verification

- After each phase below, a **human test** task is required before proceeding.  
- Do **not** defer all testing to the end; fixes cost more after UI and AEM content are fixed.

---

## 3. Gaps and questions (confidence &lt; 95%)

### 3.1 Open inputs (confidence &lt; 95%)

| Item | Status | Action |
|------|--------|--------|
| Requirements PDF ([`youmayalsolike.pdf`](../../../../youmayalsolike.pdf)) | **Provided by path** — verify on disk | Read PDF; capture max cards, analytics, a11y, copy limits; update §1.1 if needed |
| Figma desktop + mobile | **Provided** | [Desktop `1-1691`](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=1-1691&m=dev), [Mobile `1-1703`](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=1-1703&m=dev) — tablet frame not supplied; interpolate or add Figma frame if required |
| Exact **user story** / acceptance criteria | Draft | Finalize after PDF review |
| Parent + child items | **Confirmed** (Figma) | Matches §1.2 |
| Carousel vs static grid | **Static grid** (Figma) | **No Swiper** unless PDF overrides |
| Decorative page background (blurs / ellipses) | Out of scope in Figma frames | Confirm with design if part of block vs section template |

### 3.2 Naming

- **One** block folder: `blocks/youmayalsolike/` with **`youmayalsolike.js`** and **`youmayalsolike.css`** only (no duplicate hyphenated folder for the same block — see [guide](../../../implementation-guide.md#quick-reference)).

---

## 4. Implementation tasks

### Phase 0: Pre-implementation

| Task | Detail |
|------|--------|
| 0.1 | Read [PDF](../../../../youmayalsolike.pdf); list fields, max items, behaviors, analytics, a11y |
| 0.2 ✅ | Map fields to XWalk component types ([field types — Experience League](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/implementing/developing/universal-editor/field-types)) — see §4 Task 1.1 draft model |
| 0.3 ✅ | Reference [`cards`](../../../../../../../blocks/cards/) for parent/child JSON only; **DOM** must follow UE HTML in Phase 2 |

**[HUMAN TEST] Phase 0**

- [ ] PDF read; acceptance criteria noted (ticket or checklist) — **pending** (PDF not in repo at Phase 1 execution)  
- [x] Figma desktop + mobile reviewed against §1.2–§1.3 (per v1.1)

---

### Phase 1: Backend — XWalk configuration

#### Task 1.1 — Create `blocks/youmayalsolike/_youmayalsolike.json` ✅

**Definitions:**

- **`youmayalsolike`** (parent): `core/franklin/components/block/v1/block` with **both** `model` + `filter` (parent has title field) ([guide — parent with fields](../../../implementation-guide.md#block-with-items-parent--child)).  
- **`youmayalsolikeitem`:** `core/franklin/components/block/v1/block/item`, `model`: `youmayalsolikeitem`.

**Models (Figma-aligned — adjust labels/validation after PDF):**

| Model | Field | Component | Notes |
|-------|-------|-----------|--------|
| `youmayalsolike` | `title` | `text` | Default authoring hint: “You may also like”; max length per PDF if specified |
| `youmayalsolikeitem` | `image` | `reference` | Hero/background image |
| | `imageAlt` | `text` | Alt text |
| | `tag` | `text` | Category badge (pill) |
| | `title` | `text` | Card headline (overlay) |
| | `link` | `aem-content` | Card destination; entire card clickable; “Read more” on mobile is **presentation** (fixed or optional `readMoreLabel` text field if PDF requires authorable CTA) |

**Filters:**

- `id`: `youmayalsolike`  
- `components`: `["youmayalsolikeitem"]`

**Confidence:** ~85% for model shape; **PDF** may add/remove fields or max child count — update JSON after Phase 0.1.

#### Task 1.2 — Section filter ✅

**File:** [`models/_section.json`](../../../../../../../models/_section.json)  

`"youmayalsolike"` added to the `section` filter `components` array.

#### Task 1.3 — Build ✅

```bash
npm run build:json
```

**Verify:** `component-definition.json`, `component-models.json`, `component-filters.json` contain the new definitions/models/filters; no manual edits to those root files.

**[HUMAN TEST] Phase 1**

- [x] `npm run build:json` exits 0 (2026-03-23)  
- [x] `component-definition.json` / `component-models.json` / `component-filters.json` include `youmayalsolike` / `youmayalsolikeitem`  
- [ ] Deploy to AEM / UE; **add block to a test page** and confirm fields appear in authoring UI

---

### Phase 2: User-provided semantic HTML — **BLOCKING**

**Do not** implement `youmayalsolike.js` / `.css` until this phase is complete.

#### Task 2.1 — Request HTML from Universal Editor

Ask the author to:

1. Add the block with **realistic sample content** (including optional fields empty and filled variants if applicable).  
2. Add **multiple** child items if the block uses items.  
3. Copy generated HTML (view source or DevTools).  
4. Paste into a repo artifact (e.g. `specs/eds-guide/EDS-2026.1.0/creating-eds-block/youmayalsolike/youmayalsolike.html`) or the chat thread.

**Critical:** AI must **not** fabricate this HTML ([AI governance — process](../../../implementation-guide.md#ai-governance-rules-process)).

#### Task 2.2 — Document structure contract

From pasted HTML only:

- [ ] Row/cell indices → field meaning (`block.children[i]`, `row.children[j]`)  
- [ ] Behavior when optional fields are empty (missing row vs empty cell)  
- [ ] Parent rows vs item rows (first row title vs first item)  
- [ ] JSDoc table for `decorate()` (index contract)

**Confidence after HTML:** target ≥ **95%** for frontend work.

**[HUMAN TEST] Phase 2**

- [ ] HTML saved; **structure contract** reviewed by dev + author

---

### Phase 3: Frontend — JavaScript

**Prerequisite:** Phase 2 complete.

#### Task 3.1 — `blocks/youmayalsolike/youmayalsolike.js`

- Default export `decorate(block)`  
- **Index-based** access only (no `data-*` selection for content)  
- `moveInstrumentation()` when replacing/moving nodes ([`scripts/scripts.js`](../../../../../../../scripts/scripts.js))  
- Images: `createOptimizedPicture` from [`scripts/aem.js`](../../../../../../../scripts/aem.js) for card backgrounds  
- **No carousel** per Figma (§1.2); do **not** add Swiper unless PDF changes scope  
- Build **accessible** card links: one `<a>` wrapping card content or logical tab order; mobile “Read more” text can be inside the same link for SR clarity  
- Optional: fetch arrow icon from Figma asset or use inline SVG in `icons/` per [guide — Figma icons](../../../implementation-guide.md#using-figma-mcp-tools)

**[HUMAN TEST] Phase 3**

- [ ] Local preview or `aem up`: block renders; no console errors  
- [ ] Publish mode: index-based logic still works (no reliance on author-only `data-aue-*` for selection)

---

### Phase 4: Frontend — CSS

#### Task 4.1 — `blocks/youmayalsolike/youmayalsolike.css`

- Style **transformed** DOM (classes added in JS), not raw AEM rows only ([guide — CSS targets transformed structure](../../../implementation-guide.md#critical-css-targets-transformed-structure))  
- **Desktop:** 3-column grid (or flex), 440px card width / 400px min-height, 24px radius, 20px gap; **hide** mobile-only “Read more” row if present in DOM  
- **Mobile:** single column, 335px max width / 360px height, 16px radius, 24px inner padding; show “Read more” + icon  
- Breakpoints: align with project ([Appendix B](../../../implementation-guide.md#appendix-b-adobe-fe-eds-recommended-practices-block-creation)); validate at **~900px** crossover vs Figma (tablet not provided)  
- Gradient overlays, badge pill, typography: match §1.3 using project tokens where possible  

**[HUMAN TEST] Phase 4**

- [ ] Desktop / tablet / mobile spot-check vs design  
- [ ] No layout CLS regression on load (images: aspect-ratio / `object-fit` as needed)

---

### Phase 5: Integration and performance

| Task | Detail |
|------|--------|
| 5.1 | Confirm block appears in section picker; authoring saves and publishes |
| 5.2 | Lighthouse: [Appendix A — EDS performance](../../../implementation-guide.md#appendix-a-eds-performance--lighthouse-best-practices) — lazy images below fold; minimal JS in first section if above the fold |

**[HUMAN TEST] Phase 5**

- [ ] Authoring round-trip (edit → publish → site)  
- [ ] Optional: PageSpeed / Lighthouse on a page with only this block changed vs baseline  

---

### Phase 6: Optional automated tests

**If** the project adds tests for blocks:

- [ ] `blocks/youmayalsolike/youmayalsolike.test.js` — pure functions for data extraction from a fixture DOM (fixture built from **user-provided** HTML snapshot)

---

## 5. Completion checklist (definition of done)

- [x] `_youmayalsolike.json` + section filter + `npm run build:json`  
- [ ] UE HTML captured; structure contract documented  
- [ ] `youmayalsolike.js` + `youmayalsolike.css` match contract  
- [ ] Human tests in Phases 0–5 passed  
- [ ] Requirements PDF and design aligned with shipped fields  

---

## 6. Why this plan matches the guide

1. **Order:** Backend first, then **mandatory** user HTML, then JS/CSS — matches [Part 1: Process Flow](../../../implementation-guide.md#part-1-process-flow-3-steps).  
2. **No hallucinated HTML:** Phase 2 is a hard stop — matches [Step 2: User Provides Semantic HTML](../../../implementation-guide.md#step-2-user-provides-semantic-html).  
3. **One implementation folder** for parent + children — matches [Critical: Parent-Child Blocks Use ONE Folder](../../../implementation-guide.md#critical-parent-child-blocks-use-one-folder).  
4. **Instrumentation and images** — matches [Part 3b](../../../implementation-guide.md#part-3b-javascript-implementation) and performance appendix.  
5. **Incremental human tests** reduce rework cost per command workflow.

---

## 7. Revision history

| Version | Date | Notes |
|---------|------|--------|
| v1 | 2026-03-23 | Initial plan; field-level backend draft TBD pending `youmayalsolike.pdf` / Figma |
| v1.1 | 2026-03-23 | Linked [youmayalsolike.pdf](../../../../youmayalsolike.pdf); Figma desktop `1-1691`, mobile `1-1703`; §1.2–1.3 design spec; static grid; desktop vs mobile “Read more”; Task 1.1 model draft; §3.1 closure |
| v1.2 | 2026-03-23 | **Phase 1 executed:** [`_youmayalsolike.json`](../../../../../../../blocks/youmayalsolike/_youmayalsolike.json), [`models/_section.json`](../../../../../../../models/_section.json), `npm run build:json`; Phases 2–4 still blocked on UE HTML |
