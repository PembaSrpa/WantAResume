import { describe, it, expect, beforeEach } from "vitest"
import { useResumeStore } from "@/lib/store/resume"

// Real isolation tests: the actual thing worth verifying is that each
// resetTab call only touches its own tab's fields and leaves the other
// two tabs' data completely untouched -- not just "does reset clear data".

function setDirtyState() {
  const { updateField, upsertSectionItem } = useResumeStore.getState()

  updateField("basics", {
    name: "Dirty Name",
    headline: "Dirty Headline",
    email: "dirty@example.com",
    phone: "555-0000",
    location: "Dirtyville",
    website: { url: "https://dirty.example", label: "Dirty" },
    customFields: [{ id: "cf1", icon: "star", text: "dirty", link: "" }],
  })
  const currentPicture = useResumeStore.getState().data.picture
  updateField("picture", {
    ...currentPicture,
    hidden: false,
    url: "data:image/png;base64,dirty",
    size: 100,
    rotation: 5,
    aspectRatio: 1,
  })

  upsertSectionItem("skills", {
    id: "skill1",
    hidden: false,
    name: "Dirty Skill",
    proficiency: "Expert",
    level: 5,
    keywords: ["dirty"],
  } as never)
  updateField("summary", {
    title: "Dirty Summary Title",
    icon: "",
    columns: 1,
    hidden: false,
    content: "Dirty summary content",
  })

  const state = useResumeStore.getState()
  updateField("metadata", {
    ...state.data.metadata,
    design: {
      ...state.data.metadata.design,
      colors: { primary: "rgba(1, 2, 3, 1)", text: "rgba(4, 5, 6, 1)", background: "rgba(7, 8, 9, 1)" },
    },
    page: { ...state.data.metadata.page, marginX: 99, marginY: 99, format: "letter" },
  })
}

describe("resetTab isolation", () => {
  beforeEach(() => {
    useResumeStore.getState().resetToDefault()
    setDirtyState()
  })

  it('resetTab("basics") restores basics and picture, leaves sections/summary/design untouched', () => {
    const before = useResumeStore.getState().data
    useResumeStore.getState().resetTab("basics")
    const after = useResumeStore.getState().data

    // Reset: basics/picture should no longer equal the dirty values.
    expect(after.basics.name).not.toBe("Dirty Name")
    expect(after.basics.email).not.toBe("dirty@example.com")
    expect(after.picture.url).not.toBe("data:image/png;base64,dirty")

    // Untouched: sections, summary, design must be byte-identical to
    // their dirty pre-reset state.
    expect(after.sections.skills).toEqual(before.sections.skills)
    expect(after.summary).toEqual(before.summary)
    expect(after.metadata.design).toEqual(before.metadata.design)
    expect(after.metadata.page).toEqual(before.metadata.page)
  })

  it('resetTab("sections") restores sections/summary/customSections, leaves basics/picture/design untouched', () => {
    const before = useResumeStore.getState().data
    useResumeStore.getState().resetTab("sections")
    const after = useResumeStore.getState().data

    // Reset: sections/summary should no longer equal the dirty values.
    expect(after.sections.skills.items).toEqual([])
    expect(after.summary.content).not.toBe("Dirty summary content")

    // Untouched: basics, picture, design must be byte-identical to their
    // dirty pre-reset state.
    expect(after.basics).toEqual(before.basics)
    expect(after.picture).toEqual(before.picture)
    expect(after.metadata.design).toEqual(before.metadata.design)
    expect(after.metadata.page).toEqual(before.metadata.page)
  })

  it('resetTab("design") restores design/typography/page, leaves basics/picture/sections untouched', () => {
    const before = useResumeStore.getState().data
    useResumeStore.getState().resetTab("design")
    const after = useResumeStore.getState().data

    // Reset: design/page should no longer equal the dirty values.
    expect(after.metadata.design.colors.primary).not.toBe("rgba(1, 2, 3, 1)")
    expect(after.metadata.page.marginX).not.toBe(99)
    expect(after.metadata.page.format).not.toBe("letter")

    // Untouched: basics, picture, sections, summary must be byte-identical
    // to their dirty pre-reset state.
    expect(after.basics).toEqual(before.basics)
    expect(after.picture).toEqual(before.picture)
    expect(after.sections.skills).toEqual(before.sections.skills)
    expect(after.summary).toEqual(before.summary)
  })

  it("resetTab never touches metadata.layout (section ordering) regardless of which tab is reset", () => {
    const before = useResumeStore.getState().data.metadata.layout

    useResumeStore.getState().resetTab("basics")
    expect(useResumeStore.getState().data.metadata.layout).toEqual(before)

    useResumeStore.getState().resetTab("sections")
    expect(useResumeStore.getState().data.metadata.layout).toEqual(before)

    useResumeStore.getState().resetTab("design")
    expect(useResumeStore.getState().data.metadata.layout).toEqual(before)
  })
})
