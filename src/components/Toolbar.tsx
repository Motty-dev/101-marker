import React, { useRef } from 'react'

interface ToolbarProps {
  pdfFileName: string
  templateName: string
  currentPage: number
  totalPages: number
  placementMode: boolean
  hasPdf: boolean
  onFileUpload: (file: File) => void
  onPageChange: (page: number) => void
  onTogglePlacement: () => void
  onExport: () => void
  onImport: (json: string) => void
  onTemplateNameChange: (name: string) => void
  zoom: number
  onZoomChange: (zoom: number) => void
}

export const Toolbar: React.FC<ToolbarProps> = ({
  pdfFileName,
  templateName,
  currentPage,
  totalPages,
  placementMode,
  hasPdf,
  onFileUpload,
  onPageChange,
  onTogglePlacement,
  onExport,
  onImport,
  onTemplateNameChange,
  zoom,
  onZoomChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      onFileUpload(file)
    }
    e.target.value = ''
  }

  const handleImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        if (ev.target?.result) {
          onImport(ev.target.result as string)
        }
      }
      reader.readAsText(file)
    }
    e.target.value = ''
  }

  return (
    <div style={styles.toolbar} className="app-toolbar">
      <div style={styles.left} className="toolbar-left">
        {/* Logo */}
        <div style={styles.logo}>
          <span style={styles.logoIcon}>◈</span>
          <span style={styles.logoText}>101<span style={styles.logoAccent}>marker</span></span>
        </div>

        {/* Template name */}
        <input
          type="text"
          value={templateName}
          onChange={(e) => onTemplateNameChange(e.target.value)}
          placeholder="template_name"
          style={styles.templateInput}
          className="toolbar-template"
          title="Template name"
        />

        {/* Upload button */}
        <button
          style={styles.btn}
          onClick={() => fileInputRef.current?.click()}
          title="Upload PDF"
        >
          <span style={styles.btnIcon}>⬆</span>
          Upload PDF
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {/* File name display */}
        {pdfFileName && (
          <span style={styles.fileName} title={pdfFileName}>
            {pdfFileName.length > 20 ? '...' + pdfFileName.slice(-17) : pdfFileName}
          </span>
        )}
      </div>

      <div style={styles.center} className="toolbar-center">
        {/* Page navigation */}
        {hasPdf && (
          <div style={styles.pageNav}>
            <button
              style={{ ...styles.pageBtn, opacity: currentPage <= 1 ? 0.3 : 1 }}
              onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              ◀
            </button>
            <span style={styles.pageInfo}>
              <span style={styles.pageNum}>{currentPage}</span>
              <span style={styles.pageSlash}>/</span>
              <span style={styles.pageTotal}>{totalPages}</span>
            </span>
            <button
              style={{ ...styles.pageBtn, opacity: currentPage >= totalPages ? 0.3 : 1 }}
              onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              ▶
            </button>
          </div>
        )}

        {/* Zoom */}
        {hasPdf && (
          <div style={styles.zoomControl}>
            <button
              style={styles.zoomBtn}
              onClick={() => onZoomChange(Math.max(0.5, zoom - 0.25))}
            >−</button>
            <span style={styles.zoomVal}>{Math.round(zoom * 100)}%</span>
            <button
              style={styles.zoomBtn}
              onClick={() => onZoomChange(Math.min(3, zoom + 0.25))}
            >+</button>
          </div>
        )}
      </div>

      <div style={styles.right} className="toolbar-right">
        {/* Add field button */}
        {hasPdf && (
          <button
            style={{
              ...styles.btn,
              ...styles.addBtn,
              ...(placementMode ? styles.addBtnActive : {}),
            }}
            onClick={onTogglePlacement}
            title="Add field (click on PDF to place)"
          >
            <span style={styles.btnIcon}>{placementMode ? '✕' : '+'}</span>
            {placementMode ? 'Cancel' : 'Add Field'}
          </button>
        )}

        {/* Import */}
        <button
          style={{ ...styles.btn, ...styles.importBtn }}
          onClick={() => importInputRef.current?.click()}
          title="Import template JSON"
        >
          <span style={styles.btnIcon}>↓</span>
          Import
        </button>
        <input
          ref={importInputRef}
          type="file"
          accept=".json"
          onChange={handleImportChange}
          style={{ display: 'none' }}
        />

        {/* Export */}
        <button
          style={{
            ...styles.btn,
            ...styles.exportBtn,
            opacity: hasPdf ? 1 : 0.4,
          }}
          onClick={onExport}
          disabled={!hasPdf}
          title="Export template JSON"
        >
          <span style={styles.btnIcon}>↑</span>
          Export JSON
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    background: '#0d0d1a',
    borderBottom: '1px solid #1e2040',
    padding: '0 16px',
    gap: 12,
    flexShrink: 0,
    position: 'relative',
    zIndex: 100,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  center: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    justifyContent: 'center',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'flex-end',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginRight: 4,
  },
  logoIcon: {
    color: '#4f7fff',
    fontSize: 18,
    lineHeight: 1,
  },
  logoText: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 14,
    fontWeight: 600,
    color: '#e8eaf6',
    letterSpacing: '0.05em',
  },
  logoAccent: {
    color: '#4f7fff',
  },
  templateInput: {
    background: '#12122a',
    border: '1px solid #2a2d5a',
    borderRadius: 4,
    color: '#9fa8da',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    padding: '4px 8px',
    width: 160,
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  fileName: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    color: '#5c6bc0',
    background: '#12122a',
    padding: '3px 8px',
    borderRadius: 3,
    border: '1px solid #1e2040',
    maxWidth: 200,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  btn: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    background: '#12122a',
    border: '1px solid #2a2d5a',
    borderRadius: 4,
    color: '#9fa8da',
    fontFamily: "'Heebo', sans-serif",
    fontSize: 12,
    fontWeight: 500,
    padding: '5px 10px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s',
  },
  btnIcon: {
    fontSize: 13,
    lineHeight: 1,
  },
  addBtn: {
    background: '#1a1f4a',
    border: '1px solid #3d4494',
    color: '#7986cb',
  },
  addBtnActive: {
    background: '#2d1a3a',
    border: '1px solid #7b3f8c',
    color: '#ce93d8',
  },
  importBtn: {
    background: '#12122a',
    border: '1px solid #2a2d5a',
    color: '#78909c',
  },
  exportBtn: {
    background: '#0d2d1a',
    border: '1px solid #1b5e34',
    color: '#69f0ae',
    fontWeight: 600,
  },
  pageNav: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#12122a',
    border: '1px solid #2a2d5a',
    borderRadius: 4,
    padding: '4px 8px',
  },
  pageBtn: {
    background: 'none',
    border: 'none',
    color: '#7986cb',
    cursor: 'pointer',
    fontSize: 12,
    padding: '0 2px',
    lineHeight: 1,
  },
  pageInfo: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 3,
  },
  pageNum: {
    color: '#e8eaf6',
    fontWeight: 600,
  },
  pageSlash: {
    color: '#3d4494',
  },
  pageTotal: {
    color: '#5c6bc0',
  },
  zoomControl: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: '#12122a',
    border: '1px solid #2a2d5a',
    borderRadius: 4,
    padding: '4px 8px',
  },
  zoomBtn: {
    background: 'none',
    border: 'none',
    color: '#7986cb',
    cursor: 'pointer',
    fontSize: 16,
    lineHeight: 1,
    padding: 0,
    width: 16,
    textAlign: 'center',
  },
  zoomVal: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    color: '#9fa8da',
    minWidth: 36,
    textAlign: 'center',
  },
}
