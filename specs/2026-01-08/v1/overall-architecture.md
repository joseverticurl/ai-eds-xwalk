# Overall Architecture Summary

**Generated:** 2026-01-06  
**Version:** v1  
**Confidence Score:** 95% (based on analysis of 12+ existing blocks in codebase)

## High-Level System Architecture

### AEM Edge Delivery Services (EDS) Block-Based Architecture

This project follows the AEM Edge Delivery Services architecture, which uses a **block-based component system** where each block is a self-contained, reusable component that can be authored in AEM and rendered on the frontend.

### Core Architecture Components

1. **Block Structure** (`blocks/<block-name>/`)
   - Each block is a directory containing:
     - `<block-name>.js` - JavaScript module for block functionality
     - `<block-name>.css` - Styles for the block
     - `_<block-name>.json` - XWalk configuration for AEM authoring (MANDATORY)

2. **XWalk Integration Layer**
   - Bridges EDS blocks with AEM authoring interface
   - Configuration files: `component-definition.json`, `component-models.json`, `component-filters.json`
   - Auto-generated via `npm run build:json` from individual `_*.json` files

3. **Shared Components** (`shared-components/`)
   - Reusable utilities: `Heading.js`, `ImageComponent.js`, `ButtonCTA.js`, `SvgIcon.js`, `Utility.js`
   - Used across multiple blocks for consistency

4. **Reusable Models** (`models/`)
   - Common field definitions: `_button.json`, `_image.json`, `_text.json`, `_title.json`, `_section.json`
   - Referenced using JSON pointer syntax

5. **Block Loading System** (`scripts/aem.js`)
   - Dynamic block loading via `loadBlock()` function
   - Handles CSS and JS module loading asynchronously
   - Lifecycle: `initialized` → `loading` → `loaded`

## Block Loading Mechanism and Lifecycle

### Loading Flow

```
1. Page Load
   ↓
2. decorateSections() - Identifies sections and blocks
   ↓
3. decorateBlock() - Marks block as 'initialized'
   - Sets blockName dataset
   - Adds 'block' class
   - Wraps text nodes
   ↓
4. loadBlock() - Asynchronously loads block
   - Sets status to 'loading'
   - Loads CSS file
   - Imports JS module
   - Calls default export function (decorate)
   ↓
5. Block Status: 'loaded'
```

### Key Functions (from `scripts/aem.js`)

- **`decorateBlock(block)`** - Lines 812-826
  - Initializes block structure
  - Sets up block metadata
  - Prepares block for loading

- **`loadBlock(block)`** - Lines 777-806
  - Handles async CSS and JS loading
  - Manages block lifecycle states
  - Error handling via logger

- **`loadSections(element)`** - Lines 902-911
  - Loads all blocks within sections sequentially
  - Enhances RUM after first section

**Confidence:** 98% - Directly from `scripts/aem.js` analysis

## XWalk Configuration Architecture

### XWalk Plugin Structure

XWalk enables blocks to be editable in AEM authoring interface through JSON configuration files.

### Configuration File Structure (`_<block-name>.json`)

Each XWalk configuration file contains three main sections:

1. **`definitions`** - Component definitions
   ```json
   {
     "title": "Component Name",
     "id": "componentId",
     "plugins": {
       "xwalk": {
         "page": {
           "resourceType": "core/franklin/components/block/v1/block",
           "template": {
             "name": "ComponentName",
             "model": "modelId",
             "filter": "filterId" // optional
           }
         }
       }
     }
   }
   ```

2. **`models`** - Content model field definitions
   ```json
   {
     "id": "modelId",
     "fields": [
       {
         "component": "text|richtext|reference|select|multiselect|boolean|aem-content",
         "name": "fieldName",
         "label": "Field Label",
         "valueType": "string|number|boolean",
         "value": "", // default value
         "multi": false, // for reference fields
         "validation": { // optional
           "maxLength": 100,
           "maxSize": 500,
           "customErrorMsg": "Error message"
         },
         "condition": { // optional - conditional visibility
           "===": [{ "var": "otherField" }, true]
         }
       }
     ]
   }
   ```

3. **`filters`** - Component nesting rules
   ```json
   {
     "id": "parentComponentId",
     "components": ["childComponent1", "childComponent2"]
   }
   ```

