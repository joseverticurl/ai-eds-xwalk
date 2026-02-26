# Implementation Plan: Text with Image/GIF Block

**Specific Functionality:** textwithimagegif  
**Guide:** [eds-guide / EDS-2026.1.0 / creating-eds-block](../../../implementation-guide.md)  
**Date:** 2026-02-26  
**Version:** v1

---

## 1. Overview

### 1.1 User Story

> As a site visitor, I want the content presented in an engaging manner, so that I can read and explore further as directed, to learn more.

### 1.2 Acceptance Criteria Summary

| Criteria | Details |
|---------|---------|
| **Content visibility** | Image asset with title, tag (badge), and description shall be visible |
| **Asset type** | Asset may be an image or GIF |
| **Layout** | Image/GIF is left-aligned (desktop/tablet); on mobile, image appears on top of text |
| **GIF behavior** | GIFs should loop a maximum of 3 times to avoid distraction |
| **Background** | Curved circle background is animated and rotates continuously (360° in 10–15 sec) |
| **Tags vs CTA** | Tags or CTA — only one option visible at a time |
| **Tags** | Max 3 tags; each may have text and emoji; on mobile, tags wrap to 2 rows |

### 1.3 Design References

| Breakpoint | Figma URL |
|------------|-----------|
| Desktop | [node-id=4363:60354](https://www.figma.com/design/ll3RkqQHJd5djDIcbnpnF2/bibigo?node-id=4363-60354) |
| Desktop 1280 | [node-id=4363:63137](https://www.figma.com/design/ll3RkqQHJd5djDIcbnpnF2/bibigo?node-id=4363-63137) |
| Component with CTA | [node-id=6220:27723](https://www.figma.com/design/ll3RkqQHJd5djDIcbnpnF2/Bibigo?node-id=6220-27723) |
| Tablet | [node-id=4363:63613](https://www.figma.com/design/ll3RkqQHJd5djDIcbnpnF2/bibigo?node-id=4363-63613) |
| Mobile | [node-id=4363:64058](https://www.figma.com/design/ll3RkqQHJd5djDIcbnpnF2/bibigo?node-id=4363-64058) |

### 1.4 Requirements Document

[Gif-260226-110734.pdf](../../../../requirements/Gif-260226-110734.pdf)

---

## 2. Content Model (XWalk Fields)

| Field | Component | Label | Max Chars | Required | Notes |
|-------|-----------|-------|-----------|----------|------|
| sectionTitle | text | Section Title | 42 | No | Info note only; no validation |
| description | richtext | Description/Text | 150 | No | Info note only; explore RTE capability |
| image | reference | Image/GIF | — | Yes | Aspect ratio 16:9 or 4:3 |
| imageAlt | text | Alt | — | No | Collapsed with image |
| imageBadge | text | Image Badge | — | No | e.g., "Mmmm!", "Dunked!" |
| backgroundVector | reference | Background Vector | — | No | Optional rotating shape |
| tag1 | text | Tag 1 | — | No | Emoji + text (e.g., "🥢 John Doe") |
| tag2 | text | Tag 2 | — | No | Emoji + text |
| tag3 | text | Tag 3 | — | No | Emoji + text |
| ctaLink | aem-content | CTA Link | — | No | Button/link; mutually exclusive with tags in display |
| ctaText | text | CTA Text | — | No | Button label |

**Display logic:** If CTA (ctaLink) is configured, show CTA; otherwise show tags (tag1, tag2, tag3). Only one visible at a time.

---

## 3. Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | &lt; 768px | Image on top, text below; tags wrap to 2 rows |
| Tablet | 768px – 1279px | Image left, text right; tags wrap |
| Desktop | ≥ 1280px | Image left, text right; tags inline |

---

## 4. Implementation Tasks

### Phase 0: Prerequisites

| # | Task | Details |
|---|------|---------|
| 0.1 | Verify design access | Confirm Figma file `ll3RkqQHJd5djDIcbnpnF2` is accessible |
| 0.2 | Verify requirements | Review [Gif-260226-110734.pdf](../../../../requirements/Gif-260226-110734.pdf) for acceptance criteria |
| 0.3 | Identify reference blocks | Use `hero` (simple block) and `cards` (structure patterns) as references |

---

### Phase 1: Backend — XWalk Configuration (Step 1) ✅

| # | Task | Details |
|---|------|---------|
| 1.1 | ✅ Create block folder | Create `blocks/textwithimagegif/` directory |
| 1.2 | ✅ Create block-level JSON | Create `blocks/textwithimagegif/_textwithimagegif.json` with: |
| | | • **Definition:** `Text with Image/GIF`, id `textwithimagegif`, resourceType `core/franklin/components/block/v1/block`, model `textwithimagegif` |
| | | • **Model:** Fields in order: sectionTitle, description, image, imageAlt, imageBadge, backgroundVector, tag1, tag2, tag3, ctaLink, ctaText |
| | | • **Filter:** Add `textwithimagegif` to section filter in `models/_section.json` or via block-level filters; block has no nested items, so no filter for children |
| 1.3 | ✅ Add section filter | Add `textwithimagegif` to section's allowed components in `models/_section.json` (filters array, section's components list) |
| 1.4 | ✅ Run build | Execute `npm run build:json` |
| 1.5 | **Human test** | Verify `component-definition.json`, `component-models.json`, and `component-filters.json` contain textwithimagegif; run `npm run build:json` and confirm no errors |

---

### Phase 2: Deploy Backend and Obtain User HTML (Step 2)

| # | Task | Details |
|---|------|---------|
| 2.1 | Deploy to AEM | Deploy updated XWalk config to AEM/Universal Editor environment |
| 2.2 | **Human test** | Author the Text with Image/GIF block in Universal Editor with sample content (all fields, tags variant) |
| 2.3 | Request user HTML | Prompt user: "Please author the block in Adobe Universal Editor with sample content (tags variant and CTA variant), then provide the semantic HTML output." |
| 2.4 | Document structure contract | From user-provided HTML, document: field indices, row/cell structure, empty-field behavior |
| 2.5 | **Human test** | Validate structure contract matches model field order; confirm index-based access mapping |

---

### Phase 3: Frontend — JavaScript (Step 3a) ✅

| # | Task | Details |
|---|------|---------|
| 3.1 | ✅ Create `textwithimagegif.js` | Implement `decorate(block)` using index-based access per structure contract |
| 3.2 | Structure transformation | Build DOM: wrapper → image container (with badge overlay) | content container (title, description, tags-or-cta) |
| 3.3 | GIF loop limit | For `<img>` with GIF src, add logic to stop after 3 loops (or use `loop` attribute with JS to detect and stop) |
| 3.4 | Background animation | Add rotating background element; CSS animation 360° in 10–15 sec |
| 3.5 | Tags vs CTA logic | If ctaLink/ctaText present, render CTA; else render tags (tag1, tag2, tag3) |
| 3.6 | **Human test** | Load block with user-provided HTML; verify DOM structure, image/badge placement, tags/CTA display logic |

---

### Phase 4: Frontend — CSS (Step 3b) ✅

| # | Task | Details |
|---|------|---------|
| 4.1 | ✅ Create `textwithimagegif.css` | Base styles: background (#fffbe3), container layout |
| 4.2 | Desktop (≥1280px) | Image left, content right; image -5deg rotation; speech bubble overlay; tags inline |
| 4.3 | Tablet (768px–1279px) | Similar layout; reduced font sizes; tags wrap |
| 4.4 | Mobile (&lt;768px) | Stack: image on top, content below; tags wrap to 2 rows |
| 4.5 | Typography | Map Figma tokens: Malik (Semi Bold) for headings, Averta Std PE for body; colors: #004122, #003017, #f85001, #f97334, #f8dc83 |
| 4.6 | Background animation | `@keyframes` rotate 360° over 10–15s; `animation: rotate 12s linear infinite` (or similar) |
| 4.7 | **Human test** | Verify layout at Desktop 1280, Tablet, Mobile; check rotating background; verify tag/CTA styling |

---

### Phase 5: Integration and Registration

| # | Task | Details |
|---|------|---------|
| 5.1 | Register block | Ensure block is loaded via `loadBlock()` / block collection (verify project's block loading mechanism) |
| 5.2 | Add to section filter | Confirm `textwithimagegif` appears in section's component list in Universal Editor |
| 5.3 | **Human test** | Add block to a page in Universal Editor; configure all fields; save and preview |

---

### Phase 6: AEM Authoring Validation

| # | Task | Details |
|---|------|---------|
| 6.1 | Author tags variant | Configure section title, description, image, badge, 3 tags; no CTA |
| 6.2 | Author CTA variant | Configure section title, description, image, badge, CTA; no tags |
| 6.3 | Author minimal variant | Only required fields (image); verify empty optional fields don't break layout |
| 6.4 | **Human test** | Publish page; verify on author and publish; test responsive behavior; verify GIF loop limit (if GIF used) |

---

### Phase 7: Optional — Unit Testing

| # | Task | Details |
|---|------|---------|
| 7.1 | Create `textwithimagegif.test.js` | Unit tests for `decorate()`: structure output, tags vs CTA logic, empty fields |
| 7.2 | **Human test** | Run test suite; all tests pass |

---

## 5. File Deliverables

| File | Purpose |
|------|---------|
| `blocks/textwithimagegif/_textwithimagegif.json` | XWalk definition, model, filter |
| `blocks/textwithimagegif/textwithimagegif.js` | `decorate()` implementation |
| `blocks/textwithimagegif/textwithimagegif.css` | Block styles |
| `blocks/textwithimagegif/textwithimagegif.test.js` | Optional unit tests |

---

## 6. Clarifications and Assumptions

| Item | Assumption / Clarification |
|------|----------------------------|
| **Tags structure** | Three optional text fields (tag1, tag2, tag3); author enters "🥢 John Doe" — emoji is part of text |
| **CTA structure** | `aem-content` for link + `text` for label; or reference to button component — confirm with project's button usage |
| **RTE for description** | Requirements ask to explore RTE; using `richtext` component; confirm AEM supports it for this block |
| **Char limits** | 42 (title), 150 (description) — info notes in AEM only; no validation implemented |
| **GIF loop limit** | Implement via JS: listen for GIF animation end or use `loop` attribute with custom logic; GIF format may not support loop count natively — may need video fallback or accept 3-loop as best-effort |
| **Background vector** | Optional reference; if provided, use as rotating background image; animation via CSS |

---

## 7. Success Criteria

- [ ] Block appears in Universal Editor under Blocks
- [ ] All fields (section title, description, image, badge, tags, CTA, background) are authorable
- [ ] Tags or CTA displayed (only one at a time)
- [ ] Image/GIF left-aligned on desktop/tablet; on top on mobile
- [ ] Background rotates continuously (10–15 sec per 360°)
- [ ] GIF loops max 3 times (where technically feasible)
- [ ] Responsive at 1280px, 768px, and mobile breakpoints
- [ ] Matches Figma design for Desktop, Desktop 1280, Tablet, Mobile

---

## 8. Traceability

| Requirement | Implementation |
|-------------|----------------|
| Image with title, tag, description visible | Model fields: image, imageAlt, sectionTitle, imageBadge, description |
| Asset may be image or GIF | `reference` field supports both |
| Image left-aligned | CSS layout: flex/grid, image first |
| GIF loop max 3 | JS in Phase 3.3 |
| Tags or CTA only one | JS logic in Phase 3.5 |
| Max 3 tags | tag1, tag2, tag3 fields |
| Tags wrap on mobile | CSS flex-wrap in Phase 4.4 |
| Background rotates 10–15 sec | CSS animation in Phase 4.6 |
| Char limits as info note | AEM field descriptions (no validation) |
