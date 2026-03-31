import { cn } from "@/lib/utils"
import { useState } from "react"
import { Link } from "react-router"
import { Portal, PortalBackdrop } from "@/components/ui/portal"
import { Button } from "@/components/ui/button"
import { XIcon, MenuIcon } from "lucide-react"

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <Button
        aria-controls="mobile-menu"
        aria-expanded={open}
        aria-label="Toggle menu"
        className="md:hidden"
        onClick={() => setOpen(!open)}
        size="icon"
        variant="outline"
      >
        {open ? (
          <XIcon className="size-4.5" />
        ) : (
          <MenuIcon className="size-4.5" />
        )}
      </Button>

      {open && (
        <Portal className="top-16" id="mobile-menu">
          <PortalBackdrop />
          <div
            className={cn(
              "data-[slot=open]:zoom-in-97 ease-out data-[slot=open]:animate-in",
              "size-full p-5"
            )}
            data-slot={open ? "open" : "closed"}
          >
            <div className="mt-4 flex flex-col gap-2.5">
              <Button asChild className="w-full" variant="outline">
                <Link to="/FlashSlots/signin" onClick={() => setOpen(false)}>
                  Sign In
                </Link>
              </Button>
              <Button asChild className="w-full">
                <Link to="/FlashSlots/signup" onClick={() => setOpen(false)}>
                  Get Started
                </Link>
              </Button>
            </div>
          </div>
        </Portal>
      )}
    </div>
  )
}