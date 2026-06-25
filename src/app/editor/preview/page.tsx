"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { IconArrowLeft, IconDownload, IconRefresh } from "@tabler/icons-react"
import { useResumeStore } from "@/lib/store/resume"
import { Button } from "@/components/ui/Button"

type GenState =
  | { status: "loading" }
  | { status: "ready"; blobUrl: string }
  | { status: "error"; message: string }

// PDF preview is desktop/tablet only (see TASK_MOBILE_AND_DEFAULT_TAB.md):
// a phone screen is too small for a useful resume preview. This guards
// direct URL access (typing /editor/preview manually) since removing the
// mobile bottom nav's Preview tab only prevents in-app navigation, not a
// typed-in URL landing here directly. Uses the same `md` breakpoint as
// every other mobile/desktop split in this app, rather than a new one.
function useIsMobileViewport() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)")
    setIsMobile(query.matches)
    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    query.addEventListener("change", listener)
    return () => query.removeEventListener("change", listener)
  }, [])

  return isMobile
}

export default function PreviewPage() {
  const router = useRouter()
  const data = useResumeStore((state) => state.data)
  const template = useResumeStore((state) => state.template)
  const isMobile = useIsMobileViewport()

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
    // Generated once on mount per the task's guidance. data/template aren't
    // dependencies on purpose — re-generating on every keystroke elsewhere
    // in the app would defeat the point of a dedicated preview route.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // Skip generating the PDF at all on mobile — no point doing the work
    // (and pulling in the heavy @react-pdf/renderer dependency tree) for a
    // page we're about to redirect away from.
    if (isMobile === false) generate()
    return () => {
      // Revoke on unmount to avoid leaking blob URLs across navigations.
      setGen((current) => {
        if (current.status === "ready") URL.revokeObjectURL(current.blobUrl)
        return current
      })
    }
  }, [generate, isMobile])

  useEffect(() => {
    if (isMobile !== true) return
    const timer = setTimeout(() => router.replace("/editor"), 1400)
    return () => clearTimeout(timer)
  }, [isMobile, router])

  function handleExport() {
    if (gen.status !== "ready") return
    const a = document.createElement("a")
    a.href = gen.blobUrl
    a.download = "resume.pdf"
    a.click()
  }

  // isMobile === null means the media query hasn't resolved yet (first
  // render, before the effect runs) — render nothing rather than flash the
  // desktop preview UI for a frame on what might turn out to be mobile.
  if (isMobile === null) {
    return <div className="h-screen bg-[#0a0a0a]" />
  }

  if (isMobile) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-[#0a0a0a] p-6 text-center">
        <p className="text-sm text-neutral-300">
          Preview works best on a larger screen.
        </p>
        <p className="text-xs text-neutral-500">Taking you back to the editor…</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-[#0a0a0a]">
      <div className="flex flex-shrink-0 items-center gap-2 border-b border-neutral-800 p-3">
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
          <iframe
            src={gen.blobUrl}
            title="Resume PDF preview"
            className="h-full w-full border-0"
          />
        )}
      </div>
    </div>
  )
}
