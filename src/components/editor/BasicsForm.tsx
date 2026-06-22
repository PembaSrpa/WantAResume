"use client"

import { v4 as uuidv4 } from "uuid"
import { IconPlus, IconTrash } from "@tabler/icons-react"
import { useResumeStore } from "@/lib/store/resume"
import type { CustomField } from "@/lib/schema/data"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"

export function BasicsForm() {
  const basics = useResumeStore((state) => state.data.basics)
  const picture = useResumeStore((state) => state.data.picture)
  const updateField = useResumeStore((state) => state.updateField)

  function patchBasics(fields: Partial<typeof basics>) {
    updateField("basics", { ...basics, ...fields })
  }

  function patchWebsite(fields: Partial<typeof basics.website>) {
    patchBasics({ website: { ...basics.website, ...fields } })
  }

  function patchPicture(fields: Partial<typeof picture>) {
    updateField("picture", { ...picture, ...fields })
  }

  function addCustomField() {
    const field: CustomField = { id: uuidv4(), icon: "", text: "", link: "" }
    patchBasics({ customFields: [...basics.customFields, field] })
  }

  function updateCustomField(id: string, fields: Partial<CustomField>) {
    patchBasics({
      customFields: basics.customFields.map((f) => (f.id === id ? { ...f, ...fields } : f)),
    })
  }

  function removeCustomField(id: string) {
    patchBasics({ customFields: basics.customFields.filter((f) => f.id !== id) })
  }

  return (
    <div className="flex flex-col gap-[18px]">
      <Field label="Name">
        <Input value={basics.name} onChange={(e) => patchBasics({ name: e.target.value })} />
      </Field>

      <Field label="Headline">
        <Input
          value={basics.headline}
          onChange={(e) => patchBasics({ headline: e.target.value })}
        />
      </Field>

      <Field label="Email">
        <Input
          type="email"
          value={basics.email}
          onChange={(e) => patchBasics({ email: e.target.value })}
        />
      </Field>

      <Field label="Phone">
        <Input value={basics.phone} onChange={(e) => patchBasics({ phone: e.target.value })} />
      </Field>

      <Field label="Location">
        <Input
          value={basics.location}
          onChange={(e) => patchBasics({ location: e.target.value })}
        />
      </Field>

      <Field label="Website URL">
        <Input value={basics.website.url} onChange={(e) => patchWebsite({ url: e.target.value })} />
      </Field>
      <Field label="Website label">
        <Input
          value={basics.website.label}
          onChange={(e) => patchWebsite({ label: e.target.value })}
        />
      </Field>

      <Field label="Picture URL">
        <Input value={picture.url} onChange={(e) => patchPicture({ url: e.target.value })} />
      </Field>

      <div>
        <p className="mb-2 text-xs text-neutral-400">Custom fields</p>
        <div className="flex flex-col gap-2">
          {basics.customFields.map((field) => (
            <div
              key={field.id}
              className="flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-800 p-2"
            >
              <Input
                placeholder="Icon (optional)"
                value={field.icon}
                onChange={(e) => updateCustomField(field.id, { icon: e.target.value })}
                className="w-20"
              />
              <Input
                placeholder="Text"
                value={field.text}
                onChange={(e) => updateCustomField(field.id, { text: e.target.value })}
                className="flex-1"
              />
              <Input
                placeholder="Link (optional)"
                value={field.link}
                onChange={(e) => updateCustomField(field.id, { link: e.target.value })}
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => removeCustomField(field.id)}
                className="text-neutral-400 hover:text-neutral-200"
              >
                <IconTrash size={14} />
              </button>
            </div>
          ))}
        </div>
        <Button type="button" onClick={addCustomField} className="mt-2">
          <IconPlus size={14} />
          Add custom field
        </Button>
      </div>
    </div>
  )
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
