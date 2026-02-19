# User Story for “You May Also Like” Related Articles Component

## Title
Related Articles – 3 Card Recommendation Component

## As a
User

## I want to
See related articles displayed at the end (or within) a page

## So that
I can easily discover and navigate to additional relevant content.

---

## Description
The component displays 3 related article cards with image, category tag, title, and a “Read more” call-to-action.

---

## Acceptance Criteria

### General
- The section title “You may also like” is displayed above the cards.
- Exactly 3 related article cards are shown.
- Each card includes:
  - Featured image
  - Category tag (e.g., Sustainability)
  - Article title
  - “Read more” CTA
- Clicking anywhere on the card (or the CTA) navigates to the corresponding article page.
- Cards are dynamically populated based on related content logic (e.g., tag/category).

---

### Desktop View
- The 3 cards are displayed in a horizontal row (3-column layout).
- Cards are evenly spaced with consistent sizing.
- Images have a visual overlay to ensure text readability.
- Hover state:
  - Subtle visual feedback (e.g., slight elevation, shadow, or image zoom).
- Layout is responsive within large screen breakpoints.

---

### Mobile View
- The section title “You may also like” appears at the top.
- The 3 cards are stacked vertically (single-column layout).
- Each card spans full width of the container.
- Adequate spacing between cards for touch interaction.
- Tapping a card navigates to the related article page.
- Text and images scale appropriately for smaller screens.

---

## Definition of Done
- Component is reusable within EDS AEM.
- Authors can configure or auto-populate related articles.
- Fully responsive across desktop and mobile.
- Accessibility standards are met (alt text, keyboard navigation, proper contrast).
