import type { PDFViewport } from '../types'

/**
 * Convert screen pixel coordinates to PDF point coordinates.
 * PDF origin is bottom-left; screen origin is top-left.
 */
export function screenToPdf(
  screenX: number,
  screenY: number,
  viewport: PDFViewport
): { x: number; y: number } {
  const scale = viewport.scale
  const pdfX = screenX / scale
  const pdfY = (viewport.height - screenY) / scale
  return {
    x: Math.round(pdfX * 100) / 100,
    y: Math.round(pdfY * 100) / 100,
  }
}

/**
 * Convert PDF point coordinates to screen pixel coordinates.
 */
export function pdfToScreen(
  pdfX: number,
  pdfY: number,
  viewport: PDFViewport
): { x: number; y: number } {
  const scale = viewport.scale
  const screenX = pdfX * scale
  const screenY = viewport.height - pdfY * scale
  return { x: screenX, y: screenY }
}

/**
 * Convert PDF dimensions (width/height) to screen pixel dimensions.
 */
export function pdfSizeToScreen(
  pdfWidth: number,
  pdfHeight: number,
  scale: number
): { width: number; height: number } {
  return {
    width: pdfWidth * scale,
    height: pdfHeight * scale,
  }
}

/**
 * Convert screen pixel delta to PDF point delta.
 */
export function screenDeltaToPdf(
  deltaX: number,
  deltaY: number,
  scale: number
): { dx: number; dy: number } {
  return {
    dx: deltaX / scale,
    dy: -deltaY / scale, // Y is flipped
  }
}

/**
 * Clamp a value between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Generate a unique field ID.
 */
export function generateFieldId(existingIds: string[]): string {
  let counter = 1
  while (existingIds.includes(`field_${counter}`)) {
    counter++
  }
  return `field_${counter}`
}

/**
 * Slugify a string for use as a field ID.
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/__+/g, '_')
    .replace(/^_|_$/g, '')
}
