# Architecture

**Analysis Date:** 2026-02-22

## Pattern Overview

**Overall:** Single-page React application with coordinate transformation and PDF rendering

**Key Characteristics:**
- React 19 + TypeScript for UI state management
- PDF.js for document rendering and page manipulation
- Canvas-based PDF rendering with overlay-based field markers
- Coordinate space transformation layer (PDF points ↔ screen pixels)
- Form template definition and export/import as JSON

## Layers

**Presentation Layer:**
- Purpose: React components that render UI and respond to user interactions
- Location: `src/components/`
- Contains: Component definitions with inline styles (Toolbar, PdfViewer, MarkerOverlay, MarkerRect, FieldEditor, FieldList, ExportModal)
- Depends on: Types, utilities for coordinate conversion, PDF rendering
- Used by: App root component

**State Management Layer:**
- Purpose: React hooks in App component for managing application state
- Location: `src/App.tsx`
- Contains: useState hooks for PDF document, fields, selection, zoom, placement mode, template data
- Depends on: PDF loading utilities, field generation utilities
- Used by: All child components receive state and callbacks

**Utility/Service Layer:**
- Purpose: Pure functions for PDF operations and coordinate math
- Location: `src/utils/`
  - `pdfRenderer.ts`: PDF loading and canvas rendering
  - `coordUtils.ts`: Coordinate transformations and field utilities
- Contains: PDF document loading, page rendering to canvas, coordinate system conversions, field ID generation
- Depends on: pdfjs-dist library, TypeScript types
- Used by: App component, PdfViewer component, MarkerRect component

**Type Definition Layer:**
- Purpose: Type interfaces shared across application
- Location: `src/types.ts`
- Contains: FieldDefinition, Template, PDFViewport, TextStyle, CheckFieldStyle, AppState, DragState, ResizeState
- Depends on: pdfjs-dist for PDF type imports
- Used by: All components and utilities

## Data Flow

**Field Placement Flow:**

1. User clicks "Add Field" button in Toolbar → `placementMode` state becomes true
2. PdfViewer displays MarkerOverlay with crosshair cursor
3. User clicks on PDF canvas → MarkerOverlay.handleClick triggers
4. Coordinates converted from screen pixels to PDF points via `screenToPdf()`
5. App.handlePlace() generates new field ID and creates FieldDefinition
6. New field added to `fields[currentPage]` state
7. MarkerRect renders field rectangle with borders and resize handles
8. FieldEditor sidebar populates with new field properties

**Field Editing Flow:**

1. User clicks MarkerRect or item in FieldList → `selectedFieldId` state updates
2. FieldEditor displays form with current field properties
3. User modifies field ID, type, or style properties
4. FieldEditor.handleChange() validates and calls onUpdate callback
5. App.handleUpdateField() updates field in state
6. MarkerRect re-renders with updated appearance
7. Live preview in FieldEditor shows rendered output

**Field Movement/Resizing Flow:**

1. User drags selected MarkerRect → handleMouseDown captures initial position
2. Window mousemove listener tracks mouse delta
3. Delta converted to PDF coordinate delta via `screenDeltaToPdf()`
4. Position/size calculated and rounded to nearest 0.1 points
5. onMove/onResize callbacks trigger state updates
6. Field position/dimensions recalculated on every mousemove
7. MarkerRect re-positions via CSS transform (absolute positioning)

**Template Export Flow:**

1. User clicks "Export JSON" button
2. ExportModal opens with preview of JSON
3. App.buildTemplate() assembles Template object from current state:
   - Iterates fields by page
   - Includes page dimensions from pageDimensions state
   - Creates Template with metadata (name, PDF filename, timestamp)
4. User downloads or copies JSON
5. JSON can be imported later via Toolbar import button
6. Import parses JSON and reconstructs fields state from Template

