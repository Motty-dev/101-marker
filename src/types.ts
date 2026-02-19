import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'

export type FieldType = 'text' | 'number' | 'check'
export type Alignment = 'left' | 'center' | 'right'
export type CheckStyle = 'v' | 'x'

export interface TextStyle {
  fontSize: number
  fontFamily: string
  letterSpacing: number
  color: string
  alignment: Alignment
}

export interface CheckFieldStyle {
  checkStyle: CheckStyle
  checkSize: number
  color: string
}

export type FieldStyle = TextStyle | CheckFieldStyle

export interface FieldDefinition {
  id: string
  type: FieldType
  x: number
  y: number
  width: number
  height: number
  style: FieldStyle
}

export interface PageTemplate {
  page: number
  width: number
  height: number
  fields: FieldDefinition[]
}

export interface Template {
  templateName: string
  pdfFileName: string
  createdAt: string
  pages: PageTemplate[]
}

export interface PDFViewport {
  width: number
  height: number
  scale: number
}

export interface AppState {
  fields: Record<number, FieldDefinition[]>
  selectedFieldId: string | null
  currentPage: number
  totalPages: number
  placementMode: boolean
  pdfDoc: PDFDocumentProxy | null
  templateName: string
  pdfFileName: string
  pageViewports: Record<number, PDFViewport>
  zoom: number
}

export interface DragState {
  isDragging: boolean
  fieldId: string | null
  startX: number
  startY: number
  startPdfX: number
  startPdfY: number
}

export interface ResizeState {
  isResizing: boolean
  fieldId: string | null
  startX: number
  startY: number
  startWidth: number
  startHeight: number
}

export type PDFPage = PDFPageProxy
