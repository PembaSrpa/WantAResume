"use client"
import { forwardRef } from "react"
import { motion, type HTMLMotionProps } from "motion/react"
import { cn } from "./cn"
export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "default" | "ghost"
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md border border-orange-700 px-3.5 py-2 text-[12.5px] text-neutral-100 transition-colors duration-150",
          "focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(194,65,12,0.18)]",
          variant === "default" && "bg-neutral-800 hover:bg-neutral-700",
          variant === "ghost" && "bg-transparent hover:bg-neutral-800",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    )
  }
)
Button.displayName = "Button"
