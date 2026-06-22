"use client"

import { useState } from "react"
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
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconGripVertical,
  IconChevronDown,
  IconEdit,
  IconTrash,
  IconPlus,
} from "@tabler/icons-react"
import { motion, AnimatePresence } from "motion/react"
import { useResumeStore } from "@/lib/store/resume"
import type { SectionType, ExperienceItem } from "@/lib/schema/data"
import { Switch } from "@/components/ui/Switch"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { ExperienceItemModal } from "./SectionItemModal"
import { GenericItemModal, type GenericItem } from "./GenericItemModal"
import { GENERIC_SECTION_FIELDS, sectionItemSummary } from "./sectionFieldConfig"

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
  const [openSection, setOpenSection] = useState<SectionType | null>("experience")

  const mainOrder = useResumeStore((state) => state.data.metadata.layout.pages[0]?.main ?? [])
  const reorderSections = useResumeStore((state) => state.reorderSections)

  // pages[0].main can also contain "summary" and custom-section UUIDs; this
  // accordion only manages the 11 built-in SECTION_TYPES (see note above).
  // Anything in SECTION_TYPES but missing from main (e.g. on a freshly reset
  // resume where main hasn't been populated yet) is appended at the end so
  // it's still visible and reorderable.
  const sectionOrder = [
    ...mainOrder.filter((id): id is SectionType => SECTION_TYPES.includes(id as SectionType)),
    ...SECTION_TYPES.filter((type) => !mainOrder.includes(type)),
  ]

  const sensors = useSensors(useSensor(PointerSensor))

  function handleSectionDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = sectionOrder.indexOf(active.id as SectionType)
    const newIndex = sectionOrder.indexOf(over.id as SectionType)
    reorderSections(arrayMove(sectionOrder, oldIndex, newIndex))
  }

  return (
    <DndContext
      id="section-order"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleSectionDragEnd}
    >
      <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2.5">
          {sectionOrder.map((sectionType) => (
            <SortableSectionRow
              key={sectionType}
              sectionType={sectionType}
              isOpen={openSection === sectionType}
              onToggle={() =>
                setOpenSection((current) => (current === sectionType ? null : sectionType))
              }
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

function SortableSectionRow({
  sectionType,
  isOpen,
  onToggle,
}: {
  sectionType: SectionType
  isOpen: boolean
  onToggle: () => void
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
      className="rounded-md border border-neutral-700 bg-neutral-800 transition-colors duration-150 hover:border-neutral-600"
    >
      <SectionHeader
        sectionType={sectionType}
        isOpen={isOpen}
        onToggle={onToggle}
        dragHandleProps={{ ...attributes, ...listeners }}
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
}: {
  sectionType: SectionType
  isOpen: boolean
  onToggle: () => void
  dragHandleProps: Record<string, unknown>
}) {
  const section = useResumeStore((state) => state.data.sections[sectionType])
  const updateSection = useResumeStore((state) => state.updateSection)

  const [renaming, setRenaming] = useState(false)
  const [titleDraft, setTitleDraft] = useState(section.title)

  function commitRename() {
    updateSection(sectionType, { title: titleDraft })
    setRenaming(false)
  }

  return (
    <div className="flex items-center gap-2.5 px-3.5 py-2.5">
      <button
        type="button"
        className="cursor-grab text-neutral-500 transition-colors hover:text-neutral-300"
        {...dragHandleProps}
      >
        <IconGripVertical size={16} />
      </button>

      {renaming ? (
        <Input
          autoFocus
          value={titleDraft}
          onChange={(e) => setTitleDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => e.key === "Enter" && commitRename()}
          className="h-7 flex-1 py-0 text-[13px]"
        />
      ) : (
        <button
          type="button"
          onClick={() => setRenaming(true)}
          className="flex-1 text-left text-[13.5px] font-medium tracking-[0.01em] text-neutral-100"
        >
          {section.title || sectionType}
        </button>
      )}

      <Select
        value={section.columns}
        onChange={(e) => updateSection(sectionType, { columns: Number(e.target.value) })}
        className="h-7 w-[68px] px-2 py-0 text-[11.5px]"
      >
        <option value={1}>1 col</option>
        <option value={2}>2 col</option>
      </Select>

      <Switch
        checked={!section.hidden}
        onCheckedChange={(checked) => updateSection(sectionType, { hidden: !checked })}
        aria-label={`Toggle ${sectionType} visibility`}
      />

      <button
        type="button"
        onClick={onToggle}
        className="text-neutral-400 transition-colors hover:text-neutral-100"
      >
        <IconChevronDown
          size={16}
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

function GenericSectionBody({ sectionType }: { sectionType: SectionType }) {
  const items = useResumeStore((state) => state.data.sections[sectionType].items)
  const reorderSectionItems = useResumeStore((state) => state.reorderSectionItems)
  const removeSectionItem = useResumeStore((state) => state.removeSectionItem)
  const upsertSectionItem = useResumeStore((state) => state.upsertSectionItem)

  const [modalItem, setModalItem] = useState<GenericItem | "new" | null>(null)

  const sensors = useSensors(useSensor(PointerSensor))
  const fields = GENERIC_SECTION_FIELDS[sectionType] ?? []

  function handleItemDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((item) => item.id === active.id)
    const newIndex = items.findIndex((item) => item.id === over.id)
    reorderSectionItems(sectionType, oldIndex, newIndex)
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
          {items.map((item) => (
            <SortableItemRow
              key={item.id}
              id={item.id}
              summary={sectionItemSummary(sectionType, item)}
              onEdit={() => setModalItem(item as GenericItem)}
              onDelete={() => removeSectionItem(sectionType, item.id)}
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
        <GenericItemModal
          title={modalItem === "new" ? `Add ${sectionType.slice(0, -1)}` : `Edit ${sectionType.slice(0, -1)}`}
          fields={fields}
          item={modalItem === "new" ? null : modalItem}
          onSave={(item) => {
            upsertSectionItem(sectionType, item as never)
            setModalItem(null)
          }}
          onClose={() => setModalItem(null)}
        />
      )}
    </div>
  )
}

function ExperienceSectionBody() {
  const items = useResumeStore((state) => state.data.sections.experience.items)
  const reorderSectionItems = useResumeStore((state) => state.reorderSectionItems)
  const removeSectionItem = useResumeStore((state) => state.removeSectionItem)
  const upsertSectionItem = useResumeStore((state) => state.upsertSectionItem)

  const [modalItem, setModalItem] = useState<ExperienceItem | "new" | null>(null)

  const sensors = useSensors(useSensor(PointerSensor))

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
          {items.map((item) => (
            <SortableItemRow
              key={item.id}
              id={item.id}
              summary={item.position || item.company || "Untitled"}
              onEdit={() => setModalItem(item)}
              onDelete={() => removeSectionItem("experience", item.id)}
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

function SortableItemRow({
  id,
  summary,
  onEdit,
  onDelete,
}: {
  id: string
  summary: string
  onEdit: () => void
  onDelete: () => void
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
        className="cursor-grab text-neutral-500 transition-colors hover:text-neutral-300"
        {...attributes}
        {...listeners}
      >
        <IconGripVertical size={14} />
      </button>
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
