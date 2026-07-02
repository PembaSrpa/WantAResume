"use client"
import { useEffect, useRef, useState } from "react"
import { IconTrash } from "@tabler/icons-react"
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
