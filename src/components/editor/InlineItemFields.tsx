"use client"
import type { FieldConfig, GenericItem } from "./itemFields"
import { FieldRenderer } from "./itemFields"
export function InlineItemFields({
  fields,
  item,
  onChange,
}: {
  fields: FieldConfig[]
  item: GenericItem
  onChange: (item: GenericItem) => void
}) {
  function patch(key: string, value: unknown) {
    onChange({ ...item, [key]: value })
  }
  function patchWebsite(key: string, sub: Record<string, unknown>) {
    onChange({
      ...item,
      [key]: { ...(item[key] as Record<string, unknown>), ...sub },
    })
  }
  return (
    <div className="flex flex-col gap-3.5 border-t border-neutral-700 px-3.5 pb-3.5 pt-3">
      {fields.map((field) => (
        <FieldRenderer
          key={field.key}
          field={field}
          value={item[field.key]}
          onChange={(value) => patch(field.key, value)}
          onWebsiteChange={(sub) => patchWebsite(field.key, sub)}
        />
      ))}
    </div>
  )
}
