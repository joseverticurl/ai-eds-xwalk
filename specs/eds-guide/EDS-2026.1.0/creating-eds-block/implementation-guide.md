# Spec: eds-guide / EDS-2026.1.0 / creating-eds-block

## Implementation Guide

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

For the complete Part 3 content (Core Concepts, JavaScript Implementation, CSS Implementation, HTML Implementation, Best Practices), Appendices A-D, Implementation Checklist, and Validation Workflow, refer to the full guide structure in the Table of Contents above. Key points:

- **Index-based only** — Use `block.children[0]`, `row.children[1]` etc.; no data attributes
- **User-provided HTML** — Document structure contract before coding
- **ONE folder** — Parent-child blocks use one JS file and one CSS file
- **moveInstrumentation()** — Always use when transforming DOM
- **createOptimizedPicture()** — For images; use `loading="lazy"` for non-LCP

**Reference:** `blocks/hero/`, `blocks/cards/`, `blocks/fragment/` in the codebase.
