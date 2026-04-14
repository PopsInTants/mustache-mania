import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border-2 border-vinyl-black cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-vinyl-black text-neon-lime shadow-[4px_4px_0px_0px] shadow-vinyl-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px] hover:shadow-vinyl-black",
        destructive:
          "bg-hot-pink text-sticker-white shadow-[4px_4px_0px_0px] shadow-vinyl-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px] hover:shadow-vinyl-black",
        outline:
          "bg-transparent text-vinyl-black shadow-[4px_4px_0px_0px] shadow-vinyl-black hover:bg-vinyl-black hover:text-neon-lime",
        secondary:
          "bg-neon-lime text-vinyl-black shadow-[4px_4px_0px_0px] shadow-vinyl-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px] hover:shadow-vinyl-black",
        ghost: "border-transparent hover:bg-vinyl-black/10",
        link: "text-vinyl-black underline-offset-4 hover:underline border-transparent",
        strike:
          "bg-neon-lime text-vinyl-black shadow-[6px_6px_0px_0px] shadow-vinyl-black hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_0px] hover:shadow-vinyl-black text-xl font-extrabold",
        dominate:
          "bg-electric-blue text-vinyl-black shadow-[6px_6px_0px_0px] shadow-vinyl-black hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_0px] hover:shadow-vinyl-black text-xl font-extrabold",
        upload:
          "bg-hot-pink text-sticker-white shadow-[8px_8px_0px_0px] shadow-vinyl-black hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[4px_4px_0px_0px] hover:shadow-vinyl-black",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 px-4 text-xs",
        lg: "h-12 px-8",
        xl: "h-14 px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
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
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
