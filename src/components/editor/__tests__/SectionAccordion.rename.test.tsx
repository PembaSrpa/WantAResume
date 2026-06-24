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

    expect(screen.getByRole("button", { name: /^add item$/i })).toBeInTheDocument()

    const experienceTitle = getTitleButton("experience")
    const row = experienceTitle.closest("div")
    expect(row).not.toBeNull()

    await user.click(row!)

    // AnimatePresence's exit animation means the element isn't removed
    // synchronously on click — wait for it to actually disappear rather
    // than asserting immediately, which would be a false negative caused
    // by jsdom's lack of a real animation-frame loop, not a real bug.
    await waitForElementToBeRemoved(() =>
      screen.queryByRole("button", { name: /^add item$/i }),
    )
  })
})
