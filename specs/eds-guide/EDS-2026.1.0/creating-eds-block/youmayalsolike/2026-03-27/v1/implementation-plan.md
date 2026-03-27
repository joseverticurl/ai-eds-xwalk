# Implementation Plan: You May Also Like Block (`youmayalsolike`)

**Block Name:** youmayalsolike  
**Guide:** [eds-guide — Creating a New EDS Block](../../../implementation-guide.md)  
**Requirements:** [youmayalsolike.md](../../../../../../requirements/youmayalsolike.md)  
**Design:** Figma [Desktop](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=1-1691&m=dev) | [Mobile](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=1-1703&m=dev)  
**Date:** 2026-03-27  
**Version:** v1  

**Phase 1 Status:** Complete (2026-03-27)  
**Phase 2 Status:** Blocked until user provides Universal Editor HTML  
**Phase 3+ Status:** Pending — stub `youmayalsolike.js` / `.css` load without errors until real decoration/CSS land  

---

## 1. Overview

### 1.1 User Story
As a website visitor, I want to see related articles in a **“You may also like”** section, so that I can discover relevant content and keep exploring the site.

### 1.2 Block structure (intent)
- **Parent block (`youmayalsolike`):** Section title; optional **aura** styling class on the block wrapper (see §1.5).
- **Child block (`youmayalsolike-card` — id TBD to match UE):** Per-article card — background image, category pill, title, article URL; **“Read more”** treatment on **mobile only** (fixed label + icon per Figma; not necessarily a separate authored field).

### 1.3 Card count and layout (from requirements)

| Cards | Desktop | Tablet | Mobile |
|-------|---------|--------|--------|
| 3 | 3 columns (~equal width) | 2 columns | 1 column (stack) |
| 2 | 2 columns (~50% each) | 2 columns | 1 column (stack) |

**Runtime rules (decorate / CSS):**
- **&lt; 2 cards:** do not render the block (remove empty or hide).
- **&gt; 3 cards:** use **only the first 3** child rows/items.
- Cards grow/shrink to fill row width; consistent gutters.

**Confidence:** 98% — explicit in [requirements](../../../../../../requirements/youmayalsolike.md).

### 1.4 Design specifications (Figma MCP + requirements)

Values below are **design intent** for CSS; final tokens must align with project fonts and globals (no Tailwind in repo).

**Desktop** ([node `1:1691`](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=1-1691&m=dev)):
- Section background (frame): `#f2f2f2` / `var(--background/off_white)`; large soft blurred aura layers behind content (implementation may be simplified to section + authored `aura-*` class).
- Title: centered, **64px**, TCCC Unity Headline Medium, black, letter-spacing ≈ **-1.92px** (tracking -3% of 64px).
- Card: **440×400** px frame, **24px** corner radius, **20px** gap between cards; inner padding **30px**.
- Badge: white pill, h **30px**, px **12px**, label **12px** / line-height **1.4**, black text.
- Card title: **26px**, white, line-height **1.2**, bottom-aligned stack.
- Image: `object-fit: cover`; overlay gradient bottom **~0.6–0.8** opacity black (first card uses stronger **0.8** in Figma).
- Decorative hand cursor on mock only — **do not ship** in production.

**Mobile** ([node `1:1703`](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=1-1703&m=dev)):
- Title: **34px**, centered, tracking ≈ **-0.68px**.
- Vertical stack: title–cards gap **30px**; card–card gap **20px**; horizontal inset **20px** (content width **335px** in frame).
- Card: **335×360** px, **16px** radius, padding **24px**.
- Card title: **22px** white.
- **Read more** row: **16px** white, **10px** gap to **24×24** chevron icon (implement as inline SVG / sprite per project patterns).

**Tablet:** No separate Figma link supplied — use requirements table (2 columns for 2 and 3 cards). **Confidence:** 92% for pixel-perfect vs brand tablet specs; **100%** for column behavior per requirements doc.

### 1.5 Aura / gradient background (requirements §7)
- Authors choose an **aura** variant; it maps to a **CSS class on the component container** (e.g. `aura-creative`, `aura-health`, `aura-sustainability`, `aura-light`, `aura-dark`).
- Project today exposes related tokens in [`styles/styles.css`](../../../../../../../styles/styles.css) (`--range-aura-*`); **global rules for `.aura-*` on this block may need to be added** during Phase 4. **Confidence:** 85% until design aligns aura visuals with existing tokens.

### 1.6 Development order (mandatory per [implementation guide](../../../implementation-guide.md#part-2-backend-code-generation))
1. **Step 1:** Backend — `blocks/youmayalsolike/_youmayalsolike.json`, `npm run build:json`, `models/_section.json`.
2. **Step 2:** **STOP** — User authors in Universal Editor and provides **semantic HTML** (source of truth). Do **not** generate or assume HTML.
3. **Step 3:** Frontend — `youmayalsolike.js` / `youmayalsolike.css` from **user HTML** + Figma/requirements.

---

## 2. Implementation tasks

