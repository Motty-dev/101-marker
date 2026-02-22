import type { FieldDefinition } from '../types'

const DB_NAME = 'pdf-marker-db'
const DB_VERSION = 1
const STORE_NAME = 'pdf-store'
const PDF_KEY = 'current-pdf'
const STATE_KEY = 'pdf-marker-state'

interface StoredPdf {
  data: Uint8Array
  fileName: string
}

export interface PersistedState {
  fields: Record<number, FieldDefinition[]>
  pdfFileName: string
  templateName: string
  pageDimensions: Record<number, { width: number; height: number }>
  currentPage: number
  zoom: number
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result)
    request.onerror = () => reject(request.error)
  })
}

export async function savePdfToDb(data: Uint8Array, fileName: string): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.put({ data, fileName } satisfies StoredPdf, PDF_KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function loadPdfFromDb(): Promise<StoredPdf | null> {
  try {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const request = store.get(PDF_KEY)
      request.onsuccess = () => resolve((request.result as StoredPdf) ?? null)
      request.onerror = () => reject(request.error)
    })
  } catch {
    return null
  }
}

export async function clearPdfFromDb(): Promise<void> {
  try {
    const db = await openDb()
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).delete(PDF_KEY)
      tx.oncomplete = () => resolve()
      tx.onerror = () => resolve()
    })
  } catch {
    // ignore
  }
}

export function saveStateToStorage(state: PersistedState): void {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state))
  } catch {
    // ignore quota errors
  }
}

export function loadStateFromStorage(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STATE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PersistedState
  } catch {
    return null
  }
}

export function clearStateFromStorage(): void {
  localStorage.removeItem(STATE_KEY)
}
