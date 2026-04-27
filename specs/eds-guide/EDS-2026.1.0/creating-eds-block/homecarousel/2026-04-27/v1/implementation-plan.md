# Implementation plan: `homecarousel` block

**Guide:** [creating-eds-block](../../../implementation-guide.md)  
**Guide version:** EDS-2026.1.0  
**Specific functionality:** `homecarousel`  
**Plan version:** v1  
**Date:** 2026-04-27  

**Requirements (source of truth for behavior):** [specs/requirements/homepagecarousel.md](../../../../../../requirements/homepagecarousel.md)  
*(File name is `homepagecarousel`; block folder and implementation id are **`homecarousel`**, per your selection.)*  

**Design (visual reference; not a substitute for Universal Editor HTML):**  
- **Desktop:** [Figma — `01_D_Homepage`, node `241-1640`](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=241-1640&m=dev)  
- **Mobile:** [Figma — `01_M_Home Intro 3`, node `241-2289`](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=241-2289&m=dev)  
- **File key:** `1uWBLEcq2rARuQXFnsqdQD`  

**Code references (see guide [Pattern 7: Carousel with Swiper](../../../implementation-guide.md#pattern-7-carousel-block-with-swiper)):**  
- [blocks/featurecardscarousel/featurecardscarousel.js](../../../../../../../blocks/featurecardscarousel/featurecardscarousel.js) — Swiper, `loadScript`/`loadCSS`, timed progress on bullets (adapt for **circular** brand “thumb” nav).  
- [blocks/featurecardscarousel/_featurecardscarousel.json](../../../../../../../blocks/featurecardscarousel/_featurecardscarousel.json) — parent + item definitions, `filters`.  

**Confidence (this plan vs. guide + repo + Figma + requirements):** **92%** — Fine-grained XWalk field component types for gradient/aura may need one reconciliation pass with Experience League / [AEM content modeling](https://www.aem.live/developer/component-model-definitions) after authoring the block in Universal Editor. **100%** on process order: backend → **mandatory** UE HTML → JS/CSS.  

---

## 1. Purpose and success criteria

Deliver an Edge Delivery block **`homecarousel`** that:

1. Presents a **hero carousel**: multiple slides, each with **image or video** background, optional **category** tag, **multi-line body** (paragraphs as separate `<p>` with **cycling alignment**: left → right → center → repeat, per [Text Content Behavior](../../../../../../requirements/homepagecarousel.md#text-content-behavior)), **CTA** (label + link), and a **brand icon** that doubles as **navigation + active progress** (circular or ring fill matching Figma).  
2. Exposes **block-level** controls: `sectionHeadline` (visible **desktop only**; **hidden on mobile** per [Mobile](../../../../../../requirements/homepagecarousel.md#mobile)), `transitionDuration`, `autoplay`, `loopSlides`, and aura/gradient toggles as in the [Authoring table](../../../../../../requirements/homepagecarousel.md#authoring-fields-universal-editor).  
3. **Desktop layout:** [left column = static headline; right = carousel](../../../../../../requirements/homepagecarousel.md#desktop) — align with Figma **desktop** node (`241:1640`: four-line headline “We refresh / the world / …” at 72px; hero card **670×660**-style region, 24px radius, vertical **50px** brand column).  
4. **Mobile layout:** [no left headline; full-width carousel; horizontal brand row **above** the slide](../../../../../../requirements/homepagecarousel.md#mobile) — align with Figma **mobile** node (`241:2289`: **40px** icons, **16px** card radius, 28px headline, progress ring on active icon as in design review).  
5. Meets [Accessibility](../../../../../../requirements/homepagecarousel.md#accessibility) (alt text, focusable CTA, muted autoplay for video, contrast).  
6. Follows the guide’s **3-step order**: **Backend → user-provided semantic HTML (stop) → JS/CSS** ([Quick Reference](../../../implementation-guide.md#quick-reference)). **Do not** generate or assume production HTML in Cursor before Universal Editor output exists.  

**Why this matches the goal:** The plan is anchored to the signed [requirements doc](../../../../../../requirements/homepagecarousel.md), uses Figma only as **typography, spacing, and layout** hints, and enforces the [implementation guide’s](../../../implementation-guide.md#purpose-and-scope) proven sequence so DOM structure, instrumentation, and index-based `decorate` logic stay aligned with what AEM actually publishes.  

---

## 2. Traceability

| Item | Source |
|------|--------|
| Process order (backend → UE HTML → JS/CSS) | [Implementation guide: Purpose and scope](../../../implementation-guide.md#purpose-and-scope) |
| One block folder, `homecarousel.js` + `homecarousel.css` | [Quick Reference](../../../implementation-guide.md#quick-reference) |
| Block-level `_homecarousel.json`, `npm run build:json` | [Part 2](../../../implementation-guide.md#part-2-backend-code-generation); [package.json](../../../../../../../package.json) |
| Swiper in block via `loadCSS` / `loadScript` | [Pattern 7](../../../implementation-guide.md#pattern-7-carousel-block-with-swiper) |
| `createOptimizedPicture`, `moveInstrumentation` | [Part 3a / patterns](../../../implementation-guide.md#part-3-frontend-code-generation) |
| Parent + `homecarouselitem` + `filters` | [\_featurecardscarousel.json](../../../../../../../blocks/featurecardscarousel/_featurecardscarousel.json) |
| Register block in section | [models/\_section.json](../../../../../../../models/_section.json) (add `homecarousel` to section `components` list when implementing) |
| Unit tests (Vitest + `test/helpers.js`) | e.g. [youmayalsolike.test.js](../../../../../../../blocks/youmayalsolike/youmayalsolike.test.js), [featurecardscarousel.test.js](../../../../../../../blocks/featurecardscarousel/featurecardscarousel.test.js) |

---

## 3. Design notes (Figma — reference only)

> **Do not** treat this as implementable without [Checkpoint A — Universal Editor HTML](#checkpoint-a--wait-user-provides-semantic-html). Figma’s React export uses Tailwind; this project does **not** add Tailwind per [guide and Figma MCP instructions](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC).

| Topic | Desktop (`241:1640`) | Mobile (`241:2289`) | Implementation hint |
|-------|----------------------|--------------------|--------------------|
| Page background | Off-white; layered rotated ellipses + noise mask | Same family, narrower artboard | Map to `enableAuraEffect` + CSS (no hard-coded Figma asset URLs in production; use author media / tokens) |
| Headline (section) | Four lines, TCCC Unity Headline **Medium 72px**, staggered L / R / C / L, black, ~570px column left | *Column absent in frame* (matches “hide on mobile”) | `sectionHeadline` may be one richtext or four text fields — **depends on UE HTML** |
| Hero card | Rounded **24px**, shadow, dark hero image, badge, **38px** white body, secondary outline CTA, **vertical 50px** brand stack + decorative icon | Rounded **16px**, full-bleed card; **28px** body; **horizontal 40px** brands **above** text; active slide shows **progress ring** on icon | Swiper: `slidesPerView: 1`; duplicate nav into desktop column vs mobile top row via CSS + markup |
| Brand icons | 5 × 50px; active state + icon (per component instance) | 5 × 40px; gap 16px; progress on active | Click sets slide + **resets** autoplay timer per [User Experience](../../../../../../requirements/homepagecarousel.md#desktop) |
| Typography tokens | Label XS 12px badge; Headline 4 38px; Label L 16px CTA | M Headline 4 28px; 16px CTA | Align with [styles/fonts.css](../../../../../../../styles/fonts.css) / existing TCCC font-face |

**Tablet:** No dedicated Figma node; interpolate breakpoints between mobile and desktop using existing project CSS variables in `styles/` (similar to [youmayalsolike plan — tablet](../../../youmayalsolike/2026-04-27/v1/implementation-plan.md#3-design-notes-figma--reference-only)).  

---

## 4. Proposed content model (Step 1 — validate after UE export)

> Field order must match **row order in Universal Editor** output. The table below is the **straw man** for `_homecarousel.json`, derived from the [requirements authoring tables](../../../../../../requirements/homepagecarousel.md#authoring-fields-universal-editor). Reconcile **indices** in JSDoc after Checkpoint A. Use **index-based** DOM traversal only (guide: no `data-*` selectors for structure).

### Definitions

- **Block:** `homecarousel` (template name `HomeCarousel`, `model: homecarousel`, `filter: homecarousel`).  
- **Item block:** `homecarouselitem` (resource type `…/block/item`); allowed only as child in filter (same pattern as [featurecardscarouselitem](../../../../../../../blocks/featurecardscarousel/_featurecardscarousel.json)).  

### Model `homecarousel` (parent fields, proposed)

| Field | Component (proposal) | Notes |
|-------|----------------------|--------|
| `sectionHeadline` | `richtext` or `text` | Desktop-only display; if UE outputs multiple `<p>` for staggered lines, `decorate` maps to the four-line layout. |
| `transitionDuration` | `number` | Seconds (e.g. 3, 5); maps to Swiper `delay` and CSS animation duration for icon progress. |
| `autoplay` | `boolean` | If false, no auto advance; icon progress may be static on active. |
| `loopSlides` | `boolean` | Swiper `loop`. |
| `enableAuraEffect` | `boolean` | Toggles class or section background treatment. |
| `auraGradient` | `text` or `select` *or* `multiselect` | Depends on what UE supports; may encode preset token (e.g. `aura-creative`) — **revisit at Checkpoint A** if a dedicated gradient field is unavailable. |

### Model `homecarouselitem` (slide row fields, proposed)

| Field | Component (proposal) | Notes |
|-------|----------------------|--------|
| `mediaType` | `select` | `image` \| `video` |
| `image` | `reference` | Background image; use `createOptimizedPicture` for picture paths. |
| `video` | `reference` or `text` (URL) | Muted, loop, playsinline; validate against project video patterns. |
| `categoryTag` | `text` | Optional pill. |
| `paragraphs` | `richtext` | **Must** become multiple `<p>`; apply alignment classes in JS by **index** pattern (left, right, center, …). |
| `ctaLabel` | `text` | |
| `ctaLink` | `aem-content` | External vs internal per project. |
| `brandIcon` | `reference` | 50/40px circular asset; `brandIconAlt` **text** for a11y. |
| `overlayGradient` | `text` *or* optional token | For slide legibility; if unsupported, use CSS only. |

**Filter:** `{"id": "homecarousel", "components": ["homecarouselitem"]}`.  

**Section registration:** add `"homecarousel"` to the section filter’s `components` array in [models/\_section.json](../../../../../../../models/_section.json) (same position style as `featurecardscarousel` / `youmayalsolike`).  

---

## 5. Phased tasks (TDD-oriented + human checkpoints)

### Phase 0 — Prerequisites

| # | Task | Owner | Done when |
|---|------|--------|-----------|
| 0.1 | Stakeholder sign-off: **Figma** nodes above are the correct hero variant (desktop + mobile) | Team | Link recorded in this plan / PR |
| 0.2 | Confirm how **paragraph** alignment is produced in UE (single richtext vs many text components) | Author + dev | Affects JSDoc row contract |

**Human test (0.H1):** Walk through [requirements AC](../../../../../../requirements/homepagecarousel.md#acceptance-criteria) and this plan with product/design.  

---

### Phase 1 — Backend (XWalk JSON + build)

| # | Task | Owner | Done when |
|---|------|--------|-----------|
| 1.1 | Add `blocks/homecarousel/_homecarousel.json` with `definitions`, `models` (`homecarousel`, `homecarouselitem`), `filters` | Dev | File follows [\_featurecardscarousel.json](../../../../../../../blocks/featurecardscarousel/_featurecardscarousel.json) shape. |
| 1.2 | Add `homecarousel` to [models/\_section.json](../../../../../../../models/_section.json) | Dev | Block appears in section allowed components. |
| 1.3 | Run `npm run build:json` | Dev | Merged [component-models.json](../../../../../../../component-models.json), [component-definition.json](../../../../../../../component-definition.json), [component-filters.json](../../../../../../../component-filters.json) include `homecarousel` / `homecarouselitem` / filter. |
| 1.4 | (Optional) Stub `homecarousel.js` + `homecarousel.css` with minimal `export default async function decorate` no-op to avoid 404 in local preview — **or** wait until Phase 2; if stubbed, treat as throwaway. | Dev | No visual regression. |

**Human test (1.H1):** `npm run build:json` completes with no errors.  

**Human test (1.H2):** In Universal Editor, insert **Home Carousel** (or equivalent title), add **≥ 2** slides, fill fields; **publish/preview** pipeline produces HTML.  

---

### Checkpoint A — **WAIT: user provides semantic HTML**

> **CRITICAL (guide + EDS command):** **Stop here.** **Do not** author production HTML in Cursor, and **do not** implement real `homecarousel` decoration until the user **pastes the actual block HTML** from Universal Editor (or preview DOM). The AI validates **structure contract** (row/column order, `wrapTextNodes` behavior) and only then implements JS/CSS.  
> *Reference:* [Step 2: User provides semantic HTML](../../../implementation-guide.md#step-2-user-provides-semantic-html).  

| # | Task | Owner | Done when |
|---|------|--------|-----------|
| A.1 | User pastes **full** `<div class="homecarousel">…` (or class name UE emits) from preview | **User** | HTML saved e.g. under `specs/requirements/homecarousel-ue.html` (optional) or in ticket |
| A.2 | Document **JSDoc structure contract** in `homecarousel.js` (index for headline row, config rows, item rows, cells for media, paragraphs, CTA, icon) | Dev | Contract reviewed against pasted HTML |
| A.3 | Reconcile [§4 Proposed content model](#4-proposed-content-model-step-1--validate-after-ue-export) if field order differs from HTML | Dev | `_homecarousel.json` + build updated if needed |

**Human test (A.H1):** Open DevTools on preview; confirm static HTML before JS matches expectations (rows, `picture`/`img`, `a`, richtext wrappers).  

---

### Phase 2 — Frontend (after Checkpoint A)

| # | Task | Owner | Notes |
|---|------|--------|--------|
| 2.1 | Implement `decorate(block)` in [blocks/homecarousel/homecarousel.js](../../../../../../../blocks/homecarousel/homecarousel.js) | Dev | `loadCSS` / `loadScript` Swiper 11; `moveInstrumentation` on every replacement; build desktop **two-column** + mobile **icon rail top** in DOM. |
| 2.2 | **Slideshow behavior** | Dev | `autoplay` + `transitionDuration` + `loopSlides`; on slide change, sync **active brand** and **reset** timer; manual click on icon → `slideTo` + reset. |
| 2.3 | **Progress animation** on active brand icon | Dev | Reuse ideas from [featurecardscarousel bullet progress](../../../../../../../blocks/featurecardscarousel/featurecardscarousel.js) (CSS keyframes + duration variable) — **circle** for this design. |
| 2.4 | **Paragraph alignment** | Dev | `nth` `p` in slide body: `align-left` / `align-right` / `align-center` cycling per [requirements table](../../../../../../requirements/homepagecarousel.md#text-content-behavior). |
| 2.5 | **Video** slides | Dev | Muted, `loop`, `playsinline`, `autoplay` where allowed; poster/fallback if needed. |
| 2.6 | `homecarousel.css` | Dev | Desktop: match Figma spacing/radius/shadow; mobile: full width, 16px radius, icon row. Hide `.homecarousel-headline` (or equivalent) with `@media (max-width: …)` consistent with project breakpoints. |
| 2.7 | Aura / noise / gradient | Dev | Gated by `enableAuraEffect` + `auraGradient` (or class); avoid Figma’s temporary 7-day asset URLs. |

**Human test (2.H1):** Local preview: **desktop** = headline + card + vertical icons; **mobile** = no headline, horizontal icons, one slide visible.  

**Human test (2.H2):** **Keyboard:** Tab to CTA and brand buttons; **screen reader:** active slide and progress announced if project pattern exists.  

**Human test (2.H3):** **Video** slide: autoplay muted, no unmuted autoplay.  

---

### Phase 3 — automated tests (TDD focus)

> Write/extend tests **as behavior is implemented**; don’t wait until the end.  

| # | Task | Owner | Notes |
|---|------|--------|--------|
| 3.1 | `homecarousel.test.js` (Vitest) | Dev | Mock `aem.js` and `moveInstrumentation` like [youmayalsolike.test.js](../../../../../../../blocks/youmayalsolike/youmayalsolike.test.js). |
| 3.2 | Tests: &lt; 2 items → no carousel / block hidden (if product rule matches) | Dev | Match requirements “multiple slides” (define minimum 2 in contract). |
| 3.3 | Tests: paragraph classes applied in L/R/C order for `n` paragraphs | Dev | Pure function extractable for clarity. |
| 3.4 | Tests: (optional) mock Swiper — assert config passed, or assert DOM has `.swiper` after `decorate` with dynamic import mocks | Dev | If brittle, focus on **alignment** + **branching** logic unit tests. |

**Human test (3.H1):** `npm test` (or project’s test script) — all tests green.  

---

### Phase 4 — Performance and validation

| # | Task | Owner | Notes |
|---|------|--------|--------|
| 4.1 | Images via `createOptimizedPicture` with widths appropriate for 670/335px card | Dev | [Appendix A — Lighthouse](../../../implementation-guide.md#appendix-a-eds-performance--lighthouse-best-practices) if referenced in guide |
| 4.2 | **No** add Swiper to `head.html` | Dev | Block-local load only. |

**Human test (4.H1):** Lighthouse spot-check (LCP, CLS) on a page with only this block.  

---

## 6. Open points / re-checks (post–Checkpoint A)

| Topic | Confidence | Action |
|-------|------------|--------|
| Exact UE field types for `auraGradient` / `overlayGradient` | 88% | Confirm against [field types](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/implementing/developing/universal-editor/field-types) and project’s existing blocks. |
| Whether `sectionHeadline` is one field or four (for exact stagger) | 85% | Dictated by **pasted HTML** in Checkpoint A. |
| Minimum slide count in authored content | 90% | Requirements imply ≥ 2; enforce in `decorate` if zero/one. |

---

## 7. Review and approval (plan complete)

- [ ] Product / design approve **Figma** references and **mobile/desktop** behavior.  
- [ ] Dev lead approves **content model** and **test strategy**.  
- [ ] Plan owner confirms **Checkpoint A** is understood as a **hard stop** before implementation of real JS/CSS.  

---

## 8. Why this implementation will meet the goal (summary)

1. **Traceable:** Every major behavior maps to [homepagecarousel.md](../../../../../../requirements/homepagecarousel.md) or the [implementation guide](../../../implementation-guide.md), with Figma for visual parity only.  
2. **Reliable in production:** The **user-provided Universal Editor HTML** step prevents the class/DOM drift that the guide calls out, so `decorate` matches real XWalk output.  
3. **Testable in slices:** After backend build, after UE paste, and after each front-end feature (autoplay, progress ring, a11y), a **human** can verify a small surface area without a single high-risk big-bang.  
4. **Consistent with repo:** Reuses the same EDS patterns already proven in [featurecardscarousel](../../../../../../../blocks/featurecardscarousel/) and the guide’s **Pattern 7** (Swiper, instrumentation, one JS/CSS per block).  

When this checklist is **fully checked** and the block is in production preview, re-read the [Implementation Checklist](../../../implementation-guide.md#implementation-checklist) in the guide to ensure nothing was missed.  

---

**Version history**  

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| v1 | 2026-04-27 | AI + user input | Initial plan: `homecarousel`, Figma 241:1640 / 241:2289, TDD + human checkpoints, UE HTML stop. |  
