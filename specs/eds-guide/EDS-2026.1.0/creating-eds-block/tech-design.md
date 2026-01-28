# Technical Design Document: Creating a New EDS Block

**Functionality:** Creating a New EDS Block with XWalk Authoring Integration  
**Date:** 2026-01-08  
**Version:** EDS-2026.1.0  
**Confidence:** 98% (based on analysis of 6+ existing blocks in codebase)

---

## Executive Summary

This document provides the technical design for creating a new EDS (Edge Delivery Services) block following the established patterns in the codebase. The block creation process includes frontend implementation (JavaScript and CSS), XWalk configuration for AEM authoring integration, and adherence to block loading lifecycle patterns.

**Key Highlights:**
- Block-based component architecture with self-contained modules
- XWalk integration for WYSIWYG authoring in AEM Cloud Service
- Dynamic block loading with lifecycle management (initialized → loading → loaded)
- Instrumentation attribute preservation for AEM authoring compatibility
- Support for simple blocks, complex blocks with nested items, and container blocks

**Confidence Score:** 98% - Based on analysis of 6+ block examples across the codebase.

---

## High-Level Technology Stack Overview

Refer to [Overall Architecture Document - Technology Stack Section](../overall-architecture.md#technology-stack) for detailed technology stack information.

**Key Technologies:**
- **Frontend:** JavaScript (ES6+ modules), CSS3 (no preprocessor)
- **Build Tools:** npm, merge-json-cli for XWalk config generation
- **AEM Integration:** XWalk plugin, AEM Edge Delivery Services
- **Development:** AEM CLI (Helix CLI) for local development

**Confidence Score:** 100%

---

## Folder Structure in Context of Block Creation

### Block Directory Structure

```
blocks/<block-name>/
├── <block-name>.js              # Block JavaScript module (REQUIRED)
├── <block-name>.css             # Block styles (REQUIRED)
└── _<block-name>.json           # XWalk configuration (REQUIRED for AEM authoring)
```

**Naming Convention:**
- Block name: kebab-case (e.g., `hero`, `feature-cards`, `testimonial-block`)
- Files: Match block name exactly
- JSON config: Prefixed with underscore `_`

**Source Reference:** ```1:6:blocks/hero/```, ```1:6:blocks/cards/```, ```1:6:blocks/fragment/```

**Confidence Score:** 100%

### Integration with Project Structure

```
ai-eds-xwalk/
├── blocks/<block-name>/          # New block directory
│   ├── <block-name>.js
│   ├── <block-name>.css
│   └── _<block-name>.json
├── models/                        # Optional: Reusable model definitions
│   └── _<model-name>.json
├── component-definition.json      # Auto-generated (after npm run build:json)
├── component-models.json         # Auto-generated (after npm run build:json)
└── component-filters.json        # Auto-generated (after npm run build:json)
```

**Confidence Score:** 100%

---

## End-to-End Sequence Diagram

The following sequence diagram illustrates the complete flow from page load to block rendering, based on actual codebase implementation:

```mermaid
sequenceDiagram
    participant Browser
    participant scripts.js as scripts/scripts.js
    participant aem.js as scripts/aem.js
    participant BlockJS as blocks/<block-name>/<block-name>.js
    participant BlockCSS as blocks/<block-name>/<block-name>.css
    participant AEM as AEM Cloud Service

    Browser->>scripts.js: Page Load
    scripts.js->>scripts.js: loadEager() - LCP optimization
    scripts.js->>aem.js: decorateSections(main)
    aem.js->>aem.js: Identify <div.section> elements
    aem.js->>aem.js: Set data-section-status="initialized"
    scripts.js->>aem.js: decorateBlocks(main)
    aem.js->>aem.js: decorateBlock(block)
    aem.js->>aem.js: Set data-block-status="initialized"
    aem.js->>aem.js: Set data-block-name="<block-name>"
    aem.js->>aem.js: Add 'block' class
    scripts.js->>aem.js: loadSection(firstSection)
    aem.js->>aem.js: loadBlock(block)
    aem.js->>aem.js: Set data-block-status="loading"
    par Load CSS and JS in parallel
        aem.js->>BlockCSS: loadCSS(/blocks/<block-name>/<block-name>.css)
        BlockCSS-->>aem.js: CSS loaded
    and
        aem.js->>BlockJS: import(/blocks/<block-name>/<block-name>.js)
        BlockJS-->>aem.js: Module loaded
    end
    aem.js->>BlockJS: Execute decorate(block)
    BlockJS->>BlockJS: Extract data from block
    BlockJS->>BlockJS: Transform DOM structure
    BlockJS->>BlockJS: Apply classes/styles
    BlockJS->>BlockJS: Preserve data-aue-* attributes (moveInstrumentation)
    BlockJS-->>aem.js: Decoration complete
    aem.js->>aem.js: Set data-block-status="loaded"
    aem.js-->>scripts.js: Block loaded
    scripts.js->>scripts.js: loadLazy() - Load remaining sections
    Note over Browser,AEM: AEM Authoring Flow (XWalk)
    AEM->>AEM: Author opens page editor
    AEM->>AEM: XWalk reads component-definition.json
    AEM->>AEM: Loads component-models.json for field definitions
    AEM->>AEM: Loads component-filters.json for nesting rules
    AEM->>AEM: Generates authoring UI
    AEM->>AEM: Author configures block fields
    AEM->>AEM: Saves content with data-aue-* attributes
    AEM->>Browser: HTML with instrumentation attributes
```

**Source References:**
- `scripts/scripts.js:141-147` - Main loadPage() function
- `scripts/scripts.js:92-110` - loadEager() function
- `scripts/aem.js:574-605` - loadBlock() function
- `scripts/aem.js:611-625` - decorateBlock() function
- `scripts/aem.js:501-537` - decorateSections() function
- `blocks/cards/cards.js:4-23` - Example decorate() function

**Confidence Score:** 98%

---

## Component/Service Patterns and Anti-Patterns

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

**Source Reference:** ```4:23:blocks/cards/cards.js```

**Confidence Score:** 100%

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

**Source Reference:** ```4:23:blocks/cards/cards.js```

**Confidence Score:** 100%

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

**Source Reference:** ```47:59:blocks/fragment/fragment.js```

**Confidence Score:** 100%

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

**Source Reference:** ```110:166:blocks/header/header.js```

**Confidence Score:** 95%

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

**Source Reference:** ```17:21:blocks/cards/cards.js```

**Confidence Score:** 100%

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
**Confidence Score:** 100%

#### ❌ Anti-Pattern 2: Hardcoding Breakpoints

```javascript
// ❌ WRONG
if (window.innerWidth >= 1024) { ... }

// ✅ CORRECT - Use consistent breakpoint
const isDesktop = window.matchMedia('(min-width: 900px)');
if (isDesktop.matches) { ... }
```

**Impact:** Inconsistent responsive behavior  
**Confidence Score:** 100%

#### ❌ Anti-Pattern 3: Missing XWalk Configuration

```javascript
// Block works but cannot be authored in AEM
// Missing: blocks/<block-name>/_<block-name>.json
```

**Impact:** Block cannot be configured in AEM authoring interface  
**Confidence Score:** 100%

#### ❌ Anti-Pattern 4: Using innerHTML with User Content

```javascript
// ❌ WRONG - XSS risk
element.innerHTML = userContent;

// ✅ CORRECT - Safe
element.textContent = userContent;
// OR use sanitization utility if HTML needed
```

**Impact:** Security vulnerability  
**Confidence Score:** 95%

#### ❌ Anti-Pattern 5: Not Running Build Command

```bash
# After adding XWalk config, must run:
npm run build:json
# Otherwise component-*.json files won't be updated
```

**Impact:** AEM won't recognize new block  
**Confidence Score:** 100%

**Confidence Score for Patterns Section:** 98%

---

## Detailed Reusable Code, Frameworks, Libraries, Services, Utilities

### Core Utilities from scripts/aem.js

#### 1. **createOptimizedPicture()**

**Location:** `scripts/aem.js:320-357`  
**Purpose:** Creates optimized picture element with WebP support and responsive breakpoints

**Usage:**
```javascript
import { createOptimizedPicture } from '../../scripts/aem.js';

const optimizedPic = createOptimizedPicture(
  src,                    // Image source URL
  alt,                    // Alt text
  eager,                  // Boolean: eager loading (for LCP)
  breakpoints             // Array: [{ media: '(min-width: 600px)', width: '2000' }, { width: '750' }]
);
```

**Example:**
```javascript
const optimizedPic = createOptimizedPicture(
  img.src,
  img.alt,
  false,
  [{ width: '750' }]
);
```

**Source Reference:** ```17:21:blocks/cards/cards.js```

**Confidence Score:** 100%

#### 2. **getMetadata()**

**Location:** `scripts/aem.js:304-310`  
**Purpose:** Retrieves metadata from page head

**Usage:**
```javascript
import { getMetadata } from '../../scripts/aem.js';

const navPath = getMetadata('nav');
const footerPath = getMetadata('footer');
```

**Example:**
```javascript
const navMeta = getMetadata('nav');
const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
```

**Source Reference:** ```112:113:blocks/header/header.js```

**Confidence Score:** 100%

#### 3. **loadSections()**

**Location:** `scripts/aem.js:701-710`  
**Purpose:** Loads all sections asynchronously (useful for fragments)

**Usage:**
```javascript
import { loadSections } from '../../scripts/aem.js';

await loadSections(mainElement);
```

**Example:**
```javascript
decorateMain(main);
await loadSections(main);
```

**Source Reference:** ```39:40:blocks/fragment/fragment.js```

**Confidence Score:** 100%

### Core Utilities from scripts/scripts.js

#### 4. **moveInstrumentation()** ⚠️ CRITICAL

**Location:** `scripts/scripts.js:39-47`  
**Purpose:** Preserves AEM authoring attributes when transforming DOM

**Usage:**
```javascript
import { moveInstrumentation } from '../../scripts/scripts.js';

// When replacing/transforming elements
moveInstrumentation(sourceElement, targetElement);
```

**Example:**
```javascript
const li = document.createElement('li');
moveInstrumentation(row, li);  // Preserves data-aue-* and data-richtext-* attributes
while (row.firstElementChild) li.append(row.firstElementChild);
```

**Source Reference:** ```9:9:blocks/cards/cards.js```, ```19:19:blocks/cards/cards.js```

**Confidence Score:** 100%

**⚠️ CRITICAL:** Always use this when transforming DOM elements to preserve AEM authoring functionality.

#### 5. **decorateMain()**

**Location:** `scripts/scripts.js:79-86`  
**Purpose:** Initializes page structure (useful for fragments)

**Usage:**
```javascript
import { decorateMain } from '../../scripts/scripts.js';

decorateMain(mainElement);
```

**Example:**
```javascript
const main = document.createElement('main');
main.innerHTML = await resp.text();
decorateMain(main);
```

**Source Reference:** ```39:39:blocks/fragment/fragment.js```

**Confidence Score:** 100%

### Reusable Fragment Loading

#### 6. **loadFragment()**

**Location:** `blocks/fragment/fragment.js:21-45`  
**Purpose:** Loads external content as fragment

**Usage:**
```javascript
import { loadFragment } from '../fragment/fragment.js';

const fragment = await loadFragment('/path/to/fragment');
if (fragment) {
  block.replaceChildren(...fragment.childNodes);
}
```

**Example:**
```javascript
const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
const fragment = await loadFragment(navPath);
```

**Source Reference:** ```114:114:blocks/header/header.js```

**Confidence Score:** 100%

### Reusable Model Definitions

**Location:** `models/` directory

#### 7. **_button.json**

**Purpose:** Reusable button field model  
**Usage:** Reference in block's model using JSON pointer or copy fields

**Source Reference:** ```1:59:models/_button.json```

**Confidence Score:** 100%

#### 8. **_image.json**

**Purpose:** Reusable image field model  
**Usage:** Reference in block's model

**Source Reference:** ```1:34:models/_image.json```

**Confidence Score:** 100%

#### 9. **_text.json**

**Purpose:** Reusable text field model  
**Usage:** Reference in block's model

**Source Reference:** ```1:17:models/_text.json```

**Confidence Score:** 100%

#### 10. **_title.json**

**Purpose:** Reusable title field model with heading level selection  
**Usage:** Reference in block's model

**Source Reference:** ```1:61:models/_title.json```

**Confidence Score:** 100%

### CSS Variables (Global)

**Location:** `styles/styles.css:13-41`

**Available Variables:**
- Colors: `--background-color`, `--light-color`, `--dark-color`, `--text-color`, `--link-color`, `--link-hover-color`
- Typography: `--body-font-family`, `--heading-font-family`, `--body-font-size-*`, `--heading-font-size-*`
- Layout: `--nav-height`

**Usage:**
```css
.my-block {
  background-color: var(--background-color);
  color: var(--text-color);
  font-family: var(--body-font-family);
}
```

**Source Reference:** ```16:16:blocks/hero/hero.css```, ```12:12:blocks/cards/cards.css```

**Confidence Score:** 100%

**Confidence Score for Reusable Artifacts Section:** 100%

---

## Detailed Dependency Mapping

### Block JavaScript Dependencies

```
blocks/<block-name>/<block-name>.js
├── Depends on: scripts/aem.js
│   ├── createOptimizedPicture() - Image optimization
│   ├── getMetadata() - Page metadata
│   └── loadSections() - Async section loading
├── Depends on: scripts/scripts.js
│   ├── moveInstrumentation() - CRITICAL: Preserve AEM attributes
│   └── decorateMain() - Initialize page structure
└── May depend on: blocks/fragment/fragment.js
    └── loadFragment() - External content loading
```

**Source References:**
- ```1:3:blocks/cards/cards.js``` - Import pattern
- ```1:2:blocks/header/header.js``` - Import pattern
- ```7:14:blocks/fragment/fragment.js``` - Import pattern

**Confidence Score:** 100%

### Block CSS Dependencies

```
blocks/<block-name>/<block-name>.css
└── Depends on: styles/styles.css (CSS variables)
    ├── Color variables
    ├── Typography variables
    └── Layout variables
```

**Source References:**
- ```16:16:blocks/hero/hero.css``` - CSS variable usage
- ```12:12:blocks/cards/cards.css``` - CSS variable usage

**Confidence Score:** 100%

### XWalk Configuration Dependencies

```
blocks/<block-name>/_<block-name>.json
├── Generated into: component-definition.json
├── Generated into: component-models.json
└── Generated into: component-filters.json
    └── Build command: npm run build:json
```

**Source References:**
- `package.json:11-14` - Build scripts
- `component-definition.json` - Generated output
- `component-models.json` - Generated output
- `component-filters.json` - Generated output

**Confidence Score:** 100%

### Optional Model Dependencies

```
blocks/<block-name>/_<block-name>.json
└── May reference: models/_*.json
    ├── _button.json - Button fields
    ├── _image.json - Image fields
    ├── _text.json - Text fields
    ├── _title.json - Title fields
    └── _section.json - Section fields
```

**Note:** Models can be referenced using JSON pointer syntax or fields can be copied directly.

**Confidence Score:** 95%

**Confidence Score for Dependency Mapping Section:** 98%

---

## Detailed Integration Points

### 1. Block Loading Integration

**Flow:** `scripts/scripts.js` → `scripts/aem.js` → `blocks/<block-name>/<block-name>.js`

**Integration Points:**
- `scripts/scripts.js:loadEager()` calls `decorateBlocks(main)` from `aem.js`
- `scripts/aem.js:decorateBlocks()` calls `decorateBlock()` for each block
- `scripts/aem.js:loadBlock()` dynamically imports block JS module
- Block JS module exports `decorate(block)` function
- `loadBlock()` calls `decorate(block)` after module loads

**Source References:**
- ```97:97:scripts/scripts.js``` - decorateBlocks call
- ```631:633:scripts/aem.js``` - decorateBlocks implementation
- ```574:605:scripts/aem.js``` - loadBlock implementation
- ```584:589:scripts/aem.js``` - Dynamic import and decorate call

**Confidence Score:** 100%

### 2. CSS Loading Integration

**Flow:** `scripts/aem.js:loadBlock()` → CSS file loading

**Integration Points:**
- `loadBlock()` calls `loadCSS()` to load block CSS
- CSS loaded in parallel with JS module
- CSS path: `${window.hlx.codeBasePath}/blocks/${blockName}/${blockName}.css`

**Source References:**
- ```580:580:scripts/aem.js``` - loadCSS call
- ```258:271:scripts/aem.js``` - loadCSS implementation

**Confidence Score:** 100%

### 3. XWalk Authoring Integration

**Flow:** AEM Cloud Service → XWalk Plugin → Generated JSON files → Block HTML

**Integration Points:**
1. **Authoring Time:**
   - AEM reads `component-definition.json` to discover blocks
   - AEM reads `component-models.json` to generate form fields
   - AEM reads `component-filters.json` to enforce nesting rules
   - Author configures block in AEM UI

2. **Rendering Time:**
   - AEM renders HTML with `data-aue-*` attributes
   - Attributes include: `data-aue-model`, `data-aue-field`, `data-aue-prop`, `data-aue-resource`
   - Frontend block JS preserves these attributes via `moveInstrumentation()`

**Source References:**
- `component-definition.json` - Component registry
- `component-models.json` - Field definitions
- `component-filters.json` - Nesting rules
- ```39:47:scripts/scripts.js``` - moveInstrumentation implementation

**Confidence Score:** 95%

### 4. Fragment Integration

**Flow:** Block → `loadFragment()` → External content → Block decoration

**Integration Points:**
- Blocks can load external content using `loadFragment()`
- Fragment content is decorated using `decorateMain()` and `loadSections()`
- Fragment content becomes part of main page

**Source References:**
- ```21:45:blocks/fragment/fragment.js``` - loadFragment implementation
- ```47:59:blocks/fragment/fragment.js``` - Fragment block usage
- ```110:166:blocks/header/header.js``` - Header using fragments

**Confidence Score:** 100%

**Confidence Score for Integration Points Section:** 98%

---

## Traceability

All patterns, examples, and recommendations are traceable to the following source files:

### Block Examples
1. **Simple Block:** `blocks/hero/hero.js`, `blocks/hero/hero.css`, `blocks/hero/_hero.json`
2. **Complex Block:** `blocks/cards/cards.js`, `blocks/cards/cards.css`, `blocks/cards/_cards.json`
3. **Async Block:** `blocks/fragment/fragment.js`, `blocks/fragment/_fragment.json`
4. **Container Block:** `blocks/columns/columns.js`, `blocks/columns/columns.css`, `blocks/columns/_columns.json`
5. **Interactive Block:** `blocks/header/header.js`, `blocks/header/header.css`
6. **Fragment-based Block:** `blocks/footer/footer.js`, `blocks/footer/footer.css`

### Core Scripts
- `scripts/aem.js` (739 lines) - Block loading system, utilities
- `scripts/scripts.js` (148 lines) - Main entry point, page lifecycle

### Configuration Files
- `component-definition.json` - Component registry
- `component-models.json` - Field models
- `component-filters.json` - Nesting rules
- `package.json` - Build scripts

### Model Definitions
- `models/_button.json` - Button model
- `models/_image.json` - Image model
- `models/_text.json` - Text model
- `models/_title.json` - Title model
- `models/_section.json` - Section model

**Confidence Score:** 100%

---

## Confidence Scores Summary

- **Executive Summary:** 98%
- **Technology Stack:** 100%
- **Folder Structure:** 100%
- **Sequence Diagram:** 98%
- **Patterns and Anti-Patterns:** 98%
- **Reusable Artifacts:** 100%
- **Dependency Mapping:** 98%
- **Integration Points:** 98%
- **Traceability:** 100%

**Overall Document Confidence:** 98%

---

**Document Version:** EDS-2026.1.0  
**Last Updated:** 2026-01-08  
**Maintained By:** AI Documentation Engineer
