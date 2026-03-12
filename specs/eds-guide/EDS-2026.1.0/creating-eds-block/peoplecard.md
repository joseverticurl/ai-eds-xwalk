# User Story — PeopleCards Component

**Component Name:** `peoplecards`  
**Platform:** AEM Edge Delivery Services (EDS) with Universal Editor  
**Viewports:** Desktop and Mobile

---

# 1. Overview

The **PeopleCards component** showcases leadership or team members using a **card carousel layout** with optional **background aura styling**.

Each card displays:

- Profile image
- Name
- Job title
- Navigation arrow/link

The component supports:

- **Desktop:** multi-card carousel
- **Mobile:** swipeable carousel with **partial preview of adjacent cards**
- **Author-controlled background aura/gradient styling**

All content and styling options are configurable via **AEM Universal Editor**.

---

# 2. User Story — End User (Visitor)

## Desktop Experience

**As a website visitor**,  
I want to **see multiple leadership profiles displayed in a carousel layout**,  
so that **I can browse the organization's leadership easily.**

### Acceptance Criteria

- Section displays a **headline**
- **3–4 people cards** visible at once
- Cards are displayed in a **horizontal carousel**
- Users can:
  - Drag the carousel
  - Click navigation arrows
- Each card contains:
  - Profile image
  - Person name
  - Job title
  - Card navigation arrow
- A **CTA button** appears below the carousel

### Visual Styling

Authors may enable an optional **background aura gradient** behind the component.

Possible styles:

- **None** (default background)
- **PeopleCard Aura** (soft gradient aura behind cards)

---

## Mobile Experience

**As a mobile user**,  
I want to **swipe through leadership profiles while seeing part of the next card**,  
so that **I know additional profiles are available.**

### Acceptance Criteria

- **One primary card** is centered on screen
- **Next and previous cards are partially visible**
- Users can **swipe horizontally** to navigate
- Pagination dots appear below the card
- Each card displays:
  - Image
  - Name
  - Title
  - Navigation arrow

### Mobile Layout Behavior

- Main card occupies ~80–90% width
- Adjacent cards appear **partially visible (peek effect)**
- Carousel supports **touch gestures**

---

# 3. Author Story — AEM Universal Editor

**As a content author**,  
I want to **configure the PeopleCards section content and visual style directly in Universal Editor**,  
so that **I can manage leadership content without developer assistance.**

---

# 4. Authoring Options

## Component Fields

| Field | Type | Description |
|-----|-----|-----|
| Title | Text | Section headline |
| CTA Label | Text | Button label |
| CTA Link | URL | Button link |
| Background Style | Dropdown | Select background aura style |

---

## Background Style Dropdown

**Field:** `Background Style`

Options:

| Option | Value | Description |
|------|------|------|
| None | `none` | No gradient background |
| PeopleCard Aura | `aura` | Gradient aura background behind the component |

### Author Behavior

- Author selects **Background Style** from dropdown
- Component updates visually in **Universal Editor preview**
- Default value = **None**

---

# 5. People Card Authoring

Each **People Card** is an editable item.

Fields per card:

| Field | Type |
|------|------|
| Image | Asset picker |
| Name | Text |
| Title | Text |
| Profile Link | URL |

### Author Capabilities

Authors can:

- Add cards
- Delete cards
- Reorder cards via drag-and-drop
- Edit text inline
- Replace images
- Update profile links

---

# 6. Content Model (EDS)

Example structure:
- name: Stacy Apter
  title: Senior Vice President and Treasurer
  image: stacy-apter.jpg
  link: /leadership/stacy-apter

- name: James Quincey
  title: Chairman and Chief Executive Officer
  image: james-quincey.jpg
  link: /leadership/james-quincey

  
---

# 7. Responsive Behavior

| Feature | Desktop | Mobile |
|------|------|------|
| Visible Cards | 3–4 | 1 main + partial neighbors |
| Interaction | Drag + arrows | Swipe |
| Adjacent Card Preview | Optional | Required |
| Pagination | Optional | Dots |
| Animation | Smooth slide | Swipe slide |

---

# 8. Accessibility Requirements

- Images require **alt text**
- Carousel supports **keyboard navigation**
- Buttons and links must include **ARIA labels**
- Ensure **WCAG AA color contrast**

---

# 9. Definition of Done

- Component renders correctly in **desktop and mobile**
- **Mobile cards show partial neighboring cards**
- Authors can configure **background aura style**
- Cards are fully editable in **Universal Editor**
- Carousel supports **drag/swipe interactions**
- CTA button functions correctly
- Accessibility standards met