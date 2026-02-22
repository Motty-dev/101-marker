# Codebase Concerns

**Analysis Date:** 2026-02-22

## Tech Debt

**Large monolithic component files:**
- Issue: `FieldEditor.tsx` (756 lines) and `App.tsx` (440 lines) contain too many concerns and could lead to maintenance issues as the codebase grows
- Files: `src/components/FieldEditor.tsx`, `src/App.tsx`
- Impact: Difficult to test individual features, high cognitive load when making changes, increased risk of introducing bugs
- Fix approach: Extract form groups into separate components (FontFamilySelector, AlignmentControl, ColorPicker, etc.). Move template logic from App.tsx to a custom hook like `useTemplate()`

**Event listener memory leak risk:**
- Issue: `MarkerRect.tsx` manually manages `window.addEventListener/removeEventListener` for drag and resize handlers (lines 81-82, 116-117, 344-345)
- Files: `src/components/MarkerRect.tsx` (lines 51-120, 305-348)
- Impact: If component unmounts during drag/resize, event listeners may persist and cause memory leaks
- Fix approach: Create a custom hook `useDragResize()` that uses refs and cleanup via useEffect. Ensure cleanup runs even if component unmounts mid-drag

**Import path inconsistency:**
- Issue: App.tsx imports from `'./types'` (line 3) while other components import from `'../types'`
- Files: `src/App.tsx` (line 3), `src/components/FieldEditor.tsx` (line 2), `src/components/MarkerRect.tsx` (line 2)
- Impact: Type path is ambiguous; refactoring can break imports silently
- Fix approach: Standardize to barrel export from `src/types.ts` or use path aliases in tsconfig

**Inline styles everywhere:**
- Issue: All components use inline `styles` objects instead of CSS modules or styled-components
- Files: All `src/components/*.tsx` and `src/App.tsx`
- Impact: No reusable theme tokens, hard to maintain dark/light mode, difficult to audit design consistency
- Fix approach: Extract theme tokens into `src/theme.ts`, create a `useTheme()` hook, or migrate to CSS modules

**No validation on template import:**
- Issue: `App.tsx` handleImport (line 217-234) uses `JSON.parse()` with only a try/catch but no schema validation
- Files: `src/App.tsx` (lines 217-234)
- Impact: Corrupted or malicious JSON could crash the app or cause unexpected state. No guarantee imported template matches expected structure
- Fix approach: Use Zod or similar schema validation library to validate Template type before accepting import

**Clipboard fallback incomplete:**
- Issue: `ExportModal.tsx` handleCopy (line 20-34) has a fallback for clipboard API failure that selects text but doesn't actually copy
- Files: `src/components/ExportModal.tsx` (lines 20-34)
- Impact: Users may think copy succeeded when it didn't; fallback is only partial solution
- Fix approach: Show error toast/alert if clipboard write fails, remove incomplete fallback

## Known Bugs

**Field ID rename doesn't update preview state properly:**
- Symptoms: When renaming a field ID, the preview value should follow the field but may get lost if the rename happens during preview input
- Files: `src/App.tsx` (lines 122-145), `src/components/FieldEditor.tsx` (lines 49-64)
- Trigger: Edit field ID while preview value is entered
- Workaround: Re-enter preview value after renaming

**PDF page dimensions loading race condition:**
- Symptoms: Rapidly changing pages or zooming during PDF load can cause viewport mismatch
- Files: `src/App.tsx` (lines 84-88), `src/components/PdfViewer.tsx` (lines 40-62)
- Trigger: Upload large PDF, immediately switch pages before render completes
- Workaround: Wait for page to fully render before changing pages

**Mouse coordinates can exceed PDF bounds during resize:**
- Symptoms: Dragging bottom-left resize handle can move field off the left edge with negative X values in some cases
- Files: `src/components/MarkerRect.tsx` (lines 305-348)
- Trigger: Fast drag of bottom-left corner at high zoom levels
- Workaround: Manually correct X value in editor after resize

## Security Considerations

**No CORS headers or CSP for PDF worker:**
- Risk: If pdfjs-dist worker is ever served from CDN or different origin, could fail silently or be intercepted
- Files: `src/utils/pdfRenderer.ts` (line 7)
- Current mitigation: Worker is bundled locally via `pdfjs-dist/build/pdf.worker.min.mjs?url`
- Recommendations: Ensure bundler always includes worker in output. Add Content-Security-Policy headers if served over HTTP. Test bundle in production to verify worker URL is correct

