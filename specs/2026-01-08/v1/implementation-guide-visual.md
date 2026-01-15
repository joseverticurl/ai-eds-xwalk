# Visual Guide: EDS Block Development Implementation

This document provides pictorial representations of the Implementation Guide concepts.

---

## Document Structure Overview

```
┌─────────────────────────────────────────────────────────────────┐
│           IMPLEMENTATION GUIDE v1.2                              │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PART 1: FRONTEND DEVELOPMENT                            │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │   │
│  │  │ JavaScript │  │    CSS     │  │    HTML    │         │   │
│  │  │  (.js)     │  │   (.css)   │  │  (.html)   │         │   │
│  │  └────────────┘  └────────────┘  └────────────┘         │   │
│  │                                                           │   │
│  │  • Block decoration logic                                │   │
│  │  • Data extraction patterns                              │   │
│  │  • Styling and responsive design                        │   │
│  │  • Static HTML templates                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PART 2: AEM AUTHORING CONFIGURATION (BACKEND)            │   │
│  │  ┌──────────────────────────────────────┐                │   │
│  │  │      XWalk JSON Configuration        │                │   │
│  │  │      (_<block-name>.json)             │                │   │
│  │  └──────────────────────────────────────┘                │   │
│  │                                                           │   │
│  │  • Component definitions                                  │   │
│  │  • Field models and validation                           │   │
│  │  • Filter/nesting rules                                  │   │
│  │  • Resource types                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PART 3: INTEGRATION & WORKFLOW                          │   │
│  │  ┌──────────────┐         ┌──────────────┐                │   │
│  │  │  Frontend    │◄───────►│   Backend    │                │   │
│  │  │  (Part 1)    │         │   (Part 2)   │                │   │
│  │  └──────────────┘         └──────────────┘                │   │
│  │                                                           │   │
│  │  • End-to-end flow                                        │   │
│  │  • Implementation checklist                               │   │
│  │  • Validation workflow                                    │   │
│  │  • Troubleshooting                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Complete Development Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    BLOCK DEVELOPMENT WORKFLOW                       │
└─────────────────────────────────────────────────────────────────────┘

    PHASE 1: FRONTEND - Static HTML
    ┌─────────────────────────────────────┐
    │  Create preview/mock-content/       │
    │  <block-name>.html                  │
    │  • Match DOM structure              │
    │  • Include data attributes          │
    │  • Test visual appearance           │
    └──────────────┬──────────────────────┘
                   │
                   ▼
    PHASE 2: BACKEND - XWalk Configuration
    ┌─────────────────────────────────────┐
    │  Create blocks/<block-name>/        │
    │  _<block-name>.json                 │
    │  • Define component                 │
    │  • Create field models              │
    │  • Add filters (if needed)          │
    │  • Run: npm run build:json          │
    └──────────────┬──────────────────────┘
                   │
                   ▼
    PHASE 3: FRONTEND - JavaScript
    ┌─────────────────────────────────────┐
    │  Create blocks/<block-name>/        │
    │  <block-name>.js                    │
    │  • Export decorate(block)           │
    │  • Extract data from DOM            │
    │  • Transform HTML structure        │
    │  • Preserve AEM attributes         │
    └──────────────┬──────────────────────┘
                   │
                   ▼
    PHASE 4: FRONTEND - CSS
    ┌─────────────────────────────────────┐
    │  Create blocks/<block-name>/        │
    │  <block-name>.css                   │
    │  • Style block structure            │
    │  • Add responsive breakpoints       │
    │  • Test in preview                  │
    └──────────────┬──────────────────────┘
                   │
                   ▼
    PHASE 5: INTEGRATION - Registration
    ┌─────────────────────────────────────┐
    │  Run: npm run build:json           │
    │  • Verify component-definition.json│
    │  • Verify component-models.json     │
    │  • Verify component-filters.json    │
    └──────────────┬──────────────────────┘
                   │
                   ▼
    PHASE 6: INTEGRATION - AEM Validation
    ┌─────────────────────────────────────┐
    │  Deploy to AEM                     │
    │  • Test in component browser       │
    │  • Test authoring interface        │
    │  • Test field validation           │
    │  • Verify rendering                │
    └─────────────────────────────────────┘
```

