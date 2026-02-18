# Implementation Plan: CareerCards Block

**Block Name:** careercards  
**Guide:** [implementation-guide.md](../../../implementation-guide.md)  
**Requirements:** [careercards.md](../../../../../requirements/careercards.md)  
**Version:** v1  
**Date:** 2026-02-18  

**Status:** Phase 1–4 complete. Structure contract validated from [semantichtml.html](../../../../../requirements/semantichtml.html).

---

## Summary

Implement the **CareerCards** block—a parent-child block displaying related content cards under a configurable section heading (e.g., "You may also like"). Each card has an image, category tag, title, and CTA link. Layout: horizontal on desktop, vertical on tablet/mobile.

**Design Reference:**
- **Desktop (Image 1):** 3 cards horizontal, soft gradient background, rounded corners, shadow
- **Tablet/Mobile (Image 2):** 3 cards vertical stack, "Read more" link with arrow icon

---

## Phase 1: Backend Configuration (XWalk)

### Task 1.1: Create block-level XWalk configuration

**Objective:** Add CareerCards definitions, models, and filters.

**Actions:**
1. Create `blocks/careercards/_careercards.json` with:
   - **Parent definition (careercards):** `resourceType: core/franklin/components/block/v1/block`, `template: { name: "CareerCards", model: "careercards", filter: "careercards" }`
   - **Child definition (careercard):** `resourceType: core/franklin/components/block/v1/block/item`, `template: { name: "CareerCard", model: "careercard" }`
   - **Parent model (careercards):** `fields: [{ component: "text", name: "sectionHeading", label: "Section Heading", value: "You may also like" }]`
   - **Child model (careercard):** `fields` in order: `image` (reference), `imageAlt` (text), `category` (text), `title` (richtext), `link` (aem-content), `linkText` (text, default "Read more")
   - **Filter:** `{ id: "careercards", components: ["careercard"] }`

2. Update `models/_section.json` filters: add `"careercards"` to the section's `components` array.

**Reference:** [blocks/cards/_cards.json](../../../../../../../blocks/cards/_cards.json), [implementation-guide.md - Block with Items (Parent + Child)](../../../implementation-guide.md)

---

### Task 1.2: Run build and validate JSON

**Objective:** Merge config and ensure valid output.

**Actions:**
1. Run `npm run build:json`
2. Verify `component-definition.json` contains careercards and careercard definitions
3. Verify `component-models.json` contains careercards and careercard models
4. Verify `component-filters.json` contains careercards filter
5. Verify `_section.json` filter includes careercards

---

### Task 1.3: Human test – Backend configuration

**Objective:** Confirm block is available in AEM/Universal Editor.

**Human actions:**
1. Deploy to AEM/Universal Editor (or local preview if applicable)
2. Open a page, add a section
3. Confirm "CareerCards" appears in block picker
4. Add CareerCards block, confirm section heading field appears
5. Add 3+ CareerCard items, confirm fields: Image, Alt, Category, Title, Link, Link Text
6. Save and publish

**Exit criteria:** Block is authorable; all fields save correctly.

---

## Phase 2: Request User-Provided Semantic HTML (MANDATORY)

### Task 2.1: Obtain semantic HTML from Universal Editor

**Objective:** Get actual DOM structure for index-based implementation.

**Human actions:**
1. Author CareerCards in Universal Editor with sample content:
   - Section heading: "You may also like"
   - 3 cards with image, category (e.g., "Sustainability"), title, link, link text
2. View page source or use DevTools to copy the generated HTML
3. Provide the HTML (including root `<div class="careercards">`) to the development team

**Reference:** [implementation-guide.md - Request User to Provide Semantic HTML](../../../implementation-guide.md)

---

### Task 2.2: Document structure contract

**Objective:** Record field indices and DOM structure for JS/CSS.

**Actions:**
1. Analyze user-provided HTML
2. Document in `careercards.js` JSDoc:
   - `block.children[0]` = section heading row (parent)
   - `block.children[1+]` = card item rows (children)
   - Per card row: `row.children[0]` = image, `[1]` = imageAlt, `[2]` = category, `[3]` = title, `[4]` = link, `[5]` = linkText
3. Note empty-field behavior (missing cells vs empty cells)

**Note:** Actual indices may differ; use user-provided HTML as source of truth.

---

## Phase 3: Frontend – JavaScript

### Task 3.1: Create careercards.js with decorate()

**Objective:** Implement block decoration with index-based extraction.

**Actions:**
1. Create `blocks/careercards/careercards.js`
2. Export default `decorate(block)` function
3. Process parent: `block.children[0]` → section heading
4. Process children: `block.children[1+]` → card items
5. Per card: extract image, category, title, link, linkText using index-based access
6. Use `moveInstrumentation()` when transforming DOM
7. Build structure: section heading + card list (e.g., `<ul>` or `<div>` with card wrappers)
8. Add CSS classes: `careercards-heading`, `careercards-list`, `careercards-card`, `careercards-card-image`, `careercards-card-tag`, `careercards-card-title`, `careercards-card-cta`
9. Use `createOptimizedPicture()` for images; handle wrapped `<p>` and `.href` fallback for links

**Reference:** [blocks/cards/cards.js](../../../../../../../blocks/cards/cards.js), [implementation-guide.md - Pattern 2](../../../implementation-guide.md)

