# Implementation Guide: Creating a New EDS Block

**Functionality:** Creating a New EDS Block with XWalk Authoring Integration  
**Date:** 2026-01-08  
**Version:** EDS-2026.1.0  
**Confidence Score:** 98% (based on analysis of 6+ existing blocks in codebase)

---

## Purpose and Scope

This guide provides step-by-step instructions for creating new EDS blocks or enhancing existing ones with XWalk authoring integration. It covers the complete development lifecycle from block creation to AEM authoring validation.

**Scope Includes:**
- Simple blocks (single content blocks)
- Complex blocks (nested items, containers)
- XWalk configuration for AEM authoring
- Frontend JavaScript and CSS
- Unit testing (if applicable)

**Out of Scope:**
- OSGi services
- Dispatcher configuration
- AEM templates and page policies

---

## Document Structure

This guide is organized into three main parts:

1. **Part 1: Frontend Development** - JavaScript and CSS implementation
2. **Part 2: AEM Authoring Configuration** - XWalk JSON configuration for backend integration
3. **Part 3: Integration & Workflow** - End-to-end flow, validation, and troubleshooting

---

## Pre-Implementation: Gathering Requirements

Before starting implementation, gather all necessary requirements and design assets. This ensures accurate implementation that matches design specifications and business requirements.

### Required Information

When creating a component implementation plan, **always ask for**:

1. **Figma Design URL**
   - Full Figma file URL or specific frame/component URL
   - Access permissions (if file is private)
   - Specific variant or state to implement (if multiple exist)
   - Breakpoint specifications (mobile, tablet, desktop)

2. **Story/Requirements Document**
   - User story or feature requirements
   - Acceptance criteria
   - Functional requirements
   - Content structure and field requirements
   - Interaction requirements (animations, hover states, etc.)
   - Accessibility requirements
   - Browser/device compatibility requirements

3. **Additional Context**
   - Similar existing blocks in codebase to reference
   - Content authoring requirements (what fields authors need)
   - Any AEM-specific requirements
   - Performance considerations

### Using Figma MCP Tools

**When Figma URL is provided, use Figma MCP tools to extract design information:**

1. **Extract Design Specifications:**
   - Use Figma MCP to fetch the design file
   - Extract component structure, layout, and hierarchy
   - Identify colors, typography, spacing, and sizing
   - Extract responsive breakpoints and variants
   - Identify interactive states (hover, active, disabled, etc.)

2. **Analyze Design Elements:**
   - Component structure and nesting
   - Text content and hierarchy
   - Image requirements and dimensions
   - Icon usage and placement
   - Button styles and states
   - Form elements (if applicable)

3. **Document Findings:**
   - Create a design analysis summary
   - Map Figma elements to HTML structure
   - Map Figma styles to CSS properties
   - Identify reusable components from `shared-components/`
   - Note any design tokens or CSS variables needed

**Example Workflow:**
```
1. Receive Figma URL: https://www.figma.com/file/...
2. Use Figma MCP to fetch design file
3. Analyze component structure and extract:
   - Layout: Grid, Flexbox, or custom
   - Colors: Primary, secondary, text colors
   - Typography: Font families, sizes, weights
   - Spacing: Margins, padding values
   - Breakpoints: Mobile, tablet, desktop
4. Cross-reference with story requirements
5. Create implementation plan based on design + requirements
```

### Requirements Checklist

Before starting implementation, ensure you have:

- [ ] Figma design URL with access
- [ ] Story/requirements document
- [ ] Design specifications extracted (via Figma MCP or manual review)
- [ ] Content structure mapped to XWalk fields
- [ ] Similar blocks identified for reference
- [ ] Breakpoint requirements confirmed
- [ ] Accessibility requirements documented
- [ ] Browser compatibility requirements noted

**Note:** If Figma URL or story requirements are missing, request them before proceeding with implementation. Accurate requirements prevent rework and ensure the component meets design and functional specifications.

---

# Part 1: Frontend Development

This section covers all frontend implementation aspects: JavaScript and CSS. HTML is generated automatically by AEM from XWalk configuration.

---

## Frontend Overview

### Block Types Supported

1. **Simple Blocks** - Single content blocks
   - Example: `hero`, `fragment`, `textsection`
   - See: `blocks/hero/`, `blocks/fragment/` in codebase

2. **Complex Blocks with Items** - Parent block with nested items
   - Example: `feature` → `featureItem`, `cards` → `card`
   - See: `blocks/feature/`, `blocks/cards/` in codebase

3. **Section-Level Blocks** - Section containers with nested blocks
   - Example: `section`, `tabs`, `columns`
   - See: `blocks/section/`, `blocks/tabs/` in codebase

### Frontend Tech Stack

- **JavaScript:** ES6+ modules
- **CSS:** Standard CSS (no preprocessor)
- **HTML:** Generated by AEM from XWalk configuration (no static HTML files); **index-based structure only** (no data attributes for selection)

### Index-Based Implementation Standard

All block HTML and JavaScript must use **index-based implementation**: elements are identified by their **position (index)** in the DOM (e.g. `block.children[0]`, `row.children[1]`). Do **not** use `data-*` attributes for structure or for selecting content. Document the structure contract (which index means which content) in the block’s code.

---

## Frontend File Structure

### Block Files

```
blocks/<block-name>/
├── <block-name>.js              # Block JavaScript (FRONTEND)
└── <block-name>.css             # Block Styles (FRONTEND)
```

**Note:** EDS projects do not use static HTML files. HTML is generated automatically by AEM from the XWalk configuration when content is authored.

**Note:** XWalk configuration is added directly to root-level files (see Part 2):
- `component-definition.json` - Component definitions
- `component-models.json` - Field models
- `component-filters.json` - Nesting rules

### Shared Resources

```
shared-components/               # Reusable frontend utilities
    ├── Heading.js
    ├── ImageComponent.js
    ├── ButtonCTA.js
├── SvgIcon.js
    └── Utility.js
```

---

## Frontend: JavaScript Implementation

### Block Initialization Flow