---

## End-to-End Data Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                    END-TO-END DATA FLOW                              │
└──────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │   AUTHOR     │  (Content Author in AEM)
    │   (AEM UI)   │
    └──────┬───────┘
           │
           │ 1. Configure Block
           │    (via XWalk UI)
           ▼
    ┌─────────────────────────────────────┐
    │  PART 2: BACKEND                    │
    │  ┌──────────────────────────────┐   │
    │  │  XWalk Configuration         │   │
    │  │  (_<block-name>.json)         │   │
    │  │                               │   │
    │  │  • definitions                │   │
    │  │  • models                     │   │
    │  │  • filters                    │   │
    │  └──────────────────────────────┘   │
    │           │                          │
    │           │ 2. Generate              │
    │           ▼                          │
    │  ┌──────────────────────────────┐   │
    │  │  component-definition.json   │   │
    │  │  component-models.json       │   │
    │  │  component-filters.json      │   │
    │  └──────────────────────────────┘   │
    └───────────┬──────────────────────────┘
                │
                │ 3. Save to AEM Repository
                │    (HTML with data attributes)
                ▼
    ┌─────────────────────────────────────┐
    │  AEM Content (HTML)                 │
    │  <div class="block-name"            │
    │       data-aue-model="modelName">   │
    │    <div data-aue-field="title">     │
    │      Title Text                     │
    │    </div>                           │
    │  </div>                             │
    └───────────┬──────────────────────────┘
                │
                │ 4. Page Loads
                ▼
    ┌─────────────────────────────────────┐
    │  PART 1: FRONTEND                   │
    │  ┌──────────────────────────────┐   │
    │  │  scripts/aem.js              │   │
    │  │  • decorateBlock()           │   │
    │  │  • loadBlock()               │   │
    │  └──────────────────────────────┘   │
    │           │                          │
    │           │ 5. Load CSS & JS         │
    │           ▼                          │
    │  ┌──────────────────────────────┐   │
    │  │  blocks/<block-name>/        │   │
    │  │  • <block-name>.css          │   │
    │  │  • <block-name>.js           │   │
    │  └──────────────────────────────┘   │
    │           │                          │
    │           │ 6. Execute decorate()    │
    │           ▼                          │
    │  ┌──────────────────────────────┐   │
    │  │  Block JavaScript            │   │
    │  │  • Extract data              │   │
    │  │  • Transform DOM             │   │
    │  │  • Apply styles              │   │
    │  └──────────────────────────────┘   │
    └───────────┬──────────────────────────┘
                │
                │ 7. Render
                ▼
    ┌─────────────────────────────────────┐
    │  FINAL HTML OUTPUT                  │
    │  (Styled, Interactive Block)        │
    └─────────────────────────────────────┘
```

---

## File Structure Visualization

```
project-root/
│
├── blocks/                              ┌─────────────────────┐
│   └── <block-name>/                    │  BLOCK DIRECTORY    │
│       ├── <block-name>.js  ◄───────────┤  (Part 1: Frontend)│
│       ├── <block-name>.css ◄───────────┤                     │
│       └── _<block-name>.json ◄─────────┤  (Part 2: Backend) │
│                                        └─────────────────────┘
│
├── preview/
│   └── mock-content/                    ┌─────────────────────┐
│       └── <block-name>.html ◄──────────┤  STATIC HTML        │
│                                        │  (Part 1: Frontend) │
│                                        │  For development    │
│                                        └─────────────────────┘
│
├── shared-components/                   ┌─────────────────────┐
│   ├── Heading.js                       │  REUSABLE           │
│   ├── ImageComponent.js                │  COMPONENTS         │
│   ├── ButtonCTA.js                     │  (Part 1: Frontend)│
│   ├── SvgIcon.js                       │                     │
│   └── Utility.js                       │  Used by blocks     │
│                                        └─────────────────────┘
│
├── models/                              ┌─────────────────────┐
│   ├── _button.json                     │  REUSABLE           │
│   ├── _image.json                      │  FIELD MODELS       │
│   ├── _title.json                      │  (Part 2: Backend) │
│   ├── _text.json                       │                     │
│   └── _section.json                    │  Used in XWalk      │
│                                        └─────────────────────┘
│
└── Generated Files (after npm run build:json)
    ├── component-definition.json ◄──────┐
    ├── component-models.json      ◄─────┤  GENERATED
    └── component-filters.json     ◄─────┤  (Part 2: Backend)
                                         │  From _*.json files
                                         └─────────────────────┘
