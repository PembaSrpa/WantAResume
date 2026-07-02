"use client"

import { useEffect, useRef, useState } from "react"
import { IconTrash } from "@tabler/icons-react"

// Same two-step confirm interaction as ResetTabButton (see that file for
// the full rationale: no native browser confirm(), reliably testable in
// jsdom). Kept as its own small component rather than generalizing
// ResetTabButton with a verb/icon prop, since ResetTabButton is already
// used in three places (Basics/Sections/Design tab resets) and this one
// has different wording, icon, and destructive-delete (not reset)
// semantics -- lower risk to add a sibling than to reshape a shared one.
const CONFIRM_WINDOW_MS = 4000

export function DeleteSectionButton({ onConfirm }: { onConfirm: () => void }) {
  const [confirming, setConfirming] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation()
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
    <button
      type="button"
      onClick={handleClick}
      title={confirming ? "Confirm delete section?" : "Delete section"}
      className={
        confirming
          ? "flex-shrink-0 text-orange-500 transition-colors hover:text-orange-400"
          : "flex-shrink-0 text-neutral-500 transition-colors hover:text-neutral-200"
      }
    >
      <IconTrash size={15} />
    </button>
  )
}
