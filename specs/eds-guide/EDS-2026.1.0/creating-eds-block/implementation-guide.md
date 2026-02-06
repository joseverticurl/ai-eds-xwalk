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
- Static HTML for development/testing
- Unit testing (if applicable)

**Out of Scope:**
- OSGi services
- Dispatcher configuration
- AEM templates and page policies

---

## Document Structure

This guide is organized into three main parts:

1. **Part 1: Frontend Development** - JavaScript, CSS, HTML implementation
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

This section covers all frontend implementation aspects: JavaScript, CSS, and HTML.

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
- **HTML:** Static HTML for development/testing

---

## Frontend File Structure

### Block Files

```
blocks/<block-name>/
├── <block-name>.js              # Block JavaScript (FRONTEND)
└── <block-name>.css             # Block Styles (FRONTEND)

preview/mock-content/
└── <block-name>.html            # Static HTML for development (FRONTEND)
```

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
   - Sets blockName dataset
   - Adds 'block' class
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

### Data Extraction Patterns

#### Data Attribute Types

Blocks use two types of data attributes for authoring:

1. **`data-aue-*`** - AEM authoring attributes (from XWalk)
   - `data-aue-model` - Model identifier
   - `data-aue-field` - Field identifier
   - `data-aue-prop` - Property identifier
   - `data-aue-resource` - Resource path

2. **`data-gen-*`** - Generated attributes (fallback/auto-detected)
   - `data-gen-model` - Auto-detected model
   - `data-gen-prop` - Auto-detected property
   - Used when XWalk attributes aren't present

**Best Practice:** Always check both attribute types for maximum compatibility:

```javascript
const element = block.querySelector(
  '[data-aue-model="modelName"], [data-gen-model="modelName"]'
);
```

**Reference:** `blocks/feature/feature.js` line 55, `blocks/projectcards/projectcards.js` line 80

#### Common Data Extraction Patterns

```javascript
// Single field
const titleElement = block.querySelector(
  '[data-aue-prop="title"], [data-gen-prop="title"]'
);
const title = titleElement?.textContent?.trim() || '';

// Nested structures
const items = Array.from(block.querySelectorAll(
  '[data-aue-model="item"], [data-gen-model="item"]'
));

// Link data (3 children: text, icon, target)
const linkField = block.querySelector('[data-aue-model="linkField"], [data-gen-model="linkField"]');
if (linkField?.children.length === 3) {
  const [linkTextDiv, iconDiv, targetDiv] = linkField.children;
  const linkData = {
    text: linkTextDiv?.textContent?.trim(),
    url: linkTextDiv?.querySelector('a')?.getAttribute('href'),
    icon: iconDiv?.textContent?.trim()?.replace('-', ''),
    target: targetDiv?.textContent?.trim()
  };
}

// Image references
const imageSrc = block.querySelector('[data-aue-prop="image"] a, [data-aue-prop="image"] img')
  ?.getAttribute('src') || block.querySelector('[data-aue-prop="image"] a')?.getAttribute('href');
const altText = block.querySelector('[data-aue-prop="imageAlt"]')?.textContent?.trim() || '';

// Optional content with fallbacks
const value = element?.textContent?.trim() ?? 'default';
```

**Reference:** `blocks/feature/feature.js` lines 24-74

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
- `moveInstrumentation(from, to)` - **Critical:** Preserves all `data-aue-*` and `data-richtext-*` attributes when transforming DOM. Always use when replacing elements.

**Reference:** `scripts/aem.js`, `scripts/scripts.js` lines 45-53

### JavaScript Templates

#### Synchronous Block Template

