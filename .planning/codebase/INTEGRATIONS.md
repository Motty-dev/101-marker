# External Integrations

**Analysis Date:** 2026-02-22

## APIs & External Services

**Not Detected:** This application is entirely client-side with no external API integrations.

## Data Storage

**Databases:**
- None - No persistent backend storage

**File Storage:**
- Local filesystem only - Client-side PDF upload and template export
- Downloads via browser API
- No cloud storage integration

**Caching:**
- Browser memory (React state) - In-session only
- No persistent cache

**Data Handling:**
- PDFs: Loaded into browser memory from File upload
- Templates: Exported as JSON files, imported from JSON files
- No server-side persistence

## Authentication & Identity

**Auth Provider:**
- None - Not applicable (client-side only)

## Monitoring & Observability

**Error Tracking:**
- None detected

**Logs:**
- Browser console only (`console.error` in error handling)
- No remote logging service

## CI/CD & Deployment

**Hosting:**
- Static site deployment ready (no backend required)
- Suitable for: GitHub Pages, Vercel, Netlify, AWS S3 + CloudFront, etc.

**CI Pipeline:**
- Not detected in repository
- Build command available: `npm run build`

## Environment Configuration

**Required env vars:**
- None - Application requires no environment configuration

**Secrets location:**
- Not applicable - No secrets management needed

## External Resources

**Web Fonts:**
- Google Fonts (via CDN in `index.html`)
  - Heebo (300, 400, 500, 600, 700 weights)
  - JetBrains Mono (400, 500, 600 weights)
  - Via: `https://fonts.googleapis.com/css2?family=...`

**Static Assets:**
- Vite favicon: `/vite.svg`
- No external images or media

## Browser APIs & Standards

**File Operations:**
- File API - PDF upload
- Blob API - JSON export
- URL API - Download link creation

**Canvas & Graphics:**
- HTML5 Canvas - PDF rendering via PDF.js

**DOM Events:**
- Mouse events - Field placement and manipulation
- Keyboard events - Shortcuts and text input
- Drag & Drop - PDF file upload

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## Privacy & Data Handling

**Data Residence:**
- All processing occurs locally in browser
- PDF files never leave user's machine
- Template JSON files downloaded locally

**User Privacy:**
- No tracking
- No telemetry
- No data collection
- No cookies or storage (except session state)

---

*Integration audit: 2026-02-22*
