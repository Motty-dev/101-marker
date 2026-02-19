import React, { useRef, useCallback } from 'react'
import type { FieldDefinition, PDFViewport, TextStyle, CheckFieldStyle } from '../types'
import { pdfToScreen, pdfSizeToScreen, screenDeltaToPdf } from '../utils/coordUtils'

interface MarkerRectProps {
  field: FieldDefinition
  viewport: PDFViewport
  isSelected: boolean
  previewValue: string
  onSelect: (id: string) => void
  onMove: (id: string, newX: number, newY: number) => void
  onResize: (id: string, newWidth: number, newHeight: number) => void
}

const TYPE_COLORS: Record<string, string> = {
  text: '#4f7fff',
  number: '#43e97b',
  check: '#ff9f43',
}

export const MarkerRect: React.FC<MarkerRectProps> = ({
  field,
  viewport,
  isSelected,
  previewValue,
  onSelect,
  onMove,
  onResize,
}) => {
  const color = TYPE_COLORS[field.type] || '#4f7fff'
  const screenPos = pdfToScreen(field.x, field.y, viewport)
  const screenSize = pdfSizeToScreen(field.width, field.height, viewport.scale)

  const dragRef = useRef<{
    active: boolean
    startMouseX: number
    startMouseY: number
    startPdfX: number
    startPdfY: number
  } | null>(null)

  const resizeRef = useRef<{
    active: boolean
    startMouseX: number
    startMouseY: number
    startWidth: number
    startHeight: number
  } | null>(null)

  // Drag to move
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      onSelect(field.id)

      dragRef.current = {
        active: true,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        startPdfX: field.x,
        startPdfY: field.y,
      }

      const handleMouseMove = (ev: MouseEvent) => {
        if (!dragRef.current?.active) return
        const dx = ev.clientX - dragRef.current.startMouseX
        const dy = ev.clientY - dragRef.current.startMouseY
        const delta = screenDeltaToPdf(dx, dy, viewport.scale)
        const newX = Math.max(0, dragRef.current.startPdfX + delta.dx)
        const newY = Math.max(0, dragRef.current.startPdfY + delta.dy)
        onMove(field.id, Math.round(newX * 10) / 10, Math.round(newY * 10) / 10)
      }

      const handleMouseUp = () => {
        if (dragRef.current) dragRef.current.active = false
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }

      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    },
    [field.id, field.x, field.y, viewport.scale, onSelect, onMove]
  )

  // Resize BR handle
  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()

      resizeRef.current = {
        active: true,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        startWidth: field.width,
        startHeight: field.height,
      }

      const handleMouseMove = (ev: MouseEvent) => {
        if (!resizeRef.current?.active) return
        const dx = ev.clientX - resizeRef.current.startMouseX
        const dy = ev.clientY - resizeRef.current.startMouseY
        const newWidth = Math.max(8, resizeRef.current.startWidth + dx / viewport.scale)
        const newHeight = Math.max(8, resizeRef.current.startHeight - dy / viewport.scale)
        onResize(field.id, Math.round(newWidth * 10) / 10, Math.round(newHeight * 10) / 10)
      }

      const handleMouseUp = () => {
        if (resizeRef.current) resizeRef.current.active = false
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }

      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    },
    [field.id, field.width, field.height, viewport.scale, onResize]
  )

  const top = screenPos.y - screenSize.height
  const left = screenPos.x

  // ── Render the content inside the rect based on type + styles ──
  const renderContent = () => {
    if (field.type === 'check') {
      const cs = field.style as CheckFieldStyle
      const symbol = cs.checkStyle === 'v' ? '✓' : '✕'
      // always render at full opacity — just shows which mark & at what size
      const sizePx = cs.checkSize * viewport.scale
      return (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: sizePx,
            color: cs.color,
            lineHeight: 1,
            pointerEvents: 'none',
            userSelect: 'none',
            overflow: 'hidden',
          }}
        >
          {symbol}
        </div>
      )
    }

    // text / number — honour font, size, alignment, letter-spacing from style
    const ts = field.style as TextStyle
    const displayText = previewValue || ''
    const hasText = displayText.length > 0

    // Scale font size from PDF pts to screen px
    const fontSizePx = ts.fontSize * viewport.scale
    // letter-spacing in CSS px (PDF pts → screen px)
    const letterSpacingPx = ts.letterSpacing * viewport.scale

    // Map alignment to flex justify-content
    const justifyMap: Record<string, string> = {
      left: 'flex-start',
      center: 'center',
      right: 'flex-end',
    }

    return (
      <div
        style={{
          position: 'absolute',
          inset: '0 3px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: justifyMap[ts.alignment] ?? 'flex-start',
          overflow: 'hidden',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <span
          style={{
            fontFamily: ts.fontFamily,
            fontSize: fontSizePx,
            letterSpacing: letterSpacingPx,
            color: hasText ? ts.color : `${color}55`,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            lineHeight: 1.1,
            flexShrink: 0,
            maxWidth: '100%',
          }}
        >
          {hasText ? displayText : field.id}
        </span>
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width: screenSize.width,
        height: screenSize.height,
        boxSizing: 'border-box',
        border: isSelected
          ? `2px solid ${color}`
          : `1.5px dashed ${color}cc`,
        borderRadius: 2,
        cursor: 'move',
        userSelect: 'none',
        backgroundColor: isSelected ? `${color}20` : `${color}0a`,
        transition: 'background-color 0.1s',
        zIndex: isSelected ? 20 : 10,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Inline content — styled text / check / number */}
      {renderContent()}

      {/* Label chip above rect */}
      <div
        style={{
          position: 'absolute',
          top: -18,
          left: -1,
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          whiteSpace: 'nowrap',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9,
          fontWeight: 600,
          color: color,
          background: '#0d0d1aee',
          padding: '1px 5px 1px 3px',
          borderRadius: '3px 3px 0 0',
          border: `1px solid ${color}55`,
          borderBottom: 'none',
          lineHeight: 1.7,
          pointerEvents: 'none',
          letterSpacing: '0.03em',
        }}
      >
        {/* type dot */}
        <span
          style={{
            display: 'inline-block',
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: color,
            flexShrink: 0,
          }}
        />
        {field.id}
      </div>

      {/* Corner size readout when selected */}
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            bottom: -16,
            right: 0,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 8,
            color: `${color}99`,
            background: '#0d0d1acc',
            padding: '1px 4px',
            borderRadius: '0 0 2px 2px',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {Math.round(field.width)}×{Math.round(field.height)} pts
        </div>
      )}

      {/* Resize handle — bottom-right */}
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            bottom: -5,
            right: -5,
            width: 10,
            height: 10,
            background: color,
            borderRadius: 2,
            cursor: 'nwse-resize',
            border: '1.5px solid #0d0d1a',
            zIndex: 30,
          }}
          onMouseDown={handleResizeMouseDown}
        />
      )}

      {/* Resize handle — bottom-left */}
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            bottom: -5,
            left: -5,
            width: 10,
            height: 10,
            background: color,
            borderRadius: 2,
            cursor: 'nesw-resize',
            border: '1.5px solid #0d0d1a',
            zIndex: 30,
          }}
          onMouseDown={(e) => {
            e.stopPropagation()
            e.preventDefault()
            resizeRef.current = {
              active: true,
              startMouseX: e.clientX,
              startMouseY: e.clientY,
              startWidth: field.width,
              startHeight: field.height,
            }
            const startX = field.x
            const handleMouseMove = (ev: MouseEvent) => {
              if (!resizeRef.current?.active) return
              const dx = ev.clientX - resizeRef.current.startMouseX
              const pdfDx = dx / viewport.scale
              const newWidth = Math.max(8, resizeRef.current.startWidth - pdfDx)
              const newX = startX + (resizeRef.current.startWidth - newWidth)
              onMove(field.id, Math.round(newX * 10) / 10, field.y)
              onResize(field.id, Math.round(newWidth * 10) / 10, field.height)
            }
            const handleMouseUp = () => {
              if (resizeRef.current) resizeRef.current.active = false
              window.removeEventListener('mousemove', handleMouseMove)
              window.removeEventListener('mouseup', handleMouseUp)
            }
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
          }}
        />
      )}
    </div>
  )
}
