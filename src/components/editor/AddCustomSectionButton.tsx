"use client"
import { useState } from "react"
import { IconPlus } from "@tabler/icons-react"
import { useResumeStore, type GenericSectionType } from "@/lib/store/resume"
import { Button } from "@/components/ui/Button"
import { Select } from "@/components/ui/Select"
import { GENERIC_TYPE_LABELS } from "./sectionFieldConfig"
const GENERIC_TYPES = Object.keys(GENERIC_TYPE_LABELS) as GenericSectionType[]
export function AddCustomSectionButton({ onCreated }: { onCreated: (id: string) => void }) {
  const addCustomSection = useResumeStore((state) => state.addCustomSection)
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<GenericSectionType>("awards")
  const [placement, setPlacement] = useState<"main" | "sidebar">("main")
  function handleCreate() {
    const id = addCustomSection(type, placement)
    setOpen(false)
    onCreated(id)
  }
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 self-start rounded-md border border-orange-700 bg-neutral-800 px-3 py-1.5 text-[12px] text-neutral-100 transition-colors duration-150 hover:bg-neutral-700"
      >
        <IconPlus size={14} />
        Add custom section
      </button>
    )
  }
  return (
    <div className="flex flex-col gap-3 rounded-md border border-neutral-700 bg-neutral-800 p-3.5">
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-neutral-400">
          Section type
        </span>
        <Select
          aria-label="Section type"
          value={type}
          onChange={(e) => setType(e.target.value as GenericSectionType)}
        >
          {GENERIC_TYPES.map((t) => (
            <option key={t} value={t}>
              {GENERIC_TYPE_LABELS[t]}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-neutral-400">
          Column
        </span>
        <Select
          aria-label="New section column"
          value={placement}
          onChange={(e) => setPlacement(e.target.value as "main" | "sidebar")}
        >
          <option value="main">Main</option>
          <option value="sidebar">Sidebar</option>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button type="button" onClick={handleCreate}>
          <IconPlus size={14} />
          Create section
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
