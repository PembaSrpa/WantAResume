"use client"

import { useState, useRef, useEffect } from "react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  rectSortingStrategy,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconGripVertical,
  IconChevronDown,
  IconChevronUp,
  IconEdit,
  IconTrash,
  IconPlus,
} from "@tabler/icons-react"
import { motion, AnimatePresence } from "motion/react"
import { useResumeStore, type GenericSectionType } from "@/lib/store/resume"
import type { SectionType, ExperienceItem } from "@/lib/schema/data"
import { Switch } from "@/components/ui/Switch"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { ExperienceItemModal } from "./SectionItemModal"
import { emptyItemFromFields, type GenericItem, type FieldConfig } from "./itemFields"
import { InlineItemFields } from "./InlineItemFields"
import { GENERIC_SECTION_FIELDS, GENERIC_TYPE_LABELS, sectionItemSummary } from "./sectionFieldConfig"
import { ResetTabButton } from "./ResetTabButton"
import { DeleteSectionButton } from "./DeleteSectionButton"
import { AddCustomSectionButton } from "./AddCustomSectionButton"

// A small movement threshold before a drag activates. Without this,
// PointerSensor (which already covers touch via the unified Pointer Events
// API — no separate TouchSensor needed) starts listening for drag on the
// very first touch pixel, which can fight the browser's native scroll
// gesture on a touch device. 8px is below normal drag intent for a mouse
// too, so this doesn't change desktop's already-working feel.
const DRAG_ACTIVATION_CONSTRAINT = { distance: 8 }

function MoveButtons({
  onMoveUp,
  onMoveDown,
  size = 13,
}: {
  onMoveUp?: () => void
  onMoveDown?: () => void
  size?: number
}) {
  return (
    <div className="flex flex-shrink-0 flex-col md:hidden">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onMoveUp?.()
        }}
        disabled={!onMoveUp}
        aria-label="Move up"
        className="text-neutral-500 transition-colors hover:text-neutral-200 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <IconChevronUp size={size} />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onMoveDown?.()
        }}
        disabled={!onMoveDown}
        aria-label="Move down"
        className="text-neutral-500 transition-colors hover:text-neutral-200 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <IconChevronDown size={size} />
      </button>
    </div>
  )
}

// Built-in section keys this accordion manages directly. "summary" is
// handled separately outside this component (see SummaryForm.tsx).
// Custom sections (UUID ids, in data.customSections) are merged into the
// same ordered list below and rendered via SortableCustomSectionRow.
const SECTION_TYPES: SectionType[] = [
  "profiles",
  "experience",
  "education",
  "projects",
  "skills",
  "languages",
  "interests",
  "awards",
  "certifications",
  "publications",
  "volunteer",
  "references",
]

