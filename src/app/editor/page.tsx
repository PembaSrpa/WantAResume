"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { IconEye, IconArrowLeft } from "@tabler/icons-react"
import { Scales } from "@/components/Scales"
import { BottomNav, type BottomNavTab } from "@/components/mobile/BottomNav"
import { SectionAccordion } from "@/components/editor/SectionAccordion"
import { SummaryForm } from "@/components/editor/SummaryForm"
import { BasicsForm } from "@/components/editor/BasicsForm"
import { DesignPanel } from "@/components/editor/DesignPanel"
import { Button } from "@/components/ui/Button"
import { Select } from "@/components/ui/Select"
import { useResumeStore } from "@/lib/store/resume"
import { templateSchema, type Template } from "@/lib/schema/templates"
type EditorTab = BottomNavTab
const EDITOR_TABS: {
  id: EditorTab
  label: string
}[] = [
  { id: "basics", label: "Basics" },
  { id: "sections", label: "Sections" },
  { id: "design", label: "Design" },
]
const TEMPLATES = templateSchema.options
function templateLabel(name: Template) {
  return name.charAt(0).toUpperCase() + name.slice(1)
}
export default function EditorPage() {
  const router = useRouter()
  const [editorTab, setEditorTab] = useState<EditorTab>("basics")
  return (
    <div className="relative h-screen overflow-hidden bg-[#0a0a0a]">
      <div className="hidden lg:block">
        <Scales variant="compact" />
      </div>

      <div className="hidden h-full lg:flex">
        <div className="w-[5%] flex-shrink-0" />
        <div className="flex-1 overflow-y-auto">
          <EditorPanelShell
            activeTab={editorTab}
            onTabChange={setEditorTab}
            onPreview={() => router.push("/editor/preview")}
            onBack={() => router.push("/")}
          />
        </div>
        <div className="w-[5%] flex-shrink-0" />
      </div>

      <div className="hidden h-full md:flex lg:hidden">
        <div className="flex-1 overflow-y-auto">
          <EditorPanelShell
            activeTab={editorTab}
            onTabChange={setEditorTab}
            onPreview={() => router.push("/editor/preview")}
            onBack={() => router.push("/")}
          />
        </div>
      </div>

      <div className="flex h-full flex-col md:hidden">
        <div className="flex items-center border-b border-neutral-800 px-3 py-2">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 px-1 py-1 text-neutral-400 transition-colors hover:text-neutral-100"
            aria-label="Back to homepage"
          >
            <IconArrowLeft size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-24 pt-4">
          {editorTab === "basics" && <BasicsForm />}
          {editorTab === "sections" && (
            <div className="flex flex-col gap-2.5">
              <SummaryForm />
              <SectionAccordion />
            </div>
          )}
          {editorTab === "design" && (
            <DesignPanelPlaceholder onPreview={() => router.push("/editor/preview")} />
          )}
        </div>
        <BottomNav active={editorTab} onChange={setEditorTab} />
      </div>
    </div>
  )
}
function EditorPanelShell({
  activeTab,
  onTabChange,
  onPreview,
  onBack,
}: {
  activeTab: EditorTab
  onTabChange: (tab: EditorTab) => void
  onPreview: () => void
  onBack: () => void
}) {
  const template = useResumeStore((state) => state.template)
  const setTemplate = useResumeStore((state) => state.setTemplate)
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-neutral-800 px-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-md px-1.5 py-2 text-neutral-400 transition-colors hover:text-neutral-100"
          aria-label="Back to homepage"
        >
          <IconArrowLeft size={17} />
        </button>

        <div className="flex flex-1 gap-1 py-2">
          {EDITOR_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={
                activeTab === tab.id
                  ? "rounded-t-md border-b-2 border-orange-700 bg-neutral-900 px-3.5 py-2 text-[13px] font-medium tracking-[0.01em] text-neutral-100"
                  : "rounded-t-md border-b-2 border-transparent px-3.5 py-2 text-[13px] text-neutral-500 transition-colors hover:text-neutral-300"
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Select
          value={template}
          onChange={(e) => setTemplate(e.target.value as Template)}
          className="h-8 w-32 py-0 text-xs"
        >
          {TEMPLATES.map((name) => (
            <option key={name} value={name}>
              {templateLabel(name)}
            </option>
          ))}
        </Select>

        <Button type="button" onClick={onPreview} className="my-2">
          <IconEye size={14} />
          Preview
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === "basics" && <BasicsForm />}
        {activeTab === "sections" && (
          <div className="flex flex-col gap-2.5">
            <SummaryForm />
            <SectionAccordion />
          </div>
        )}
        {activeTab === "design" && <DesignPanelPlaceholder />}
      </div>
    </div>
  )
}
function DesignPanelPlaceholder({ onPreview }: { onPreview?: () => void }) {
  const template = useResumeStore((state) => state.template)
  const setTemplate = useResumeStore((state) => state.setTemplate)
  return (
    <div className="flex flex-col gap-5">
      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-neutral-400">
          Template
        </span>
        <Select value={template} onChange={(e) => setTemplate(e.target.value as Template)}>
          {TEMPLATES.map((name) => (
            <option key={name} value={name}>
              {templateLabel(name)}
            </option>
          ))}
        </Select>
      </label>

      {onPreview && (
        <Button type="button" onClick={onPreview}>
          <IconEye size={14} />
          Preview
        </Button>
      )}

      <div className="h-px bg-neutral-800" />

      <DesignPanel />
    </div>
  )
}