**No file type validation beyond MIME:**
- Risk: User can rename `.exe` to `.pdf` and upload; MIME check can be spoofed
- Files: `src/components/Toolbar.tsx` (line 41), `src/App.tsx` (line 247)
- Current mitigation: Accept attribute restricts file picker UI but not file content
- Recommendations: Validate PDF file header (magic bytes 0x25504446 = "%PDF") after upload before passing to pdfjs

**JSON import has no size limit:**
- Risk: User could import extremely large JSON causing out-of-memory condition
- Files: `src/components/Toolbar.tsx` (lines 47-59)
- Current mitigation: None
- Recommendations: Add max file size check (e.g., 10MB) before reading file. Validate array lengths in template.pages

**No input sanitization on field ID:**
- Risk: Field IDs are used directly in display without sanitization; could theoretically inject HTML/script if parsing is changed
- Files: `src/components/FieldEditor.tsx` (line 179), `src/components/MarkerRect.tsx` (line 261)
- Current mitigation: React auto-escapes text content
- Recommendations: Keep React rendering, but validate field ID format: only allow `[a-zA-Z0-9_-]+`

## Performance Bottlenecks

**Full page re-render on every field change:**
- Problem: Modifying one field causes entire App to re-render, including PDF canvas
- Files: `src/App.tsx` (all state setters), particularly lines 122-180 (field mutation handlers)
- Cause: App state is not normalized; fields are stored at top level causing parent re-render
- Improvement path:
  1. Move field state to custom hook `useFields()` with memoized callbacks
  2. Create FieldList context to avoid prop-drilling
  3. Memoize MarkerRect with React.memo() to prevent re-renders of unrelated fields

**Coordinate conversion called on every render:**
- Problem: `pdfToScreen()`, `pdfSizeToScreen()` computed on every MarkerRect render without memoization
- Files: `src/components/MarkerRect.tsx` (lines 31-32)
- Cause: Expensive calculations in render path, computed values not cached
- Improvement path: Memoize with useMemo, pass pre-computed screen coordinates from parent

**PDF rendering blocks on zoom:**
- Problem: Changing zoom immediately triggers full PDF re-render without debounce
- Files: `src/components/PdfViewer.tsx` (lines 40-62), dependent on zoom prop
- Cause: No debounce/throttle on zoom changes in Toolbar
- Improvement path: Debounce zoom slider (300ms), use useTransition for non-blocking updates

**No canvas rendering optimization:**
- Problem: Canvas context cleared and entire page re-rendered every zoom/page change
- Files: `src/utils/pdfRenderer.ts` (lines 16-43)
- Cause: Simple implementation without dirty-flag or incremental rendering
- Improvement path: Implement background rendering worker or canvas layer caching for text layer

## Fragile Areas

**Mouse event handler cleanup in MarkerRect:**
- Files: `src/components/MarkerRect.tsx` (lines 50-120, 87-120, 305-348)
- Why fragile: Global `window.addEventListener` for mousemove/mouseup is error-prone. If an error occurs during drag, listeners may remain attached. Component can unmount while drag is in progress.
- Safe modification: Extract to `useDragResize()` hook with proper cleanup in useEffect. Track drag state in ref, not in component closure.
- Test coverage: No unit tests for drag/resize behavior; manual testing only

**Template import/export JSON parsing:**
- Files: `src/App.tsx` (lines 217-234, 182-203), `src/components/ExportModal.tsx` (line 18)
- Why fragile: No schema validation; structure assumed to match but could drift. Changes to FieldDefinition type won't catch import failures at runtime.
- Safe modification: Use Zod schema for Template, call `TemplateSchema.parse(importedData)` before accepting
- Test coverage: No tests for invalid JSON structures

**Coordinate system conversion:**
- Files: `src/utils/coordUtils.ts` (all functions), `src/components/MarkerRect.tsx` (lines 31-32)
- Why fragile: PDF origin (bottom-left) vs screen origin (top-left) is easy to get wrong. Scale/viewport interactions subtle.
- Safe modification: Add unit tests covering edge cases: zoom 0.5x, 3x; PDF boundary conditions; negative coordinates
- Test coverage: No unit tests; assumes correct implementation

