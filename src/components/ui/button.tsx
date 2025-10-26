import * as React from "react"
import { cn } from "../../utils/cn"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "danger"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)] shadow-md hover:shadow-[0_0_20px_var(--accent-glow)]":
              variant === "default",
            "bg-[var(--card)] text-[var(--text-primary)] hover:bg-[var(--card-hover)] border border-[var(--border)]":
              variant === "secondary",
            "border border-[var(--border)] bg-transparent hover:bg-[var(--card)] hover:border-[var(--accent)]":
              variant === "outline",
            "hover:bg-[var(--card)] hover:text-[var(--text-primary)]":
              variant === "ghost",
            "bg-[var(--error)]/20 text-[var(--error)] hover:bg-[var(--error)]/30":
              variant === "danger",
          },
          {
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-11 rounded-lg px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }

