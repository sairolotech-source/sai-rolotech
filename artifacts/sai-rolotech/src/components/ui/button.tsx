import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transition-all active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "glossy-btn neon-btn bg-gradient-to-r from-[#0077FF] to-[#00D4FF] text-white border border-[rgba(0,212,255,0.25)]",
        destructive:
          "glossy-btn bg-gradient-to-r from-red-500 to-rose-500 text-white border border-red-400/20 shadow-[0_2px_12px_rgba(239,68,68,0.3)]",
        outline:
          "border border-white/20 glass-card shadow-sm hover:bg-accent/50",
        secondary: "border glass-card text-secondary-foreground shadow-sm",
        ghost: "border border-transparent hover:bg-accent/50 rounded-xl",
      },
      size: {
        default: "min-h-9 px-4 py-2",
        sm: "min-h-8 rounded-xl px-3 text-xs",
        lg: "min-h-10 rounded-xl px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