**Component dependency on viewport updates:**
- Files: `src/App.tsx` (line 95-97), `src/components/PdfViewer.tsx` (lines 40-62)
- Why fragile: PdfViewer notifies App of viewport after render, but App updates fields in fields array. Race conditions if page changed mid-render.
- Safe modification: Use viewports as local PdfViewer state first, sync to App only when stable (using useCallback with stable deps)
- Test coverage: No tests for rapid page changes

## Scaling Limits

**Single PDF page limit:**
- Current capacity: Tested with multi-page PDFs; no known hard limit
- Limit: Field list could slow down with 1000+ fields across many pages due to O(n) filtering/mapping
- Scaling path: Implement virtual scrolling in FieldList, paginate fields in state storage, use indexed lookup

**No undo/redo history:**
- Current capacity: Only current state stored
- Limit: Users must remember previous state; single mistake requires re-doing work
- Scaling path: Implement Command pattern or ImmerJS with history middleware for undo/redo stack

**All state in memory:**
- Current capacity: Entire template loaded in React state (fields, viewports, preview values)
- Limit: Very large PDFs (100+ pages) with many fields could cause memory pressure
- Scaling path: IndexedDB for field storage, lazy-load field data per page

**No background save:**
- Current capacity: Only manual export/import
- Limit: Losing browser tab = losing work
- Scaling path: Auto-save to localStorage or cloud API periodically

## Dependencies at Risk

**pdfjs-dist (^5.4.624):**
- Risk: Major version bump from 4.x to 5.x; can have breaking API changes. Worker URL handling changed between versions.
- Impact: Future npm updates could break rendering
- Migration plan: Pin to exact version `5.4.624` rather than `^5.4.624`. Monitor pdfjs releases. Test with new major versions before upgrading.

**React (^19.2.0):**
- Risk: Cutting-edge React version; may have undiscovered bugs. Concurrent features not fully adopted in codebase.
- Impact: Unexpected re-render behavior, hook dependencies not fully optimized
- Migration plan: Consider holding at React 18 LTS if stability preferred. If staying on 19, enable Strict Mode in dev and run tests regularly.

**No package-lock.json committed:**
- Risk: Builds are non-deterministic; CI/CD could pull different versions
- Impact: Environment drift between dev, staging, production
- Migration plan: Commit `package-lock.json` to git

## Missing Critical Features

**No undo/redo:**
- Problem: Users cannot undo field edits or deletions without re-doing work
- Blocks: Cannot support complex workflows where mistakes are costly

**No field duplication:**
- Problem: Must manually recreate fields with same properties
- Blocks: Efficiency for templates with many similar fields

**No batch operations:**
- Problem: Cannot select multiple fields to move/resize/delete together
- Blocks: Efficient bulk editing

**No field validation rules:**
- Problem: Cannot specify field constraints (max length, required, numeric range, etc.)
- Blocks: Rich template definitions for form auto-fill

**No field styling inheritance:**
- Problem: Each field style set individually; no way to define default styles
- Blocks: Consistency for large templates

## Test Coverage Gaps

**No unit tests:**
- What's not tested: Coordinate conversion functions, field state mutations, form validation
- Files: `src/utils/coordUtils.ts`, `src/App.tsx` (all handlers), `src/components/FieldEditor.tsx` (validation logic)
- Risk: Refactoring coordinate utils could break screen/PDF mapping silently. Field state mutations may corrupt template structure.
- Priority: High

**No integration tests:**
- What's not tested: Upload PDF → place field → export template workflow
- Files: Entire `src/components/` flow
- Risk: UI changes could break core workflow without notice
- Priority: High

**No E2E tests:**
- What's not tested: Browser interactions (drag, resize, page navigation, keyboard shortcuts)
- Files: Entire application
- Risk: Regression in UX interactions (e.g., keyboard shortcuts stop working)
- Priority: Medium

**No PDF rendering edge cases:**
- What's not tested: Large PDFs, corrupted PDFs, unusual page sizes, rotated pages
- Files: `src/utils/pdfRenderer.ts`
- Risk: App crashes on edge case PDFs
- Priority: Medium

**No TypeScript strict mode:**
- What's not tested: Type safety; implicit `any` types accepted
- Files: `tsconfig.app.json`, potentially all files with loose typing
- Risk: Runtime errors from type mismatches not caught at compile time
- Priority: Medium

---

*Concerns audit: 2026-02-22*
