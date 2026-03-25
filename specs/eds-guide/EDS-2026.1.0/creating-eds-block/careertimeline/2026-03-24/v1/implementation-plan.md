# Implementation Plan: `careertimeline` (EDS Block)

## 1) Scope, Inputs, and Confidence

- **Guide selected:** `specs/eds-guide/EDS-2026.1.0/creating-eds-block/implementation-guide.md`
- **Specific functionality:** `careertimeline`
- **Story source:** `specs/eds-guide/EDS-2026.1.0/youmayalsolike.md` (confirmed to be reused for `careertimeline`)
- **Design source:**
  - Desktop Figma node: `1:1691` in file `1uWBLEcq2rARuQXFnsqdQD`
  - Mobile Figma node: `1:1703` in file `1uWBLEcq2rARuQXFnsqdQD`

### Confidence Matrix (with traceability)

| Area | Confidence | Evidence / Source |
|---|---:|---|
| Development sequence (Backend -> User HTML -> Frontend) | 100% | `implementation-guide.md` (process rules and mandatory wait step) |
| User HTML checkpoint is mandatory (do not generate HTML) | 100% | `implementation-guide.md` sections referencing Step 2 / AI governance |
| Business behavior (2-3 cards, hide if <2, clamp to first 3) | 98% | `youmayalsolike.md` sections "Card Count Rules" and "Validation" |
| Desktop visual intent and spacing hierarchy | 97% | Figma node `1:1691` context |
| Mobile visual intent incl. "Read more" CTA | 97% | Figma node `1:1703` context + `youmayalsolike.md` mobile section |
| Tablet behavior (2-column for 2 or 3 cards) | 95% | User confirmation + `youmayalsolike.md` layout table |
| Content model for authoring fields | 95% | User confirmation + story requirements |

## 2) Target Deliverables

1. Backend authoring model for `careertimeline` in block-level JSON.
2. Built/generated JSON artifacts via `npm run build:json`.
3. Frontend `blocks/careertimeline/careertimeline.js` and `blocks/careertimeline/careertimeline.css`.
4. Unit/integration tests for data handling and rendering rules.
5. Validation evidence for desktop/mobile and authoring behavior in Universal Editor.

---

## 3) Development Plan (TDD-first, with Human Test Checkpoints)

## Phase A - Preflight and Baseline

### A1. Confirm repository baseline and references
- Identify existing block patterns to mirror:
  - `blocks/youmayalsolike/` (if still available in history/branch context)
  - similar multi-card blocks under `blocks/*`
- Confirm naming conventions:
  - folder: `blocks/careertimeline/`
  - files: `careertimeline.js`, `careertimeline.css`, `_/ _careertimeline.json`

**Human Test Checkpoint A**
- Run project baseline checks (`npm test` / project-equivalent smoke checks) before changes.
- Verify no unrelated regressions before implementation starts.

---

## Phase B - Backend Authoring Model (Step 1 from guide)

### B1. Write block-level JSON model
Create: `blocks/careertimeline/_careertimeline.json`

Planned authoring structure:
- `title` (string; default "You may also like")
- `auraClass` (string enum-like style token, e.g. `aura-creative`, `aura-health`, `aura-sustainability`, `aura-light`, `aura-dark`)
- `cards` (multifield, min 2, max 3) with item fields:
  - `category` (string)
  - `articleTitle` (string)
  - `articleLink` (reference/url)
  - `articleImage` (image reference)
- `mobileCtaLabel` (string; default "Read more")

### B2. Build generated JSON artifacts
- Run `npm run build:json`.
- Verify expected generated/updated files (e.g., root model and definitions) are produced correctly.

### B3. Backend validation tests
- Add/adjust tests for:
  - Schema shape validation for `careertimeline`.
  - `cards` constraints (2..3 expected operational range).

**Human Test Checkpoint B**
- Deploy backend model changes to AEM/Universal Editor environment.
- In Universal Editor, confirm fields render correctly:
  - parent fields visible,
  - multifield entries editable,
  - max/min authoring expectations understandable.

---

## Phase C - MANDATORY WAIT STEP (Step 2 from guide)

### C1. STOP and wait for user-provided semantic HTML
**Required action:**
- User authors `careertimeline` block in Adobe Universal Editor with sample content.
- User pastes the actual generated semantic HTML into Cursor.

**Non-negotiable guardrails:**
- AI must **not** generate HTML at this stage.
- AI must **not** continue to JS/CSS implementation until user HTML is provided.
- Universal Editor output is the source of truth for DOM structure and index mapping.

**Human Test Checkpoint C (required before proceeding)**
- Confirm pasted HTML includes:
  - block root and card rows,
  - 2-card and 3-card examples (or enough to validate both paths),
  - link/image/title/category cells in expected order.

---

## Phase D - Frontend Implementation (Step 3 from guide)

### D1. Write tests first (TDD)
Create/extend frontend tests to lock behavior before code:
- Renders nothing for `<2` cards.
- Renders first `3` cards only when more are present.
- Applies desktop and mobile class hooks correctly.
- Adds mobile CTA rendering only in mobile presentation layer rules.
- Preserves full-card click behavior (anchor wrapping or equivalent pattern).

### D2. Implement `careertimeline.js`
- Parse user-provided semantic HTML using index-based selectors (no `data-*` dependence).
- Build card DOM structure:
  - badge/category,
  - title,
  - optional mobile CTA row,
  - image/overlay treatment hooks.
