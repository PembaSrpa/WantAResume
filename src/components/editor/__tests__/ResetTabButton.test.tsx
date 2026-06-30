import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { act } from "react"
import userEvent from "@testing-library/user-event"
import { ResetTabButton } from "@/components/editor/ResetTabButton"

describe("ResetTabButton two-step confirmation", () => {
  it("a single click arms the confirm state but does not call onConfirm", async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<ResetTabButton label="Basics" onConfirm={onConfirm} />)

    const button = screen.getByRole("button", { name: /reset basics/i })
    await user.click(button)

    expect(onConfirm).not.toHaveBeenCalled()
    expect(screen.getByRole("button", { name: /confirm reset basics/i })).toBeInTheDocument()
  })

  it("a second click within the confirm window actually calls onConfirm", async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<ResetTabButton label="Basics" onConfirm={onConfirm} />)

    const button = screen.getByRole("button", { name: /reset basics/i })
    await user.click(button)
    await user.click(screen.getByRole("button", { name: /confirm reset basics/i }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it("the confirm state reverts after the timeout window lapses, without calling onConfirm", async () => {
    vi.useFakeTimers()
    const onConfirm = vi.fn()
    render(<ResetTabButton label="Design" onConfirm={onConfirm} />)

    // fireEvent.click instead of userEvent here: userEvent's internal real
    // microtask delays fight vi.useFakeTimers() (the same class of issue
    // seen with the earlier mobile-redirect test in this project) — a
    // direct synchronous click avoids that interaction entirely.
    fireEvent.click(screen.getByRole("button", { name: /reset design/i }))
    expect(screen.getByRole("button", { name: /confirm reset design/i })).toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(4500)
    })

    expect(screen.getByRole("button", { name: /^reset design$/i })).toBeInTheDocument()
    expect(onConfirm).not.toHaveBeenCalled()

    vi.useRealTimers()
  })
})
