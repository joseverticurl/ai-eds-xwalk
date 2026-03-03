# User Story: “You may also like” (Related Content Cards) — Desktop + Mobile

**User type:** Site Visitor (Guest User)  
**As a** site visitor, **I want** to see related content recommendations in a visually engaging card layout, **so that** I can discover and navigate to additional relevant articles/pages.

---

## Acceptance Criteria

### Content & Layout (All viewports)
1. Component displays:
 - **Section Title** (e.g., “You may also like”)
 - A list of **Recommendation Cards** (minimum 1)
2. Each Recommendation Card displays:
 - **Category Tag** (pill label, e.g., “Sustainability”)
 - **Card Image** (background/thumbnail)
 - **Card Title** (overlay text on image)
 - **Navigation affordance** (Desktop: icon/button as designed; Mobile/Tablet: “Read more” text + icon as designed)
3. Clicking/tapping a card navigates to the authored destination URL (**entire card is clickable**).
4. If a card image fails to load, a **default placeholder** image is displayed.
5. Component is responsive and does not clip/overlap content across Desktop/Tablet/Mobile.

---

## Desktop Behavior (per design)
6. Desktop displays cards in a **horizontal row** (e.g., 3 cards visible).
7. If more cards exist than visible capacity:
 - Provide a **Next/Scroll control** (e.g., circular arrow button as per design) to reveal additional cards.
 - Interaction may be click (button) and/or horizontal scroll; final behavior must match the approved design.
8. Desktop background styling (e.g., subtle gradient) is displayed as per design.

---

## Mobile/Tablet Behavior (per design)
9. Mobile/Tablet displays cards in a **vertical list** (stacked).
10. Each card shows a **“Read more”** affordance (text + icon) as per design.
11. Any desktop-only background treatment is not shown on Mobile/Tablet unless specified in mobile design.

---

## Accessibility
12. Section title uses a semantic heading level (configurable per page context).
13. Each card has an accessible name using **Title** (and optionally Tag).
14. Interactive elements (card link, next button) are keyboard operable with visible focus state.
15. Images have appropriate alt handling:
 - If decorative, use empty alt (`alt=""`).
 - If meaningful, alt comes from authored field and/or referenced page metadata (if configured).

---

## Scenarios (Given / When / Then)

### Scenario 1 — Desktop rendering (Guest)
**Given** the user is on a page containing the “You may also like” component on Desktop  
**When** the component enters the viewport  
**Then** the user sees the section title and a row of recommendation cards  
**And** each card shows tag, title, and image as designed.

### Scenario 2 — Desktop navigation to more cards (Guest)
**Given** more cards are authored than can be displayed at once  
**When** the user clicks the next/scroll control  
**Then** additional cards are revealed in the same component.

### Scenario 3 — Mobile rendering (Guest)
**Given** the user is on a page containing the component on Mobile/Tablet  
**When** the component is in the viewport  
**Then** the user sees the section title and cards stacked vertically  
**And** each card includes a “Read more” affordance as designed.

### Scenario 4 — Card click-through (Guest)
**Given** a recommendation card is visible  
**When** the user clicks/taps the card  
**Then** the user is navigated to the authored destination.

### Scenario 5 — Image failure handling (Guest)
**Given** a card image cannot be loaded  
**When** the card is rendered  
**Then** a default placeholder image is shown and the title/tag remain visible.

---

## Authoring (AEM)

**User type:** Content Author

### Component-level fields
- **Section Title** — *Max 42 chars (info note only; no validation)*
- **Recommendations Source** — **Dropdown**:
- Manual (Curated list)
- Automatic (By tag) *(optional, if supported)*
- **Max items to display** — numeric (optional)

### Manual Recommendations (repeatable multifield)
Each item supports:
- **Link** — select an AEM Page (path browser) or external URL
- **Card Title** — *Max 80 chars (info note only; no validation)*  
- If omitted and link is internal, fallback to linked page Title
- **Category Tag/Label** — *Max 20 chars (info note only; no validation)*  
- If omitted and link is internal, optional fallback to linked page tag
- **Card Image** — select from **DAM**  
- If omitted and link is internal, optional fallback to page/social image
- **Alt Text** — *Max 120 chars (info note only; no validation)* (optional)
- **CTA Text** — default “Read more” (author override optional)

### Automatic Recommendations (By tag) *(optional, if supported)*
- **Filter Tag** — single tag
- **Sort order** — Most recent / Manual order / Relevance (if available)

### Save behavior
- Author can **save** and **publish** changes.

> **Dev note:** Display character limits as info notes on AEM fields; do not implement hard character validation.