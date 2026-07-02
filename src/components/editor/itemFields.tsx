"use client"
import { v4 as uuidv4 } from "uuid"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { TagInput } from "./TagInput"
import { LevelSlider } from "./LevelSlider"
import { ColorField } from "./ColorField"
export type FieldConfig =
  | {
      kind: "text"
      key: string
      label: string
      placeholder?: string
    }
  | {
      kind: "textarea-rich"
      key: string
      label: string
      placeholder?: string
    }
  | {
      kind: "website"
      key: string
      urlLabel?: string
    }
  | {
      kind: "level"
      key: string
      label: string
    }
  | {
      kind: "tags"
      key: string
      label: string
    }
  | {
      kind: "icon"
      key: string
      label: string
    }
  | {
      kind: "icon-color"
      key: string
      label: string
    }
export type GenericItem = Record<string, unknown> & {
  id: string
  hidden: boolean
}
function emptyValueFor(field: FieldConfig): unknown {
  switch (field.kind) {
    case "text":
    case "textarea-rich":
    case "icon":
    case "icon-color":
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
export function FieldRenderer({
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
            placeholder={field.placeholder}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
          <p className="mt-1 text-[11px] text-neutral-500">Accepts HTML.</p>
        </Field>
      )
    case "website": {
      const website = (value as {
        url: string
        label: string
        inlineLink: boolean
      }) ?? {
        url: "",
        label: "",
        inlineLink: false,
      }
      return (
        <>
          <Field label={field.urlLabel ?? "Website URL"}>
            <Input value={website.url} onChange={(e) => onWebsiteChange({ url: e.target.value })} />
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
    case "icon":
      return (
        <Field label={field.label}>
          <Input
            placeholder="e.g. linkedin-logo"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
          <p className="mt-1 text-[11px] text-neutral-500">
            Phosphor icon name. Empty uses the template default; &quot;none&quot; hides it.
          </p>
        </Field>
      )
    case "icon-color":
      return (
        <ColorField
          label={field.label}
          value={(value as string) ?? ""}
          onChange={onChange}
          onClear={() => onChange("")}
        />
      )
  }
}
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-neutral-400">
        {label}
      </span>
      {children}
    </label>
  )
}
