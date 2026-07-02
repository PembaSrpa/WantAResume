"use client"
import { useRef, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { IconPlus, IconTrash, IconUpload, IconUser, IconX } from "@tabler/icons-react"
import { useResumeStore } from "@/lib/store/resume"
import type { CustomField } from "@/lib/schema/data"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { fileToResizedDataUrl } from "./resizeImage"
import { ResetTabButton } from "./ResetTabButton"
export function BasicsForm() {
  const basics = useResumeStore((state) => state.data.basics)
  const picture = useResumeStore((state) => state.data.picture)
  const updateField = useResumeStore((state) => state.updateField)
  const resetTab = useResumeStore((state) => state.resetTab)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const isUploadedPhoto = picture.url.startsWith("data:")
  function patchBasics(fields: Partial<typeof basics>) {
    updateField("basics", { ...basics, ...fields })
  }
  function patchWebsite(fields: Partial<typeof basics.website>) {
    patchBasics({ website: { ...basics.website, ...fields } })
  }
  function patchPicture(fields: Partial<typeof picture>) {
    updateField("picture", { ...picture, ...fields })
  }
  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setPhotoError("Please choose an image file.")
      return
    }
    setPhotoError(null)
    try {
      const dataUrl = await fileToResizedDataUrl(file)
      patchPicture({ url: dataUrl })
    } catch {
      setPhotoError("Could not process that image. Try a different file.")
    }
  }
  function handleRemovePhoto() {
    patchPicture({ url: "" })
    setPhotoError(null)
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
      <div className="flex justify-end">
        <ResetTabButton label="Basics" onConfirm={() => resetTab("basics")} />
      </div>

      <Field label="Name">
        <Input
          value={basics.name}
          onChange={(e) => patchBasics({ name: e.target.value })}
          placeholder="Jane Doe"
        />
      </Field>

      <Field label="Headline">
        <Input
          value={basics.headline}
          onChange={(e) => patchBasics({ headline: e.target.value })}
          placeholder="Senior Product Designer"
        />
      </Field>

      <Field label="Email">
        <Input
          type="email"
          value={basics.email}
          onChange={(e) => patchBasics({ email: e.target.value })}
          placeholder="jane@example.com"
        />
      </Field>

      <Field label="Phone">
        <Input
          value={basics.phone}
          onChange={(e) => patchBasics({ phone: e.target.value })}
          placeholder="+1 (555) 123-4567"
        />
      </Field>

      <Field label="Location">
        <Input
          value={basics.location}
          onChange={(e) => patchBasics({ location: e.target.value })}
          placeholder="San Francisco, CA"
        />
      </Field>

      <Field label="Website URL">
        <Input
          value={basics.website.url}
          onChange={(e) => patchWebsite({ url: e.target.value })}
          placeholder="https://janedoe.com"
        />
      </Field>
      <Field label="Website label">
        <Input
          value={basics.website.label}
          onChange={(e) => patchWebsite({ label: e.target.value })}
          placeholder="Portfolio"
        />
      </Field>

      <Field label="Picture URL">
        <Input
          value={isUploadedPhoto ? "" : picture.url}
          onChange={(e) => patchPicture({ url: e.target.value })}
          placeholder={
            isUploadedPhoto ? "Using uploaded photo — remove it to paste a link" : "https://..."
          }
          disabled={isUploadedPhoto}
        />
      </Field>

      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-neutral-400">
          Photo
        </span>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-700 bg-neutral-800">
            {picture.url ? (
              <img
                src={picture.url}
                alt="Selected photo preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <IconUser size={22} className="text-neutral-500" />
            )}
          </div>

          <Button type="button" variant="ghost" onClick={() => fileInputRef.current?.click()}>
            <IconUpload size={14} />
            {picture.url ? "Replace" : "Upload photo"}
          </Button>

          {picture.url && (
            <button
              type="button"
              aria-label="Remove photo"
              onClick={handleRemovePhoto}
              className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-md border border-neutral-700 text-neutral-400 transition-colors hover:text-neutral-200"
            >
              <IconX size={14} />
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
          />
        </div>

        {photoError ? (
          <p className="mt-1 text-xs text-neutral-300">{photoError}</p>
        ) : (
          <p className="mt-1 text-xs text-neutral-500">
            Resized and compressed automatically before saving — no upload needed, it&apos;s stored
            locally with the rest of your resume.
          </p>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs text-neutral-400">Custom fields</p>
        <div className="flex flex-col gap-2">
          {basics.customFields.map((field) => (
            <div
              key={field.id}
              className="flex flex-col gap-2 rounded-md border border-neutral-700 bg-neutral-800 p-2 md:flex-row md:items-center"
            >
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Icon (optional)"
                  value={field.icon}
                  onChange={(e) => updateCustomField(field.id, { icon: e.target.value })}
                  className="w-20"
                />
                <button
                  type="button"
                  onClick={() => removeCustomField(field.id)}
                  className="text-neutral-400 hover:text-neutral-200 md:hidden"
                >
                  <IconTrash size={14} />
                </button>
              </div>
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
                className="hidden text-neutral-400 hover:text-neutral-200 md:block"
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
