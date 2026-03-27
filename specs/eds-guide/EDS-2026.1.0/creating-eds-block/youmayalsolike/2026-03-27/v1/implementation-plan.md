# Implementation plan: `youmayalsolike` block

**Guide:** [creating-eds-block — implementation-guide.md](../../../implementation-guide.md)  
**Requirements:** [youmayalsolike.md](../../../../../../requirements/youmayalsolike.md)  
**Figma (dev mode):** [Desktop — node `1:1691`](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=1-1691&m=dev) · [Mobile — node `1:1703`](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=1-1703&m=dev)  
**Plan version:** v1 · **Date:** 2026-03-27

---

## 1. Goal and success criteria

Deliver an EDS block **`youmayalsolike`** that matches the linked requirements and Figma (desktop + mobile), with XWalk authoring, frontend decorate logic, styles, and automated tests. Success means:

- Authors can add **2–3** related-article cards; invalid counts are handled per requirements.
- Layout matches the **responsive matrix** (desktop / tablet / mobile) in [youmayalsolike.md §4](../../../../../../requirements/youmayalsolike.md).
- **Configurable aura** applies via an **author-selected CSS class** on the block container (§7 in requirements).
- **No HTML is invented in Cursor** for production markup — **Universal Editor output is the contract** for Step 3 (see §2 checkpoint).

**Reasoning (traceability):** This follows the guide’s three-step order (backend → user HTML → frontend) and block conventions (one folder, one `youmayalsolike.js` / `youmayalsolike.css`, block-level `_youmayalsolike.json`, then `npm run build:json`). Source: [implementation-guide — Purpose and Quick Reference](../../../implementation-guide.md).

---

## 2. Source-of-truth and confidence

| Input | Role | Confidence |
|--------|------|------------|
| [implementation-guide.md](../../../implementation-guide.md) | Process, XWalk patterns, JS/CSS rules (index-based structure, no ad-hoc `data-*` selection, lint/Sonar) | **98%** |
| [youmayalsolike.md](../../../../../../requirements/youmayalsolike.md) | Functional rules (card count, grid behavior, aura, mobile CTA) | **95%** — doc ends at “Example HTML Output” with no sample; final DOM must come from **UE** |
| Figma `1:1691` / `1:1703` | Visual tokens: headline sizes, radii, gradient overlay, badge, mobile “Read more” + icon | **92%** for tablet — **no dedicated tablet frame** provided; implement §4 tablet rules using project breakpoints (see §6) |
| Repo `blocks/cards/`, `blocks/featurecardscarousel/` | Prior art for parent + child block JSON and `decorate` patterns | **95%** |

---

## 3. Design notes (from Figma MCP — adapt to project CSS)

These inform **CSS tasks** after UE HTML exists; do not treat MCP React/Tailwind output as final code.

**Desktop (`1:1691`):** Section title “You may also like” (~64px, TCCC Unity Headline, centered); 3 cards in a row; **20px** gap; card **h ~400px**, **rounded ~24px**, inner padding **30px**; full-bleed image + **bottom gradient** (transparent → rgba black ~0.6–0.8); **pill badge** top-left (white bg, 12px label); title ~**26px** white at bottom; decorative hand cursor in frame — **omit in production** (not in requirements).

**Mobile (`1:1703`):** Title ~**34px** centered; stack cards; **30px** title-to-cards gap, **20px** between cards; card **h ~360px**, **rounded ~16px**, padding **24px**; title ~**22px**; **“Read more”** ~16px with **24px** icon — visible on mobile; desktop frame has **no** separate “Read more” row (whole card is link per requirements §5).

**Project breakpoints (for tablet inference):** `styles/styles.css` uses **`width >= 768px`** and **`width >= 1280px`** for layout. **Proposal:** treat **&lt;768px** as mobile, **768px–1279px** as tablet (2 columns when requirements call for 2), **≥1280px** as desktop (3 or 2 columns by card count). **Confidence 90%** — confirm against design review if tablet comps are added later.

---

## 4. Test-driven development approach

1. **Write failing tests first** where the DOM contract is known (after UE HTML is frozen): e.g. `youmayalsolike.test.js` asserts `decorate()` output structure, class names, truncation hooks, and **card count rules** (hide if &lt;2, cap at 3).
2. **Implement** `decorate()` and CSS until tests pass.
3. **Human verification** after each major phase (mandatory — see §8).

