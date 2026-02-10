# Implementation Plan: Initiative Highlight Block

**Functionality:** Initiative Highlight Block  
**Date:** 2026-02-10  
**Version:** v1  
**Guide Reference:** [Creating EDS Block Implementation Guide](../../implementation-guide.md)

---

## Overview

This implementation plan details the creation of an **Initiative Highlight** block that displays an image, title, description, and CTA button. The block supports responsive layouts: side-by-side on desktop and stacked on mobile.

### User Story

**As a** website visitor  
**I want to** view an initiative highlight with an image, title, description, and CTA  
**So that** I can quickly understand the initiative and navigate to more details on any device.

### Acceptance Criteria

**General:**
- ✅ Component supports image, title, description, and CTA link
- ✅ Content is authorable in AEM (image, text, CTA label, CTA URL)
- ✅ Component is reusable across pages
- ✅ Follows brand typography, spacing, and color guidelines

**Desktop Experience:**
- ✅ Image and text display side-by-side
- ✅ Image appears on the left, content on the right
- ✅ CTA button is clearly visible below the description
- ✅ Component maintains proper spacing within the grid

**Mobile Experience:**
- ✅ Content stacks vertically
- ✅ Image appears above the text content
- ✅ Text is readable without truncation
- ✅ CTA button spans full width or is easily tappable
- ✅ No horizontal scrolling

---

## Design Specifications

### Figma Design Analysis

**Source:** [Figma Design](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=26-1326&m=dev)

