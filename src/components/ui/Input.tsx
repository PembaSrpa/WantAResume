import { forwardRef } from "react"
import type { InputHTMLAttributes } from "react"
import { cn } from "./cn"

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-md border border-orange-700 bg-neutral-800 px-3 py-1.5 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none transition-colors",
          "hover:bg-neutral-700 focus:bg-neutral-700",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"
