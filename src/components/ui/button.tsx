
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        high: "bg-energy-high text-white hover:bg-energy-high/90 hover:shadow-lg hover:shadow-energy-high/20",
        low: "bg-energy-low text-white hover:bg-energy-low/90 hover:shadow-lg hover:shadow-energy-low/20",
        journal: "bg-journal-primary text-white hover:bg-journal-primary/90 hover:shadow-lg hover:shadow-journal-primary/20",
        strava: "bg-strava-primary text-white hover:bg-strava-primary/90 hover:shadow-lg hover:shadow-strava-primary/20",
        meditation: "bg-meditation-primary text-white hover:bg-meditation-primary/90 hover:shadow-lg hover:shadow-meditation-primary/20",
        pomodoro: "bg-pomodoro-primary text-white hover:bg-pomodoro-primary/90 hover:shadow-lg hover:shadow-pomodoro-primary/20",
        gamification: "bg-gamification-primary text-white hover:bg-gamification-primary/90 hover:shadow-lg hover:shadow-gamification-primary/20",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
      glow: {
        true: "btn-glow",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      glow: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  glow?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, glow, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, glow, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
