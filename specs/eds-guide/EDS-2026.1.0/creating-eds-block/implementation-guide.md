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

All block HTML and JavaScript must use **index-based implementation**: elements are identified by their **position (index)** in the DOM (e.g. `block.children[0]`, `row.children[1]`). Do **not** use `data-*` attributes for structure or for selecting content. Document the structure contract (which index means which content) in the block's code.

---

## Understanding the Structure Contract: How CSS/JS Work Without Static HTML

### The Core Question: How Can You Write CSS/JS Without Knowing HTML Structure?

Since EDS blocks have **no static HTML** (HTML is generated at runtime by AEM), you might wonder: *How can you write CSS and JavaScript without knowing the actual HTML structure?*

**Answer:** The structure is determined by the **XWalk model field order**, and CSS targets the **transformed structure** created by JavaScript, not the initial AEM-generated HTML.

### How XWalk Model Determines HTML Structure

**Critical:** The order of fields in your `component-models.json` directly determines the HTML structure that AEM generates at runtime.

**Mapping Rule:**
- Each field in the model → One row (`<div>`) in generated HTML
- Field order in model → Row order in HTML (index 0, 1, 2...)
- Field values → Cells within that row

**Example:**

```json
// component-models.json
{
  "id": "hero",
  "fields": [
    {
      "component": "reference",
      "name": "image"
    },      // → block.children[0] (first row)
    {
      "component": "text",
      "name": "imageAlt"
    },     // → block.children[0].children[1] (first row, second cell)
    {
      "component": "richtext",
      "name": "text"
    }      // → block.children[1] (second row)
  ]
}
```

**Generated HTML (at runtime by AEM):**

```html
<div class="hero">
  <div>                    <!-- block.children[0] = image row -->
    <div>image-url</div>   <!-- cell 0 = image value -->
    <div>alt-text</div>    <!-- cell 1 = imageAlt value -->
  </div>
  <div>                    <!-- block.children[1] = text row -->
    <div>Rich text...</div> <!-- cell 0 = text value -->
  </div>
</div>
```

**Key Point:** The field order in your XWalk model **is** the structure contract. You know the structure because you define it in the model.

### CSS and JavaScript Development Strategy

#### JavaScript (`decorate()` function) Workflow:

1. **Receives** the AEM-generated HTML structure (based on XWalk model field order)
2. **Extracts** data using index-based access (knowing the field order from the model)
3. **Transforms** to the final desired structure
4. **Adds CSS classes** to the transformed elements for styling

**Example:**

```javascript
export default function decorate(block) {
  // Structure contract: field[0] = image, field[1] = text
  const imageRow = block.children[0];        // First field = image
  const textRow = block.children[1];         // Second field = text
  
  const imageSrc = imageRow?.children?.[0]?.textContent?.trim();
  const text = textRow?.children?.[0]?.textContent?.trim();
  
  // Transform to final structure
  const container = document.createElement('div');
  container.classList.add('hero-container');  // CSS class for styling
  
  if (imageSrc) {
    const img = document.createElement('img');
    img.src = imageSrc;
    img.classList.add('hero-image');  // CSS class for styling
    container.appendChild(img);
  }
  
  if (text) {
    const textDiv = document.createElement('div');
    textDiv.classList.add('hero-text');  // CSS class for styling
    textDiv.textContent = text;
    container.appendChild(textDiv);
  }
  
  block.innerHTML = '';
  block.appendChild(container);
}
```

#### CSS Development Strategy:

**Critical:** CSS should style the **final transformed structure** (after `decorate()` runs), **not** the initial AEM-generated HTML.

**Why:** The initial AEM HTML is just raw data in a predictable structure. JavaScript transforms it into the final presentation structure, and that's what CSS should target.

**Example:**

```css
/* ✅ CORRECT: Style the transformed structure */
.hero-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hero-image {
  width: 100%;
  height: auto;
}

.hero-text {
  font-size: 1.2rem;
  line-height: 1.6;
}

/* ❌ WRONG: Don't style the initial AEM structure */
/* .hero > div > div { ... } */
```

