# Implementation Guide: Creating a New EDS Block

**Functionality:** Creating a New EDS Block with XWalk Authoring Integration  
**Date:** 2026-01-08  
**Version:** EDS-2026.1.0  
**Confidence Score:** 98% (based on analysis of 6+ existing blocks in codebase)

---

## Purpose and Scope

This guide provides step-by-step instructions for creating new EDS blocks or enhancing existing ones with XWalk authoring integration. It covers the complete development lifecycle from block creation to AEM authoring validation.

**Development Process (in order):**
1. **Generate backend code first** — block-level JSON (`blocks/<block-name>/_<block-name>.json`), then run `npm run build:json`
2. **User provides semantic HTML** — User authors the block in Adobe Universal Editor and provides the generated HTML to Cursor (do NOT generate HTML — Cursor output can differ from Universal Editor)
3. **Generate styling and scripting** — JavaScript and CSS based on the user-provided semantic HTML

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

## Quick Reference

**Development order (follow in sequence):**
1. **Backend first** — Add XWalk config to block-level JSON (`blocks/<block-name>/_<block-name>.json`), run `npm run build:json`
2. **User provides semantic HTML** — Author block in Adobe Universal Editor, then provide the generated HTML (do NOT generate HTML — Cursor output can differ from Universal Editor)
3. **Frontend** — Generate JavaScript and CSS based on user-provided HTML

**Critical rules:**
- Use block-level JSON files (`blocks/<block-name>/_<block-name>.json`); run build command to update root files
- Use **index-based** structure only — no `data-*` attributes for selection
- **User-provided HTML is mandatory** — validate structure contract before coding
- Parent-child blocks use **ONE folder** — one JS file and one CSS file for both parent and children
- **One JS, one CSS per block** — Generate exactly `<block-name>.js` and `<block-name>.css` (matching the folder name). Never create two files with different naming (e.g., `social-promo.js` and `socialpromo.js` is wrong — use only one).

