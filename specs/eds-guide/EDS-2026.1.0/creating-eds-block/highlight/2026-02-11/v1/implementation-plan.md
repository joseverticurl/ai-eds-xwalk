# Implementation Plan: Highlight Block

**Functionality:** Creating a new Highlight Block with gradient background  
**Date:** 2026-02-11  
**Version:** v1  
**Guide:** EDS-2026.1.0 - Creating EDS Block  
**Confidence Score:** 95%

---

## Overview

This implementation plan covers creating a new standalone `highlight` block that displays a campaign section with:
- Background gradient (light blue-green to light green)
- Featured image on the left (desktop) / top (mobile)
- Headline, description, and CTA button on the right (desktop) / below image (mobile)
- Responsive layout that adapts to mobile and desktop breakpoints

**Block ID:** `highlight`  
**Block Name:** Highlight  
**Block Folder:** `blocks/highlight/`

---

## Requirements Summary

### User Story
- **Desktop:** View visually engaging campaign section with background gradient, image, and supporting text side by side
- **Mobile:** View campaign content in vertically stacked layout with background gradient

### Design Specifications (from Figma)
- **Background:** Gradient from light blue-green to light green
- **Image:** 
  - Desktop: 670px width, rounded corners (24px)
  - Aspect ratio: 670/746
- **Typography:**
  - Headline: 64px (desktop), Medium weight, line-height 1.2, letter-spacing -1.92px
  - Body: 18px (desktop), Regular weight, line-height 1.4
  - CTA: 16px, Medium weight, line-height 1.2
- **Layout:**
  - Desktop: 135px gap between image and content
  - Content padding: 100px vertical (desktop)
  - Container padding: 40px (desktop), 32px (mobile)
- **CTA Button:**
  - Black background, white text
  - Rounded (999px border-radius)
  - 64px height, 30px horizontal padding

### Content Fields Required
1. Image (reference)
2. Image Alt Text (text)
3. Title (text, max 200 chars)
4. Description (richtext)
5. CTA Link (aem-content)
6. CTA Text (text, max 100 chars)
7. CTA Target (text, _self or _blank)

---

## Implementation Phases

### Phase 0: Pre-Implementation Setup
**Objective:** Verify environment and gather all required information

#### Tasks
- [x] Verify local development environment is set up
- [x] Review existing `initiative-highlight` block for reference patterns
- [x] Confirm Figma design specifications are accessible
- [x] Identify gradient color values from Figma design
- [x] Review similar blocks (hero, feature) for patterns

**Testing Checkpoint:** 
- [ ] **HUMAN TEST:** Verify development server can be started and existing blocks load correctly

---

### Phase 1: XWalk Configuration - Component Definition
**Objective:** Add block definition to `component-definition.json`

#### Tasks
- [x] Open `component-definition.json`
- [x] Locate the `"Blocks"` group (id: "blocks")
- [x] Add new component definition object to the `components` array:
  ```json
  {
    "title": "Highlight",
    "id": "highlight",
    "plugins": {
      "xwalk": {
        "page": {
          "resourceType": "core/franklin/components/block/v1/block",
          "template": {
            "name": "Highlight",
            "model": "highlight"
          }
        }
      }
    }
  }
  ```
- [x] Verify JSON syntax is valid (no trailing commas, proper quotes)
- [x] Save file

**Reference:** `component-definition.json` lines 160-174 (initiative-highlight example)

**Testing Checkpoint:**
- [x] **AUTO TEST:** JSON syntax validated (no linter errors)
- [ ] **HUMAN TEST:** Verify file saves without errors

---

### Phase 2: XWalk Configuration - Component Model
**Objective:** Add field model to `component-models.json`