export function SectionAccordion() {
  const [openSection, setOpenSection] = useState<string | null>(null)

  const mainOrder = useResumeStore((state) => state.data.metadata.layout.pages[0]?.main ?? [])
  const customSections = useResumeStore((state) => state.data.customSections)
  const reorderSections = useResumeStore((state) => state.reorderSections)
  const resetTab = useResumeStore((state) => state.resetTab)

  const customSectionIds = customSections.map((section) => section.id)

  // pages[0].main can also contain "summary"; this accordion manages the
  // 11 built-in SECTION_TYPES plus every id in data.customSections.
  // Anything missing from main (e.g. on a freshly reset resume, or a
  // custom section created into the sidebar) is appended at the end so
  // it's still visible and reorderable -- same fallback SECTION_TYPES
  // already relied on before custom sections existed.
  const sectionOrder = [
    ...mainOrder.filter(
      (id): id is string => SECTION_TYPES.includes(id as SectionType) || customSectionIds.includes(id),
    ),
    ...SECTION_TYPES.filter((type) => !mainOrder.includes(type)),
    ...customSectionIds.filter((id) => !mainOrder.includes(id)),
  ]

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: DRAG_ACTIVATION_CONSTRAINT }),
  )

  function handleSectionDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = sectionOrder.indexOf(active.id as string)
    const newIndex = sectionOrder.indexOf(over.id as string)
    reorderSections(arrayMove(sectionOrder, oldIndex, newIndex))
  }

  // Mobile fallback for drag-and-drop reordering. Touch-drag is configured
  // (activationConstraint + touch-action) but cannot be fully verified as
  // reliable in this environment — see TASK_MOBILE_TOUCH_DND.md. These
  // up/down buttons are a guaranteed-working alternative, shown mobile-only
  // (md:hidden) alongside the drag handle, not instead of it.
  function moveSectionBy(id: string, delta: 1 | -1) {
    const index = sectionOrder.indexOf(id)
    const newIndex = index + delta
    if (newIndex < 0 || newIndex >= sectionOrder.length) return
    reorderSections(arrayMove(sectionOrder, index, newIndex))
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex justify-end">
        <ResetTabButton label="Sections" onConfirm={() => resetTab("sections")} />
      </div>

      <DndContext
        id="section-order"
        sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleSectionDragEnd}
    >
      <SortableContext items={sectionOrder} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 items-start gap-2.5 lg:grid-cols-2">
          {sectionOrder.map((id, index) => {
            const isOpen = openSection === id
            const onToggle = () => setOpenSection((current) => (current === id ? null : id))
            const onMoveUp = index > 0 ? () => moveSectionBy(id, -1) : undefined
            const onMoveDown =
              index < sectionOrder.length - 1 ? () => moveSectionBy(id, 1) : undefined

            return SECTION_TYPES.includes(id as SectionType) ? (
              <SortableSectionRow
                key={id}
                sectionType={id as SectionType}
                isOpen={isOpen}
                onToggle={onToggle}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
              />
            ) : (
              <SortableCustomSectionRow
                key={id}
                customSectionId={id}
                isOpen={isOpen}
                onToggle={onToggle}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
              />
            )
          })}
        </div>
      </SortableContext>
      </DndContext>

      <AddCustomSectionButton onCreated={(id) => setOpenSection(id)} />
    </div>
  )
}

