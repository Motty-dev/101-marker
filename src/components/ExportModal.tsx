import React, { useRef } from 'react'
import type { Template } from '../types'

interface ExportModalProps {
  template: Template
  onClose: () => void
  onDownload: () => void
}

export const ExportModal: React.FC<ExportModalProps> = ({
  template,
  onClose,
  onDownload,
}) => {
  const preRef = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = React.useState(false)

  const jsonStr = JSON.stringify(template, null, 2)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonStr)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      if (preRef.current) {
        const selection = window.getSelection()
        const range = document.createRange()
        range.selectNodeContents(preRef.current)
        selection?.removeAllRanges()
        selection?.addRange(range)
      }
    }
  }

  const totalFields = template.pages.reduce((sum, p) => sum + p.fields.length, 0)

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <span style={styles.headerIcon}>↑</span>
            <div>
              <div style={styles.headerTitle}>Export Template JSON</div>
              <div style={styles.headerMeta}>
                {template.pages.length} page{template.pages.length !== 1 ? 's' : ''} · {totalFields} field{totalFields !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Summary */}
        <div style={styles.summary}>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Template</span>
            <span style={styles.summaryVal}>{template.templateName}</span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>PDF File</span>
            <span style={styles.summaryVal}>{template.pdfFileName}</span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Created</span>
            <span style={styles.summaryVal}>{new Date(template.createdAt).toLocaleString()}</span>
          </div>
        </div>

        {/* JSON preview */}
        <div style={styles.codeContainer}>
          <pre ref={preRef} style={styles.code}>
            {jsonStr}
          </pre>
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <button style={styles.copyBtn} onClick={handleCopy}>
            {copied ? '✓ Copied!' : '⎘ Copy to Clipboard'}
          </button>
          <button style={styles.downloadBtn} onClick={onDownload}>
            ↓ Download JSON
          </button>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.75)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backdropFilter: 'blur(4px)',
  },
  modal: {
    background: '#0f0f24',
    border: '1px solid #2a2d5a',
    borderRadius: 8,
    width: '100%',
    maxWidth: 700,
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 24px 80px rgba(0, 0, 0, 0.8)',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #1e2040',
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    fontSize: 20,
    color: '#69f0ae',
    background: '#0d2d1a',
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    border: '1px solid #1b5e34',
    flexShrink: 0,
  },
  headerTitle: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 14,
    fontWeight: 600,
    color: '#e8eaf6',
    marginBottom: 2,
  },
  headerMeta: {
    fontFamily: "'Heebo', sans-serif",
    fontSize: 11,
    color: '#5c6bc0',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#3d4494',
    cursor: 'pointer',
    fontSize: 16,
    padding: '4px 6px',
    borderRadius: 4,
  },
  summary: {
    display: 'flex',
    gap: 0,
    borderBottom: '1px solid #1e2040',
    flexShrink: 0,
  },
  summaryItem: {
    flex: 1,
    padding: '10px 20px',
    borderRight: '1px solid #1e2040',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  summaryLabel: {
    fontFamily: "'Heebo', sans-serif",
    fontSize: 9,
    fontWeight: 700,
    color: '#3d4494',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  summaryVal: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    color: '#9fa8da',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  codeContainer: {
    flex: 1,
    overflow: 'auto',
    background: '#08081a',
    borderBottom: '1px solid #1e2040',
  },
  code: {
    margin: 0,
    padding: 20,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    color: '#9fa8da',
    lineHeight: 1.6,
    whiteSpace: 'pre',
    overflowX: 'auto',
  },
  actions: {
    display: 'flex',
    gap: 10,
    padding: '14px 20px',
    flexShrink: 0,
  },
  copyBtn: {
    flex: 1,
    background: '#12122a',
    border: '1px solid #2a2d5a',
    borderRadius: 4,
    color: '#9fa8da',
    fontFamily: "'Heebo', sans-serif",
    fontSize: 12,
    fontWeight: 500,
    padding: '8px 16px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  downloadBtn: {
    flex: 1,
    background: '#0d2d1a',
    border: '1px solid #1b5e34',
    borderRadius: 4,
    color: '#69f0ae',
    fontFamily: "'Heebo', sans-serif",
    fontSize: 12,
    fontWeight: 600,
    padding: '8px 16px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
}