Vitest layout in repo: coverage includes `blocks/**/*.test.js` ([`vitest.config.js`](../../../../../../vitest.config.js)); follow [`blocks/cards/cards.test.js`](../../../../../../blocks/cards/cards.test.js) patterns (`createBlockFromRows`, mocks for `aem.js` / `scripts.js`).

---

## 5. Phase A — Backend (XWalk JSON only)

**Artifacts:** `blocks/youmayalsolike/_youmayalsolike.json` (definitions, models, filters). **Do not** add `youmayalsolike.js` / `.css` until Phase C.

**Parent block model (proposed):**

| Field | Component | Purpose |
|--------|-----------|---------|
| `title` | `text` | Section heading; default authoring hint “You may also like” |
| `auraClass` | `select` | Values: `aura-creative`, `aura-health`, `aura-sustainability`, `aura-light`, `aura-dark` (per requirements §7) |

**Child item model (`youmayalsolikeitem`, `block/item`):**

| Field | Component | Purpose |
|--------|-----------|---------|
| `image` | `reference` | Card background image |
| `category` | `text` | Pill label (e.g. Sustainability) |
| `articleTitle` | `text` | Article title (multi-line; line-clamp in CSS) |
| `articleLink` | `aem-content` | Target URL for **entire card** (and “Read more” if present) |

**Definitions / filters:** Mirror [`blocks/cards/_cards.json`](../../../../../../blocks/cards/_cards.json) / [`blocks/featurecardscarousel/_featurecardscarousel.json`](../../../../../../blocks/featurecardscarousel/_featurecardscarousel.json): one page block with `filter: "youmayalsolike"`, child resource type `.../block/item` with `model: "youmayalsolikeitem"`.

**Commands:** `npm run build:json` to merge into root `component-*.json` ([`package.json`](../../../../../../package.json) scripts).

**Automated checks:** `npm run lint` (JSON lint via ESLint per project).

### Human test — Phase A

- [ ] Run `npm run build:json`; confirm `component-models.json`, `component-definition.json`, and `component-filters.json` include **`youmayalsolike`** and **`youmayalsolikeitem`** with expected fields.
- [ ] In AEM / UE, add the block, author **2 and 3** items, publish/preview; confirm fields persist.

---

## 6. Phase B — **CHECKPOINT: Universal Editor HTML (blocking)**

**STOP.** Do **not** implement JavaScript or CSS for this block until the user provides **actual semantic HTML** from Universal Editor (guide: Step 2 — [implementation-guide — User-provided HTML](../../../implementation-guide.md)).

**Actions for user:**

1. Author **`youmayalsolike`** in Universal Editor with representative content (2 cards, 3 cards, and edge cases if possible).
2. Paste the **generated HTML** into the ticket/chat.
3. Optionally complete [youmayalsolike.md §7 “Example HTML Output”](../../../../../../requirements/youmayalsolike.md) so requirements and UE stay aligned.

**AI / implementer after HTML arrives:**

- Map **row/column indices** to badges, images, titles, and links (index-based only per guide).
- Reconcile **`auraClass`** with whatever class names appear on the section wrapper in UE (may be `class` on `.youmayalsolike` or outer wrapper).
- Document the **DOM contract** in a short comment or test fixture string derived from pasted HTML (no new markdown file unless the team asks).

### Human test — Phase B

- [ ] Compare pasted HTML to authored content in UE (no manual edits to DOM assumptions without re-export).

---

## 7. Phase C — Frontend (JS + CSS)

**Prerequisite:** Phase B HTML received and index mapping documented.

**Files:** `blocks/youmayalsolike/youmayalsolike.js`, `blocks/youmayalsolike/youmayalsolike.css` only (same basename as folder — [guide Quick Reference](../../../implementation-guide.md)).

**JavaScript (`decorate`) — planned behaviors:**

