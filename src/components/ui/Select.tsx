import { forwardRef } from "react"
import type { SelectHTMLAttributes } from "react"
import { IconChevronDown } from "@tabler/icons-react"
import { cn } from "./cn"

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "w-full appearance-none rounded-md border border-orange-700 bg-neutral-800 px-3 py-1.5 pr-8 text-sm text-neutral-100 outline-none transition-colors",
            "hover:bg-neutral-700 focus:bg-neutral-700",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <IconChevronDown
          size={14}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-300"
        />
      </div>
    )
  }
)

Select.displayName = "Select"
