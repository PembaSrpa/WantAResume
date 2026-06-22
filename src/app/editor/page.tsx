"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { IconEye } from "@tabler/icons-react"
import { Scales } from "@/components/Scales"
import { BottomNav, type BottomNavTab } from "@/components/mobile/BottomNav"
import { SectionAccordion } from "@/components/editor/SectionAccordion"
import { BasicsForm } from "@/components/editor/BasicsForm"
import { Button } from "@/components/ui/Button"

// Editing only. PreviewPanel/PDFCanvas/PDF.js are NOT imported anywhere in
// this file or its tree — see TASK_PREVIEW_SPLIT.md. Preview lives at its
// own route, /editor/preview, so this route's bundle never has to load
// @react-pdf/renderer, pdfjs-dist, or the 15 template files.

type EditorTab = "basics" | "sections" | "design"

const EDITOR_TABS: { id: EditorTab; label: string }[] = [
  { id: "basics", label: "Basics" },
  { id: "sections", label: "Sections" },
  { id: "design", label: "Design" },
]

export default function EditorPage() {
  const router = useRouter()
  const [editorTab, setEditorTab] = useState<EditorTab>("sections")
  // Remembers which non-design EditorTab to return to when the mobile
  // bottom nav's "Edit" tab is tapped after being on "Design". Keeps
  // BottomNavTab ("edit"/"preview"/"design") and EditorTab
  // ("basics"/"sections"/"design") as genuinely separate vocabularies
  // instead of forcing a lossy 1:1 mapping between them.
  const [lastEditorTab, setLastEditorTab] = useState<Exclude<EditorTab, "design">>("basics")

  function selectEditorTab(tab: EditorTab) {
    setEditorTab(tab)
    if (tab !== "design") setLastEditorTab(tab)
  }

  function handleMobileNavChange(tab: BottomNavTab) {
    if (tab === "preview") {
      router.push("/editor/preview")
      return
    }
    if (tab === "design") {
      setEditorTab("design")
      return
    }
    // tab === "edit": go back to whichever real EditorTab was last active.
    setEditorTab(lastEditorTab)
  }

  // BottomNav's "active" prop only knows edit/preview/design; basics and
  // sections both surface as "edit" from its perspective, which is a
  // display-only simplification — the underlying editorTab state never
  // loses the basics/sections distinction.
  const mobileNavActive: BottomNavTab = editorTab === "design" ? "design" : "edit"

  return (
    <div className="relative h-screen overflow-hidden bg-[#0a0a0a]">
      {/* Desktop / tablet: Scales only show at >=1024px per spec (hidden on tablet+mobile) */}
      <div className="hidden lg:block">
        <Scales />
      </div>

      {/* Desktop layout: editor fills the space between the scales. No
          preview column anymore — see TASK_PREVIEW_SPLIT.md. */}
      <div className="hidden h-full lg:flex">
        <div className="w-[5%] flex-shrink-0" />
        <div className="flex-1 overflow-y-auto">
          <EditorPanelShell
            activeTab={editorTab}
            onTabChange={selectEditorTab}
            onPreview={() => router.push("/editor/preview")}
          />
        </div>
        <div className="w-[5%] flex-shrink-0" />
      </div>

      {/* Tablet layout: same single-panel editor, no Scales. */}
      <div className="hidden h-full md:flex lg:hidden">
        <div className="flex-1 overflow-y-auto">
          <EditorPanelShell
            activeTab={editorTab}
            onTabChange={selectEditorTab}
            onPreview={() => router.push("/editor/preview")}
          />
        </div>
      </div>

      {/* Mobile layout: single panel driven by bottom nav. "Preview" now
          navigates to /editor/preview instead of swapping in a panel. */}
      <div className="flex h-full flex-col md:hidden">
        <div className="flex-1 overflow-y-auto pb-16">
          {editorTab === "basics" && <BasicsForm />}
          {editorTab === "sections" && <SectionAccordion />}
          {editorTab === "design" && <DesignPanelPlaceholder />}
        </div>
        <BottomNav active={mobileNavActive} onChange={handleMobileNavChange} />
      </div>
    </div>
  )
}

function EditorPanelShell({
  activeTab,
  onTabChange,
  onPreview,
}: {
  activeTab: EditorTab
  onTabChange: (tab: EditorTab) => void
  onPreview: () => void
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center border-b border-neutral-800 px-4">
        <div className="flex flex-1">
          {EDITOR_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={
                activeTab === tab.id
                  ? "border-b-2 border-orange-700 px-3 py-3 text-sm text-neutral-100"
                  : "border-b-2 border-transparent px-3 py-3 text-sm text-neutral-400 hover:text-neutral-200"
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
        <Button type="button" onClick={onPreview} className="my-2">
          <IconEye size={14} />
          Preview
        </Button>
      </div>
      <div className="flex-1 p-4">
        {activeTab === "basics" && <BasicsForm />}
        {activeTab === "sections" && <SectionAccordion />}
        {activeTab === "design" && <DesignPanelPlaceholder />}
      </div>
    </div>
  )
}

// DesignPanelPlaceholder still in use — Design tab not built yet.
function DesignPanelPlaceholder() {
  return <p className="text-sm text-neutral-500">Design controls go here.</p>
}
