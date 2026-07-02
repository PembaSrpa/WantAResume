"use client"
import { useState } from "react"
import { IconX } from "@tabler/icons-react"
import { Input } from "@/components/ui/Input"
export function TagInput({
  value,
  onChange,
}: {
  value: string[]
  onChange: (tags: string[]) => void
}) {
  const [draft, setDraft] = useState("")
  function commitDraft() {
    const tags = draft
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
    if (tags.length > 0) {
      onChange([...value, ...tags])
    }
    setDraft("")
  }
  function removeTag(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap gap-1.5">
        {value.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="flex items-center gap-1 rounded-full border border-orange-700 bg-neutral-800 px-2 py-0.5 text-xs text-neutral-200"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="text-neutral-400 hover:text-neutral-100"
            >
              <IconX size={11} />
            </button>
          </span>
        ))}
      </div>
      <Input
        placeholder="Type and use comma to add"
        value={draft}
        onChange={(e) => {
          if (e.target.value.includes(",")) {
            const parts = e.target.value.split(",")
            const last = parts.pop() ?? ""
            const tags = parts.map((t) => t.trim()).filter(Boolean)
            if (tags.length > 0) onChange([...value, ...tags])
            setDraft(last)
          } else {
            setDraft(e.target.value)
          }
        }}
        onBlur={commitDraft}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            commitDraft()
          }
        }}
      />
    </div>
  )
}