```
1. Page Load
   ↓
2. decorateSections() - Scans for sections
   ↓
3. decorateBlock() - Marks block as 'initialized'
   - Adds 'block' class and block metadata
   - Wraps text nodes
   ↓
4. loadBlock() - Async loading
   - Loads CSS: <block-name>.css
   - Imports JS: <block-name>.js
   - Calls default export: decorate(block)
   ↓
5. Block Status: 'loaded'
```

**Reference:** `scripts/aem.js` lines 777-826

### Block Status Lifecycle

Blocks progress through: `initialized` → `loading` → `loaded`. Check `block.dataset.blockStatus` before operations that should run once.

**Reference:** `scripts/aem.js` lines 777-826

### Index-Based Structure and Data Extraction

**Standard:** Use **index-based implementation** only. Do not rely on data attributes for structure or selection. All elements are identified by their **position (index)** in the DOM. This keeps HTML semantic, avoids brittle attribute coupling, and follows a clear structure contract.

#### Structure Contract (Index Convention)

Define a fixed order of direct children so that index = meaning. Document this contract in the block’s comment or README.

**Simple block (single row of cells):**
- `block.children[0]` = first row (often title or primary content)
- `block.children[0].children[0]` = first cell, `block.children[0].children[1]` = second cell, etc.

**Multi-row block (rows as direct children):**
- `block.children[0]` = row 1 (e.g. title row)
- `block.children[1]` = row 2 (e.g. description row)
- `block.children[2]` = row 3 (e.g. CTA row)
- Each row’s cells: `row.children[0]`, `row.children[1]`, …

**Block with items (each row = one item):**
- `block.children` = list of item rows
- For each row: `row.children[0]` = field 1, `row.children[1]` = field 2, etc.

#### Index-Based Data Extraction Patterns

```javascript
// Simple block: first row, first cell = title
const firstRow = block.children[0];
const titleElement = firstRow?.children?.[0];
const title = titleElement?.textContent?.trim() || '';

// Multi-row: row index = meaning (document in block comment)
const rows = [...block.children];
const title = rows[0]?.children?.[0]?.textContent?.trim() || '';
const description = rows[1]?.children?.[0]?.textContent?.trim() || '';

// Items: each direct child is one item; cells by index
const items = Array.from(block.children).map((row) => ({
  title: row.children?.[0]?.textContent?.trim() ?? '',
  description: row.children?.[1]?.textContent?.trim() ?? '',
  link: row.children?.[2]?.querySelector?.('a')?.getAttribute?.('href') ?? ''
}));

// Link row: 3 cells = text, icon, target (by index)
const linkRow = block.children[2];
if (linkRow?.children?.length >= 3) {
  const [linkCell, iconCell, targetCell] = linkRow.children;
  const linkData = {
    text: linkCell?.textContent?.trim(),
    url: linkCell?.querySelector?.('a')?.getAttribute?.('href'),
    icon: iconCell?.textContent?.trim()?.replace('-', ''),
    target: targetCell?.textContent?.trim()
  };
}

// Image: first cell = image (anchor or img), second cell = alt text
const imageRow = block.children[0];
const imageCell = imageRow?.children?.[0];
const altCell = imageRow?.children?.[1];
const imageSrc = imageCell?.querySelector?.('img')?.getAttribute?.('src')
  || imageCell?.querySelector?.('a')?.getAttribute?.('href');
const altText = altCell?.textContent?.trim() || '';

// Safe access with fallbacks
const value = element?.textContent?.trim() ?? 'default';
```

**Best practice:** Use optional chaining (`?.`) and nullish coalescing (`??`) for index-based access. Document the index contract at the top of the block’s `decorate()` function.

### Reusable Frontend Components

**Location:** `shared-components/`

1. **Heading.js** - Dynamic heading generator
   - Usage: `Heading({ level: 2, text: "Title", className: "class" })`
   - Reference: `shared-components/Heading.js`

2. **ImageComponent.js** - Responsive image component
   - Usage: `ImageComponent({ src, alt, className, breakpoints })`
   - Reference: `shared-components/ImageComponent.js`

3. **ButtonCTA.js** - CTA button component
   - Usage: `ButtonCTA({ link, text, type, target })`
   - Reference: `shared-components/ButtonCTA.js`

4. **Utility.js** - Utility functions
   - `stringToHTML()` - Convert string to DOM element (sanitizes HTML)
   - `isMobile()` - Mobile detection
   - Reference: `shared-components/Utility.js`

5. **SvgIcon.js** - SVG icon component
   - Reference: `shared-components/SvgIcon.js`

### Frontend Utility Functions

**From `scripts/aem.js`:**
- `createOptimizedPicture()` - Optimized image creation
- `loadBlock()` - Block loading mechanism
- `loadSections()` - Load sections asynchronously (for fragments)
- `getMetadata()` - Extract metadata from page

**From `scripts/scripts.js`:**
- `moveInstrumentation(from, to)` - **Critical:** When transforming DOM, use when moving or replacing elements so that any authoring instrumentation (e.g. from AEM) is preserved on the new structure. Always use when replacing elements.

**Reference:** `scripts/aem.js`, `scripts/scripts.js` lines 45-53

### JavaScript Templates

#### Synchronous Block Template (Index-Based)

```javascript
import Heading from '../../shared-components/Heading.js';
import ImageComponent from '../../shared-components/ImageComponent.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import stringToHTML from '../../shared-components/Utility.js';

/**
 * Structure contract: block.children[0] = title row, block.children[1] = content row.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // Index-based extraction: first row, first cell = title
  const firstRow = block.children[0];
  const titleElement = firstRow?.children?.[0];
  const title = titleElement?.textContent?.trim() || '';

  const container = document.createElement('div');
  container.classList.add('container');

  if (title && titleElement) {
    const heading = Heading({ level: 2, text: title, className: 'title' });
    const parsedHeading = stringToHTML(heading);
    moveInstrumentation(titleElement, parsedHeading);
    container.appendChild(parsedHeading);
  }

  block.innerHTML = '';
  block.appendChild(container);
}
```

