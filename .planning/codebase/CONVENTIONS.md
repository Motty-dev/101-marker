# Coding Conventions

**Analysis Date:** 2026-02-22

## Naming Patterns

**Files:**
- React components: PascalCase with `.tsx` extension (e.g., `PdfViewer.tsx`, `FieldEditor.tsx`)
- Utility modules: camelCase with `.ts` extension (e.g., `pdfRenderer.ts`, `coordUtils.ts`)
- Type definition file: `types.ts` (centralized type definitions)
- Directories: lowercase with hyphens for multi-word names (e.g., `src/components/`, `src/utils/`)

**Functions:**
- camelCase for all functions and methods
- Utility functions exported from modules: `loadPdfDocument`, `renderPageToCanvas`, `screenToPdf`
- Event handlers: `handle{Event}` pattern (e.g., `handleFileUpload`, `handleSelect`, `handleDragOver`)
- React component functions: PascalCase (e.g., `function App()`)
- Private helper functions within components: camelCase (e.g., `createDefaultField`)

**Variables:**
- camelCase for all variable names, including state variables
- Descriptive names preferred: `placementMode`, `selectedFieldId`, `previewValues`
- React hooks follow pattern: `const [stateVar, setStateVar] = useState()`
- Refs use `Ref` suffix: `canvasRef`, `fileInputRef`

**Types:**
- Interfaces: PascalCase with `I` prefix for types or just capitalized (e.g., `FieldDefinition`, `PDFViewport`, `FieldEditorProps`)
- Type aliases: PascalCase (e.g., `FieldType`, `Alignment`)
- Union types: `type FieldType = 'text' | 'number' | 'check'`
- Mapped object types: `Record<string, T>` for object properties

## Code Style

**Formatting:**
- No Prettier configuration detected - formatting follows ESLint defaults
- 2-space indentation (inferred from code)
- Single quotes for strings (observed in codebase)
- Semicolons required (strict TypeScript mode enforced)
- Trailing commas in multi-line objects/arrays (implicit standard)

**Linting:**
- ESLint with typescript-eslint flat config (`eslint.config.js`)
- Rules include:
  - `@eslint/js` recommended rules
  - `typescript-eslint` recommended rules
  - `eslint-plugin-react-hooks` flat recommended
  - `eslint-plugin-react-refresh` vite rules
- ESLint targets: `**/*.{ts,tsx}` files
- Browser globals enabled for React DOM environment

**TypeScript:**
- Strict mode enabled: `"strict": true`
- No unused locals: `"noUnusedLocals": true`
- No unused parameters: `"noUnusedParameters": true`
- No fallthrough switch cases: `"noFallthroughCasesInSwitch": true`
- Target: `ES2022` with `ESNext` modules
- JSX: `react-jsx` (automatic JSX transform)

## Import Organization

**Order:**
1. React library imports (React, hooks)
2. Type-only imports from libraries: `import type { ... } from 'library'`
3. Local type imports: `import type { FieldDefinition } from './types'`
4. Local component imports: relative paths with `.tsx` or `.ts` (file extensions required in bundler mode)
5. Utility function imports: `import { functionName } from './utils/moduleName'`

**Example from `App.tsx`:**
```typescript
import React, { useState, useEffect, useCallback } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import type { FieldDefinition, PDFViewport, Template } from './types'
import { Toolbar } from './components/Toolbar'
import { PdfViewer } from './components/PdfViewer'
// ... more component imports
import { loadPdfDocument, getPageDimensions } from './utils/pdfRenderer'
import { generateFieldId } from './utils/coordUtils'
```

**Path Aliases:**
- Vite config defines `@` alias pointing to `/src`: `resolve.alias['@'] = '/src'`
- Aliases not heavily used in current codebase - prefer relative imports or explicit paths

## Error Handling

**Patterns:**
- Try-catch blocks with `console.error()` for logging: See `App.tsx:90` and `PdfViewer.tsx:55`
- Error messages displayed to user via `alert()` in critical operations
- Example from `App.tsx`:
  ```typescript
  try {
    const doc = await loadPdfDocument(file)
    // ... process
  } catch (err) {
    console.error('Failed to load PDF:', err)
    alert('Failed to load PDF. Please try again.')
  }
  ```
- Async operations check for cancellation flags (e.g., `cancelled` flag in `PdfViewer.tsx:43-61`)
- No centralized error service - errors handled locally in components

## Logging

**Framework:** `console` (native browser console)

**Patterns:**
- `console.error()` for errors: used only twice in codebase, both in error handlers
- No `console.log()` calls in production code - implies logs are minimal and removed before shipping
- Error context provided with messages: `'Failed to load PDF:', err` format

## Comments

**When to Comment:**
- JSDoc comments above utility functions with parameters and return types
- Example from `coordUtils.ts`:
  ```typescript
  /**
   * Convert screen pixel coordinates to PDF point coordinates.
   * PDF origin is bottom-left; screen origin is top-left.
   */
  export function screenToPdf(
    screenX: number,
    screenY: number,
    viewport: PDFViewport
  ): { x: number; y: number }
  ```
- Inline comments for non-obvious logic: `// Use selectedFieldId as the stable lookup key so renames work correctly`
- Component comments for state purpose: `// previewValues: fieldId → sample value entered in the editor (not exported)`

**JSDoc/TSDoc:**
- Utility functions documented with JSDoc format
- Components documented via TypeScript interfaces (Props types)
- Return types explicitly declared

## Function Design

**Size:**
- Utility functions are compact single-purpose: `screenToPdf` (9 lines), `clamp` (3 lines)
- Component functions moderate size (40-500 lines) with nested state management
- Event handlers kept to 5-30 lines

**Parameters:**
- Typed interfaces for component props: `interface PdfViewerProps { ... }`
- Utility functions take explicit parameters rather than objects
- Event handlers typed with React event types: `React.ChangeEvent<HTMLInputElement>`, `React.MouseEvent<HTMLDivElement>`

**Return Values:**
- Async functions return `Promise<T>`: `loadPdfDocument` returns `Promise<PDFDocumentProxy>`
- Render functions return `React.ReactElement` or JSX
- Utility functions return typed objects: `{ x: number; y: number }`

## Module Design

**Exports:**
- Named exports for components: `export const PdfViewer: React.FC<PdfViewerProps> = ...`
- Named exports for utilities: `export function screenToPdf(...)`
- Default export for main App component: `export default function App()`
- Centralized type exports from `types.ts`

**Barrel Files:** Not used - imports reference specific files directly

**Constants:**
- Component-level constants defined at module scope:
  ```typescript
  const FONT_FAMILIES = ['Arial', 'Courier', ...] // in FieldEditor.tsx
  const TYPE_COLORS: Record<string, string> = { text: '#4f7fff', ... } // in FieldList.tsx
  ```
- Styles object patterns: `const styles: Record<string, React.CSSProperties> = { ... }`

---

*Convention analysis: 2026-02-22*
