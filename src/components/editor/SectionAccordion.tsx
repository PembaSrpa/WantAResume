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
import { ExperienceItemModal } from "./SectionItemModal"
import { emptyItemFromFields, type GenericItem } from "./itemFields"
import { InlineItemFields } from "./InlineItemFields"
import { GENERIC_SECTION_FIELDS, sectionItemSummary } from "./sectionFieldConfig"
import { ResetTabButton } from "./ResetTabButton"

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

// Built-in section keys this accordion manages. "summary" is handled separately
// outside this component (see plan); custom sections (UUID ids) are out of scope
// for this pass too.
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
  const [openSection, setOpenSection] = useState<SectionType | null>(null)

  const mainOrder = useResumeStore((state) => state.data.metadata.layout.pages[0]?.main ?? [])
  const reorderSections = useResumeStore((state) => state.reorderSections)
  const resetTab = useResumeStore((state) => state.resetTab)

  // pages[0].main can also contain "summary" and custom-section UUIDs; this
  // accordion only manages the 11 built-in SECTION_TYPES (see note above).
  // Anything in SECTION_TYPES but missing from main (e.g. on a freshly reset
  // resume where main hasn't been populated yet) is appended at the end so
  // it's still visible and reorderable.
  const sectionOrder = [
    ...mainOrder.filter((id): id is SectionType => SECTION_TYPES.includes(id as SectionType)),
    ...SECTION_TYPES.filter((type) => !mainOrder.includes(type)),
  ]

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: DRAG_ACTIVATION_CONSTRAINT }),
  )

  function handleSectionDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = sectionOrder.indexOf(active.id as SectionType)
    const newIndex = sectionOrder.indexOf(over.id as SectionType)
    reorderSections(arrayMove(sectionOrder, oldIndex, newIndex))
  }

  // Mobile fallback for drag-and-drop reordering. Touch-drag is configured
  // (activationConstraint + touch-action) but cannot be fully verified as
  // reliable in this environment — see TASK_MOBILE_TOUCH_DND.md. These
  // up/down buttons are a guaranteed-working alternative, shown mobile-only
  // (md:hidden) alongside the drag handle, not instead of it.
  function moveSectionBy(sectionType: SectionType, delta: 1 | -1) {
    const index = sectionOrder.indexOf(sectionType)
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
          {sectionOrder.map((sectionType, index) => (
            <SortableSectionRow
              key={sectionType}
              sectionType={sectionType}
              isOpen={openSection === sectionType}
              onToggle={() =>
                setOpenSection((current) => (current === sectionType ? null : sectionType))
              }
              onMoveUp={index > 0 ? () => moveSectionBy(sectionType, -1) : undefined}
              onMoveDown={
                index < sectionOrder.length - 1 ? () => moveSectionBy(sectionType, 1) : undefined
              }
            />
          ))}
        </div>
      </SortableContext>
      </DndContext>
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

  // Only one item expanded at a time per section, mirroring the section
  // accordion's own one-at-a-time behavior. No modal, no draft state — every
  // field change writes straight to the store, same pattern as BasicsForm.
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: DRAG_ACTIVATION_CONSTRAINT }),
  )
  // GENERIC_SECTION_FIELDS is a full Record<GenericSectionType, FieldConfig[]>
  // (not Partial) -- every generic section type is guaranteed an entry, checked
  // at compile time in sectionFieldConfig.ts, so no fallback is needed here.
  const fields = GENERIC_SECTION_FIELDS[sectionType]

  function handleItemDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((item) => item.id === active.id)
    const newIndex = items.findIndex((item) => item.id === over.id)
    reorderSectionItems(sectionType, oldIndex, newIndex)
  }

  function handleAddItem() {
    const newItem = emptyItemFromFields(fields)
    upsertGenericSectionItem(sectionType, newItem)
    setExpandedId(newItem.id)
  }

  return (
    <div className="flex flex-col gap-2 border-t border-neutral-700 px-3.5 pb-3.5 pt-3">
      <DndContext
        id={`section-items-${sectionType}`}
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
                removeSectionItem(sectionType, item.id)
                if (expandedId === item.id) setExpandedId(null)
              }}
              onMoveUp={
                index > 0 ? () => reorderSectionItems(sectionType, index, index - 1) : undefined
              }
              onMoveDown={
                index < items.length - 1
                  ? () => reorderSectionItems(sectionType, index, index + 1)
                  : undefined
              }
            >
              <InlineItemFields
                fields={fields}
                item={item as GenericItem}
                onChange={(updated) => upsertGenericSectionItem(sectionType, updated)}
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
