# Implementation Plan: You May Also Like Block

**Functionality:** You May Also Like Recommendations Block with Carousel/Slider  
**Date:** 2026-02-10  
**Version:** v1  
**Guide Reference:** [Creating EDS Block Implementation Guide](../../implementation-guide.md)

---

## Overview

This implementation plan details the creation of a **You May Also Like** block that displays a section title and multiple recommendation cards in a carousel/slider format. The block supports:
- **Desktop:** Two cards visible side-by-side with left/right navigation arrows
- **Mobile:** One card visible with swipe gesture support and optional arrow controls
- Each card includes a background image, supporting text, title, and an arrow button indicator
- Cards are fully clickable and navigate to destination pages

### User Stories

**Story 1 — View recommended content (Desktop)**
- As a website visitor, I want to see a "You may also like" section with recommended cards
- So that I can quickly discover related pages to visit next

**Story 2 — Navigate recommendations (Desktop)**
- As a website visitor, I want to move through the recommended cards
- So that I can view more suggestions beyond the initial set

**Story 3 — View recommended content (Mobile)**
- As a mobile visitor, I want the "You may also like" cards to be easy to read and interact with
- So that I can discover related content on a small screen

**Story 4 — Swipe through recommendations (Mobile)**
- As a mobile visitor, I want to swipe through recommended cards
- So that I can browse multiple suggestions quickly

### Acceptance Criteria

**General:**
- ✅ Component displays a section title "You may also like"
- ✅ Component supports multiple recommendation cards
- ✅ Each card includes:
  - Background image (required)
  - Supporting text (optional, authorable)
  - Title (required)
  - Arrow button indicator (visual, card is clickable)
  - Link to destination page (required, entire card is clickable)
- ✅ Content is authorable in AEM
- ✅ Component is reusable and configurable
- ✅ Cards have hover effects
- ✅ Responsive design (desktop: 2 cards, mobile: 1 card)

**Desktop Experience:**
- ✅ Section title displayed above recommendations
- ✅ Two cards visible side-by-side
- ✅ Left/right navigation arrows available
- ✅ Right arrow moves to next set of cards
- ✅ Left arrow returns to previous set of cards
- ✅ Navigation does not break page layout
- ✅ Cards are clearly clickable with hover effects

**Mobile Experience:**
- ✅ Section title visible above cards
- ✅ One card per view (or stacked layout)
- ✅ Text remains legible
- ✅ Horizontal swipe gestures move between cards
- ✅ Optional arrow controls remain tappable and functional
- ✅ Current card clearly indicated by position
- ✅ Swipe navigation is smooth and does not trigger unwanted page scrolling
- ✅ Cards are easily tappable

**Accessibility:**
- ✅ Images include alt text
- ✅ Cards are keyboard accessible
- ✅ Navigation arrows are keyboard accessible
- ✅ Color contrast meets accessibility standards
- ✅ ARIA labels for navigation controls

**Performance:**
- ✅ Images are responsive and optimized
- ✅ Component loads efficiently without impacting page performance
- ✅ Smooth animations/transitions

---

## Design Specifications

### Figma Design Analysis

**Source:** [Figma Design](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=51-1168&m=dev)

**Layout Structure:**
- Section title: "You may also like" (centered, large heading)
- Two cards displayed side-by-side on desktop (20px gap)
- Each card: 400px height, flexible width (1fr each)
- Container: max-width 1360px, centered, padding 40px
- Gap between title and cards: 80px

**Card Structure:**
- Background image with gradient overlay (left-to-right: rgba(0,0,0,0.6) to rgba(0,0,0,0))
- Supporting text at top (white, 16px, regular weight)
- Title at bottom (white, 38px, medium weight, tracking -1.14px)
- Arrow button in bottom-right corner (50px circular, white background, black arrow icon)
- Rounded corners: 24px border radius
- Padding: 30px
- Full card is clickable

**Typography:**
- Section title: TCCC-UnityHeadline Medium, 64px, line-height 1.2, letter-spacing -1.92px
- Card supporting text: TCCC-UnityHeadline Regular, 16px, line-height 1.4
- Card title: TCCC-UnityHeadline Medium, 38px, line-height 1.2, letter-spacing -1.14px

