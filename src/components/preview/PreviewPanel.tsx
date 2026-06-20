"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { IconRefresh, IconDownload, IconMaximize } from "@tabler/icons-react"
import { useResumeStore } from "@/lib/store/resume"
import { templateSchema, type Template } from "@/lib/schema/templates"
import { Button } from "@/components/ui/Button"
import { Select } from "@/components/ui/Select"
import { PDFCanvas } from "./PDFCanvas"

const TEMPLATES = templateSchema.options

function templateLabel(name: Template) {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

type PreviewState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; blobUrl: string; pageCount: number }
  | { status: "error"; message: string }

export function PreviewPanel() {
  const data = useResumeStore((state) => state.data)
  const template = useResumeStore((state) => state.template)
  const setTemplate = useResumeStore((state) => state.setTemplate)

  const [preview, setPreview] = useState<PreviewState>({ status: "idle" })

  const generatePreview = useCallback(async () => {
    setPreview({ status: "loading" })
    try {
      // Always dynamically imported — a static top-level import of
      // generate-pdf.tsx crashes Next.js SSR (it pulls in @react-pdf/renderer
      // and JSX meant only to run in the browser).
      const { generatePdfBlob } = await import("@/lib/generate-pdf")
      const blob = await generatePdfBlob(data, template)
      const blobUrl = URL.createObjectURL(blob)
      setPreview({ status: "ready", blobUrl, pageCount: 1 })
    } catch (err) {
      setPreview({
        status: "error",
        message: err instanceof Error ? err.message : "Failed to generate PDF.",
      })
    }
  }, [data, template])

  function handlePageCount(count: number) {
    setPreview((current) =>
      current.status === "ready" ? { ...current, pageCount: count } : current,
    )
  }

  function handleExport() {
    if (preview.status !== "ready") return
    const a = document.createElement("a")
    a.href = preview.blobUrl
    a.download = "resume.pdf"
    a.click()
  }

  function handleFullscreen() {
    if (preview.status !== "ready") return
    window.open(preview.blobUrl, "_blank")
  }

  function handleTemplateChange(next: Template) {
    setTemplate(next)
    // Re-trigger generation immediately so the preview reflects the new
    // template without requiring a second manual click.
    setTimeout(() => generatePreview(), 0)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex gap-2 border-b border-neutral-800 p-3">
        <Button type="button" onClick={generatePreview}>
          <IconRefresh size={14} />
          Update Preview
        </Button>
        <Button type="button" onClick={handleExport} disabled={preview.status !== "ready"}>
          <IconDownload size={14} />
          Export PDF
        </Button>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-y-auto p-4">
        {preview.status === "ready" && (
          <button
            type="button"
            onClick={handleFullscreen}
            className="absolute right-3 top-3 z-10 text-neutral-400 hover:text-neutral-200"
          >
            <IconMaximize size={18} />
          </button>
        )}

        {preview.status === "idle" && (
          <p className="text-sm text-neutral-500">
            Click &ldquo;Update Preview&rdquo; to generate the PDF.
          </p>
        )}

        {preview.status === "loading" && (
          <div className="flex flex-col items-center gap-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-700 border-t-neutral-300" />
            <p className="text-sm text-neutral-300">Generating preview…</p>
          </div>
        )}

        {preview.status === "error" && (
          <p className="max-w-xs text-center text-sm text-neutral-500">
            Could not generate preview: {preview.message}
          </p>
        )}

        <AnimatePresence mode="wait">
          {preview.status === "ready" && (
            <motion.div
              key={preview.blobUrl}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex w-full flex-col items-center gap-2"
            >
              <PDFCanvas blobUrl={preview.blobUrl} onPageCount={handlePageCount} />
              {preview.pageCount > 1 && (
                <p className="text-xs text-neutral-500">+{preview.pageCount - 1} more pages</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="border-t border-neutral-800 p-3">
        <Select
          value={template}
          onChange={(e) => handleTemplateChange(e.target.value as Template)}
        >
          {TEMPLATES.map((name) => (
            <option key={name} value={name}>
              {templateLabel(name)}
            </option>
          ))}
        </Select>
      </div>
    </div>
  )
}