**Reference:** `blocks/hero/hero.js`, `blocks/feature/feature.js`

#### Async Block Template (for External Resources)

```javascript
import { loadFragment } from '../fragment/fragment.js';
import { loadSections } from '../../scripts/aem.js';

/**
 * Decorates the block (async for loading external content)
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  
  try {
    const fragment = await loadFragment(path);
    if (fragment) {
      const fragmentSection = fragment.querySelector(':scope .section');
      if (fragmentSection) {
        block.classList.add(...fragmentSection.classList);
        block.replaceChildren(...fragmentSection.childNodes);
      }
    }
  } catch (error) {
    // Handle error gracefully
    console.error(`Failed to load fragment: ${path}`, error);
  }
}
```

## Recommended Patterns and Anti-Patterns

**Reference:** See `specs/eds-guide/EDS-2026.1.0/creating-eds-block/tech-design.md` for detailed patterns and anti-patterns.

### Recommended Patterns

#### Pattern 1: Standard Block Decoration (Index-Based)

**Use Case:** Simple content blocks (hero, text sections)

```javascript
// Structure: block.children[0] = title row, block.children[1] = content row
export default function decorate(block) {
  const rows = [...block.children];
  const title = rows[0]?.children?.[0]?.textContent?.trim();

  const wrapper = document.createElement('div');
  wrapper.className = 'blockname-wrapper';
  // ... build structure using index-based data

  moveInstrumentation(block, wrapper);
  block.replaceChildren(wrapper);
}
```

**Reference:** `specs/eds-guide/EDS-2026.1.0/creating-eds-block/tech-design.md` - Pattern 1

#### Pattern 2: Complex Block with Nested Items

**Use Case:** Parent block with child items (cards → card)

```javascript
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);  // CRITICAL
    // ... transform row content
    ul.append(li);
  });
  block.replaceChildren(ul);
}
```

**Reference:** `specs/eds-guide/EDS-2026.1.0/creating-eds-block/tech-design.md` - Pattern 2

#### Pattern 3: Async Block with External Content

**Use Case:** Blocks loading fragments or external content

```javascript
export default async function decorate(block) {
  const path = block.querySelector('a')?.getAttribute('href') || block.textContent.trim();
  const content = await loadFragment(path);
  if (content) {
    block.replaceChildren(...content.childNodes);
  }
}
```

**Reference:** `specs/eds-guide/EDS-2026.1.0/creating-eds-block/tech-design.md` - Pattern 3

#### Pattern 4: Interactive Block with Event Handlers

**Use Case:** Blocks with user interaction (navigation, tabs)

```javascript
export default async function decorate(block) {
  // Setup DOM
  // ...
  
  // Add event listeners
  block.querySelector('.button').addEventListener('click', handleClick);
  
  // Media query listeners
  const isDesktop = window.matchMedia('(min-width: 900px)');
  isDesktop.addEventListener('change', handleResize);
}
```

**Reference:** `specs/eds-guide/EDS-2026.1.0/creating-eds-block/tech-design.md` - Pattern 4

#### Pattern 5: Image Optimization (Index-Based)

**Use Case:** Blocks displaying images. Assume image row is first row; first cell contains picture/img.

```javascript
import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

// In decorate function: image in first row, first cell
const imageRow = block.children[0];
const pictureOrImg = imageRow?.children?.[0]?.querySelector?.('picture, img');
if (pictureOrImg) {
  const img = pictureOrImg.tagName === 'IMG' ? pictureOrImg : pictureOrImg.querySelector('img');
  if (img) {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture')?.replaceWith(optimizedPic) || img.replaceWith(optimizedPic);
  }
}
```

**Reference:** `specs/eds-guide/EDS-2026.1.0/creating-eds-block/tech-design.md` - Pattern 5

### Anti-Patterns to Avoid

#### ❌ Anti-Pattern 1: Skipping Instrumentation Preservation

```javascript
// ❌ WRONG - Loses AEM authoring attributes
const newElement = document.createElement('div');
newElement.innerHTML = block.innerHTML;
block.replaceChildren(newElement);

// ✅ CORRECT - Preserves AEM authoring attributes
const newElement = document.createElement('div');
moveInstrumentation(block, newElement);
while (block.firstElementChild) newElement.append(block.firstElementChild);
block.replaceChildren(newElement);
```

**Impact:** AEM authoring interface will not work correctly  
**Reference:** `specs/eds-guide/EDS-2026.1.0/creating-eds-block/tech-design.md` - Anti-Pattern 1

#### ❌ Anti-Pattern 2: Hardcoding Breakpoints

```javascript
// ❌ WRONG
if (window.innerWidth >= 1024) { ... }

// ✅ CORRECT - Use consistent breakpoint
const isDesktop = window.matchMedia('(min-width: 900px)');
if (isDesktop.matches) { ... }
```

**Impact:** Inconsistent responsive behavior  
**Reference:** `specs/eds-guide/EDS-2026.1.0/creating-eds-block/tech-design.md` - Anti-Pattern 2

#### ❌ Anti-Pattern 3: Missing XWalk Configuration

**Issue:** Block works but cannot be authored in AEM because XWalk configuration is missing.

**Solution:** Add block definition to `component-definition.json`, model to `component-models.json`, and filter (if needed) to `component-filters.json` in root-level files.

**Impact:** Block cannot be configured in AEM authoring interface  
**Reference:** `specs/eds-guide/EDS-2026.1.0/creating-eds-block/tech-design.md` - Anti-Pattern 3

#### ❌ Anti-Pattern 4: Using innerHTML with User Content

```javascript
// ❌ WRONG - XSS risk
element.innerHTML = userContent;

// ✅ CORRECT - Safe
element.textContent = userContent;
// OR use sanitization utility if HTML needed
import stringToHTML from '../../shared-components/Utility.js';
const safeHTML = stringToHTML(userContent);
```

**Impact:** Security vulnerability  
**Reference:** `specs/eds-guide/EDS-2026.1.0/creating-eds-block/tech-design.md` - Anti-Pattern 4

