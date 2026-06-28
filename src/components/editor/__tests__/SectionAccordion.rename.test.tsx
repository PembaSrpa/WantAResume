import { describe, it, expect } from "vitest"
import { render, screen, waitForElementToBeRemoved } from "@testing-library/react"
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

    // No section opens by default anymore (see
    // SectionAccordion.defaultcollapsed.test.tsx) — confirm clicking the
    // row opens it first, then confirm clicking again closes it, covering
    // both directions instead of assuming an initial open state.
    expect(screen.queryByRole("button", { name: /^add item$/i })).not.toBeInTheDocument()

    const experienceTitle = getTitleButton("experience")
    const row = experienceTitle.closest("div")
    expect(row).not.toBeNull()

    await user.click(row!)
    expect(await screen.findByRole("button", { name: /^add item$/i })).toBeInTheDocument()

    await user.click(row!)

    // AnimatePresence's exit animation may or may not have resolved
    // synchronously by this point depending on the test environment, so
    // check directly rather than assume waitForElementToBeRemoved's
    // precondition (the element still existing right now) holds.
    const stillPresent = screen.queryByRole("button", { name: /^add item$/i })
    if (stillPresent) {
      await waitForElementToBeRemoved(stillPresent)
    } else {
      expect(stillPresent).not.toBeInTheDocument()
    }
  })
})