```

---

## Block Initialization Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│              BLOCK INITIALIZATION LIFECYCLE                      │
└─────────────────────────────────────────────────────────────────┘

    PAGE LOAD
        │
        ▼
    ┌─────────────────────┐
    │ decorateSections()  │  Scans for sections
    └──────────┬──────────┘
               │
               ▼
    ┌─────────────────────┐
    │  decorateBlock()    │  Marks block as 'initialized'
    │                     │  • Sets blockName dataset
    │  STATUS: initialized│  • Adds 'block' class
    └──────────┬──────────┘  • Wraps text nodes
               │
               ▼
    ┌─────────────────────┐
    │   loadBlock()       │  Async loading
    │                     │
    │  STATUS: loading    │  • Loads CSS: <block-name>.css
    └──────────┬──────────┘  • Imports JS: <block-name>.js
               │
               ▼
    ┌─────────────────────┐
    │  decorate(block)    │  Block's decorate function
    │                     │  • Extracts data
    │  STATUS: loaded     │  • Transforms DOM
    └─────────────────────┘  • Applies styles
```

---

## Data Extraction Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│              DATA EXTRACTION FROM DOM                            │
└─────────────────────────────────────────────────────────────────┘

    AEM HTML Output
    ┌─────────────────────────────────────┐
    │ <div class="block-name"            │
    │      data-aue-model="hero">        │
    │   <div data-aue-prop="title">      │
    │     My Title                       │
    │   </div>                           │
    │   <div data-aue-prop="image">      │
    │     <a href="/image.jpg">          │
    │   </div>                           │
    │ </div>                             │
    └──────────────┬──────────────────────┘
                   │
                   │ JavaScript extract()
                   ▼
    ┌─────────────────────────────────────┐
    │  block.querySelector(               │
    │    '[data-aue-prop="title"],'      │
    │    '[data-gen-prop="title"]'       │
    │  )                                  │
    │                                     │
    │  ✓ Check both data-aue-* and        │
    │    data-gen-* attributes            │
    └──────────────┬──────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────┐
    │  Extracted Data Object              │
    │  {                                  │
    │    title: "My Title",              │
    │    image: "/image.jpg",            │
    │    ...                              │
    │  }                                  │
    └──────────────┬──────────────────────┘
                   │
                   │ Transform
                   ▼
    ┌─────────────────────────────────────┐
    │  Final HTML Structure               │
    │  <div class="hero">                 │
    │    <h2>My Title</h2>                │
    │    <picture>...</picture>           │
    │  </div>                             │
    └─────────────────────────────────────┘
```

---

## XWalk Configuration Structure

```
┌─────────────────────────────────────────────────────────────────┐
│          XWALK JSON CONFIGURATION STRUCTURE                      │
│                  (_<block-name>.json)                            │
└─────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────┐
    │  {                                 │
    │    "definitions": [                │  ◄── Component Definition
    │      {                             │      • title
    │        "title": "Hero",            │      • id
    │        "id": "hero",               │      • resourceType
    │        "plugins": {                 │      • template
    │          "xwalk": {                │
    │            "page": {               │
    │              "resourceType":       │
    │                "core/franklin/..." │
    │            }                        │
    │          }                          │
    │        }                            │
    │      }                              │
    │    ],                               │
    │                                     │
    │    "models": [                      │  ◄── Field Models
    │      {                             │      • id (matches definition)
    │        "id": "hero",                │      • fields array
    │        "fields": [                  │        - component type
    │          {                          │        - name
    │            "component": "text",     │        - label
    │            "name": "title",         │        - validation
    │            "label": "Title"         │
    │          }                          │
    │        ]                            │
    │      }                              │
    │    ],                               │
    │                                     │
    │    "filters": [                     │  ◄── Nesting Rules
    │      {                             │      • id
    │        "id": "hero",                 │      • components array
    │        "components": [               │
    │          "linkField"                │
    │        ]                            │
    │      }                              │
    │    ]                                │
    │  }                                  │
    └─────────────────────────────────────┘
           │
           │ npm run build:json
           ▼
    ┌─────────────────────────────────────┐
    │  Generated Files:                  │
    │  • component-definition.json       │
    │  • component-models.json           │
    │  • component-filters.json          │
    └─────────────────────────────────────┘