### Phase 0: Pre-implementation
- [x] Guide: EDS creating-eds-block  
- [x] Requirements: [youmayalsolike.md](../../../../../../requirements/youmayalsolike.md)  
- [x] Figma: Desktop + Mobile (`1:1691`, `1:1703`) — tokens extracted via design context  
- [ ] **Note:** Requirements §7 “Example HTML Output” is incomplete in source file; UE HTML will define the real contract  

---

### Phase 1: Backend — XWalk configuration

#### Task 1.1: Create block-level JSON
**File:** `blocks/youmayalsolike/_youmayalsolike.json`

**Definitions (pattern:** match [`blocks/socialpromo/_socialpromo.json`](../../../../../../../blocks/socialpromo/_socialpromo.json) **parent/child):**
- **`youmayalsolike`:** `core/franklin/components/block/v1/block`, `model` `youmayalsolike`, `filter` `youmayalsolike`.
- **`youmayalsolike-card`:** `core/franklin/components/block/v1/block/item`, `model` `youmayalsolike-card`.

**Parent model `youmayalsolike` — provisional fields** (reorder after Task 2.2 if UE row order differs):

| Order | Field | Component | Label | Notes |
|-------|--------|-----------|-------|--------|
| 0 | title | text | Section title | e.g. “You may also like”; optional default in authoring |
| 1 | aura | select | Aura style | Options mapping to classes: `aura-creative`, `aura-health`, `aura-sustainability`, `aura-light`, `aura-dark` |

**Child model `youmayalsolike-card` — provisional:**

| Order | Field | Component | Label | Validation |
|-------|--------|-----------|-------|------------|
| 0 | image | reference | Image | required |
| 1 | imageAlt | text | Alt text | optional |
| 2 | category | text | Category | optional; pill text |
| 3 | articleTitle | text | Article title | required for display |
| 4 | articleLink | text | Article URL | required; entire card is clickable |

**Filter:** `youmayalsolike` → `components: ["youmayalsolike-card"]`

**Confidence:** 88% on exact field **order** and **names** until UE HTML is seen — **must revise** in Task 2.2 if indices differ.

---

#### Task 1.2: Register block in section filter
**File:** [`models/_section.json`](../../../../../../../models/_section.json)

Add `"youmayalsolike"` to the `section` filter `components` array (alongside existing `socialpromo`, `cards`, etc.).

---

#### Task 1.3: Build merge
**Command:** `npm run build:json`

**Verify:**
- [ ] `component-definition.json` contains `youmayalsolike` and `youmayalsolike-card`
- [ ] `component-models.json` contains both models with expected fields
- [ ] `component-filters.json` contains `youmayalsolike` filter and section lists the block

---

#### Task 1.4: **[HUMAN TEST]** Backend
- [ ] Run `npm run build:json` with no errors
- [ ] Inspect merged JSON files for correct IDs and filters
- [ ] In AEM / Universal Editor: add block to a test page, add 2–3 cards, save (smoke test authoring)

---

### Phase 2: User-provided semantic HTML (**BLOCKING CHECKPOINT**)

