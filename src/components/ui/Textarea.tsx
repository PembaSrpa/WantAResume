import { forwardRef } from "react"
import type { TextareaHTMLAttributes } from "react"
import { cn } from "./cn"
export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-[13px] text-neutral-100 placeholder:text-neutral-500 outline-none transition-[border-color,box-shadow] duration-150",
        "hover:border-neutral-600",
        "focus:border-orange-700 focus:shadow-[0_0_0_3px_rgba(194,65,12,0.18)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"