function SortableSectionRow({
  sectionType,
  isOpen,
  onToggle,
  onMoveUp,
  onMoveDown,
}: {
  sectionType: SectionType
  isOpen: boolean
  onToggle: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: sectionType,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={
        isOpen
          ? "rounded-md border border-neutral-700 bg-neutral-800 transition-colors duration-150 hover:border-neutral-600 lg:col-span-2"
          : "min-w-0 rounded-md border border-neutral-700 bg-neutral-800 transition-colors duration-150 hover:border-neutral-600"
      }
    >
      <SectionHeader
        sectionType={sectionType}
        isOpen={isOpen}
        onToggle={onToggle}
        dragHandleProps={{ ...attributes, ...listeners }}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
      />
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <SectionBody sectionType={sectionType} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SectionHeader({
  sectionType,
  isOpen,
  onToggle,
  dragHandleProps,
  onMoveUp,
  onMoveDown,
}: {
  sectionType: SectionType
  isOpen: boolean
  onToggle: () => void
  dragHandleProps: Record<string, unknown>
  onMoveUp?: () => void
  onMoveDown?: () => void
}) {
  const section = useResumeStore((state) => state.data.sections[sectionType])
  const updateSection = useResumeStore((state) => state.updateSection)

  const [renaming, setRenaming] = useState(false)
  const [titleDraft, setTitleDraft] = useState(section.title || sectionType)
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function commitRename() {
    updateSection(sectionType, { title: titleDraft })
    setRenaming(false)
  }

  useEffect(() => {
    return () => {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current)
    }
  }, [])

  // Single click anywhere on the row, including the title, toggles
  // expand/collapse. Double-click specifically on the title enters rename
  // mode instead. A double-click fires two click events before (and
  // sometimes instead of) a dblclick event, so the first click is held
  // briefly — if a second click lands within the window, it's treated as
  // a double-click and the pending single-click toggle is cancelled.
  function handleTitleClick() {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current)
      clickTimerRef.current = null
      setTitleDraft(section.title || sectionType)
      setRenaming(true)
      return
    }
    clickTimerRef.current = setTimeout(() => {
      clickTimerRef.current = null
      onToggle()
    }, 250)
  }

  return (
    <div
      onClick={onToggle}
      className="flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-2.5 transition-colors hover:bg-neutral-700/40 md:gap-2.5 md:px-3.5"
    >
      <button
        type="button"
        className="flex-shrink-0 cursor-grab touch-none text-neutral-500 transition-colors hover:text-neutral-300"
        onClick={(e) => e.stopPropagation()}
        {...dragHandleProps}
      >
        <IconGripVertical size={15} />
      </button>

      <MoveButtons onMoveUp={onMoveUp} onMoveDown={onMoveDown} />

      {renaming ? (
        <Input
          autoFocus
          value={titleDraft}
          onChange={(e) => setTitleDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => e.key === "Enter" && commitRename()}
          onClick={(e) => e.stopPropagation()}
          className="h-7 flex-1 py-0 text-[13px]"
        />
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleTitleClick()
          }}
          title={`${section.title || sectionType} — click to expand, double-click to rename`}
          className="min-w-0 flex-1 truncate text-left text-[13.5px] font-medium tracking-[0.01em] text-neutral-100"
        >
          {section.title || sectionType}
        </button>
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-shrink-0 overflow-hidden rounded-md border border-neutral-700"
        role="group"
        aria-label={`${sectionType} column layout`}
      >
        <button
          type="button"
          onClick={() => updateSection(sectionType, { columns: 1 })}
          aria-pressed={section.columns === 1}
          title="1 column"
          className={
            section.columns === 1
              ? "h-7 w-5 bg-orange-700 text-[11px] text-neutral-100"
              : "h-7 w-5 bg-neutral-800 text-[11px] text-neutral-400 transition-colors hover:text-neutral-200"
          }
        >
          1
        </button>
        <button
          type="button"
          onClick={() => updateSection(sectionType, { columns: 2 })}
          aria-pressed={section.columns === 2}
          title="2 columns"
          className={
            section.columns === 2
              ? "h-7 w-5 bg-orange-700 text-[11px] text-neutral-100"
              : "h-7 w-5 bg-neutral-800 text-[11px] text-neutral-400 transition-colors hover:text-neutral-200"
          }
        >
          2
        </button>
      </div>

      <div onClick={(e) => e.stopPropagation()}>
        <Switch
          checked={!section.hidden}
          onCheckedChange={(checked) => updateSection(sectionType, { hidden: !checked })}
          aria-label={`Toggle ${sectionType} visibility`}
        />
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
        }}
        className="flex-shrink-0 text-neutral-400 transition-colors hover:text-neutral-100"
      >
        <IconChevronDown
          size={15}
          className={
            isOpen
              ? "rotate-180 transition-transform duration-150"
              : "transition-transform duration-150"
          }
        />
      </button>
    </div>
  )
}

function SectionBody({ sectionType }: { sectionType: SectionType }) {
  if (sectionType === "experience") {
    return <ExperienceSectionBody />
  }
  // All 10 generic-path section types now wired: the 3 pilots
  // (skills/profiles/education), this round's 7
  // (projects/languages/interests/awards/certifications/publications/
  // volunteer), plus references. Experience (11th) stays hand-written
  // permanently — its roles[] sub-array is structurally unique and not
  // worth generalizing for a single section type.
  if (
    sectionType === "skills" ||
    sectionType === "profiles" ||
    sectionType === "education" ||
    sectionType === "projects" ||
    sectionType === "languages" ||
    sectionType === "interests" ||
    sectionType === "awards" ||
    sectionType === "certifications" ||
    sectionType === "publications" ||
    sectionType === "volunteer" ||
    sectionType === "references"
  ) {
    return <GenericSectionBody sectionType={sectionType} />
  }
  return null
}

