"use client"
import { Link, useLocation } from "react-router"
import { cn } from "@/lib/utils"
import { useScroll } from "@/hooks/use-scroll"
import { Button } from "@/components/ui/button"
import { Zap, User } from "lucide-react"
import { isLoggedIn, getRole } from "@/lib/auth"

export function Header() {
  const scrolled = useScroll(10)
  const { pathname } = useLocation()
  const isHome = pathname === "/FlashSlots/" || pathname === "/FlashSlots"
  const showBg = !isHome || scrolled

  const loggedIn = isLoggedIn()
  const role = getRole()

  const homePath = loggedIn
    ? role === "BUSINESS" ? "/FlashSlots/vendor" : "/FlashSlots/client"
    : "/FlashSlots/"

  const profilePath = role === "BUSINESS"
    ? "/FlashSlots/profile/vendor"
    : "/FlashSlots/profile/client"

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
        <Link
          to={homePath}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
            <Zap className="size-4" />
          </div>
          <span className="text-lg font-bold tracking-tight">FlashSlots</span>
        </Link>

        <div className="flex items-center gap-2.5">
          {loggedIn ? (
            <Link
              to={profilePath}
              className="flex size-9 items-center justify-center rounded-full bg-primary/10 border border-border transition-colors hover:bg-primary/20"
            >
              <User className="size-4 text-primary" />
            </Link>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/FlashSlots/login">Sign In</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/FlashSlots/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}