#### Task 2.1: **WAIT** — Request HTML from author
**Do not** generate HTML in Cursor. Per [AI Governance — user-provided HTML](../../../implementation-guide.md#development-workflow-backend-first-then-user-provided-semantic-html):

**Prompt to user / author:**
1. Add **`youmayalsolike`** to a page in **Adobe Universal Editor**.  
2. Set section title and aura (if available).  
3. Add **2 or 3** `youmayalsolike-card` items with image, category, title, link (and optional alt).  
4. Optionally add a **fourth** card to verify trim-to-3 behavior in later tests.  
5. Copy **semantic HTML** (view source or DevTools) and paste into the implementation thread / requirements artifact.

**Until HTML is provided:** do **not** implement `youmayalsolike.js` / `.css`.

---

#### Task 2.2: Document structure contract
After HTML arrives:
- [ ] Map **each row / cell index** to parent vs child fields
- [ ] Document optional/empty cells
- [ ] Confirm child **link** appears as `<a>` vs plain URL cell (for `decorate`)
- [ ] Update Task 1.1 field order if model must be adjusted → re-run `npm run build:json` → **human retest** authoring

**Confidence target:** ≥ 95% on index contract before Phase 3.

---

### Phase 3: Frontend — JavaScript

**Prerequisite:** Task 2.2 complete.

#### Task 3.1: Create `blocks/youmayalsolike/youmayalsolike.js`
**Patterns:** [`blocks/cards/cards.js`](../../../../../../../blocks/cards/cards.js), [`blocks/socialpromo/socialpromo.js`](../../../../../../../blocks/socialpromo/socialpromo.js)

**Requirements:**
- `export default function decorate(block)`
- **Index-based** DOM access only (no structural `data-*` reliance), per [implementation guide](../../../implementation-guide.md)
- `createOptimizedPicture` from `../../scripts/aem.js` for card images; `moveInstrumentation` from `../../scripts/scripts.js` when moving nodes
- Count child rows: if **&lt; 2**, remove block or return without rendering; if **&gt; 3**, slice to first 3
- Whole card clickable: one `<a>` wrapping card content (or unify `<a>` from UE if already present)
- Mobile-only **Read more** row: if not in UE HTML, inject via DOM for small breakpoints only (duplicate focus target / accessibility: prefer single link wrapping card; “Read more” can be decorative `aria-hidden` inside same `<a>` — **confirm with HTML**)

**[HUMAN TEST] — incremental**
- [ ] Static fixture: paste UE HTML into local preview; load block script; call `decorate(block)`
- [ ] Console clean; 2-card and 3-card layouts; 1-card / 4-card edge cases

---

### Phase 4: Frontend — CSS

#### Task 4.1: Create `blocks/youmayalsolike/youmayalsolike.css`
- Grid/flex per §1.3: **desktop** — 3 columns when three cards, 2 columns when two cards; **tablet** — 2 columns in both cases; **mobile** — 1 column. Use JS (e.g. modifier class on the block for card count) if pure CSS cannot express “2 vs 3 columns on desktop” from the same grid. Breakpoints: align with project / [`socialpromo`](../../../../../../../blocks/socialpromo/socialpromo.css).
- Title, gaps, radii, font sizes per §1.4 (map to project `rem` / variables where required)
- Card: `position: relative`, image layer, gradient overlay, bottom-aligned text stack
- Badge: pill styles matching Figma
- **Read more:** visible only below **mobile breakpoint** (e.g. `@media (max-width: …)`); hidden on desktop/tablet
- **`aura-*`:** container classes applied on wrapper; implement or extend globals so background matches design **Confidence:** 85% pending design sign-off

**[HUMAN TEST] — incremental**
- [ ] Resize: desktop width → 3-col / 2-col (tablet) → 1-col (mobile) per requirements
- [ ] Compare to Figma Desktop / Mobile frames (pixel diff acceptable only per team norms)
- [ ] Focus/keyboard: full card link focus visible

---

### Phase 5: Integration and acceptance

#### Task 5.1: **[HUMAN TEST]** Authoring / publish
- [ ] UE: create block, edit title, aura, 2–3 cards, links open correct pages
- [ ] Publish: output matches local decoration

#### Task 5.2: **[HUMAN TEST]** Acceptance vs requirements
- [ ] Section title present  
- [ ] 2 or 3 cards only in output; &lt;2 hidden; &gt;3 truncated  
- [ ] Category, image, title, navigation to article  
- [ ] **Read more** on mobile only  
- [ ] Rounded cards + gradient readability  
- [ ] Aura class on container when author selects variant  

---

## 3. File summary (expected)

| File | Purpose |
|------|---------|
| `blocks/youmayalsolike/_youmayalsolike.json` | Definitions, models, filter |
| `blocks/youmayalsolike/youmayalsolike.js` | `decorate()`, layout + link + image optimization |
| `blocks/youmayalsolike/youmayalsolike.css` | Responsive grid, aura, card/CTA visuals |
| `models/_section.json` | Register `youmayalsolike` on section |

---

## 4. Traceability

| Requirement source | Implementation |
|-------------------|----------------|
| Related articles / discovery | Child cards + `articleLink` |
| 2–3 cards, layout table | CSS grid + `decorate` slice/hide |
| Category, image, title, full-card link | Card model + `<a>` / keyboard |
| Mobile Read more | CSS breakpoint + optional DOM in JS |
| Aura class on container | Parent `aura` select → class on block wrapper |
| Rounded corners, gradient | Card CSS from Figma §1.4 |

---

## 5. References

- [Implementation guide: Creating a new EDS block](../../../implementation-guide.md)
- [Requirements: youmayalsolike](../../../../../../requirements/youmayalsolike.md)
- Figma: [Desktop](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=1-1691&m=dev) · [Mobile](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=1-1703&m=dev)
- Similar blocks: [`blocks/cards/`](../../../../../../../blocks/cards/), [`blocks/socialpromo/`](../../../../../../../blocks/socialpromo/)

---

## 6. Why this plan matches the goal

The plan follows the **guide’s mandatory order**: block JSON and build first, then **hard stop** for **Universal Editor HTML**, then JS/CSS derived from that HTML so the runtime matches production markup. Requirements drive **card count rules** and **Read more / aura** behavior; Figma Desktop/Mobile drive **typography, radii, spacing, and gradients** with explicit **tablet** behavior taken from the requirements table where no Figma frame was supplied. Incremental **human tests** after backend, after JS, and after CSS keep fixes cheap and align with test-driven delivery.

---

## 7. Review / approval

- [ ] Product / design approves Figma ↔ CSS mapping (especially aura vs blurred background art).  
- [ ] Engineering approves provisional XWalk field list or confirms updates after UE HTML.  
- [ ] **Approved to execute Phase 1** by: _______________  Date: _______________

After approval, implement Phase 1 only; **pause at Phase 2** until HTML is delivered.
