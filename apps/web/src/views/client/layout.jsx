import { NavLink, Outlet, Link } from "react-router-dom"
import { cn } from "@/lib/utils"

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
      <header className="sticky top-16 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex min-h-[3.25rem] max-w-6xl items-end px-4 pb-0 sm:px-6">
          <nav className="flex w-full flex-wrap items-end justify-center gap-x-5 gap-y-2 sm:gap-x-8">
            <NavLink to="/client" className={navClass} end>
              Home
            </NavLink>
            <NavLink to="about" className={navClass}>
              About
            </NavLink>
            <NavLink to="help" className={navClass}>
              Help
            </NavLink>
            <Link
              to="/profile"
              state={{ returnTo: "/client" }}
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