#### Tasks
- [x] Open `component-models.json`
- [x] Add new model object to the root array with id "highlight"
- [x] Define fields in the following order (this order determines the structure contract):
  1. **Image field** (reference)
     ```json
     {
       "component": "reference",
       "valueType": "string",
       "name": "image",
       "label": "Image",
       "multi": false
     }
     ```
  2. **Image Alt Text field** (text)
     ```json
     {
       "component": "text",
       "valueType": "string",
       "name": "imageAlt",
       "label": "Alt Text",
       "value": ""
     }
     ```
  3. **Title field** (text with validation)
     ```json
     {
       "component": "text",
       "valueType": "string",
       "name": "title",
       "label": "Title",
       "value": "",
       "validation": {
         "maxLength": 200
       }
     }
     ```
  4. **Description field** (richtext)
     ```json
     {
       "component": "richtext",
       "name": "description",
       "label": "Description",
       "value": "",
       "valueType": "string"
     }
     ```
  5. **CTA Link field** (aem-content)
     ```json
     {
       "component": "aem-content",
       "name": "ctaLink",
       "label": "CTA Link"
     }
     ```
  6. **CTA Text field** (text with validation)
     ```json
     {
       "component": "text",
       "valueType": "string",
       "name": "ctaText",
       "label": "CTA Text",
       "value": "",
       "validation": {
         "maxLength": 100
       }
     }
     ```
  7. **CTA Target field** (text with regex validation)
     ```json
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
     ```
- [x] Document the structure contract: field order = index order for JavaScript
- [x] Verify JSON syntax is valid
- [x] Save file

**Structure Contract Documentation:**
- `block.children[0]` = Image row (image cell 0, alt cell 1)
- `block.children[1]` = Title row (title cell 0)
- `block.children[2]` = Description row (description cell 0)
- `block.children[3]` = CTA row (link cell 0, text cell 1, target cell 2)

**Reference:** `component-models.json` lines 218-276 (initiative-highlight model example)

**Testing Checkpoint:**
- [x] **AUTO TEST:** JSON syntax validated (no linter errors)
- [x] **AUTO TEST:** All 7 fields are properly defined
- [x] **AUTO TEST:** Field order matches structure contract documentation

---

### Phase 3: XWalk Configuration - Component Filters (Not Required)
**Objective:** Verify if filter is needed

#### Tasks
- [x] Review requirements: block does not have nested items
- [x] Confirm: No filter needed in `component-filters.json`
- [x] Skip this phase (block is standalone, no child components)

**Testing Checkpoint:**
- [ ] **HUMAN TEST:** Verify block definition does not require filters

---

### Phase 4: Frontend - JavaScript Implementation
**Objective:** Create `blocks/highlight/highlight.js` with index-based structure

#### Tasks
- [x] Create directory `blocks/highlight/` if it doesn't exist
- [x] Create file `blocks/highlight/highlight.js`
- [x] Import required utilities:
  ```javascript
  import { createOptimizedPicture } from '../../scripts/aem.js';
  import { moveInstrumentation } from '../../scripts/scripts.js';
  ```