1. **Card count:** If **&lt;2** child rows/items after decoration start, **do not render** the block (e.g. remove from DOM or empty block per project convention — align with how other blocks hide; **confidence 92%** until UE structure is seen).
2. If **&gt;3** items, process **only first three** ([requirements §4](../../../../../../requirements/youmayalsolike.md)).
3. **Aura:** Apply selected aura as **class on the block element** (or transfer from first row if UE places it elsewhere) — match requirements §7.
4. **Accessibility:** One **logical** link per card (whole card clickable); if mobile markup includes a visible “Read more”, avoid duplicate tab stops (e.g. single `<a>` wrapping card content or `aria-hidden` on decorative duplicate — **finalize after HTML**).
5. **Pictures:** Use `createOptimizedPicture` from [`scripts/aem.js`](../../../../../../scripts/aem.js) and `moveInstrumentation` from [`scripts/scripts.js`](../../../../../../scripts/scripts.js) like [`blocks/cards/cards.js`](../../../../../../blocks/cards/cards.js).
6. **Complexity:** Keep `decorate()` and helpers within ESLint / Sonar cognitive complexity rules ([guide Appendix E](../../../implementation-guide.md)).

**CSS — planned behaviors:**

1. **Grid:**  
   - **Desktop (≥1280px):** 3 cards → 3 columns; 2 cards → 2 columns (~50% each), centered or full width per design parity with Figma.  
   - **Tablet (768–1279px):** **2 columns** for both 2- and 3-card cases ([requirements table](../../../../../../requirements/youmayalsolike.md)).  
   - **Mobile (&lt;768px):** 1 column; **show** “Read more” row; **hide** or visually de-emphasize on larger breakpoints if UE supplies that element only for mobile (match Figma: present on mobile frame `1:1703`, absent on desktop card content in `1:1691`).
2. **Card:** `border-radius`, `overflow`, image `object-fit: cover`, **gradient overlay** (linear-gradient bottom-heavy).
3. **Title:** Line clamp (multi-line truncation) with consistent `-webkit-line-clamp` / fallback per browser support.
4. **Typography:** Map to project fonts ([`styles/fonts.css`](../../../../../../styles/fonts.css) / design system); use **TCCC Unity Headline** where already declared — **confidence 88%** until UE + `styles` are cross-checked.
5. **Aura classes:** Implement background/gradient for `aura-creative`, `aura-health`, `aura-sustainability`, `aura-light`, `aura-dark` on **`.youmayalsolike`** (or agreed wrapper). Today only partial token naming exists in [`styles/styles.css`](../../../../../../styles/styles.css) (`--range-aura-*`); **extend CSS** as needed — tokens may need design sign-off.

**Automated:** `npm run test` for `blocks/youmayalsolike/youmayalsolike.test.js`; `npm run lint`.

### Human test — Phase C

- [ ] Local preview: 2 cards and 3 cards at **~375px**, **~900px**, **~1440px** widths; confirm column rules and spacing vs Figma.
- [ ] **&lt;2 cards:** block should not appear (requirements §4).
- [ ] **&gt;3 cards:** only three visible.
- [ ] Keyboard: one focusable control per card; **Enter** activates navigation.
- [ ] Lighthouse / performance: optimized images loading (EDS best practices in guide Appendix A).

---

## 8. Phase D — Review, approval, and completion checklist

- [ ] **Stakeholder approval** of this plan (or v2 if scope changes).
- [ ] All Phase A–C **human tests** executed and noted.
- [ ] **No Step 3 work** started before Phase B HTML delivery (guide governance).
- [ ] **Reasoning summary:** Implementation follows the guide’s ordered workflow, reuses established block JSON and `decorate` patterns from the repo, encodes requirements §4–§7, and uses Figma for visual parity with explicit tablet uncertainty called out for design follow-up.

---

## 9. Open points (resolve during execution)

| Topic | Owner | Notes |
|--------|--------|--------|
| Incomplete “Example HTML Output” in requirements | Author / PO | Prefer pasting UE HTML in Phase B |
| Tablet-specific Figma | Design | Using §4 + `768px`/`1280px` until comps exist |
| Exact aura visual specs | Design | Requirements list class names only; CSS to be filled to match brand |
| i18n for “Read more” | Product | Default English from Figma; extend if MSaaS needs dictionaries |

---

## 10. References (clickable)

- [EDS creating-eds-block implementation guide](../../../implementation-guide.md)
- [You may also like requirements](../../../../../../requirements/youmayalsolike.md)
- [Cards block JSON (reference)](../../../../../../blocks/cards/_cards.json)
- [Cards decorate (reference)](../../../../../../blocks/cards/cards.js)
- [Feature Cards Carousel JSON (reference)](../../../../../../blocks/featurecardscarousel/_featurecardscarousel.json)
- [Global breakpoints — `styles.css`](../../../../../../styles/styles.css)
