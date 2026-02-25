# Implementation Plan: Text with Image/Video Block (textwithimage)

**Functionality:** Text with Image/Video (Centre Aligned)  
**Guide:** [EDS-2026.1.0 creating-eds-block](../implementation-guide.md)  
**Date:** 2026-02-25  
**Version:** v1  

**Phase 1 Status:** ✅ Complete (Backend) | **Phase 2:** ✅ Complete (Structure documented) | **Phase 3:** ✅ Complete (Frontend)

---

## 1. Overview

### 1.1 Purpose

Implement a new EDS block **textwithimage** that displays centered text content (tag, title, description) with an image or video media element. The block supports both image and video media types and follows a centre-aligned layout per the [requirements document](../../../../../requirements/text-with-media.pdf).

### 1.2 Design References

| Viewport | Figma URL |
|----------|-----------|
| Desktop | [node 4272:37135](https://www.figma.com/design/ll3RkqQHJd5djDIcbnpnF2/bibigo?node-id=4272-37135&m=dev) |
| Tablet | [node 4272:37252](https://www.figma.com/design/ll3RkqQHJd5djDIcbnpnF2/bibigo?node-id=4272-37252&m=dev) |
| Mobile | [node 4272:37339](https://www.figma.com/design/ll3RkqQHJd5djDIcbnpnF2/bibigo?node-id=4272-37339&m=dev) |

### 1.3 Design Specifications (from Figma)

**Structure:**
- Section container with gradient background (cream/white)
- Optional decorative elements (wavy shapes left/right) — Desktop only
- Text section: Tag → Title → Description (all center-aligned)
- Media section: Image or video with optional play icon overlay

**Typography:**
- Tag: Small, semi-bold, green accent (e.g., #289200)
- Title (H2): Large, semi-bold, dark green (e.g., #004122)
- Description: Body text, regular weight, dark (e.g., #001206)

**Responsive breakpoints:**
| Viewport | Tag/Paragraph | H2 | Media radius | Section padding |
|----------|---------------|-----|--------------|-----------------|
| Desktop  | 16px          | 32px | 24px         | 80px horizontal, 36px vertical |
| Tablet   | 14px          | 28px | 20px         | 44px horizontal, 28px vertical |
| Mobile   | 14px          | 24px | 16px         | 20px horizontal, 24px vertical |

---

## 2. XWalk Model (Content Structure)

### 2.1 Proposed Fields

| Index | Field Name | Component Type | Label | Purpose |
|-------|------------|---------------|-------|---------|
| 0 | tag | text | Tag | Category label (e.g., "About Bibigo", "Partnership Story") |
| 1 | title | text | Title | Main heading |
| 2 | description | richtext | Description | Body text |
| 3 | media | reference | Media | Image or video asset |
| 4 | mediaAlt | text | Alt | Alt text for accessibility |
| 5 | mediaType | select | Media Type | "image" or "video" — determines play icon overlay |

**Structure contract (for JavaScript):**
- `block.children[0]` = tag row
- `block.children[1]` = title row
- `block.children[2]` = description row
- `block.children[3]` = media row (cells: media URL, mediaAlt — same row per hero pattern)
- `block.children[4]` = mediaType row (optional; if empty, infer from media)

**Note:** Field order must match the structure contract. Validate with user-provided HTML in Step 2. AEM may combine consecutive fields (e.g., media + mediaAlt) into one row with multiple cells.

---

## 3. Implementation Tasks

### Phase 1: Backend (Step 1)

#### Task 1.1: Create block-level XWalk configuration ✅

**File:** `blocks/textwithimage/_textwithimage.json` *(updated: folder name matches block class for loader)*

**Actions:**
1. Create `blocks/textwithimage/` directory
2. Add `_textwithimage.json` with:
   - **Definition:** id `textwithimage`, title `Text with Image/Video`, resourceType `core/franklin/components/block/v1/block`, model `textwithimage`
   - **Model:** id `textwithimage`, fields array per §2.1 (tag, title, description, media, mediaAlt, mediaType)
   - **Filters:** `[]` (simple block, no nested items)

**Reference:** [implementation-guide.md Part 2: Backend Code Generation](../implementation-guide.md#part-2-backend-code-generation)

**mediaType select options:**
```json
{
  "component": "select",
  "name": "mediaType",
  "label": "Media Type",
  "valueType": "string",
  "value": "image",
  "options": [
    { "name": "Image", "value": "image" },
    { "name": "Video", "value": "video" }
  ]
}
```

---

#### Task 1.2: Register block in section filter ✅

**File:** `models/_section.json`

**Actions:**
1. Add `"textwithimage"` to the `section` filter's `components` array
2. Result: `["text","image","button","title","hero","cards","columns","fragment","textwithimage"]`

---

#### Task 1.3: Run build and verify ✅

**Command:** `npm run build:json`

**Verification:**
- [x] `component-definition.json` contains `textwithimage` definition
- [x] `component-models.json` contains `textwithimage` model with 6 fields
- [x] `component-filters.json` (via section) includes `textwithimage`

---

#### Task 1.4: Human verification — Backend

**Action:** Deploy to AEM/Universal Editor (or local XWalk preview) and confirm:
- [ ] Block appears in authoring UI under Blocks
- [ ] All fields (tag, title, description, media, mediaAlt, mediaType) are editable
- [ ] Block can be added to a section

---

### Phase 2: User Provides Semantic HTML (Step 2)

#### Task 2.1: Request user-provided HTML ✅

**Action:** User provided HTML from `specs/eds-guide/EDS-2026.1.0/creating-eds-block/textwithimage/textwithimage.html`

---

#### Task 2.2: Document structure contract from user-provided HTML ✅

**Documented structure (from user HTML):**
- `block.children[0]` = tag row
- `block.children[1]` = title row
- `block.children[2]` = description row (richtext, preserve innerHTML)
- `block.children[3]` = media row (cell 0: link/img with URL; cell 1: optional mediaAlt)
- `block.children[4]` = mediaType row ("image" | "video")

---

#### Task 2.3: Human verification — Structure contract

**Action:** Review the documented structure contract with the user and confirm:
- [ ] Field order matches AEM output
- [ ] Empty/optional fields behave as expected

---

### Phase 3: Frontend (Step 3)

#### Task 3.1: Create block JavaScript ✅

**File:** `blocks/textwithimage/textwithimage.js`

**Actions:**
1. Implement `decorate(block)` with index-based extraction per structure contract
2. Extract: tag, title, description, media URL, mediaAlt, mediaType
3. Build transformed DOM:
   - `.textwithimage-container` — main wrapper
   - `.textwithimage-copy` — text section (tag, title, description)
   - `.textwithimage-media` — media container (picture/video or img)
   - Play icon overlay when `mediaType === 'video'`
4. Use `createOptimizedPicture()` for images (see `blocks/cards/cards.js`)
5. Handle wrapped `<p>` tags from `wrapTextNodes()` when extracting text
6. Add CSS classes for styling

**Reference:** [implementation-guide.md Part 3b: JavaScript Implementation](../implementation-guide.md#part-3b-javascript-implementation)

**Structure contract (document in JSDoc):**
```javascript
/**
 * Structure contract (index-based):
 * block.children[0] = tag row
 * block.children[1] = title row
 * block.children[2] = description row
 * block.children[3] = media row (cells: media URL, mediaAlt)
 * block.children[4] = mediaType row
 */
```

---

#### Task 3.2: Create block CSS ✅

**File:** `blocks/textwithimage/textwithimage.css`

**Actions:**
1. Style the transformed structure (not the initial AEM HTML)
2. Implement responsive layout per Figma:
   - Desktop: max-width, padding 80px/36px, H2 32px, media radius 24px
   - Tablet: padding 44px/28px, H2 28px, media radius 20px
   - Mobile: padding 20px/24px, H2 24px, media radius 16px
3. Center-align all text
4. Background: gradient or solid per design (from #fffbe3 via white)
5. Media container: rounded corners, object-fit cover
6. Play icon: centered overlay for video (72px size)
7. Optional: decorative elements (desktop only) — can be CSS pseudo-elements or omitted if not in design

**Reference:** [implementation-guide.md Part 3c: CSS Implementation](../implementation-guide.md#part-3c-css-implementation)

---

#### Task 3.3: Register block in block loader ✅

**Action:** Block auto-discovered via `loadBlock()` — block class `textwithimage` loads `blocks/textwithimage/textwithimage.js` and `.css`. No registration needed.

**Reference:** `scripts/aem.js` — `decorateBlock()` adds block class from metadata.

---

#### Task 3.4: Human verification — Frontend (image variant)

**Action:** Test the block with image media:
- [ ] Block renders on page
- [ ] Tag, title, description display correctly and are center-aligned
- [ ] Image displays with correct aspect ratio and rounded corners
- [ ] Layout is responsive (desktop, tablet, mobile)
- [ ] No console errors

---

#### Task 3.5: Human verification — Frontend (video variant)

**Action:** Test the block with video media:
- [ ] Play icon overlay appears on video thumbnail
- [ ] Clicking play (if implemented) triggers video playback
- [ ] Layout matches design

---

#### Task 3.6: Accessibility and performance

**Actions:**
1. Ensure `mediaAlt` is used for `alt` on images
2. Add `aria-label` or similar for video play button if interactive
3. Ensure sufficient color contrast for text
4. Follow [EDS Performance & Lighthouse Best Practices](../implementation-guide.md#appendix-a-eds-performance--lighthouse-best-practices)

---

### Phase 4: End-to-End Validation

#### Task 4.1: Full validation

**Action:** Run through the full flow:
1. Author block in Universal Editor
2. Publish/preview
3. Verify block renders correctly

---

#### Task 4.2: Human sign-off

**Action:** Confirm with user:
- [ ] Block meets design specifications
- [ ] All acceptance criteria from requirements are met
- [ ] Ready for production

---

## 4. File Summary

| File | Action | Status |
|------|--------|--------|
| `blocks/textwithimage/_textwithimage.json` | Create | ✅ Done |
| `blocks/textwithimage/textwithimage.js` | Create | ✅ Done |
| `blocks/textwithimage/textwithimage.css` | Create | ✅ Done |
| `models/_section.json` | Update (add textwithimage to section filter) | ✅ Done |

---

## 5. Dependencies and Notes

- **Block naming:** Folder `text-with-image`, block id `textwithimage` (no hyphen per user selection)
- **Video playback:** If video playback is required, implement click handler to open modal or inline player; play icon overlay is mandatory for video UX
- **Decorative elements:** Figma desktop shows wavy shapes; implement if required, or defer to a follow-up
- **Design tokens:** Use project CSS variables where possible; add block-specific overrides for Bibigo colors if needed

---

## 6. Traceability

| Requirement | Implementation |
|-------------|----------------|
| Text with Image/Video (Centre Aligned) | Section 2.1, Task 3.2 |
| Tag, Title, Description | Model fields 0–2, Task 3.1 |
| Image or Video media | Model fields 3–5, Task 3.1 |
| Responsive layout | Task 3.2 |
| Play icon for video | Task 3.1, 3.2 |

---

*Implementation plan follows [EDS-2026.1.0 creating-eds-block](../implementation-guide.md) and test-driven development with human verification checkpoints.*