### Complete Development Workflow

```
1. Plan Structure Contract
   ↓
   Define field order in XWalk model
   Document: "field[0] = image, field[1] = text"
   ↓
2. AEM Generates HTML (Runtime)
   ↓
   HTML structure matches field order
   block.children[0] = first field
   block.children[1] = second field
   ↓
3. JavaScript Transforms
   ↓
   decorate(block) receives AEM HTML
   Extracts data by index (knowing field order)
   Transforms to final structure
   Adds CSS classes
   ↓
4. CSS Styles Final Structure
   ↓
   Targets transformed elements
   Uses classes added by JavaScript
   Styles the final DOM, not initial HTML
```

### Development Process Checklist

1. **Define XWalk Model:**
   - [ ] Plan field order (this becomes your structure contract)
   - [ ] Document which field = which index
   - [ ] Add model to `component-models.json`

2. **Write JavaScript:**
   - [ ] Document structure contract in JSDoc
   - [ ] Access elements by index based on field order
   - [ ] Transform to final structure
   - [ ] Add CSS classes to transformed elements

3. **Write CSS:**
   - [ ] Target the transformed structure (after `decorate()` runs)
   - [ ] Use classes added by JavaScript
   - [ ] Do NOT style the initial AEM-generated HTML structure

### Key Takeaways

- ✅ **You DO know the structure** - it's defined by your XWalk model field order
- ✅ **JavaScript transforms** the AEM HTML to the final structure
- ✅ **CSS targets** the transformed structure, not the initial HTML
- ✅ **Field order = Structure contract** - document it clearly
- ❌ **Don't style** the initial AEM-generated HTML directly
- ❌ **Don't rely** on data attributes for structure (use index-based access)

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

### Critical: Parent-Child Blocks Use ONE Folder

**IMPORTANT:** Even when a block has a parent-child relationship in XWalk configuration (e.g., `cards` → `card`, `relatedarticles` → `relatedarticle`), the frontend implementation uses **ONE folder with ONE JavaScript file and ONE CSS file**.

**Pattern:**
- **XWalk Config (Backend):** Parent block definition + Child block definition (two separate definitions in JSON)
- **Frontend Files:** ONE folder `blocks/<parent-name>/` with ONE `decorate()` function that handles both parent and child items

**Example:**
- `blocks/cards/` - ONE folder
  - `cards.js` - Handles parent container AND all child card items in one `decorate()` function
  - `cards.css` - Styles for parent container AND all child card items
- `blocks/relatedarticles/` - ONE folder
  - `relatedarticles.js` - Handles section title (parent) AND all article items (children) in one `decorate()` function
  - `relatedarticles.css` - Styles for section title AND all article items

**Why:** The parent block's `decorate()` function receives all child items as `block.children`, so it processes everything in one place. There is no separate child block folder or files.

**Reference:** `blocks/cards/cards.js`, `blocks/relatedarticles/relatedarticles.js`

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
   - Calls wrapTextNodes() - Wraps text content in <p> tags
   ↓
4. loadBlock() - Async loading
   - Loads CSS: <block-name>.css
   - Imports JS: <block-name>.js
   - Calls default export: decorate(block)
   ↓
