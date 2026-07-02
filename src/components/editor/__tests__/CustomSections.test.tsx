import { describe, it, expect, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SectionAccordion } from "@/components/editor/SectionAccordion"
import { useResumeStore } from "@/lib/store/resume"

beforeEach(() => {
  useResumeStore.getState().resetToDefault()
})

describe("custom sections", () => {
  it("creates a custom section, placing it in the chosen column's layout order", async () => {
    const user = userEvent.setup()
    render(<SectionAccordion />)

    await user.click(screen.getByRole("button", { name: /add custom section/i }))
    await user.selectOptions(screen.getByLabelText(/section type/i), "awards")
    await user.selectOptions(screen.getByLabelText(/new section column/i), "sidebar")
    await user.click(screen.getByRole("button", { name: /^create section$/i }))

    // Blank title falls back to the type's label (mirrors the PDF engine's
    // own fallback for blank-titled custom sections). Query by role/name to
    // disambiguate from the now-expanded section's own type-picker Select,
    // which also has an "Awards" <option>.
    const title = screen.getByRole("button", { name: /^Awards\b/ })
    expect(title).toBeInTheDocument()

    const { data } = useResumeStore.getState()
    expect(data.customSections).toHaveLength(1)
    const created = data.customSections[0]!
    expect(created.type).toBe("awards")
    expect(data.metadata.layout.pages[0]!.sidebar).toContain(created.id)
    expect(data.metadata.layout.pages[0]!.main).not.toContain(created.id)
  })

  it("renaming works the same as built-in sections (double click title)", async () => {
    const user = userEvent.setup()
    useResumeStore.getState().addCustomSection("skills", "main")
    render(<SectionAccordion />)

    const title = screen.getByText("Skills")
    await user.dblClick(title)

    const input = await screen.findByDisplayValue("Skills")
    await user.clear(input)
    await user.type(input, "Tech Stack")
    await user.tab()

    expect(useResumeStore.getState().data.customSections[0]!.title).toBe("Tech Stack")
  })

  it("adding an item uses the fields for the section's chosen type", async () => {
    const user = userEvent.setup()
    useResumeStore.getState().addCustomSection("awards", "main")
    render(<SectionAccordion />)

    await user.click(screen.getByRole("button", { name: /^Awards\b/ }).closest("div")!)
    await user.click(screen.getByRole("button", { name: /^add item$/i }))

    // Awards' field config includes a "Title" field per sectionFieldConfig.ts
    expect(await screen.findByLabelText(/^title$/i)).toBeInTheDocument()
    expect(useResumeStore.getState().data.customSections[0]!.items).toHaveLength(1)
  })

  it("changing type on a non-empty section requires confirmation before clearing items", async () => {
    const user = userEvent.setup()
    const id = useResumeStore.getState().addCustomSection("awards", "main")
    useResumeStore.getState().upsertCustomSectionItem(id, { id: "item-1", hidden: false, title: "Test" })
    render(<SectionAccordion />)

    await user.click(screen.getByRole("button", { name: /^Awards\b/ }).closest("div")!)
    await user.selectOptions(screen.getByLabelText(/section type/i), "skills")

    // Not applied yet -- still the original type and item.
    expect(useResumeStore.getState().data.customSections[0]!.type).toBe("awards")
    expect(useResumeStore.getState().data.customSections[0]!.items).toHaveLength(1)

    await user.click(screen.getByRole("button", { name: /^confirm$/i }))

    const updated = useResumeStore.getState().data.customSections[0]!
    expect(updated.type).toBe("skills")
    expect(updated.items).toHaveLength(0)
  })

  it("deleting a custom section requires a second confirming click, and removes it from the layout too", async () => {
    const user = userEvent.setup()
    const id = useResumeStore.getState().addCustomSection("awards", "main")
    render(<SectionAccordion />)

    const deleteButton = screen.getByRole("button", { name: /^delete section$/i })
    await user.click(deleteButton)
    // First click only arms the confirm state -- section still present.
    expect(useResumeStore.getState().data.customSections).toHaveLength(1)

    await user.click(screen.getByRole("button", { name: /confirm delete section/i }))

    const { data } = useResumeStore.getState()
    expect(data.customSections).toHaveLength(0)
    expect(data.metadata.layout.pages[0]!.main).not.toContain(id)
  })
})
