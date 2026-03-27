# Implementation Plan: You May Also Like (`youmayalsolike`)

**Block name:** youmayalsolike  
**Guide:** [Creating a New EDS Block](../../../implementation-guide.md)  
**Requirements:** [youmayalsolike.md](../../../../../../requirements/youmayalsolike.md)  
**Design (Figma — Components TCCC):** [Desktop](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=1-1691&m=dev) | [Mobile](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=1-1703&m=dev)  
**Date:** 2026-03-27  
**Version:** v1  

**Phase 1 status:** Complete (2026-03-27) — `_youmayalsolike.json`, section filter, `npm run build:json`  
**Phase 2 status:** Complete (2026-03-27) — UE HTML received; structure contract documented below  
**Phase 3–4 status:** Complete (2026-03-27) — `youmayalsolike.js`, `youmayalsolike.css` (human visual / AEM tests still outstanding)  

---

## 1. Overview

### 1.1 User story

As a website visitor, I want to see related articles in a **“You may also like”** section so I can discover relevant content and continue exploring the site. Source: [requirements §1](../../../../../../requirements/youmayalsolike.md).

### 1.2 Functional summary (confidence: **95%**)

| Topic | Behavior |
|--------|-----------|
| Card count | Minimum **2**; maximum **3**; if fewer than 2 valid cards, **do not render**; if more than 3 authored, **show first 3 only** |
| Layout | See §1.4; responsive grid per card count |
| Card content | Image, category pill, title, link target; mobile **“Read more”** CTA with affordance |
| Aura | Author-selectable **CSS class** on block container (e.g. `aura-creative`, `aura-health`, …) |

**Gap (confidence: 70%):** [Requirements §7](../../../../../../requirements/youmayalsolike.md) ends at “Example HTML Output” with no example. Completing that section (or pasting UE HTML in Phase 2) removes ambiguity for edge cases (empty optional fields).

### 1.3 Design specifications (from Figma MCP `get_design_context`)

