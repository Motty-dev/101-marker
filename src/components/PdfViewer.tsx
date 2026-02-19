import React, { useRef, useEffect, useState } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import type { FieldDefinition, PDFViewport } from '../types'
import { MarkerOverlay } from './MarkerOverlay'
import { renderPageToCanvas } from '../utils/pdfRenderer'

interface PdfViewerProps {
  pdfDoc: PDFDocumentProxy | null
  currentPage: number
  zoom: number
  fields: FieldDefinition[]
  selectedFieldId: string | null
  placementMode: boolean
  previewValues: Record<string, string>
  onViewportChange: (page: number, viewport: PDFViewport) => void
  onSelect: (id: string) => void
  onPlace: (pdfX: number, pdfY: number) => void
  onMove: (id: string, x: number, y: number) => void
  onResize: (id: string, width: number, height: number) => void
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  pdfDoc,
  currentPage,
  zoom,
  fields,
  selectedFieldId,
  placementMode,
  previewValues,
  onViewportChange,
  onSelect,
  onPlace,
  onMove,
  onResize,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [viewport, setViewport] = useState<PDFViewport | null>(null)
  const [isRendering, setIsRendering] = useState(false)

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return

    let cancelled = false
    setIsRendering(true)

    renderPageToCanvas(pdfDoc, currentPage, canvasRef.current, zoom)
      .then((vp) => {
        if (!cancelled) {
          setViewport(vp)
          onViewportChange(currentPage, vp)
          setIsRendering(false)
        }
      })
      .catch((err) => {
        console.error('Error rendering PDF page:', err)
        if (!cancelled) setIsRendering(false)
      })

    return () => {
      cancelled = true
    }
  }, [pdfDoc, currentPage, zoom]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!pdfDoc) {
    return (
      <div style={styles.empty}>
        <div style={styles.emptyContent}>
          <div style={styles.emptyIcon}>⬆</div>
          <div style={styles.emptyTitle}>No PDF loaded</div>
          <div style={styles.emptySubtitle}>Upload a PDF to begin mapping fields</div>
          <div style={styles.emptyHint}>
            Supports drag-and-drop or click to browse
          </div>
        </div>
        {/* Grid background decoration */}
        <div style={styles.grid} />
      </div>
    )
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.scrollContainer}>
        <div
          style={{
            position: 'relative',
            display: 'inline-block',
            boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
          }}
        >
          {/* Loading overlay */}
          {isRendering && (
            <div style={styles.loadingOverlay}>
              <div style={styles.loadingDot} />
              <div style={styles.loadingDot} />
              <div style={styles.loadingDot} />
            </div>
          )}

          {/* PDF canvas */}
          <canvas ref={canvasRef} style={{ display: 'block' }} />

          {/* Marker overlay */}
          {viewport && (
            <MarkerOverlay
              fields={fields}
              viewport={viewport}
              selectedFieldId={selectedFieldId}
              placementMode={placementMode}
              previewValues={previewValues}
              onSelect={onSelect}
              onPlace={onPlace}
              onMove={onMove}
              onResize={onResize}
            />
          )}
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    background: '#111122',
    position: 'relative',
  },
  scrollContainer: {
    flex: 1,
    overflow: 'auto',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: 32,
  },
  empty: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0d0d1a',
    position: 'relative',
    overflow: 'hidden',
  },
  emptyContent: {
    textAlign: 'center',
    zIndex: 1,
    padding: 32,
  },
  emptyIcon: {
    fontSize: 48,
    color: '#2a2d5a',
    marginBottom: 16,
    lineHeight: 1,
  },
  emptyTitle: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 18,
    color: '#3d4494',
    marginBottom: 8,
    fontWeight: 500,
  },
  emptySubtitle: {
    fontFamily: "'Heebo', sans-serif",
    fontSize: 14,
    color: '#2a2d5a',
    marginBottom: 6,
  },
  emptyHint: {
    fontFamily: "'Heebo', sans-serif",
    fontSize: 12,
    color: '#1e2040',
  },
  grid: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'linear-gradient(#1e204022 1px, transparent 1px), linear-gradient(90deg, #1e204022 1px, transparent 1px)',
    backgroundSize: '40px 40px',
    zIndex: 0,
  },
  loadingOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(13, 13, 26, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 100,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#4f7fff',
    animation: 'pulse 1s ease-in-out infinite',
  },
}
