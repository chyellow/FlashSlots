import { useState, useEffect } from "react"
import { Sun, Moon } from "lucide-react"
import { getTheme, applyTheme } from "@/lib/theme"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }) {
  const [theme, setTheme] = useState(getTheme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"))

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className={cn(
        "fixed bottom-6 right-6 z-50 flex size-11 items-center justify-center rounded-full",
        "bg-foreground text-background shadow-lg",
        "transition-all duration-300 hover:scale-110 active:scale-95",
        "hover:shadow-xl cursor-pointer",
        className
      )}
    >
      {theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
    </button>
  )
}