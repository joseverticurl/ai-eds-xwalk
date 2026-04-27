# User Story: You May Also Like Component (`youmayalsolike`)
**Platform:** AEM Edge Delivery Services (EDS)  
**Authoring Tool:** Universal Editor

---

# 1. User Story (End User)

**As a** website visitor  
**I want** to see related articles in a **“You may also like”** section  
**So that** I can easily discover additional relevant content and continue exploring the site.

---

# 2. Component Name

This component displays **related content cards** with image backgrounds, article titles, category tags, and navigation links.

---

# 3. Functional Overview

The **youmayalsolike** component displays a set of article cards dynamically retrieved from selected content references.

Each card includes:

- Background image
- Category label
- Article title
- Link to article
- Mobile "Read more" CTA

The component supports **dynamic card layout behavior** based on the number of cards.

---

# 4. Card Count Rules (Dynamic Layout)

The component supports:

- **Minimum:** 2 cards  
- **Maximum:** 3 cards

### Layout Behavior

| Number of Cards | Desktop | Tablet | Mobile |
|-----------------|--------|--------|--------|
| 3 Cards | 3 columns (33.33% each) | 2 columns | 1 column |
| 2 Cards | 2 columns (50% each) | 2 columns | 1 column |

### Behavior

- Cards automatically resize to fill available width.
- Layout adjusts depending on the number of cards configured.
- Consistent spacing and responsive scaling maintained.

### Validation

- If **less than 2 cards**, the component **does not render**.
- If **more than 3 cards**, **only the first 3 cards are displayed**.

---

# 5. Desktop Experience

## Layout

- Section title: **You may also like**
- Cards displayed in a **responsive grid**
- Rounded corners
- Image overlay gradient for readability

## Card Elements

Each card contains:

1. **Category Tag**
   - Top-left pill label
   - Example: `Sustainability`

2. **Background Image**
   - Full card image
   - Responsive scaling

3. **Article Title**
   - Positioned near bottom
   - Multi-line truncation supported

4. **Clickable Area**
   - Entire card navigates to the article page

---

# 6. Mobile Experience

## Layout

- Cards stacked vertically
- Full-width card layout
- Adequate spacing between cards

## Card Elements

1. Category tag  
2. Article title  
3. Background image  
4. **Read More CTA**

Example CTA:

---

# 7. Visual Styling

## Gradient Aura Background

The **background gradient aura** is configurable by authors.

It is applied as a **CSS class on the component container**.

### Example Aura Styles

- `aura-creative`
- `aura-health`
- `aura-sustainability`
- `aura-light`
- `aura-dark`

### Example HTML Output
