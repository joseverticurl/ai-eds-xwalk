# Implementation Plan: Homepage Carousel

**Guide:** [eds-guide / EDS-2026.1.0 / creating-eds-block](../../../implementation-guide.md)  
**Specific functionality:** `homepagecarousel` (aligned with [specs/requirements/homepagecarousel.md](../../../../../../../requirements/homepagecarousel.md); corrects requested slug spelling `hompagecarousel`)  

**Date:** 2026-03-27  
**Version:** v1  

**Requirements:** [specs/requirements/homepagecarousel.md](../../../../../../../requirements/homepagecarousel.md)  

**Design (Figma — Components · TCCC):**  
- [Desktop / dev mode](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=241-1640&m=dev)  
- [Mobile — same node](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=241-1640&m=dev)  

*Design notes from Figma MCP (`241:1640`): split layout — left static headline stack (four lines, alternating alignments: left / right / center / left per mock), right “Cards / Hero” rounded card with media, category pill, headline, outline CTA, vertical brand icon column; off-white page background with large soft gradient “aura” ellipses and noise mask. Typography tokens: TCCC Unity Headline Medium at ~12 / 38 / 16 / 72px for label, in-card headline, CTA, and left titles.*

**Reference blocks in repo:**  
- [blocks/featurecardscarousel](../../../../../../../blocks/featurecardscarousel) — parent/child JSON, Swiper, `featurecardscarousel.test.js`  
- [blocks/textwithimage](../../../../../../../blocks/textwithimage) — `mediaType` select + `reference` media pattern  

---

## Summary

Deliver an EDS **homepagecarousel** block: desktop two-column hero (left **section headline**, right **slide carousel** with media, tag, multi-paragraph copy, CTA, brand icons as nav + progress); mobile hides left headline, full-width carousel with **horizontal** brand icons above. Autoplay interval, loop, and aura/gradient behaviors are author-configurable per requirements. Implementation follows the guide’s **backend → user HTML → frontend** order, with **no AI-generated HTML** before Universal Editor output exists.

---

## Confidence and gaps

