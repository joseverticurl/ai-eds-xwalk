# Implementation plan: `youmayalsolike` block

**Guide:** [creating-eds-block](../../../implementation-guide.md)  
**Guide version:** EDS-2026.1.0  
**Specific functionality:** `youmayalsolike`  
**Plan version:** v1  
**Date:** 2026-04-27  

**Requirements (source of truth for behavior):** [specs/requirements/youmayalsolike.md](../../../../../../requirements/youmayalsolike.md)  

**Design (visual reference; not a substitute for Universal Editor HTML):**  
- Desktop: [Figma — node `1:1691`](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=1-1691&m=dev)  
- Mobile: [Figma — node `1:1703`](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=1-1703&m=dev)  
- File key: `1uWBLEcq2rARuQXFnsqdQD`  

**Confidence (plan completeness vs. guide + repo):** 95% — backend field shapes may be refined when user-provided UE HTML and project content-model constraints are known.

---

## 1. Purpose and success criteria

Deliver an Edge Delivery block **`youmayalsolike`** that:

1. Renders a section titled **“You may also like”** with 2–3 **article cards** (image, category pill, title, full-card link; **“Read more”** treatment on small viewports per [requirements](../../../../../../requirements/youmayalsolike.md)).
2. **Does not render** if fewer than **2** child items; shows **at most 3** items.
3. Uses a **responsive grid**: 3/2/1 column behavior per the [requirements table](../../../../../../requirements/youmayalsolike.md#card-count-rules-dynamic-layout); align breakpoints with project tokens in `styles/` (e.g. existing `--*` breakpoints) rather than Figma’s absolute frames alone.
4. Supports author-selected **container aura** classes (e.g. `aura-creative`, `aura-light`) on the **block wrapper** per [Visual Styling](../../../../../../requirements/youmayalsolike.md#visual-styling).
5. Follows the guide’s **3-step order**: **Backend → user-provided semantic HTML (mandatory stop) → frontend JS/CSS** ([implementation guide — Quick Reference](../../../implementation-guide.md#quick-reference)).

**Why this matches the goal:** The plan mirrors the [EDS creating-eds-block](../../../implementation-guide.md) workflow, grounds behavior in the signed requirements file, and uses Figma only for typography/spacing/structure hints until **actual Universal Editor output** is pasted—avoiding the guide’s known pitfall of Cursor-generated HTML diverging from AEM.

---

## 2. Traceability

| Item | Source |
|------|--------|
| Process order (backend → UE HTML → JS/CSS) | [Implementation guide: Development Process](../../../implementation-guide.md#purpose-and-scope) |
| One folder, `youmayalsolike.js` + `youmayalsolike.css` | [Implementation guide: Quick Reference](../../../implementation-guide.md#quick-reference) |
| Block JSON location & `build:json` | [Implementation guide: Part 2](../../../implementation-guide.md#part-2-backend-code-generation); `package.json` scripts `build:json:*` |
| Merge of models from `blocks/*/_*.json` | [models/_component-models.json](../../../../../../../models/_component-models.json) (glob `../blocks/*/_*.json`) |
| Patterns for `decorate`, `createOptimizedPicture`, `moveInstrumentation` | e.g. [blocks/hero/hero.js](../../../../../../../blocks/hero/hero.js), [blocks/cards/cards.js](../../../../../../../blocks/cards/cards.js) |
| Unit tests (Vitest + `test/helpers.js`) | e.g. [blocks/hero/hero.test.js](../../../../../../../blocks/hero/hero.test.js) |
| Card parent + item models + `filters` | [blocks/featurecardscarousel/_featurecardscarousel.json](../../../../../../../blocks/featurecardscarousel/_featurecardscarousel.json) (reference) |

---

## 3. Design notes (Figma — reference only)

> **Do not** implement from this section alone. [Step 2](../../../implementation-guide.md#step-2-user-provides-semantic-html) requires **pasted HTML from Universal Editor** after backend is deployed.

| Topic | Desktop (`1:1691`) | Mobile (`1:1703`) | Notes for CSS |
|-------|--------------------|------------------|----------------|
| Section heading | TCCC Unity Headline, ~64px, centered, black | ~34px, centered | Map to project heading utilities / variables in `styles/` |
| Card grid | 3× row, 20px gap, card ~440×400px, radius 24px | Stacked, 20px gap, card width ~335px, height ~360px, radius 16px | Final values follow UE DOM + `styles` tokens |
| Card padding | 30px | 24px | |
| Category pill | White pill, 12px text | Same | |
| Title on card | ~26px white | ~22px white | |
| “Read more” | Not in desktop frame for primary card content | 16px + 24px icon (chevron) | Per [requirements §6](../../../../../../requirements/youmayalsolike.md#mobile-experience): show CTA on **mobile**; **hide or de-emphasize** on larger viewports if design is desktop-silent (match Figma + PM sign-off) |
| Background | Soft off-white + decorative blurred “aura” shapes | Elaborate gradient/ellipse/noise background | “Aura” **variant** = author class on block; static assets/gradients per design token, not ad-hoc in block JS if avoidable |
| Artifacts to **ignore** in production | Hand cursor on card (design only) | — | Do not ship cursor graphics |

**Tablet:** No dedicated Figma node supplied; use [requirements table](../../../../../../requirements/youmayalsolike.md#card-count-rules-dynamic-layout) (e.g. 2 columns for 3 cards) between mobile and desktop breakpoints.

---

## 4. Proposed content model (Step 1 — to validate against UE HTML)

> Field names/labels are **proposals**. After **user-provided HTML** arrives, **reconcile** row/column order and indices with the real DOM (guide: index-based structure, no `data-*` selection) ([Part 3 prerequisites](../../../implementation-guide.md#part-3-frontend-code-generation)).

**Block definition: `youmayalsolike` (parent)**

| Field | Type (proposal) | Purpose |
|-------|-----------------|---------|
| `heading` | `text` (optional) | Default to “You may also like” in UI copy if empty |
| `style` / `theme` | `select` | Maps to container class list, e.g. `aura-creative`, `aura-health`, … per [§7](../../../../../../requirements/youmayalsolike.md#visual-styling) |

**Item definition: `youmayalsolikeitem` (child)**

| Field | Type (proposal) | Purpose |
|-------|-----------------|---------|
| `image` | `reference` | Hero/background image for card |
| `imageAlt` | `text` | Alt text (required for a11y) |
| `category` | `text` | Category pill |
| `title` | `text` or `richtext` | Card title; truncation in CSS per design |
| `link` | `aem-content` (or `text` URL if project standard differs) | Destination for **entire card** + “Read more” link |

**Filter:** `youmayalsolike` allows `youmayalsolikeitem` (same pattern as [feature cards carousel filter](../../../../../../../blocks/featurecardscarousel/_featurecardscarousel.json)).

**Rationale vs. “dynamic from references” in requirements:** “Dynamic” in author terms = authors pick 2–3 content items; the published page still receives **static HTML** from the pipeline. Explicit fields per card keep Franklin decoration deterministic without a separate metadata API. If the project mandates **link-only** + server-side resolution of title/image, that becomes a follow-up (lower confidence) — not assumed here.

---

## 5. Phased tasks (TDD-oriented + human checkpoints)

### Phase 0 — Prerequisites (short)

| # | Task | Owner | Done when |
|---|------|--------|-----------|
| 0.1 | Confirm `heading` is authorable or fixed; confirm tablet breakpoints with design (if stricter than requirements) | Team | Sign-off in PR or comment |
| 0.2 | Re-read a11y expectations for carousels/cards in project skills (if any) in `.agents/skills/eds-block-accessibility` | Dev | N/A (no code) |

**Human test (0.H1):** Review this plan with stakeholders; approve **content model** and **Figma as visual reference** only.

---

### Phase 1 — Backend (XWalk JSON + build)

| # | Task | Owner | Notes |
|---|------|--------|--------|
| 1.1 | Add `blocks/youmayalsolike/_youmayalsolike.json` with `definitions` (parent + item), `models`, `filters` | Dev | **Done** — Match [featurecardscarousel JSON](../../../../../../../blocks/featurecardscarousel/_featurecardscarousel.json). |
| 1.2 | Run `npm run build:json` and verify `component-models.json` / `component-definition.json` / `component-filters.json` include the new block | Dev | **Done** — [package.json](../../../../../../../package.json) `build:json` succeeded; merged files include `youmayalsolike`. |
| 1.3 | If project registers blocks elsewhere (e.g. `fstab.yaml`, paths), add `youmayalsolike` per project convention | Dev | **Done** — `youmayalsolike` in [models/_section.json](../../../../../../../models/_section.json) section filter. No change to [fstab.yaml](../../../../../../../fstab.yaml) (no block list). |

**Stub (non-production):** `blocks/youmayalsolike/youmayalsolike.js` and `youmayalsolike.css` exist as no-op / comment-only so `loadBlock` does not 404. **Replace with real decoration in Phase 2 after Checkpoint A.**

**Human test (1.H1):** Locally run `npm run build:json` (no errors). Spot-check generated merged JSON.

**Human test (1.H2):** Deploy/sync to the AEM/Universal Editor environment used by the team; confirm the **You May Also Like** (or equivalent) block appears in the block picker, fields render in the panel, and **2–3** items can be added.

---

### ⛔ CHECKPOINT A — MANDATORY (per [implementation guide](../../../implementation-guide.md#step-2-user-provides-semantic-html))

| # | Task | Owner |
|---|------|--------|
| A.1 | **STOP** — Do **not** replace the current **placeholder** `youmayalsolike.js` / `youmayalsolike.css` with **production** decoration until the next rows are done | AI + Dev |
| A.2 | Author a sample page in **Adobe Universal Editor** with **2- and 3-item** variations and the aura class variant(s) | Author |
| A.3 | **Paste the generated semantic HTML** (or save HTML snapshot) into the ticket / follow-up for implementation | Author |
| A.4 | **Validate** row/column order and indices: document `block.children` mapping (e.g. row 0 = heading, rows 1..n = items) | Dev |

**No HTML shall be invented in Cursor to replace A.2–A.3** — the guide is explicit that Universal Editor output is authoritative.

---

### Phase 2 — Frontend (only after Checkpoint A)

| # | Task | Owner | Notes |
|---|------|--------|--------|
| 2.1 | Add `blocks/youmayalsolike/youmayalsolike.js` implementing `export default function decorate(block)` | Dev | Follow index-based contract from A.4; use `createOptimizedPicture` and `moveInstrumentation` like [hero.js](../../../../../../../blocks/hero/hero.js) / [cards.js](../../../../../../../blocks/cards/cards.js) |
| 2.2 | Build semantic DOM: section heading, list/grid of cards, each card: link wrapping or valid click target, **one** h-level for section title, heading level per a11y doc | Dev | “Read more” as visible text on small screens only (CSS), still **one** primary link if possible to avoid nested interactive confusion |
| 2.3 | **Business rules in JS:** if `items.length < 2` → `block.remove()` or `innerHTML = ''` (or `hidden` per project pattern); **slice** to first 3 if more | Dev | Align with [validation rules](../../../../../../requirements/youmayalsolike.md#validation) |
| 2.4 | `blocks/youmayalsolike/youmayalsolike.css` — layout (grid), radii, gradient overlay, typography, `display` of “Read more” by breakpoint, aura classes on `.youmayalsolike` (or BEM) | Dev | No Tailwind; match `styles/` variables |
| 2.5 | If chevron icon needed, add `icons/…svg` and `decorateIcon` from [scripts/aem.js](../../../../../../../scripts/aem.js) where appropriate | Dev | |
| 2.6 | **Tests:** `blocks/youmayalsolike/youmayalsolike.test.js` (Vitest) | Dev | Cases: 0/1 item → no visible cards; 4+ rows → 3 cards; **structure** of heading + N cards; optional: optimized picture called with expected widths |
| 2.7 | **Run** `npx vitest run` (or project test script) and fix | Dev | |

**Human test (2.H1):** `npm test` or equivalent passes locally.

**Human test (2.H2):** Local preview: 2- and 3-card layouts, desktop/tablet/mobile widths; “Read more” only where intended; keyboard focus and visible focus for links.

**Human test (2.H3):** Re-publish to UE: visual parity with Figma “within project token tolerance” and **no** author-facing regressions.

---

### Phase 3 — Validation & handoff

| # | Task | Owner |
|---|------|--------|
| 3.1 | Cross-browser smoke (Safari, Chrome) | Dev/QA |
| 3.2 | Lighthouse/performance: avoid layout shift (images dimensions / `aspect-ratio` in CSS) | Dev |
| 3.3 | Update any block collection / documentation site lists if the repo maintains them | Dev |

**Human test (3.H1):** Product/design sign-off using Figma links above + published staging URL.

---

## 6. Test-driven development sequence (summary)

1. **After model merge (Phase 1):** smoke only — `build:json` (automatable assertion: grep merged JSON for `youmayalsolike`).  
2. **After user HTML (Checkpoint A):** add tests that build a **DOM matching pasted structure** (using [test helpers](../../../../../../../test/helpers.js) patterns) **before** locking final CSS.  
3. **Iterate** `decorate` until tests for count rules and DOM structure pass; then refine CSS for pixel-fit.

This avoids expensive end-of-branch rework when the DOM from UE does not match assumptions.

---

## 7. Review & approval (workflow step 6)

- [ ] Author / product approves this plan and the **proposed** field model.  
- [ ] Engineering lead approves the **mandatory** Universal Editor HTML checkpoint.  
- [ ] After implementation, a short review confirms every task in **§5** (including all **Human test** items) is completed or explicitly deferred with a ticket.

---

## 8. Post-implementation: why this satisfies the goal

1. **Traceability** — Requirements, Figma, and the official [EDS block guide](../../../implementation-guide.md) are all cited; behavior is not guessed.  
2. **Process compliance** — Backend first; **Stop** for real UE HTML; only then JS/CSS, matching the guide’s [3-step process](../../../implementation-guide.md#the-3-step-process).  
3. **Reliability** — Index-based `decorate` and automated tests for **2/3 count rules** match how similar blocks are tested in this repo ([hero tests](../../../../../../../blocks/hero/hero.test.js)).  
4. **Design fidelity** — Figma tokens and breakpoints are **inputs to CSS** after DOM is known, reducing rework.  
5. **TDD and human checks** — Logical phases include automated tests **and** author/QA steps so issues surface before final UAT.

---

## 9. Gaps and follow-ups (optional)

- **Content-only resolution:** If later the block must **resolve** title/image from a single `aem-content` field without per-card `image`/`title`, a separate spike is required (confidence < 80% for that approach here).  
- **Requirements file:** [youmayalsolike.md § “Example HTML Output”](../../../../../../requirements/youmayalsolike.md#example-html-output) is empty; fill with **pasted UE HTML** when available to keep documentation aligned.

---

*End of implementation plan v1.*