```

---

## Frontend vs Backend Responsibilities

```
┌─────────────────────────────────────────────────────────────────┐
│         FRONTEND vs BACKEND RESPONSIBILITIES                     │
└─────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────┐
    │  PART 1: FRONTEND DEVELOPMENT                           │
    │  (JavaScript, CSS, HTML)                                 │
    └─────────────────────────────────────────────────────────┘
    │
    │  Responsibilities:
    │  ✓ Block decoration logic
    │  ✓ Data extraction from DOM
    │  ✓ HTML transformation
    │  ✓ CSS styling
    │  ✓ Event handling
    │  ✓ Responsive design
    │  ✓ User interaction
    │
    │  Files:
    │  • blocks/<name>/<name>.js
    │  • blocks/<name>/<name>.css
    │  • preview/mock-content/<name>.html
    │
    └─────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────┐
    │  PART 2: AEM AUTHORING CONFIGURATION (BACKEND)           │
    │  (XWalk JSON)                                            │
    └─────────────────────────────────────────────────────────┘
    │
    │  Responsibilities:
    │  ✓ Define component structure
    │  ✓ Configure authoring fields
    │  ✓ Set up validation rules
    │  ✓ Define nesting rules
    │  ✓ Configure resource types
    │  ✓ Generate AEM authoring UI
    │
    │  Files:
    │  • blocks/<name>/_<name>.json
    │  • models/_*.json (reusable)
    │  • component-*.json (generated)
    │
    └─────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────┐
    │  PART 3: INTEGRATION                                     │
    │  (Workflow, Validation, Troubleshooting)                 │
    └─────────────────────────────────────────────────────────┘
    │
    │  Responsibilities:
    │  ✓ Coordinate frontend & backend
    │  ✓ Validate end-to-end flow
    │  ✓ Troubleshoot issues
    │  ✓ Ensure data flow works
    │
    └─────────────────────────────────────────────────────────┘
```

---

## Component Registration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│            COMPONENT REGISTRATION PROCESS                        │
└─────────────────────────────────────────────────────────────────┘

    Developer creates:
    ┌─────────────────────┐
    │  _<block-name>.json │  Individual block config
    └──────────┬──────────┘
               │
               │ npm run build:json
               ▼
    ┌─────────────────────────────────────┐
    │  Build Script                       │
    │  • Reads all _*.json files          │
    │  • Validates JSON syntax            │
    │  • Merges configurations            │
    └──────────┬──────────────────────────┘
               │
               ▼
    ┌─────────────────────────────────────┐
    │  Generated Files                    │
    │                                     │
    │  component-definition.json          │  ◄── All definitions
    │  ┌──────────────────────────────┐   │
    │  │ {                            │   │
    │  │   "definitions": [           │   │
    │  │     { "id": "hero", ... },   │   │
    │  │     { "id": "feature", ... } │   │
    │  │   ]                           │   │
    │  │ }                             │   │
    │  └──────────────────────────────┘   │
    │                                     │
    │  component-models.json               │  ◄── All models
    │  ┌──────────────────────────────┐   │
    │  │ {                            │   │
    │  │   "models": [                │   │
    │  │     { "id": "hero", ... },   │   │
    │  │     { "id": "feature", ... } │   │
    │  │   ]                           │   │
    │  │ }                             │   │
    │  └──────────────────────────────┘   │
    │                                     │
    │  component-filters.json              │  ◄── All filters
    │  ┌──────────────────────────────┐   │
    │  │ {                            │   │
    │  │   "filters": [                │   │
    │  │     { "id": "hero", ... },    │   │
    │  │     { "id": "feature", ... }  │   │
    │  │   ]                           │   │
    │  │ }                             │   │
    │  └──────────────────────────────┘   │
    └──────────┬──────────────────────────┘
               │
               │ Deploy to AEM
               ▼
    ┌─────────────────────────────────────┐
    │  AEM Authoring Interface            │
    │  • Component browser                │
    │  • Field editors                   │
    │  • Validation                       │
    └─────────────────────────────────────┘
```

