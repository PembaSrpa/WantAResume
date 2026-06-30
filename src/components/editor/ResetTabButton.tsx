"use client"

import { useEffect, useRef, useState } from "react"
import { IconRotateClockwise2 } from "@tabler/icons-react"
import { Button } from "@/components/ui/Button"

// Two-step confirm pattern instead of a browser confirm() dialog, to stay
// consistent with this app's custom-styled UI (no native browser chrome
// anywhere else) and to be reliably testable in jsdom (window.confirm
// requires mocking and doesn't reflect real interaction the way a second
// click does). First click arms a "Confirm reset?" state for a few
// seconds; clicking again within that window actually resets. Clicking
// anywhere else, or letting the window lapse, cancels back to the normal
// state.
const CONFIRM_WINDOW_MS = 4000

export function ResetTabButton({
  label,
  onConfirm,
}: {
  label: string
  onConfirm: () => void
}) {
  const [confirming, setConfirming] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  function handleClick() {
    if (confirming) {
      if (timerRef.current) clearTimeout(timerRef.current)
      setConfirming(false)
      onConfirm()
      return
    }
    setConfirming(true)
    timerRef.current = setTimeout(() => setConfirming(false), CONFIRM_WINDOW_MS)
  }

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={handleClick}
      className={
        confirming
          ? "border-orange-700 text-[11px] text-neutral-200"
          : "border-neutral-700 text-[11px] text-neutral-500 hover:text-neutral-300"
      }
    >
      <IconRotateClockwise2 size={13} />
      {confirming ? `Confirm reset ${label}?` : `Reset ${label}`}
    </Button>
  )
}
