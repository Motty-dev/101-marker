# Codebase Structure

**Analysis Date:** 2026-02-22

## Directory Layout

```
101-marker/
├── src/
│   ├── components/          # React components
│   │   ├── Toolbar.tsx
│   │   ├── PdfViewer.tsx
│   │   ├── MarkerOverlay.tsx
│   │   ├── MarkerRect.tsx
│   │   ├── FieldEditor.tsx
│   │   ├── FieldList.tsx
│   │   └── ExportModal.tsx
│   ├── utils/               # Pure utility functions
│   │   ├── pdfRenderer.ts   # PDF loading and canvas rendering
│   │   └── coordUtils.ts    # Coordinate transformations
│   ├── assets/              # Static assets
│   │   └── react.svg
│   ├── App.tsx              # Root component and state management
│   ├── App.css              # Component styles (minimal)
│   ├── main.tsx             # React entry point
│   ├── index.css            # Global styles
│   └── types.ts             # TypeScript type definitions
├── public/                  # Static files served as-is
├── package.json
├── tsconfig.json
├── tsconfig.app.json        # App-specific TS config
├── tsconfig.node.json       # Build-specific TS config
├── vite.config.ts           # Vite build configuration
├── eslint.config.js         # ESLint rules
├── index.html               # HTML entry point
└── .planning/               # Planning documents (generated)
```

## Directory Purposes

**`src/components/`:**
- Purpose: Reusable React UI components
- Contains: Functional components with inline styles
- Key files:
  - `Toolbar.tsx` - Top toolbar with file upload, page nav, zoom, export
  - `PdfViewer.tsx` - Main canvas viewer with overlay
  - `MarkerOverlay.tsx` - Field placement and selection layer
  - `MarkerRect.tsx` - Individual field rectangle with drag/resize
  - `FieldEditor.tsx` - Property editor for selected field
  - `FieldList.tsx` - Scrollable list of fields on current page
  - `ExportModal.tsx` - JSON export preview dialog

**`src/utils/`:**
- Purpose: Stateless utility functions for calculations and I/O
- Contains: PDF operations, coordinate math, ID generation
- Key files:
  - `pdfRenderer.ts` - PDF.js integration (load, render, get dimensions)
  - `coordUtils.ts` - Screen ↔ PDF coordinate conversions

**`src/assets/`:**
- Purpose: Static image assets
- Contains: React logo SVG
- Generated: No
- Committed: Yes

**Root configuration files:**
- `vite.config.ts` - Build tool config with React plugin, path alias (@→src)
- `tsconfig.json` - Root TS config, includes app + node configs
- `tsconfig.app.json` - Application TS strict mode settings
- `eslint.config.js` - ESLint rules for React + hooks
- `index.html` - HTML template with root div and script import
- `package.json` - Dependencies: react, react-dom, pdfjs-dist

## Key File Locations

**Entry Points:**
- `index.html` - HTML document root
- `src/main.tsx` - React app initialization, mounts App to #root
- `src/App.tsx` - Root component, state management, event handlers

**Configuration:**
- `vite.config.ts` - Build settings (port 9999, path alias)
- `tsconfig.app.json` - Strict type checking, ES2022 target
- `package.json` - React 19.2.0, pdfjs-dist 5.4.624, TypeScript 5.9.3

**Core Logic:**
- `src/App.tsx` - Field management, template building, PDF loading
- `src/utils/pdfRenderer.ts` - PDF document operations
- `src/utils/coordUtils.ts` - Coordinate math and transformations

**Type Definitions:**
- `src/types.ts` - FieldDefinition, Template, PDFViewport, TextStyle, CheckFieldStyle

**UI Components:**
- `src/components/Toolbar.tsx` - Navigation and file operations
- `src/components/PdfViewer.tsx` - PDF canvas with overlay
- `src/components/MarkerOverlay.tsx` - Field placement interaction
- `src/components/MarkerRect.tsx` - Individual field markers
- `src/components/FieldEditor.tsx` - Property editing form
- `src/components/FieldList.tsx` - Field list panel
- `src/components/ExportModal.tsx` - JSON export dialog

## Naming Conventions

**Files:**
- PascalCase for React components: `FieldEditor.tsx`, `MarkerRect.tsx`
- camelCase for utilities and hooks: `pdfRenderer.ts`, `coordUtils.ts`
- Lowercase for assets and config: `index.html`, `vite.config.ts`

**Directories:**
- lowercase with plural form for collections: `src/components/`, `src/utils/`, `src/assets/`

**Functions:**
- camelCase for all functions: `screenToPdf()`, `loadPdfDocument()`, `generateFieldId()`
- Descriptive verb prefixes: `handle*` for event handlers, `render*` for rendering functions

**Variables:**
- camelCase for constants and state: `fields`, `selectedFieldId`, `placementMode`
- UPPER_CASE for constant objects: `TYPE_COLORS`, `FONT_FAMILIES` (inside components)

**Types:**
- PascalCase with descriptive names: `FieldDefinition`, `PDFViewport`, `TextStyle`
- Type suffix `Props` for component prop interfaces: `ToolbarProps`, `FieldEditorProps`

**CSS Classes:**
- No global CSS classes used; all styling via inline style objects
- Animation classes: `.placement-blink` defined in global CSS string

## Where to Add New Code

**New Feature (e.g., new field type):**
- Add type to `FieldType` union in `src/types.ts`
- Add rendering logic to `MarkerRect.renderContent()` and `FieldEditor.renderPreviewContent()`
- Add style type and editor controls to `FieldEditor.tsx`
- Add color mapping to `TYPE_COLORS` in `FieldList.tsx` and `MarkerRect.tsx`
- Tests: Create `src/components/__tests__/FieldEditor.test.tsx` (if testing added)

**New Component/Module:**
- Create file in `src/components/` with PascalCase name: `NewComponent.tsx`
- Define interface for props with `NewComponentProps` suffix
- Export as named export: `export const NewComponent: React.FC<NewComponentProps>`
- Inline styles as const at bottom: `const styles: Record<string, React.CSSProperties>`
- Import in parent component and add prop callbacks from App

**Utilities/Helpers:**
- Add pure functions to `src/utils/coordUtils.ts` for coordinate math
- Add PDF operations to `src/utils/pdfRenderer.ts`
- Functions should be pure (no side effects) and handle errors gracefully
- Export as named exports, not default

**State Management:**
- Add new state hooks in `src/App.tsx` using `useState()`
- Create callback handler with `useCallback()` to avoid re-renders
- Pass state down to child components via props
- Lift callbacks up from child components to App for state updates

**Type Definitions:**
- Add new interfaces to `src/types.ts`
- Keep types organized by logical grouping
- Export all types as named exports
- Import types in components: `import type { TypeName } from '../types'`

## Special Directories

**`node_modules/`:**
- Purpose: Installed dependencies
- Generated: Yes (via npm install)
- Committed: No

**`public/`:**
- Purpose: Static assets served directly by Vite
- Generated: No
- Committed: Yes
- Example: favicon, manifest files (currently minimal)

**`.git/`:**
- Purpose: Git repository history
- Generated: Yes
- Committed: N/A (is repository)

**`.planning/`:**
- Purpose: GSD planning documents
- Generated: Yes (by GSD tools)
- Committed: Yes
- Example: `.planning/codebase/ARCHITECTURE.md`

**`.claude/`:**
- Purpose: Claude-specific configuration
- Generated: Yes
- Committed: Maybe

---

*Structure analysis: 2026-02-22*
