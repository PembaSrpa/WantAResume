import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SectionAccordion } from "@/components/editor/SectionAccordion"

function getTitleButton(name: string) {
  return screen
    .getAllByTitle(new RegExp(`^${name} —`, "i"))
    .find((el) => el.textContent === name)!
}

describe("Two-column section grid", () => {
  it("an open section spans the full grid width (lg:col-span-2), a closed one does not", () => {
    render(<SectionAccordion />)

    // "experience" is open by default per SectionAccordion's initial state.
    const experienceTitle = getTitleButton("experience")
    const experienceRow = experienceTitle.closest('[class*="rounded-md border"]')
    expect(experienceRow).not.toBeNull()
    expect(experienceRow!.className).toContain("lg:col-span-2")

    const profilesTitle = getTitleButton("profiles")
    const profilesRow = profilesTitle.closest('[class*="rounded-md border"]')
    expect(profilesRow).not.toBeNull()
    expect(profilesRow!.className).not.toContain("lg:col-span-2")
  })

  it("the compact column toggle switches a section's column count and reflects pressed state", async () => {
    const user = userEvent.setup()
    render(<SectionAccordion />)

    const profilesGroup = screen.getByRole("group", { name: /profiles column layout/i })
    const oneButton = profilesGroup.querySelector('button[title="1 column"]') as HTMLButtonElement
    const twoButton = profilesGroup.querySelector('button[title="2 columns"]') as HTMLButtonElement

    expect(oneButton).toBeTruthy()
    expect(twoButton).toBeTruthy()

    // Default data seeds columns: 1, so "1" should start pressed.
    expect(oneButton.getAttribute("aria-pressed")).toBe("true")
    expect(twoButton.getAttribute("aria-pressed")).toBe("false")

    await user.click(twoButton)

    expect(twoButton.getAttribute("aria-pressed")).toBe("true")
    expect(oneButton.getAttribute("aria-pressed")).toBe("false")
  })

  it("clicking the column toggle does not also toggle expand/collapse", async () => {
    const user = userEvent.setup()
    render(<SectionAccordion />)

    // "education" starts collapsed. If the toggle's click bubbled to the
    // row and triggered onToggle, education would now be expanded.
    const educationGroup = screen.getByRole("group", { name: /education column layout/i })
    const twoButton = educationGroup.querySelector('button[title="2 columns"]') as HTMLButtonElement

    await user.click(twoButton)

    // education has no items by default, so its expanded body would just
    // show the "Add item" button. Query scoped to education's own row.
    const educationTitle = getTitleButton("education")
    const educationRow = educationTitle.closest('[class*="rounded-md border"]')!
    const addItemButtons = Array.from(educationRow.querySelectorAll("button")).filter(
      (b) => b.textContent?.trim() === "Add item",
    )
    expect(addItemButtons.length).toBe(0)
  })
})