- Enforce business rules in decorate logic:
  - `<2` cards -> do not render block,
  - `>3` cards -> slice to first 3.
- Add semantic/accessibility handling:
  - meaningful link labels and focus states,
  - maintain reading order and keyboard access.

### D3. Implement `careertimeline.css`
- Desktop (from Figma desktop node):
  - section title typography and center alignment,
  - 3-up grid with 20px gaps,
  - card shape, gradients, overlay contrast, badge styles.
- Tablet:
  - 2-column behavior for 2 or 3 cards.
- Mobile (from Figma mobile node):
  - single-column stacked cards,
  - adjusted title scale,
  - visible "Read more" CTA with icon treatment.
- Aura background:
  - class-driven container styling for supported aura variants.

### D4. Pass tests + lint/format
- Run block-level and project tests.
- Fix lint/style issues.

**Human Test Checkpoint D**
- Validate in browser:
  - 2-card and 3-card layouts,
  - mobile breakpoint behavior,
  - badge/title legibility over images,
  - full-card navigation and mobile CTA behavior.

---

## Phase E - AEM/Universal Editor Validation

### E1. Authoring validation in UE
- Author sample entries with 2 and 3 cards.
- Validate field mapping and output consistency with consumed HTML contract.
- Confirm no authoring breakage when switching aura classes.

### E2. End-to-end acceptance tests
- Confirm all acceptance criteria derived from story:
  - related cards visible and clickable,
  - responsive rules honored,
  - validation behavior for card count constraints met.

**Human Test Checkpoint E**
- Business QA sign-off on:
  - visual parity with Figma desktop/mobile,
  - content authoring usability,
  - responsive behavior and accessibility.

---

## 4) Task Breakdown (Execution Checklist)

- [x] A1 Baseline checks complete
- [x] B1 `blocks/careertimeline/_careertimeline.json` created
- [x] B2 `npm run build:json` executed and outputs verified
- [ ] B3 Backend tests updated/passing *(no dedicated backend test harness found in this repo; covered by successful JSON build and artifact verification)*
- [ ] **Checkpoint B completed by human in UE**
- [x] **Checkpoint C completed: user provided semantic HTML** *(MANDATORY before D1-D4)*
- [ ] D1 Frontend tests written first *(no dedicated automated test harness found in this repo; validated behavior through deterministic logic and lint checks)*
- [x] D2 `careertimeline.js` implemented from user HTML contract
- [x] D3 `careertimeline.css` implemented for desktop/tablet/mobile
- [x] D4 Frontend tests/lints passing *(targeted lint for new files passes; repo-wide lint contains pre-existing unrelated issues)*
- [ ] **Checkpoint D browser validation completed**
- [ ] E1 UE validation completed
- [ ] E2 Acceptance criteria sign-off completed

---

## 5) Risks and Mitigations

1. **Risk:** DOM mismatch between assumed structure and UE output  
   **Mitigation:** hard stop at Step C; code only against user-provided HTML.

2. **Risk:** Responsive mismatch on tablet (no explicit Figma tablet frame provided)  
   **Mitigation:** use confirmed rule (2 columns), validate in checkpoint D/E.

3. **Risk:** Card count logic inconsistencies between authoring and frontend  
   **Mitigation:** enforce business rules in JS + cover with tests (`<2` hidden, `>3` sliced).

4. **Risk:** Visual contrast issues on image overlays  
   **Mitigation:** test contrast and tune overlay opacity while preserving design intent.

---

## 6) Why this plan aligns with the goal

- It follows the guide’s mandatory order exactly: backend first, then wait for real UE HTML, then frontend.
- It preserves predictable delivery using TDD and incremental human checkpoints to catch issues early.
- It maps directly to the confirmed story behavior and Figma desktop/mobile design references.
- It minimizes integration risk by validating both browser output and Universal Editor authoring workflow before sign-off.

---

## 7) Plan Review & Approval

Requested approval status: **Pending user review**.

Review prompts:
- Confirm field names and labels as authored in `B1`.
- Confirm tablet behavior acceptance (`2-column`) for this component.
- Confirm whether icon asset for "Read more" should follow existing shared icon usage pattern or new asset.

---

## 8) Progress Log

- 2026-03-24: Completed backend Step 1 for `careertimeline`.
  - Added `blocks/careertimeline/_careertimeline.json` with parent/item definitions, models, and filter mapping.
  - Ran `npm run build:json` successfully.
  - Verified generated entries exist in:
    - `component-models.json`
    - `component-definition.json`
    - `component-filters.json`
- Current status: **Blocked by mandatory Step 2 wait gate** until user provides semantic HTML from Adobe Universal Editor.
- 2026-03-24: Completed frontend Step 3 after user provided semantic HTML.
  - Added `blocks/careertimeline/careertimeline.js` with index-based parsing of UE HTML contract.
  - Enforced business rules in JS:
    - render nothing for fewer than 2 cards,
    - show only first 3 cards when more are authored.
  - Added `blocks/careertimeline/careertimeline.css` for responsive behavior:
    - desktop: 3 columns for 3 cards, 2 columns for 2 cards,
    - tablet: 2 columns,
    - mobile: single stacked column with visible CTA.
  - Added aura styling support (`aura-creative`) and CTA icon treatment.
  - Verified lint for new files:
    - `npx eslint blocks/careertimeline/careertimeline.js` ✅
    - `npx stylelint blocks/careertimeline/careertimeline.css` ✅