**Layout Structure:**
- Two-column layout (desktop): Image left, content right
- Single column layout (mobile): Image top, content below
- Background: Off-white (#f2f2f2) with noise texture overlay
- Container: Rounded corners (8px), full-width with padding

**Content Elements:**
1. **Image** (left/top)
   - Rounded corners: 24px
   - Aspect ratio: 670/746 (approximately 0.9:1)
   - Object-fit: cover

2. **Headline** (right/below image)
   - Font: TCCC-UnityHeadline Medium
   - Size: 64px (desktop)
   - Line height: 1.2
   - Letter spacing: -1.92px
   - Color: Black

3. **Description** (below headline)
   - Font: TCCC-UnityHeadline Regular
   - Size: 18px
   - Line height: 1.4
   - Color: Black
   - Gap from headline: 30px

4. **CTA Button** (below description)
   - Background: Black
   - Text: White
   - Font: TCCC-UnityHeadline Medium, 16px
   - Border radius: 999px (fully rounded)
   - Padding: 30px horizontal, 64px height
   - Gap from description: 50px

**Spacing:**
- Gap between image and content: 135px (desktop)
- Vertical padding: 100px (top/bottom for content area)
- Horizontal padding: 40px (container)

**Responsive Breakpoints:**
- Mobile: < 900px (stacks vertically)
- Desktop: >= 900px (side-by-side)

---

## Implementation Phases

### Phase 0: Pre-Implementation - Requirements Gathering ✅

**Status:** Complete

- [x] Figma design URL received and analyzed
- [x] User story and acceptance criteria documented
- [x] Design specifications extracted
- [x] Component structure mapped to HTML structure
- [x] Design styles mapped to CSS properties
- [x] Content fields identified for XWalk configuration
- [x] Similar blocks identified for reference (hero, cards)
- [x] Breakpoint requirements confirmed (900px)
- [x] Accessibility requirements noted (semantic HTML, alt text, keyboard navigation)

**Reference Blocks:**
- `blocks/hero/` - Simple block with image and text
- `blocks/cards/` - Complex block with nested items
- `component-models.json` - Hero model (lines 192-217) for field reference

---

### Phase 1: Backend - XWalk Configuration

**Objective:** Configure AEM authoring interface for the Initiative Highlight block.

#### Task 1.1: Add Component Definition

**File:** `component-definition.json`  
**Location:** Add to `"Blocks"` group's `components` array (after hero, around line 159)

**Action:**
Add the following definition object:

```json
{
  "title": "Initiative Highlight",
  "id": "initiative-highlight",
  "plugins": {
    "xwalk": {
      "page": {
        "resourceType": "core/franklin/components/block/v1/block",
        "template": {
          "name": "InitiativeHighlight",
          "model": "initiative-highlight"
        }
      }
    }
  }
}
```

**Validation:**
- [ ] JSON syntax is valid
- [ ] Definition is in the "Blocks" group
- [ ] ID matches model ID (initiative-highlight)
- [ ] Resource type is correct

**Reference:** `component-definition.json` lines 145-159 (hero example)

---

#### Task 1.2: Add Component Model

**File:** `component-models.json`  
**Location:** Add as new object in root array (after hero model, around line 217)

**Action:**
Add the following model object:

```json
{
  "id": "initiative-highlight",
  "fields": [
    {
      "component": "reference",
      "valueType": "string",
      "name": "image",
      "label": "Image",
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
      "component": "richtext",
      "name": "description",
      "label": "Description",
      "value": "",
      "valueType": "string"
    },
    {
      "component": "aem-content",
      "name": "ctaLink",
      "label": "CTA Link"
    },
    {
      "component": "text",
      "valueType": "string",
      "name": "ctaText",
      "label": "CTA Text",
      "value": "",
      "validation": {
        "maxLength": 100
      }
    },
    {
      "component": "text",
      "valueType": "string",
      "name": "ctaTarget",
      "label": "CTA Target",
      "value": "_self",
      "validation": {
        "regExp": "^(|_self|_blank)$"
      }
    }
  ]
}
```

**Field Order (Index Contract):**
The field order in the model determines the DOM structure order:
1. Image row: `image` (cell 0), `imageAlt` (cell 1)
2. Title row: `title` (cell 0)
3. Description row: `description` (cell 0)
4. CTA row: `ctaLink` (cell 0), `ctaText` (cell 1), `ctaTarget` (cell 2)

**Validation:**
- [ ] JSON syntax is valid
- [ ] Model ID matches definition ID
- [ ] All fields are properly formatted
- [ ] Field order matches expected JavaScript index-based access pattern
- [ ] Validation rules are appropriate

**Reference:** `component-models.json` lines 192-217 (hero model example)

---

#### Task 1.3: Update Component Filters (if needed)

**File:** `component-filters.json`  
**Location:** Add to `"section"` filter's `components` array (around line 18)

**Action:**
Add `"initiative-highlight"` to the section's allowed components:

```json
{
  "id": "section",
  "components": [
    "text",
    "image",
    "button",
    "title",
    "hero",
    "cards",
    "columns",
    "fragment",
    "initiative-highlight"
  ]
}
```

**Note:** This block does not have nested items, so no separate filter is needed.

**Validation:**
- [ ] JSON syntax is valid
- [ ] Component ID added to section filter
- [ ] No duplicate entries

**Reference:** `component-filters.json` lines 9-19 (section filter example)

---

#### Task 1.4: Validate XWalk Configuration

**Action:**
1. Verify all three JSON files have valid syntax
2. Ensure component definition, model, and filter are properly linked
3. Check that field order matches expected index-based structure

**Validation Checklist:**
- [ ] `component-definition.json` - Definition added correctly
- [ ] `component-models.json` - Model added with correct ID
- [ ] `component-filters.json` - Component added to section filter
- [ ] All JSON files have valid syntax (no trailing commas, proper quotes)
- [ ] Field order in model matches JavaScript index contract

**Testing Task (Human):**
- [ ] Run `npm run build:json` (if project uses build pipeline)
- [ ] Verify no JSON syntax errors in console
- [ ] Check that component appears in AEM component browser (after deployment)

---

### Phase 2: Frontend - JavaScript Implementation

**Objective:** Implement the block's JavaScript logic using index-based structure access.

#### Task 2.1: Create Block JavaScript File

**File:** `blocks/initiative-highlight/initiative-highlight.js`

**Structure Contract (Index Convention):**
Document the index-based structure:
- `block.children[0]` = Image row (image cell 0, alt cell 1)
- `block.children[1]` = Title row (title cell 0)
- `block.children[2]` = Description row (description cell 0)
- `block.children[3]` = CTA row (link cell 0, text cell 1, target cell 2)

**Action:**
Create the JavaScript file with the following implementation:

```javascript
import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Initiative Highlight Block
 * 
 * Structure contract (index-based):
 * - block.children[0] = Image row (image cell 0, alt cell 1)
 * - block.children[1] = Title row (title cell 0)
 * - block.children[2] = Description row (description cell 0)
 * - block.children[3] = CTA row (link cell 0, text cell 1, target cell 2)
 * 
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // Extract data using index-based access
  const rows = [...block.children];
  
  // Image row: first row, first cell = image, second cell = alt text
  const imageRow = rows[0];
  const imageCell = imageRow?.children?.[0];
  const altCell = imageRow?.children?.[1];
  const imageSrc = imageCell?.querySelector?.('img')?.getAttribute?.('src')
    || imageCell?.querySelector?.('a')?.getAttribute?.('href')
    || imageCell?.querySelector?.('picture')?.querySelector?.('img')?.getAttribute?.('src');
  const altText = altCell?.textContent?.trim() || '';
  
  // Title row: second row, first cell = title
  const titleRow = rows[1];
  const titleElement = titleRow?.children?.[0];
  const title = titleElement?.textContent?.trim() || '';
  
  // Description row: third row, first cell = description
  const descriptionRow = rows[2];
  const descriptionElement = descriptionRow?.children?.[0];
  const description = descriptionElement?.innerHTML?.trim() || '';
  
  // CTA row: fourth row, first cell = link, second cell = text, third cell = target
  const ctaRow = rows[3];
  const ctaLinkCell = ctaRow?.children?.[0];
  const ctaTextCell = ctaRow?.children?.[1];
  const ctaTargetCell = ctaRow?.children?.[2];
  const ctaLink = ctaLinkCell?.querySelector?.('a')?.getAttribute?.('href') || '';
  const ctaText = ctaTextCell?.textContent?.trim() || '';
  const ctaTarget = ctaTargetCell?.textContent?.trim() || '_self';
  
  // Build the new structure
  const container = document.createElement('div');
  container.classList.add('initiative-highlight__container');
  
  // Image section
  if (imageSrc) {
    const imageWrapper = document.createElement('div');
    imageWrapper.classList.add('initiative-highlight__image-wrapper');
    
    // Use existing picture if available, otherwise create optimized picture
    const existingPicture = imageCell?.querySelector?.('picture');
    if (existingPicture) {
      const optimizedPic = createOptimizedPicture(
        imageSrc,
        altText,
        false,
        [{ width: '750' }, { width: '1440' }]
      );
      moveInstrumentation(existingPicture, optimizedPic);
      imageWrapper.appendChild(optimizedPic);
    } else if (imageSrc) {
      const optimizedPic = createOptimizedPicture(
        imageSrc,
        altText,
        false,
        [{ width: '750' }, { width: '1440' }]
      );
      imageWrapper.appendChild(optimizedPic);
    }
    
    container.appendChild(imageWrapper);
  }
  
  // Content section
  const contentWrapper = document.createElement('div');
  contentWrapper.classList.add('initiative-highlight__content');
  
  // Title
  if (title && titleElement) {
    const heading = document.createElement('h2');
    heading.classList.add('initiative-highlight__title');
    heading.textContent = title;
    moveInstrumentation(titleElement, heading);
    contentWrapper.appendChild(heading);
  }
  
  // Description
  if (description && descriptionElement) {
    const descriptionDiv = document.createElement('div');
    descriptionDiv.classList.add('initiative-highlight__description');
    descriptionDiv.innerHTML = description;
    moveInstrumentation(descriptionElement, descriptionDiv);
    contentWrapper.appendChild(descriptionDiv);
  }
  
  // CTA Button
  if (ctaLink && ctaText) {
    const ctaButton = document.createElement('a');
    ctaButton.classList.add('initiative-highlight__cta');
    ctaButton.href = ctaLink;
    ctaButton.textContent = ctaText;
    ctaButton.target = ctaTarget || '_self';
    if (ctaTarget === '_blank') {
      ctaButton.rel = 'noopener noreferrer';
    }
    if (ctaLinkCell) {
      moveInstrumentation(ctaLinkCell, ctaButton);
    }
    contentWrapper.appendChild(ctaButton);
  }
  
  container.appendChild(contentWrapper);
  
  // Replace block content
  moveInstrumentation(block, container);
  block.innerHTML = '';
  block.appendChild(container);
}
```

**Key Implementation Details:**
- Uses index-based access only (no data attributes)
- Documents structure contract in JSDoc
- Uses optional chaining (`?.`) and nullish coalescing (`??`)
- Preserves AEM authoring attributes with `moveInstrumentation()`
- Creates optimized images using `createOptimizedPicture()`
- Handles missing content gracefully

**Validation:**
- [ ] File created at correct path
- [ ] Default export function `decorate(block)` exists
- [ ] Structure contract documented in JSDoc
- [ ] Index-based access used throughout
- [ ] `moveInstrumentation()` used when replacing elements
- [ ] No data attributes used for structure/selection

**Reference:** 
- `blocks/hero/hero.js` - Simple block pattern
- `blocks/columns/columns.js` - Index-based access pattern
- Implementation guide: Part 1 - Frontend Development

---

#### Task 2.2: Test JavaScript Implementation (Browser Console)

**Testing Task (Human):**
1. Open browser developer console
2. Create a test HTML structure matching the index contract:
   ```html
   <div class="initiative-highlight">
     <div>
       <div><img src="/test-image.jpg" alt="Test image"></div>
       <div>Test alt text</div>
     </div>
     <div>
       <div>Test Title</div>
     </div>
     <div>
       <div>Test description text</div>
     </div>
     <div>
       <div><a href="/test-link">Link</a></div>
       <div>Learn More</div>
       <div>_blank</div>
     </div>
   </div>
   ```
3. Manually call `decorate(block)` with the test element
4. Verify:
   - [ ] Structure is transformed correctly
   - [ ] Image is optimized
   - [ ] Title, description, and CTA are rendered
   - [ ] No console errors
   - [ ] AEM authoring attributes are preserved (if testing in author mode)

---

### Phase 3: Frontend - CSS Styling

**Objective:** Style the block to match the Figma design with responsive behavior.

#### Task 3.1: Create Block CSS File

**File:** `blocks/initiative-highlight/initiative-highlight.css`

**Action:**
Create the CSS file with the following styles:

```css
/* Initiative Highlight Block */
.initiative-highlight {
  background-color: #f2f2f2;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  padding: 32px 24px;
}

.initiative-highlight__container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1440px;
  margin: 0 auto;
}

.initiative-highlight__image-wrapper {
  width: 100%;
  flex-shrink: 0;
}

.initiative-highlight__image-wrapper picture,
.initiative-highlight__image-wrapper img {
  width: 100%;
  height: auto;
  border-radius: 24px;
  object-fit: cover;
  display: block;
}

.initiative-highlight__content {
  display: flex;
  flex-direction: column;
  gap: 30px;
  width: 100%;
}

.initiative-highlight__title {
  font-family: 'TCCC-UnityHeadline', sans-serif;
  font-weight: 600;
  font-size: 32px;
  line-height: 1.2;
  letter-spacing: -0.96px;
  color: #000000;
  margin: 0;
}

.initiative-highlight__description {
  font-family: 'TCCC-UnityHeadline', sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.4;
  color: #000000;
  margin: 0;
}

.initiative-highlight__description p {
  margin: 0 0 1em 0;
}

.initiative-highlight__description p:last-child {
  margin-bottom: 0;
}

.initiative-highlight__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #000000;
  color: #ffffff;
  font-family: 'TCCC-UnityHeadline', sans-serif;
  font-weight: 600;
  font-size: 16px;
  line-height: 1.2;
  text-decoration: none;
  border-radius: 999px;
  padding: 20px 30px;
  min-height: 64px;
  width: 100%;
  max-width: fit-content;
  transition: opacity 0.2s ease;
}

.initiative-highlight__cta:hover {
  opacity: 0.8;
}

.initiative-highlight__cta:focus {
  outline: 2px solid #000000;
  outline-offset: 2px;
}

/* Desktop: Side-by-side layout */
@media (width >= 900px) {
  .initiative-highlight {
    padding: 40px;
  }

  .initiative-highlight__container {
    flex-direction: row;
    align-items: center;
    gap: 135px;
  }

  .initiative-highlight__image-wrapper {
    flex: 0 0 auto;
    width: 670px;
    max-width: 48%;
  }

  .initiative-highlight__content {
    flex: 1;
    padding: 100px 0;
    gap: 50px;
    max-width: 440px;
  }

  .initiative-highlight__title {
    font-size: 64px;
    letter-spacing: -1.92px;
  }

  .initiative-highlight__description {
    font-size: 18px;
  }

  .initiative-highlight__cta {
    width: auto;
  }
}
```

**Design Token Notes:**
- Colors: Background (#f2f2f2), text (#000000), button (#000000/#ffffff)
- Typography: TCCC-UnityHeadline (Medium 600, Regular 400)
- Spacing: 135px gap (desktop), 30px/50px content gaps
- Border radius: 8px container, 24px image, 999px button
- Breakpoint: 900px (matches existing blocks)

**Validation:**
- [ ] File created at correct path
- [ ] Styles match Figma design specifications
- [ ] Responsive breakpoints are correct (900px)
- [ ] Mobile-first approach (stacks vertically by default)
- [ ] Desktop layout (side-by-side) at >= 900px
- [ ] Accessibility: Focus states, hover states
- [ ] No hardcoded values that should be CSS variables (if design system uses them)

**Reference:**
- `blocks/hero/hero.css` - Simple block styling
- `blocks/columns/columns.css` - Responsive layout patterns
- Implementation guide: Part 1 - CSS Implementation

---

#### Task 3.2: Test CSS Styling (Visual Testing)

**Testing Task (Human):**
1. Open the page with the block in browser
2. Verify visual appearance:
   - [ ] Background color matches design (#f2f2f2)
   - [ ] Image has rounded corners (24px)
   - [ ] Title typography matches (size, weight, spacing)
   - [ ] Description typography matches
   - [ ] CTA button styling matches (black background, white text, rounded)
   - [ ] Spacing between elements is correct
3. Test responsive behavior:
   - [ ] Mobile (< 900px): Content stacks vertically, image on top
   - [ ] Desktop (>= 900px): Content side-by-side, image left
   - [ ] No horizontal scrolling on mobile
   - [ ] Text is readable at all breakpoints
4. Test interactions:
   - [ ] CTA button hover state works
   - [ ] CTA button focus state is visible (keyboard navigation)
   - [ ] CTA button is easily tappable on mobile

---

### Phase 4: Integration - Component Registration

**Objective:** Verify all configuration files are properly set up and linked.

#### Task 4.1: Verify Component Definition

**File:** `component-definition.json`

**Validation Checklist:**
- [ ] Definition exists in "Blocks" group
- [ ] ID is "initiative-highlight"
- [ ] Title is "Initiative Highlight"
- [ ] Resource type is "core/franklin/components/block/v1/block"
- [ ] Template name is "InitiativeHighlight"
- [ ] Template model is "initiative-highlight"
- [ ] JSON syntax is valid

**Action:**
Review the definition in `component-definition.json` and verify all properties match the specification.

---

#### Task 4.2: Verify Component Model

**File:** `component-models.json`

**Validation Checklist:**
- [ ] Model exists with ID "initiative-highlight"
- [ ] Model ID matches definition ID
- [ ] All 7 fields are present (image, imageAlt, title, description, ctaLink, ctaText, ctaTarget)
- [ ] Field order matches index contract:
  1. Image row: image, imageAlt
  2. Title row: title
  3. Description row: description
  4. CTA row: ctaLink, ctaText, ctaTarget
- [ ] Field types are correct (reference, text, richtext, aem-content)
- [ ] Validation rules are present where needed
- [ ] JSON syntax is valid

**Action:**
Review the model in `component-models.json` and verify all fields and their order.

---

#### Task 4.3: Verify Component Filters

**File:** `component-filters.json`

**Validation Checklist:**
- [ ] "initiative-highlight" is in section's components array
- [ ] No duplicate entries
- [ ] JSON syntax is valid

**Action:**
Review `component-filters.json` and verify the component is listed in the section filter.

---

#### Task 4.4: Run Build Command (if applicable)

**Testing Task (Human):**
If the project uses a build pipeline for JSON files:
- [ ] Run `npm run build:json` (or equivalent command)
- [ ] Verify no build errors
- [ ] Check that generated files are updated (if applicable)

**Note:** Some projects may not require a build step. Check project documentation.

---

### Phase 5: Integration - AEM Authoring Validation

**Objective:** Test the block in AEM authoring interface to ensure it works end-to-end.

#### Task 5.1: Deploy to AEM Environment

**Prerequisites:**
- [ ] All code changes committed
- [ ] Build process completed (if applicable)
- [ ] Deployment pipeline executed

**Testing Task (Human):**
- [ ] Verify deployment was successful
- [ ] Check AEM logs for any errors related to the new component

---

#### Task 5.2: Test Component in AEM Component Browser

**Testing Task (Human):**
1. Open AEM page editor
2. Navigate to component browser
3. Verify:
   - [ ] "Initiative Highlight" appears in the Blocks group
   - [ ] Component can be dragged onto the page
   - [ ] Component appears in the correct location

---

#### Task 5.3: Test Authoring Interface

**Testing Task (Human):**
1. Add the Initiative Highlight block to a page
2. Open the component's authoring dialog
3. Verify all fields appear:
   - [ ] Image field (with asset picker)
   - [ ] Alt Text field
   - [ ] Title field
   - [ ] Description field (rich text editor)
   - [ ] CTA Link field
   - [ ] CTA Text field
   - [ ] CTA Target field
4. Test field validation:
   - [ ] Title max length validation (200 chars)
   - [ ] CTA Text max length validation (100 chars)
   - [ ] CTA Target regex validation (empty, _self, or _blank)
5. Fill in sample content:
   - [ ] Upload/select an image
   - [ ] Enter alt text
   - [ ] Enter a title
   - [ ] Enter description with formatting
   - [ ] Select a CTA link
   - [ ] Enter CTA text
   - [ ] Select CTA target
6. Save the component
7. Verify:
   - [ ] Content saves successfully
   - [ ] No errors in AEM console

---

#### Task 5.4: Test Content Rendering in Author Mode

**Testing Task (Human):**
1. After saving content, view the page in AEM author mode
2. Verify:
   - [ ] Image displays correctly
   - [ ] Title displays correctly
   - [ ] Description displays with formatting
   - [ ] CTA button displays with correct text
   - [ ] CTA button links to correct URL
   - [ ] Layout matches design (side-by-side on desktop)
   - [ ] Styles are applied correctly
   - [ ] No console errors in browser

---

#### Task 5.5: Test Content Rendering in Publish Mode

**Testing Task (Human):**
1. Publish the page or view in publish mode
2. Verify:
   - [ ] All content renders correctly
   - [ ] Image is optimized and loads properly
   - [ ] Layout is responsive (stacks on mobile, side-by-side on desktop)
   - [ ] CTA button is clickable and navigates correctly
   - [ ] No broken links or missing assets
   - [ ] No console errors
   - [ ] Page performance is acceptable

---

#### Task 5.6: Test Responsive Behavior

**Testing Task (Human):**
1. Test on mobile device or browser dev tools (< 900px):
   - [ ] Content stacks vertically
   - [ ] Image appears above text
   - [ ] Text is readable without truncation
   - [ ] CTA button is easily tappable (min 44px touch target)
   - [ ] No horizontal scrolling
   - [ ] Spacing is appropriate

2. Test on tablet (768px - 899px):
   - [ ] Layout adapts appropriately
   - [ ] Content remains readable

3. Test on desktop (>= 900px):
   - [ ] Image and content display side-by-side
   - [ ] Image is on the left
   - [ ] Content is on the right
   - [ ] Spacing matches design (135px gap)
   - [ ] Typography scales correctly (64px title, 18px description)

---

#### Task 5.7: Test Accessibility

**Testing Task (Human):**
1. Keyboard navigation:
   - [ ] Tab order is logical
   - [ ] CTA button is focusable
   - [ ] Focus indicators are visible
   - [ ] Can activate CTA button with Enter/Space

2. Screen reader:
   - [ ] Image has alt text
   - [ ] Heading hierarchy is correct (h2 for title)
   - [ ] CTA button has descriptive text
   - [ ] Content is announced correctly

3. Visual:
   - [ ] Text contrast meets WCAG AA standards
   - [ ] Focus states are clearly visible
   - [ ] No content relies solely on color

---

#### Task 5.8: Test Edge Cases

**Testing Task (Human):**
1. Test with missing content:
   - [ ] Block handles missing image gracefully
   - [ ] Block handles missing title gracefully
   - [ ] Block handles missing description gracefully
   - [ ] Block handles missing CTA gracefully
   - [ ] Layout doesn't break with partial content

2. Test with long content:
   - [ ] Long title doesn't break layout
   - [ ] Long description wraps correctly
   - [ ] Long CTA text doesn't overflow button

3. Test with special characters:
   - [ ] HTML in description renders correctly (rich text)
   - [ ] Special characters in title display correctly
   - [ ] URLs in CTA link work correctly

4. Test with different image sizes:
   - [ ] Large images are optimized
   - [ ] Small images don't break layout
   - [ ] Image aspect ratio is maintained

---

## Implementation Checklist Summary

### Phase 0: Pre-Implementation ✅
- [x] Requirements gathered
- [x] Design analyzed
- [x] Similar blocks identified

### Phase 1: Backend - XWalk Configuration
- [ ] Component definition added to `component-definition.json`
- [ ] Component model added to `component-models.json`
- [ ] Component added to section filter in `component-filters.json`
- [ ] JSON syntax validated
- [ ] Build command run (if applicable)

### Phase 2: Frontend - JavaScript
- [ ] `initiative-highlight.js` created
- [ ] Index-based structure contract documented
- [ ] `decorate(block)` function implemented
- [ ] `moveInstrumentation()` used for DOM transformations
- [ ] JavaScript tested in browser console

### Phase 3: Frontend - CSS
- [ ] `initiative-highlight.css` created
- [ ] Mobile styles implemented
- [ ] Desktop styles implemented (>= 900px)
- [ ] Visual design matches Figma
- [ ] Responsive behavior tested

### Phase 4: Integration - Component Registration
- [ ] Component definition verified
- [ ] Component model verified
- [ ] Component filters verified
- [ ] Build process completed

### Phase 5: Integration - AEM Authoring Validation
- [ ] Component deployed to AEM
- [ ] Component appears in component browser
- [ ] Authoring interface works correctly
- [ ] Content renders in author mode
- [ ] Content renders in publish mode
- [ ] Responsive behavior verified
- [ ] Accessibility verified
- [ ] Edge cases tested

---

## File Structure

```
blocks/
  initiative-highlight/
    initiative-highlight.js      # Block JavaScript
    initiative-highlight.css     # Block Styles

component-definition.json         # Component definition (edited)
component-models.json            # Component model (edited)
component-filters.json           # Component filters (edited)
```

**Note:** No static HTML files are needed. HTML is generated automatically by AEM from XWalk configuration.

---

## Key Implementation Details

### Index-Based Structure Contract

The block uses index-based access only. The structure contract is:

```
block.children[0] = Image row
  - children[0] = Image (img/picture/a)
  - children[1] = Alt text

block.children[1] = Title row
  - children[0] = Title text

block.children[2] = Description row
  - children[0] = Description (rich text)

block.children[3] = CTA row
  - children[0] = CTA link (a element)
  - children[1] = CTA text
  - children[2] = CTA target (_self/_blank)
```

### Critical Implementation Points

1. **Index-Based Access Only:** Never use `data-aue-*` or `data-gen-*` attributes for structure or selection
2. **Instrumentation Preservation:** Always use `moveInstrumentation()` when replacing or moving elements
3. **Field Order:** Field order in XWalk model must match JavaScript index contract
4. **Responsive Breakpoint:** Use 900px as the desktop breakpoint (matches existing blocks)
5. **Image Optimization:** Use `createOptimizedPicture()` for responsive images
6. **Accessibility:** Semantic HTML, alt text, keyboard navigation, focus states

---

## References

### Implementation Guide
- [Creating EDS Block Implementation Guide](../../implementation-guide.md)

### Codebase References
- `blocks/hero/` - Simple block with image and text
- `blocks/cards/` - Complex block with nested items
- `component-definition.json` - Component definitions
- `component-models.json` - Field models (hero example: lines 192-217)
- `component-filters.json` - Nesting rules
- `scripts/aem.js` - Block loading, `createOptimizedPicture()`
- `scripts/scripts.js` - `moveInstrumentation()`

### Design Reference
- [Figma Design](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC?node-id=26-1326&m=dev)

---

## Success Criteria

The implementation is successful when:

1. ✅ Component appears in AEM component browser
2. ✅ All fields are authorable in AEM
3. ✅ Content renders correctly in author and publish modes
4. ✅ Desktop layout: Image left, content right (side-by-side)
5. ✅ Mobile layout: Image top, content below (stacked)
6. ✅ Styles match Figma design specifications
7. ✅ Responsive behavior works at all breakpoints
8. ✅ Accessibility requirements met
9. ✅ No console errors
10. ✅ Index-based structure works correctly (no reliance on data attributes)

---

**Document Version:** v1  
**Last Updated:** 2026-02-10  
**Status:** Ready for Implementation
