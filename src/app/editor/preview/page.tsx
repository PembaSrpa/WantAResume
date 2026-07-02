"use client"
import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { IconArrowLeft, IconDownload, IconExternalLink, IconRefresh } from "@tabler/icons-react"
import { useResumeStore } from "@/lib/store/resume"
import { Button } from "@/components/ui/Button"
type GenState =
  | {
      status: "loading"
    }
  | {
      status: "ready"
      blobUrl: string
    }
  | {
      status: "error"
      message: string
    }
export default function PreviewPage() {
  const router = useRouter()
  const data = useResumeStore((state) => state.data)
  const template = useResumeStore((state) => state.template)
  const [gen, setGen] = useState<GenState>({ status: "loading" })
  const generate = useCallback(async () => {
    setGen({ status: "loading" })
    try {
      const { generatePdfBlob } = await import("@/lib/generate-pdf")
      const blob = await generatePdfBlob(data, template)
      const blobUrl = URL.createObjectURL(blob)
      setGen({ status: "ready", blobUrl })
    } catch (err) {
      setGen({
        status: "error",
        message: err instanceof Error ? err.message : "Failed to generate PDF.",
      })
    }
  }, [])
  useEffect(() => {
    generate()
    return () => {
      setGen((current) => {
        if (current.status === "ready") URL.revokeObjectURL(current.blobUrl)
        return current
      })
    }
  }, [generate])
  function handleExport() {
    if (gen.status !== "ready") return
    const a = document.createElement("a")
    a.href = gen.blobUrl
    a.download = "resume.pdf"
    a.click()
  }
  function handleOpenInNewTab() {
    if (gen.status !== "ready") return
    window.open(gen.blobUrl, "_blank")
  }
  return (
    <div className="flex h-screen flex-col bg-[#0a0a0a]">
      <div className="flex flex-shrink-0 flex-wrap items-center gap-2 border-b border-neutral-800 p-3">
        <Button type="button" variant="ghost" onClick={() => router.push("/editor")}>
          <IconArrowLeft size={14} />
          Edit
        </Button>
        <Button type="button" onClick={generate}>
          <IconRefresh size={14} />
          Regenerate
        </Button>
        <Button
          type="button"
          onClick={handleExport}
          disabled={gen.status !== "ready"}
          className="ml-auto"
        >
          <IconDownload size={14} />
          Export PDF
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        {gen.status === "loading" && (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-700 border-t-neutral-300" />
              <p className="text-sm text-neutral-300">Generating preview…</p>
            </div>
          </div>
        )}

        {gen.status === "error" && (
          <div className="flex h-full items-center justify-center p-4">
            <p className="max-w-xs text-center text-sm text-neutral-500">
              Could not generate preview: {gen.message}
            </p>
          </div>
        )}

        {gen.status === "ready" && (
          <>
            <iframe
              src={gen.blobUrl}
              title="Resume PDF preview"
              className="hidden h-full w-full border-0 md:block"
            />

            <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center md:hidden">
              <p className="max-w-xs text-sm text-neutral-400">
                Your browser can&apos;t show the PDF inline here. Use a button below instead.
              </p>
              <div className="flex flex-col gap-2">
                <Button type="button" onClick={handleOpenInNewTab}>
                  <IconExternalLink size={14} />
                  Open PDF
                </Button>
                <Button type="button" variant="ghost" onClick={handleExport}>
                  <IconDownload size={14} />
                  Download PDF
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
