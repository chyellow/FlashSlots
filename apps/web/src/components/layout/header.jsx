"use client"
import { Link, useLocation } from "react-router"
import { cn } from "@/lib/utils"
import { useScroll } from "@/hooks/use-scroll"
import { Button } from "@/components/ui/button"
import { Zap } from "lucide-react"

export function Header() {
  const scrolled = useScroll(10)
  const { pathname } = useLocation()
  const isHome = pathname === "/FlashSlots/" || pathname === "/FlashSlots"
  const showBg = !isHome || scrolled

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 border-b transition-all duration-300",
        showBg
          ? "border-border bg-background/85 backdrop-blur-xl supports-backdrop-filter:bg-background/60"
          : "border-transparent bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
        {/* logo */}
        <Link
          to="/FlashSlots/"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
            <Zap className="size-4" />
          </div>
          <span className="text-lg font-bold tracking-tight">FlashSlots</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <Button asChild variant="ghost" size="sm">
            <Link to="/FlashSlots/signin">Sign In</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/FlashSlots/signup">Get Started</Link>
          </Button>
        </div>
      </nav>
    </header>
  )
}