#### ❌ Anti-Pattern 5: Not Running Build Command

```bash
# After adding XWalk config, must run:
npm run build:json
# Otherwise component-*.json files won't be updated
```

**Impact:** AEM won't recognize new block (if project uses build pipeline)  
**Reference:** `specs/eds-guide/EDS-2026.1.0/creating-eds-block/tech-design.md` - Anti-Pattern 5

**Note:** For detailed explanations and more patterns, see `specs/eds-guide/EDS-2026.1.0/creating-eds-block/tech-design.md` - Component/Service Patterns and Anti-Patterns section.

### Advanced Frontend Patterns

#### Fragment Loading (Async Blocks)

For blocks loading external content (header/footer):

```javascript
import { loadFragment } from '../fragment/fragment.js';
import { loadSections } from '../../scripts/aem.js';

export default async function decorate(block) {
  const path = block.querySelector('a')?.getAttribute('href') || block.textContent.trim();
  try {
    const fragment = await loadFragment(path);
    if (fragment) {
      await loadSections(fragment);
      block.replaceChildren(...fragment.childNodes);
    }
  } catch (error) {
    console.error(`Failed to load fragment: ${path}`, error);
  }
}
```

#### Event Handlers

**Resize handlers:** Call initially, then add listener. Consider cleanup if block is removed.
**Click handlers:** Use event delegation on block container.

**Reference:** `blocks/fragment/fragment.js`, `blocks/header/header.js`, `blocks/footer/footer.js`

#### Block Wrapper Classes

Automatically added by `decorateBlock()`:
- `<block-name>-wrapper` - On block's parent element
- `<block-name>-container` - On section containing block

**Reference:** `scripts/aem.js` lines 819-822

---

## Frontend: CSS Implementation

### CSS File Structure

**Path:** `blocks/<block-name>/<block-name>.css`

**Purpose:** Block-specific styling

**Reference:** `blocks/hero/hero.css`

### CSS Template

```css
/* Block container styles */
.block-name {
  /* Block styles */
}

/* Block wrapper (added automatically by decorateBlock) */
.block-name-wrapper {
  /* Wrapper styles */
}

/* Section container (added automatically if block is in section) */
.block-name-container {
  /* Container styles */
}

/* Block elements (BEM-like naming) */
.block-name__element {
  /* Element styles */
}

.block-name__element--modifier {
  /* Modifier styles */
}

/* Responsive breakpoints */
@media (width >= 768px) {
  /* Tablet styles */
}

@media (width >= 992px) {
  /* Desktop styles */
}
```

**CSS Naming Conventions:**
- Use block name as base class (e.g., `.hero`, `.feature`)
- Use descriptive class names for elements
- Follow BEM-like patterns for modifiers
- Keep styles scoped to block to avoid conflicts

**Reference:** `blocks/hero/hero.css`

---

## Frontend: HTML Implementation

### Index-Based HTML Structure (No Data Attributes)

**Standard:** Use **semantic, index-based HTML** only. Do **not** use `data-aue-*`, `data-gen-*`, or other data attributes for structure. The block’s JavaScript must rely solely on **element position (index)** to identify content. This keeps markup clean and aligns with the structure contract.

**Rules:**
- One meaning per position: e.g. first row = title, second row = description.
- Use semantic elements (`<p>`, `<h2>`, `<ul>`, `<a>`, etc.) where appropriate.
- Keep a fixed order of rows and cells so index-based selection is reliable.
- Document the index contract in the block’s JS (e.g. in the `decorate()` JSDoc).

### Expected DOM Structure Examples

**Note:** These examples show the expected DOM structure as generated by AEM. EDS projects do not use static HTML files.

**Purpose:** Frontend development and visual testing. Structure must match the index contract used in the block’s JS.

**Simple block (two rows: title, description):**

```html
<div class="block-name">
  <div>
    <div>Title Text</div>
  </div>
  <div>
    <div>Description text</div>
  </div>
</div>
```

**With link row (three cells: text, icon, target):**

```html
<div class="block-name">
  <div>
    <div>Title Text</div>
  </div>
  <div>
    <div>Description text</div>
  </div>
  <div>
    <div><a href="/path">Link Text</a></div>
    <div>icon-name</div>
    <div>_blank</div>
  </div>
</div>
```

**Block with items (each direct child = one item; cells by index):**

```html
<div class="block-name">
  <div>
    <div>Item 1 Title</div>
    <div>Item 1 description</div>
  </div>
  <div>
    <div>Item 2 Title</div>
    <div>Item 2 description</div>
  </div>
</div>
```

**Reference:** Match structure to the index contract documented in the block’s `decorate()` function.

---

## Frontend Best Practices

### ✅ JavaScript Best Practices

- ✅ **DO:** Use ES6+ module syntax, import from `shared-components/`
- ✅ **DO:** Use **index-based selection only**: access elements by position (e.g. `block.children[0]`, `row.children[1]`). Do not use data attributes for structure or selection.
- ✅ **DO:** Document the **structure contract** (which index = which content) in the block’s `decorate()` JSDoc.
- ✅ **DO:** Use optional chaining (`?.`) and nullish coalescing (`??`) for index-based access.
- ✅ **DO:** Use `moveInstrumentation()` when replacing or moving elements.
- ✅ **DO:** Make `decorate()` async if loading external resources.
- ✅ **DO:** Preserve semantic HTML structure.

### ❌ JavaScript Anti-patterns

- ❌ **DON'T:** Use `data-aue-*` or `data-gen-*` (or any data attributes) for selecting or identifying block content; use index-based access only.
- ❌ **DON'T:** Use global variables, skip error handling, or mutate shared components.
- ❌ **DON'T:** Access `children[index]` without null checks or forget `moveInstrumentation()` when transforming DOM.
- ❌ **DON'T:** Block main thread or use sync operations for external resources.

### ✅ CSS Best Practices

