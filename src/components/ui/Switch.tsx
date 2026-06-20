"use client"

import { motion } from "motion/react"
import { cn } from "./cn"

export interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
  "aria-label"?: string
}

export function Switch({
  checked,
  onCheckedChange,
  disabled,
  className,
  ...rest
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative h-4 w-7 rounded-full border border-orange-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-orange-700" : "bg-neutral-700",
        className
      )}
      {...rest}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-0.5 h-3 w-3 rounded-full bg-neutral-100"
        style={{ left: checked ? "calc(100% - 14px)" : "2px" }}
      />
    </button>
  )
}
