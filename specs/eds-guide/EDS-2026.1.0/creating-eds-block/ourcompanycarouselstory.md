# User Story — `ourcompanycarousel` (Desktop + Mobile)

## Summary
As a site visitor, I want to browse featured company leaders in a carousel so that I can quickly learn who is leading the company and navigate to more details.

---

## User Story
**As a** site visitor  
**I want** an `ourcompanycarousel` component that displays leader/profile cards in a swipeable/clickable carousel  
**So that** I can scan leaders, move between profiles easily, and access more information.

---

## Acceptance Criteria

### Desktop
- The `ourcompanycarousel` displays a section title (e.g., “Meet the people leading the way”) above the carousel.
- Multiple profile cards are visible at once (responsive based on container width).
- Users can navigate between slides using:
- Left/right arrow controls (or equivalent next/previous controls).
- Mouse/trackpad horizontal scrolling (optional but supported if implemented).
- Clicking a card (or its primary action) opens the related leader/profile destination (page, modal, or detail view—per implementation).
- A secondary CTA button (e.g., “Meet all our leaders”) is displayed below the carousel and is clickable.

### Mobile
- The `ourcompanycarousel` shows one primary card at a time (or 1 + partial peek of next card if design supports).
- Users can navigate by swipe gestures (left/right).
- Pagination indicators (dots) show the current position in the carousel (if included in design).
- Tapping a card (or its primary action) opens the related leader/profile destination.
- The “Meet all our leaders” CTA is visible and reachable without layout breaking.

---

## Content / Card Requirements
Each carousel card supports:
- Leader image (with fallback if missing).
- Name.
- Title/role (optional if provided).
- Primary action (e.g., open profile / link icon).

---

## Accessibility
- Carousel controls are keyboard accessible (Tab/Shift+Tab).
- Arrow controls have accessible labels (e.g., “Previous”, “Next”).
- Images include meaningful `alt` text (leader name) or decorative handling when appropriate.
- Focus state is visible on interactive elements.
- Swipe/drag does not block vertical scrolling on mobile.

---

## Definition of Done
- Works responsively for desktop and mobile breakpoints.
- Navigation functions correctly (arrows/keyboard/swipe as applicable).
- Links/actions route to the correct destinations.
- Meets baseline accessibility expectations for interactive components.