| Topic | Confidence | Note |
|--------|------------|------|
| Overall fit to EDS block + XWalk patterns | **96%** | Matches existing parent/child + Swiper guidance ([implementation guide — Pattern 7](../../../implementation-guide.md#pattern-7-carousel-block-with-swiper)). |
| Figma desktop layout | **92%** | Single node provided; aligns with requirements desktop description. |
| Figma mobile layout | **70%** | Mobile URL duplicates desktop node; mobile layout per **requirements** (icons above, no left column) — confirm with a **mobile frame** in Figma when available. |
| `auraGradient` / `overlayGradient` authoring | **78%** | Native “gradient” fields depend on UE field types; may need `select` presets, `text` (CSS custom props), or `richtext` — **confirm in Universal Editor** after model draft. |
| `paragraphs` + automatic L/R/C alignment | **82%** | Final contract comes from **user-provided HTML** (Step 2); plan assumes `richtext` or multiple cells — adjust indices after HTML. |
| `boolean` fields (`autoplay`, `loopSlides`, `enableAuraEffect`) | **88%** | No `boolean` in existing `blocks/*/_*.json`; Experience League supports boolean — validate with `npm run build:json` and UE; fallback: `select` true/false. |

---

## TDD approach

1. **Red:** Add `blocks/homepagecarousel/homepagecarousel.test.js` with cases for structure extraction, early exits (e.g. &lt; 2 slides), autoplay config wiring, and icon navigation (mock `globalThis.Swiper` and `aem.js` like [featurecardscarousel.test.js](../../../../../../../blocks/featurecardscarousel/featurecardscarousel.test.js)).  
2. **Green:** Implement `decorate()` until tests pass.  
3. **Refactor:** Keep cognitive complexity within guide/Sonar guidance; run `npm run lint`.  

**Human verification** is still required after each phase (authoring, local preview, breakpoints) — automated tests do not replace UE or design QA.

---

## Implementation tasks

### Phase 0: Pre-implementation

- [ ] **0.1** Read [implementation guide](../../../implementation-guide.md) Part 1–3 and [Pattern 7: Carousel](../../../implementation-guide.md#pattern-7-carousel-block-with-swiper).  
- [ ] **0.2** Re-review [requirements](../../../../../../../requirements/homepagecarousel.md) and Figma `241:1640`; optional: add a **dedicated mobile frame** link to this plan when design provides it.  

**Human test:** [ ] Confirm Figma file access and that requirements + design intent match stakeholder expectations.  

---

### Phase 1: Backend — XWalk configuration (Step 1 only)

**Reference:** [Part 2: Backend](../../../implementation-guide.md#part-2-backend-code-generation)

#### Step 1.1: Block-level JSON file

- [ ] **1.1.1** Add `blocks/homepagecarousel/_homepagecarousel.json` with:  
  - **Parent definition** `homepagecarousel`: `resourceType` `core/franklin/components/block/v1/block`, `template.name` e.g. `HomepageCarousel`, `model` `homepagecarousel`, `filter` `homepagecarousel`.  
  - **Child definition** `homepagecarouselitem`: `resourceType` `core/franklin/components/block/v1/block/item`, `template.name` e.g. `HomepageCarouselItem`, `model` `homepagecarouselitem`.  
- [ ] **1.1.2** Add **filter** `{ "id": "homepagecarousel", "components": ["homepagecarouselitem"] }`.  

**Human test:** [ ] Run `npm run build:json`; confirm `component-definition.json` and `component-filters.json` include the new block and filter.  

---

#### Step 1.2: Parent model `homepagecarousel`

Field **order** must match eventual default row order in authored HTML (adjust only after Step 2 if UE emits different order).

| # | `name` | Component | Notes |
|---|--------|-----------|--------|
| 1 | `sectionHeadline` | `richtext` or `text` | Requirements: desktop left column; multi-line acceptable — prefer `richtext` if authors need line breaks; otherwise `text` + CSS. |
| 2 | `transitionDuration` | `number` | Seconds; default e.g. `5`. |
| 3 | `autoplay` | `boolean` or `select` | If UE lint fails, use `select` On/Off. |
| 4 | `loopSlides` | `boolean` or `select` | Maps to Swiper `loop`. |
| 5 | `enableAuraEffect` | `boolean` or `select` | Toggles page-level / block-level aura visuals. |
| 6 | `auraGradient` | `text` / `select`\* | \*Or project-supported color/gradient field; document chosen type in JSDoc once confirmed. |

- [ ] **1.2.1** Implement parent `models` entry with the above fields; validate JSON with project ESLint rules.  

**Human test:** [ ] After merge of `_homepagecarousel.json`, run `npm run build:json` and inspect `component-models.json` for `homepagecarousel`.  

---

#### Step 1.3: Child model `homepagecarouselitem`

| # | `name` | Component | Notes |
|---|--------|-----------|--------|
| 1 | `mediaType` | `select` | Options: `image`, `video` (same idea as [textwithimage](../../../../../../../blocks/textwithimage/_textwithimage.json)). |
| 2 | `image` | `reference` | Hero image when `mediaType=image`. |
| 3 | `video` | `reference` | Optional video asset when `mediaType=video`; implement `<video muted playsinline autoplay loop>` in frontend per requirements. |
| 4 | `categoryTag` | `text` | Optional pill (e.g. “News”). |
| 5 | `paragraphs` | `richtext` | Multiple `<p>`; alignment pattern applied in JS/CSS per requirements — **final mapping from Step 2 HTML**. |
| 6 | `ctaLabel` | `text` | |
| 7 | `ctaLink` | `aem-content` | Match project CTA pattern ([featurecardscarousel](../../../../../../../blocks/featurecardscarousel/_featurecardscarousel.json) uses `aem-content`). |
| 8 | `brandIcon` | `reference` | Icon for slide + pagination control. |
| 9 | `brandIconAlt` | `text` | Accessibility. |
| 10 | `overlayGradient` | `text` / `select`\* | Per-slide readability overlay; confirm field type in UE. |

- [ ] **1.3.1** Add child model fields; ensure `imageAlt` is **not** required on child if hero alt is derived elsewhere — requirements say all images need alt: add **`imageAlt`** on child if image is decorative vs informative (product decision).  

**Human test:** [ ] `npm run build:json`; verify `homepagecarouselitem` in `component-models.json`.  

---

#### Step 1.4: Section allowlist

- [ ] **1.4.1** Edit [models/_section.json](../../../../../../../models/_section.json) `filters` → `section` → `components`: append `"homepagecarousel"` (comma-separated, valid JSON).  

**Human test:** [ ] `npm run build:json`; confirm section filter lists `homepagecarousel`.  

---

#### Step 1.5: Authoring smoke test (backend complete)

- [ ] **1.5.1** Deploy/sync JSON to AEM / UE per team process.  

**Human test:** [ ] In **Universal Editor**, insert Homepage Carousel, add **at least two** child slides, fill parent + child fields (including video on one slide), save — confirm no model errors.  

---

### Phase 2: User provides semantic HTML (MANDATORY checkpoint — STOP)

**Reference:** [Step 2: User provides semantic HTML](../../../implementation-guide.md#step-2-user-provides-semantic-html)

**CRITICAL:** Do **not** generate standalone block HTML in Cursor, and do **not** start `homepagecarousel.js` / `.css` until real HTML exists.

- [ ] **2.1** Author a representative block in Universal Editor: multiple slides, image + video slide, long/short copy, with/without category tag, aura on/off if toggles exist.  
- [ ] **2.2** User pastes **actual** rendered HTML (view source / DevTools copy of the block DOM).  
- [ ] **2.3** Document **structure contract** in JSDoc template (indices for parent rows, per-slide row cells, how `richtext` paragraphs appear, empty field behavior).  
- [ ] **2.4 WAIT** — AI/developer does not proceed to Phase 3 until **2.2–2.3** are done.  

**Human test:** [ ] Peer-review the written structure contract against the pasted HTML for index mistakes.  

---

### Phase 3: Frontend — JavaScript (Step 3)

**Reference:** [Part 3b: JavaScript](../../../implementation-guide.md#part-3b-javascript-implementation)

#### Step 3.1: Files

- [ ] **3.1.1** Add `blocks/homepagecarousel/homepagecarousel.js`.  
- [ ] **3.1.2** Add `blocks/homepagecarousel/homepagecarousel.css`.  
- [ ] **3.1.3** Exactly **one** JS and **one** CSS file (folder name = `homepagecarousel`).  

**Human test:** [ ] Local preview loads block without 404 for block assets.  

---

#### Step 3.2: Tests first (Vitest)

- [ ] **3.2.1** Add `homepagecarousel.test.js`: mock `loadScript` / `loadCSS` / `createOptimizedPicture` / `moveInstrumentation`; mock `Swiper`.  
- [ ] **3.2.2** Cases: insufficient slides; successful decorate; `transitionDuration` passed into autoplay; `loopSlides` toggles Swiper `loop`; clicking brand icon invokes `slideTo`; manual click resets progress timer (via `swiper.emit` or spy on autoplay API).  
- [ ] **3.2.3** Run `npm test` — all green.  

**Human test:** [ ] Run `npm test` locally and attach results to PR.  

---

#### Step 3.3: `decorate()` implementation

- [ ] **3.3.1** JSDoc **structure contract** from Phase 2 (index-based only — no `data-*` selectors per guide).  
- [ ] **3.3.2** Parse parent: headline, timing, autoplay, loop, aura flags, aura gradient token.  
- [ ] **3.3.3** Parse each child: media type, picture/video, tag, paragraphs (apply **L → R → C** repeating pattern to generated `<p>` if not already in HTML), CTA link + label, brand icon + alt.  
- [ ] **3.3.4** **Layout grid:** Use `container` / `row` / `col-*` for **static** two-column shell (headline column + carousel column) on desktop per [layout grid](../../../implementation-guide.md#layout-grid-global-design-system-classes). **Do not** put grid classes on Swiper root, `.swiper-wrapper`, or `.swiper-slide` ([Pattern 7 exception](../../../implementation-guide.md#pattern-7-carousel-block-with-swiper)).  
- [ ] **3.3.5** Build Swiper: one slide per child; `slidesPerView: 1`; brand icons as **custom pagination** (or linked thumbs) — active slide shows **progress animation** for `transitionDuration` then advances if `autoplay`.  
- [ ] **3.3.6** Manual icon click: `slideTo(index)` and reset autoplay timer (`swiper.autoplay.stop(); swiper.autoplay.start()` or equivalent).  
- [ ] **3.3.7** Video slide: muted, autoplay, loop, responsive object-fit; poster/fallback if provided.  
- [ ] **3.3.8** `moveInstrumentation()` on all DOM moves that replace authoring cells.  
- [ ] **3.3.9** Images: `createOptimizedPicture()` for image backgrounds where applicable.  

**Human test:** [ ] In browser: autoplay, loop, pause-on-interaction (if required), icon sync, keyboard focus on CTA and icons (add appropriate `button`/`role`/`aria` for icon nav).  

---

#### Step 3.4: Responsive behavior

- [ ] **3.4.1** Desktop: two columns; icons vertical (Figma).  
- [ ] **3.4.2** Mobile: hide left headline wrapper; reorder DOM so brand icons sit **above** carousel (CSS `order` or separate branches — prefer one DOM with responsive CSS if possible).  

**Human test:** [ ] Resize 390 / 768 / 1280+ viewports; compare to Figma and requirements.  

---

### Phase 4: Frontend — CSS

**Reference:** [Part 3c: CSS](../../../implementation-guide.md#part-3c-css-implementation)

- [ ] **4.1.1** Block scoped BEM-style classes (e.g. `.homepagecarousel__…`); **no** selectors targeting global `.row` / `.col-*` in block CSS per guide.  
- [ ] **4.1.2** Aura / noise / soft gradients: implement when `enableAuraEffect`; use tokens / CSS variables where project already defines them.  
- [ ] **4.1.3** Card: radius ~24px, shadow, overlay gradient for text legibility.  
- [ ] **4.1.4** Left headline: match Figma line breaks and alignments (left / right / center pattern).  
- [ ] **4.1.5** Brand icon progress: CSS `@keyframes` (e.g. conic-gradient or circular timer) tied to `--homepagecarousel-duration` set from `transitionDuration`.  
- [ ] **4.1.6** Focus states and contrast (WCAG) for CTA and icon controls.  

**Human test:** [ ] Side-by-side with Figma at desktop width; verify spacing, typography scale, and icon column.  

---

### Phase 5: Integration and quality gate

- [ ] **5.1** `npm run lint` — ESLint + Stylelint clean.  
- [ ] **5.2** `npm test` — all tests pass.  
- [ ] **5.3** `npm run build:json` — if JSON touched.  
- [ ] **5.4** UE end-to-end: author, publish, verify published page.  
- [ ] **5.5** Optional: Lighthouse on page with block (perf per [implementation guide](../../../implementation-guide.md) appendices).  

**Human test:** [ ] Full acceptance checklist from [requirements](../../../../../../../requirements/homepagecarousel.md#acceptance-criteria) signed off.  

---

## Assumptions and decisions log

| Item | Decision |
|------|-----------|
| Block folder / ids | `homepagecarousel` + `homepagecarouselitem`; filenames `homepagecarousel.js` / `homepagecarousel.css`. |
| Carousel library | Swiper 11 via `loadScript` / `loadCSS` from block ([Pattern 7](../../../implementation-guide.md#pattern-7-carousel-block-with-swiper)). |
| CTA link field | `aem-content` for `ctaLink` (consistent with featurecardscarousel). |
| Requirements doc | Single source of truth: [homepagecarousel.md](../../../../../../../requirements/homepagecarousel.md). |
| Figma | Desktop/mobile both pointed to node `241-1640`; treat **requirements** as authority for mobile layout until a distinct mobile node is linked. |
| Slug spelling | Plan uses `homepagecarousel`; rename folder if product mandates literal `hompagecarousel`. |

---

## Traceability (requirements → work)

| Requirement | Plan location |
|-------------|----------------|
| Multiple slides, image/video | Phase 1 child model; Phase 3 media branching |
| Configurable duration, autoplay, loop | Phase 1 parent fields; Phase 3 Swiper config |
| Brand icons + progress | Phase 3 custom pagination + CSS |
| Desktop headline + carousel / mobile hide headline | Phase 3–4 layout |
| Multi-paragraph + alignment pattern | Phase 2 HTML contract; Phase 3 paragraph styling |
| Aura / gradient | Phase 1 `enableAuraEffect` / `auraGradient`; Phase 4 CSS |
| Accessibility | Alt fields; video muted; keyboard/ARIA in Phase 3–4 |

---

## References

- [Implementation guide](../../../implementation-guide.md)  
- [Requirements — homepagecarousel](../../../../../../../requirements/homepagecarousel.md)  
- [Figma — node 241-1640](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=241-1640&m=dev)  
- [blocks/featurecardscarousel](../../../../../../../blocks/featurecardscarousel)  
- [blocks/textwithimage](../../../../../../../blocks/textwithimage)  

---

## Plan approval

- [x] Author / tech lead reviewed this plan  
- [ ] Figma mobile frame link updated (if/when separate from desktop) — optional; requirements cover mobile until design adds a frame  
- [x] Proceed to Phase 1 execution only after approval  

**Approved by:** Author (chat) **Date:** 2026-03-27  
