import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SectionAccordion } from "@/components/editor/SectionAccordion"

function getTitleButton(name: string) {
  return screen
    .getAllByTitle(new RegExp(`^${name} —`, "i"))
    .find((el) => el.textContent === name)!
}

describe("Mobile drag fallback: section-level move buttons", () => {
  it("the first section's Move up button is disabled, Move down is enabled", () => {
    render(<SectionAccordion />)

    const profilesTitle = getTitleButton("profiles")
    const profilesRow = profilesTitle.closest('[class*="rounded-md border"]')!
    const moveUp = profilesRow.querySelector('button[aria-label="Move up"]') as HTMLButtonElement
    const moveDown = profilesRow.querySelector(
      'button[aria-label="Move down"]',
    ) as HTMLButtonElement

    expect(moveUp).toBeDisabled()
    expect(moveDown).not.toBeDisabled()
  })

  it("the last section in computed order has a disabled Move down, enabled Move up", () => {
    render(<SectionAccordion />)

    // Real computed order: main (profiles, education, experience, projects,
    // volunteer, references) followed by sidebar-only types appended in
    // SECTION_TYPES declaration order, per SectionAccordion's documented
    // main-only limitation. "publications" ends up last. Confirmed by
    // checking the real default data and SectionAccordion's own fallback
    // logic rather than assuming declaration order.
    const lastTitle = getTitleButton("publications")
    const lastRow = lastTitle.closest('[class*="rounded-md border"]')!
    const moveUp = lastRow.querySelector('button[aria-label="Move up"]') as HTMLButtonElement
    const moveDown = lastRow.querySelector(
      'button[aria-label="Move down"]',
    ) as HTMLButtonElement

    expect(moveDown).toBeDisabled()
    expect(moveUp).not.toBeDisabled()
  })

  it("clicking Move down actually reorders the section (profiles moves after education)", async () => {
    const user = userEvent.setup()
    render(<SectionAccordion />)

    const profilesTitle = getTitleButton("profiles")
    const profilesRow = profilesTitle.closest('[class*="rounded-md border"]')!
    const moveDown = profilesRow.querySelector(
      'button[aria-label="Move down"]',
    ) as HTMLButtonElement

    await user.click(moveDown)

    // After moving profiles down one position, it should now appear after
    // education in DOM order (real reordering, not just a visual trick).
    const allTitleButtons = screen
      .getAllByTitle(/—/)
      .filter((el) => el.tagName === "BUTTON")
    const labels = allTitleButtons.map((el) => el.textContent)
    const profilesIndex = labels.indexOf("profiles")
    const educationIndex = labels.indexOf("education")

    expect(profilesIndex).toBeGreaterThan(educationIndex)
  })

  it("Move up/down buttons stop propagation and do not toggle expand/collapse", async () => {
    const user = userEvent.setup()
    render(<SectionAccordion />)

    const educationTitle = getTitleButton("education")
    const educationRow = educationTitle.closest('[class*="rounded-md border"]')!
    const moveDown = educationRow.querySelector(
      'button[aria-label="Move down"]',
    ) as HTMLButtonElement

    await user.click(moveDown)

    // education had no items; if it had been toggled open, "Add item"
    // would now exist inside its row.
    const addItemInRow = Array.from(educationRow.querySelectorAll("button")).filter(
      (b) => b.textContent?.trim() === "Add item",
    )
    expect(addItemInRow.length).toBe(0)
  })
})

describe("Mobile drag fallback: item-level move buttons (Experience)", () => {
  function getExperienceItemRows() {
    const experienceTitle = getTitleButton("experience")
    const experienceRow = experienceTitle.closest('[class*="rounded-md border"]')!
    // Item rows live inside the expanded body, each with its own
    // neutral-900-bg row class — distinct from the section-level header's
    // neutral-800-bg row, so this scoping excludes the section's own move
    // buttons from matching here.
    return Array.from(experienceRow.querySelectorAll('[class*="bg-neutral-900"]'))
  }

  it("with two items added, the first item's Move up is disabled and the second's Move down is disabled", async () => {
    const user = userEvent.setup()
    render(<SectionAccordion />)

    // No section opens by default anymore — open Experience explicitly.
    // The title's click handler uses a 250ms timer to disambiguate a
    // single click (toggle) from a double click (rename), so awaiting the
    // click event itself isn't enough — wait for the actual post-toggle
    // effect (the "Add item" button appearing) before proceeding.
    await user.click(getTitleButton("experience"))
    const addItemButton = await screen.findByRole("button", { name: /^add item$/i })

    // Experience's "Add item" opens a modal that only commits to the store
    // on Save, not Cancel (confirmed in SectionAccordion.tsx: handleAddItem
    // for generic sections writes immediately, but Experience uses
    // setModalItem("new") + ExperienceItemModal's onSave). So two items
    // need two real Save clicks, not Cancel.
    await user.click(addItemButton)
    await user.type(screen.getByLabelText(/company/i), "First Co")
    await user.click(screen.getByRole("button", { name: /^save$/i }))

    await user.click(addItemButton)
    await user.type(screen.getByLabelText(/company/i), "Second Co")
    await user.click(screen.getByRole("button", { name: /^save$/i }))

    const rows = getExperienceItemRows()
    expect(rows.length).toBe(2)

    const firstMoveUp = rows[0].querySelector(
      'button[aria-label="Move up"]',
    ) as HTMLButtonElement
    const firstMoveDown = rows[0].querySelector(
      'button[aria-label="Move down"]',
    ) as HTMLButtonElement
    const secondMoveUp = rows[1].querySelector(
      'button[aria-label="Move up"]',
    ) as HTMLButtonElement
    const secondMoveDown = rows[1].querySelector(
      'button[aria-label="Move down"]',
    ) as HTMLButtonElement

    expect(firstMoveUp).toBeDisabled()
    expect(firstMoveDown).not.toBeDisabled()
    expect(secondMoveUp).not.toBeDisabled()
    expect(secondMoveDown).toBeDisabled()
  })

  it("clicking an item's Move down button actually reorders the items", async () => {
    const user = userEvent.setup()
    render(<SectionAccordion />)

    // No section opens by default anymore — open Experience explicitly.
    // Same timing note as the test above: wait for the real post-toggle
    // effect, not just the click event resolving.
    await user.click(getTitleButton("experience"))

    const addItemButton = await screen.findByRole("button", { name: /^add item$/i })
    await user.click(addItemButton)
    await user.type(screen.getByLabelText(/company/i), "First Co")
    await user.click(screen.getByRole("button", { name: /^save$/i }))

    await user.click(addItemButton)
    await user.type(screen.getByLabelText(/company/i), "Second Co")
    await user.click(screen.getByRole("button", { name: /^save$/i }))

    let rows = getExperienceItemRows()
    expect(rows[0].textContent).toContain("First Co")
    expect(rows[1].textContent).toContain("Second Co")

    const firstMoveDown = rows[0].querySelector(
      'button[aria-label="Move down"]',
    ) as HTMLButtonElement
    await user.click(firstMoveDown)

    rows = getExperienceItemRows()
    expect(rows[0].textContent).toContain("Second Co")
    expect(rows[1].textContent).toContain("First Co")
  })
})