**State Management:**
- Root state: `App.tsx` manages all application state as React hooks
- Field state: Keyed by page number in `fields[pageNumber] = FieldDefinition[]`
- Selection: `selectedFieldId` is single string or null
- Viewport tracking: `viewports[pageNumber]` stores scale and dimensions for coordinate math
- Preview values: `previewValues[fieldId]` stores user-entered text for live preview only (not exported)
- Mode toggles: `placementMode` boolean for placement workflow

## Key Abstractions

**Coordinate Transformation:**
- Purpose: Convert between PDF point space (origin bottom-left) and browser screen space (origin top-left)
- Examples: `src/utils/coordUtils.ts`
- Pattern:
  - `screenToPdf()`: Screen pixels → PDF points (accounting for viewport scale and Y-axis flip)
  - `pdfToScreen()`: PDF points → Screen pixels
  - `pdfSizeToScreen()`: PDF dimensions → Screen pixels
  - `screenDeltaToPdf()`: Mouse movement deltas → PDF point deltas (with Y flip)

**Field Definition:**
- Purpose: Represents a single form field with position, dimensions, type, and rendering style
- Examples: `src/types.ts` FieldDefinition interface
- Pattern: Type-discriminated union with FieldStyle (TextStyle | CheckFieldStyle)

**Template:**
- Purpose: Serializable representation of all fields across all pages
- Examples: `src/types.ts` Template interface
- Pattern: Includes metadata (templateName, pdfFileName, createdAt) and pages array with field definitions

**PDF Viewport:**
- Purpose: Tracks canvas dimensions and zoom scale for coordinate conversions
- Examples: `src/types.ts` PDFViewport interface
- Pattern: Contains width, height (in screen pixels), and scale (zoom factor)

## Entry Points

**Application Root:**
- Location: `src/main.tsx`
- Triggers: HTML script tag in `index.html`
- Responsibilities: Mounts React app to DOM using createRoot

**Main Application Component:**
- Location: `src/App.tsx`
- Triggers: Rendered from main.tsx
- Responsibilities:
  - Manages all application state (fields, selection, PDF, zoom, etc.)
  - Handles file upload and PDF loading
  - Coordinates all prop callbacks between components
  - Builds and exports/imports templates
  - Manages keyboard shortcuts (Escape, Delete)

**Component Tree:**
```
App
├── Toolbar (file upload, page nav, zoom, add field, export/import)
├── PdfViewer (canvas + MarkerOverlay)
│   └── MarkerOverlay (field placement and selection)
│       └── MarkerRect[] (individual field rectangles with drag/resize)
├── FieldEditor (form for editing selected field)
└── FieldList (list of fields on current page)
└── ExportModal (template JSON preview/download)
```

## Error Handling

**Strategy:** Graceful degradation with console errors and user alerts

**Patterns:**
- PDF loading errors: Caught in `handleFileUpload()`, logged and alert shown
- Canvas context errors: Error thrown if 2D context unavailable
- JSON parsing errors: Try-catch in `handleImport()`, alert on parse failure
- Worker initialization: PDF.js worker bundled locally via `pdfjsWorkerUrl` to avoid CDN mismatch

## Cross-Cutting Concerns

**Logging:**
- Console.error for PDF loading and rendering failures
- No logging framework used; development-focused console logging only

**Validation:**
- Field ID uniqueness checked in FieldEditor before allowing rename
- Field dimensions minimum enforced (8 pts) in MarkerRect resize handler
- Coordinate clamping: Position values kept >= 0 via Math.max()

**Keyboard Shortcuts:**
- Escape: Cancel placement mode and deselect field
- Delete/Backspace: Delete selected field (except when input has focus)

**Styling:**
- Inline React styles throughout (Record<string, React.CSSProperties>)
- Global CSS in App component globalCSS variable (scrollbar, animations, focus states)
- Dark theme with accent colors: blue (#4f7fff), green (#43e97b), orange (#ff9f43)
- No CSS files; all styling colocated with components

---

*Architecture analysis: 2026-02-22*
