"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { v4 as uuidv4 } from "uuid"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Button } from "@/components/ui/Button"
import { TagInput } from "./TagInput"
import { LevelSlider } from "./LevelSlider"

// ---- Field config types -----------------------------------------------
//
// Each section type's item shape is described as a list of FieldConfig
// entries. `key` indexes into the item object (typed as `any` at this
// generic layer — callers get real typing via the per-type wrapper
// components below, e.g. SkillsItemModal, ProfileItemModal).
//
// Supported kinds, per the doc's spec:
// - text: plain single-line input
// - textarea-rich: HTML-accepting textarea (Description-style fields)
// - website: { url, label, inlineLink } object — renders url/label inputs
//   plus the inlineLink checkbox, per the corrected per-field pattern
// - level: 0-5 slider (Skills/Languages)
// - tags: comma-separated chip input (Skills/Interests keywords)

export type FieldConfig =
  | { kind: "text"; key: string; label: string; placeholder?: string }
  | { kind: "textarea-rich"; key: string; label: string }
  | { kind: "website"; key: string; urlLabel?: string }
  | { kind: "level"; key: string; label: string }
  | { kind: "tags"; key: string; label: string }

export type GenericItem = Record<string, unknown> & { id: string; hidden: boolean }

function emptyValueFor(field: FieldConfig): unknown {
  switch (field.kind) {
    case "text":
    case "textarea-rich":
      return ""
    case "website":
      return { url: "", label: "", inlineLink: false }
    case "level":
      return 0
    case "tags":
      return []
  }
}

export function emptyItemFromFields(fields: FieldConfig[]): GenericItem {
  const item: GenericItem = { id: uuidv4(), hidden: false }
  for (const field of fields) {
    item[field.key] = emptyValueFor(field)
  }
  return item
}

export function GenericItemModal({
  title,
  fields,
  item,
  onSave,
  onClose,
}: {
  title: string
  fields: FieldConfig[]
  item: GenericItem | null
  onSave: (item: GenericItem) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState<GenericItem>(item ?? emptyItemFromFields(fields))

  function patch(key: string, value: unknown) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function patchWebsite(key: string, sub: Record<string, unknown>) {
    setDraft((current) => ({
      ...current,
      [key]: { ...(current[key] as Record<string, unknown>), ...sub },
    }))
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-lg border border-orange-700 bg-neutral-900 p-5"
        >
          <h2 className="mb-4 text-[13.5px] font-medium text-neutral-100">{title}</h2>

          <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
            {fields.map((field) => (
              <FieldRenderer
                key={field.key}
                field={field}
                value={draft[field.key]}
                onChange={(value) => patch(field.key, value)}
                onWebsiteChange={(sub) => patchWebsite(field.key, sub)}
              />
            ))}
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" onClick={() => onSave(draft)}>
              Save
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function FieldRenderer({
  field,
  value,
  onChange,
  onWebsiteChange,
}: {
  field: FieldConfig
  value: unknown
  onChange: (value: unknown) => void
  onWebsiteChange: (sub: Record<string, unknown>) => void
}) {
  switch (field.kind) {
    case "text":
      return (
        <Field label={field.label}>
          <Input
            placeholder={field.placeholder}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </Field>
      )

    case "textarea-rich":
      return (
        <Field label={field.label}>
          <Textarea
            rows={3}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
          <p className="mt-1 text-[11px] text-neutral-500">Accepts HTML.</p>
        </Field>
      )

    case "website": {
      const website = (value as { url: string; label: string; inlineLink: boolean }) ?? {
        url: "",
        label: "",
        inlineLink: false,
      }
      return (
        <>
          <Field label={field.urlLabel ?? "Website URL"}>
            <Input
              value={website.url}
              onChange={(e) => onWebsiteChange({ url: e.target.value })}
            />
          </Field>
          <Field label="Website label">
            <Input
              value={website.label}
              onChange={(e) => onWebsiteChange({ label: e.target.value })}
            />
          </Field>
          <label className="flex items-center gap-2 text-xs text-neutral-300">
            <input
              type="checkbox"
              checked={website.inlineLink}
              onChange={(e) => onWebsiteChange({ inlineLink: e.target.checked })}
              className="accent-orange-700"
            />
            Show as inline link on title (instead of a separate link)
          </label>
        </>
      )
    }

    case "level":
      return (
        <Field label={field.label}>
          <LevelSlider value={(value as number) ?? 0} onChange={onChange} />
        </Field>
      )

    case "tags":
      return (
        <Field label={field.label}>
          <TagInput value={(value as string[]) ?? []} onChange={onChange} />
        </Field>
      )
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-neutral-400">
        {label}
      </span>
      {children}
    </label>
  )
}