- ✅ **DO:** Use block-specific class names
- ✅ **DO:** Follow responsive design patterns
- ✅ **DO:** Use CSS variables for theming
- ✅ **DO:** Keep styles scoped to block

### ❌ CSS Anti-patterns

- ❌ **DON'T:** Use overly specific selectors
- ❌ **DON'T:** Hardcode colors/values
- ❌ **DON'T:** Skip responsive breakpoints

### ✅ HTML Best Practices

- ✅ **DO:** Match the **index-based structure contract** (same row/cell order as in the block’s JS).
- ✅ **DO:** Use **semantic HTML** only; do **not** use data attributes for structure.
- ✅ **DO:** Keep a fixed, documented order of rows and cells so index-based selection is reliable.
- ✅ **DO:** Test in local development environment.

---

# Part 2: AEM Authoring Configuration (Backend)

This section covers XWalk JSON configuration for AEM authoring interface integration.

---

## Configuration Overview

### XWalk Configuration Files

**Root-Level Configuration Files (MANDATORY):**
- `component-definition.json` - Component definitions (add block definition here)
- `component-models.json` - Field models (add block model here)
- `component-filters.json` - Nesting rules (add block filters here)

**Purpose:** AEM authoring interface configuration

**Structure:** 
- Definitions are added to `component-definition.json` in the appropriate group's `components` array
- Models are added to `component-models.json` as new objects in the array
- Filters are added to `component-filters.json` as new objects in the array

**Reference Examples:**
- Simple block: See `hero` definition in `component-definition.json` (lines 145-159)
- Complex block: See `cards` and `card` definitions in `component-definition.json` (lines 85-114)
- Models: See `hero` model in `component-models.json` (lines 192-217)
- Filters: See `cards` filter in `component-filters.json` (lines 21-26)

### Configuration Flow

```
1. Developer adds block configuration:
   - Add definition to component-definition.json (in appropriate group)
   - Add model to component-models.json
   - Add filters to component-filters.json (if needed)
   ↓
2. Author opens AEM page editor
   - XWalk reads component-definition.json
   - Finds block definition
   ↓
3. Authoring UI generated from:
   - component-models.json (field definitions)
   - component-filters.json (nesting rules)
   ↓
4. Author configures block
   - Fields mapped from model
   - Validation applied
   ↓
5. Content saved to AEM
   - Rendered as HTML; block JS uses index-based structure only (no reliance on data attributes)
```

**Reference:** `component-definition.json`, `component-models.json`, `component-filters.json`

---

## Component Definition Structure

### Step-by-Step: Adding Configuration to Root-Level Files

**Important:** XWalk configuration is added directly to three root-level JSON files. Do NOT create `_<block-name>.json` files in block folders.

#### Step 1: Add Definition to component-definition.json

**Location:** Add to the `"Blocks"` group's `components` array in `component-definition.json`

**Standard Block Definition:**

```json
{
  "title": "Block Name",
  "id": "blockname",
  "plugins": {
    "xwalk": {
      "page": {
        "resourceType": "core/franklin/components/block/v1/block",
        "template": {
          "name": "BlockName",
          "model": "blockname"
        }
      }
    }
  }
}
```

**Where to add:** Inside `component-definition.json` → `groups` → find group with `"id": "blocks"` → `components` array

**Example from codebase:**
```json
{
  "groups": [
    {
      "title": "Blocks",
      "id": "blocks",
      "components": [
        {
          "title": "HeroComponent",
          "id": "hero",
          "plugins": {
            "xwalk": {
              "page": {
                "resourceType": "core/franklin/components/block/v1/block",
                "template": {
                  "name": "Hero",
                  "model": "hero"
                }
              }
            }
          }
        }
        // Add your new block definition here
      ]
    }
  ]
}
```

**Reference:** `component-definition.json` lines 145-159 (hero example)

### Block with Items (Parent + Child)

**Parent Block Definition:**
```json
{
  "title": "Parent Block",
  "id": "parentblock",
  "plugins": {
    "xwalk": {
      "page": {
        "resourceType": "core/franklin/components/block/v1/block",
        "template": {
          "name": "ParentBlock",
          "filter": "parentblock"
        }
      }
    }
  }
}
```

**Child Item Definition:**
```json
{
  "title": "Item",
  "id": "item",
  "plugins": {
    "xwalk": {
      "page": {
        "resourceType": "core/franklin/components/block/v1/block/item",
        "template": {
          "name": "Item",
          "model": "item"
        }
      }
    }
  }
}
```

**Both definitions go in the same `components` array**

**Reference:** `component-definition.json` lines 85-114 (cards + card example)

---

## Field Configuration

### Field Component Types

**Common Field Types:**
- `text` - Single line text
- `richtext` - Rich text editor
- `reference` - Asset reference
- `custom-asset-namespace:custom-asset` - DAM asset picker
- `aem-content` - AEM content reference
- `select` - Dropdown
- `multiselect` - Multiple selection
- `boolean` - Checkbox
- `tab` - Tab separator (for grouping)
- `container` - Container for nested fields

**Reference:** `component-models.json` (comprehensive examples)

### Validation Patterns

```json
{
  "component": "text",
  "name": "fieldName",
  "label": "Field Label",
  "validation": {
    "maxLength": 100,
    "customErrorMsg": "Error message"
  }
}
```

**Validation Types:**
- `maxLength` - Character limit
- `maxSize` - Size limit (for text fields)
- `minLength` - Minimum length
- `regExp` - Regular expression
- `customErrorMsg` - Custom error message
- `rootPath` - Asset path restriction (for custom-asset)

**Reference:** `component-models.json` lines 159, 1156, 1166, 911

### Adding Model to component-models.json

**Location:** Add as a new object to the root array in `component-models.json`

**Model Structure:**

```json
{
  "id": "blockname",
  "fields": [
    {
      "component": "text",
      "name": "title",
      "label": "Title",
      "valueType": "string"
    },
    {
      "component": "richtext",
      "name": "text",
      "label": "Text",
      "value": "",
      "valueType": "string"
    }
  ]
}
```