### Resource Type Patterns

**Confidence:** 100% - Analyzed from 5 XWalk config files

- **`core/franklin/components/block/v1/block`** - Standard block component
  - Used in: hero, feature, fragment, cards (parent)
  - **Pattern:** Most common for standalone blocks

- **`core/franklin/components/block/v1/block/item`** - Block item (nested)
  - Used in: featureItem, card (item), awardstile
  - **Pattern:** For child components within parent blocks

- **`core/franklin/components/section/v1/section`** - Section component
  - Used in: section, tabs, statisticsSection
  - **Pattern:** For section-level containers

- **`core/franklin/components/columns/v1/columns`** - Columns layout
  - Used in: columns
  - **Pattern:** Special layout component

### Component Registration Process

1. Individual `_*.json` files created in `blocks/<block-name>/` or `models/`
2. Run `npm run build:json` command
3. Build process merges files:
   - `models/_component-definition.json` + `blocks/*/_*.json` → `component-definition.json`
   - `models/_component-models.json` + `blocks/*/_*.json` → `component-models.json`
   - `models/_component-filters.json` + `blocks/*/_*.json` → `component-filters.json`

**Confidence:** 95% - From `package.json` build scripts analysis

## Content Model Structure and Field Definition Patterns

### Common Field Components

**Confidence:** 100% - Analyzed from `component-models.json` (2212+ lines)

1. **`text`** - Single line text input
   - Used for: titles, headings, alt text, descriptions
   - Supports: `valueType`, `validation.maxLength`, `validation.customErrorMsg`

2. **`richtext`** - Rich text editor
   - Used for: descriptions, content, sub-headings
   - Supports: `valueType: "string"`, `value: ""`

3. **`reference`** - Asset reference
   - Used for: images, icons
   - Supports: `multi: false`, `valueType: "string"`

4. **`custom-asset-namespace:custom-asset`** - Custom asset picker
   - Used for: images with DAM integration
   - Requires: `configUrl`, `validation.rootPath`
   - Example: `blocks/hero/_hero.json:24-28`

5. **`aem-content`** - AEM content reference
   - Used for: links, fragments, content references
   - Pattern: `blocks/fragment/_fragment.json:24-26`

6. **`select`** - Dropdown selection
   - Used for: button types, title types, targets
   - Requires: `options` array with `name` and `value`
   - Example: `models/_button.json:38-55`

7. **`multiselect`** - Multiple selection
   - Used for: section styles
   - Example: `models/_section.json:23-31`

8. **`boolean`** - Boolean checkbox
   - Used for: toggles, flags
   - Supports: `valueType: "boolean"`, `value: false`
   - Example: `component-models.json:164-167` (tabs active field)

### Validation Patterns

**Confidence:** 98% - Found in multiple models

- **`maxLength`** - Character limit
  - Example: `component-models.json:159` (tabtitle: 50 chars)
  - Example: `component-models.json:1156` (tile heading: 100 chars)

- **`maxSize`** - Size limit (for text fields)
  - Example: `component-models.json:1166` (tile description: 500 chars)

- **`customErrorMsg`** - Custom error message
  - Always paired with validation rules

- **`rootPath`** - Asset path validation
  - Example: `component-models.json:13` (image rootPath)

### Field Condition Patterns

**Confidence:** 95% - Found in tile model

Conditional field visibility using JSON logic:
```json
{
  "condition": {
    "===": [
      { "var": "reveal" },
      true
    ]
  }
}
```
- Example: `component-models.json:1197-1204` (filepath field shown when reveal=true)

## Testing Strategy

### Static HTML/Development Testing Structure

**MANDATORY for all blocks**

**Location:** `preview/mock-content/<block-name>.html` or `preview/<block-name>.html`

**Purpose:**
- Frontend development workflow
- Visual testing without AEM authoring
- DOM structure validation
- CSS styling verification

**Pattern from codebase:**
- `preview/index.html` - Main preview page that loads block styles
- `scripts/mock-data.js` - Mock content structure (lines 1-27)
- Blocks reference mock content for development

