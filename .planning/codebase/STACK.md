# Technology Stack

**Analysis Date:** 2026-02-22

## Languages

**Primary:**
- TypeScript ~5.9.3 - Full codebase (`.tsx` and `.ts` files)
- HTML5 - Application markup in `index.html`
- CSS-in-JS - Inline styles via React component props

**Secondary:**
- JavaScript (ES2022) - Configuration files and tooling

## Runtime

**Environment:**
- Node.js 18+ (inferred from package.json, @types/node 24.x)
- Browser environment (React DOM)

**Package Manager:**
- npm - Primary package manager
- Lockfile: `package-lock.json` (present, version 3)

## Frameworks

**Core:**
- React 19.2.0 - UI framework and component library
  - React DOM 19.2.0 - DOM rendering
  - Strict Mode enabled via `src/main.tsx`

**Build/Dev:**
- Vite 7.3.1 - Development server and build tool
  - Config: `vite.config.ts`
  - React plugin: @vitejs/plugin-react 5.1.1
  - Development server port: 9999
  - Module alias configured: `@` → `src/`

**PDF Processing:**
- PDF.js (pdfjs-dist 5.4.624) - PDF document rendering and parsing
  - Uses local worker bundled with pdfjs-dist
  - Worker configured in `src/utils/pdfRenderer.ts`
  - Vite optimization: excluded from dependency optimization

## Key Dependencies

**Critical:**
- pdfjs-dist 5.4.624 - PDF rendering engine
  - Used for: Loading PDF files, rendering pages, extracting page dimensions
  - Worker: `pdf.worker.min.mjs` bundled locally

## Development Dependencies

**Code Quality:**
- eslint 9.39.1 - Linting
  - Config: `eslint.config.js` (flat config format)
  - Extends: @eslint/js, typescript-eslint, eslint-plugin-react-hooks, eslint-plugin-react-refresh
  - @eslint/js 9.39.1
  - typescript-eslint 8.48.0

- eslint-plugin-react-hooks 7.0.1 - React Hooks best practices
- eslint-plugin-react-refresh 0.4.24 - Vite React refresh compatibility

**Type Checking:**
- TypeScript 5.9.3
  - Target: ES2022
  - Module: ESNext
  - JSX: react-jsx
  - Strict mode enabled
  - No unused locals/parameters
  - Bundler module resolution

**Utilities:**
- @types/react 19.2.7 - React type definitions
- @types/react-dom 19.2.3 - React DOM type definitions
- @types/node 24.10.13 - Node.js type definitions
- globals 16.5.0 - Global variable type definitions

## Configuration

**Environment:**
- No `.env` file detected
- No environment-based configuration
- All configuration is client-side and embedded

**Build:**
- TypeScript build: `tsc -b` (project references)
- Vite build: `vite build`
- Source: `src/`
- Output: `dist/`

**Development:**
- `npm run dev` - Start Vite development server on port 9999
- `npm run build` - Compile TypeScript and bundle with Vite
- `npm run lint` - Run ESLint on all files
- `npm run preview` - Preview production build locally

## Platform Requirements

**Development:**
- Node.js 18+
- npm 9+
- Modern browser (Chrome, Firefox, Safari, Edge)

**Production:**
- Static hosting (GitHub Pages, Vercel, Netlify, etc.)
- No backend server required
- No database required
- No authentication required

## Browser APIs Used

**File Handling:**
- File API - PDF file upload handling
- FileReader - PDF file reading
- Blob API - JSON template export
- URL API - Object URL creation for downloads

**Canvas API:**
- Canvas 2D context - PDF page rendering via pdfjs-dist
- HTMLCanvasElement - Rendering surface

**DOM APIs:**
- Standard DOM events (click, drag, drop, keyboard)
- LocalStorage not used (state kept in React)

---

*Stack analysis: 2026-02-22*
