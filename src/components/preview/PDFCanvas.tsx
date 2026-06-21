"use client"

import { useEffect, useRef, useState } from "react"

export function PDFCanvas({
  blobUrl,
  onPageCount,
}: {
  blobUrl: string
  onPageCount: (count: number) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function render() {
      setError(null)
      try {
        const pdfjsLib = await import("pdfjs-dist")
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString()

        const pdf = await pdfjsLib.getDocument(blobUrl).promise
        if (cancelled) return

        onPageCount(pdf.numPages)

        const page = await pdf.getPage(1)
        if (cancelled) return

        const containerWidth = containerRef.current?.clientWidth ?? 400
        const baseViewport = page.getViewport({ scale: 1 })
        const scale = containerWidth / baseViewport.width
        const viewport = page.getViewport({ scale })

        const canvas = canvasRef.current
        if (!canvas) return
        const context = canvas.getContext("2d")
        if (!context) return

        canvas.width = viewport.width
        canvas.height = viewport.height

        await page.render({ canvasContext: context, viewport }).promise
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to render PDF.")
        }
      }
    }

    render()

    return () => {
      cancelled = true
    }
  }, [blobUrl, onPageCount])

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-sm text-neutral-500">
        Could not render preview: {error}
      </div>
    )
  }

  return (
    <div ref={containerRef} className="flex w-full items-center justify-center">
      <canvas ref={canvasRef} className="max-w-full shadow-lg" />
    </div>
  )
}