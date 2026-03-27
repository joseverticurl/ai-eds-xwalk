# Implementation plan: Homepage hero carousel

| Field | Value |
| --- | --- |
| **Guide** | [eds-guide / EDS-2026.1.0 / creating-eds-block](../../../implementation-guide.md) |
| **Specific functionality (spec folder)** | `homepagecarousal` |
| **Recommended block folder / model IDs** | `homepagecarousel` (matches [specs/requirements/homepagecarousel.md](../../../../../../requirements/homepagecarousel.md); avoids typo in authoring URLs and code) |
| **Requirements** | [specs/requirements/homepagecarousel.md](../../../../../../requirements/homepagecarousel.md) |
| **Figma — Desktop** | [01_D_Homepage — node `241:1640`](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=241-1640) |
| **Figma — Mobile** | [01_M_Home Intro 3 — node `241:2289`](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=241-2289) |
| **Figma file key** | `1uWBLEcq2rARuQXFnsqdQD` |
| **Plan version** | v1 |
| **Date** | 2026-03-27 |

**Confidence (overall plan):** **92%** — Requirements and Figma structure are clear; remaining gaps are AEM field types for gradients/aura (see [Open decisions](#open-decisions)) and final DOM order from Universal Editor (must be user-provided).

---

## Goals (traceability)

| Requirement source | What to build |
| --- | --- |
| [Requirements — Summary & key features](../../../../../../requirements/homepagecarousel.md) | Hero carousel: slides with image/video background, copy, CTA, category tag, brand icons as nav + progress, optional page-level aura/gradient, configurable autoplay timing and loop. |
| [Requirements — UX Desktop](../../../../../../requirements/homepagecarousel.md) | Two-column desktop: **left** static multi-line headline; **right** carousel hero card; brand icons on the **right** of the card; auto-rotate; active icon shows progress; click icon changes slide and resets timer. |
| [Requirements — UX Mobile](../../../../../../requirements/homepagecarousel.md) | Hide left headline; full-width card; **horizontal** brand row **above** slide content; same carousel behavior. |
| [Requirements — Text](../../../../../../requirements/homepagecarousel.md) | Multiple paragraphs per slide as separate `<p>` with automatic alignment cycle: left → right → center → repeat. |
| [Guide — Process](../../../implementation-guide.md) | Backend (block JSON + `npm run build:json`) → **user HTML from Universal Editor** → JS/CSS. **Do not** use AI-generated HTML as the source of truth for markup. |
| [Guide — Swiper carousel](../../../implementation-guide.md) (Pattern 7) | Use project Swiper loading pattern (`loadCSS` / `loadScript`, v11 CDN), pagination/progress behavior aligned with [featurecardscarousel](#reference-implementation-in-repo). |

---

## Design notes (Figma MCP, not copy-paste code)

**Desktop (`241:1640`):**

- Full-width background: layered blurred ellipses + noise mask (`Noise & Texture`); off-white frame `#f2f2f2`, rounded outer `8px`.
- **Left “Titles”** (`241:1661`): four lines, **72px** headline, staggered alignment — line 1 left, line 2 right, line 3 center, line 4 left (`tracking` ≈ -2.16px in design).
- **Right “Cards / Hero”** (`241:1659`): ~`670×660`, **24px** radius, shadow `0 -6px 24px rgba(0,0,0,0.05)`, inner padding `40px`; contains badge (Label XS **12px**), body **38px** white, secondary bright CTA **16px** pill; vertical stack of **50px** brand marks + decorative circular “active” indicator (`Icon` node).
- Typography tokens from file: Desktop/Headline 1 (72), Desktop/Headline 4 (38), Desktop/Label XS (12), Desktop/Label L (16).

**Mobile (`241:2289`):**

- Single **Cards / Hero** (`241:2302`): width **335px**, **716px** tall, **16px** radius, `20px` inset from frame; brand row **40px** icons, **16px** gap, **horizontal** at **top**; headline **28px** (Mobile/Headline 4); full-width CTA; bottom content padding pattern differs from desktop — match screenshot when implementing CSS.

**Mapping to implementation:** Figma output is **reference only**; final measurements and DOM must follow **user-provided Universal Editor HTML** and project global layout/grid rules per the [implementation guide](../../../implementation-guide.md).

---

## Reference implementation in repo

| Area | Path | Use for |
| --- | --- | --- |
| Parent + item block JSON, filter | [`blocks/featurecardscarousel/_featurecardscarousel.json`](../../../../../../../blocks/featurecardscarousel/_featurecardscarousel.json) | `definitions` with block + `block/item`, `models`, `filters` |
| Swiper + autoplay + custom progress bullets + desktop/mobile layout split | [`blocks/featurecardscarousel/featurecardscarousel.js`](../../../../../../../blocks/featurecardscarousel/featurecardscarousel.js) | Swiper init, `renderBullet`, `slideChange`, `autoplay.delay` from seconds, `moveInstrumentation` |
| Media type + `reference` asset | [`blocks/textwithimage/_textwithimage.json`](../../../../../../../blocks/textwithimage/_textwithimage.json) | `mediaType` select + `image` reference pattern for slides |
| Section allow-list | [`models/_section.json`](../../../../../../../models/_section.json) | Add `homepagecarousel` to section `filters` `components` array after models exist |

---

## Architecture decisions

1. **Parent–child in one folder** — One block folder `blocks/homepagecarousel/` with `_homepagecarousel.json` defining `homepagecarousel` + `homepagecarouselitem`, one `homepagecarousel.js`, one `homepagecarousel.css`, per [guide — parent-child](../../../implementation-guide.md).
2. **Index-based `decorate()`** — No `data-*` selectors for structure; document row/column indices after HTML exists (derived from user-provided UE HTML).
3. **Carousel runtime** — Reuse Swiper 11 from CDN and `loadCSS` / `loadScript` from [`scripts/aem.js`](../../../../../../../scripts/aem.js`) like `featurecardscarousel`.
4. **Brand icons** — One asset per slide (`brandIcon`); `decorate()` builds icon strip; active state + **CSS progress animation** on active icon (reset on manual navigation and on autoplay tick), matching requirements and Figma active ring.
5. **Paragraph alignment** — Implemented in JS: split slide body into paragraphs (from richtext or multifield — see [Open decisions](#open-decisions)), assign classes `align-left` / `align-right` / `align-center` by index modulo 3 pattern from requirements.
6. **Layout grid** — Use project `container` / `row` / `col-*` from global styles in `decorate()` for desktop two-column layout; **do not** reimplement the grid only in block CSS per [guide — layout grid](../../../implementation-guide.md).
7. **Testing** — Vitest tests for pure helpers (alignment cycle, seconds clamping, optional autoplay flag parsing); keep `decorate()` complexity within project Sonar limits per guide Appendix E.

---

## Open decisions (confidence &lt; 95%)

| Topic | Options | Recommendation | Owner |
| --- | --- | --- | --- |
| **`auraGradient` / `overlayGradient` field types** | AEM may not expose a native “gradient” picker in all projects. | Use **`text`** fields for CSS-ready values (e.g. `linear-gradient(...)`) or **preset `select`** with mapped CSS; confirm with Universal Editor field catalog. | Authoring / tech lead |
| **`paragraphs` modeling** | Richtext (authors add multiple blocks) vs composite multifield of text lines. | Prefer **richtext** if it matches UE “paragraph” field; otherwise multifield **text** rows. Parser in JS must emit one `<p>` per logical paragraph. | Align with UE |
| **Video asset** | `reference` only vs `aem-content`. | Match [`textwithimage`](../../../../../../../blocks/textwithimage/_textwithimage.json): **`reference`** for media + **`mediaType`** select; render `<video>` when `video` and type is video (muted, loop, playsinline). | Implementation |
| **Block name spelling** | `homepagecarousal` vs `homepagecarousel`. | **`homepagecarousel`** for `blocks/` and models (requirements name). | Confirmed in this plan |

---

## Checkpoint: Universal Editor HTML (mandatory stop)

**Do not** generate block HTML in Cursor or proceed to frontend implementation until:

1. Block JSON is merged and available in authoring.
2. Author places **Homepage carousel** on a page in Universal Editor and publishes/previews.
3. User pastes **the exact semantic HTML** output for the block (or exports DOM) into the task / follow-up.

The implementation plan for JS/CSS **must** include a “structure contract” section listing `block.children` indices — **filled in after HTML is provided**.

---

## Phase 0 — Prerequisites

| # | Task | Verification (human) |
| --- | --- | --- |
| 0.1 | Confirm guide [EDS-2026.1.0](../../../implementation-guide.md) and intentional scope (no dispatcher, no OSGi). | Read “Out of Scope” in guide; confirm with team. |
| 0.2 | Resolve [Open decisions](#open-decisions) enough to author `_homepagecarousel.json`. | Short sign-off in ticket or PR description. |
| 0.3 | Ensure Figma file access for reviewers (same links as header). | Open both Figma URLs in browser. |

---

## Phase 1 — Backend (XWalk JSON only)

| # | Task | Notes |
| --- | --- | --- |
| 1.1 | Create `blocks/homepagecarousel/_homepagecarousel.json` with `definitions` for **Homepage Carousel** (`resourceType` block) and **Homepage Carousel Slide** (`resourceType` block/item). | Mirror structure from [`_featurecardscarousel.json`](../../../../../../../blocks/featurecardscarousel/_featurecardscarousel.json). |
| 1.2 | **Parent model `homepagecarousel` fields:** `sectionHeadline` (text, possibly multiline or richtext — align with UE), `transitionDuration` (number, seconds), `autoplay` (boolean), `loopSlides` (boolean), `enableAuraEffect` (boolean), `auraGradient` (text or select per [Open decisions](#open-decisions)). | Defaults: e.g. autoplay true, loop true, transition 5s — match product defaults in ticket. |
| 1.3 | **Item model `homepagecarouselitem` fields:** `mediaType` (select: image \| video), `image` (reference), `video` (reference, conditional), `categoryTag` (text), `paragraphs` (richtext or multifield), `ctaLabel` (text), `ctaLink` (aem-content or text URL per project pattern), `brandIcon` (reference) + **alt** text field for icon, `overlayGradient` (text/select). | Add `imageAlt` / video poster alt as required for a11y. |
| 1.4 | **Filter** `homepagecarousel` with components `[ "homepagecarouselitem" ]`. | Same as feature cards pattern. |
| 1.5 | Add `"homepagecarousel"` to [`models/_section.json`](../../../../../../../models/_section.json) `filters` → `components` list. | Required for block to appear in section. |
| 1.6 | Run `npm run build:json` from repo root. | Regenerates `component-models.json`, `component-definition.json`, `component-filters.json`. |
| 1.7 | Run `npm run lint` (JSON + ESLint). | Fix any JSON schema issues from eslint-plugin-xwalk if reported. |

**Human verification — Phase 1**

- [ ] `npm run build:json` exits 0.
- [ ] `component-models.json` contains `homepagecarousel` and `homepagecarouselitem` models.
- [ ] `grep homepagecarousel component-filters.json` shows filter definition.
- [ ] In Universal Editor (or authoring env), block appears and fields are editable.

---

## Phase 2 — **STOP: User-provided HTML**

| # | Task | Notes |
| --- | --- | --- |
| 2.1 | Author block with at least **two slides** and realistic content (image + video slide if possible). | Exercises media switch and icons. |
| 2.2 | User pastes **full block HTML** into the implementation task. | **No** Cursor-generated HTML. |
| 2.3 | Document **structure contract**: mapping of each `block.children[i]` (and nested cells) to model fields. | Paste into PR or `homepagecarousel.js` header comment like featurecardscarousel. |

**Human verification — Phase 2**

- [ ] HTML matches what Franklin delivers for the block (inspect preview DOM).
- [ ] Structure contract reviewed so `decorate()` indices are stable.

---

## Phase 3 — Frontend (JS + CSS)

| # | Task | Notes |
| --- | --- | --- |
| 3.1 | Add `blocks/homepagecarousel/homepagecarousel.js` — `export default async function decorate(block)`. | Parse rows per structure contract; build DOM: desktop (headline column + swiper column), mobile (icons on top, hide headline via CSS/empty wrapper). |
| 3.2 | Load Swiper CSS/JS (v11) like [`featurecardscarousel.js`](../../../../../../../blocks/featurecardscarousel/featurecardscarousel.js); configure `autoplay` from `transitionDuration`, `loop` from `loopSlides`, disable autoplay when `autoplay` false. | Call `moveInstrumentation` when replacing nodes per existing pattern. |
| 3.3 | **Slides:** For each slide, render media (`picture` / `video` muted loop playsinline), optional gradient overlay, category tag, CTA link, icon strip (all slides visible; highlight active). | Use `createOptimizedPicture` from [`scripts/aem.js`](../../../../../../../scripts/aem.js) for images. |
| 3.4 | **Progress:** Active brand icon shows timed progress (CSS animation tied to slide duration); restart animation on slide change and on manual nav — match [featurecardscarousel] bullet pattern where applicable. | May use `swiper-pagination` with `renderBullet` or custom buttons + ARIA `role="tablist"` / `aria-selected`. |
| 3.5 | **Paragraphs:** Apply alignment classes per requirements table (1→left, 2→right, 3→center, repeat). | Unit-test pure function with fake paragraph list. |
| 3.6 | **Aura:** If `enableAuraEffect`, apply background/gradient layer per `auraGradient` / design tokens; if disabled, omit. | Respect reduced-motion if project has a pattern. |
| 3.7 | Add `blocks/homepagecarousel/homepagecarousel.css` — BEM-style classes scoped to block; **no** selectors targeting `.container` / `.row` / `.col-*` per guide. | Desktop/mobile breakpoints aligned with design and `styles/styles.css` breakpoints. |
| 3.8 | **Accessibility:** Alt text on images/icons; keyboard operable icon navigation; focus visible; sufficient contrast with `overlayGradient`. | Map to WCAG criteria from requirements. |

**Human verification — Phase 3**

- [ ] Local preview: desktop shows headline + carousel; mobile hides headline row and shows horizontal icons.
- [ ] Autoplay and manual icon navigation work; timer resets on click.
- [ ] Video slide: muted, loops, no keyboard trap.
- [ ] Lighthouse / axe spot-check on the block (contrast, labels).

---

## Phase 4 — Automated tests & quality gate

| # | Task | Notes |
| --- | --- | --- |
| 4.1 | Add `homepagecarousel.test.js` — test alignment helper, duration bounds, maybe mock Swiper if needed. | Follow [`featurecardscarousel.test.js`](../../../../../../../blocks/featurecardscarousel/featurecardscarousel.test.js) style. |
| 4.2 | `npm run test` — all tests pass. | CI gate. |
| 4.3 | `npm run lint` — ESLint + Stylelint clean. | Required before merge per guide. |

**Human verification — Phase 4**

- [ ] Review test coverage for critical pure functions.
- [ ] Optional: run Sonar / complexity check if project uses it.

---

## Phase 5 — Acceptance checklist (requirements)

Source: [specs/requirements/homepagecarousel.md](../../../../../../requirements/homepagecarousel.md)

| Criterion | Verified |
| --- | --- |
| Authors can add multiple slides | |
| Slides support image or video backgrounds | |
| Transition timing configurable | |
| Each slide has brand icon | |
| Active icon shows progress animation | |
| Auto transition between slides | |
| Users navigate via brand icons | |
| Desktop: headline + carousel layout | |
| Mobile: headline hidden; full width; icons horizontal above | |
| Multiple paragraphs per slide with `<p>` and alignment pattern | |
| Loop when enabled | |
| A11y: alts, keyboard CTA, contrast | |

---

## Reasoning (why this meets the goal)

1. **Process:** The plan follows the guide’s strict **backend → user HTML → frontend** order and embeds an explicit **STOP** so Universal Editor remains the markup source of truth, which the guide marks as critical for reliable blocks.
2. **Design:** Figma desktop/mobile nodes are captured in the header and summarized for spacing/typography; implementation is explicitly tied to **user HTML** and global grid rules, avoiding Tailwind-from-Figma as production code.
3. **Code reuse:** Parent–child JSON, Swiper loading, progress bullets, and media-type patterns are anchored to **existing repo files** (`featurecardscarousel`, `textwithimage`) so generated code stays consistent and reviewable.
4. **TDD & human checks:** Pure logic is testable; each phase ends with **human verification** so integration issues surface early (JSON build, authoring, layout, a11y).
5. **Traceability:** Requirements, Figma, and guide references are linked; gaps (gradient field types) are called out with **92% overall confidence** until authoring decisions are finalized.

---

## Approval

**Status:** Approved — 2026-03-27.

| Role | Name | Date | Approved (y/n) |
| --- | --- | --- | --- |
| Engineering | — | 2026-03-27 | y |
| Design (optional) | — | — | — |

Execute phases in order; **do not** skip Phase 2 (user-provided Universal Editor HTML before JS/CSS).
