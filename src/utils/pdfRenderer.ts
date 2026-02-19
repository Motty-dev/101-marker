import * as pdfjsLib from 'pdfjs-dist'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import type { PDFViewport } from '../types'
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

// Use local worker bundled with pdfjs-dist (avoids CDN version mismatch)
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl

export async function loadPdfDocument(file: File): Promise<PDFDocumentProxy> {
  const arrayBuffer = await file.arrayBuffer()
  const typedArray = new Uint8Array(arrayBuffer)
  const loadingTask = pdfjsLib.getDocument({ data: typedArray })
  return loadingTask.promise
}

export async function renderPageToCanvas(
  pdfDoc: PDFDocumentProxy,
  pageNum: number,
  canvas: HTMLCanvasElement,
  zoom: number
): Promise<PDFViewport> {
  const page = await pdfDoc.getPage(pageNum)
  const rawViewport = page.getViewport({ scale: zoom })

  canvas.width = rawViewport.width
  canvas.height = rawViewport.height

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Cannot get canvas 2d context')

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  await page.render({
    canvasContext: ctx,
    viewport: rawViewport,
  }).promise

  return {
    width: rawViewport.width,
    height: rawViewport.height,
    scale: zoom,
  }
}

export async function getPageDimensions(
  pdfDoc: PDFDocumentProxy,
  pageNum: number
): Promise<{ width: number; height: number }> {
  const page = await pdfDoc.getPage(pageNum)
  const viewport = page.getViewport({ scale: 1 })
  return {
    width: viewport.width,
    height: viewport.height,
  }
}
