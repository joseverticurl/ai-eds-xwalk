# User Story: Talent/Testimonial Media Cards (Desktop + Mobile)

**User type:** Site Visitor (Guest User)  
**As a** site visitor, **I want** to view an engaging “team/testimonial” section with media cards and a clear call-to-action, **so that** I can quickly understand the message and navigate to learn more (e.g., careers).

---

## Acceptance Criteria

### Content & Layout (All viewports)
1. Component displays the following elements (if authored):
- **Section Title** (supports 2-line styling)
- **Description/Body copy**
- **Media Card(s)** (each card includes: image, person name, role/label, quote text (optional), and media control if applicable)
- **Primary CTA button** (label + link)
2. Component is responsive and adapts to **Desktop / Tablet / Mobile** viewport widths without overlap/cutoff.

### Desktop behavior (per desktop design)
3. Desktop shows a **multi-card layout** (e.g., up to 3 cards visible at once as designed).
4. Desktop supports **drag interaction** to move through cards when the card set exceeds the visible area (drag affordance may be shown).
5. Background styling/graphics (e.g., gradient/pattern) are displayed the same on Desktop and Mobile/Tablet.

### Mobile/Tablet behavior (per mobile design)
6. Mobile/Tablet shows a **single prominent card** (or stacked/scrollable card presentation) with the same authored content.
7. Interaction for browsing cards on Mobile/Tablet is **swipe/scroll** (no desktop-only drag UI required).
8. Background styling is the **same** on Desktop and Mobile/Tablet (no viewport-specific background treatment).

### Media behavior (per card)
9. A card may have **optional media** (e.g., video/audio):
- If media exists, show **only the play control** as per design (no extra player chrome beyond what the chosen player enforces).
- If media fails to load, show message: **“Media unavailable”** (wording may be adjusted to match product copy standards).
10. If the **image fails** to load, show a **default placeholder** image.

### Accessibility & Usability
11. CTA is keyboard-focusable and has an accessible name matching the authored label.
12. Media controls (play/pause) are keyboard accessible and screen-reader identifiable (e.g., “Play testimonial video”).

---

## Scenarios (Given / When / Then)

### Scenario 1 — Desktop rendering (Guest)
**Given** the user is on a page containing the “Talent/Testimonial Media Cards” component on Desktop  
**When** the component is in the viewport  
**Then** the user sees the section title, cards (multi-card layout), description, and CTA button  
**And** the background styling matches the design (gradient/pattern)  
**And** cards do not overlap or clip.

### Scenario 2 — Desktop card navigation (Guest)
**Given** the component contains more cards than can be shown at once on Desktop  
**When** the user drags the card area  
**Then** the card set scrolls/moves to reveal additional cards.

### Scenario 3 — Mobile rendering (Guest)
**Given** the user is on a page containing the component on Mobile/Tablet  
**When** the component is in the viewport  
**Then** the user sees the same authored title, card content, description, and CTA  
**And** the layout matches the mobile design (single prominent card)  
**And** the background styling is the same as Desktop.

### Scenario 4 — Media playback (Guest)
**Given** a card has authored media (video/audio)  
**When** the user taps/clicks play  
**Then** media playback starts using the configured player behavior  
**And** only the expected control(s) are visible per design/player constraints.

### Scenario 5 — Media failure handling (Guest)
**Given** a card has authored media  
**When** the media cannot load  
**Then** the component shows **“Media unavailable”** in the media area.

---

## Authoring (AEM)

**User type:** Content Author

### Component-level fields
- **Section Title (Line 1)** — *Max 42 chars (info note only; no validation)*
- **Section Title (Line 2)** — *Max 42 chars (info note only; no validation)*
- **Description/Body copy** — *Max 150 chars (info note only; no validation)*
- **CTA Label** — *Max 25 chars (info note only; no validation)*
- **CTA Link** — internal/external URL
- **Background styling option** (e.g., default/none) — optional (gradient/pattern applied same on desktop and mobile)

### Card multifield (repeatable)
Each card supports:
- **Image** (required; fallback placeholder if missing at runtime)
- **Name/Title** — *Max 40 chars (info note only)*
- **Role/Label** — *Max 40 chars (info note only)*
- **Quote text** — *Optional; for Quote-type cards (testimonial quote). Max 200 chars (info note only)*
- **Media type** — None / Video / Audio
- **Media source** — AEM asset or external (e.g., YouTube) (if Video)
- **Media thumbnail** — optional
- **Error message override** — optional (default “Media unavailable”)

### Save behavior
- Author can **save** and **publish** changes.

> **Dev note:** Show character limits as info notes on AEM fields; do not implement hard character validation.