5. Block Status: 'loaded'
```

**Critical:** `wrapTextNodes()` runs BEFORE `decorate()` and wraps text content in `<p>` tags. Your extraction logic must account for this:
- Links may be wrapped: `<div><p><a href="...">`
- Text may be wrapped: `<div><p>Text content</p></div>`
- Always check for both direct children and wrapped elements when extracting

**Reference:** `scripts/aem.js` lines 777-826, `scripts/aem.js` lines 378-425 (wrapTextNodes function)

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

**Best practice:** Use optional chaining (`?.`) and nullish coalescing (`??`) for index-based access. Document the index contract at the top of the block's `decorate()` function.

#### Robust Data Extraction with Fallbacks

**Critical:** After `decorateBlock()` runs, `wrapTextNodes()` wraps text content in `<p>` tags. Always account for wrapped elements when extracting data.

**Link Extraction with Fallbacks:**
```javascript
// ✅ CORRECT: Handle wrapped links and use .href as fallback
const linkCell = row?.children?.[0];
// Check for link in direct children OR wrapped in <p>
const linkElement = linkCell?.querySelector?.('a') || linkCell?.querySelector?.('p a');
// Use .href as fallback (resolves relative URLs)
const linkUrl = linkElement?.getAttribute?.('href') || linkElement?.href || '';
```

**Text Extraction with Fallbacks:**
```javascript
// ✅ CORRECT: Extract text from cell or wrapped <p> tag
const textCell = row?.children?.[0];
// Try direct textContent first, then check for wrapped <p>
let text = textCell?.textContent?.trim() || '';
if (!text) {
  text = textCell?.querySelector?.('p')?.textContent?.trim() || '';
}
```

**CTA Extraction Pattern (with Multiple Fallbacks):**
```javascript
// CTA row: link cell, text cell, target cell
const ctaRow = rows[3];
const ctaLinkCell = ctaRow?.children?.[0];
const ctaTextCell = ctaRow?.children?.[1];
const ctaTargetCell = ctaRow?.children?.[2];

// Extract link - handle wrapped elements and use .href fallback
const ctaLinkElement = ctaLinkCell?.querySelector?.('a') || ctaLinkCell?.querySelector?.('p a');
const ctaLink = ctaLinkElement?.getAttribute?.('href') || ctaLinkElement?.href || '';

// Extract text - try text cell first, then fallback to link text (if not a URL)
let ctaText = ctaTextCell?.textContent?.trim() || 
              ctaTextCell?.querySelector?.('p')?.textContent?.trim() || '';
if (!ctaText && ctaLinkElement) {
  const linkText = ctaLinkElement.textContent?.trim() || '';
  // Only use link text if it's not a URL (avoid using "/path/to/page" as button text)
  ctaText = (linkText.startsWith('/') || linkText.includes('http')) ? '' : linkText;
}

const ctaTarget = ctaTargetCell?.textContent?.trim() || '_self';

