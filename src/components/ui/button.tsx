import * as React from "react"
import { cn } from "@/src/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-2xl text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
          {
            "bg-blue-500 text-white hover:bg-blue-600 shadow-[0_4px_0_0_rgba(37,99,235,1)] hover:shadow-[0_2px_0_0_rgba(37,99,235,1)] hover:translate-y-[2px]": variant === "default",
            "bg-red-500 text-white hover:bg-red-600 shadow-[0_4px_0_0_rgba(220,38,38,1)] hover:shadow-[0_2px_0_0_rgba(220,38,38,1)] hover:translate-y-[2px]": variant === "destructive",
            "border-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900": variant === "outline",
            "bg-indigo-100 text-indigo-900 hover:bg-indigo-200": variant === "secondary",
            "hover:bg-slate-100 hover:text-slate-900": variant === "ghost",
            "text-blue-500 underline-offset-4 hover:underline": variant === "link",
            "h-12 px-6 py-2": size === "default",
            "h-10 px-4 rounded-xl": size === "sm",
            "h-14 px-8 text-base": size === "lg",
            "h-12 w-12": size === "icon",
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
