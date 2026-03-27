import { NavLink, Outlet, Link } from "react-router"
import { Home } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navClass = ({ isActive }) =>
  cn(
    "inline-flex items-center border-b-2 px-2 pb-3 pt-1 text-sm font-medium transition-colors",
    isActive
      ? "border-primary text-foreground"
      : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
  )

export function ClientLayout() {
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="relative mx-auto flex min-h-[4.75rem] max-w-6xl items-end px-4 pb-0 pt-3 sm:px-6">
          <div className="absolute left-4 top-1/2 z-10 flex -translate-y-1/2 items-center sm:left-6">
            <Button
              asChild
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground border border-border"
              aria-label="Back to home"
            >
              <Link to="/FlashSlots/client">
                <Home className="size-4" />
              </Link>
            </Button>
          </div>
          <nav className="flex w-full flex-wrap items-end justify-center gap-x-5 gap-y-2 px-12 sm:gap-x-8 sm:px-16">
            <NavLink to="about" className={navClass}>
              About
            </NavLink>
            <NavLink to="help" className={navClass}>
              Help
            </NavLink>
            <Link
              to="/FlashSlots/profile/client"
              state={{ returnTo: "/FlashSlots/client" }}
              className="inline-flex items-center border-b-2 border-transparent px-2 pb-3 pt-1 text-sm font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground"
            >
              Profile
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