**Structure:**
```html
<div class="<block-name>">
  <!-- Semantic HTML matching expected block structure -->
  <!-- Should match the structure expected by block's decorate() function -->
</div>
```

**Confidence:** 90% - Based on `preview/` directory structure

### Unit Testing Structure for JavaScript Modules

**If applicable** - For complex business logic

**Location:** `blocks/<block-name>/<block-name>.test.js`

**Testing Frameworks:**
- Not currently configured in `package.json`
- Recommended: Jest or Vitest (as mentioned in template)
- Would test: data processing, validation logic, utility functions

**What to Test:**
- Data transformation functions
- Validation logic
- Business rules
- Edge cases

**Confidence:** 70% - No existing test files found, recommendation based on best practices

### XWalk Configuration Validation Approach

**Manual Validation:**
1. JSON syntax validation
2. Required sections check (definitions, models, filters)
3. Field component type validation
4. Resource type pattern matching
5. Model ID consistency between definitions and models
6. Filter component ID validation

**Automated Validation:**
- ESLint plugin: `eslint-plugin-xwalk` (from `package.json:39`)
- JSON linting via `npm run lint:js`

**Confidence:** 95% - Based on package.json and .eslintrc.js analysis

### Content Model Validation Testing

**Validation Points:**
1. Field names match between model and actual usage
2. Value types are correct (string, number, boolean)
3. Validation rules are properly formatted
4. Field conditions use valid JSON logic syntax
5. Required fields are marked appropriately

**Confidence:** 90% - Based on component-models.json analysis

### Field Validation Rule Testing

**Test Cases:**
1. `maxLength` enforcement
2. `maxSize` enforcement  
3. Custom error messages display
4. Field condition evaluation (show/hide based on other fields)
5. Required field validation

**Confidence:** 85% - Based on validation patterns found in models

## Architecture Patterns Identified

### Block JavaScript Pattern

**Confidence:** 100% - Analyzed 12+ block implementations

**Standard Pattern:**
```javascript
// Import shared components and utilities
import Heading from '../../shared-components/Heading.js';
import ImageComponent from '../../shared-components/ImageComponent.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import stringToHTML from '../../shared-components/Utility.js';

/**
 * Decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // Block decoration logic
  // DOM manipulation
  // Event handlers
  // Data processing
}
```

**Key Observations:**
- All blocks export default async or sync function named `decorate`
- Function receives block element as parameter
- Uses shared components for consistency
- Preserves AEM authoring attributes via `moveInstrumentation()`

### XWalk Configuration Pattern

**Confidence:** 100% - Analyzed 5+ XWalk config files

**Standard Structure:**
- Definitions section: 1 definition per block (or 2 if parent+item)
- Models section: 1 model per block (or 2 if parent+item)
- Filters section: 1 filter per parent block (empty array if no children)

### Component Nesting Pattern

**Confidence:** 95% - From component-filters.json analysis

**Common Patterns:**
- Section → Multiple block types
- Block → Block items (feature → featureItem, cards → card)
- Tabs → Multiple block types
- Columns → Column → Multiple block types

## Dependencies and Integration Points

### External Dependencies
- **Express** - Local development server (`package.json:29`)
- **WebSocket (ws)** - Live reload (`package.json:30`)
- **Chokidar** - File watching (`package.json:31`)

### Internal Dependencies
- **scripts/aem.js** - Block loading, utilities
- **scripts/scripts.js** - Main script, instrumentation
- **shared-components/** - Reusable UI components
- **models/** - Reusable field definitions

### AEM Integration
- **fstab.yaml** - AEM mount point configuration
- **paths.json** - Content path mappings
- **XWalk** - Authoring interface bridge

**Confidence:** 100% - Directly from file analysis

## Summary

This EDS project uses a well-structured block-based architecture with:
- **12+ existing blocks** demonstrating consistent patterns
- **XWalk integration** for AEM authoring
- **Shared component library** for reusability
- **Dynamic block loading** system
- **Component registration** via build process

The architecture supports:
- ✅ Rapid block development
- ✅ AEM authoring integration
- ✅ Code reusability
- ✅ Maintainable structure
- ✅ Performance optimization (lazy loading)

**Overall Confidence:** 95% - Comprehensive analysis of actual codebase

