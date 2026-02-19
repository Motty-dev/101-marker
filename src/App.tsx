import React, { useState, useEffect, useCallback } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import type { FieldDefinition, PDFViewport, Template } from './types'
import { Toolbar } from './components/Toolbar'
import { PdfViewer } from './components/PdfViewer'
import { FieldEditor } from './components/FieldEditor'
import { FieldList } from './components/FieldList'
import { ExportModal } from './components/ExportModal'
import { loadPdfDocument, getPageDimensions } from './utils/pdfRenderer'
import { generateFieldId } from './utils/coordUtils'

function createDefaultField(
  id: string,
  pdfX: number,
  pdfY: number
): FieldDefinition {
  return {
    id,
    type: 'text',
    x: pdfX,
    y: pdfY,
    width: 100,
    height: 20,
    style: {
      fontSize: 12,
      fontFamily: 'Arial',
      letterSpacing: 0,
      color: '#000000',
      alignment: 'left',
    },
  }
}

export default function App() {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null)
  const [pdfFileName, setPdfFileName] = useState('')
  const [templateName, setTemplateName] = useState('my_form_template')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [zoom, setZoom] = useState(1.5)
  const [fields, setFields] = useState<Record<number, FieldDefinition[]>>({})
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)
  const [placementMode, setPlacementMode] = useState(false)
  const [viewports, setViewports] = useState<Record<number, PDFViewport>>({})
  const [showExport, setShowExport] = useState(false)
  const [pageDimensions, setPageDimensions] = useState<Record<number, { width: number; height: number }>>({})
  // previewValues: fieldId → sample value entered in the editor (not exported)
  const [previewValues, setPreviewValues] = useState<Record<string, string>>({})

  const currentFields = fields[currentPage] || []
  const allFieldIds = Object.values(fields).flat().map((f) => f.id)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPlacementMode(false)
        setSelectedFieldId(null)
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedFieldId) {
        const active = document.activeElement
        if (active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA' || active?.tagName === 'SELECT') return
        handleDeleteField(selectedFieldId)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedFieldId, currentPage]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      const doc = await loadPdfDocument(file)
      setPdfDoc(doc)
      setPdfFileName(file.name)
      setCurrentPage(1)
      setTotalPages(doc.numPages)
      setFields({})
      setSelectedFieldId(null)
      setPlacementMode(false)
      setPageDimensions({})
      setViewports({})
      setPreviewValues({})

      const dims: Record<number, { width: number; height: number }> = {}
      for (let p = 1; p <= doc.numPages; p++) {
        dims[p] = await getPageDimensions(doc, p)
      }
      setPageDimensions(dims)
    } catch (err) {
      console.error('Failed to load PDF:', err)
      alert('Failed to load PDF. Please try again.')
    }
  }, [])

  const handleViewportChange = useCallback((page: number, viewport: PDFViewport) => {
    setViewports((prev) => ({ ...prev, [page]: viewport }))
  }, [])

  const handleTogglePlacement = useCallback(() => {
    setPlacementMode((prev) => !prev)
    setSelectedFieldId(null)
  }, [])

  const handlePlace = useCallback(
    (pdfX: number, pdfY: number) => {
      const newId = generateFieldId(allFieldIds)
      const newField = createDefaultField(newId, pdfX, pdfY)
      setFields((prev) => ({
        ...prev,
        [currentPage]: [...(prev[currentPage] || []), newField],
      }))
      setSelectedFieldId(newId)
      setPlacementMode(false)
    },
    [allFieldIds, currentPage]
  )

  const handleSelect = useCallback((id: string) => {
    setSelectedFieldId(id || null)
  }, [])

  const handleUpdateField = useCallback(
    (updated: FieldDefinition) => {
      // Use selectedFieldId as the stable lookup key so renames work correctly
      setFields((prev) => ({
        ...prev,
        [currentPage]: (prev[currentPage] || []).map((f) =>
          f.id === (selectedFieldId ?? updated.id) ? updated : f
        ),
      }))
      // If the id was renamed, keep selectedFieldId and previewValues in sync
      if (selectedFieldId && updated.id !== selectedFieldId) {
        setSelectedFieldId(updated.id)
        setPreviewValues((prev) => {
          const val = prev[selectedFieldId]
          if (val === undefined) return prev
          const next = { ...prev }
          delete next[selectedFieldId]
          next[updated.id] = val
          return next
        })
      }
    },
    [currentPage, selectedFieldId]
  )

  const handleMoveField = useCallback(
    (id: string, x: number, y: number) => {
      setFields((prev) => ({
        ...prev,
        [currentPage]: (prev[currentPage] || []).map((f) =>
          f.id === id ? { ...f, x, y } : f
        ),
      }))
    },
    [currentPage]
  )

  const handleResizeField = useCallback(
    (id: string, width: number, height: number) => {
      setFields((prev) => ({
        ...prev,
        [currentPage]: (prev[currentPage] || []).map((f) =>
          f.id === id ? { ...f, width, height } : f
        ),
      }))
    },
    [currentPage]
  )

  const handleDeleteField = useCallback(
    (id: string) => {
      setFields((prev) => ({
        ...prev,
        [currentPage]: (prev[currentPage] || []).filter((f) => f.id !== id),
      }))
      setSelectedFieldId((prev) => (prev === id ? null : prev))
    },
    [currentPage]
  )

  const buildTemplate = useCallback((): Template => {
    const pages = Object.entries(fields)
      .filter(([, fs]) => fs.length > 0)
      .map(([pageStr, fs]) => {
        const page = parseInt(pageStr)
        const dims = pageDimensions[page] || { width: 595.28, height: 841.89 }
        return {
          page,
          width: Math.round(dims.width * 100) / 100,
          height: Math.round(dims.height * 100) / 100,
          fields: fs,
        }
      })
      .sort((a, b) => a.page - b.page)

    return {
      templateName,
      pdfFileName,
      createdAt: new Date().toISOString(),
      pages,
    }
  }, [fields, pageDimensions, templateName, pdfFileName])

  const handleDownload = useCallback(() => {
    const template = buildTemplate()
    const json = JSON.stringify(template, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${templateName}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [buildTemplate, templateName])

  const handleImport = useCallback((jsonStr: string) => {
    try {
      const template: Template = JSON.parse(jsonStr)
      setTemplateName(template.templateName || 'imported_template')
      const newFields: Record<number, FieldDefinition[]> = {}
      for (const page of template.pages) {
        newFields[page.page] = page.fields
      }
      setFields(newFields)
      setSelectedFieldId(null)
      const total = Object.values(newFields).flat().length
      alert(
        `Imported ${template.pages.length} page(s) with ${total} field(s).\nMake sure to load the matching PDF: ${template.pdfFileName}`
      )
    } catch {
      alert('Failed to parse JSON template. Please check the file format.')
    }
  }, [])

  const selectedField = currentFields.find((f) => f.id === selectedFieldId) || null

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file?.type === 'application/pdf') {
        handleFileUpload(file)
      }
    },
    [handleFileUpload]
  )

  const template = buildTemplate()

  return (
    <div style={styles.app} onDragOver={handleDragOver} onDrop={handleDrop}>
      <style>{globalCSS}</style>

      <Toolbar
        pdfFileName={pdfFileName}
        templateName={templateName}
        currentPage={currentPage}
        totalPages={totalPages}
        placementMode={placementMode}
        hasPdf={!!pdfDoc}
        onFileUpload={handleFileUpload}
        onPageChange={setCurrentPage}
        onTogglePlacement={handleTogglePlacement}
        onExport={() => setShowExport(true)}
        onImport={handleImport}
        onTemplateNameChange={setTemplateName}
        zoom={zoom}
        onZoomChange={setZoom}
      />

      {placementMode && (
        <div style={styles.placementBanner}>
          <span className="placement-blink">◎</span>
          &nbsp; Placement mode — click anywhere on the PDF to place a field &nbsp;·&nbsp;
          <button
            style={styles.placementCancelBtn}
            onClick={() => setPlacementMode(false)}
          >
            Press Esc or click to cancel
          </button>
        </div>
      )}

      <div style={styles.main}>
        <div style={styles.canvasArea}>
          <PdfViewer
            pdfDoc={pdfDoc}
            currentPage={currentPage}
            zoom={zoom}
            fields={currentFields}
            selectedFieldId={selectedFieldId}
            placementMode={placementMode}
            previewValues={previewValues}
            onViewportChange={handleViewportChange}
            onSelect={handleSelect}
            onPlace={handlePlace}
            onMove={handleMoveField}
            onResize={handleResizeField}
          />
        </div>

        <div style={styles.sidebar}>
          <div style={styles.editorSection}>
            <FieldEditor
              field={selectedField}
              allFieldIds={allFieldIds}
              onUpdate={handleUpdateField}
              onDelete={handleDeleteField}
              onDeselect={() => setSelectedFieldId(null)}
              previewValue={selectedFieldId ? (previewValues[selectedFieldId] ?? '') : ''}
              onPreviewValueChange={(val) => {
                if (selectedFieldId) {
                  setPreviewValues((prev) => ({ ...prev, [selectedFieldId]: val }))
                }
              }}
            />
          </div>
          <div style={styles.listSection}>
            <FieldList
              fields={currentFields}
              selectedFieldId={selectedFieldId}
              onSelect={handleSelect}
              onDelete={handleDeleteField}
            />
          </div>
        </div>
      </div>

      {showExport && (
        <ExportModal
          template={template}
          onClose={() => setShowExport(false)}
          onDownload={() => {
            handleDownload()
            setShowExport(false)
          }}
        />
      )}
    </div>
  )
}

