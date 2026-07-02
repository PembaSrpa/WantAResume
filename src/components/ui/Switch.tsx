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
export function Switch({ checked, onCheckedChange, disabled, className, ...rest }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative h-[17px] w-[30px] rounded-full border transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(194,65,12,0.18)]",
        checked
          ? "border-orange-700 bg-orange-700"
          : "border-neutral-600 bg-neutral-700 hover:border-neutral-500",
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