function GenericSectionBody({ sectionType }: { sectionType: GenericSectionType }) {
  const items = useResumeStore((state) => state.data.sections[sectionType].items)
  const reorderSectionItems = useResumeStore((state) => state.reorderSectionItems)
  const removeSectionItem = useResumeStore((state) => state.removeSectionItem)
  const upsertGenericSectionItem = useResumeStore((state) => state.upsertGenericSectionItem)
  // GENERIC_SECTION_FIELDS is a full Record<GenericSectionType, FieldConfig[]>
  // (not Partial) -- every generic section type is guaranteed an entry, checked
  // at compile time in sectionFieldConfig.ts, so no fallback is needed here.
  const fields = GENERIC_SECTION_FIELDS[sectionType]

  return (
    <div className="flex flex-col gap-2 border-t border-neutral-700 px-3.5 pb-3.5 pt-3">
      <GenericItemList
        items={items as GenericItem[]}
        fields={fields}
        sectionType={sectionType}
        idPrefix={`section-items-${sectionType}`}
        onReorder={(fromIndex, toIndex) => reorderSectionItems(sectionType, fromIndex, toIndex)}
        onRemove={(itemId) => removeSectionItem(sectionType, itemId)}
        onUpsert={(item) => upsertGenericSectionItem(sectionType, item)}
      />
    </div>
  )
}

// Available "type" choices for a custom section -- the same 11
// GenericSectionType values GENERIC_SECTION_FIELDS covers. Not Experience
// (hand-written roles[] editor, no generic form config exists for it) and
// not Summary/Cover Letter (single-object shapes, not item lists).
const GENERIC_TYPES = Object.keys(GENERIC_TYPE_LABELS) as GenericSectionType[]

function CustomSectionBody({ customSectionId }: { customSectionId: string }) {
  const section = useResumeStore((state) =>
    state.data.customSections.find((s) => s.id === customSectionId),
  )
  const updateCustomSection = useResumeStore((state) => state.updateCustomSection)
  const reorderCustomSectionItems = useResumeStore((state) => state.reorderCustomSectionItems)
  const removeCustomSectionItem = useResumeStore((state) => state.removeCustomSectionItem)
  const upsertCustomSectionItem = useResumeStore((state) => state.upsertCustomSectionItem)

  // Type changes that would clear existing items get a confirm step first
  // (per the confirmed plan) -- this holds the pending choice until the
  // user confirms or cancels. Empty sections switch immediately: nothing
  // to lose, no need to interrupt.
  const [pendingType, setPendingType] = useState<GenericSectionType | null>(null)

  if (!section) return null

  const type = section.type as GenericSectionType
  const fields = GENERIC_SECTION_FIELDS[type]

  function handleTypeChange(next: GenericSectionType) {
    if (!section || next === type) return
    if (section.items.length === 0) {
      updateCustomSection(customSectionId, { type: next })
      return
    }
    setPendingType(next)
  }

  function confirmTypeChange() {
    if (!pendingType) return
    updateCustomSection(customSectionId, { type: pendingType })
    setPendingType(null)
  }

  return (
    <div className="flex flex-col gap-3 border-t border-neutral-700 px-3.5 pb-3.5 pt-3">
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-neutral-400">
          Section type
        </span>
        <Select
          aria-label="Section type"
          value={type}
          onChange={(e) => handleTypeChange(e.target.value as GenericSectionType)}
        >
          {GENERIC_TYPES.map((t) => (
            <option key={t} value={t}>
              {GENERIC_TYPE_LABELS[t]}
            </option>
          ))}
        </Select>

        {pendingType && (
          <div className="mt-1 flex items-center gap-2 rounded-md border border-orange-700 bg-neutral-900 px-2.5 py-2 text-[11.5px] text-neutral-300">
            <span className="flex-1">
              Change to {GENERIC_TYPE_LABELS[pendingType]}? This clears this section's{" "}
              {section.items.length} item{section.items.length === 1 ? "" : "s"}.
            </span>
            <button
              type="button"
              onClick={confirmTypeChange}
              className="flex-shrink-0 text-orange-500 transition-colors hover:text-orange-400"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setPendingType(null)}
              className="flex-shrink-0 text-neutral-500 transition-colors hover:text-neutral-300"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <GenericItemList
        items={section.items as GenericItem[]}
        fields={fields}
        sectionType={type}
        idPrefix={`custom-section-items-${customSectionId}`}
        onReorder={(fromIndex, toIndex) =>
          reorderCustomSectionItems(customSectionId, fromIndex, toIndex)
        }
        onRemove={(itemId) => removeCustomSectionItem(customSectionId, itemId)}
        onUpsert={(item) => upsertCustomSectionItem(customSectionId, item)}
      />
    </div>
  )
}

// Shared item list -- drag-to-reorder, inline-expand rows, add-item button
// -- used by both GenericSectionBody (built-in sections) and
// CustomSectionBody (custom sections). Deliberately dumb: no store access
// of its own, just the items/fields to render and callbacks to invoke, so
// each caller stays responsible for wiring its own section's store methods.
function GenericItemList({
  items,
  fields,
  sectionType,
  idPrefix,
  onReorder,
  onRemove,
  onUpsert,
}: {
  items: GenericItem[]
  fields: FieldConfig[]
  sectionType: SectionType
  idPrefix: string
  onReorder: (fromIndex: number, toIndex: number) => void
  onRemove: (itemId: string) => void
  onUpsert: (item: GenericItem) => void
}) {
  // Only one item expanded at a time per section, mirroring the section
  // accordion's own one-at-a-time behavior. No modal, no draft state — every
  // field change writes straight to the store, same pattern as BasicsForm.
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: DRAG_ACTIVATION_CONSTRAINT }),
  )

  function handleItemDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((item) => item.id === active.id)
    const newIndex = items.findIndex((item) => item.id === over.id)
    onReorder(oldIndex, newIndex)
  }

  function handleAddItem() {
    const newItem = emptyItemFromFields(fields)
    onUpsert(newItem)
    setExpandedId(newItem.id)
  }

  return (
    <>
      <DndContext
        id={idPrefix}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleItemDragEnd}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item, index) => (
            <InlineSortableItemRow
              key={item.id}
              id={item.id}
              summary={sectionItemSummary(sectionType, item)}
              isExpanded={expandedId === item.id}
              onToggle={() =>
                setExpandedId((current) => (current === item.id ? null : item.id))
              }
              onDelete={() => {
                onRemove(item.id)
                if (expandedId === item.id) setExpandedId(null)
              }}
              onMoveUp={index > 0 ? () => onReorder(index, index - 1) : undefined}
              onMoveDown={index < items.length - 1 ? () => onReorder(index, index + 1) : undefined}
            >
              <InlineItemFields
                fields={fields}
                item={item}
                onChange={onUpsert}
              />
            </InlineSortableItemRow>
          ))}
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={handleAddItem}
        className="mt-1.5 flex items-center gap-1.5 self-start rounded-md border border-orange-700 bg-neutral-800 px-3 py-1.5 text-[12px] text-neutral-100 transition-colors duration-150 hover:bg-neutral-700"
      >
        <IconPlus size={14} />
        Add item
      </button>
    </>
  )
}

