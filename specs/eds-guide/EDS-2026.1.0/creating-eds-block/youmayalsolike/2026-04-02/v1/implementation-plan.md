# Implementation Plan: You May Also Like

**Guide:** [eds-guide / EDS-2026.1.0 / creating-eds-block](../../implementation-guide.md)  
**Specific Functionality:** youmayalsolike  
**Date:** 2026-04-02  
**Version:** v1  
**Requirements:** [specs/requirements/youmayalsolike.md](../../../../../../requirements/youmayalsolike.md)  
**Design:** [Desktop](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=1-1691&m=dev) | [Mobile](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=1-1703&m=dev)  
**Reference blocks:** [blocks/cards](../../../../../../../blocks/cards), [blocks/featurecardscarousel](../../../../../../../blocks/featurecardscarousel)

---

## Summary

Implement a **You May Also Like** block that shows **2–3** related article cards with background image, category pill, title, and full-card link. **Mobile** adds a **Read more** label with icon. Section **aura** (background treatment) is author-selectable via CSS class on the wrapper. **&lt;2** cards → block does not render; **&gt;3** → first three only.

---

## Requirements Summary

| Element | Spec |
|---------|------|
| **Cards** | Min 2, max 3 (slice if more) |
| **Layout** | 3 cards: desktop 3 cols, tablet 2 cols, mobile 1 col; 2 cards: desktop 2 cols, tablet 2, mobile 1 |
| **Aura** | Configurable classes: `aura-creative`, `aura-health`, `aura-sustainability`, `aura-light`, `aura-dark` |
| **Per card** | Image, category, title, link; mobile **Read more** CTA |

---

## Breakpoints (Figma + story)

| Viewport | Width (reference) | Notes |
|----------|-------------------|--------|
| Mobile | 375 | Stacked cards, Read more |
| Tablet | (story: 2 columns for 3 cards) | No separate Figma frame — align to project breakpoints |
| Desktop | 1440 | 3×440px cards, 20px gap, 50px title-to-grid |

---

## Phases

### Phase 1: Backend

- [x] `blocks/youmayalsolike/_youmayalsolike.json` — parent `youmayalsolike`, child `youmayalsolikeitem`, filter `youmayalsolike`
- [x] `npm run build:json`

### Phase 2: User HTML (Universal Editor)

- [ ] Author blocks in UE; paste **semantic HTML** into the project. **Do not** treat Cursor-generated HTML as the contract until it matches UE output.
- [ ] Document final row/cell order if it differs from the assumed contract in `youmayalsolike.js`.

### Phase 3: Frontend

- [x] `youmayalsolike.js` — `decorate()` (index-based; validate against UE HTML)
- [x] `youmayalsolike.css` — spacing from Figma audit; aura hooks; responsive grid
- [x] Unit tests (`blocks/youmayalsolike/youmayalsolike.test.js`); `npx eslint` / `npx stylelint` on this block pass

### Phase 4: QA

- [ ] Published or stable preview URL for visual compare vs Figma at **1440px** and **375px** (and tablet width used in CSS)

---

## Demo page URL (record after publish)

_Paste the published page URL that contains this block for visual QA._

---

## Structure contract (assumed — confirm with UE HTML)

**Parent rows** (first rows in the block):

1. `block.children[0]` — section title  
2. `block.children[1]` — aura (select value as text)

**Each card** is one row with four cells (max cells per XWalk lint rule):

- `cells[0]` — picture (reference image; alt from asset or `<img alt>`)  
- `cells[1]` — category  
- `cells[2]` — article title  
- `cells[3]` — article link (`a`)

_If the actual UE output uses different row/column order, update this section and `decorate()` accordingly._
