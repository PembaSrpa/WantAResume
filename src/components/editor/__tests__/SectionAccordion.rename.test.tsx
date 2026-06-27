import { describe, it, expect } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SectionAccordion } from "@/components/editor/SectionAccordion"

// Real-world double-click event sequence in a browser is:
// mousedown, mouseup, click, mousedown, mouseup, click, dblclick
// userEvent.dblClick reproduces this exactly, unlike a hand-rolled
// fireEvent.doubleClick which only fires a single dblclick event and would
// NOT have caught the original bug (which lived in the click handler, not
// a dblclick handler that was never wired up in the first place).

function getTitleButton(name: string) {
  // Section title buttons now carry a title attribute combining the real
  // section name (for truncation hover on the 2-column grid) and the
  // interaction hint, e.g. "education — click to expand, double-click to
  // rename". Match on the name prefix to disambiguate from other buttons.
  return screen
    .getAllByTitle(new RegExp(`^${name} —`, "i"))
    .find((el) => el.textContent === name)!
}

describe("SectionHeader rename/expand click disambiguation", () => {
  it("a single click on the title toggles expand/collapse, not rename", async () => {
    const user = userEvent.setup()
    render(<SectionAccordion />)

    const profilesTitle = getTitleButton("profiles")
    expect(profilesTitle).toBeTruthy()
    await user.click(profilesTitle)

    expect(screen.queryByDisplayValue("profiles")).not.toBeInTheDocument()
  })

  it("a double click on the title enters rename mode", async () => {
    const user = userEvent.setup()
    render(<SectionAccordion />)

    const educationTitle = getTitleButton("education")
    await user.dblClick(educationTitle)

    const input = await screen.findByDisplayValue("education")
    expect(input).toBeInTheDocument()
    expect(document.activeElement).toBe(input)
  })

  it("clicking elsewhere on the row still toggles expand/collapse normally", async () => {
    const user = userEvent.setup()
    render(<SectionAccordion />)

    const experienceTitle = getTitleButton("experience")
    const row = experienceTitle.closest("div")
    expect(row).not.toBeNull()

    // No section is open by default — open Experience first, then confirm
    // clicking elsewhere on the row (not the title) still collapses it.
    await user.click(experienceTitle)
    expect(await screen.findByRole("button", { name: /^add item$/i })).toBeInTheDocument()

    await user.click(row!)

    // AnimatePresence's exit animation means removal isn't always
    // synchronous — wait for the element to be gone rather than asserting
    // immediately, which would be a false negative caused by jsdom's lack
    // of a real animation-frame loop, not a real bug. waitFor (rather than
    // waitForElementToBeRemoved) tolerates the element already being gone
    // by the time this runs, which can happen once the open state itself
    // is awaited via findByRole above.
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /^add item$/i })).not.toBeInTheDocument()
    })
  })
})