**Colors:**
- Background: Off-white (#f2f2f2)
- Section title: Black (#000000)
- Card text: White (#ffffff)
- Arrow button: White background (#ffffff), black arrow icon
- Gradient overlay: rgba(0,0,0,0.6) to rgba(0,0,0,0) (left to right)

**Responsive Breakpoints:**
- Desktop: 900px and above (2 cards side-by-side, navigation arrows visible)
- Mobile: Below 900px (1 card per view, swipe enabled, optional arrows)

**Interactions:**
- Cards are fully clickable (entire card area)
- Hover effect: Slight elevation or shadow enhancement
- Navigation arrows: Click to move between card sets
- Mobile swipe: Horizontal swipe gesture to navigate
- Arrow button on card: Visual indicator (card clickable)

**Navigation Controls:**
- Left/right arrow buttons positioned outside the card container
- Arrows should be disabled at start/end (when no more cards to show)
- Smooth transitions between card sets

---

## Technical Architecture

### Block Structure

**Parent Block:** `youmayalsolike`
- Contains section title field
- Contains child items (youmayalsolikeitem)

**Child Block:** `youmayalsolikeitem`
- Background image (required)
- Supporting text (optional)
- Title (required)
- Link URL (required)
- Link target (optional, defaults to _self)

### Index-Based Structure Contract

**Parent Block (`youmayalsolike`):**
- `block.children[0]` = Title row (title cell 0)
- `block.children[1]` = First youmayalsolikeitem item row
- `block.children[2]` = Second youmayalsolikeitem item row
- `block.children[3]` = Third youmayalsolikeitem item row
- ... (additional items follow)

**Child Block (`youmayalsolikeitem`):**
- `row.children[0]` = Image cell
- `row.children[1]` = Alt text cell
- `row.children[2]` = Supporting text cell (optional)
- `row.children[3]` = Title cell
- `row.children[4]` = Link URL cell
- `row.children[5]` = Link target cell (optional)

**Note:** The structure contract must match the field order in the XWalk model to ensure index-based access works correctly.

---

## Implementation Tasks

### Phase 0: Pre-Implementation - Requirements Validation

**Task 0.1: Review Requirements**
- [x] Review user stories and acceptance criteria
- [x] Confirm Figma design matches requirements
- [x] Identify similar blocks for reference (`relatedarticles`, `cards`)
- [x] Document carousel/slider functionality requirements
- [x] Document swipe gesture requirements for mobile

**Confidence:** 95% - Requirements are clear from story document and Figma design. Carousel functionality needs to be implemented from scratch as no existing carousel found in codebase.

**Clarifications Needed:**
1. Should navigation arrows be disabled at start/end, or loop infinitely? **Assumption:** Disabled at start/end (more standard UX)
2. Should there be dots/indicators for mobile? **Assumption:** Position-based indication only (as per story: "and/or dots if used" - optional)
3. Should the arrow button on each card be a separate click target, or just visual? **Assumption:** Visual indicator only, entire card is clickable
4. Exact breakpoint for mobile vs desktop? **Assumption:** 900px (consistent with header block)

---

### Phase 1: Backend - XWalk Configuration

#### Task 1.1: Add Parent Block Definition to component-definition.json

**Objective:** Add the `youmayalsolike` parent block definition to enable AEM authoring.

**Steps:**
1. Open `component-definition.json`
2. Locate the `"Blocks"` group (id: "blocks")
3. Add the following definition to the `components` array (after `relatedarticles`):

```json
{
  "title": "You May Also Like",
  "id": "youmayalsolike",
  "plugins": {
    "xwalk": {
      "page": {
        "resourceType": "core/franklin/components/block/v1/block",
        "template": {
          "name": "YouMayAlsoLike",
          "filter": "youmayalsolike"
        }
      }
    }
  }
}
```

4. Verify JSON syntax is valid
5. Save the file

**Reference:** `component-definition.json` lines 176-189 (relatedarticles example)

**Acceptance Criteria:**
- Definition added to correct group
- JSON syntax is valid
- ID matches: `youmayalsolike`
- Filter property set to `youmayalsolike`

**Testing Task 1.1.1: Validate JSON Syntax**
- [ ] Run JSON validator or ESLint to check syntax
- [ ] Verify no syntax errors
- [ ] Confirm definition is in correct location

**Confidence:** 98% - Following established pattern from `relatedarticles` block.

---

#### Task 1.2: Add Child Block Definition to component-definition.json

**Objective:** Add the `youmayalsolikeitem` child item definition.

**Steps:**
1. In the same `components` array (right after youmayalsolike definition)
2. Add the following definition:

```json
{
  "title": "You May Also Like Item",
  "id": "youmayalsolikeitem",
  "plugins": {
    "xwalk": {
      "page": {
        "resourceType": "core/franklin/components/block/v1/block/item",
        "template": {
          "name": "YouMayAlsoLikeItem",
          "model": "youmayalsolikeitem"
        }
      }
    }
  }
}
```

3. Verify JSON syntax is valid
4. Save the file

**Reference:** `component-definition.json` lines 190-203 (relatedarticle example)

**Acceptance Criteria:**
- Definition added after parent definition
- JSON syntax is valid
- ID matches: `youmayalsolikeitem`
- Resource type is `block/item`
- Model property set to `youmayalsolikeitem`

**Testing Task 1.2.1: Validate JSON Syntax**
- [ ] Run JSON validator or ESLint to check syntax
- [ ] Verify no syntax errors
- [ ] Confirm both definitions are present

**Confidence:** 98% - Following established pattern from `relatedarticle` block.

---

#### Task 1.3: Add Parent Block Model to component-models.json

**Objective:** Add the `youmayalsolike` model with section title field.

**Steps:**
1. Open `component-models.json`
2. Add a new object to the root array:

```json
{
  "id": "youmayalsolike",
  "fields": [
    {
      "component": "text",
      "name": "title",
      "label": "Section Title",
      "value": "You may also like",
      "valueType": "string",
      "validation": {
        "maxLength": 100
      }
    }
  ]
}
```

3. Verify JSON syntax is valid
4. Save the file

**Reference:** `component-models.json` - Similar to relatedarticles model

**Acceptance Criteria:**
- Model added to root array
- ID matches: `youmayalsolike`
- Title field has default value "You may also like"
- MaxLength validation set

**Testing Task 1.3.1: Validate JSON Syntax**
- [ ] Run JSON validator or ESLint to check syntax
- [ ] Verify model structure is correct
- [ ] Confirm field definitions are valid

**Confidence:** 98% - Following established pattern.

---

#### Task 1.4: Add Child Block Model to component-models.json

**Objective:** Add the `youmayalsolikeitem` model with image, supporting text, title, and link fields.

**Steps:**
1. In `component-models.json`, add a new object to the root array:

```json
{
  "id": "youmayalsolikeitem",
  "fields": [
    {
      "component": "reference",
      "valueType": "string",
      "name": "image",
      "label": "Background Image",
      "multi": false
    },
    {
      "component": "text",
      "valueType": "string",
      "name": "imageAlt",
      "label": "Alt Text",
      "value": ""
    },
    {
      "component": "richtext",
      "valueType": "string",
      "name": "supportingText",
      "label": "Supporting Text",
      "value": "",
      "description": "Optional short text displayed above the title"
    },
    {
      "component": "text",
      "valueType": "string",
      "name": "title",
      "label": "Title",
      "value": "",
      "validation": {
        "maxLength": 200
      }
    },
    {
      "component": "aem-content",
      "valueType": "string",
      "name": "link",
      "label": "Link URL"
    },
    {
      "component": "select",
      "valueType": "string",
      "name": "linkTarget",
      "label": "Link Target",
      "value": "_self",
      "options": [
        {
          "name": "Same Window",
          "value": "_self"
        },
        {
          "name": "New Window",
          "value": "_blank"
        }
      ]
    }
  ]
}
```

**Important:** Field order must match the index-based structure contract:
1. Image (index 0)
2. Alt text (index 1)
3. Supporting text (index 2)
4. Title (index 3)
5. Link URL (index 4)
6. Link target (index 5)

3. Verify JSON syntax is valid
4. Save the file

**Reference:** `component-models.json` - Similar to relatedarticle model

**Acceptance Criteria:**
- Model added to root array
- ID matches: `youmayalsolikeitem`
- All required fields present (image, title, link)
- Optional field present (supportingText)
- Field order matches structure contract
- Validation rules applied where appropriate

**Testing Task 1.4.1: Validate JSON Syntax**
- [ ] Run JSON validator or ESLint to check syntax
- [ ] Verify model structure is correct
- [ ] Confirm field order matches structure contract
- [ ] Verify all field types are valid

**Confidence:** 98% - Following established pattern from `relatedarticle` model.

---

#### Task 1.5: Add Filter to component-filters.json

**Objective:** Add the `youmayalsolike` filter to allow nesting of child items.

**Steps:**
1. Open `component-filters.json`
2. Add a new object to the root array:

```json
{
  "id": "youmayalsolike",
  "components": ["youmayalsolikeitem"]
}
```

3. Also ensure `youmayalsolike` can be nested in sections by adding it to the section filter (if not already present)
4. Verify JSON syntax is valid
5. Save the file

**Reference:** `component-filters.json` lines 21-26 (cards filter example)

**Acceptance Criteria:**
- Filter added to root array
- ID matches: `youmayalsolike`
- Components array contains `youmayalsolikeitem`
- JSON syntax is valid

**Testing Task 1.5.1: Validate JSON Syntax**
- [ ] Run JSON validator or ESLint to check syntax
- [ ] Verify filter structure is correct
- [ ] Confirm child component ID is correct

**Confidence:** 98% - Following established pattern.

---

#### Task 1.6: Run Build Command (if applicable)

**Objective:** If the project uses a build pipeline for JSON files, run the build command.

**Steps:**
1. Check if `package.json` has a `build:json` or similar script
2. If yes, run: `npm run build:json`
3. Verify no build errors

**Reference:** Implementation guide - Anti-Pattern 5

**Acceptance Criteria:**
- Build command runs successfully
- No errors in build output
- Component definitions are updated

**Testing Task 1.6.1: Verify Build Success**
- [ ] Run build command
- [ ] Verify no errors
- [ ] Check that component files are updated (if applicable)

**Confidence:** 90% - May not be applicable to all projects.

---

### Phase 2: Frontend - JavaScript Implementation

#### Task 2.1: Create Block JavaScript File

**Objective:** Create `blocks/youmayalsolike/youmayalsolike.js` with carousel functionality.

**Steps:**
1. Create directory: `blocks/youmayalsolike/`
2. Create file: `blocks/youmayalsolike/youmayalsolike.js`
3. Implement the `decorate()` function with:
   - Index-based data extraction
   - Card structure creation
   - Carousel container setup
   - Navigation controls (left/right arrows)
   - Mobile swipe gesture support
   - Event handlers for navigation

**Structure Contract Documentation:**
```javascript
/**
 * You May Also Like Block
 * 
 * Structure contract (index-based):
 * - block.children[0] = Title row (title cell 0)
 * - block.children[1+] = Recommendation item rows (each row = one item)
 * 
 * For each item row:
 * - row.children[0] = Image cell
 * - row.children[1] = Alt text cell
 * - row.children[2] = Supporting text cell (optional)
 * - row.children[3] = Title cell
 * - row.children[4] = Link URL cell
 * - row.children[5] = Link target cell (optional)
 * 
 * @param {Element} block The block element
 */
```

**Key Implementation Points:**
- Use index-based access only (no data attributes)
- Extract data from DOM using index positions
- Create carousel container with overflow hidden
- Implement card sliding animation
- Add navigation arrows (left/right)
- Implement swipe gesture for mobile
- Handle edge cases (start/end of carousel)
- Use `moveInstrumentation()` when transforming DOM
- Make entire card clickable

**Reference:** 
- `blocks/relatedarticles/relatedarticles.js` - Similar card structure
- `blocks/cards/cards.js` - Item processing pattern
- Implementation guide - Index-based patterns

**Acceptance Criteria:**
- File created in correct location
- Default export function `decorate(block)`
- Structure contract documented in JSDoc
- Index-based data extraction implemented
- Carousel functionality working
- Navigation arrows functional
- Mobile swipe gestures working
- `moveInstrumentation()` used when needed

**Testing Task 2.1.1: Test Basic Structure**
- [ ] Create test HTML with block structure
- [ ] Load block in browser
- [ ] Verify cards are created correctly
- [ ] Verify title is displayed
- [ ] Check browser console for errors

**Confidence:** 85% - Carousel functionality needs careful implementation. Swipe gestures may require additional testing.

---

#### Task 2.2: Implement Carousel Navigation Logic

**Objective:** Implement carousel navigation with left/right arrows and swipe support.

**Key Features:**
1. **Desktop Navigation:**
   - Left arrow: Move to previous set (2 cards)
   - Right arrow: Move to next set (2 cards)
   - Disable arrows at start/end
   - Smooth transition animation

2. **Mobile Navigation:**
   - Swipe left: Next card
   - Swipe right: Previous card
   - Optional arrow buttons (if shown)
   - Smooth transition animation
   - Prevent page scroll during swipe

3. **State Management:**
   - Track current index/set
   - Calculate total sets (desktop: totalCards / 2, mobile: totalCards)
   - Update arrow states (disabled/enabled)
   - Handle edge cases

**Implementation Approach:**
```javascript
// Carousel state
let currentIndex = 0;
const cardsPerView = isDesktop ? 2 : 1;
const totalSets = Math.ceil(totalCards / cardsPerView);

// Navigation functions
function goToNext() {
  if (currentIndex < totalSets - 1) {
    currentIndex++;
    updateCarousel();
  }
}

function goToPrevious() {
  if (currentIndex > 0) {
    currentIndex--;
    updateCarousel();
  }
}

function updateCarousel() {
  const translateX = -(currentIndex * 100 / cardsPerView);
  carouselContainer.style.transform = `translateX(${translateX}%)`;
  updateArrowStates();
}
```

**Swipe Gesture Implementation:**
- Use touch events: `touchstart`, `touchmove`, `touchend`
- Calculate swipe distance and direction
- Threshold: minimum 50px swipe distance
- Prevent default scroll during horizontal swipe
- Smooth animation after swipe

**Reference:** 
- Implementation guide - Pattern 4 (Interactive blocks)
- Web APIs: Touch Events, CSS Transforms

**Acceptance Criteria:**
- Navigation arrows work correctly
- Arrows disabled at start/end
- Smooth transitions between sets
- Swipe gestures work on mobile
- Page scroll not triggered during swipe
- Current position clearly indicated

**Testing Task 2.2.1: Test Navigation**
- [ ] Test left/right arrow clicks
- [ ] Verify arrows disable at start/end
- [ ] Test swipe gestures on mobile device
- [ ] Verify smooth transitions
- [ ] Test with different numbers of cards (2, 3, 4, 5+)

**Confidence:** 80% - Swipe gesture implementation may need refinement based on device testing.

---

#### Task 2.3: Implement Card Structure and Styling

**Objective:** Create card DOM structure matching Figma design.

**Card Structure:**
```html
<a href="..." class="youmayalsolike__card">
  <div class="youmayalsolike__image-wrapper">
    <picture>...</picture>
    <div class="youmayalsolike__gradient"></div>
  </div>
  <div class="youmayalsolike__content">
    <p class="youmayalsolike__supporting-text">...</p>
    <div class="youmayalsolike__title-row">
      <h3 class="youmayalsolike__title">...</h3>
      <button class="youmayalsolike__arrow-button" aria-label="Navigate">
        <svg>...</svg>
      </button>
    </div>
  </div>
</a>
```

**Implementation Steps:**
1. Extract data using index-based access
2. Create card anchor element
3. Add image with optimization
4. Add gradient overlay
5. Add supporting text (if provided)
6. Add title
7. Add arrow button (SVG icon)
8. Use `moveInstrumentation()` when replacing elements

**Image Optimization:**
- Use `createOptimizedPicture()` from `scripts/aem.js`
- Responsive breakpoints: [{ width: '440' }, { width: '880' }]
- Preserve alt text

**Arrow Button Icon:**
- Create SVG arrow icon (right-pointing)
- 24x24px icon in 50px circular button
- Use inline SVG or icon component if available

**Reference:**
- `blocks/relatedarticles/relatedarticles.js` - Card structure pattern
- `scripts/aem.js` - `createOptimizedPicture()` function
- Implementation guide - Pattern 5 (Image optimization)

**Acceptance Criteria:**
- Cards match Figma design structure
- Images are optimized
- Gradient overlay applied
- Arrow button present
- Entire card is clickable
- `moveInstrumentation()` used correctly

**Testing Task 2.3.1: Test Card Structure**
- [ ] Verify card HTML structure
- [ ] Check image optimization
- [ ] Verify gradient overlay
- [ ] Test card clickability
- [ ] Verify arrow button appearance

**Confidence:** 95% - Following established patterns from relatedarticles block.

---

### Phase 3: Frontend - CSS Styling

#### Task 3.1: Create Block CSS File

**Objective:** Create `blocks/youmayalsolike/youmayalsolike.css` with responsive styles.

**Steps:**
1. Create file: `blocks/youmayalsolike/youmayalsolike.css`
2. Implement styles for:
   - Container and layout
   - Section title
   - Carousel container
   - Cards
   - Navigation arrows
   - Responsive breakpoints
   - Hover effects
   - Transitions

**Key Styles:**

**Container:**
```css
.youmayalsolike {
  /* Block container */
}

.youmayalsolike__container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 80px;
  width: 100%;
  max-width: 1360px;
  margin: 0 auto;
  padding: 0 40px;
}
```

**Section Title:**
```css
.youmayalsolike__title {
  font-family: 'TCCC-UnityHeadline', sans-serif;
  font-weight: 600;
  font-size: 64px;
  line-height: 1.2;
  letter-spacing: -1.92px;
  text-align: center;
  color: #000000;
  margin: 0;
}
```

**Carousel:**
```css
.youmayalsolike__carousel-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.youmayalsolike__carousel {
  display: flex;
  transition: transform 0.3s ease;
  gap: 20px;
}

.youmayalsolike__card {
  flex: 0 0 calc(50% - 10px); /* Desktop: 2 cards */
  /* Mobile: 100% width */
}
```

**Card Styles:**
- Height: 400px
- Border radius: 24px
- Padding: 30px
- Background image with object-fit: cover
- Gradient overlay
- Hover effects

**Navigation Arrows:**
- Positioned outside carousel
- Circular buttons
- Disabled state styling
- Hover effects

**Reference:**
- `blocks/relatedarticles/relatedarticles.css` - Similar styling patterns
- Figma design specifications

**Acceptance Criteria:**
- File created in correct location
- Styles match Figma design
- Responsive breakpoints implemented
- Hover effects working
- Transitions smooth
- Navigation arrows styled correctly

**Testing Task 3.1.1: Test Styles**
- [ ] Verify desktop layout (2 cards)
- [ ] Verify mobile layout (1 card)
- [ ] Test hover effects
- [ ] Verify transitions
- [ ] Check navigation arrow styles
- [ ] Test disabled arrow states

**Confidence:** 95% - Following established patterns and Figma specifications.

---

#### Task 3.2: Implement Responsive Breakpoints

**Objective:** Ensure proper responsive behavior at all breakpoints.

**Breakpoints:**
- Desktop: 900px and above (2 cards side-by-side)
- Mobile: Below 900px (1 card per view)

**Mobile Styles:**
```css
@media (width < 900px) {
  .youmayalsolike__container {
    gap: 30px;
    padding: 0 16px;
  }
  
  .youmayalsolike__title {
    font-size: 32px;
    letter-spacing: -1px;
  }
  
  .youmayalsolike__card {
    flex: 0 0 100%;
    height: 300px;
  }
  
  .youmayalsolike__content {
    padding: 20px;
  }
  
  .youmayalsolike__title {
    font-size: 26px;
  }
}
```

**Acceptance Criteria:**
- Desktop: 2 cards visible
- Mobile: 1 card visible
- Text remains legible at all sizes
- Layout does not break
- Touch targets are adequate (min 44x44px)

**Testing Task 3.2.1: Test Responsive Design**
- [ ] Test at desktop width (1440px)
- [ ] Test at tablet width (768px)
- [ ] Test at mobile width (375px)
- [ ] Verify text readability
- [ ] Check touch target sizes
- [ ] Verify no horizontal scrolling

**Confidence:** 95% - Standard responsive patterns.

---

### Phase 4: Integration - Component Registration

#### Task 4.1: Verify XWalk Configuration

**Objective:** Verify all XWalk configuration is correct and complete.

**Steps:**
1. Check `component-definition.json`:
   - [ ] `youmayalsolike` definition present
   - [ ] `youmayalsolikeitem` definition present
   - [ ] JSON syntax valid
2. Check `component-models.json`:
   - [ ] `youmayalsolike` model present
   - [ ] `youmayalsolikeitem` model present
   - [ ] Field order matches structure contract
   - [ ] JSON syntax valid
3. Check `component-filters.json`:
   - [ ] `youmayalsolike` filter present
   - [ ] Child component ID correct
   - [ ] JSON syntax valid

**Acceptance Criteria:**
- All three configuration files updated
- JSON syntax is valid
- IDs match between files
- Field order matches structure contract

**Testing Task 4.1.1: Validate Configuration**
- [ ] Run JSON validator
- [ ] Verify all IDs match
- [ ] Check field order
- [ ] Verify no syntax errors

**Confidence:** 98% - Following established patterns.

---

### Phase 5: Integration - AEM Authoring Validation

#### Task 5.1: Test in AEM Authoring Interface

**Objective:** Verify the block works correctly in AEM authoring mode.

**Steps:**
1. Deploy to AEM environment (or test locally if applicable)
2. Open AEM page editor
3. Add "You May Also Like" block to a page
4. Test authoring:
   - Add section title
   - Add multiple items
   - Configure each item (image, text, title, link)
   - Save content
5. Verify content renders correctly in author mode
6. Verify content renders correctly in publish mode

**Acceptance Criteria:**
- Block appears in component browser
- Authoring interface opens correctly
- All fields are editable
- Content saves correctly
- Content renders in author mode
- Content renders in publish mode
- Index-based access works (no reliance on data attributes)

**Testing Task 5.1.1: Test Authoring**
- [ ] Add block to page
- [ ] Configure section title
- [ ] Add 2+ items
- [ ] Configure each item
- [ ] Save and preview
- [ ] Verify rendering

**Confidence:** 90% - May require AEM environment access.

---

#### Task 5.2: Test Carousel Functionality

**Objective:** Verify carousel navigation works correctly in both author and publish modes.

**Steps:**
1. Create test content with 4+ items
2. Test desktop navigation:
   - [ ] Left arrow moves to previous set
   - [ ] Right arrow moves to next set
   - [ ] Arrows disabled at start/end
   - [ ] Smooth transitions
3. Test mobile navigation:
   - [ ] Swipe left moves to next card
   - [ ] Swipe right moves to previous card
   - [ ] No unwanted page scrolling
   - [ ] Smooth transitions
4. Test card clickability:
   - [ ] Entire card is clickable
   - [ ] Navigation works correctly
   - [ ] Link target respected

**Acceptance Criteria:**
- Desktop navigation works
- Mobile swipe works
- Arrows disable correctly
- Cards are clickable
- Links work correctly
- No layout breaking

**Testing Task 5.2.1: Test Carousel**
- [ ] Test with 2 items (edge case)
- [ ] Test with 3 items (odd number)
- [ ] Test with 4+ items (normal case)
- [ ] Test desktop arrows
- [ ] Test mobile swipe
- [ ] Test card clicks

**Confidence:** 85% - Carousel functionality needs thorough testing.

---

### Phase 6: Testing and Validation

#### Task 6.1: Cross-Browser Testing

**Objective:** Verify block works across major browsers.

**Browsers to Test:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

**Test Cases:**
- [ ] Layout renders correctly
- [ ] Carousel navigation works
- [ ] Swipe gestures work (mobile)
- [ ] Images load correctly
- [ ] Transitions are smooth
- [ ] No console errors

**Acceptance Criteria:**
- Works in all major browsers
- No browser-specific issues
- Mobile browsers work correctly

**Confidence:** 80% - Requires actual browser testing.

---

#### Task 6.2: Accessibility Testing

**Objective:** Verify accessibility compliance.

**Test Cases:**
- [ ] Images have alt text
- [ ] Cards are keyboard accessible (Tab navigation)
- [ ] Navigation arrows are keyboard accessible
- [ ] ARIA labels present for navigation
- [ ] Color contrast meets WCAG AA standards
- [ ] Screen reader compatibility

**Acceptance Criteria:**
- WCAG AA compliance
- Keyboard navigation works
- Screen reader friendly
- Proper ARIA labels

**Testing Task 6.2.1: Test Accessibility**
- [ ] Test with keyboard only
- [ ] Test with screen reader
- [ ] Verify color contrast
- [ ] Check ARIA labels

**Confidence:** 85% - May need accessibility audit tools.

---

#### Task 6.3: Performance Testing

**Objective:** Verify block performance is acceptable.

**Test Cases:**
- [ ] Block loads without blocking page
- [ ] Images are optimized
- [ ] Transitions are smooth (60fps)
- [ ] No memory leaks
- [ ] Event listeners cleaned up (if block removed)

**Acceptance Criteria:**
- No performance degradation
- Smooth animations
- Optimized images
- No memory leaks

**Testing Task 6.3.1: Test Performance**
- [ ] Check Lighthouse score
- [ ] Monitor frame rate during transitions
- [ ] Check memory usage
- [ ] Verify image optimization

**Confidence:** 85% - Requires performance testing tools.

---

## Implementation Summary

### Files Created/Modified

**New Files:**
- `blocks/youmayalsolike/youmayalsolike.js` - Block JavaScript with carousel
- `blocks/youmayalsolike/youmayalsolike.css` - Block styles

**Modified Files:**
- `component-definition.json` - Added youmayalsolike and youmayalsolikeitem definitions
- `component-models.json` - Added youmayalsolike and youmayalsolikeitem models
- `component-filters.json` - Added youmayalsolike filter

### Key Features Implemented

1. **Carousel/Slider Functionality:**
   - Desktop: 2 cards per view with arrow navigation
   - Mobile: 1 card per view with swipe gestures
   - Smooth transitions
   - Arrow state management (disabled at start/end)

2. **Card Structure:**
   - Background image with gradient overlay
   - Supporting text (optional)
   - Title
   - Arrow button indicator
   - Fully clickable cards

3. **Responsive Design:**
   - Desktop breakpoint: 900px
   - Mobile breakpoint: < 900px
   - Adaptive card sizing
   - Touch-friendly on mobile

4. **Accessibility:**
   - Keyboard navigation
   - ARIA labels
   - Alt text for images
   - Proper semantic HTML

### Testing Checklist

**Pre-Deployment:**
- [ ] JSON syntax validated
- [ ] JavaScript tested in browser
- [ ] CSS styles verified
- [ ] Carousel navigation tested
- [ ] Mobile swipe tested
- [ ] Cross-browser tested
- [ ] Accessibility tested
- [ ] Performance verified

**Post-Deployment:**
- [ ] AEM authoring tested
- [ ] Content renders correctly
- [ ] All user stories validated
- [ ] Acceptance criteria met

---

## Reasoning and Validation

### Why This Implementation Follows the Goal

1. **Follows Implementation Guide:**
   - Uses index-based structure (no data attributes)
   - Follows established patterns from similar blocks
   - Uses `moveInstrumentation()` for DOM transformations
   - Implements proper XWalk configuration

2. **Meets User Stories:**
   - Story 1: Desktop view with 2 cards ✅
   - Story 2: Navigation arrows for desktop ✅
   - Story 3: Mobile-friendly layout ✅
   - Story 4: Swipe gestures for mobile ✅

3. **Matches Design:**
   - Follows Figma design specifications
   - Typography matches design
   - Colors match design
   - Layout matches design
   - Card structure matches design

4. **Test-Driven Approach:**
   - Testing tasks after each logical step
   - Human testing tasks included
   - Edge cases considered
   - Performance and accessibility tested

5. **Best Practices:**
   - Index-based implementation
   - Proper error handling
   - Responsive design
   - Accessibility compliance
   - Performance optimization

### Confidence Scores

- **Overall Implementation:** 90%
- **XWalk Configuration:** 98%
- **JavaScript/Carousel:** 85%
- **CSS Styling:** 95%
- **Mobile Swipe:** 80%
- **AEM Integration:** 90%

### Areas Requiring Attention

1. **Swipe Gesture Implementation:**
   - May need refinement based on device testing
   - Consider using a library if native implementation is problematic

2. **Carousel Edge Cases:**
   - Test with 1, 2, 3, 4+ items
   - Handle odd numbers of items
   - Verify arrow states at all positions

3. **Performance:**
   - Monitor animation performance
   - Ensure smooth 60fps transitions
   - Optimize image loading

4. **Accessibility:**
   - Verify keyboard navigation
   - Test with screen readers
   - Ensure proper ARIA labels

---

## Next Steps

1. **Review Implementation Plan:**
   - Review with team/stakeholders
   - Address any questions or concerns
   - Get approval to proceed

2. **Begin Implementation:**
   - Start with Phase 1 (XWalk Configuration)
   - Follow tasks in order
   - Complete testing tasks as you go

3. **Iterate Based on Testing:**
   - Refine carousel behavior based on testing
   - Adjust styles based on visual review
   - Optimize performance as needed

4. **Final Validation:**
   - Complete all testing tasks
   - Verify all acceptance criteria
   - Get final approval

---

**Document Version:** v1  
**Last Updated:** 2026-02-10  
**Status:** Ready for Review