Figma output is **reference only** for spacing, typography, and states. Final selectors and DOM order **must** follow user-provided Universal Editor HTML per [AI Governance Rules — Never generate HTML](../../../implementation-guide.md#ai-governance-rules-process).

#### Desktop (node `1:1691`)

| Element | Spec (from design context) |
|--------|----------------------------|
| Frame / section feel | Background token `background/off_white` (#f2f2f2); decorative blurred “aura” layers behind content (implement via block wrapper + aura classes, not necessarily duplicated Figma absolute layers) |
| Section title | “You may also like”; **64px**, TCCC Unity Headline **Medium**, line-height 1.2, letter-spacing **-1.92px**, centered, black |
| Title ↔ cards gap | **50px** |
| Card row | Horizontal flex, **20px** gap |
| Card | **440×400px** frame, **24px** corner radius; full-bleed image + bottom gradient (e.g. to `rgba(0,0,0,0.6)` … `0.8` varies per card in file) |
| Card inner padding | **30px** |
| Category badge | White pill, **30px** height, **12px** horizontal padding; label **12px** black |
| Card title | **26px** white, line-height 1.2 |
| Hover | Design shows emphasis on a card (cursor / overlay); treat as **desktop hover/focus-visible** enhancement in CSS after DOM is known |

#### Mobile (node `1:1703`)

| Element | Spec |
|--------|------|
| Section horizontal inset | Content **335px** wide at **20px** side inset in frame |
| Section title | **34px**, letter-spacing **-0.68px**, centered |
| Title ↔ cards gap | **30px** |
| Card stack gap | **20px** |
| Card | **335×360px**, **16px** radius; inner padding **24px** |
| Card title | **22px** white |
| Read more | **16px** white, **10px** gap to **24×24** icon container (arrow) |

#### Tablet

Requirements matrix: **3 cards → 2 columns**; **2 cards → 2 columns**. No separate Figma link was provided (confidence: **80%** — confirm against design system or add a tablet frame later). Use project breakpoints (e.g. align with [implementation guide](../../../implementation-guide.md) / existing blocks) and match logical column behavior from the requirements table.

### 1.4 Layout matrix (authoritative — from requirements)

| Cards | Desktop | Tablet | Mobile |
|-------|---------|--------|--------|
| 3 | 3 columns (~33.33% each) | 2 columns | 1 column |
| 2 | 2 columns (50% each) | 2 columns | 1 column |

### 1.5 Development order (mandatory sequence)

Per [The 3-Step Process](../../../implementation-guide.md#the-3-step-process):

1. **Step 1 — Backend:** `blocks/youmayalsolike/_youmayalsolike.json` + `npm run build:json` + section filter  
2. **Step 2 — STOP:** User authors in Universal Editor and provides **actual** semantic HTML; document structure contract; **do not** generate HTML in Cursor  
3. **Step 3 — Frontend:** `youmayalsolike.js` / `youmayalsolike.css` from that HTML only (index-based access, no structural `data-*`)

**Reference implementation (pattern only, not DOM truth):** `blocks/ai-component-guide/ai-component-guide.js` describes a similar contract (title row, aura row, card rows, mobile read-more). Reuse **ideas** after UE HTML confirms row/cell order.

---

## 2. Implementation tasks

### Phase 0: Pre-implementation

- [x] Guide selected: eds-guide / EDS-2026.1.0 / creating-eds-block  
- [x] Requirements path agreed  
- [x] Figma desktop + mobile URLs recorded; design context pulled  
- [ ] **Optional gap:** Complete [requirements §7 example](../../../../../../requirements/youmayalsolike.md) or rely entirely on Phase 2 HTML  
- [ ] **Optional:** Tablet Figma frame for pixel audit  

---

### Phase 1: Backend — XWalk configuration

#### Task 1.1: Create block-level JSON

**File:** `blocks/youmayalsolike/_youmayalsolike.json`

**Proposed shape (confidence: 85% — validate against Universal Editor output in Phase 2):**

- **Definitions**
  - `youmayalsolike` (parent): `core/franklin/components/block/v1/block`, `model` `youmayalsolike`, `filter` `youmayalsolike`
  - `youmayalsolike-card` (child): `core/franklin/components/block/v1/block/item`, `model` `youmayalsolike-card`

- **Parent model `youmayalsolike`**

| Field | Component | Notes |
|-------|-----------|--------|
| title | text | Section heading; default authoring text can match design (“You may also like”) |
| aura | select | Values matching requirements: `aura-creative`, `aura-health`, `aura-sustainability`, `aura-light`, `aura-dark` (map to CSS classes 1:1 on block) |

- **Child model `youmayalsolike-card`**

| Field | Component | Notes |
|-------|-----------|--------|
| image | reference | Card background |
| imageAlt | text | Accessibility |
| category | text | Pill label (e.g. Sustainability) |
| title | text | Article title |
| link | text | Article URL |
| readMoreLabel | text | Optional; if empty, frontend defaults to `"Read more"` for mobile CTA label |

- **Filter:** `youmayalsolike` → `["youmayalsolike-card"]`

**References:** [Part 2: Backend Code Generation](../../../implementation-guide.md#part-2-backend-code-generation); examples: `blocks/socialpromo/_socialpromo.json`, `blocks/cards/_cards.json`.

#### Task 1.2: Register block in section filter

**File:** `models/_section.json`  

Append `"youmayalsolike"` to the `section` filter `components` array (same pattern as `socialpromo`, `featurecardscarousel`, etc.).

#### Task 1.3: Build generated artifacts

**Command:** `npm run build:json`

**Verify:**

- [x] `component-definition.json` includes `youmayalsolike` and `youmayalsolike-card`
- [x] `component-models.json` includes both models with fields as authored
- [x] `component-filters.json` includes `youmayalsolike` filter and updated `section` filter

#### Task 1.4: **[HUMAN TEST]** Backend sanity check

- [x] Run `npm run build:json` locally (no errors)
- [x] Spot-check the three JSON files above for typos and valid JSON
- [ ] Deploy/sync config to AEM so Universal Editor can list the block **(environment-specific)**

---

### Phase 2: User provides semantic HTML (**BLOCKING — mandatory wait**)

#### Task 2.1: Authoring and HTML handoff

**Author prompt (for the user / author):**

1. Add the **youmayalsolike** block to a test page in **Adobe Universal Editor**.  
2. Set section **title** and **aura** style.  
3. Add **2 and 3 card** variants (separate test pages or separate publishes) with: image, category, title, link; optionally custom read-more label.  
4. Include edge cases: minimum valid set (2 cards), three cards, and (if possible) a fourth card to confirm truncation behavior in published HTML.  
5. Copy the **generated block HTML** (view source or DevTools) and paste into the working thread / ticket.  

**Critical:** Per [Step 2: User Provides Semantic HTML](../../../implementation-guide.md#step-2-user-provides-semantic-html), Cursor must **not** fabricate this HTML.

#### Task 2.2: Document structure contract

After HTML is received:

- [x] Map each **row** / **cell index** to model fields (index-based contract for `decorate()`)
- [x] Document behavior when optional fields are empty (missing nodes vs empty strings)
- [x] Confirm how many rows belong to parent vs each child card (parent-child blocks vary by UE output)
- [x] Save a short “contract” subsection under Phase 2 in this file (or link to a checked-in `requirements/youmayalsolike-ue-sample.html` if the team adds one)

**Confidence:** **≥ 95%** — matches delivered UE markup (2026-03-27).

**Structure contract (`decorate` receives `<div class="youmayalsolike">` as `block`):**

| Row index | Role | DOM | Maps to model |
|-----------|------|-----|----------------|
| `0` | Title | `<div><div>{text}</div></div>` | `youmayalsolike.title` |
| `1` | Aura | `<div><div>{token}</div></div>` | `youmayalsolike.aura` — if token matches `/^aura-[a-z0-9-]+$/i`, added as class on `block` |
| `2` … `4` | Cards (max 3) | each row = one card | each `youmayalsolike-card` |

**Per card row** (direct children of the row = cells, index order):

| Cell index | Content |
|------------|---------|
| `0` | Wrapper containing `<picture>` / `<img>` |
| `1` | Category label (plain text) |
| `2` | Article title (plain text) |
| `3` | Link cell with `<a href="...">` |
| `4` | Read-more label (e.g. `Readmore`); JS normalizes “readmore” → display **Read more**; empty → **Read more** |

**Empty / invalid behavior:** `decorate` requires **≥ 4** top-level rows (title + aura + **≥ 2** card rows). A card row with **&lt; 4** cells is skipped. Card ignored if no usable `img` src. If **&lt; 2** cards remain after filtering → **`block.remove()`**. Card rows beyond index `4` are ignored (**max 3** cards: `rows.slice(2, 5)`).

---

### Phase 3: Frontend — JavaScript (TDD-oriented)

**Prerequisite:** Phase 2 structure contract complete.

#### Task 3.1: Implement `decorate(block)` ✅

**File:** `blocks/youmayalsolike/youmayalsolike.js`

**Requirements:**

- `export default function decorate(block)`
- **Index-based DOM access only** (no structural `data-*` attributes) — [AI Governance Rules](../../../implementation-guide.md#ai-governance-rules-process)
- Use `createOptimizedPicture` from `../../scripts/aem.js` where `<picture>` / images exist
- Use `moveInstrumentation` from `../../scripts/scripts.js` when moving nodes
- Enforce card count rules: **< 2 valid cards → `block.remove()`**; **> 3 → slice to 3**
- **Entire card** should navigate via article link (accessible hit target); **Read more** row visible on mobile per design (may be decorative vs duplicate link — align with UE HTML)
- Normalize URLs if needed (see `ai-component-guide` `normalizeUrl` pattern)

#### Task 3.2: **[HUMAN TEST]** JS unit smoke

- [ ] In browser or minimal fixture: paste user-provided block HTML, run `decorate`, confirm no console errors
- [ ] Verify 2-card and 3-card DOM outputs; verify 1-card / 0-card blocks are removed
- [ ] Verify keyboard focus order still sensible after decoration

---

### Phase 4: Frontend — CSS

**Prerequisite:** Phase 2 HTML + Phase 3 DOM shape stable.

#### Task 4.1: Implement `youmayalsolike.css` ✅

**File:** `blocks/youmayalsolike/youmayalsolike.css`

**Requirements:**

- Section title and card grid matching §1.3–1.4 (spacing audit vs Figma: 50 / 30 / 20px gaps, radii 24 / 16px, typography sizes)
- Card: image cover, bottom gradient overlay, rounded corners
- Category pill and title colors per desktop/mobile specs
- **Mobile-only** (or small viewport): show **Read more** row + icon; **hide or de-emphasize** on desktop if design shows card title only there
- **Aura classes:** `.aura-creative`, `.aura-health`, `.aura-sustainability`, `.aura-light`, `.aura-dark` on block wrapper — implement background treatments consistent with global tokens (`styles/styles.css` has aura-related CSS variables if reused)
- Hover/focus-visible states for cards on desktop where design indicates interaction

**References:** [Part 3c: CSS Implementation](../../../implementation-guide.md#part-3c-css-implementation); compare with `blocks/ai-component-guide/ai-component-guide.css`.

#### Task 4.2: **[HUMAN TEST]** Responsive visual check

- [ ] Desktop width (~1440): 3-column and 2-column cases; measure gutter ≈ 20px; title spacing ≈ 50px below heading stack
- [ ] Tablet: 2-column behavior per matrix
- [ ] Mobile (~375): stacked cards, 20px vertical rhythm, read-more visible
- [ ] Lighthouse quick pass: contrast on white-on-image text (gradient must be sufficient)

---

### Phase 5: Integration & acceptance

#### Task 5.1: **[HUMAN TEST]** Universal Editor authoring

- [ ] Block appears in section
- [ ] All parent and child fields persist on save/publish
- [ ] Aura select applies visible background on preview site

#### Task 5.2: **[HUMAN TEST]** Acceptance vs requirements

- [ ] Section title and cards match content model
- [ ] Layout rules for 2 vs 3 cards at desktop/tablet/mobile
- [ ] Card click navigates to article
- [ ] < 2 cards: block absent in preview
- [ ] > 3 cards: only three visible

---

## 3. File summary (expected)

| File | Purpose |
|------|---------|
| `blocks/youmayalsolike/_youmayalsolike.json` | Definitions, models, filter |
| `blocks/youmayalsolike/youmayalsolike.js` | Decoration, card cap, link behavior |
| `blocks/youmayalsolike/youmayalsolike.css` | Layout, aura, responsive, hover |
| `models/_section.json` | Allow `youmayalsolike` in section |

---

## 4. Traceability

| Requirement source | Plan coverage |
|--------------------|----------------|
| [§1 User story](../../../../../../requirements/youmayalsolike.md) | §1.1, Phase 5.2 |
| [§4 Card count & validation](../../../../../../requirements/youmayalsolike.md) | §1.2, Task 3.1, 5.2 |
| [§4 Layout matrix](../../../../../../requirements/youmayalsolike.md) | §1.4, Task 4.1–4.2 |
| [§5 Desktop](../../../../../../requirements/youmayalsolike.md) | §1.3, Phase 4 |
| [§6 Mobile + Read more](../../../../../../requirements/youmayalsolike.md) | §1.3, child field `readMoreLabel`, Phase 4 |
| [§7 Aura classes](../../../../../../requirements/youmayalsolike.md) | Parent `aura` select, Task 4.1 |
| [3-step process / no HTML generation](../../../implementation-guide.md) | §1.5, Phase 2 |

---

## 5. Why this plan matches the goal

1. **Process safety:** It follows the guide’s **backend → user HTML → frontend** order so `decorate()` matches real Universal Editor DOM and avoids index hallucinations.  
2. **Requirements grounding:** Card limits, layout matrix, mobile CTA, and aura classes are traced to specific tasks and tests.  
3. **Design grounding:** Desktop and mobile Figma nodes supply measurable typography and spacing for CSS; tablet follows the written matrix with an explicit confidence note.  
4. **Incremental verification:** Human test checkpoints follow each major phase (build, JS, CSS, authoring, acceptance), reducing late rework cost.  
5. **Codebase alignment:** Section filter + `_*.json` layout mirror existing blocks (`socialpromo`, `cards`); JS/CSS patterns align with `ai-component-guide` where the feature overlaps, without treating it as HTML truth.

---

## 6. Review & approval

- [ ] Stakeholder review of §1.3–1.4 vs brand guidelines (fonts may map to project font stacks, not raw Figma family names)  
- [ ] Confirm Phase 1 field list (especially `readMoreLabel` optional vs fixed copy)  
- [ ] Approve **WAIT** checkpoint in Phase 2 before any frontend generation  

**After approval:** Execute Phase 1; **stop** at Phase 2 until semantic HTML is provided.