const globalCSS = `
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; height: 100%; }
  body { background: #0d0d1a; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: #0d0d1a; }
  ::-webkit-scrollbar-thumb { background: #2a2d5a; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #3d4494; }
  input[type=number]::-webkit-inner-spin-button { opacity: 0.4; }
  input[type=color] { -webkit-appearance: none; appearance: none; }
  input[type=color]::-webkit-color-swatch-wrapper { padding: 2px; }
  input[type=color]::-webkit-color-swatch { border-radius: 2px; border: none; }
  input:focus, select:focus { outline: none; border-color: #4f7fff !important; }
  button:active { opacity: 0.7; }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.2; }
  }
  .placement-blink { animation: blink 1.4s ease-in-out infinite; }
`

const styles: Record<string, React.CSSProperties> = {
  app: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
    fontFamily: "'Heebo', sans-serif",
    background: '#0d0d1a',
    color: '#e8eaf6',
  },
  placementBanner: {
    background: '#1a0d2e',
    borderBottom: '1px solid rgba(123, 63, 140, 0.4)',
    padding: '5px 16px',
    fontFamily: "'Heebo', sans-serif",
    fontSize: 12,
    color: '#ce93d8',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  placementCancelBtn: {
    background: 'none',
    border: 'none',
    color: '#9e75b0',
    cursor: 'pointer',
    fontFamily: "'Heebo', sans-serif",
    fontSize: 12,
    padding: 0,
    textDecoration: 'underline',
  },
  main: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    minHeight: 0,
  },
  canvasArea: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  sidebar: {
    width: 280,
    flexShrink: 0,
    background: '#10102a',
    borderLeft: '1px solid #1e2040',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  editorSection: {
    flexShrink: 0,
    overflow: 'hidden',
    maxHeight: '62%',
    display: 'flex',
    flexDirection: 'column',
    borderBottom: '1px solid #1e2040',
  },
  listSection: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
}