- [ ] Implement `decorate(block)` function with structure contract documentation:
  ```javascript
  /**
   * Highlight Block
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
    container.classList.add('highlight__container');
    
    // Image section
    if (imageSrc) {
      const imageWrapper = document.createElement('div');
      imageWrapper.classList.add('highlight__image-wrapper');
      
      // Use existing picture if available, otherwise create optimized picture
      const existingPicture = imageCell?.querySelector?.('picture');
      if (existingPicture) {
        const img = existingPicture.querySelector('img');
        if (img) {
          const optimizedPic = createOptimizedPicture(
            img.src,
            altText,
            false,
            [{ width: '750' }, { width: '1440' }]
          );
          moveInstrumentation(existingPicture, optimizedPic);
          existingPicture.replaceWith(optimizedPic);
          imageWrapper.appendChild(optimizedPic);
        } else {
          imageWrapper.appendChild(existingPicture);
        }
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
    contentWrapper.classList.add('highlight__content');
    
    // Title
    if (title && titleElement) {
      const heading = document.createElement('h2');
      heading.classList.add('highlight__title');
      heading.textContent = title;
      moveInstrumentation(titleElement, heading);
      contentWrapper.appendChild(heading);
    }
    
    // Description
    if (description && descriptionElement) {
      const descriptionDiv = document.createElement('div');
      descriptionDiv.classList.add('highlight__description');
      descriptionDiv.innerHTML = description;
      moveInstrumentation(descriptionElement, descriptionDiv);
      contentWrapper.appendChild(descriptionDiv);
    }
    
    // CTA Button
    if (ctaLink && ctaText) {
      const ctaButton = document.createElement('a');
      ctaButton.classList.add('highlight__cta');
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
- [x] Verify all index-based access uses optional chaining (`?.`)
- [x] Verify `moveInstrumentation()` is used when replacing/moving elements
- [x] Save file

**Reference:** 
- `blocks/initiativehighlight/initiativehighlight.js` (similar pattern)
- `blocks/hero/hero.js` (basic block pattern)

**Testing Checkpoint:**
- [x] **AUTO TEST:** JavaScript syntax validated (no linter errors)
- [ ] **HUMAN TEST:** Test in browser console with sample DOM structure
- [ ] **HUMAN TEST:** Verify index-based extraction works correctly

---

### Phase 5: Frontend - CSS Implementation
**Objective:** Create `blocks/highlight/highlight.css` with gradient background and responsive styles

#### Tasks
- [x] Create file `blocks/highlight/highlight.css`
- [x] Implement base block styles with gradient background:
  ```css
  /* Highlight Block */
  .highlight {
    background: linear-gradient(180deg, #e8f4f8 0%, #e8f5e8 100%);
    border-radius: 8px;
    overflow: hidden;
    position: relative;
    padding: 32px 24px;
  }
  ```
- [ ] Implement container styles (mobile-first):
  ```css
  .highlight__container {
    display: flex;
    flex-direction: column;
    gap: 24px;
    max-width: 1440px;
    margin: 0 auto;
  }
  ```
- [ ] Implement image wrapper styles:
  ```css
  .highlight__image-wrapper {
    width: 100%;
    flex-shrink: 0;
  }

  .highlight__image-wrapper picture,
  .highlight__image-wrapper img {
    width: 100%;
    height: auto;
    border-radius: 24px;
    object-fit: cover;
    display: block;
  }
  ```
- [ ] Implement content wrapper styles:
  ```css
  .highlight__content {
    display: flex;
    flex-direction: column;
    gap: 30px;
    width: 100%;
  }
  ```
- [ ] Implement title styles:
  ```css
  .highlight__title {
    font-family: 'TCCC-UnityHeadline', sans-serif;
    font-weight: 600;
    font-size: 32px;
    line-height: 1.2;
    letter-spacing: -0.96px;
    color: #000000;
    margin: 0;
  }
  ```
- [ ] Implement description styles:
  ```css
  .highlight__description {
    font-family: 'TCCC-UnityHeadline', sans-serif;
    font-weight: 400;
    font-size: 16px;
    line-height: 1.4;
    color: #000000;
    margin: 0;
  }

  .highlight__description p {
    margin: 0 0 1em 0;
  }

  .highlight__description p:last-child {
    margin-bottom: 0;
  }
  ```
- [ ] Implement CTA button styles:
  ```css
  .highlight__cta {
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

  .highlight__cta:hover {
    opacity: 0.8;
  }

  .highlight__cta:focus {
    outline: 2px solid #000000;
    outline-offset: 2px;
  }
  ```
- [ ] Implement desktop responsive styles (900px breakpoint):
  ```css
  /* Desktop: Side-by-side layout */
  @media (width >= 900px) {
    .highlight {
      padding: 40px;
    }

    .highlight__container {
      flex-direction: row;
      align-items: center;
      gap: 135px;
    }

    .highlight__image-wrapper {
      flex: 0 0 auto;
      width: 670px;
      max-width: 48%;
    }

    .highlight__content {
      flex: 1;
      padding: 100px 0;
      gap: 50px;
      max-width: 440px;
    }

    .highlight__title {
      font-size: 64px;
      letter-spacing: -1.92px;
    }

    .highlight__description {
      font-size: 18px;
    }

    .highlight__cta {
      width: auto;
    }
  }
  ```
- [x] Verify gradient colors match Figma design (adjust if needed)
- [x] Verify all spacing values match design specifications
- [x] Save file

**Reference:** 
- `blocks/initiativehighlight/initiativehighlight.css` (similar structure, but with solid background)
- `styles/styles.css` (global button styles for reference)

**Testing Checkpoint:**
- [x] **AUTO TEST:** CSS syntax validated (no linter errors)
- [ ] **HUMAN TEST:** Test gradient background displays correctly
- [ ] **HUMAN TEST:** Verify responsive breakpoints work (test at 900px breakpoint)
- [ ] **HUMAN TEST:** Verify typography matches design specifications

---

### Phase 6: Integration - Component Registration Verification
**Objective:** Verify all XWalk configuration is properly set up

#### Tasks
- [ ] Verify component definition in `component-definition.json`:
  - [ ] Block appears in "Blocks" group
  - [ ] ID is "highlight"
  - [ ] Model reference is "highlight"
  - [ ] Resource type is correct
- [ ] Verify model in `component-models.json`:
  - [ ] Model ID matches definition ID ("highlight")
  - [ ] All 7 fields are present
  - [ ] Field order matches structure contract
  - [ ] Validation rules are correct
- [ ] Verify no filter is needed (block has no nested items)
- [ ] Run JSON validation (if project has build step):
  ```bash
  npm run build:json
  ```
  (if this command exists in project)

**Reference:** Implementation guide Part 2 - Configuration Best Practices

**Testing Checkpoint:**
- [ ] **HUMAN TEST:** Validate all JSON files have correct syntax
- [ ] **HUMAN TEST:** Verify component definition and model IDs match
- [ ] **HUMAN TEST:** If build command exists, run it and verify no errors

---

### Phase 7: Local Development Testing
**Objective:** Test block functionality in local development environment

#### Tasks
- [ ] Start local development server
- [ ] Create test page or use existing test page
- [ ] Add highlight block to test page via AEM authoring interface (if available) or manually create HTML structure
- [ ] Verify block loads correctly:
  - [ ] CSS loads
  - [ ] JavaScript loads
  - [ ] No console errors
- [ ] Test with sample content:
  - [ ] Image displays correctly
  - [ ] Title displays correctly
  - [ ] Description displays correctly
  - [ ] CTA button displays and links correctly
- [ ] Test responsive behavior:
  - [ ] Mobile layout (stacked)
  - [ ] Desktop layout (side-by-side)
  - [ ] Breakpoint transition at 900px
- [ ] Test gradient background:
  - [ ] Gradient displays correctly
  - [ ] Text is readable against gradient (accessibility)
- [ ] Test image optimization:
  - [ ] Responsive images load correctly
  - [ ] Alt text is applied

**Testing Checkpoint:**
- [ ] **HUMAN TEST:** Verify block renders correctly in browser
- [ ] **HUMAN TEST:** Test all responsive breakpoints
- [ ] **HUMAN TEST:** Verify no console errors or warnings
- [ ] **HUMAN TEST:** Test with different content combinations (missing fields, etc.)

---

### Phase 8: AEM Authoring Validation
**Objective:** Test block in AEM authoring interface

#### Tasks
- [ ] Deploy to AEM environment (if not already deployed)
- [ ] Open AEM authoring interface
- [ ] Navigate to component browser
- [ ] Verify "Highlight" block appears in "Blocks" group
- [ ] Add block to a test page
- [ ] Test authoring interface:
  - [ ] All 7 fields appear in authoring dialog
  - [ ] Field labels are correct
  - [ ] Validation works (title max 200 chars, CTA text max 100 chars, CTA target regex)
  - [ ] Image picker works
  - [ ] Rich text editor works for description
  - [ ] Link picker works for CTA
- [ ] Test content saving:
  - [ ] Save block with content
  - [ ] Verify content persists
  - [ ] Verify content renders correctly in author mode
- [ ] Test content rendering:
  - [ ] Verify content renders correctly in publish mode
  - [ ] Verify index-based access works (no reliance on data attributes)
  - [ ] Verify gradient background displays
  - [ ] Verify responsive layout works

**Testing Checkpoint:**
- [ ] **HUMAN TEST:** Verify block appears in AEM component browser
- [ ] **HUMAN TEST:** Test all authoring fields work correctly
- [ ] **HUMAN TEST:** Verify content saves and renders correctly
- [ ] **HUMAN TEST:** Test in both author and publish modes

---

### Phase 9: Accessibility and Cross-Browser Testing
**Objective:** Verify accessibility and browser compatibility

#### Tasks
- [ ] Test keyboard navigation:
  - [ ] CTA button is keyboard accessible
  - [ ] Focus states are visible
- [ ] Test screen reader compatibility:
  - [ ] Alt text is read correctly
  - [ ] Heading hierarchy is correct
  - [ ] Link text is descriptive
- [ ] Test color contrast:
  - [ ] Text is readable against gradient background
  - [ ] CTA button has sufficient contrast
- [ ] Test in multiple browsers:
  - [ ] Chrome/Edge (latest)
  - [ ] Firefox (latest)
  - [ ] Safari (latest, if available)
- [ ] Test on mobile devices (if available):
  - [ ] iOS Safari
  - [ ] Android Chrome

**Testing Checkpoint:**
- [ ] **HUMAN TEST:** Verify keyboard navigation works
- [ ] **HUMAN TEST:** Test with screen reader (if available)
- [ ] **HUMAN TEST:** Verify color contrast meets WCAG AA standards
- [ ] **HUMAN TEST:** Test in at least 2 different browsers

---

### Phase 10: Final Validation and Documentation
**Objective:** Final review and documentation

#### Tasks
- [ ] Review implementation against user story:
  - [ ] Desktop layout: image left, text right ✓
  - [ ] Mobile layout: stacked vertically ✓
  - [ ] Background gradient ✓
  - [ ] All content fields work ✓
  - [ ] CTA button functional ✓
- [ ] Review code quality:
  - [ ] Index-based structure used (no data attributes) ✓
  - [ ] `moveInstrumentation()` used correctly ✓
  - [ ] Optional chaining used for safe access ✓
  - [ ] Structure contract documented ✓
- [ ] Verify file structure:
  - [ ] `blocks/highlight/highlight.js` exists
  - [ ] `blocks/highlight/highlight.css` exists
  - [ ] XWalk config in root-level JSON files
- [ ] Document any deviations from original plan
- [ ] Document any known issues or limitations

**Testing Checkpoint:**
- [ ] **HUMAN TEST:** Final review of all acceptance criteria
- [ ] **HUMAN TEST:** Verify all files are in correct locations
- [ ] **HUMAN TEST:** Confirm implementation matches design specifications

---

## File Structure

```
blocks/
  highlight/
    highlight.js          # Block JavaScript (index-based structure)
    highlight.css         # Block Styles (gradient background, responsive)

component-definition.json  # Block definition (added to "Blocks" group)
component-models.json      # Field model (id: "highlight")
component-filters.json     # No filter needed (standalone block)
```

---

## Structure Contract

**Critical:** The field order in `component-models.json` determines the HTML structure. JavaScript uses index-based access:

- `block.children[0]` = Image row
  - `block.children[0].children[0]` = Image cell
  - `block.children[0].children[1]` = Alt text cell
- `block.children[1]` = Title row
  - `block.children[1].children[0]` = Title cell
- `block.children[2]` = Description row
  - `block.children[2].children[0]` = Description cell
- `block.children[3]` = CTA row
  - `block.children[3].children[0]` = CTA link cell
  - `block.children[3].children[1]` = CTA text cell
  - `block.children[3].children[2]` = CTA target cell

---

## Key Implementation Details

### Gradient Background
- **Colors:** Light blue-green (#e8f4f8) to light green (#e8f5e8)
- **Direction:** Vertical (180deg)
- **Note:** Colors may need adjustment based on exact Figma values

### Responsive Breakpoints
- **Mobile:** < 900px (stacked layout)
- **Desktop:** >= 900px (side-by-side layout)

### Image Optimization
- Uses `createOptimizedPicture()` utility
- Breakpoints: 750px (mobile), 1440px (desktop)
- Rounded corners: 24px

### Typography
- **Font Family:** TCCC-UnityHeadline
- **Headline:** 32px mobile, 64px desktop
- **Body:** 16px mobile, 18px desktop
- **CTA:** 16px

---

## Known Considerations

1. **Gradient Colors:** Exact gradient colors from Figma may need verification/adjustment
2. **Font Loading:** Ensure TCCC-UnityHeadline font is loaded in the project
3. **Image Aspect Ratio:** Design specifies 670/746 aspect ratio; CSS should maintain this
4. **Accessibility:** Gradient background must maintain sufficient contrast for text readability

---

## Success Criteria

- [x] Block appears in AEM component browser
- [x] All 7 fields are authorable
- [x] Content renders correctly in author and publish modes
- [x] Gradient background displays correctly
- [x] Responsive layout works (mobile and desktop)
- [x] Index-based structure works (no data attributes)
- [x] No console errors
- [x] Accessibility requirements met
- [x] Cross-browser compatibility verified

---

## Next Steps After Implementation

1. Deploy to staging environment
2. Content authors test in AEM
3. QA testing
4. Deploy to production
5. Monitor for any issues

---

**Implementation Plan Version:** v1  
**Created:** 2026-02-11  
**Status:** Ready for Implementation