// Render button if link exists (text is optional with fallbacks)
if (ctaLink) {
  const button = document.createElement('a');
  button.href = ctaLink;
  button.textContent = ctaText || 'Learn more';  // Final fallback
  button.target = ctaTarget;
  // ...
}
```

**Why Fallbacks Matter:**
- `wrapTextNodes()` wraps content in `<p>` tags before `decorate()` runs
- `getAttribute('href')` may return empty string; `.href` resolves relative URLs
- Text cells may be empty; link text can serve as fallback (but filter out URLs)
- Always render if link exists; text can have multiple fallback levels

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

**Important:** Even though XWalk has parent-child definitions, the frontend uses ONE folder with ONE JS file. The `decorate()` function processes both parent and child items.

```javascript
/**
 * Cards Block
 * 
 * Structure contract (index-based):
 * - block.children[0+] = Card item rows (each row = one card item)
 * 
 * For each card item row:
 * - row.children[0] = Image cell
 * - row.children[1] = Text cell
 * 
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);  // CRITICAL
    // ... transform row content (child item)
    ul.append(li);
  });
  block.replaceChildren(ul);
}
```

**Example with Parent Title + Child Items:**

```javascript
/**
 * Related Articles Block
 * 
 * Structure contract (index-based):
 * - block.children[0] = Section title row (parent)
 * - block.children[1+] = Article item rows (children)
 * 
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  
  // Process parent: section title (first row)
  const titleRow = rows[0];
  const title = titleRow?.children?.[0]?.textContent?.trim() || '';
  
  // Process children: article items (remaining rows)
  const articleRows = rows.slice(1);
  
  // Build container with title
  const container = document.createElement('div');
  if (title) {
    const heading = document.createElement('h2');
    heading.textContent = title;
    container.appendChild(heading);
  }
  
  // Process all child items
  const articlesWrapper = document.createElement('div');
  articleRows.forEach((row) => {
    // Transform each child item row
    const card = document.createElement('a');
    // ... extract data and build card structure
    articlesWrapper.appendChild(card);
  });
  
  container.appendChild(articlesWrapper);
  block.replaceChildren(container);
}
```

**Key Points:**
- ONE folder: `blocks/<parent-name>/`
- ONE JS file: `<parent-name>.js` with ONE `decorate()` function
- ONE CSS file: `<parent-name>.css` with styles for parent and children
- Parent and child items are processed in the same `decorate()` function
- Child items are accessed via `block.children[1+]` (after parent row at index 0)

**Reference:** 
- `specs/eds-guide/EDS-2026.1.0/creating-eds-block/tech-design.md` - Pattern 2
- `blocks/cards/cards.js` - Simple parent-child pattern
- `blocks/relatedarticles/relatedarticles.js` - Parent title + child items pattern

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
const imageCell = imageRow?.children?.[0];
const altCell = imageRow?.children?.[1];
const altText = altCell?.textContent?.trim() || '';

// Extract image source - handle wrapped elements
const pictureOrImg = imageCell?.querySelector?.('picture, img');
if (pictureOrImg) {
  const img = pictureOrImg.tagName === 'IMG' ? pictureOrImg : pictureOrImg.querySelector('img');
  if (img) {
    const optimizedPic = createOptimizedPicture(
      img.src, 
      altText, 
      false, 
      [{ width: '750' }, { width: '1440' }]
    );
    moveInstrumentation(pictureOrImg, optimizedPic);
    pictureOrImg.replaceWith(optimizedPic);
  }
}
```

**Reference:** `specs/eds-guide/EDS-2026.1.0/creating-eds-block/tech-design.md` - Pattern 5

#### Pattern 6: CTA Button with Robust Extraction

**Use Case:** Blocks with Call-to-Action buttons requiring link, text, and target fields.

```javascript
// CTA row: link cell (index 0), text cell (index 1), target cell (index 2)
const ctaRow = rows[3];
const ctaLinkCell = ctaRow?.children?.[0];
const ctaTextCell = ctaRow?.children?.[1];
const ctaTargetCell = ctaRow?.children?.[2];

// Extract link - handle wrapped elements and use .href fallback
const ctaLinkElement = ctaLinkCell?.querySelector?.('a') || ctaLinkCell?.querySelector?.('p a');
const ctaLink = ctaLinkElement?.getAttribute?.('href') || ctaLinkElement?.href || '';

// Extract text with multiple fallbacks
let ctaText = ctaTextCell?.textContent?.trim() || 
              ctaTextCell?.querySelector?.('p')?.textContent?.trim() || '';
if (!ctaText && ctaLinkElement) {
  const linkText = ctaLinkElement.textContent?.trim() || '';
  // Only use link text if it's not a URL
  ctaText = (linkText.startsWith('/') || linkText.includes('http')) ? '' : linkText;
}

const ctaTarget = ctaTargetCell?.textContent?.trim() || '_self';

// Render button if link exists (text has fallbacks)
if (ctaLink) {
  const ctaButton = document.createElement('a');
  ctaButton.href = ctaLink;
  ctaButton.textContent = ctaText || 'Learn more';  // Final fallback
  ctaButton.target = ctaTarget;
  if (ctaTarget === '_blank') {
    ctaButton.rel = 'noopener noreferrer';
  }
  if (ctaLinkCell) {
    moveInstrumentation(ctaLinkCell, ctaButton);
  }
  // Append to container...
}
```

**Key Points:**
- Always use `.href` as fallback for `getAttribute('href')` (resolves relative URLs)
- Check for wrapped `<p>` tags when extracting text
- Use link text as fallback only if it's not a URL
- Render button if link exists; text is optional with fallbacks
- Always use `moveInstrumentation()` when replacing elements

**Reference:** `specs/eds-guide/EDS-2026.1.0/creating-eds-block/tech-design.md` - Pattern 6

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

#### ❌ Anti-Pattern 6: Incomplete Link Extraction

```javascript
// ❌ WRONG - May fail if link is wrapped or getAttribute returns empty
const link = linkCell?.querySelector?.('a')?.getAttribute?.('href') || '';
if (link && text) {  // Too strict - requires both
  // render button
}

// ✅ CORRECT - Handle wrapped elements and use .href fallback
const linkElement = linkCell?.querySelector?.('a') || linkCell?.querySelector?.('p a');
const link = linkElement?.getAttribute?.('href') || linkElement?.href || '';
if (link) {  // Only require link, text has fallbacks
  // render button with fallback text
}
```

**Impact:** Buttons may not render if extraction fails or text is missing  
**Reference:** See "Robust Data Extraction with Fallbacks" section above

#### ❌ Anti-Pattern 7: Ignoring wrapTextNodes() Wrapping

```javascript
// ❌ WRONG - Assumes text is directly in cell
const text = textCell?.textContent?.trim() || '';

// ✅ CORRECT - Check for wrapped <p> tag
let text = textCell?.textContent?.trim() || '';
if (!text) {
  text = textCell?.querySelector?.('p')?.textContent?.trim() || '';
}
```

**Impact:** Text extraction may fail if content is wrapped in `<p>` tags by `wrapTextNodes()`  
**Reference:** See "Robust Data Extraction with Fallbacks" section above

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

### Critical: CSS Targets Transformed Structure

**Important:** CSS should style the **final transformed structure** created by JavaScript's `decorate()` function, **not** the initial AEM-generated HTML.

**Why:**
- Initial AEM HTML is raw data in a predictable structure (based on XWalk model field order)
- JavaScript transforms this to the final presentation structure
- CSS should target the transformed elements with classes added by JavaScript

**Workflow:**
```
AEM generates HTML (from XWalk model)
  ↓
JavaScript decorate() transforms structure
  ↓
CSS styles the transformed structure
```

**Example:**

```javascript
// JavaScript: Transform and add CSS classes
export default function decorate(block) {
  const container = document.createElement('div');
  container.classList.add('hero-container');  // ← CSS class for styling
  
  const image = document.createElement('img');
  image.classList.add('hero-image');  // ← CSS class for styling
  container.appendChild(image);
  
  block.replaceChildren(container);
}
```

```css
/* ✅ CORRECT: Style the transformed structure */
.hero-container {
  display: flex;
  flex-direction: column;
}