function SortableCustomSectionRow({
  customSectionId,
  isOpen,
  onToggle,
  onMoveUp,
  onMoveDown,
}: {
  customSectionId: string
  isOpen: boolean
  onToggle: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: customSectionId,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={
        isOpen
          ? "rounded-md border border-neutral-700 bg-neutral-800 transition-colors duration-150 hover:border-neutral-600 lg:col-span-2"
          : "min-w-0 rounded-md border border-neutral-700 bg-neutral-800 transition-colors duration-150 hover:border-neutral-600"
      }
    >
      <CustomSectionHeader
        customSectionId={customSectionId}
        isOpen={isOpen}
        onToggle={onToggle}
        dragHandleProps={{ ...attributes, ...listeners }}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
      />
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <CustomSectionBody customSectionId={customSectionId} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function CustomSectionHeader({
  customSectionId,
  isOpen,
  onToggle,
  dragHandleProps,
  onMoveUp,
  onMoveDown,
}: {
  customSectionId: string
  isOpen: boolean
  onToggle: () => void
  dragHandleProps: Record<string, unknown>
  onMoveUp?: () => void
  onMoveDown?: () => void
}) {
  const section = useResumeStore((state) =>
    state.data.customSections.find((s) => s.id === customSectionId),
  )
  const updateCustomSection = useResumeStore((state) => state.updateCustomSection)
  const removeCustomSection = useResumeStore((state) => state.removeCustomSection)

  const [renaming, setRenaming] = useState(false)
  const [titleDraft, setTitleDraft] = useState("")
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current)
    }
  }, [])

  if (!section) return null

  // Mirrors the PDF engine's own fallback for blank-titled custom sections
  // (src/lib/pdf/section-title.ts): a default label per underlying type,
  // instead of showing the raw UUID or an empty header.
  const displayTitle =
    section.title || GENERIC_TYPE_LABELS[section.type as GenericSectionType] || section.type

  function commitRename() {
    updateCustomSection(customSectionId, { title: titleDraft })
    setRenaming(false)
  }

  function handleTitleClick() {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current)
      clickTimerRef.current = null
      setTitleDraft(section?.title || displayTitle)
      setRenaming(true)
      return
    }
    clickTimerRef.current = setTimeout(() => {
      clickTimerRef.current = null
      onToggle()
    }, 250)
  }

  return (
    <div
      onClick={onToggle}
      className="flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-2.5 transition-colors hover:bg-neutral-700/40 md:gap-2.5 md:px-3.5"
    >
      <button
        type="button"
        className="flex-shrink-0 cursor-grab touch-none text-neutral-500 transition-colors hover:text-neutral-300"
        onClick={(e) => e.stopPropagation()}
        {...dragHandleProps}
      >
        <IconGripVertical size={15} />
      </button>

      <MoveButtons onMoveUp={onMoveUp} onMoveDown={onMoveDown} />

      {renaming ? (
        <Input
          autoFocus
          value={titleDraft}
          onChange={(e) => setTitleDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => e.key === "Enter" && commitRename()}
          onClick={(e) => e.stopPropagation()}
          className="h-7 flex-1 py-0 text-[13px]"
        />
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleTitleClick()
          }}
          title={`${displayTitle} — click to expand, double-click to rename`}
          className="min-w-0 flex-1 truncate text-left text-[13.5px] font-medium tracking-[0.01em] text-neutral-100"
        >
          {displayTitle}
        </button>
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-shrink-0 overflow-hidden rounded-md border border-neutral-700"
        role="group"
        aria-label="column layout"
      >
        <button
          type="button"
          onClick={() => updateCustomSection(customSectionId, { columns: 1 })}
          aria-pressed={section.columns === 1}
          title="1 column"
          className={
            section.columns === 1
              ? "h-7 w-5 bg-orange-700 text-[11px] text-neutral-100"
              : "h-7 w-5 bg-neutral-800 text-[11px] text-neutral-400 transition-colors hover:text-neutral-200"
          }
        >
          1
        </button>
        <button
          type="button"
          onClick={() => updateCustomSection(customSectionId, { columns: 2 })}
          aria-pressed={section.columns === 2}
          title="2 columns"
          className={
            section.columns === 2
              ? "h-7 w-5 bg-orange-700 text-[11px] text-neutral-100"
              : "h-7 w-5 bg-neutral-800 text-[11px] text-neutral-400 transition-colors hover:text-neutral-200"
          }
        >
          2
        </button>
      </div>

      <div onClick={(e) => e.stopPropagation()}>
        <Switch
          checked={!section.hidden}
          onCheckedChange={(checked) => updateCustomSection(customSectionId, { hidden: !checked })}
          aria-label={`Toggle ${displayTitle} visibility`}
        />
      </div>

      <div onClick={(e) => e.stopPropagation()}>
        <DeleteSectionButton onConfirm={() => removeCustomSection(customSectionId)} />
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
        }}
        className="flex-shrink-0 text-neutral-400 transition-colors hover:text-neutral-100"
      >
        <IconChevronDown
          size={15}
          className={
            isOpen
              ? "rotate-180 transition-transform duration-150"
              : "transition-transform duration-150"
          }
        />
      </button>
    </div>
  )
}