**Where to add:** Directly in the root array of `component-models.json`

**Example from codebase:**
```json
[
  {
    "id": "page-metadata",
    "fields": [...]
  },
  {
    "id": "hero",
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
        "label": "Alt",
        "value": ""
      },
      {
        "component": "richtext",
        "name": "text",
        "value": "",
        "label": "Text",
        "valueType": "string"
      }
    ]
  }
  // Add your new model here
]
```

**Important:** The `id` field must match the `model` value in the definition's `template.model` property.

**Reference:** `component-models.json` lines 192-217 (hero model example)

### Field Condition Patterns

```json
{
  "component": "text",
  "name": "conditionalField",
  "label": "Conditional Field",
  "condition": {
    "===": [
      { "var": "otherField" },
      true
    ]
  }
}
```

**Reference:** `component-models.json` lines 1197-1204

---

## Resource Types

### Available Resource Types

- **`core/franklin/components/block/v1/block`** - Standard block
- **`core/franklin/components/block/v1/block/item`** - Block item (nested)
- **`core/franklin/components/section/v1/section`** - Section container
- **`core/franklin/components/columns/v1/columns`** - Columns layout
- **`core/franklin/components/button/v1/button`** - Button component
- **`core/franklin/components/image/v1/image`** - Image component

**Reference:** `component-definition.json`

---

## Filter/Nesting Rules

### Adding Filters to component-filters.json

**Location:** Add as new objects to the `component-filters.json` array

**Filter Configuration:**

```json
{
  "id": "parentblock",
  "components": ["item", "linkField"]
}
```

**Where to add:** Directly in the root array of `component-filters.json`

**Example from codebase:**
```json
[
  {
    "id": "main",
    "components": ["section"]
  },
  {
    "id": "section",
    "components": ["text", "image", "button", "title", "hero", "cards", "columns", "fragment"]
  },
  {
    "id": "cards",
    "components": ["card"]
  }
  // Add your new filter here
]
```

**Reference:** `component-filters.json` lines 21-26 (cards filter example)

---

## Reusable Models

**Location:** `models/`

- **`_button.json`** - Button field definition
- **`_image.json`** - Image field definition
- **`_title.json`** - Title field definition
- **`_text.json`** - Text field definition
- **`_section.json`** - Section field definition

**Usage:** Reference in XWalk config using JSON pointer or include fields directly

**Reference:** `models/_button.json`, `models/_image.json`

---

## XWalk Configuration Template

### Complete Configuration Example

**Step 1: Add Definition to component-definition.json**

In `component-definition.json`, find the `"Blocks"` group and add:

```json
{
  "title": "Block Name",
  "id": "blockname",
  "plugins": {
    "xwalk": {
      "page": {
        "resourceType": "core/franklin/components/block/v1/block",
        "template": {
          "name": "BlockName",
          "model": "blockname"
        }
      }
    }
  }
}
```

**Step 2: Add Model to component-models.json**

In `component-models.json`, add as new object in the array:

```json
{
  "id": "blockname",
  "fields": [
    {
      "component": "text",
      "name": "title",
      "label": "Title",
      "valueType": "string"
    },
    {
      "component": "richtext",
      "name": "text",
      "label": "Text",
      "value": "",
      "valueType": "string"
    }
  ]
}
```

**Step 3: Add Filter to component-filters.json (if needed)**

In `component-filters.json`, add as new object in the array (only if block has nested items):

```json
{
  "id": "blockname",
  "components": ["item"]
}
```

**Reference:** 
- Definition: `component-definition.json` lines 145-159 (hero)
- Model: `component-models.json` lines 192-217 (hero)
- Filter: `component-filters.json` lines 21-26 (cards)

---

## Configuration Best Practices

### ✅ XWalk Configuration Best Practices

- ✅ **DO:** Add definitions directly to `component-definition.json` in the appropriate group
- ✅ **DO:** Add models directly to `component-models.json` as new array objects
- ✅ **DO:** Add filters directly to `component-filters.json` as new array objects (if needed)
- ✅ **DO:** Use consistent naming between definition ID and model ID
- ✅ **DO:** Add validation rules for user input
- ✅ **DO:** Use reusable models from `models/` directory when possible (copy fields)
- ✅ **DO:** Set appropriate resource types
- ✅ **DO:** Keep JSON syntax valid (use a JSON validator)

### ❌ XWalk Configuration Anti-patterns

- ❌ **DON'T:** Skip validation rules
- ❌ **DON'T:** Use inconsistent naming between definition ID and model ID
- ❌ **DON'T:** Mix resource types incorrectly
- ❌ **DON'T:** Forget to add all three parts (definition, model, filter if needed)

---

# Part 3: Integration & Workflow

This section covers the end-to-end workflow, integration between frontend and backend, validation, and troubleshooting.

---

## End-to-End Flow

### Sequence Diagram

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│   Author    │     │   XWalk      │     │   Block     │     │   Frontend   │
│   (AEM UI)  │────▶│   Config     │────▶│   JS/CSS    │────▶│   (Browser)  │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────────┘
      │                    │                    │                    │
      │ 1. Configure       │                    │                    │
      │    Block in AEM    │                    │                    │
      │                    │                    │                    │
      │                    │ 2. Save to         │                    │
      │                    │    Content         │                    │
      │                    │                    │                    │
      │                    │                    │ 3. Page Load       │
      │                    │                    │    decorateBlock() │
      │                    │                    │                    │
      │                    │                    │ 4. loadBlock()      │
      │                    │                    │    Load CSS/JS     │
      │                    │                    │                    │
      │                    │                    │                    │ 5. decorate()
      │                    │                    │                    │    Transform DOM
      │                    │                    │                    │
      │                    │                    │                    │ 6. Render HTML
```

**Flow Steps:**
1. Author configures block via XWalk-enabled AEM UI (Part 2)
2. Content saved to AEM repository
3. Page loads, `decorateBlock()` identifies block (Part 1)
4. `loadBlock()` asynchronously loads CSS and JS module (Part 1)
5. Block's `decorate()` function transforms DOM (Part 1)
6. Final HTML rendered in browser (Part 1)

### Data Flow: AEM Authoring → Block Rendering

```
AEM Content (HTML) – structure by index, no reliance on data attributes
  ↓
