"use client"
import { useResumeStore } from "@/lib/store/resume"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Switch } from "@/components/ui/Switch"
import { Field } from "./itemFields"
export function SummaryForm() {
  const summary = useResumeStore((state) => state.data.summary)
  const updateField = useResumeStore((state) => state.updateField)
  function patchSummary(fields: Partial<typeof summary>) {
    updateField("summary", { ...summary, ...fields })
  }
  return (
    <div className="rounded-md border border-neutral-700 bg-neutral-800 p-3.5 md:p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-neutral-400">
          Summary
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-neutral-500">Hidden</span>
          <Switch
            checked={!summary.hidden}
            onCheckedChange={(checked) => patchSummary({ hidden: !checked })}
            aria-label="Toggle summary visibility"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Field label="Title">
          <Input
            value={summary.title}
            onChange={(e) => patchSummary({ title: e.target.value })}
            placeholder="Summary"
          />
        </Field>

        <Field label="Icon">
          <Input
            value={summary.icon}
            onChange={(e) => patchSummary({ icon: e.target.value })}
            placeholder="article"
          />
          <p className="mt-1 text-[11px] text-neutral-500">
            Phosphor icon name. Empty uses the default icon; &quot;none&quot; hides it.
          </p>
        </Field>

        <Field label="Content">
          <Textarea
            rows={4}
            value={summary.content}
            onChange={(e) => patchSummary({ content: e.target.value })}
            placeholder="A short bio or introduction..."
          />
          <p className="mt-1 text-[11px] text-neutral-500">Accepts HTML.</p>
        </Field>
      </div>
    </div>
  )
}
