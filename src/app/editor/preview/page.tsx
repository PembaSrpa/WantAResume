"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { IconArrowLeft, IconDownload, IconExternalLink, IconRefresh } from "@tabler/icons-react"
import { useResumeStore } from "@/lib/store/resume"
import { Button } from "@/components/ui/Button"

type GenState =
  | { status: "loading" }
  | { status: "ready"; blobUrl: string }
  | { status: "error"; message: string }

// PDF preview is reachable from both desktop/tablet (EditorPanelShell's
// Preview button) and mobile (the Design tab's Preview button — see
// TASK_PREVIEW_AND_PHOTO_UPLOAD.md). There is no mobile redirect/guard here
// anymore: an earlier version of this route bounced mobile viewports back
// to /editor on the theory that direct URL access should be discouraged,
// but with a legitimate in-app path now existing, that guard no longer
// makes sense — it would block the very button this task added.
export default function PreviewPage() {
  const router = useRouter()
  const data = useResumeStore((state) => state.data)
  const template = useResumeStore((state) => state.template)

  const [gen, setGen] = useState<GenState>({ status: "loading" })

  const generate = useCallback(async () => {
    setGen({ status: "loading" })
    try {
      // Always dynamically imported — a static top-level import of
      // generate-pdf.tsx would crash Next.js SSR, and would also pull
      // @react-pdf/renderer + all 15 templates into every route that
      // imports this file. Confined to this route only, on purpose.
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
    // Generated once on mount per the original task's guidance. data/template
    // aren't dependencies on purpose — re-generating on every keystroke
    // elsewhere in the app would defeat the point of a dedicated route.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    generate()
    return () => {
      // Revoke on unmount to avoid leaking blob URLs across navigations.
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

  // Mobile fix: most mobile browsers (iOS Safari, Chrome on Android) can't
  // render a PDF inline inside an <iframe>. When that happens they fall back
  // to their own native "can't preview this, tap to open" chrome rendered
  // *inside* the iframe's box -- not anything this app built. Tapping that
  // native "Open" does nothing on mobile because it tries to hand the blob:
  // URL to a new browsing context; blob URLs are scoped to the document that
  // created them via createObjectURL, and that native fallback's attempt to
  // open it crosses a context boundary the blob URL doesn't survive.
  //
  // window.open() called directly from a real tap in *this* document (the
  // one that created the blob URL) stays within the same origin/context, so
  // the blob resolves correctly. That's the fix: give mobile a button that
  // calls this directly, instead of depending on the iframe's own broken
  // native fallback.
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
            {/* Desktop/tablet: inline iframe preview, unchanged. */}
            <iframe
              src={gen.blobUrl}
              title="Resume PDF preview"
              className="hidden h-full w-full border-0 md:block"
            />

            {/* Mobile: skip the iframe's own broken native fallback entirely.
                Real, app-controlled buttons in the main document instead --
                see handleOpenInNewTab above for why. Kept mounted alongside
                the iframe (CSS-hidden, not conditionally rendered) rather
                than JS viewport detection, matching how the rest of the app
                (e.g. editor tabs) already handles responsive layouts. */}
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