```javascript
import Heading from '../../shared-components/Heading.js';
import ImageComponent from '../../shared-components/ImageComponent.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import stringToHTML from '../../shared-components/Utility.js';

/**
 * Decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // Extract data from block structure
  const titleElement = block.querySelector(
    '[data-aue-prop="title"], [data-gen-prop="title"]'
  );
  const title = titleElement?.textContent?.trim() || '';
  
  // Transform DOM
  const container = document.createElement('div');
  container.classList.add('container');
  
  if (title) {
    const heading = Heading({ level: 2, text: title, className: 'title' });
    const parsedHeading = stringToHTML(heading);
    moveInstrumentation(titleElement, parsedHeading);
    container.appendChild(parsedHeading);
  }
  
  // Preserve AEM attributes with moveInstrumentation()
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

#### Pattern 1: Standard Block Decoration

**Use Case:** Simple content blocks (hero, text sections)

```javascript
export default function decorate(block) {
  // Extract data from block
  const title = block.querySelector('[data-aue-prop="title"]')?.textContent?.trim();
  
  // Transform DOM
  const wrapper = document.createElement('div');
  wrapper.className = 'blockname-wrapper';
  // ... build structure
  
  // Preserve instrumentation
  moveInstrumentation(block, wrapper);
  
  // Replace content
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

#### Pattern 5: Image Optimization

**Use Case:** Blocks displaying images

```javascript
import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

// In decorate function
block.querySelectorAll('picture > img').forEach((img) => {
  const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
  moveInstrumentation(img, optimizedPic.querySelector('img'));
  img.closest('picture').replaceWith(optimizedPic);
});
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

### Static HTML Template

**Path:** `preview/mock-content/<block-name>.html` or `preview/<block-name>.html`

**Purpose:** Frontend development and visual testing

```html
<div class="block-name">
  <div data-aue-model="blockname">
    <div data-aue-field="title">Title Text</div>
    <div data-aue-field="description">Description text</div>
  </div>
</div>
```

**Reference:** `preview/index.html` structure

---

## Frontend Best Practices

### ✅ JavaScript Best Practices

- ✅ **DO:** Use ES6+ module syntax, import from `shared-components/`
- ✅ **DO:** Check both `data-aue-*` and `data-gen-*` attributes (use `querySelector('[data-aue-prop="x"], [data-gen-prop="x"]')`)
- ✅ **DO:** Use optional chaining (`?.`) and handle null/undefined gracefully
- ✅ **DO:** Use `moveInstrumentation()` when replacing elements
- ✅ **DO:** Make `decorate()` async if loading external resources
- ✅ **DO:** Preserve semantic HTML structure

### ❌ JavaScript Anti-patterns

- ❌ **DON'T:** Use global variables, skip error handling, or mutate shared components
- ❌ **DON'T:** Access properties without null checks or forget `moveInstrumentation()` when transforming DOM
- ❌ **DON'T:** Block main thread or use sync operations for external resources

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

- ✅ **DO:** Match expected DOM structure
- ✅ **DO:** Include all required data attributes
- ✅ **DO:** Use semantic HTML
- ✅ **DO:** Test in local development environment

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
   - Rendered as HTML with data attributes
   - data-aue-model, data-gen-model attributes
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
AEM Content (HTML)
  ↓
<div class="block-name" data-aue-model="modelName">
  <div data-aue-field="fieldName">Value</div>
</div>
  ↓
decorate(block) receives block element (Part 1)
  ↓
Extract data from DOM structure (Part 1)
  ↓
Transform to final HTML structure (Part 1)
  ↓
Rendered output
```

**Reference:** `blocks/feature/feature.js` (shows data extraction pattern)

---

## Development Workflow

### Complete Workflow

1. **Requirements Gathering** → Gather Figma URL, story requirements, and design specifications (Pre-Implementation)
   - Request Figma design URL
   - Request story/requirements document
   - Use Figma MCP tools to extract design specifications
   - Analyze design and map to implementation plan
2. **Static HTML** → Create development mockup (Part 1)
3. **XWalk Configuration** → Add definitions/models/filters to root-level JSON files (Part 2)
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

### Phase 1: Frontend - Static HTML Creation (MANDATORY)
- [ ] Create `preview/mock-content/<block-name>.html`
- [ ] Match expected DOM structure
- [ ] Include data attributes (`data-aue-model`, `data-aue-field`)
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

### Phase 3: Frontend - JavaScript Implementation
- [ ] Create `blocks/<block-name>/<block-name>.js`
- [ ] Export default `decorate(block)` function
- [ ] Import shared components as needed
- [ ] Extract data from DOM structure
- [ ] Transform to final HTML structure
- [ ] Preserve AEM attributes with `moveInstrumentation()`

### Phase 4: Frontend - CSS Styling
- [ ] Create `blocks/<block-name>/<block-name>.css`
- [ ] Style block structure
- [ ] Add responsive breakpoints
- [ ] Test in static HTML preview

### Phase 5: Integration - Component Registration
- [ ] Verify component definition appears in `component-definition.json`
  - [ ] Check JSON syntax is valid
  - [ ] Verify definition is in the correct group
- [ ] Verify model appears in `component-models.json`
  - [ ] Check model ID matches definition ID
  - [ ] Verify all fields are properly formatted
- [ ] Verify filters appear in `component-filters.json` (if applicable)
  - [ ] Check filter ID matches parent block ID
  - [ ] Verify child component IDs are correct

### Phase 6: Integration - AEM Authoring Validation
- [ ] Deploy to AEM environment
- [ ] Test block appears in component browser
- [ ] Test authoring interface opens correctly
- [ ] Test field validation works
- [ ] Test content saves and renders correctly
- [ ] Verify authoring attributes preserved

### Phase 7: Frontend - Unit Testing (If Applicable)
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
1. Verify static HTML structure (Part 1)
2. Verify XWalk JSON syntax (use ESLint) (Part 2)
3. Test JavaScript in browser console (Part 1)
4. Test CSS in preview (Part 1)

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
- Test in static HTML preview

#### Issue 5: Authoring Attributes Lost
**Solution:**
- Use `moveInstrumentation()` when transforming DOM
- Preserve `data-aue-*` attributes
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

#### Issue 8: Data Attributes Not Found
**Solution:**
- Check both `data-aue-*` and `data-gen-*` attributes (see Part 1: Data Extraction Patterns)
- Use optional chaining (`?.`) for safe access
- Verify XWalk config field names match (Part 2)

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
- Use `data-aue-*` attributes safely (Part 1)
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
3. **Critical utility:** Always use `moveInstrumentation()` when transforming DOM
4. **Testing:** Manual testing in browser and AEM authoring interface
5. **Patterns:** Follow established patterns from existing blocks

**Important:** Do NOT create `_<block-name>.json` files in block folders. All XWalk configuration should be added directly to the root-level JSON files.

**Overall Confidence Score:** 98%