**Jump to:**
- [Part 1: Process Flow (3 Steps)](#part-1-process-flow-3-steps)
- [Part 2: Backend Code Generation](#part-2-backend-code-generation)
- [Part 3: Frontend Code Generation](#part-3-frontend-code-generation)
- [Implementation Checklist](#implementation-checklist) — full phase-by-phase checklist

**Checklist at a glance:** Prerequisites → Step 1 (Backend) → Step 2 (User HTML) → Step 3 (Frontend) → Validation

**Key documentation:**
- [Model Definitions, Fields, and Component Types](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/implementing/developing/universal-editor/field-types) (Experience League)
- [Content modeling for AEM authoring projects](https://www.aem.live/developer/component-model-definitions) (AEM.live)

---

## Document Structure

This guide is organized into three parts:

1. **Part 1: Process Flow (3 Steps)** - The 3-step process, Step 2 (User Provides HTML), validation, checklist, and end-to-end workflow
2. **Part 2: Backend Code Generation** - XWalk JSON configuration (block-level JSON, build step)
3. **Part 3: Frontend Code Generation** - JavaScript, CSS, and HTML implementation

**Development Order:** Step 1 (Backend) → Step 2 (User HTML) → Step 3 (Frontend)

---

## Table of Contents

**Pre-Implementation**
- [Requirements Gathering](#pre-implementation-gathering-requirements)
- [Development Workflow: Backend First, Then User-Provided Semantic HTML](#development-workflow-backend-first-then-user-provided-semantic-html)

**Part 1: Process Flow (3 Steps)**
- [AI Governance Rules (Process)](#ai-governance-rules-process)
- [The 3-Step Process](#the-3-step-process)
- [Step 2: User Provides Semantic HTML](#step-2-user-provides-semantic-html)
- [End-to-End Flow](#end-to-end-flow)
- [Development Workflow](#development-workflow)
- [Implementation Checklist](#implementation-checklist)
- [Validation Workflow](#validation-workflow)
- [Considerations](#considerations)
- [Next Steps](#next-steps)

**Part 2: Backend Code Generation**
- [AI Governance Rules (Backend)](#ai-governance-rules-backend)
- [Configuration Overview](#configuration-overview)
- [Component Definition](#component-definition-structure)
- [Field Configuration](#field-configuration)
  - [Field Definition Basics](#field-definition-basics)
  - [Field Component Types](#field-component-types)
  - [Validation Patterns](#validation-patterns)
  - [Multi-Fields and Composite Multi-Fields](#multi-fields-and-composite-multi-fields)
- [AEM Rendering Mechanics](#aem-rendering-mechanics)
- [Block Structure Variants](#block-structure-variants)
- [Resource Types](#resource-types)
- [Filter/Nesting Rules](#filternesting-rules)

**Part 3: Frontend Code Generation**
- [Part 3a: Core Concepts](#part-3a-core-concepts)
- [Part 3b: JavaScript Implementation](#part-3b-javascript-implementation)
  - [Pattern 7: Carousel Block with Swiper](#pattern-7-carousel-block-with-swiper)
  - [Carousel Component Snippets (Swiper)](#carousel-component-snippets-swiper)
- [Part 3c: CSS Implementation](#part-3c-css-implementation)
- [Part 3d: HTML Implementation](#part-3d-html-implementation)
- [Part 3e: Best Practices](#part-3e-best-practices-and-reference)

**Appendices**
- [Appendix A: EDS Performance & Lighthouse](#appendix-a-eds-performance--lighthouse-best-practices)
- [Appendix B: Adobe FE EDS Practices](#appendix-b-adobe-fe-eds-recommended-practices-block-creation)
- [Appendix C: Key References](#appendix-c-key-references)
- [Appendix D: Common Issues and Solutions](#appendix-d-common-issues-and-solutions)

---

## Pre-Implementation: Gathering Requirements

Before starting implementation, gather all necessary requirements and design assets. This ensures accurate implementation that matches design specifications and business requirements.

### Required Information

When creating a component implementation plan, **always ask for**:

1. **Design Source (one of the following):**
   - **Figma Design URL** (preferred when available):
     - Full Figma file URL or specific frame/component URL
     - Access permissions (if file is private)
     - Specific variant or state to implement (if multiple exist)
     - Breakpoint specifications (mobile, tablet, desktop)
   - **OR Component Design Images** (when Figma URL is not available):
     - Design images for **desktop** viewport
     - Design images for **tablet** viewport (if layout differs)
     - Design images for **mobile** viewport (if layout differs)
     - Cursor can analyze images and generate code based on visual design
     - Provide clear, high-resolution screenshots or exports of the component

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
   - Performance considerations (see [EDS Performance & Lighthouse Best Practices](#eds-performance--lighthouse-best-practices) for guidelines)

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

3. **Fetch SVG Icons from Figma:**
   - Use Figma MCP (`get_design_context` or `get_screenshot`) to extract icon nodes from the design
   - For each icon in the design, obtain the node ID and fetch the SVG markup
   - Save icons as `.svg` files in `icons/` (e.g., `icons/icon-name.svg`) for use with `decorateIcon()` / `decorateIcons()`
   - Use inline SVG format with proper attributes:

   ```html
   <svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72" fill="none">
     <rect width="72" height="72" rx="36" fill="#FFFBE3"/>
     <path d="M47.2791 32.2804C49.9793 33.7603 50.0649 37.6084 47.4331 39.2069L33.5817 47.62C30.9499 49.2185 27.5746 47.3686 27.5062 44.2902L27.1459 28.0879C27.0774 25.0095 30.3671 23.0113 33.0674 24.4913L47.2791 32.2804Z" fill="#F85001"/>
   </svg>
   ```

   - Ensure each SVG has: `xmlns`, `width`, `height`, `viewBox`, and `fill` (or `fill="none"` with fills on child elements)
   - Preserve design colors and paths from Figma; avoid altering the exported markup

4. **Document Findings:**
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
   - Icons: Fetch SVG markup from Figma for each icon node; save as icons/<name>.svg
4. Cross-reference with story requirements
5. Create implementation plan based on design + requirements
```

### Using Design Images (When Figma URL is Not Available)

**When Figma URL is not provided, request component design images and generate code from visual analysis:**

1. **Request Design Images:**
   - Ask user: "Please provide component design images for desktop, tablet, and mobile viewports (if layouts differ)."
   - Desktop image (required) — primary layout reference
   - Tablet image (if layout differs from desktop)
   - Mobile image (if layout differs from desktop/tablet)

2. **Analyze Design Images:**
   - Use image analysis to extract layout, structure, and hierarchy
   - Identify colors, typography, spacing, and sizing from visual inspection
   - Infer responsive breakpoints from layout differences across viewports
   - Map visual elements to HTML structure and CSS properties

3. **Generate Implementation:**
   - Create implementation plan based on image analysis + story requirements
   - Generate code (HTML structure, CSS, JavaScript) that matches the visual design
   - Cursor can infer design specifications from images and produce equivalent code

**Example Workflow (Design Images):**
```
1. Request: "Please provide design images for desktop, tablet, and mobile."
2. User provides images (e.g., desktop.png, tablet.png, mobile.png)
3. Analyze images to extract:
   - Layout (Grid, Flexbox, stacking order)
   - Component structure and nesting
   - Colors, typography, spacing
   - Breakpoint differences (layout changes at tablet/mobile)
4. Cross-reference with story requirements
5. Generate implementation plan and code based on visual design
```

### Requirements Checklist

Before starting implementation, ensure you have:

- [ ] Design source: Figma design URL (with access) OR component design images (desktop, tablet, mobile)
- [ ] Story/requirements document
- [ ] Design specifications extracted (via Figma MCP, design images, or manual review)
- [ ] Content structure mapped to XWalk fields
- [ ] Similar blocks identified for reference
- [ ] Breakpoint requirements confirmed
- [ ] Accessibility requirements documented
- [ ] Browser compatibility requirements noted
- [ ] Performance requirements reviewed (see [EDS Performance & Lighthouse Best Practices](#eds-performance--lighthouse-best-practices))

**Note:** If Figma URL is not available, request component design images (desktop, tablet, mobile) instead. Cursor can generate code from design images. Ensure story requirements are provided before proceeding. Accurate requirements prevent rework and ensure the component meets design and functional specifications.

### Development Workflow: Backend First, Then User-Provided Semantic HTML

**Critical:** To avoid DOM structure mismatches, the development process follows this order:

1. **Generate backend code first** (block-level JSON, then `npm run build:json`)
2. **User provides semantic HTML** — The user authors the block in Adobe Universal Editor and provides the actual generated HTML to Cursor
3. **Generate styling and scripting** based on the user-provided semantic HTML

**Why User-Provided HTML is Essential:**
- Cursor-generated HTML can differ from actual Adobe Universal Editor output
- Universal Editor generates the authoritative DOM structure
- Ensures JavaScript index-based access matches the real structure
- Prevents structure mismatches and index-based access errors
- Validates that field order in XWalk model matches actual output

**Workflow Steps:**

1. **Generate Backend Configuration First:**
   - Add definition, model, and filter to `blocks/<block-name>/_<block-name>.json`
   - Run `npm run build:json` to update root files
   - Deploy to AEM/Universal Editor environment

2. **Request User to Provide Semantic HTML:**
   - **Prompt the user:** "Please author the block in Adobe Universal Editor with sample content, then provide the semantic HTML output."
   - **User actions:**
     - Add the block to a page in Universal Editor
     - Configure all fields (including empty/optional fields where relevant)
     - Add multiple items if it's a parent-child block
     - Extract the generated HTML (view source or DevTools)
     - Provide the HTML to Cursor
   - **User should provide variations if applicable:**
     - Basic structure with all fields
     - With/without optional fields (e.g., section title)
     - Multiple child items for parent-child blocks

3. **Generate JavaScript and CSS:**
   - Analyze the user-provided HTML to document the structure contract
   - Write `decorate()` function using index-based access matching the actual DOM
   - Write CSS targeting the transformed structure
   - Test with the user-provided HTML

**What to Request from the User:**

```
Please provide the semantic HTML for the [block-name] block:

1. Author the block in Adobe Universal Editor with sample content
2. Configure all relevant fields (including optional fields if applicable)
3. For parent-child blocks: add multiple items
4. Copy the generated HTML (view page source or use DevTools)
5. Paste the HTML here

Include the block's root element (e.g., <div class="blockname">...</div>) and its full structure.
```

**Key Observations to Document from User-Provided HTML:**
- Which fields generate rows vs cells
- Field indices (0, 1, 2, etc.)
- Empty field behavior (missing cells vs empty cells)
- Optional field behavior (parent title, etc.)
- How parent-child blocks are structured

**Important Notes:**
- Do NOT generate static HTML — the user provides it from Universal Editor
- The user-provided HTML is the source of truth for DOM structure
- JavaScript and CSS must be generated to match this structure

---

# Part 1: Process Flow (3 Steps)

**Purpose:** This part enforces deterministic AI-driven block generation by formalizing the structure contract between XWalk model configuration and runtime DOM output. The strict Backend → User HTML → Frontend sequence prevents structural hallucination and DOM mismatch.

## AI Governance Rules (Process)

Rules for Cursor AI when generating EDS blocks:

- **Never generate HTML** — Wait for user-provided HTML from Universal Editor; Cursor output can differ from AEM output
- **Follow sequence strictly** — Backend first, then user provides HTML, then frontend
- **Document structure contract** — After receiving user HTML, document field indices and empty/optional field behavior before coding
- **Index-based only** — No `data-*` attributes for structure or selection; use position-based access

## The 3-Step Process

| Step | Action | Details |
|------|--------|---------|
| **Step 1** | Backend | Add block-level JSON, run `npm run build:json`. See [Part 2: Backend Code Generation](#part-2-backend-code-generation). |
| **Step 2** | User Provides Semantic HTML | User authors block in Universal Editor and provides the generated HTML. Cursor must not generate HTML ([AI Governance Rules](#ai-governance-rules-process)). Details: [Step 2](#step-2-user-provides-semantic-html) below. |
| **Step 3** | Frontend | Generate JavaScript and CSS based on user-provided HTML. See [Part 3: Frontend Code Generation](#part-3-frontend-code-generation). |

**Prerequisites:** [Pre-Implementation: Gathering Requirements](#pre-implementation-gathering-requirements) — design source, story requirements, and XWalk field planning.

---

## Step 2: User Provides Semantic HTML

**Execute this step AFTER Step 1 (Backend) is complete and deployed.**

**Prerequisites:** [Part 2: Backend Code Generation](#part-2-backend-code-generation) must be complete and deployed to Universal Editor.

**Objective:** Obtain the actual HTML structure from Adobe Universal Editor. See [AI Governance Rules (Process)](#ai-governance-rules-process).

**Steps:**
1. **Prerequisite:** Backend configuration is complete and deployed to AEM/Universal Editor
2. **Request user:** "Please author the block in Adobe Universal Editor with sample content, then provide the semantic HTML output."
3. **User actions:** Add block to page, configure all fields, add multiple items if parent-child, extract HTML (view source or DevTools), provide to Cursor
4. **Document:** Structure contract (field indices, empty/optional field behavior) from user-provided HTML
5. **Use for:** Generating JavaScript and CSS that match the actual DOM structure

**See also:**
- [Development Workflow: Backend First, Then User-Provided Semantic HTML](#development-workflow-backend-first-then-user-provided-semantic-html) (Pre-Implementation) — full workflow details
- [Step 2: User Provides Semantic HTML (Checklist)](#step-2-user-provides-semantic-html-mandatory) — detailed checklist

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
      │                    │ 2. Save to         │                    │
      │                    │    Content         │                    │
      │                    │                    │ 3. Page Load       │
      │                    │                    │    decorateBlock() │
      │                    │                    │ 4. loadBlock()      │
      │                    │                    │    Load CSS/JS     │
      │                    │                    │                    │ 5. decorate()
      │                    │                    │                    │    Transform DOM
      │                    │                    │                    │ 6. Render HTML
```

**Flow Steps:**
1. Author configures block via XWalk-enabled AEM UI (Part 2)
2. Content saved to AEM repository
3. Page loads, `decorateBlock()` identifies block (Part 3)
4. `loadBlock()` asynchronously loads CSS and JS module (Part 3)
5. Block's `decorate()` function transforms DOM (Part 3)
6. Final HTML rendered in browser (Part 3)

### Data Flow: AEM Authoring → Block Rendering

```
AEM Content (HTML) – structure by index, no reliance on data attributes
  ↓
decorate(block) receives block element (Part 3)
  ↓
Extract data by index (e.g. block.children[0], block.children[1]) (Part 3)
  ↓
Transform to final HTML structure (Part 3)
  ↓
Rendered output
```

**Reference:** Index-based extraction patterns in Part 3.

---

# Part 2: Backend Code Generation

**Purpose:** Part 2 enforces deterministic block configuration by defining the structure contract between XWalk model configuration and runtime DOM output. Field order in the model directly determines HTML structure; plan it carefully.

This section covers XWalk JSON configuration for AEM authoring interface integration. **Do this first (Step 1).**

## AI Governance Rules (Backend)

Rules for Cursor AI when generating backend configuration:

- **Block-level JSON only** — Add config to `blocks/<block-name>/_<block-name>.json`; never edit `component-definition.json`, `component-models.json`, or `component-filters.json` directly
- **Run build after changes** — Execute `npm run build:json` to merge block configs into root files
- **Plan field order** — Field order = structure contract; field at index N → `block.children[N]` in generated HTML
- **Use EDS resource types only** — No custom AEM components; use `core/franklin/components/block/v1/block` and related types
- **Validate with user HTML** — After configuring the model, obtain user-provided HTML from Universal Editor to verify structure before frontend work

**Prerequisites:**
- [Pre-Implementation: Gathering Requirements](#pre-implementation-gathering-requirements) — design source, story requirements, and XWalk field planning
- [Getting Started – Universal Editor Developer Tutorial](https://www.aem.live/developer/universal-editor-blocks), [Markup, Sections, Blocks](https://www.aem.live/developer/markup-sections-blocks), and [Block Collection](https://aem.live/developer/block-collection) — essential for understanding content modeling

---

## CRITICAL: Use Block-Level JSON Files

See [AI Governance Rules (Backend)](#ai-governance-rules-backend). Summary:

| Required | Forbidden |
|----------|-----------|
| Create `blocks/<block-name>/_<block-name>.json` | Edit root files directly |
| Run `npm run build:json` after config changes | Manually copy config into root files |

---

## Build Step Check

**Workflow:** Create block-level JSON → Run build → Root files updated. See [AI Governance Rules (Backend)](#ai-governance-rules-backend).

1. Add `blocks/<block-name>/_<block-name>.json` with definition, model, and filter
2. Run `npm run build:json`
3. Verify root files are updated (they are build outputs; do not edit directly)

---

## Configuration Overview

### XWalk Configuration Files

**Edit:** `blocks/<block-name>/_<block-name>.json` (definition, model, filter). **Build output (do not edit):** `component-definition.json`, `component-models.json`, `component-filters.json`. See [AI Governance Rules (Backend)](#ai-governance-rules-backend).

**Reference Examples:**
- Simple block: See `hero` definition in `component-definition.json` (lines 145-159)
- Complex block: See `cards` and `card` definitions in `component-definition.json` (lines 85-114)
- Models: See `hero` model in `component-models.json` (lines 192-217)
- Filters: See `cards` filter in `component-filters.json` (lines 21-26)

### Configuration Flow

```
1. Developer adds block configuration:
   - Create blocks/<block-name>/_<block-name>.json with definition, model, filter
   - Run npm run build:json → root files (component-definition.json, etc.) are updated
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

### Default Content vs Blocks

**Default content** is content an author intuitively puts on a page without additional semantics: text, headings, links, and images. In AEM, this is implemented as components with simple, pre-defined models that serialize to Markdown and HTML.

| Default Component | Model Fields |
|-------------------|--------------|
| **Text** | Rich text (lists, strong, italic) |
| **Title** | Text, type (h1–h6) |
| **Image** | Source, description |
| **Button** | Text, title, url, type (default, primary, secondary) |

**Blocks** require additional semantics and are decorated by JavaScript with stylesheets. Blocks must have explicit models so the authoring UI knows what options to present. Default content is part of the boilerplate; blocks are defined in `component-models.json` and `component-definition.json`.

**Reference:** [Content modeling for AEM authoring projects](https://www.aem.live/developer/component-model-definitions)

---

## Component Definition Structure

**WARNING:** Do not implement custom AEM components. The Edge Delivery Services components provided by AEM are sufficient and offer guard rails. Custom components can break the markup contract between AEM and the delivery tier. Use `core/franklin/components/block/v1/block` and related resource types only.

### Step-by-Step: Adding Configuration to Block-Level JSON

**CRITICAL:** See [AI Governance Rules (Backend)](#ai-governance-rules-backend). Add config to `blocks/<block-name>/_<block-name>.json`; run `npm run build:json`.

#### Step 1: Create Block-Level JSON and Add Definition

**Location:** Create or edit `blocks/<block-name>/_<block-name>.json`. Add the block definition (typically in a `definition` or `component-definition` section, per project convention).

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

**Where to add:** In `blocks/<block-name>/_<block-name>.json`, add the definition object. The build merges it into `component-definition.json` under the `"Blocks"` group's `components` array.

**Example definition (for block-level JSON):**
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

**CRITICAL: Parent Block Configuration**

Parent blocks can have two configurations depending on whether they have authoring fields:

1. **Parent Block WITHOUT Authoring Fields** (container only):
   - Only needs `filter` to define which child components can be nested
   - Example: `cards` block (no parent fields, only contains child `card` items)

2. **Parent Block WITH Authoring Fields** (has configurable fields):
   - **MUST have BOTH `model` AND `filter`**
   - `model` enables authoring fields for the parent block
   - `filter` defines which child components can be nested
   - Example: `projectcards` block (has parent fields: classes, title, heading, description)

**Parent Block Definition (WITH Authoring Fields):**
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
          "model": "parentblock",    // ✅ REQUIRED if parent has authoring fields
          "filter": "parentblock"     // ✅ REQUIRED to allow child items
        }
      }
    }
  }
}
```

**Parent Block Definition (WITHOUT Authoring Fields):**
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
          "filter": "parentblock"     // ✅ Only filter needed (no model)
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
          "model": "item"             // ✅ REQUIRED for child items (defines fields)
        }
      }
    }
  }
}
```

**Both definitions go in the same `components` array**

**Key Points:**
- If parent block has fields in `component-models.json`, it **MUST** have `model` in template
- If parent block has no fields, it only needs `filter` (no `model`)
- Child items always need `model` (they always have fields)
- The `model` value must match the `id` in `component-models.json`

---

## Field Configuration

### Field Definition Basics

Every field object supports these key properties. The `component` and `name` properties are required; others are optional.

| Property | Purpose |
|----------|---------|
| `component` | Defines what kind of UI control to render (see [Field Component Types](#field-component-types) below) |
| `name` | Where the data is stored; must match the structure contract for index-based access |
| `label` | Title shown to the author in the properties panel |
| `description` | Optional description or help text for the author |
| `value` | Default or placeholder value |
| `valueType` | Type of data: `string`, `number`, `boolean`, etc. |
| `required` | When true, field must have a value before save |
| `readOnly` | When true, field is displayed but not editable |
| `hidden` | When true, field is hidden from the author |
| `multi` | When true, allows multiple values (e.g., `reference` for multiple assets) |
| `validation` | Rules for user input (see [Validation Patterns](#validation-patterns) below) |

**Note:** Underscores (`_`) are not allowed in field names for some plugins. Use camelCase (e.g., `imageAlt` not `image_alt`).

**Reference:** [Adobe Experience League — Model Definitions, Fields, and Component Types](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/implementing/developing/universal-editor/field-types)

### Field Component Types

These define how the field is rendered in the Universal Editor properties panel. Each type may offer additional configuration options (e.g., `options` for select, `rootPath` for reference).

| Component Type | Purpose |
|----------------|---------|
| `text` | Single-line text input |
| `richtext` | Rich text editor (bold, links, etc.) |
| `number` | Numeric input |
| `boolean` | True/false toggle (checkbox) |
| `select` | Dropdown with single selection |
| `multiselect` | Dropdown with multiple selection |
| `radio-group` | Single choice among multiple options (radio buttons) |
| `checkbox-group` | Multiple checkboxes |
| `reference` | Asset picker (images, documents, etc.) |
| `aem-content` | Picks any AEM content (pages, assets) |
| `aem-tag` | Tag picker UI |
| `aem-content-fragment` | Content Fragment picker |
| `aem-experience-fragment` | Experience Fragment picker |
| `date-time` | Date and/or time input |
| `container` | Groups nested fields; supports multifields |
| `tab` | Separates fields into tabbed sections in the UI |
| `custom-asset-namespace:custom-asset` | DAM asset picker (project-specific) |

**Commonly used in EDS blocks:** `text`, `richtext`, `reference`, `aem-content`, `select`, `multiselect`, `boolean`, `tab`, `container`

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

### Adding Model to Block-Level JSON

**Location:** Add the model to your block's `blocks/<block-name>/_<block-name>.json` file. The build merges it into `component-models.json`.

**Critical: Field Order Determines HTML Structure**

See [AI Governance Rules (Backend)](#ai-governance-rules-backend). Field at index N → `block.children[N]` in generated HTML. Plan field order to match the index-based access pattern in `decorate()`; document the structure contract in code.

**Critical: Validate Field Order with User-Provided HTML**

See [AI Governance Rules (Backend)](#ai-governance-rules-backend). Obtain user-provided HTML from Universal Editor before frontend work. Do not assume structure matches the model.

**Common Issues to Watch For:**
- **Empty fields may not generate cells:** If a field is empty, AEM may skip generating a cell for it, shifting subsequent field indices
- **Optional fields may not exist:** If a parent block has an optional title field and it's empty, there may be no title row at all
- **Field order may differ:** The actual HTML structure may differ from your model if fields are conditionally rendered

**Example:** If `imageAlt` field is empty, AEM might not generate a cell for it, so:
- Expected: `cells[0]=image, cells[1]=imageAlt, cells[2]=badge`
- Actual: `cells[0]=image, cells[1]=badge` (imageAlt cell missing)

**Solution:** See [AI Governance Rules (Backend)](#ai-governance-rules-backend). Also: [Development Workflow: Backend First, Then User-Provided Semantic HTML](#development-workflow-backend-first-then-user-provided-semantic-html).

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

**Where to add:** In your block's `_<block-name>.json` file. The build merges the model into `component-models.json`.

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

### Multi-Fields and Composite Multi-Fields

Use `multi: true` to allow multiple values for a field. Use a `container` with `multi: true` and nested fields for structured lists.

**Rendering behavior:**
- **Single semantic elements** (plain text, links, images): Rendered as `<ul><li>` list
- **Composite elements** (text + richtext + links): Rendered as flat list with `<hr>` separators

**Examples:**
- `reference` with `multi: true` → Multiple images or assets
- `text` with `multi: true` → Keyword list
- `container` with `multi: true` and nested `reference` + `text` → Image carousel with alt text per item

**Note:** Multi-fields and composite multi-fields may be early-access features. Verify availability in your AEM environment.

**Reference:** [Content modeling for AEM authoring projects](https://www.aem.live/developer/component-model-definitions)

---

## AEM Rendering Mechanics

AEM infers semantics from field values and uses naming conventions to combine fields. Understanding these mechanics helps you design models that produce the expected HTML.

### Type Inference

AEM infers semantic meaning from values:

| Value Type | Inference | Rendered As |
|------------|-----------|-------------|
| **Image reference** | MIME type starts with `image/` | `<picture><img src="..."></picture>` |
| **Link reference** | Non-image ref, or starts with `https?://` or `#` | `<a href="...">...</a>` |
| **Rich text** | Trimmed value starts with `p`, `ul`, `ol`, `h1`–`h6` | Rendered as HTML |
| **Class names** | `classes` property | Block options in table header |
| **Value lists** | Multi-value, first value not above | Comma-separated list |
| **Other** | — | Plain text |

### Field Collapse

Properties ending with `Title`, `Type`, `MimeType`, `Alt`, or `Text` (case sensitive) are collapsed into the preceding property as attributes:

| Base + Suffix | Result |
|---------------|--------|
| `image` + `imageAlt` | Single `<picture>` with `alt` attribute |
| `link` + `linkTitle` + `linkText` + `linkType` | Single `<a>` with title, text, type |
| `heading` + `headingType` | Single `<h2>` (or h1–h6) |

**Example:** `image` and `imageAlt` in the same row produce one cell with `<picture><img src="..." alt="..."></picture>`.

### Element Grouping

Use `groupName_fieldName` (underscore) to group multiple fields into a single cell:

- `teaserText_subtitle`, `teaserText_title`, `teaserText_description` → One cell with combined content
- `classes_background`, `classes_fullwidth` → Block options (e.g., `class="teaser light fullwidth"`)

For block options, `classes` can be boolean (adds property name as class) or text/array.

**Reference:** [Content modeling for AEM authoring projects](https://www.aem.live/developer/component-model-definitions)

---

## Block Structure Variants

### Simple Blocks

One row per field, one or more cells per row. Field order in the model → row order in HTML.

### Key-Value Blocks

Set `key-value: true` for table-like representation (e.g., section metadata). Each row has a key cell and a value cell.

**Example:** Section metadata with `source`, `keywords`, `limit` renders as key-value pairs.

### Container Blocks

Parent block with child items. Parent properties render as rows first; each child is a row with properties as columns.

### Columns Block

**Limitations:** The columns block (`core/franklin/components/columns/v1/columns`) has no content modeling. It only supports `rows`, `columns`, and `classes` (or `classes_*`). You can only add default content (text, title, image, link/button) to cells.

### Sections and Section Metadata

Sections use resource type `core/franklin/components/section/v1/section`. The section model defines section metadata. If the section model is not empty, a key-value metadata block is automatically appended to the section. The default section model ID is `section`; use it to add styles, background image, or other metadata fields.

### Page Metadata

Create a model with ID `page-metadata` for custom page metadata (e.g., theme, custom meta tags). For template-specific metadata, create models named `<template>-metadata` where `template` matches the template metadata property value.

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

### Adding Filters to Block-Level JSON

**Location:** Add the filter to your block's `blocks/<block-name>/_<block-name>.json` file. The build merges it into `component-filters.json`.

**Filter Configuration:**

```json
{
  "id": "parentblock",
  "components": ["item", "linkField"]
}
```

**Where to add:** In your block's `_<block-name>.json` file. The build merges the filter into `component-filters.json`.

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

Add definition, model, and filter to `blocks/<block-name>/_<block-name>.json`. Structure may vary by project; the build merges these into the root files.

**Definition (merged into component-definition.json):**

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

**Model (merged into component-models.json):**

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

**Filter (merged into component-filters.json, if block has nested items):**

```json
{
  "id": "blockname",
  "components": ["item"]
}
```

**After adding config:** Run `npm run build:json` to update the root files.

**Reference:** Check existing blocks for the exact block-level JSON structure used in your project.

---

## Configuration Best Practices

### ✅ XWalk Configuration Best Practices

- ✅ **DO:** Add definitions, models, and filters to block-level JSON (`blocks/<block-name>/_<block-name>.json`)
- ✅ **DO:** Run `npm run build:json` after adding or updating block config
- ✅ **DO:** Use consistent naming between definition ID and model ID
- ✅ **DO:** Add validation rules for user input
- ✅ **DO:** Use reusable models from `models/` directory when possible (copy fields)
- ✅ **DO:** Set appropriate resource types
- ✅ **DO:** Keep JSON syntax valid (use a JSON validator)

### ❌ XWalk Configuration Anti-patterns

- ❌ **DON'T:** Edit `component-definition.json`, `component-models.json`, or `component-filters.json` directly — use block-level JSON and run build
- ❌ **DON'T:** Skip validation rules
- ❌ **DON'T:** Use inconsistent naming between definition ID and model ID
- ❌ **DON'T:** Mix resource types incorrectly
- ❌ **DON'T:** Forget to add all three parts (definition, model, filter if needed)

**Next step:** [Part 3: Frontend Code Generation](#part-3-frontend-code-generation) — generate JavaScript and CSS based on user-provided HTML (after Step 2 is complete).

---

# Part 3: Frontend Code Generation

This section covers all frontend implementation aspects: JavaScript and CSS. HTML is generated automatically by AEM from XWalk configuration. **Do this after Step 2 (user provides semantic HTML).**

**Prerequisites:** [Part 2 (Backend)](#part-2-backend-code-generation) complete; [Step 2: User Provides Semantic HTML](#step-2-user-provides-semantic-html) — user must provide actual HTML from Universal Editor.

---

## Part 3a: Core Concepts

### Frontend Overview

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

1. **Generate Backend Configuration First:**
   - [ ] Add definition, model, and filter to `blocks/<block-name>/_<block-name>.json` (plan field order — this becomes structure contract)
   - [ ] Run `npm run build:json`
   - [ ] Deploy to AEM/Universal Editor

2. **Request User to Provide Semantic HTML (MANDATORY):**
   - [ ] Ask user to author the block in Adobe Universal Editor
   - [ ] User provides the actual generated HTML (from view source or DevTools)
   - [ ] Document structure contract from user-provided HTML (field indices, empty field behavior, etc.)
   - [ ] Do NOT generate HTML — user provides it from Universal Editor

3. **Write JavaScript (based on user-provided HTML):**
   - [ ] Document structure contract in JSDoc (based on user-provided HTML)
   - [ ] Access elements by index based on actual field order from user-provided HTML
   - [ ] Transform to final structure
   - [ ] Add CSS classes to transformed elements
   - [ ] Test with user-provided HTML

4. **Write CSS (based on user-provided HTML):**
   - [ ] Target the transformed structure (after `decorate()` runs)
   - [ ] Use classes added by JavaScript
   - [ ] Test with user-provided HTML to verify styling
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

**Critical: One JS and One CSS per Block — No Duplicates**

Generate **exactly one** JavaScript file and **exactly one** CSS file per block. The file names must match the block folder name exactly (e.g., for `blocks/social-promo/`, use `social-promo.js` and `social-promo.css`).

- ✅ **Correct:** One `social-promo.js` and one `social-promo.css` in `blocks/social-promo/`
- ❌ **Wrong:** Creating both `social-promo.js` and `socialpromo.js`, or both `social-promo.css` and `socialpromo.css` — never create two files with different naming (hyphenated vs non-hyphenated).

**Note:** EDS projects do not use static HTML files. HTML is generated automatically by AEM from the XWalk configuration when content is authored.

**Note:** XWalk configuration is added to block-level JSON files; the build updates root-level files (see Part 2):
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

## Part 3b: JavaScript Implementation

**One JS file per block:** Create only `<block-name>.js` (matching the folder name). Never create two JS files (e.g., `social-promo.js` and `socialpromo.js`).

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
   - **Icons source:** Fetch SVG markup from Figma via Figma MCP; save as `icons/<name>.svg` using the inline SVG format (see [Using Figma MCP Tools](#using-figma-mcp-tools) → Fetch SVG Icons from Figma)

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

**See:** [Critical: Parent-Child Blocks Use ONE Folder](#critical-parent-child-blocks-use-one-folder) for full details.

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

#### Pattern 7: Carousel Block with Swiper

**Use Case:** Blocks with carousel/slider behavior (cards, images, testimonials). Uses Swiper JS loaded via `loadScript()`/`loadCSS()` per EDS practice — no jQuery required.

**EDS-specific requirements:**
- Load Swiper in the block that needs it via `loadScript()`/`loadCSS()` from `scripts/aem.js` — do not add to `head.html`
- Use `moveInstrumentation()` when transforming DOM (preserves AEM authoring)
- Use index-based structure; document structure contract in JSDoc
- Use `createOptimizedPicture()` for images in slides

```javascript
import {
  createOptimizedPicture,
  loadCSS,
  loadScript,
} from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const SWIPER_CSS = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css';
const SWIPER_JS = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js';

/**
 * Structure contract (index-based):
 * - block.children[0+] = Slide item rows (each row = one slide)
 * Each slide row: row.children[0] = image, row.children[1] = title, row.children[2] = description
 *
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 2) return;

  const swiperWrap = document.createElement('div');
  swiperWrap.className = 'swiper blockname-swiper';
  swiperWrap.innerHTML = `
    <div class="swiper-wrapper"></div>
    <button type="button" class="swiper-button-prev blockname-prev" aria-label="Previous slide"></button>
    <button type="button" class="swiper-button-next blockname-next" aria-label="Next slide"></button>
    <div class="blockname-pagination swiper-pagination"></div>
  `;
  const swiperWrapper = swiperWrap.querySelector('.swiper-wrapper');
  const prevButton = swiperWrap.querySelector('.blockname-prev');
  const nextButton = swiperWrap.querySelector('.blockname-next');
  const paginationEl = swiperWrap.querySelector('.blockname-pagination');

  rows.forEach((row) => {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide blockname-slide';
    const imgCell = row?.children?.[0]?.querySelector?.('picture, img');
    const img = imgCell?.tagName === 'IMG' ? imgCell : imgCell?.querySelector?.('img');
    const src = img?.src || img?.getAttribute?.('src') || '';
    const alt = img?.alt || img?.getAttribute?.('alt') || '';
    const title = row?.children?.[1]?.textContent?.trim() ?? '';
    const desc = row?.children?.[2]?.textContent?.trim() ?? '';
    if (src) {
      const pic = createOptimizedPicture(src, alt, false, [{ width: '440' }, { width: '880' }]);
      slide.appendChild(pic);
    }
    if (title) {
      const h3 = document.createElement('h3');
      h3.className = 'blockname-slide-title';
      h3.textContent = title;
      slide.appendChild(h3);
    }
    if (desc) {
      const p = document.createElement('p');
      p.className = 'blockname-slide-desc';
      p.textContent = desc;
      slide.appendChild(p);
    }
    moveInstrumentation(row, slide);
    swiperWrapper.appendChild(slide);
  });

  moveInstrumentation(block, swiperWrap);
  block.replaceChildren(swiperWrap);

  await Promise.all([
    loadCSS(SWIPER_CSS),
    loadScript(SWIPER_JS),
  ]);

  const Swiper = globalThis.Swiper;
  if (!Swiper) return;

  const swiper = new Swiper(swiperWrap, {
    grabCursor: true,
    spaceBetween: 24,
    navigation: {
      nextEl: nextButton,
      prevEl: prevButton,
    },
    pagination: {
      el: paginationEl,
      type: 'fraction',
      clickable: true,
    },
    breakpoints: {
      390: { slidesPerView: 1, slidesPerGroup: 1, spaceBetween: 16 },
      768: { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 24 },
      1280: { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 24 },
      1920: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: 32 },
    },
  });
}
```

**Key Points:**
- Load Swiper via `loadScript()`/`loadCSS()` in the block — EDS pattern for third-party libs
- Swiper is vanilla JS (no jQuery required)
- Use `moveInstrumentation()` when transforming DOM
- Responsive breakpoints match common EDS viewports (390, 768, 1280, 1920)
- Use `createOptimizedPicture()` for slide images (EDS performance)

**Reference:** `blocks/featurecardscarousel/featurecardscarousel.js`

### Carousel Component Snippets (Swiper)

Reusable Swiper configuration snippets for EDS carousel blocks. Adapt to your block structure and naming.

#### Snippet: Load Swiper (EDS Pattern)

```javascript
import { loadCSS, loadScript } from '../../scripts/aem.js';

const SWIPER_CSS = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css';
const SWIPER_JS = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js';

// In decorate():
await Promise.all([
  loadCSS(SWIPER_CSS),
  loadScript(SWIPER_JS),
]);

const Swiper = globalThis.Swiper;
if (!Swiper) return;
```

#### Snippet: Swiper Config (EDS Breakpoints)

```javascript
const swiper = new Swiper(swiperWrap, {
  grabCursor: true,
  spaceBetween: 24,
  navigation: {
    nextEl: nextButton,
    prevEl: prevButton,
  },
  pagination: {
    el: paginationEl,
    type: 'fraction',
    clickable: true,
  },
  breakpoints: {
    390: { slidesPerView: 1, slidesPerGroup: 1, spaceBetween: 16 },
    768: { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 24 },
    1280: { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 24 },
    1920: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: 32 },
  },
});
```

#### Snippet: Swiper HTML Structure (EDS)

```html
<!-- Build in JS; Swiper expects this structure -->
<div class="swiper blockname-swiper">
  <div class="swiper-wrapper">
    <div class="swiper-slide blockname-slide">...</div>
    <div class="swiper-slide blockname-slide">...</div>
  </div>
  <button type="button" class="swiper-button-prev blockname-prev" aria-label="Previous slide"></button>
  <button type="button" class="swiper-button-next blockname-next" aria-label="Next slide"></button>
  <div class="blockname-pagination swiper-pagination"></div>
</div>
```

#### Snippet: Slide Change Handler (Sync Content)

For blocks that sync content (e.g. center image) when slide changes:

```javascript
swiper.on('slideChange', () => {
  const idx = swiper.activeIndex;
  const slide = swiper.slides[idx];
  const img = centerImageWrap.querySelector('img');
  if (slide?.dataset?.centerImage && img) {
    img.src = slide.dataset.centerImage;
    img.alt = slide.dataset.centerImageAlt || '';
  }
});

// Click on slide to go to
swiperWrap.querySelectorAll('.blockname-slide').forEach((el, idx) => {
  el.addEventListener('click', () => swiper.slideTo(idx));
});
```

#### Snippet: Autoplay (Configurable Delay)

```javascript
// carouselLagSec from authoring (e.g. 1–5, default 4)
const carouselLagSec = Math.min(5, Math.max(1, Number.parseInt(getText(rows[9]?.children?.[0]) || '4', 10) || 4));

const swiper = new Swiper(swiperWrap, {
  // ... other options
  autoplay: {
    delay: carouselLagSec * 1000,
    disableOnInteraction: false,
  },
});
```

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

**Solution:** Add block definition, model, and filter to `blocks/<block-name>/_<block-name>.json`, then run `npm run build:json`.

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

## Part 3c: CSS Implementation

**One CSS file per block:** Create only `<block-name>.css` (matching the folder name). Never create two CSS files (e.g., `social-promo.css` and `socialpromo.css`).

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
- Always verify image dimensions match design specifications (from Figma or design images)

---

## Part 3d: HTML Implementation

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

## Part 3e: Best Practices and Reference

### Frontend Best Practices

#### ✅ JavaScript Best Practices

- ✅ **DO:** Use ES6+ module syntax, import from `shared-components/`
- ✅ **DO:** Use **index-based selection only**: access elements by position (e.g. `block.children[0]`, `row.children[1]`). Do not use data attributes for structure or selection.
- ✅ **DO:** Document the **structure contract** (which index = which content) in the block’s `decorate()` JSDoc.
- ✅ **DO:** Use optional chaining (`?.`) and nullish coalescing (`??`) for index-based access.
- ✅ **DO:** Use `moveInstrumentation()` when replacing or moving elements.
- ✅ **DO:** Make `decorate()` async if loading external resources.
- ✅ **DO:** Preserve semantic HTML structure.

#### ❌ JavaScript Anti-patterns

- ❌ **DON'T:** Use `data-aue-*` or `data-gen-*` (or any data attributes) for selecting or identifying block content; use index-based access only.
- ❌ **DON'T:** Use global variables, skip error handling, or mutate shared components.
- ❌ **DON'T:** Access `children[index]` without null checks or forget `moveInstrumentation()` when transforming DOM.
- ❌ **DON'T:** Block main thread or use sync operations for external resources.

#### ✅ CSS Best Practices

- ✅ **DO:** Style the **transformed structure** (after JavaScript `decorate()` runs)
- ✅ **DO:** Use classes added by JavaScript during transformation
- ✅ **DO:** Use block-specific class names
- ✅ **DO:** Follow responsive design patterns
- ✅ **DO:** Use CSS variables for theming
- ✅ **DO:** Keep styles scoped to block

#### ❌ CSS Anti-patterns

- ❌ **DON'T:** Style the initial AEM-generated HTML structure directly
- ❌ **DON'T:** Rely on the raw AEM HTML structure (it's just data, not presentation)
- ❌ **DON'T:** Use overly specific selectors
- ❌ **DON'T:** Hardcode colors/values
- ❌ **DON'T:** Skip responsive breakpoints

#### ✅ HTML Best Practices

- ✅ **DO:** Match the **index-based structure contract** (same row/cell order as in the block’s JS).
- ✅ **DO:** Use **semantic HTML** only; do **not** use data attributes for structure.
- ✅ **DO:** Keep a fixed, documented order of rows and cells so index-based selection is reliable.
- ✅ **DO:** Test in local development environment.

---

# Appendices

## Appendix A: EDS Performance & Lighthouse Best Practices

This section provides EDS-specific performance guidelines to achieve and maintain excellent Lighthouse scores. **Every EDS site can and should achieve a Lighthouse score of 100** when following these best practices.

### Performance Goals

| Metric | Target | Notes |
|--------|--------|-------|
| **Lighthouse Score** | 100 (Mobile & Desktop) | EDS architecture is designed for this |
| **LCP** (Largest Contentful Paint) | < 2.5s | Critical for above-the-fold content |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Avoid layout shifts during load |
| **INP** (Interaction to Next Paint) | < 200ms | Responsive user interactions |
| **Pre-LCP Payload** | < 100kb | Keeps LCP under ~1560ms for PSI 100 |

**Reference:** [Web Performance, Keeping your Lighthouse Score 100](https://aem.live/developer/keeping-it-100) — Adobe's official EDS performance guide

### EDS Architecture Principles

1. **Server-Side Rendering First**
   - All canonical content is rendered into markup on the server
   - CSS and DOM are used only for display and accessibility semantics
   - Client-side rendering (fetch JSON, render on client) is **only** for non-canonical content (e.g., blocks listing other pages, dynamic blocks)

2. **Minimal Redundant Content**
   - Headers, footers, and fragments used redundantly are **not** in the critical path markup
   - Redundant content slows LCP and introduces blocking time (TBT → INP)


**Reference:** [Keeping It 100](https://aem.live/developer/keeping-it-100) | [PageSpeed Insights](https://pagespeed.web.dev/)

### Three-Phase Loading (E-L-D)

EDS uses a three-phase loading model. **Block development must align with these phases:**

| Phase | Name | Contents | Block Guidelines |
|-------|------|----------|------------------|
| **E** | Eager | Everything needed for LCP | Hero/first-section blocks only; keep first section minimal |
| **L** | Lazy | Remaining sections, blocks, images | Most blocks load here; use `loading="lazy"` for images |
| **D** | Delayed | Third-party tags, analytics, chat | Start ≥3s after LCP; use `delayed.js` |

**Block-Specific Rules:**
- **First section blocks:** Minimize JS/CSS payload; LCP candidate (usually first image) must load quickly
- **Below-fold blocks:** Load in Lazy phase; avoid blocking main thread
- **Images:** Use `createOptimizedPicture()` and `loading="lazy"` for non-LCP images
- **Fonts:** Load **after** LCP; use [font fallback](https://www.aem.live/developer/font-fallback) to avoid CLS

**Reference:** [Keeping It 100 - Three-Phase Loading](https://aem.live/developer/keeping-it-100) | [Markup, Sections, Blocks](https://www.aem.live/developer/markup-sections-blocks)

### LCP Optimization Guidelines

- **LCP candidate:** Usually the hero image at the top of the page
- **Payload budget:** Keep aggregate payload before LCP < 100kb (mobile bandwidth-constrained)
- **Single origin:** Avoid connecting to a second origin before LCP (TLS/DNS adds delay)
- **LCP in blocks:** If LCP is in a block, ensure block `.js` and `.css` are minimal; fewer blocks in first section = faster LCP
- **Dual hero images:** If desktop/mobile have different hero images, remove the unnecessary one from DOM to avoid loading both

**Dual hero images snippet** — remove the non-visible image to avoid loading both:

```javascript
// Hero block with desktop + mobile images: keep only the visible one
const isDesktop = window.matchMedia('(min-width: 900px)');
const desktopImg = block.querySelector('.hero-image-desktop');
const mobileImg = block.querySelector('.hero-image-mobile');

if (isDesktop.matches && mobileImg) {
  mobileImg.remove();  // Don't load mobile image on desktop
} else if (!isDesktop.matches && desktopImg) {
  desktopImg.remove();  // Don't load desktop image on mobile
}
```

**Reference:** [Core Web Vitals](https://web.dev/explore/learn-core-web-vitals) | [Lighthouse Performance](https://developer.chrome.com/docs/lighthouse/performance)

### Block Implementation Checklist for Performance

| Practice | Description |
|----------|-------------|
| ✅ Use `createOptimizedPicture()` | For all images; provides responsive srcset and optimization |
| ✅ Add `loading="lazy"` | For images below the fold (non-LCP) |
| ✅ Keep block JS small | Avoid heavy frameworks; use vanilla JS or lightweight patterns |
| ✅ Load external content async | Use `async/await`; don't block decorate |
| ✅ Debounce resize/scroll handlers | Reduce main-thread work |
| ✅ Use `moveInstrumentation()` | Preserves authoring; no extra DOM cost |
| ❌ Avoid Early Hints / h2-push / preconnect for LCP | Consumes bandwidth budget; can hurt LCP |
| ❌ Avoid second-origin requests before LCP | Single origin for critical path |
| ❌ Avoid blocking scripts | Load third-party in Delayed phase |

### Code Snippets for Each Best Practice

#### ✅ Use `createOptimizedPicture()` for all images

```javascript
import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

// In decorate(): replace raw img/picture with optimized version
const pictureOrImg = imageCell?.querySelector?.('picture, img');
if (pictureOrImg) {
  const img = pictureOrImg.tagName === 'IMG' ? pictureOrImg : pictureOrImg.querySelector('img');
  if (img) {
    const optimizedPic = createOptimizedPicture(
      img.src,
      altText,
      false,  // eager=false → loading="lazy" for below-fold
      [{ width: '440' }, { width: '880' }]
    );
    moveInstrumentation(pictureOrImg, optimizedPic);
    pictureOrImg.replaceWith(optimizedPic);
  }
}
```

#### ✅ Add `loading="lazy"` for non-LCP images

```javascript
// createOptimizedPicture(src, alt, eager, breakpoints)
// eager=false → img gets loading="lazy" (default)
// eager=true  → img gets loading="eager" (use ONLY for LCP hero image)

// Below-fold / card images: use lazy (default)
const optimizedPic = createOptimizedPicture(imgSrc, altText, false, [{ width: '750' }]);

// LCP hero image (first section, first image): use eager
const heroPic = createOptimizedPicture(heroSrc, heroAlt, true, [{ width: '1440' }, { width: '750' }]);
```

#### ✅ Load external content async

```javascript
import { loadFragment } from '../fragment/fragment.js';

export default async function decorate(block) {
  const path = block.querySelector('a')?.getAttribute('href') || block.textContent.trim();
  try {
    const fragment = await loadFragment(path);
    if (fragment) {
      block.replaceChildren(...fragment.childNodes);
    }
  } catch (err) {
    console.warn(`Failed to load fragment: ${path}`, err);
  }
}
```

#### ✅ Debounce resize/scroll handlers

```javascript
function debounce(fn, delay = 150) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

export default function decorate(block) {
  const handleResize = () => { /* update layout */ };
  const debouncedResize = debounce(handleResize, 150);

  window.addEventListener('resize', debouncedResize);
  // Or: isDesktop.addEventListener('change', debouncedResize);
}
```

#### ✅ Use `moveInstrumentation()` when transforming DOM

```javascript
import { moveInstrumentation } from '../../scripts/scripts.js';

// When replacing an element, preserve AEM authoring attributes
const newButton = document.createElement('a');
newButton.href = ctaLink;
newButton.textContent = ctaText;
moveInstrumentation(ctaLinkCell, newButton);  // Preserves data-aue-* etc.
ctaLinkCell.replaceWith(newButton);

// When moving children to a new container
const container = document.createElement('div');
moveInstrumentation(block, container);
while (block.firstElementChild) container.append(block.firstElementChild);
block.replaceChildren(container);
```

#### ✅ Keep block JS small — vanilla JS, no heavy frameworks

```javascript
// ✅ Good: lightweight, framework-agnostic
export default function decorate(block) {
  const rows = [...block.children];
  const container = document.createElement('div');
  rows.forEach((row, i) => {
    const item = document.createElement('div');
    item.classList.add(`item-${i}`);
    moveInstrumentation(row, item);
    while (row.firstElementChild) item.append(row.firstElementChild);
    container.appendChild(item);
  });
  block.replaceChildren(container);
}

// ❌ Avoid: heavy framework imports for simple blocks
// import React from 'react';  // Don't add React/Vue for block logic
```

#### ❌ Avoid second-origin requests before LCP

```javascript
// ❌ Bad: fetch from external API before LCP
export default async function decorate(block) {
  const data = await fetch('https://external-api.com/data').then(r => r.json());
  block.innerHTML = renderFromData(data);
}

// ✅ Good: use same-origin fragment or server-rendered content
export default async function decorate(block) {
  const path = block.querySelector('a')?.getAttribute('href');
  const fragment = await loadFragment(path);  // Same origin
  if (fragment) block.replaceChildren(...fragment.childNodes);
}
```

#### ❌ Avoid blocking scripts — load third-party in Delayed phase

```javascript
// ❌ Bad: blocking script in block
export default function decorate(block) {
  const script = document.createElement('script');
  script.src = 'https://third-party.com/widget.js';
  script.async = false;  // Blocking!
  document.head.appendChild(script);
}

// ✅ Good: use delayed.js or load after LCP (≥3s delay)
// In delayed.js:
// loadScript('https://third-party.com/widget.js');
```

### Common Performance Anti-Patterns (Avoid)

| Anti-Pattern | Impact | Fix |
|--------------|--------|-----|
| Early hints / h2-push / preconnect for non-LCP resources | Consumes 100kb budget; hurts LCP | Remove; load after LCP |
| Redirects for path resolution | Penalty per redirect | Use canonical URLs; avoid redirect chains |
| CDN client scripts injection | Blocking before LCP | Disable or load in Delayed phase |
| Heavy JavaScript frameworks | Increases TBT, hurts INP | Use lightweight, framework-agnostic code |
| Preloading fonts | Delays LCP | Load fonts after LCP; use font fallback |

**Snippet — avoid font preload in critical path:**

```html
<!-- ❌ Bad: preload consumes LCP budget -->
<link rel="preload" href="https://fonts.adobe.com/..." as="font" crossorigin>

<!-- ✅ Good: fonts load after LCP; use font fallback to avoid CLS -->
<!-- See: https://www.aem.live/developer/font-fallback -->
```

### Key Reference Links

| Resource | URL |
|----------|-----|
| **Keeping It 100** (Adobe EDS performance guide) | https://aem.live/developer/keeping-it-100 |
| **Core Web Vitals** | https://web.dev/explore/learn-core-web-vitals |
| **EDS Markup, Sections, Blocks** | https://www.aem.live/developer/markup-sections-blocks |
| **EDS Font Fallback** | https://www.aem.live/developer/font-fallback |
| **EDS Developer Tutorial** | https://aem.live/developer/tutorial |
---

## Appendix B: Adobe FE EDS Recommended Practices (Block Creation)

Adobe recommendations that directly help when creating blocks. **Reference:** [Block Collection](https://aem.live/developer/block-collection), [dev-collab-and-good-practices](https://aem.live/docs/dev-collab-and-good-practices), [Universal Editor Blocks](https://aem.live/developer/universal-editor-blocks)

### Block Technical Principles

| Principle | Description |
|-----------|-------------|
| **SEO and A11y** | SEO-friendly and accessible |
| **Fast** | No negative performance impact |
| **Localizable** | No hard-coded content; strings from content |
| **Context Aware** | Inherits CSS context (text, background colors) |
| **Responsive** | Works across all breakpoints |
| **Usable** | No dependencies; compatible with boilerplate |
| **Intuitive** | Content structure that's easy to author |

### Three-Phased Block Development

1. **Implement decoration and styles** for the new block
2. **Create content** with the new block (in Universal Editor)
3. **Create definition and model**, review, and bring to production

### CSS for Blocks

| Practice | Description |
|----------|-------------|
| **Block isolation** | Every selector in block `.css` applies only within the block |
| **Prefix private classes** | Prefix block-private classes/variables with block name |
| **Avoid complex selectors** | Prefer extra classes over complex selectors |
| **Use ARIA for styling** | Use ARIA attributes (`expanded`, `hidden`) instead of redundant classes |
| **Mobile first** | Base CSS = mobile; add media queries for larger viewports |
| **Breakpoints** | Use `600px`, `900px`, `1200px` (min-width) |

### JavaScript for Blocks

| Practice | Description |
|----------|-------------|
| **Avoid frameworks for layout** | Keep simple blocks simple; frameworks add LCP/TBT issues |
| **Load 3rd party via `loadScript()`** | Don't add libs in `head.html`; load in the block that needs it |
| **IntersectionObserver for heavy libs** | Load large 3rd party libs only when block scrolls into view |
| **Don't modify `aem.js`** | Keep extensions outside the library |

### Content for Blocks

| Practice | Description |
|----------|-------------|
| **Strings from content** | User-facing strings should be authorable (placeholders); no hard-coded literals |
| **Backwards compatibility** | New content structure changes should not break existing content |

### References

- [Block Collection](https://aem.live/developer/block-collection) | [dev-collab-and-good-practices](https://aem.live/docs/dev-collab-and-good-practices) | [Universal Editor Blocks](https://aem.live/developer/universal-editor-blocks)

**Next step:** [Implementation Checklist](#implementation-checklist) — validate and deploy.

---

## Development Workflow

### Complete Workflow

1. **Requirements Gathering** → Gather design source, story requirements, and design specifications (Pre-Implementation)
   - Request Figma design URL OR component design images (desktop, tablet, mobile)
   - Request story/requirements document
   - Use Figma MCP tools (if Figma URL) or analyze design images to extract specifications
   - Analyze design and map to implementation plan

2. **Backend Configuration (Generate First)** → Add definitions/models/filters to block-level JSON, run build (Part 2)
   - Add definition, model, and filter to `blocks/<block-name>/_<block-name>.json`
   - Run `npm run build:json` to update root files
   - Deploy to AEM/Universal Editor environment

3. **Request User to Provide Semantic HTML (MANDATORY)** → User authors in Universal Editor and provides HTML
   - **Prompt user:** "Please author the block in Adobe Universal Editor with sample content, then provide the semantic HTML output."
   - User adds block to page, configures fields, extracts HTML (view source or DevTools)
   - User provides the actual Universal Editor–generated HTML to Cursor
   - Document structure contract from user-provided HTML
   - **Do NOT generate HTML** — Cursor-generated HTML can differ from Universal Editor output

4. **JavaScript** → Implement block logic (`<block-name>.js`) based on user-provided HTML (Part 3)
   - Analyze user-provided HTML to document structure contract
   - Write `decorate()` function using index-based access matching actual DOM
   - Test with user-provided HTML

5. **CSS** → Style the block (`<block-name>.css`) based on user-provided HTML (Part 3)
   - Target the transformed structure
   - Test with user-provided HTML to verify styling

6. **Component Registration** → Verify JSON syntax and configuration (Part 2)
   - Validate JSON syntax
   - Verify component registration

7. **AEM/Universal Editor Validation** → Test in authoring interface
   - Test in AEM/Universal Editor authoring interface
   - Verify content renders correctly

---

## Implementation Checklist

### Phase 0: Pre-Implementation - Requirements Gathering (MANDATORY)
- [ ] Request and receive design source: Figma design URL OR component design images (desktop, tablet, mobile)
- [ ] Request and receive story/requirements document
- [ ] Use Figma MCP tools (if Figma URL) or analyze design images to extract specifications
- [ ] Analyze component structure from design (Figma or images)
- [ ] Extract design tokens (colors, typography, spacing)
- [ ] Map design elements to HTML structure
- [ ] Map design styles to CSS properties
- [ ] Identify content fields needed for XWalk configuration
- [ ] Identify similar blocks in codebase for reference
- [ ] Document breakpoint requirements
- [ ] Document accessibility requirements
- [ ] Create implementation plan based on design + requirements

### Step 2: User Provides Semantic HTML (MANDATORY)

**Execute this step AFTER Step 1 (Backend) is complete and deployed.**

**See:** [Step 2: User Provides Semantic HTML](#step-2-user-provides-semantic-html) (standalone section above) for context.

**Objective:** Obtain the actual HTML structure from Adobe Universal Editor. Do NOT generate HTML — user-provided HTML ensures correct DOM structure.

**Steps:**
1. **Prerequisite: Backend configuration is complete:**
   - [ ] Backend files (component-definition.json, component-models.json, component-filters.json) are generated
   - [ ] Block is deployed to AEM/Universal Editor environment

2. **Request user to provide semantic HTML:**
   - [ ] Prompt user: "Please author the block in Adobe Universal Editor with sample content, then provide the semantic HTML output."
   - [ ] User adds block to page in Universal Editor
   - [ ] User configures all fields (including empty/optional where relevant)
   - [ ] User adds multiple items if parent-child block
   - [ ] User extracts HTML (view source or DevTools) and provides to Cursor

3. **Analyze user-provided HTML:**
   - [ ] Document structure contract: which fields generate rows vs cells
   - [ ] Document field indices (0, 1, 2, etc.)
   - [ ] Document empty field behavior (missing cells vs empty cells)
   - [ ] Document optional field behavior (parent title, etc.)

4. **Use for frontend development:**
   - [ ] Generate JavaScript based on user-provided HTML structure
   - [ ] Generate CSS based on user-provided HTML structure
   - [ ] Test with user-provided HTML

**Important:**
- Do NOT generate static HTML — Cursor-generated HTML can differ from Universal Editor output
- User-provided HTML is the source of truth for DOM structure

### Phase 1: Backend - XWalk Configuration (MANDATORY)
**Note:** EDS projects do not use static HTML files. HTML is generated automatically by AEM from XWalk configuration.
- [ ] Use **index-based structure only** (no data attributes); match row/cell order to the block’s structure contract
- [ ] Use semantic HTML; document index contract in block JS
- [ ] Test visual appearance

### Phase 2: Backend - XWalk Configuration (MANDATORY)
- [ ] **Create block-level JSON** — add config to `blocks/<block-name>/_<block-name>.json`
- [ ] Add component definition (in block-level JSON)
  - [ ] Set `title`, `id`, `resourceType`, and `template` properties
- [ ] Add model (in block-level JSON)
  - [ ] Set `id` to match definition ID
  - [ ] Add `fields` array with field definitions
  - [ ] Add validation rules where needed
- [ ] Add filter (in block-level JSON, if block has nested items)
  - [ ] Set `id` to match parent block ID
  - [ ] Set `components` array with allowed child component IDs
- [ ] **Run `npm run build:json`** to merge block config into root files
- [ ] Validate JSON syntax (use JSON validator or ESLint)
- [ ] Ensure field order in model matches expected JavaScript index-based access pattern

### Phase 2: Frontend - JavaScript Implementation
- [ ] **Use user-provided semantic HTML to validate structure before coding**
- [ ] Create `blocks/<block-name>/<block-name>.js` (ONE file only — never create two JS files with different naming, e.g., social-promo.js and socialpromo.js)
- [ ] Export default `decorate(block)` function
- [ ] Document **structure contract** (index = meaning) in JSDoc based on user-provided HTML
- [ ] Import shared components as needed
- [ ] Extract data using **index-based access only** (e.g. `block.children[0]`, `row.children[1]`)
   - [ ] Use field indices from user-provided HTML (not assumed indices)
   - [ ] Account for empty fields that don't generate cells
   - [ ] Handle optional fields (e.g., parent title may not exist)
- [ ] **For parent-child blocks:** Process parent row (index 0) and child item rows (index 1+) in the same `decorate()` function
   - [ ] Check if first row is actually title or first item (if title is optional)
- [ ] Transform to final HTML structure
- [ ] Use `moveInstrumentation()` when replacing or moving elements
- [ ] **NEVER** use `data-aue-*` or `data-gen-*` attributes for element identification
- [ ] **Run `npm run build:json`** after adding/updating block config (root files are build outputs)
- [ ] **NEVER** create separate child block folders or files — see [Critical: Parent-Child Blocks Use ONE Folder](#critical-parent-child-blocks-use-one-folder)
- [ ] **Test with user-provided HTML** to verify extraction logic works correctly

### Phase 3: Frontend - CSS Styling
- [ ] Create `blocks/<block-name>/<block-name>.css` (ONE file only — never create two CSS files with different naming, e.g., social-promo.css and socialpromo.css)
- [ ] Style block structure (parent container and child items in same file)
- [ ] Add responsive breakpoints
- [ ] **Test with user-provided HTML** to verify styling works correctly
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
   - Request Figma URL OR component design images (desktop, tablet, mobile) and story requirements
   - Use Figma MCP tools (if Figma URL) or analyze design images to extract specifications
   - Analyze design and create implementation plan
2. Review similar blocks in codebase
3. Identify reusable components/models
4. Plan block structure (Part 3)
5. Plan XWalk field requirements (Part 2)

### During Implementation
1. Verify XWalk JSON syntax (use ESLint) (Part 2)
2. Verify field order in XWalk model matches expected JavaScript access pattern (Part 2)
3. Test JavaScript in browser console (Part 3)
4. Test CSS in AEM authoring mode (Part 3)

### Post-Implementation
1. Verify JSON syntax is valid in all three configuration files (Part 2)
2. Verify component registration (Part 2)
   - Check definition in `component-definition.json`
   - Check model in `component-models.json`
   - Check filter in `component-filters.json` (if applicable)
3. Test in AEM authoring interface
4. Verify responsive behavior (Part 3)
5. Verify accessibility (Part 3)

---

## Appendix D: Common Issues and Solutions

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
- **See:** [Anti-Pattern 1: Skipping Instrumentation Preservation](#-anti-pattern-1-skipping-instrumentation-preservation)
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
- Use **index-based access only**: `block.children[0]`, `row.children[1]`, etc. (see Part 2: Index-Based Structure and Data Extraction)
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safe index access
- **MANDATORY:** Use user-provided HTML from Universal Editor to verify field order and indices
- Verify XWalk config field order matches actual HTML structure (not assumed structure)
- Account for empty fields that don't generate cells (may shift indices)
- Handle optional fields that may not exist (e.g., parent title)
- Ensure DOM structure order matches the structure contract documented in the block's JS (based on actual HTML)

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
- Verify dimensions match design specifications (from Figma or design images)
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

#### Issue 11: Parent Block Authoring Fields Not Appearing
**Symptom:** Parent block appears in AEM authoring interface, but no authoring fields are shown (e.g., section title field is missing).

**Root Cause:** Parent block template is missing `model` property. Parent blocks with authoring fields require BOTH `model` and `filter` in the template.

**Solution:**
- **CRITICAL:** If parent block has fields defined in `component-models.json`, the parent block template MUST include `model` property
- Parent blocks with authoring fields need BOTH:
  - `model: "parentblock"` - Enables authoring fields for parent block
  - `filter: "parentblock"` - Allows child items to be nested
- Parent blocks without authoring fields only need `filter` (no `model`)
- Verify `model` value matches the `id` in `component-models.json`
- **Reference:** See "Block with Items (Parent + Child)" section above for complete examples
- **Working Example:** `component-definition.json` lines 325-339 (`projectcards` - has both `model` and `filter`)

**Example Fix:**
```json
// ❌ WRONG (missing model):
"template": {
  "name": "RelatedCards",
  "filter": "relatedcards"
}

// ✅ CORRECT (has both model and filter):
"template": {
  "name": "RelatedCards",
  "model": "relatedcards",    // ✅ Required for parent authoring fields
  "filter": "relatedcards"     // ✅ Required for child items
}
```

---

## Considerations

### UX Considerations
- Provide clear field labels in XWalk config (Part 2)
- Use appropriate field types (text, richtext, select) (Part 2)
- Add helpful validation messages (Part 2)
- Group related fields using tabs (Part 2)

### Performance Considerations
- **See:** [EDS Performance & Lighthouse Best Practices](#eds-performance--lighthouse-best-practices) for full guidelines
- Blocks load asynchronously via `loadBlock()` (Part 3)
- CSS and JS loaded on demand (Part 3)
- Use `createOptimizedPicture()` and `loading="lazy"` for images (Part 3)
- Keep pre-LCP payload < 100kb; first section blocks must be minimal (Part 3)
- Use `async/await` for external resource loading (Part 3)
- Debounce resize/scroll event handlers when needed (Part 3)
- Avoid blocking the main thread; align with E-L-D loading phases (Part 3)
- Run PageSpeed Insights on PRs; target Lighthouse score 100 (Part 3)

### Security Considerations
- Sanitize HTML input (use `stringToHTML()`) (Part 3)
- Validate field input via XWalk validation (Part 2)
- Reference: `shared-components/Utility.js` (sanitizeHTMLString) (Part 3)

### Accessibility Considerations
- Use semantic HTML elements (Part 3)
- Provide alt text for images (Part 3)
- Maintain heading hierarchy (Part 3)
- Ensure keyboard navigation (Part 3)

---

## Appendix C: Key References

### Primary Documentation (Backend / Content Modeling)

| Document | URL |
|----------|-----|
| **Model Definitions, Fields, and Component Types** (Experience League) | https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/implementing/developing/universal-editor/field-types |
| **Content modeling for AEM authoring projects** (AEM.live) | https://www.aem.live/developer/component-model-definitions |

### Content Modeling (AEM Authoring)
- **[Model Definitions, Fields, and Component Types](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/implementing/developing/universal-editor/field-types)** — Field types, component types, model linking, loading models
- **[Content modeling for AEM authoring projects](https://www.aem.live/developer/component-model-definitions)** — Type inference, field collapse, element grouping, multi-fields, block structure variants
- **[Block Collection](https://aem.live/developer/block-collection)** — Content models for common UI patterns; reference for semantic content modeling
- **David's Model** — Content modeling guidance for content-source-agnostic blocks (see Block Collection and AEM authoring docs)

### Performance & Lighthouse (EDS)
- **[Keeping It 100](https://aem.live/developer/keeping-it-100)** — Adobe's official EDS performance guide
- **[PageSpeed Insights](https://pagespeed.web.dev/)** — Lab testing for Lighthouse scores
- **[Core Web Vitals](https://web.dev/explore/learn-core-web-vitals)** — LCP, CLS, INP metrics
- **[EDS Markup, Sections, Blocks](https://www.aem.live/developer/markup-sections-blocks)** — Loading sequence and block structure

### Adobe FE EDS (Block Creation)
- **[Block Collection](https://aem.live/developer/block-collection)** — Technical principles for blocks
- **[dev-collab-and-good-practices](https://aem.live/docs/dev-collab-and-good-practices)** — CSS, JS, content guidelines
- **[Universal Editor Blocks](https://aem.live/developer/universal-editor-blocks)** — Three-phased development

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
- `blocks/<block-name>/_<block-name>.json` - Block config (edit this; run build to update root files)
- `component-definition.json` - Component definitions (build output; do not edit directly)
- `component-models.json` - Field models (build output; do not edit directly)
- `component-filters.json` - Nesting rules (build output; do not edit directly)
- `models/` - Reusable field definitions (reference for copying fields)

---

## Next Steps

1. **Review this guide** - Start with Part 1 for backend, Part 2 for frontend
2. **Gather design source** - Request Figma URL OR component design images (desktop, tablet, mobile); Cursor can generate code from either
3. **Study similar blocks** - Reference examples provided in each section
4. **Use AI codebase analysis** - Cursor can analyze existing blocks for patterns
5. **Follow checklist** - Use the implementation checklist step by step
6. **Request user to provide semantic HTML** - User authors in Universal Editor and provides HTML; generate JS/CSS based on it (MANDATORY)
7. **Reference existing code** - Rather than creating from scratch

---

**Document Version:** EDS-2026.1.0  
**Last Updated:** 2026-02-25  
**Maintained By:** AI Documentation Engineer  
**Review Status:** Ready for Use

---

## Summary

This implementation guide provides comprehensive step-by-step instructions for creating new EDS blocks. Key points:

1. **Two files required per block:** JavaScript and CSS (in `blocks/<block-name>/`)
   - **CRITICAL:** Even for parent-child blocks, use ONE folder with ONE JS file and ONE CSS file
   - Parent and child items are processed in the same `decorate()` function
   - Example: `blocks/cards/` handles both parent container and all child card items
2. **XWalk configuration:** Add definitions/models/filters to block-level JSON (`blocks/<block-name>/_<block-name>.json`), run `npm run build:json` to update:
   - `component-definition.json` - Component definitions (build output)
   - `component-models.json` - Field models (build output)
   - `component-filters.json` - Nesting rules (build output)
3. **User-provided semantic HTML (MANDATORY):** See [Step 2: User Provides Semantic HTML](#step-2-user-provides-semantic-html) and [Development Workflow: Backend First, Then User-Provided Semantic HTML](#development-workflow-backend-first-then-user-provided-semantic-html).
4. **Index-based implementation:** Use index-based selection only; no data attributes for structure or selection. Document the structure contract in block JS based on actual HTML structure.
5. **Critical utility:** Always use `moveInstrumentation()` when transforming DOM
6. **Testing:** Test with user-provided HTML first, then manual testing in browser and AEM authoring interface
7. **Patterns:** Follow established patterns from existing blocks

**CRITICAL:** 
- Use block-level JSON files (`blocks/<block-name>/_<block-name>.json`). Run `npm run build:json` to update the three root-level files. Do NOT edit root files directly.
- Do NOT create separate child block folders or files. See [Critical: Parent-Child Blocks Use ONE Folder](#critical-parent-child-blocks-use-one-folder).
- **MANDATORY:** Request user to provide semantic HTML from Universal Editor. See [Step 2: User Provides Semantic HTML](#step-2-user-provides-semantic-html). Do NOT generate HTML.

**Overall Confidence Score:** 98%
