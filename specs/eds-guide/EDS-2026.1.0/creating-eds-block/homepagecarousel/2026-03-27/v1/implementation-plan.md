# Implementation Plan: Homepage Carousel

**Guide:** [eds-guide / EDS-2026.1.0 / creating-eds-block](../../../implementation-guide.md)  
**Specific functionality:** `homepagecarousel`  
**Date:** 2026-03-27  
**Version:** v1  
**Requirements:** [specs/requirements/homepagecarousel.md](../../../../../../requirements/homepagecarousel.md)  
**Design (Figma — Dev Mode):** [Desktop `241:1640`](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=241-1640&m=dev) | [Mobile `241:2289`](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=241-2289&m=dev)  
**Reference blocks:** [`blocks/featurecardscarousel`](../../../../../../blocks/featurecardscarousel) (Swiper, parent + items, autoplay reset), [`blocks/textwithimage`](../../../../../../blocks/textwithimage) (`mediaType` image/video + `reference`), [`blocks/ai-component-guide`](../../../../../../blocks/ai-component-guide) (index-based parent–child contract)

**Design extraction:** Figma MCP `get_design_context` was run on both nodes (2026-03-27). Code output is **reference only**; implementation must follow this repo’s EDS patterns (no Tailwind in block deliverables). Typography tokens from design context include TCCC Unity Headline: desktop tag **12px**, card headline **38px**, CTA **16px**, left marquee **72px**; mobile card headline **28px**; icon column **50px** desktop / **40px** mobile with horizontal row on mobile.

---

## Summary

Deliver a **parent–child** EDS block **`homepagecarousel`** that implements a **hero carousel**: desktop shows a **static left column** (section headline) and **right column** (full-bleed-style hero card with background media); **mobile hides the left column**, makes the hero **full width**, and moves **brand icons to a horizontal row above** the slide. Slides support **image or video** backgrounds, optional **category tag**, **multi-paragraph** copy with **automatic L → R → C alignment cycling**, **CTA**, and **per-slide brand icons** that act as **navigation and progress** indicators. **Autoplay** interval is author-configurable; **manual icon click resets the autoplay timer**; **loop** is optional. **Aura / gradient** treatment behind content and optional **slide overlay gradient** are driven by authoring fields where the model allows.

