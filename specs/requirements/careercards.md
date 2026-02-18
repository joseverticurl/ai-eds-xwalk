# User Story – CareerCards Component

## Title
As a website visitor, I want to see related career or content cards so that I can easily explore similar or relevant opportunities and articles.

---

## Description
The **CareerCards** component displays a set of visually rich cards under a section heading (e.g., "You may also like"). Each card contains an image, category/tag label, title, and a call-to-action such as "Read more." The component is designed to increase engagement and encourage users to explore additional related content.

---

## User Story
As a user,  
I want to view related content in the CareerCards section,  
So that I can quickly navigate to similar opportunities or articles of interest.

---

## Acceptance Criteria

1. The component should display a configurable section heading (default: **"You may also like"**).
2. The component should render a configurable number of cards (minimum 3).
3. Each card should include:
   - Featured image
   - Category/Tag label (e.g., Sustainability)
   - Title (multi-line support)
   - CTA link (e.g., "Read more")
4. Clicking the card or CTA should navigate to the respective detail page.
5. The component should support responsive behavior (desktop, tablet, mobile).
6. Cards should maintain consistent spacing, alignment, and styling.
7. Content should be authorable via CMS (e.g., fragment, model, or manual selection).

---

## Non-Functional Requirements

- Component should follow accessibility standards (alt text for images, keyboard navigation).
- Should be optimized for performance (lazy loading images where applicable).
- Should support reusable styling and scalability.
