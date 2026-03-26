# Implementation Plan - `youmayalsolike`

- Guide: `specs/eds-guide/EDS-2026.1.0/creating-eds-block/implementation-guide.md`
- Version: `EDS-2026.1.0`
- Story: `specs/requirements/youmayalsolike.md`
- Date: `2026-03-26`
- Plan Version: `v1`

## 1) Scope and Inputs

### Confirmed Inputs
- Specific functionality name: `youmayalsolike`
- Design references:
  - Desktop: <https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=1-1691&m=dev>
  - Mobile: <https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=1-1703&m=dev>
- Story/requirements source: `specs/requirements/youmayalsolike.md`
- Shared styles decision: **No** (do not update `styles/layout/*.css` and `styles/variables/*.css`)

### Confidence and Traceability
- Confidence in selected guide + process order: **99%** (guide sections: process flow, backend-first, user-provided HTML checkpoint)
- Confidence in business requirements extraction: **97%** (source: `specs/requirements/youmayalsolike.md`)
- Confidence in dynamic card rules (2-3 cards, responsive behavior): **98%** (source: story card-count table)
- Confidence in implementation readiness without additional clarifications: **96%**

## 2) Requirements Baseline

From `specs/requirements/youmayalsolike.md`, implementation must support:
- Related article cards with: image, category label, title, link, mobile read-more CTA
- Card count constraints:
  - `< 2` cards: do not render
  - `> 3` cards: render only first 3
  - `2` cards: desktop 2-column
  - `3` cards: desktop 3-column
  - mobile: single-column stack
- Visual requirements:
  - Rounded cards
  - Readability gradient overlay on images
  - Configurable aura class on container (`aura-*`)

## 3) Implementation Strategy (TDD + Checkpoints)

This plan strictly follows guide order:
1. Backend JSON config
2. Styles decision (already: No)
3. **WAIT for user-provided Universal Editor HTML**
4. Frontend JS/CSS implementation
5. Validation and hardening

## 4) Task Plan

## Phase A - Pre-Implementation Alignment

### A1. Create traceability mapping (Story -> Technical)
- Map each story requirement to one or more technical tasks/tests.
- Define acceptance checklist for rendering rules, responsive layout, and authoring fields.

**Human test checkpoint A**
- Review the traceability matrix and confirm no requirement is missing before coding.

---

## Phase B - Backend/XWalk Setup (Step 1 in Guide)

### B1. Create/Update block-level JSON
- Create/update: `blocks/youmayalsolike/_youmayalsolike.json`
- Add:
  - Component definition entry for block availability in authoring
  - Component model fields required for:
    - section title
    - 2-3 card references/content entries
    - optional aura variant class
    - optional mobile CTA label override (if needed)
  - Filter/nesting config (if composite/multifield structure is used)

### B2. Validate model quality
- Ensure field types and validation support:
  - min 2 / max 3 cards (authoring constraints where possible)
  - required values for card title/link/image/category
  - safe defaults for optional fields

### B3. Run build step
- Run: `npm run build:json`
- Verify generated root files are updated by build output (without manual edits).

### B4. Deploy backend config to authoring environment
- Deploy/sync so Universal Editor picks up model changes.

**Human test checkpoint B**
- In Universal Editor, verify `youmayalsolike` appears and authoring form fields are present and usable.
- Confirm authoring enforces expected constraints (or captures validation messages where supported).

---

## Phase C - Styles Foundation Decision (Step 2 in Guide)

### C1. Confirm shared styles update decision
- Decision recorded as: **No**
- Continue without changing:
  - `styles/layout/*.css`
  - `styles/variables/*.css`

**Human test checkpoint C**
- Confirm this decision is acceptable for current release scope.

---

## Phase D - Mandatory WAIT Checkpoint (Step 3 in Guide)

### D1. STOP and wait for user-provided semantic HTML
- **Required task:** User authors `youmayalsolike` in Adobe Universal Editor with representative sample content.
- User provides the generated semantic HTML to Cursor.
- **AI must not generate HTML.**
- **AI must not proceed to JS/CSS until this HTML is provided.**

**Human test checkpoint D (mandatory)**
- Verify the pasted HTML is actual Universal Editor output for this block and includes realistic card content for 2-card and 3-card cases.

---

## Phase E - Frontend Implementation (Step 4 in Guide, after D complete)

### E1. Implement block JavaScript
- File: `blocks/youmayalsolike/youmayalsolike.js`
- Build logic from user-provided HTML structure only.
- Implement rendering behavior:
  - skip rendering when cards < 2
  - cap display to first 3 cards
  - apply state/class for 2-card vs 3-card layout
  - preserve index-based structure conventions
- Add mobile CTA behavior according to design/story requirements.

### E2. Implement block CSS
- File: `blocks/youmayalsolike/youmayalsolike.css`
- Implement:
  - desktop/mobile card layouts from provided design references
  - readable text overlays on image backgrounds
  - rounded corners and spacing rhythm
  - aura class compatibility on container
  - responsive behavior for 2-card and 3-card variants

### E3. Unit/functional checks (where test harness exists)
- Add/extend tests for:
  - render suppression when card count < 2
  - capping at 3 cards
  - layout class selection based on card count
  - key semantic hooks/classes expected by CSS/JS

**Human test checkpoint E**
- Author test content in Universal Editor and validate in browser:
  - 2-card scenario
  - 3-card scenario
  - <2-card scenario (block hidden)
  - >3-card scenario (only 3 shown)
  - mobile viewport behavior and CTA visibility

---

## Phase F - QA, Accessibility, and Performance

### F1. Accessibility validation
- Verify heading semantics, meaningful link text, focus visibility, keyboard accessibility, and color contrast on overlays.

### F2. Cross-device/browser checks
- Validate desktop + mobile behavior against supplied design frames.

### F3. Performance checks
- Confirm image handling and CSS/JS are lightweight and do not regress page performance.

**Human test checkpoint F**
- Run accessibility spot checks and responsive regression checks on target browsers/devices.

---

## Phase G - Review, Approval, and Completion Validation

### G1. Plan review with user
- Review this plan with user.
- Capture requested edits as `v2` if scope/process changes are needed.

### G2. Completion validation checklist
- [ ] Backend block-level JSON implemented
- [ ] `npm run build:json` executed successfully
- [ ] Universal Editor authoring verified
- [ ] Shared styles decision recorded (No)
- [ ] User-provided semantic HTML received (mandatory)
- [ ] JS implemented from real HTML
- [ ] CSS implemented from real HTML + design references
- [ ] Render rules for card limits validated
- [ ] Responsive behavior validated (desktop/mobile)
- [ ] Accessibility and functional checks passed

### G3. Why this implementation plan is aligned
- It strictly follows the guide’s required sequence and governance rules.
- It adds explicit human verification after each logical phase to reduce late-stage defects.
- It enforces the critical Universal Editor HTML checkpoint, preventing mismatch between generated and real DOM.
- It preserves traceability from story requirements to implementation and validation.