<div class="block-name">
  <div><div>Title</div></div>
  <div><div>Description</div></div>
</div>
  ↓
decorate(block) receives block element (Part 1)
  ↓
Extract data by index (e.g. block.children[0], block.children[1]) (Part 1)
  ↓
Transform to final HTML structure (Part 1)
  ↓
Rendered output
```

**Reference:** Index-based extraction patterns in Part 1.

---

## Development Workflow

### Complete Workflow

1. **Requirements Gathering** → Gather Figma URL, story requirements, and design specifications (Pre-Implementation)
   - Request Figma design URL
   - Request story/requirements document
   - Use Figma MCP tools to extract design specifications
   - Analyze design and map to implementation plan
2. **XWalk Configuration** → Add definitions/models/filters to root-level JSON files (Part 2)
   - Add definition to `component-definition.json`
   - Add model to `component-models.json`
   - Add filter to `component-filters.json` (if needed)
4. **JavaScript** → Implement block logic (`<block-name>.js`) (Part 1)
5. **CSS** → Style the block (`<block-name>.css`) (Part 1)
6. **Component Registration** → Verify JSON syntax and configuration (Part 2)
7. **AEM Validation** → Test in AEM authoring interface (Part 3)

---

## Implementation Checklist

### Phase 0: Pre-Implementation - Requirements Gathering (MANDATORY)
- [ ] Request and receive Figma design URL
- [ ] Request and receive story/requirements document
- [ ] Use Figma MCP tools to extract design specifications
- [ ] Analyze component structure from Figma design
- [ ] Extract design tokens (colors, typography, spacing)
- [ ] Map design elements to HTML structure
- [ ] Map design styles to CSS properties
- [ ] Identify content fields needed for XWalk configuration
- [ ] Identify similar blocks in codebase for reference
- [ ] Document breakpoint requirements
- [ ] Document accessibility requirements
- [ ] Create implementation plan based on design + requirements

### Phase 1: Backend - XWalk Configuration (MANDATORY)
**Note:** EDS projects do not use static HTML files. HTML is generated automatically by AEM from XWalk configuration.
- [ ] Use **index-based structure only** (no data attributes); match row/cell order to the block’s structure contract
- [ ] Use semantic HTML; document index contract in block JS
- [ ] Test visual appearance

### Phase 2: Backend - XWalk Configuration (MANDATORY)
- [ ] Add component definition to `component-definition.json`
  - [ ] Find the `"Blocks"` group (or create if needed)
  - [ ] Add block definition object to `components` array
  - [ ] Set `title`, `id`, `resourceType`, and `template` properties
- [ ] Add model to `component-models.json`
  - [ ] Add new object to the root array
  - [ ] Set `id` to match definition ID
  - [ ] Add `fields` array with field definitions
  - [ ] Add validation rules where needed
- [ ] Add filter to `component-filters.json` (if block has nested items)
  - [ ] Add new object to the root array
  - [ ] Set `id` to match parent block ID
  - [ ] Set `components` array with allowed child component IDs
- [ ] Validate JSON syntax (use JSON validator or ESLint)
- [ ] Ensure field order in model matches expected JavaScript index-based access pattern

### Phase 2: Frontend - JavaScript Implementation
- [ ] Create `blocks/<block-name>/<block-name>.js`
- [ ] Export default `decorate(block)` function
- [ ] Document **structure contract** (index = meaning) in JSDoc
- [ ] Import shared components as needed
- [ ] Extract data using **index-based access only** (e.g. `block.children[0]`, `row.children[1]`)
- [ ] Transform to final HTML structure
- [ ] Use `moveInstrumentation()` when replacing or moving elements
- [ ] **NEVER** use `data-aue-*` or `data-gen-*` attributes for element identification

### Phase 3: Frontend - CSS Styling
- [ ] Create `blocks/<block-name>/<block-name>.css`
- [ ] Style block structure
- [ ] Add responsive breakpoints
- [ ] Test in AEM authoring mode

### Phase 4: Integration - Component Registration
- [ ] Verify component definition appears in `component-definition.json`
  - [ ] Check JSON syntax is valid
  - [ ] Verify definition is in the correct group
- [ ] Verify model appears in `component-models.json`
  - [ ] Check model ID matches definition ID
  - [ ] Verify all fields are properly formatted
- [ ] Verify filters appear in `component-filters.json` (if applicable)
  - [ ] Check filter ID matches parent block ID
  - [ ] Verify child component IDs are correct

### Phase 5: Integration - AEM Authoring Validation
- [ ] Deploy to AEM environment
- [ ] Test block appears in component browser
- [ ] Test authoring interface opens correctly
- [ ] Test field validation works
- [ ] Test content saves and renders correctly in author mode
- [ ] Test content renders correctly in publish mode
- [ ] Verify index-based access works (no reliance on data-aue-* attributes)

### Phase 6: Frontend - Unit Testing (If Applicable)
- [ ] Create `blocks/<block-name>/<block-name>.test.js`
- [ ] Test data transformation functions
- [ ] Test validation logic
- [ ] Test edge cases

---

## Validation Workflow

### Pre-Implementation
1. **Gather Requirements** (see Pre-Implementation: Gathering Requirements section)
   - Request Figma URL and story requirements
   - Use Figma MCP tools to extract design specifications
   - Analyze design and create implementation plan
2. Review similar blocks in codebase
3. Identify reusable components/models
4. Plan block structure (Part 1)
5. Plan XWalk field requirements (Part 2)

### During Implementation
1. Verify XWalk JSON syntax (use ESLint) (Part 2)
2. Verify field order in XWalk model matches expected JavaScript access pattern (Part 2)
3. Test JavaScript in browser console (Part 1)
4. Test CSS in AEM authoring mode (Part 1)

### Post-Implementation
1. Verify JSON syntax is valid in all three configuration files (Part 2)
2. Verify component registration (Part 2)
   - Check definition in `component-definition.json`
   - Check model in `component-models.json`
   - Check filter in `component-filters.json` (if applicable)
3. Test in AEM authoring interface (Part 3)
4. Verify responsive behavior (Part 1)
5. Verify accessibility (Part 1)

---

## Common Issues and Solutions

### Frontend Issues

#### Issue 1: Block Not Loading
**Solution:**
- Verify block name matches folder name
- Check `decorate(block)` is default export
- Verify `loadBlock()` is called
- Check browser console for errors

#### Issue 4: Styles Not Applying
**Solution:**
- Verify CSS file path is correct
- Check CSS class names match
- Verify `loadBlock()` loads CSS
- Test in AEM authoring and publish modes

#### Issue 5: Authoring Attributes Lost
**Solution:**
- Use `moveInstrumentation()` when transforming or replacing elements so any authoring instrumentation is preserved on the new structure.
- Reference: `blocks/feature/feature.js` (shows pattern)

#### Issue 6: Async Operations Not Working
**Solution:**
- Make `decorate()` function `async` if loading external resources
- Use `try/catch` for error handling
- Check if resource exists before processing
- Reference: `blocks/fragment/fragment.js` (shows async pattern)

#### Issue 7: Event Listeners Causing Memory Leaks
**Solution:**
- Use event delegation when possible
- Remove event listeners if block is removed (consider cleanup)
- Debounce resize/scroll handlers
- Reference: `blocks/header/header.js` (shows event handling)

#### Issue 8: Wrong Content or Missing Elements (Index-Based)
**Solution:**
- **NEVER** use `data-aue-*` or `data-gen-*` attributes for element identification - these are only in author mode and not available in publish mode
- Use **index-based access only**: `block.children[0]`, `row.children[1]`, etc. (see Part 1: Index-Based Structure and Data Extraction)
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safe index access
- Verify XWalk config field order matches expected JavaScript index-based access pattern
- Ensure DOM structure order matches the structure contract documented in the block's JS

### Backend/Configuration Issues

#### Issue 2: XWalk Config Not Working
**Solution:**
- Verify JSON syntax is valid in all three files (`component-definition.json`, `component-models.json`, `component-filters.json`)
- Check component definition appears in `component-definition.json` in the correct group
- Verify model appears in `component-models.json` with matching ID
- Verify filter appears in `component-filters.json` (if applicable)
- Verify model ID matches definition ID
- Check that resource type is correct

#### Issue 3: Fields Not Appearing in AEM
**Solution:**
- Verify model is in `component-models.json`
- Check field component type is valid
- Verify field names match expected format
- Check AEM console for errors

---

## Considerations

### UX Considerations
- Provide clear field labels in XWalk config (Part 2)
- Use appropriate field types (text, richtext, select) (Part 2)
- Add helpful validation messages (Part 2)
- Group related fields using tabs (Part 2)

### Performance Considerations
- Blocks load asynchronously via `loadBlock()` (Part 1)
- CSS and JS loaded on demand (Part 1)
- Use lazy loading for images (Part 1)
- Minimize DOM manipulation (Part 1)
- Use `async/await` for external resource loading (Part 1)
- Debounce resize/scroll event handlers when needed (Part 1)
- Avoid blocking the main thread with heavy computations (Part 1)

### Security Considerations
- Sanitize HTML input (use `stringToHTML()`) (Part 1)
- Validate field input via XWalk validation (Part 2)
- Reference: `shared-components/Utility.js` (sanitizeHTMLString) (Part 1)

### Accessibility Considerations
- Use semantic HTML elements (Part 1)
- Provide alt text for images (Part 1)
- Maintain heading hierarchy (Part 1)
- Ensure keyboard navigation (Part 1)

---

## Key References

### Example Blocks to Study
- **Simple:** `blocks/hero/` - Basic structure
- **Complex:** `blocks/feature/` - Parent with items
- **Async:** `blocks/fragment/` - External content loading
- **Interactive:** `blocks/header/` - Event handlers

### Key Files

**Frontend:**
- `scripts/aem.js` - Block loading mechanism
- `shared-components/` - Reusable utilities
- `blocks/<block-name>/<block-name>.js` - Block JavaScript
- `blocks/<block-name>/<block-name>.css` - Block Styles

**Backend/Configuration:**
- `component-definition.json` - All component definitions (edit directly)
- `component-models.json` - All field models (edit directly)
- `component-filters.json` - All nesting rules (edit directly)
- `models/` - Reusable field definitions (reference for copying fields)

---

## Next Steps

1. **Review this guide** - Start with Part 1 for frontend, Part 2 for backend configuration
2. **Study similar blocks** - Reference examples provided in each section
3. **Use AI codebase analysis** - Cursor can analyze existing blocks for patterns
4. **Follow checklist** - Use the implementation checklist step by step
5. **Reference existing code** - Rather than creating from scratch

---

**Document Version:** EDS-2026.1.0  
**Last Updated:** 2026-01-08  
**Maintained By:** AI Documentation Engineer  
**Review Status:** Ready for Use

---

## Summary

This implementation guide provides comprehensive step-by-step instructions for creating new EDS blocks. Key points:

1. **Two files required per block:** JavaScript and CSS (in `blocks/<block-name>/`)
2. **XWalk configuration:** Add definitions/models/filters directly to root-level JSON files:
   - `component-definition.json` - Component definitions
   - `component-models.json` - Field models  
   - `component-filters.json` - Nesting rules
3. **Index-based implementation:** Use index-based selection only; no data attributes for structure or selection. Document the structure contract in block JS.
4. **Critical utility:** Always use `moveInstrumentation()` when transforming DOM
5. **Testing:** Manual testing in browser and AEM authoring interface
6. **Patterns:** Follow established patterns from existing blocks

**Important:** Do NOT create `_<block-name>.json` files in block folders. All XWalk configuration should be added directly to the root-level JSON files.

**Overall Confidence Score:** 98%
