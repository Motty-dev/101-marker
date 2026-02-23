import React, { useCallback } from 'react'
import type { FieldDefinition, PDFViewport } from '../types'
import { MarkerRect } from './MarkerRect'
import { screenToPdf } from '../utils/coordUtils'

interface MarkerOverlayProps {
  fields: FieldDefinition[]
  viewport: PDFViewport | null
  selectedFieldId: string | null
  placementMode: boolean
  previewValues: Record<string, string>
  onSelect: (id: string) => void
  onPlace: (pdfX: number, pdfY: number) => void
  onMove: (id: string, x: number, y: number) => void
  onResize: (id: string, width: number, height: number) => void
}

export const MarkerOverlay: React.FC<MarkerOverlayProps> = ({
  fields,
  viewport,
  selectedFieldId,
  placementMode,
  previewValues,
  onSelect,
  onPlace,
  onMove,
  onResize,
}) => {
  const [ghostPos, setGhostPos] = React.useState<{ x: number; y: number } | null>(null)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!placementMode || !viewport) return
      const rect = e.currentTarget.getBoundingClientRect()
      const screenX = e.clientX - rect.left
      const screenY = e.clientY - rect.top
      setGhostPos({ x: screenX, y: screenY })
    },
    [placementMode, viewport]
  )

  const handleMouseLeave = useCallback(() => {
    setGhostPos(null)
  }, [])

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!placementMode || !viewport) return
      e.stopPropagation()
      const rect = e.currentTarget.getBoundingClientRect()
      const screenX = e.clientX - rect.left
      const screenY = e.clientY - rect.top
      const { x, y } = screenToPdf(screenX, screenY, viewport)
      onPlace(x, y)
      setGhostPos(null)
    },
    [placementMode, viewport, onPlace]
  )

  // Touch support: tap to place on mobile
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!placementMode || !viewport) return
      e.preventDefault()
      const touch = e.changedTouches[0]
      if (!touch) return
      const rect = e.currentTarget.getBoundingClientRect()
      const screenX = touch.clientX - rect.left
      const screenY = touch.clientY - rect.top
      const { x, y } = screenToPdf(screenX, screenY, viewport)
      onPlace(x, y)
      setGhostPos(null)
    },
    [placementMode, viewport, onPlace]
  )

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!placementMode) {
        // Clicking empty area deselects
        if (e.target === e.currentTarget) {
          onSelect('')
        }
      }
    },
    [placementMode, onSelect]
  )

  if (!viewport) return null

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: viewport.width,
        height: viewport.height,
        cursor: placementMode ? 'crosshair' : 'default',
        pointerEvents: 'all',
        zIndex: 5,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={placementMode ? handleClick : handleOverlayClick}
      onTouchEnd={handleTouchEnd}
    >
      {/* Render all fields */}
      {fields.map((field) => (
        <MarkerRect
          key={field.id}
          field={field}
          viewport={viewport}
          isSelected={selectedFieldId === field.id}
          previewValue={previewValues[field.id] ?? ''}
          onSelect={onSelect}
          onMove={onMove}
          onResize={onResize}
        />
      ))}

      {/* Ghost cursor rectangle in placement mode */}
      {placementMode && ghostPos && (
        <div
          style={{
            position: 'absolute',
            left: ghostPos.x,
            top: ghostPos.y - 40,
            width: 100 * viewport.scale,
            height: 20 * viewport.scale,
            border: '1.5px dashed rgba(79, 127, 255, 0.6)',
            borderRadius: 2,
            background: 'rgba(79, 127, 255, 0.08)',
            pointerEvents: 'none',
            zIndex: 50,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -17,
              left: 0,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              color: 'rgba(79, 127, 255, 0.8)',
              background: '#0d0d1a',
              padding: '1px 4px',
              borderRadius: 2,
              whiteSpace: 'nowrap',
            }}
          >
            click to place
          </div>
        </div>
      )}
    </div>
  )
}