.hero-image {
  width: 100%;
  height: auto;
}

/* ❌ WRONG: Don't style initial AEM structure directly */
/* .hero > div > div { ... } */
```

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

### Image Sizing and Aspect Ratios

**When design specifies exact image dimensions or aspect ratios, use CSS `aspect-ratio` property:**

```css
/* ✅ CORRECT: Maintain aspect ratio from design specs */
.image-wrapper {
  aspect-ratio: 670 / 746;  /* From Figma design */
  width: 670px;
  max-width: 48%;
}

.image-wrapper img,
.image-wrapper picture {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 24px;
}

/* ❌ WRONG: Using height: auto doesn't enforce aspect ratio */
.image-wrapper {
  width: 670px;
}
.image-wrapper img {
  width: 100%;
  height: auto;  /* May not match design aspect ratio */
}
```

**Key Points:**
- Use `aspect-ratio` CSS property when design specifies exact ratios (e.g., 670/746)
- Set both `width` and `height: 100%` on image when using aspect-ratio on wrapper
- Use `object-fit: cover` to maintain aspect ratio while filling container
- Always verify image dimensions match Figma design specifications

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

- ✅ **DO:** Style the **transformed structure** (after JavaScript `decorate()` runs)
- ✅ **DO:** Use classes added by JavaScript during transformation
- ✅ **DO:** Use block-specific class names
- ✅ **DO:** Follow responsive design patterns
- ✅ **DO:** Use CSS variables for theming
- ✅ **DO:** Keep styles scoped to block

### ❌ CSS Anti-patterns

- ❌ **DON'T:** Style the initial AEM-generated HTML structure directly
- ❌ **DON'T:** Rely on the raw AEM HTML structure (it's just data, not presentation)
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

**Critical: Field Order Determines HTML Structure**

**Important:** The order of fields in the `fields` array directly determines the HTML structure that AEM generates at runtime. This order becomes your **structure contract** for JavaScript index-based access.

- Field at index 0 → `block.children[0]` in generated HTML
- Field at index 1 → `block.children[1]` in generated HTML
- And so on...

**Plan your field order carefully** - it must match the index-based access pattern in your JavaScript `decorate()` function. Document this structure contract in your JavaScript code.

**Reference:** See "Understanding the Structure Contract" section in Part 1 for detailed explanation.

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
- [ ] Create `blocks/<block-name>/<block-name>.js` (ONE folder, ONE file, even for parent-child blocks)
- [ ] Export default `decorate(block)` function
- [ ] Document **structure contract** (index = meaning) in JSDoc
- [ ] Import shared components as needed
- [ ] Extract data using **index-based access only** (e.g. `block.children[0]`, `row.children[1]`)
- [ ] **For parent-child blocks:** Process parent row (index 0) and child item rows (index 1+) in the same `decorate()` function
- [ ] Transform to final HTML structure
- [ ] Use `moveInstrumentation()` when replacing or moving elements
- [ ] **NEVER** use `data-aue-*` or `data-gen-*` attributes for element identification
- [ ] **NEVER** create separate child block folders or files (parent-child blocks use ONE folder)

### Phase 3: Frontend - CSS Styling
- [ ] Create `blocks/<block-name>/<block-name>.css` (ONE file, even for parent-child blocks)
- [ ] Style block structure (parent container and child items in same file)
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

#### Issue 9: Button Not Rendering
**Solution:**
- Check if link extraction handles wrapped elements: `linkCell?.querySelector?.('a') || linkCell?.querySelector?.('p a')`
- Use `.href` as fallback: `linkElement?.getAttribute?.('href') || linkElement?.href || ''`
- Don't require both link AND text - render button if link exists, use fallback text
- Check if text extraction handles wrapped `<p>` tags from `wrapTextNodes()`
- Verify text cell is not empty or extract from link text (but filter out URLs)
- Reference: See "Pattern 6: CTA Button with Robust Extraction" above

#### Issue 10: Image Size Not Matching Design
**Solution:**
- Use CSS `aspect-ratio` property when design specifies exact ratios
- Set `aspect-ratio` on image wrapper, not just width
- Use `object-fit: cover` to maintain aspect ratio while filling container
- Verify dimensions match Figma design specifications
- Reference: See "Image Sizing and Aspect Ratios" section above

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
**Last Updated:** 2026-02-13  
**Maintained By:** AI Documentation Engineer  
**Review Status:** Ready for Use

---

## Summary

This implementation guide provides comprehensive step-by-step instructions for creating new EDS blocks. Key points:

1. **Two files required per block:** JavaScript and CSS (in `blocks/<block-name>/`)
   - **CRITICAL:** Even for parent-child blocks, use ONE folder with ONE JS file and ONE CSS file
   - Parent and child items are processed in the same `decorate()` function
   - Example: `blocks/cards/` handles both parent container and all child card items
2. **XWalk configuration:** Add definitions/models/filters directly to root-level JSON files:
   - `component-definition.json` - Component definitions (parent + child definitions)
   - `component-models.json` - Field models (parent + child models)
   - `component-filters.json` - Nesting rules
3. **Index-based implementation:** Use index-based selection only; no data attributes for structure or selection. Document the structure contract in block JS.
4. **Critical utility:** Always use `moveInstrumentation()` when transforming DOM
5. **Testing:** Manual testing in browser and AEM authoring interface
6. **Patterns:** Follow established patterns from existing blocks

**Important:** 
- Do NOT create `_<block-name>.json` files in block folders. All XWalk configuration should be added directly to the root-level JSON files.
- Do NOT create separate child block folders or files. Parent-child blocks use ONE folder with ONE JS/CSS file that processes everything.

**Overall Confidence Score:** 98%
