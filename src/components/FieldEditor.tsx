import React, { useState, useEffect } from 'react'
import type { FieldDefinition, FieldType, TextStyle, CheckFieldStyle } from '../types'

interface FieldEditorProps {
  field: FieldDefinition | null
  allFieldIds: string[]
  onUpdate: (field: FieldDefinition) => void
  onDelete: (id: string) => void
  onDeselect: () => void
  previewValue: string
  onPreviewValueChange: (val: string) => void
}

const FONT_FAMILIES = ['Arial', 'Courier', 'Helvetica', 'Times New Roman', 'David', 'Heebo', 'Georgia', 'Verdana']

export const FieldEditor: React.FC<FieldEditorProps> = ({
  field,
  allFieldIds,
  onUpdate,
  onDelete,
  onDeselect,
  previewValue,
  onPreviewValueChange,
}) => {
  const [localField, setLocalField] = useState<FieldDefinition | null>(null)
  const [idError, setIdError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  useEffect(() => {
    if (field) {
      setLocalField({ ...field, style: { ...field.style } })
      setIdError('')
      setDeleteConfirm(false)
    } else {
      setLocalField(null)
    }
  }, [field?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!localField) {
    return (
      <div style={styles.empty}>
        <div style={styles.emptyIcon}>◈</div>
        <div style={styles.emptyText}>Select a field to edit</div>
        <div style={styles.emptyHint}>or click "+ Add Field" to place a new one</div>
      </div>
    )
  }

  const handleChange = (updates: Partial<FieldDefinition>) => {
    const updated = { ...localField, ...updates }
    setLocalField(updated)

    if (updates.id !== undefined) {
      const isDup = allFieldIds.filter((i) => i !== field?.id).includes(updates.id!)
      if (isDup) { setIdError('ID already in use'); return }
      if (!updates.id) { setIdError('ID is required'); return }
      setIdError('')
    }

    const hasError = updates.id !== undefined && (
      allFieldIds.filter((i) => i !== field?.id).includes(updates.id!) || !updates.id
    )
    if (!hasError) onUpdate(updated)
  }

  const handleStyleChange = (styleUpdates: Partial<TextStyle> | Partial<CheckFieldStyle>) => {
    const updated = {
      ...localField,
      style: { ...localField.style, ...styleUpdates },
    } as FieldDefinition
    setLocalField(updated)
    onUpdate(updated)
  }

  const handleTypeChange = (newType: FieldType) => {
    let newStyle: FieldDefinition['style']
    if (newType === 'check') {
      newStyle = { checkStyle: 'v', checkSize: 14, color: '#000000' } as CheckFieldStyle
    } else {
      newStyle = {
        fontSize: 12,
        fontFamily: 'Arial',
        letterSpacing: 0,
        color: '#000000',
        alignment: 'left',
      } as TextStyle
    }
    const updated = { ...localField, type: newType, style: newStyle }
    setLocalField(updated)
    onUpdate(updated)
    // reset preview text when switching types
    onPreviewValueChange('')
  }

  const isTextOrNumber = localField.type === 'text' || localField.type === 'number'
  const isCheck = localField.type === 'check'
  const textStyle = localField.style as TextStyle
  const checkStyle = localField.style as CheckFieldStyle

  // Map alignment → flexbox justify
  const justifyMap: Record<string, string> = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  }

  // Build the live preview content
  const renderPreviewContent = () => {
    if (isCheck) {
      const symbol = checkStyle.checkStyle === 'v' ? '✓' : '✕'
      // always show the symbol at full opacity — no "checked" state needed
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: Math.min(checkStyle.checkSize * 1.8, 44),
            color: checkStyle.color,
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          {symbol}
        </div>
      )
    }

    // text / number — match exactly what MarkerRect renders
    const justifyContent = justifyMap[textStyle.alignment] ?? 'flex-start'
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent,
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            fontFamily: textStyle.fontFamily,
            fontSize: Math.min(textStyle.fontSize * 1.4, 32),
            letterSpacing: textStyle.letterSpacing,
            color: previewValue ? textStyle.color : '#3d4494',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.2,
            flexShrink: 0,
            maxWidth: '100%',
          }}
        >
          {previewValue || (localField.type === 'number' ? '123' : 'sample text…')}
        </span>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerIcon}>◈</span>
        <span style={styles.headerTitle}>Field Editor</span>
        <button style={styles.closeBtn} onClick={onDeselect} title="Deselect">✕</button>
      </div>

      <div style={styles.form}>
        {/* Field ID */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Field ID</label>
          <input
            type="text"
            value={localField.id}
            onChange={(e) => handleChange({ id: e.target.value })}
            style={{ ...styles.input, ...(idError ? styles.inputError : {}) }}
            placeholder="field_name"
          />
          {idError && <div style={styles.errorMsg}>{idError}</div>}
        </div>

        {/* Type */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Type</label>
          <div style={styles.typeSelector}>
            {(['text', 'number', 'check'] as FieldType[]).map((t) => (
              <button
                key={t}
                style={{
                  ...styles.typeBtn,
                  ...(localField.type === t ? typeBtnActiveStyles[t] : {}),
                }}
                onClick={() => handleTypeChange(t)}
              >
                {t === 'text' ? 'T' : t === 'number' ? '#' : '✓'}
                <span style={styles.typeBtnLabel}>{t}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ─── Live Preview ─── */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            <span style={{ color: '#4f7fff' }}>◉</span> Live Preview
          </label>

          {/* Preview box — styled to match field */}
          <div
            style={{
              ...styles.previewBox,
              borderColor: localField.type === 'text'
                ? '#4f7fff66'
                : localField.type === 'number'
                ? '#43e97b66'
                : '#ff9f4366',
              background: localField.type === 'text'
                ? '#0d0d1a'
                : localField.type === 'number'
                ? '#0a1a0f'
                : '#1a110a',
            }}
          >
            {renderPreviewContent()}
          </div>

          {/* Input below preview — only for text/number */}
          {isCheck ? (
            <div style={styles.checkSymbolHint}>
              ↑ switch symbol below to preview v-mark vs x-mark size &amp; position
            </div>
          ) : (
            <input
              type={localField.type === 'number' ? 'number' : 'text'}
              value={previewValue}
              onChange={(e) => onPreviewValueChange(e.target.value)}
              placeholder={localField.type === 'number' ? 'type a number…' : 'type sample text…'}
              style={{
                ...styles.previewInput,
                borderColor: localField.type === 'number' ? '#43e97b44' : '#4f7fff44',
              }}
              dir="auto"
            />
          )}
        </div>

        {/* Divider */}
        <div style={styles.divider} />

        {/* Coordinates */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Position (PDF pts)</label>
          <div style={styles.row2}>
            <div style={styles.inputGroup}>
              <span style={styles.inputLabel}>X</span>
              <input
                type="number"
                value={localField.x}
                onChange={(e) => handleChange({ x: parseFloat(e.target.value) || 0 })}
                style={styles.inputSmall}
                step={0.5}
              />
            </div>
            <div style={styles.inputGroup}>
              <span style={styles.inputLabel}>Y</span>
              <input
                type="number"
                value={localField.y}
                onChange={(e) => handleChange({ y: parseFloat(e.target.value) || 0 })}
                style={styles.inputSmall}
                step={0.5}
              />
            </div>
          </div>
        </div>

        {/* Dimensions */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Dimensions (PDF pts)</label>
          <div style={styles.row2}>
            <div style={styles.inputGroup}>
              <span style={styles.inputLabel}>W</span>
              <input
                type="number"
                value={localField.width}
                onChange={(e) => handleChange({ width: parseFloat(e.target.value) || 8 })}
                style={styles.inputSmall}
                step={0.5}
                min={8}
              />
            </div>
            <div style={styles.inputGroup}>
              <span style={styles.inputLabel}>H</span>
              <input
                type="number"
                value={localField.height}
                onChange={(e) => handleChange({ height: parseFloat(e.target.value) || 8 })}
                style={styles.inputSmall}
                step={0.5}
                min={8}
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={styles.divider} />

        {/* Text / Number styles */}
        {isTextOrNumber && (
          <>
            <div style={styles.sectionTitle}>Style</div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Font Family</label>
              <select
                value={textStyle.fontFamily}
                onChange={(e) => handleStyleChange({ fontFamily: e.target.value })}
                style={styles.select}
              >
                {FONT_FAMILIES.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Font Size</label>
              <div style={styles.sliderRow}>
                <input
                  type="range" min={6} max={72}
                  value={textStyle.fontSize}
                  onChange={(e) => handleStyleChange({ fontSize: parseInt(e.target.value) })}
                  style={styles.slider}
                />
                <span style={styles.sliderVal}>{textStyle.fontSize}pt</span>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Letter Spacing</label>
              <div style={styles.sliderRow}>
                <input
                  type="range" min={0} max={10} step={0.5}
                  value={textStyle.letterSpacing}
                  onChange={(e) => handleStyleChange({ letterSpacing: parseFloat(e.target.value) })}
                  style={styles.slider}
                />
                <span style={styles.sliderVal}>{textStyle.letterSpacing}</span>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Alignment</label>
              <div style={styles.alignSelector}>
                {(['left', 'center', 'right'] as const).map((a) => (
                  <button
                    key={a}
                    style={{
                      ...styles.alignBtn,
                      ...(textStyle.alignment === a ? styles.alignBtnActive : {}),
                    }}
                    onClick={() => handleStyleChange({ alignment: a })}
                    title={a}
                  >
                    {a === 'left' ? '⬤ ▬▬' : a === 'center' ? '▬ ⬤ ▬' : '▬▬ ⬤'}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Color</label>
              <div style={styles.colorRow}>
                <input
                  type="color"
                  value={textStyle.color}
                  onChange={(e) => handleStyleChange({ color: e.target.value })}
                  style={styles.colorInput}
                />
                <span style={styles.colorVal}>{textStyle.color.toUpperCase()}</span>
              </div>
            </div>
          </>
        )}

        {/* Check styles */}
        {isCheck && (
          <>
            <div style={styles.sectionTitle}>Check Style</div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Check Symbol</label>
              <div style={styles.typeSelector}>
                <button
                  style={{
                    ...styles.checkBtn,
                    ...(checkStyle.checkStyle === 'v' ? styles.checkBtnActive : {}),
                  }}
                  onClick={() => handleStyleChange({ checkStyle: 'v' })}
                >✓ v-mark</button>
                <button
                  style={{
                    ...styles.checkBtn,
                    ...(checkStyle.checkStyle === 'x' ? styles.checkBtnActive : {}),
                  }}
                  onClick={() => handleStyleChange({ checkStyle: 'x' })}
                >✕ x-mark</button>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Check Size</label>
              <div style={styles.sliderRow}>
                <input
                  type="range" min={8} max={30}
                  value={checkStyle.checkSize}
                  onChange={(e) => handleStyleChange({ checkSize: parseInt(e.target.value) })}
                  style={styles.slider}
                />
                <span style={styles.sliderVal}>{checkStyle.checkSize}pt</span>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Color</label>
              <div style={styles.colorRow}>
                <input
                  type="color"
                  value={checkStyle.color}
                  onChange={(e) => handleStyleChange({ color: e.target.value })}
                  style={styles.colorInput}
                />
                <span style={styles.colorVal}>{checkStyle.color.toUpperCase()}</span>
              </div>
            </div>
          </>
        )}

        {/* Divider */}
        <div style={styles.divider} />

        {/* Actions */}
        <div style={styles.actions}>
          {deleteConfirm ? (
            <div style={styles.confirmRow}>
              <span style={styles.confirmText}>Delete this field?</span>
              <button
                style={{ ...styles.actionBtn, ...styles.deleteBtnConfirm }}
                onClick={() => onDelete(localField.id)}
              >Yes, delete</button>
              <button
                style={{ ...styles.actionBtn, ...styles.cancelBtn }}
                onClick={() => setDeleteConfirm(false)}
              >Cancel</button>
            </div>
          ) : (
            <button
              style={{ ...styles.actionBtn, ...styles.deleteBtn }}
              onClick={() => setDeleteConfirm(true)}
            >✕ Delete Field</button>
          )}
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 16px',
    borderBottom: '1px solid #1e2040',
    flexShrink: 0,
  },
  headerIcon: { color: '#4f7fff', fontSize: 14 },
  headerTitle: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    fontWeight: 600,
    color: '#7986cb',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    flex: 1,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#3d4494',
    cursor: 'pointer',
    fontSize: 12,
    padding: '2px 4px',
  },
  empty: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
    textAlign: 'center',
  },
  emptyIcon: { fontSize: 28, color: '#2a2d5a' },
  emptyText: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    color: '#3d4494',
  },
  emptyHint: {
    fontFamily: "'Heebo', sans-serif",
    fontSize: 11,
    color: '#2a2d5a',
  },
  form: {
    flex: 1,
    overflow: 'auto',
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  formGroup: { marginBottom: 10 },
  label: {
    display: 'block',
    fontFamily: "'Heebo', sans-serif",
    fontSize: 10,
    fontWeight: 600,
    color: '#5c6bc0',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  input: {
    width: '100%',
    background: '#12122a',
    border: '1px solid #2a2d5a',
    borderRadius: 3,
    color: '#e8eaf6',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    padding: '5px 8px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  },
  inputError: { borderColor: '#f44336' },
  errorMsg: {
    fontFamily: "'Heebo', sans-serif",
    fontSize: 10,
    color: '#f44336',
    marginTop: 3,
  },
  inputSmall: {
    flex: 1,
    background: '#12122a',
    border: '1px solid #2a2d5a',
    borderRadius: 3,
    color: '#e8eaf6',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    padding: '4px 6px',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
  },
  row2: { display: 'flex', gap: 8 },
  inputGroup: { flex: 1, display: 'flex', alignItems: 'center', gap: 4 },
  inputLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    color: '#5c6bc0',
    fontWeight: 600,
    minWidth: 12,
  },
  select: {
    width: '100%',
    background: '#12122a',
    border: '1px solid #2a2d5a',
    borderRadius: 3,
    color: '#e8eaf6',
    fontFamily: "'Heebo', sans-serif",
    fontSize: 12,
    padding: '5px 8px',
    outline: 'none',
    boxSizing: 'border-box',
    cursor: 'pointer',
  },
  typeSelector: { display: 'flex', gap: 4 },
  typeBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    background: '#12122a',
    border: '1px solid #2a2d5a',
    borderRadius: 3,
    color: '#5c6bc0',
    fontFamily: "'Heebo', sans-serif",
    fontSize: 11,
    padding: '5px 4px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  typeBtnLabel: { fontSize: 10, textTransform: 'capitalize' },

  // ── Live preview ──
  previewBox: {
    width: '100%',
    minHeight: 52,
    borderRadius: 4,
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    padding: '8px 10px',
    boxSizing: 'border-box',
    marginBottom: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  previewInput: {
    width: '100%',
    background: '#0c0c20',
    border: '1px solid',
    borderRadius: 3,
    color: '#c5cae9',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    padding: '5px 8px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  },
  checkSymbolHint: {
    fontFamily: "'Heebo', sans-serif",
    fontSize: 10,
    color: '#3d4494',
    fontStyle: 'italic',
    marginTop: 2,
  },

  checkBtn: {
    flex: 1,
    background: '#12122a',
    border: '1px solid #2a2d5a',
    borderRadius: 3,
    color: '#5c6bc0',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    padding: '5px 8px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  checkBtnActive: {
    background: '#2d1f0d',
    border: '1px solid #ff9f43',
    color: '#ff9f43',
  },
  sliderRow: { display: 'flex', alignItems: 'center', gap: 8 },
  slider: { flex: 1, accentColor: '#4f7fff', height: 4, cursor: 'pointer' },
  sliderVal: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    color: '#9fa8da',
    minWidth: 32,
    textAlign: 'right',
  },
  alignSelector: { display: 'flex', gap: 4 },
  alignBtn: {
    flex: 1,
    background: '#12122a',
    border: '1px solid #2a2d5a',
    borderRadius: 3,
    color: '#5c6bc0',
    fontSize: 9,
    padding: '5px 4px',
    cursor: 'pointer',
    fontFamily: 'monospace',
    transition: 'all 0.15s',
  },
  alignBtnActive: { background: '#1a2a5a', border: '1px solid #4f7fff', color: '#4f7fff' },
  colorRow: { display: 'flex', alignItems: 'center', gap: 8 },
  colorInput: {
    width: 36,
    height: 28,
    border: '1px solid #2a2d5a',
    borderRadius: 3,
    background: '#12122a',
    cursor: 'pointer',
    padding: 1,
  },
  colorVal: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    color: '#9fa8da',
  },
  divider: { height: 1, background: '#1e2040', margin: '6px 0' },
  sectionTitle: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    fontWeight: 600,
    color: '#3d4494',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  actions: { marginTop: 4 },
  confirmRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  confirmText: {
    fontFamily: "'Heebo', sans-serif",
    fontSize: 11,
    color: '#f44336',
    flex: 1,
    minWidth: '100%',
    marginBottom: 6,
  },
  actionBtn: {
    flex: 1,
    background: '#12122a',
    border: '1px solid #2a2d5a',
    borderRadius: 3,
    color: '#9fa8da',
    fontFamily: "'Heebo', sans-serif",
    fontSize: 11,
    fontWeight: 500,
    padding: '6px 10px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  deleteBtn: { background: '#2d1212', border: '1px solid #5a1a1a', color: '#ef9a9a' },
  deleteBtnConfirm: { background: '#5a1a1a', border: '1px solid #f44336', color: '#f44336' },
  cancelBtn: { background: '#12122a', border: '1px solid #2a2d5a', color: '#5c6bc0' },
}

const typeBtnActiveStyles: Record<FieldType, React.CSSProperties> = {
  text: { background: '#1a2a5a', border: '1px solid #4f7fff', color: '#4f7fff' },
  number: { background: '#0d2d1a', border: '1px solid #43e97b', color: '#43e97b' },
  check: { background: '#2d1f0d', border: '1px solid #ff9f43', color: '#ff9f43' },
}