---

### Task 3.2: Human test – JavaScript structure

**Objective:** Verify DOM transformation and content extraction.

**Human actions:**
1. Load page with CareerCards block
2. Inspect DOM: confirm section heading and card structure
3. Confirm images load, links work, category/title display
4. Check browser console for errors

**Exit criteria:** Block renders; no JS errors; content displays correctly.

---

## Phase 4: Frontend – CSS

### Task 4.1: Desktop styles

**Objective:** Match desktop design (horizontal cards, gradient, rounded corners, shadow).

**Actions:**
1. Create `blocks/careercards/careercards.css`
2. Section: soft gradient background (light yellow-green to pale blue-green)
3. Heading: large, dark sans-serif
4. Cards container: `display: grid` or `flex`, horizontal layout, gap
5. Card: rounded corners, shadow, full-bleed image, overlay for tag and title
6. Category tag: white rounded rectangle, top-left
7. Title: white text overlay at bottom, multi-line

**Reference:** Design Image 1 (desktop)

---

### Task 4.2: Responsive styles (tablet/mobile)

**Objective:** Vertical stack on smaller viewports; show "Read more" CTA.

**Actions:**
1. Add breakpoint (e.g., `max-width: 768px` or `900px`)
2. Switch to single-column layout
3. Show "Read more" link with arrow icon (→ in circle)
4. Ensure touch targets and spacing

**Reference:** Design Image 2 (tablet/mobile)

---

### Task 4.3: Human test – Visual and responsive

**Objective:** Verify design match and responsiveness.

**Human actions:**
1. Desktop: confirm horizontal layout, gradient, card styling
2. Resize to tablet/mobile: confirm vertical stack, "Read more" visible
3. Test hover/click on cards and CTA
4. Verify images have correct aspect ratio and object-fit

**Exit criteria:** Design matches images; responsive behavior correct.

---

## Phase 5: Accessibility and Performance

### Task 5.1: Accessibility

**Objective:** Meet WCAG requirements.

**Actions:**
1. Ensure images have `alt` from imageAlt field
2. Ensure cards/links are keyboard navigable
3. Use semantic elements (`<h2>` for heading, `<a>` for links)
4. Verify contrast (white text on image overlay)

---

### Task 5.2: Performance

**Objective:** Optimize loading.

**Actions:**
1. Use `createOptimizedPicture()` for responsive images
2. Consider `loading="lazy"` for below-fold cards if applicable

---

### Task 5.3: Human test – Accessibility and performance

**Objective:** Validate a11y and load behavior.

**Human actions:**
1. Tab through block; confirm focus order
2. Run axe or similar a11y tool
3. Check Network tab for image optimization

**Exit criteria:** No critical a11y issues; images optimized.

---

## Phase 6: Integration and Final Validation

### Task 6.1: Lint and build

**Objective:** Ensure code quality.

**Actions:**
1. Run `npm run lint`
2. Fix any lint errors

---

### Task 6.2: Human test – End-to-end

**Objective:** Full authoring and publish flow.

**Human actions:**
1. Author CareerCards with 3+ cards in Universal Editor
2. Verify all fields save
3. Publish; verify block renders correctly
4. Test card click → navigation to detail page
5. Test on multiple viewports

**Exit criteria:** All [acceptance criteria](../../../../../requirements/careercards.md) met.

---

## Implementation Checklist

| Phase | Task | Status |
|-------|------|--------|
| 1 | 1.1 Create _careercards.json and update _section.json | ✅ |
| 1 | 1.2 Run build:json, validate | ✅ |
| 1 | 1.3 Human test – Backend | ⬜ |
| 2 | 2.1 Obtain user-provided HTML | ✅ |
| 2 | 2.2 Document structure contract | ✅ |
| 3 | 3.1 Create careercards.js | ✅ |
| 3 | 3.2 Human test – JS | ⬜ |
| 4 | 4.1 Desktop CSS | ✅ |
| 4 | 4.2 Responsive CSS | ✅ |
| 4 | 4.3 Human test – Visual | ⬜ |
| 5 | 5.1–5.3 Accessibility and performance | ✅ |
| 6 | 6.1–6.2 Lint and E2E test | ✅ (lint) / ⬜ (E2E) |

---

## XWalk Model Summary (Planned)

**careercards (parent):**
- `sectionHeading` (text, default "You may also like")

**careercard (child):**
- `image` (reference)
- `imageAlt` (text)
- `category` (text)
- `title` (richtext)
- `link` (aem-content)
- `linkText` (text, default "Read more")

**Note:** Field order must match user-provided HTML; adjust indices in Task 2.2 if needed.

---

## Structure Contract (Validated from semantichtml.html)

**Actual Universal Editor output uses 4 cells per card (not 6):**
- `row.children[0]` = image (picture; alt in img.alt)
- `row.children[1]` = category
- `row.children[2]` = title
- `row.children[3]` = link (empty div or anchor; linkText = anchor textContent)

---

## References

- [Implementation Guide](../../../implementation-guide.md)
- [Requirements](../../../../../requirements/careercards.md)
- [Existing cards block](../../../../../../../blocks/cards/)
- [Section filter](../../../../../../../models/_section.json)
