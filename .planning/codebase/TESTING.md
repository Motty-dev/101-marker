# Testing Patterns

**Analysis Date:** 2026-02-22

## Test Framework

**Status:** Not detected

- No test runner installed: Jest, Vitest, or similar not in `package.json` devDependencies
- No test config files: `jest.config.*`, `vitest.config.*` not present
- No test files: No `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx` files in `/src` directory
- No test scripts in `package.json`: Only `dev`, `build`, `lint`, `preview` scripts defined

**Recommendation:** Testing infrastructure needs to be implemented. See [CONCERNS.md](./CONCERNS.md) for more details.

## Test File Organization

**Current Status:** No tests exist in codebase

**Suggested Future Structure:**
- Co-located test files recommended (TypeScript convention): test file lives next to source
- Naming pattern: `ComponentName.test.tsx` for components, `utilityName.test.ts` for utilities
- Suggested location: `src/components/__tests__/` for component tests (optional), or co-located
- Fixture files: `src/__fixtures__/` for test data and mocks

## Test Structure

**Expected Pattern (to be established):**

For component tests:
```typescript
import { render, screen } from '@testing-library/react'
import { FieldEditor } from './FieldEditor'

describe('FieldEditor', () => {
  it('should display "Select a field to edit" when no field is selected', () => {
    render(<FieldEditor field={null} ... />)
    expect(screen.getByText(/Select a field to edit/i)).toBeInTheDocument()
  })

  // ... more test cases
})
```

For utility tests:
```typescript
import { screenToPdf, pdfToScreen } from './coordUtils'

describe('screenToPdf', () => {
  it('should convert screen coordinates to PDF coordinates', () => {
    const viewport = { width: 800, height: 600, scale: 1.5 }
    const result = screenToPdf(100, 50, viewport)
    expect(result.x).toBeCloseTo(66.67, 1)
    expect(result.y).toBeCloseTo(366.67, 1)
  })
})
```

**Setup Pattern:** Likely to use React Testing Library for component tests, plain test cases for utilities

## Mocking

**Framework to be selected:** Testing Library + Jest/Vitest

**Patterns (suggested based on codebase needs):**

Mocking PDF operations (critical for testing without real PDFs):
```typescript
jest.mock('../utils/pdfRenderer', () => ({
  loadPdfDocument: jest.fn().mockResolvedValue(mockPdfDoc),
  renderPageToCanvas: jest.fn().mockResolvedValue(mockViewport),
  getPageDimensions: jest.fn().mockResolvedValue({ width: 595, height: 842 }),
}))
```

Mocking browser APIs:
```typescript
// Canvas context mock
const mockContext = {
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  // ... other canvas methods
}
global.HTMLCanvasElement.prototype.getContext = jest.fn(() => mockContext)
```

**What to Mock:**
- PDF rendering operations (`pdfRenderer.ts` functions)
- File I/O (FileReader, file uploads)
- Browser canvas operations
- External library calls (pdfjs-dist)

**What NOT to Mock:**
- React hooks behavior (use real useState, useCallback, etc.)
- Coordinate utilities (pure functions, safe to test directly)
- Component rendering logic
- Event handlers

## Fixtures and Factories

**Test Data (to be created):**

Mock PDF document fixture:
```typescript
// src/__fixtures__/mockPdfDoc.ts
export const mockPdfDoc = {
  numPages: 3,
  getPage: jest.fn().mockResolvedValue(mockPdfPage),
}

export const mockPdfPage = {
  getViewport: jest.fn().mockReturnValue({ width: 595, height: 842, scale: 1 }),
  render: jest.fn().mockReturnValue({ promise: Promise.resolve() }),
}
```

Test field factory:
```typescript
// src/__fixtures__/fieldFactory.ts
export function createMockField(overrides?: Partial<FieldDefinition>): FieldDefinition {
  return {
    id: 'field_1',
    type: 'text',
    x: 100,
    y: 200,
    width: 100,
    height: 20,
    style: {
      fontSize: 12,
      fontFamily: 'Arial',
      letterSpacing: 0,
      color: '#000000',
      alignment: 'left',
    },
    ...overrides,
  }
}
```

**Location:** `src/__fixtures__/` directory for shared test utilities

## Coverage

**Requirements:** Not enforced

- No coverage thresholds configured
- CI/CD coverage reporting not implemented
- Baseline: 0% (no tests currently)

**Suggested Future Goals:**
- Utility functions: 90%+ coverage (pure functions, critical for coordinate math)
- Components: 70%+ coverage (complex state logic in `App.tsx`, editor logic in `FieldEditor.tsx`)
- Integration paths: 60%+ coverage (PDF loading, field manipulation)

**View Coverage (when tests added):**
```bash
npm test -- --coverage
# or for Vitest:
vitest --coverage
```

## Test Types

**Unit Tests (for implementation):**
- Coordinate conversion functions: `screenToPdf`, `pdfToScreen`, `screenDeltaToPdf`, `pdfSizeToScreen`, `clamp`
- Field ID generation: `generateFieldId`, `slugify`
- Individual component behavior: FieldEditor state updates, Toolbar controls

**Integration Tests (for implementation):**
- PDF loading flow: upload → parse → render
- Field placement and editing workflow
- Export/import template JSON round-trip
- Keyboard shortcuts (selection, deletion)

**E2E Tests:** Not typically needed for this client-side application; integration tests sufficient

## Common Patterns to Test

**Async Testing (for components and utilities):**
```typescript
it('should load PDF document', async () => {
  const file = new File([], 'test.pdf', { type: 'application/pdf' })
  const doc = await loadPdfDocument(file)
  expect(doc.numPages).toBe(3)
})
```

**Error Testing:**
```typescript
it('should handle PDF loading failure', async () => {
  const file = new File([], 'invalid.pdf', { type: 'application/pdf' })
  // Mock pdfjs to reject
  await expect(loadPdfDocument(file)).rejects.toThrow()
})
```

**State Updates:**
```typescript
it('should update field when edited', () => {
  const { rerender } = render(<FieldEditor field={testField} ... />)
  fireEvent.change(screen.getByDisplayValue('field_1'), { target: { value: 'renamed_field' } })
  expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ id: 'renamed_field' }))
})
```

**Event Handlers:**
```typescript
it('should place field on click in placement mode', async () => {
  render(<MarkerOverlay fields={[]} placementMode={true} {...props} />)
  fireEvent.click(screen.getByRole('none'), { clientX: 100, clientY: 50 })
  expect(onPlace).toHaveBeenCalledWith(expect.any(Number), expect.any(Number))
})
```

---

*Testing analysis: 2026-02-22*