function ExperienceSectionBody() {
  const items = useResumeStore((state) => state.data.sections.experience.items)
  const reorderSectionItems = useResumeStore((state) => state.reorderSectionItems)
  const removeSectionItem = useResumeStore((state) => state.removeSectionItem)
  const upsertSectionItem = useResumeStore((state) => state.upsertSectionItem)

  const [modalItem, setModalItem] = useState<ExperienceItem | "new" | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: DRAG_ACTIVATION_CONSTRAINT }),
  )

  function handleItemDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((item) => item.id === active.id)
    const newIndex = items.findIndex((item) => item.id === over.id)
    reorderSectionItems("experience", oldIndex, newIndex)
  }

  return (
    <div className="flex flex-col gap-2 border-t border-neutral-700 px-3.5 pb-3.5 pt-3">
      <DndContext
        id="section-items-experience"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleItemDragEnd}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item, index) => (
            <SortableItemRow
              key={item.id}
              id={item.id}
              summary={item.position || item.company || "Untitled"}
              onEdit={() => setModalItem(item)}
              onDelete={() => removeSectionItem("experience", item.id)}
              onMoveUp={
                index > 0
                  ? () => reorderSectionItems("experience", index, index - 1)
                  : undefined
              }
              onMoveDown={
                index < items.length - 1
                  ? () => reorderSectionItems("experience", index, index + 1)
                  : undefined
              }
            />
          ))}
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={() => setModalItem("new")}
        className="mt-1.5 flex items-center gap-1.5 self-start rounded-md border border-orange-700 bg-neutral-800 px-3 py-1.5 text-[12px] text-neutral-100 transition-colors duration-150 hover:bg-neutral-700"
      >
        <IconPlus size={14} />
        Add item
      </button>

      {modalItem !== null && (
        <ExperienceItemModal
          item={modalItem === "new" ? null : modalItem}
          onSave={(item) => {
            upsertSectionItem("experience", item)
            setModalItem(null)
          }}
          onClose={() => setModalItem(null)}
        />
      )}
    </div>
  )
}

