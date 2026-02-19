import React from 'react'
import type { FieldDefinition } from '../types'

interface FieldListProps {
  fields: FieldDefinition[]
  selectedFieldId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

const TYPE_COLORS: Record<string, string> = {
  text: '#4f7fff',
  number: '#43e97b',
  check: '#ff9f43',
}

const TYPE_ICONS: Record<string, string> = {
  text: 'T',
  number: '#',
  check: '✓',
}

export const FieldList: React.FC<FieldListProps> = ({
  fields,
  selectedFieldId,
  onSelect,
  onDelete,
}) => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerIcon}>≡</span>
        <span style={styles.headerTitle}>Fields</span>
        <span style={styles.count}>{fields.length}</span>
      </div>

      {fields.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyText}>No fields yet</div>
          <div style={styles.emptyHint}>Use "+ Add Field" to place markers</div>
        </div>
      ) : (
        <div style={styles.list}>
          {fields.map((field) => {
            const color = TYPE_COLORS[field.type] || '#4f7fff'
            const icon = TYPE_ICONS[field.type] || 'T'
            const isSelected = selectedFieldId === field.id

            return (
              <div
                key={field.id}
                style={{
                  ...styles.item,
                  ...(isSelected ? styles.itemSelected : {}),
                  borderLeftColor: color,
                }}
                onClick={() => onSelect(field.id)}
              >
                <div
                  style={{
                    ...styles.typeDot,
                    background: color,
                    color: '#0d0d1a',
                  }}
                >
                  {icon}
                </div>

                <div style={styles.itemInfo}>
                  <div style={styles.itemId}>{field.id}</div>
                  <div style={styles.itemMeta}>
                    <span style={{ ...styles.typeBadge, color }}>
                      {field.type}
                    </span>
                    <span style={styles.itemCoords}>
                      ({Math.round(field.x)}, {Math.round(field.y)})
                    </span>
                    <span style={styles.itemSize}>
                      {Math.round(field.width)}×{Math.round(field.height)}
                    </span>
                  </div>
                </div>

                <button
                  style={styles.deleteBtn}
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(field.id)
                  }}
                  title="Delete field"
                >
                  ✕
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    borderTop: '1px solid #1e2040',
    flex: 1,
    overflow: 'hidden',
    minHeight: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px',
    borderBottom: '1px solid #1e2040',
    flexShrink: 0,
  },
  headerIcon: {
    color: '#4f7fff',
    fontSize: 14,
  },
  headerTitle: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    fontWeight: 600,
    color: '#7986cb',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    flex: 1,
  },
  count: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    color: '#3d4494',
    background: '#12122a',
    border: '1px solid #2a2d5a',
    borderRadius: 10,
    padding: '1px 6px',
  },
  empty: {
    padding: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    color: '#3d4494',
    marginBottom: 4,
  },
  emptyHint: {
    fontFamily: "'Heebo', sans-serif",
    fontSize: 10,
    color: '#2a2d5a',
  },
  list: {
    overflow: 'auto',
    flex: 1,
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '7px 12px 7px 10px',
    borderBottom: '1px solid #1e204044',
    borderLeft: '3px solid transparent',
    cursor: 'pointer',
    transition: 'background 0.1s',
  },
  itemSelected: {
    background: '#1a1f3a',
  },
  typeDot: {
    width: 18,
    height: 18,
    borderRadius: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 9,
    fontWeight: 700,
    fontFamily: "'JetBrains Mono', monospace",
    flexShrink: 0,
  },
  itemInfo: {
    flex: 1,
    overflow: 'hidden',
  },
  itemId: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    color: '#e8eaf6',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  itemMeta: {
    display: 'flex',
    gap: 6,
    alignItems: 'center',
    marginTop: 2,
  },
  typeBadge: {
    fontFamily: "'Heebo', sans-serif",
    fontSize: 9,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  itemCoords: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 9,
    color: '#3d4494',
  },
  itemSize: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 9,
    color: '#2a2d5a',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: '#3d4494',
    cursor: 'pointer',
    fontSize: 10,
    padding: '2px 4px',
    borderRadius: 2,
    flexShrink: 0,
    transition: 'color 0.1s',
  },
}
