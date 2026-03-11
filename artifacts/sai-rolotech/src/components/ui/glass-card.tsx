import * as React from "react"
import { cn } from "@/lib/utils"

const GlassCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl glass-card text-card-foreground",
      className
    )}
    {...props}
  />
));
GlassCard.displayName = "GlassCard"

export { GlassCard }