function InlineSortableItemRow({
  id,
  summary,
  isExpanded,
  onToggle,
  onDelete,
  onMoveUp,
  onMoveDown,
  children,
}: {
  id: string
  summary: string
  isExpanded: boolean
  onToggle: () => void
  onDelete: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  children: React.ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={
        isExpanded
          ? "rounded-md border border-orange-700 bg-neutral-900"
          : "rounded-md border border-neutral-700 bg-neutral-900 transition-colors duration-150 hover:border-neutral-600"
      }
    >
      <div
        onClick={onToggle}
        className="flex cursor-pointer items-center gap-2.5 px-2.5 py-2"
      >
        <button
          type="button"
          className="cursor-grab touch-none text-neutral-500 transition-colors hover:text-neutral-300"
          onClick={(e) => e.stopPropagation()}
          {...attributes}
          {...listeners}
        >
          <IconGripVertical size={14} />
        </button>
        <MoveButtons onMoveUp={onMoveUp} onMoveDown={onMoveDown} size={12} />
        <span className="flex-1 truncate text-[12.5px] text-neutral-200">{summary}</span>
        <IconChevronDown
          size={14}
          className={
            isExpanded
              ? "rotate-180 text-neutral-300 transition-transform duration-150"
              : "text-neutral-500 transition-transform duration-150"
          }
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="text-neutral-500 transition-colors hover:text-neutral-200"
        >
          <IconTrash size={14} />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SortableItemRow({
  id,
  summary,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  id: string
  summary: string
  onEdit: () => void
  onDelete: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2.5 rounded-md border border-neutral-700 bg-neutral-900 px-2.5 py-2 transition-colors duration-150 hover:border-neutral-600"
    >
      <button
        type="button"
        className="cursor-grab touch-none text-neutral-500 transition-colors hover:text-neutral-300"
        {...attributes}
        {...listeners}
      >
        <IconGripVertical size={14} />
      </button>
      <MoveButtons onMoveUp={onMoveUp} onMoveDown={onMoveDown} size={12} />
      <span className="flex-1 truncate text-[12.5px] text-neutral-200">{summary}</span>
      <button
        type="button"
        onClick={onEdit}
        className="text-neutral-500 transition-colors hover:text-neutral-200"
      >
        <IconEdit size={14} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="text-neutral-500 transition-colors hover:text-neutral-200"
      >
        <IconTrash size={14} />
      </button>
    </div>
  )
}
