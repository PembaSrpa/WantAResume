"use client"
import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { v4 as uuidv4 } from "uuid"
import { IconPlus, IconEdit, IconTrash, IconGripVertical } from "@tabler/icons-react"
import type { ExperienceItem, RoleItem } from "@/lib/schema/data"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Button } from "@/components/ui/Button"
function emptyExperienceItem(): ExperienceItem {
  return {
    id: uuidv4(),
    hidden: false,
    company: "",
    position: "",
    location: "",
    period: "",
    website: { url: "", label: "", inlineLink: false },
    description: "",
    roles: [],
  }
}
export function ExperienceItemModal({
  item,
  onSave,
  onClose,
}: {
  item: ExperienceItem | null
  onSave: (item: ExperienceItem) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState<ExperienceItem>(item ?? emptyExperienceItem())
  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null)
  function patch(fields: Partial<ExperienceItem>) {
    setDraft((current) => ({ ...current, ...fields }))
  }
  function patchWebsite(fields: Partial<ExperienceItem["website"]>) {
    setDraft((current) => ({ ...current, website: { ...current.website, ...fields } }))
  }
  function saveRole(role: RoleItem) {
    const exists = draft.roles.some((r) => r.id === role.id)
    setDraft((current) => ({
      ...current,
      roles: exists
        ? current.roles.map((r) => (r.id === role.id ? role : r))
        : [...current.roles, role],
    }))
    setRoleModalOpen(false)
    setEditingRole(null)
  }
  function deleteRole(roleId: string) {
    setDraft((current) => ({
      ...current,
      roles: current.roles.filter((r) => r.id !== roleId),
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
          <h2 className="mb-4 text-[13.5px] font-medium text-neutral-100">
            {item ? "Edit experience" : "Add experience"}
          </h2>

          <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
            <Field label="Company">
              <Input
                value={draft.company}
                onChange={(e) => patch({ company: e.target.value })}
                placeholder="Acme Inc."
              />
            </Field>
            <Field label="Position">
              <Input
                value={draft.position}
                onChange={(e) => patch({ position: e.target.value })}
                placeholder="Senior Software Engineer"
              />
            </Field>
            <Field label="Location">
              <Input
                value={draft.location}
                onChange={(e) => patch({ location: e.target.value })}
                placeholder="San Francisco, CA"
              />
            </Field>
            <Field label="Period">
              <Input
                placeholder="e.g. Jan 2022 — Present"
                value={draft.period}
                onChange={(e) => patch({ period: e.target.value })}
              />
            </Field>

            <Field label="Website URL">
              <Input
                value={draft.website.url}
                onChange={(e) => patchWebsite({ url: e.target.value })}
                placeholder="https://acme.com"
              />
            </Field>
            <Field label="Website label">
              <Input
                value={draft.website.label}
                onChange={(e) => patchWebsite({ label: e.target.value })}
                placeholder="Company site"
              />
            </Field>
            <label className="flex items-center gap-2 text-xs text-neutral-300">
              <input
                type="checkbox"
                checked={draft.website.inlineLink}
                onChange={(e) => patchWebsite({ inlineLink: e.target.checked })}
                className="accent-orange-700"
              />
              Show as inline link on title (instead of a separate link)
            </label>

            <Field label="Description">
              <Textarea
                rows={3}
                value={draft.description}
                onChange={(e) => patch({ description: e.target.value })}
                placeholder="Led a team of 5 engineers building..."
              />
              <p className="mt-1 text-[11px] text-neutral-500">Accepts HTML.</p>
            </Field>

            <div>
              <p className="mb-1.5 text-xs text-neutral-400">
                Roles <span className="text-neutral-600">(career progression at this company)</span>
              </p>
              <div className="flex flex-col gap-1.5">
                {draft.roles.map((role) => (
                  <div
                    key={role.id}
                    className="flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1.5"
                  >
                    <IconGripVertical size={13} className="text-neutral-600" />
                    <span className="flex-1 truncate text-xs text-neutral-200">
                      {role.position || "Untitled role"}
                      {role.period ? ` — ${role.period}` : ""}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRole(role)
                        setRoleModalOpen(true)
                      }}
                      className="text-neutral-400 hover:text-neutral-200"
                    >
                      <IconEdit size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteRole(role.id)}
                      className="text-neutral-400 hover:text-neutral-200"
                    >
                      <IconTrash size={13} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingRole(null)
                  setRoleModalOpen(true)
                }}
                className="mt-1.5 flex items-center gap-1.5 rounded-md border border-orange-700 bg-neutral-800 px-2 py-1 text-xs text-neutral-100"
              >
                <IconPlus size={13} />
                Add role
              </button>
            </div>
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

      {roleModalOpen && (
        <RoleModal
          role={editingRole}
          onSave={saveRole}
          onClose={() => {
            setRoleModalOpen(false)
            setEditingRole(null)
          }}
        />
      )}
    </AnimatePresence>
  )
}
function RoleModal({
  role,
  onSave,
  onClose,
}: {
  role: RoleItem | null
  onSave: (role: RoleItem) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState<RoleItem>(
    role ?? { id: uuidv4(), position: "", period: "", description: "" }
  )
  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
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
        className="w-full max-w-sm rounded-lg border border-orange-700 bg-neutral-900 p-5"
      >
        <h3 className="mb-4 text-[13.5px] font-medium text-neutral-100">
          {role ? "Edit role" : "Add role"}
        </h3>
        <div className="flex flex-col gap-3">
          <Field label="Position">
            <Input
              value={draft.position}
              onChange={(e) => setDraft((c) => ({ ...c, position: e.target.value }))}
              placeholder="Engineering Manager"
            />
          </Field>
          <Field label="Period">
            <Input
              value={draft.period}
              onChange={(e) => setDraft((c) => ({ ...c, period: e.target.value }))}
              placeholder="e.g. Jan 2023 — Present"
            />
          </Field>
          <Field label="Description">
            <Textarea
              rows={2}
              value={draft.description}
              onChange={(e) => setDraft((c) => ({ ...c, description: e.target.value }))}
              placeholder="What changed in this role..."
            />
          </Field>
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