---

## Troubleshooting Decision Tree

```
┌─────────────────────────────────────────────────────────────────┐
│              TROUBLESHOOTING DECISION TREE                       │
└─────────────────────────────────────────────────────────────────┘

                    Issue Found?
                         │
        ┌────────────────┴────────────────┐
        │                                  │
        ▼                                  ▼
    FRONTEND ISSUE                    BACKEND ISSUE
    (Part 1)                          (Part 2)
        │                                  │
        ├─ Block not loading?              ├─ XWalk config not working?
        │  • Check block name              │  • Check JSON syntax
        │  • Check default export          │  • Run build:json
        │  • Check loadBlock()             │  • Verify definition ID
        │                                  │
        ├─ Styles not applying?            ├─ Fields not appearing?
        │  • Check CSS path                │  • Check model in JSON
        │  • Check class names             │  • Verify field types
        │  • Test in preview               │  • Check AEM console
        │                                  │
        ├─ Attributes lost?                │
        │  • Use moveInstrumentation()     │
        │  • Preserve data-aue-*           │
        │                                  │
        ├─ Async not working?              │
        │  • Make decorate() async         │
        │  • Add try/catch                 │
        │                                  │
        └─ Data attributes not found?      │
           • Check both data-aue-* and     │
             data-gen-*                    │
           • Use optional chaining         │
```

---

## Quick Reference: Where to Find What

```
┌─────────────────────────────────────────────────────────────────┐
│                    QUICK REFERENCE GUIDE                         │
└─────────────────────────────────────────────────────────────────┘

    I need to...
    
    ┌─────────────────────────────────────────────────────────┐
    │  Write JavaScript code?                                 │
    │  → PART 1: Frontend Development                         │
    │     • JavaScript Templates                              │
    │     • Data Extraction Patterns                          │
    │     • Reusable Components                               │
    └─────────────────────────────────────────────────────────┘
    
    ┌─────────────────────────────────────────────────────────┐
    │  Style the block?                                       │
    │  → PART 1: Frontend Development                         │
    │     • CSS Implementation                                │
    │     • CSS Template                                      │
    │     • CSS Best Practices                                │
    └─────────────────────────────────────────────────────────┘
    
    ┌─────────────────────────────────────────────────────────┐
    │  Configure AEM authoring fields?                        │
    │  → PART 2: AEM Authoring Configuration                  │
    │     • Component Definition Structure                    │
    │     • Field Configuration                               │
    │     • Validation Patterns                               │
    └─────────────────────────────────────────────────────────┘
    
    ┌─────────────────────────────────────────────────────────┐
    │  Understand the complete workflow?                      │
    │  → PART 3: Integration & Workflow                      │
    │     • End-to-End Flow                                   │
    │     • Development Workflow                             │
    │     • Implementation Checklist                          │
    └─────────────────────────────────────────────────────────┘
    
    ┌─────────────────────────────────────────────────────────┐
    │  Fix a bug or issue?                                    │
    │  → PART 3: Integration & Workflow                      │
    │     • Common Issues and Solutions                       │
    │     • Troubleshooting Decision Tree                    │
    └─────────────────────────────────────────────────────────┘
```

---

## Summary

This visual guide provides pictorial representations of:

1. **Document Structure** - How the guide is organized into 3 parts
2. **Development Workflow** - Step-by-step process
3. **Data Flow** - How data moves from AEM to browser
4. **File Structure** - Where files are located
5. **Block Lifecycle** - How blocks initialize and load
6. **Data Extraction** - How to extract data from DOM
7. **XWalk Configuration** - Structure of JSON config
8. **Responsibilities** - What frontend vs backend handles
9. **Registration Process** - How components are registered
10. **Troubleshooting** - Decision tree for issues
11. **Quick Reference** - Where to find information

Use these diagrams as visual aids when reading the main implementation guide!
