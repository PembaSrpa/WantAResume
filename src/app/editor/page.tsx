"use client"

import { useState } from "react"
import { Scales } from "@/components/Scales"
import { BottomNav, type BottomNavTab } from "@/components/mobile/BottomNav"
import { SectionAccordion } from "@/components/editor/SectionAccordion"
import { BasicsForm } from "@/components/editor/BasicsForm"
import { PreviewPanel } from "@/components/preview/PreviewPanel"

type EditorTab = "basics" | "sections" | "design"

const EDITOR_TABS: { id: EditorTab; label: string }[] = [
  { id: "basics", label: "Basics" },
  { id: "sections", label: "Sections" },
  { id: "design", label: "Design" },
]

export default function EditorPage() {
  const [editorTab, setEditorTab] = useState<EditorTab>("sections")
  const [mobileTab, setMobileTab] = useState<BottomNavTab>("edit")

  return (
    <div className="relative h-screen overflow-hidden bg-[#0a0a0a]">
      {/* Desktop / tablet: Scales only show at >=1024px per spec (hidden on tablet+mobile) */}
      <div className="hidden lg:block">
        <Scales />
      </div>

      {/* Desktop layout: 5 / 50 / 40 / 5, Scales as flex spacers */}
      <div className="hidden h-full lg:flex">
        <div className="w-[5%] flex-shrink-0" />
        <div className="w-[50%] flex-shrink-0 overflow-y-auto border-r border-neutral-800">
          <EditorPanelShell activeTab={editorTab} onTabChange={setEditorTab} />
        </div>
        <div className="w-[40%] flex-shrink-0 overflow-y-auto">
          <PreviewPanel />
        </div>
        <div className="w-[5%] flex-shrink-0" />
      </div>

      {/* Tablet layout: 55 / 45, no Scales */}
      <div className="hidden h-full md:flex lg:hidden">
        <div className="w-[55%] flex-shrink-0 overflow-y-auto border-r border-neutral-800">
          <EditorPanelShell activeTab={editorTab} onTabChange={setEditorTab} />
        </div>
        <div className="w-[45%] flex-shrink-0 overflow-y-auto">
          <PreviewPanel />
        </div>
      </div>

      {/* Mobile layout: single panel driven by bottom nav, no Scales, no top navbar */}
      <div className="flex h-full flex-col md:hidden">
        <div className="flex-1 overflow-y-auto pb-16">
          {mobileTab === "edit" && (
            <EditorPanelShell activeTab={editorTab} onTabChange={setEditorTab} />
          )}
          {mobileTab === "preview" && <PreviewPanel />}
          {mobileTab === "design" && <DesignPanelPlaceholder />}
        </div>
        <BottomNav active={mobileTab} onChange={setMobileTab} />
      </div>
    </div>
  )
}

function EditorPanelShell({
  activeTab,
  onTabChange,
}: {
  activeTab: EditorTab
  onTabChange: (tab: EditorTab) => void
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex border-b border-neutral-800 px-4">
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