**Process order (mandatory):** [Part 1 — 3-step flow](../../../implementation-guide.md#part-1-process-flow-3-steps) — backend (block JSON + `npm run build:json`) → **user-provided semantic HTML from Universal Editor** → **only then** `homepagecarousel.js` / `homepagecarousel.css`.

---

## Confidence and gaps

| Topic | Confidence | Notes |
|--------|------------|--------|
| Overall fit with [implementation guide](../../../implementation-guide.md) | **98%** | Parent–child one folder; index-based rows; layout grid rules; Swiper patterns documented. |
| Figma ↔ responsive behavior | **95%** | Desktop and mobile frames captured; **no separate tablet frame** — use [project breakpoints](../../../../../../styles/styles.css) (e.g. 600 / 900 / 1200) and interpolate from desktop/mobile. |
| `auraGradient` / `overlayGradient` as in requirements | **75%** | Repo models use `text`, `select`, `reference`, `richtext`, etc.; there is **no existing `gradient` component** in `component-models.json`. Plan: implement as **`text`** (authors paste CSS gradient / custom property value) **or** a small **`select`** of presets after UX confirms; validate in UE during Phase 1.5. |
| `boolean` fields (`autoplay`, `loopSlides`, `enableAuraEffect`) | **90%** | [Guide lists `boolean`](../../../implementation-guide.md#field-component-types); this repo mostly uses `select` elsewhere. Prefer **`boolean`** per guide; if UE/build rejects, fall back to **`select`** (On/Off). |
| Progress ring on active brand icon | **85%** | Figma shows active state with circular progress; implement with **CSS animation** duration = `transitionDuration` and **restart on slide change**, or Swiper-facing timer pattern — detail in Phase 3 after HTML contract is known. |

---

## Requirements traceability (concise)

Derived from [homepagecarousel.md](../../../../../../requirements/homepagecarousel.md): multi-slide carousel; image/video background; configurable duration; autoplay on/off; loop on/off; brand icons as nav + progress; desktop two-column + mobile full-width without headline; paragraph alignment pattern per slide; a11y (alt text, muted video, keyboard CTA, contrast). **Do not duplicate** the full requirement text here — use the linked doc as source of truth.

---

## Architecture decisions

1. **One block folder** `blocks/homepagecarousel/`: `_homepagecarousel.json`, `homepagecarousel.js`, `homepagecarousel.css` only — [Critical: Parent–Child Blocks Use ONE Folder](../../../implementation-guide.md#critical-parent-child-blocks-use-one-folder).
2. **Definitions:** `homepagecarousel` (parent, `block`) + `homepagecarouselitem` (child, `block/item`).
3. **Filter:** `homepagecarousel` → allow `["homepagecarouselitem"]`.
4. **Section registration:** append `"homepagecarousel"` to [`models/_section.json`](../../../../../../models/_section.json) `filters[0].components` after `npm run build:json` merges block-level JSON.
5. **Carousel runtime:** **Swiper 11** via `loadScript` / `loadCSS` — same approach as [`featurecardscarousel.js`](../../../../../../blocks/featurecardscarousel/featurecardscarousel.js); follow [Pattern 7 / autoplay reset](../../../implementation-guide.md#swiper-initialization-and-event-handlers-mandatory).
6. **Layout:** Use global **`container` / `row` / `col-*`** for the outer shell; **do not** target grid utility classes from block CSS — [Layout grid](../../../implementation-guide.md#layout-grid-global-design-system-classes).
7. **Media:** Mirror **`textwithimage`** — `reference` + `select` `mediaType` (`image` | `video`); video: muted, autoplay, loop in markup/JS.
8. **Paragraph alignment:** Slides use **`richtext`** for “paragraphs”; `decorate()` wraps or classifies each rendered `<p>` by index: **0 → left, 1 → right, 2 → center**, repeat (per requirements table). **Section headline** is a single **text** or **richtext** field: if multiple lines are needed with the same stagger pattern as Figma’s left column, prefer **richtext** with multiple `<p>` and **the same index-based alignment helper** (confirm with stakeholder — requirements list `sectionHeadline` as Text only).

---

## Implementation tasks (test-aligned)

### Phase 0: Pre-implementation

- [ ] **0.1** Read [Mandatory preflight](../../../implementation-guide.md#mandatory-preflight-before-backend-generation) and this plan; confirm no intentional deviations.
- [ ] **0.2** Open both Figma links (desktop + mobile) and confirm file access.
- [ ] **0.3** Skim [homepagecarousel.md](../../../../../../requirements/homepagecarousel.md) and [Part 2 — Backend](../../../implementation-guide.md#part-2-backend-code-generation).

**Human test:** [ ] Confirm Figma and requirements are accessible; note any delta between Figma and markdown for PM/design.

---

### Phase 1: Backend — XWalk configuration (Step 1 only)

**Reference:** [Part 2: Backend code generation](../../../implementation-guide.md#part-2-backend-code-generation)

#### Step 1.1: Block-level JSON file

- [ ] **1.1.1** Create `blocks/homepagecarousel/_homepagecarousel.json` (folder name = block name).
- [ ] **1.1.2** Add **parent** definition: `id` `homepagecarousel`, template `model` + `filter` `homepagecarousel`, resourceType `core/franklin/components/block/v1/block`.
- [ ] **1.1.3** Add **child** definition: `id` `homepagecarouselitem`, resourceType `core/franklin/components/block/v1/block/item`, template `model` `homepagecarouselitem`.

**Human test:** [ ] Run `npm run build:json` from repo root; confirm no JSON errors and root `component-definition.json` includes both definitions.

#### Step 1.2: Parent model `homepagecarousel`

Field order must match Universal Editor row order (structure contract). Proposed order:

| # | Component | Name | Label | Notes |
|---|-----------|------|-------|-------|
| 1 | text or richtext | sectionHeadline | Section headline | Desktop only column; if multi-line stagger needed, use **richtext** (see Architecture). |
| 2 | number | transitionDuration | Transition duration (sec) | Default e.g. 5; min/max sane bounds in description. |
| 3 | boolean | autoplay | Autoplay | If unsupported, `select` On/Off. |
| 4 | boolean | loopSlides | Loop slides | Fallback: `select`. |
| 5 | boolean | enableAuraEffect | Enable aura effect | Fallback: `select`. |
| 6 | text | auraGradient | Aura gradient (CSS) | Optional if aura off; or preset `select` after validation. |

**Human test:** [ ] After `npm run build:json`, verify `component-models.json` contains `homepagecarousel` with fields in this order.

#### Step 1.3: Child model `homepagecarouselitem`

| # | Component | Name | Label | Notes |
|---|-----------|------|-------|-------|
| 1 | select | mediaType | Media type | `image` \| `video` |
| 2 | reference | image | Image | Background when image |
| 3 | text | imageAlt | Image alt | |
| 4 | reference | video | Video | Background when video (or reuse single reference + type — align with `textwithimage` pattern) |
| 5 | text | videoPosterAlt | Video alt | Descriptive for a11y where applicable |
| 6 | text | categoryTag | Category tag | Optional |
| 7 | richtext | paragraphs | Paragraphs | Multiple `<p>`; JS applies L/R/C cycle |
| 8 | text | ctaLabel | CTA label | |
| 9 | aem-content or text | ctaLink | CTA link | Match project standard (`aem-content` vs path). |
| 10 | reference | brandIcon | Brand icon | |
| 11 | text | brandIconAlt | Brand icon alt | |
| 12 | text | overlayGradient | Overlay gradient (CSS) | Optional; if too heavy, omit v1 |

*Refinement:* If a single `reference` for “media” is preferred (like `textwithimage`), collapse image/video into one reference + `mediaType` — **must match** whatever authors expect; `textwithimage` uses one `reference` named `image` for “Media”.

**Human test:** [ ] `npm run build:json`; verify child model and filter `homepagecarousel` → `homepagecarouselitem`.

#### Step 1.4: Filter and section

- [ ] **1.4.1** In `_homepagecarousel.json`, set filter: `{"id":"homepagecarousel","components":["homepagecarouselitem"]}`.
- [ ] **1.4.2** Add `"homepagecarousel"` to [`models/_section.json`](../../../../../../models/_section.json) `filters[0].components`.

**Human test:** [ ] `npm run build:json`; confirm `component-filters.json` and section allow list.

#### Step 1.5: Authoring QA (backend)

- [ ] **1.5.1** Deploy or sync config to UE/AEM as per team workflow.
- [ ] **1.5.2** Add block to page; create **≥2** child items with mixed image/video.

**Human test:** [ ] In Universal Editor, confirm all fields appear, children can be added/reordered, and `transitionDuration` / toggles persist. **STOP HERE for frontend** until Phase 2 is done.

---

### Phase 2: User provides semantic HTML (Step 2 — **MANDATORY CHECKPOINT**)

**Reference:** [Step 2: User provides semantic HTML](../../../implementation-guide.md#step-2-user-provides-semantic-html)

**⛔ WAIT:** Do **not** generate block HTML in Cursor. Do **not** implement `homepagecarousel.js` / `.css` until real UE output exists.

- [ ] **2.1** Author **homepagecarousel** in Universal Editor with representative content: headline, ≥3 slides, at least one video slide, autoplay on/off values, icons with alt text.
- [ ] **2.2** User pastes **exact** rendered HTML (view source / DevTools copy of the block root).
- [ ] **2.3** Document the **structure contract** in code comments (and in this plan appendix if useful): parent row indices → fields; each child row → cell indices → fields; how empty optional cells behave.

**Human test:** [ ] Reviewer confirms the documented indices match the pasted HTML before any Phase 3 work begins.

---

### Phase 3: Frontend — JavaScript and CSS (Step 3)

**Reference:** [Part 3: Frontend code generation](../../../implementation-guide.md#part-3-frontend-code-generation); [Pattern 7 — Carousel with Swiper](../../../implementation-guide.md#pattern-7-carousel-block-with-swiper)

#### Step 3.1: Block files

- [ ] **3.1.1** Add `blocks/homepagecarousel/homepagecarousel.js` — default export `decorate(block)`.
- [ ] **3.1.2** Add `blocks/homepagecarousel/homepagecarousel.css`.

**Human test:** [ ] Local preview loads block shell without console errors (stub OK until decorate complete).

#### Step 3.2: `decorate()` — parse rows

- [ ] **3.2.1** JSDoc structure contract from Phase 2.
- [ ] **3.2.2** Read parent fields by **index** (no `data-*` selectors).
- [ ] **3.2.3** Map each child row to slide data: media, tag, paragraphs HTML or nodes, CTA, icon.
- [ ] **3.2.4** Use [`moveInstrumentation`](../../../../../../scripts/scripts.js) when replacing nodes per guide.

**Human test:** [ ] Log or breakpoint: slide count and CTA hrefs match authoring.

#### Step 3.3: DOM structure

- [ ] **3.3.1** Outer wrapper using **container / row / col-*** for desktop headline column + carousel column; mobile utilities hide headline column and stack icons.
- [ ] **3.3.2** Build **brand icon strip**: vertical desktop (right side of card per Figma), horizontal mobile above slide.
- [ ] **3.3.3** Build **Swiper** structure: one slide per item; background layer (picture or `video`), overlay gradient optional, content column (tag, paragraphs, CTA).
- [ ] **3.3.4** Apply **paragraph alignment** helper to slide body `<p>` elements.
- [ ] **3.3.5** Apply **section headline** alignment if multi-`<p>` richtext is used.

**Human test:** [ ] Compare DOM at desktop 1440px and mobile ~375px against Figma (spacing approximate until design QA).

#### Step 3.4: Swiper behavior

- [ ] **3.4.1** Init Swiper: `loop` from `loopSlides`; `autoplay` from `autoplay` + `transitionDuration` (convert seconds to ms); respect reduced-motion if project has a pattern.
- [ ] **3.4.2** **Custom pagination / thumbnails:** brand icons trigger `slideTo` / `slideToLoop`; use **`realIndex`** for syncing active/progress UI per [guide note](../../../implementation-guide.md#pattern-7-carousel-block-with-swiper).
- [ ] **3.4.3** On icon click: **reset autoplay** (`stop`/`start`) when autoplay enabled — [mandatory pattern](../../../implementation-guide.md#swiper-initialization-and-event-handlers-mandatory).
- [ ] **3.4.4** **Active icon progress:** CSS animation or Swiper autoplay time left (implementation detail after prototype).

**Human test:** [ ] Autoplay advances; click icon jumps and **timer resets**; loop on/off matches model; keyboard focus on CTA works.

#### Step 3.5: Media and performance

- [ ] **3.5.1** Images: `createOptimizedPicture` from [`aem.js`](../../../../../../scripts/aem.js) where applicable.
- [ ] **3.5.2** Video: `muted`, `playsInline`, `autoplay`, `loop`; no audio.

**Human test:** [ ] Lighthouse sanity on page with carousel; video does not block LCP without stakeholder sign-off.

#### Step 3.6: Aura / noise / background

- [ ] **3.6.1** If `enableAuraEffect`, apply parent-level background/gradient (`auraGradient` or design tokens); align with Figma blurred ellipse layers **without** copying unreachable asset URLs from MCP (use SVG/CSS or authored assets).

**Human test:** [ ] Toggle aura off/on in UE; verify visual matches expectation.

#### Step 3.7: Lint and complexity

- [ ] **3.7.1** `npm run lint` clean.
- [ ] **3.7.2** Keep `decorate()` maintainable — extract helpers per [Appendix E](../../../implementation-guide.md#appendix-e-sonar-cognitive-complexity-and-project-lint-rules).

**Human test:** [ ] CI / local lint passes.

---

### Phase 4: End-to-end validation

- [ ] **4.1** UE: edit all fields; preview on published preview host.
- [ ] **4.2** Accessibility: axe or manual — alt texts, focus order, contrast on CTA vs background.
- [ ] **4.3** Cross-browser smoke (Safari + Chrome minimum).

**Human test:** [ ] Sign-off from design (desktop + mobile) and content author.

---

## Appendix: Figma node reference

| View | Node ID | Name (from MCP) |
|------|---------|------------------|
| Desktop | `241:1640` | `01_D_Homepage` |
| Mobile | `241:2289` | `01_M_Home Intro 3` |

---

## Why this plan matches the goal

- It follows the **implementation guide’s fixed order**: backend → **authoritative UE HTML** → JS/CSS, avoiding Cursor-generated HTML drift.
- It **reuses proven repo patterns** (parent–child JSON, Swiper + autoplay reset, `textwithimage` media typing, index-based `decorate`) so work is **predictable** for future similar blocks.
- It embeds **human verification after each phase** so misconfigured models or Swiper behavior is caught before full integration cost.
- It records **explicit confidence gaps** (gradients, booleans, tablet interpolation) so implementers validate against AEM UE rather than guessing.

---

## Next step for the team

**Review and approve** this plan. After approval, execute **Phase 1** only; **stop at Phase 2** until Universal Editor HTML is pasted into the working session. If you want changes (e.g. consolidate media into one reference, or preset-only gradients), annotate this file and bump to **v2** per folder convention.
