import { useEffect, useState } from "react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Zap, ArrowRight } from "lucide-react"

/* animation reveal */
function Reveal({ children, className = "", delay = 0 }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 60)
    return () => clearTimeout(t)
  }, [])
  return (
    <div
      className={`${className} ${show ? "animate-fade-up" : "opacity-0"}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

/* calendar preview */
function CalendarMock() {
  const days = ["M", "T", "W", "T", "F", "S", "S"]
  return (
    <div className="w-56 rounded-xl border border-border/50 bg-card p-5 shadow-md sm:w-60">
      <p className="mb-4 text-[13px] font-semibold">March 2026</p>
      <div className="grid grid-cols-7 gap-y-1.5">
        {days.map((d, i) => (
          <span
            key={i}
            className="py-1 text-center text-[10px] font-medium text-muted-foreground"
          >
            {d}
          </span>
        ))}
        {}
        {Array.from({ length: 6 }, (_, i) => (
          <span key={`p-${i}`} />
        ))}
        {Array.from({ length: 31 }, (_, i) => {
          const day = i + 1
          const isToday = day === 30
          return (
            <span
              key={day}
              className={`py-1 text-center text-[11px] rounded-md transition-colors ${
                isToday
                  ? "bg-foreground text-background font-semibold"
                  : "text-muted-foreground/80"
              }`}
            >
              {day}
            </span>
          )
        })}
      </div>
    </div>
  )
}

/* time slots preview */
function SlotsMock() {
  const slots = [
    { time: "9:00 AM", selected: false },
    { time: "10:30 AM", selected: true },
    { time: "1:00 PM", selected: false },
    { time: "3:30 PM", selected: false },
  ]
  return (
    <div className="w-48 rounded-xl border border-border/50 bg-card p-5 shadow-md sm:w-52">
      <p className="text-[13px] font-semibold">Mon, Mar 30</p>
      <p className="mb-4 text-[11px] text-muted-foreground">Available slots</p>
      <div className="space-y-2">
        {slots.map(({ time, selected }) => (
          <div
            key={time}
            className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-[13px] transition-colors ${
              selected
                ? "border-foreground/25 bg-accent font-medium"
                : "border-border/60"
            }`}
          >
            <span>{time}</span>
            {selected && (
              <span className="text-[10px] font-medium text-muted-foreground">
                Selected
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function HomeView() {
  return (
    <div className="flex min-h-screen flex-col">

      
      <section className="relative flex flex-col items-center px-6 pt-20 pb-20 sm:pt-28 sm:pb-28">
        
        <div className="pointer-events-none absolute inset-0 bg-hero-glow" />

        {/* heading */}
        <Reveal delay={180}>
          <h1 className="max-w-[680px] text-center text-[clamp(2rem,6vw,3.75rem)] font-extrabold leading-[1.1] tracking-tight">
            Last-minute openings, filled instantly
          </h1>
        </Reveal>

        {/* subheading*/}
        <Reveal delay={300}>
          <p className="mt-5 max-w-[420px] text-center text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            The real-time marketplace that helps service providers recover
            revenue from cancellations.
          </p>
        </Reveal>

        <Reveal delay={420} className="mt-9">
          <Button asChild size="lg" className="h-11 gap-2 px-7 text-[14px] font-semibold">
            <Link to="/FlashSlots/register">
              Get Started For Free
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </Reveal>
      </section>

      {/* preview */}
      <Reveal delay={550} className="mx-auto w-full max-w-[720px] px-6 pb-28">
        <div className="overflow-hidden rounded-2xl border border-border/40 bg-card/80 p-1.5 shadow-xl backdrop-blur-sm">
          <div className="relative flex items-center justify-center gap-5 rounded-xl bg-secondary/30 py-14 sm:gap-6 sm:py-16">
            <div className="absolute inset-0 bg-dot-grid opacity-30" />
            <div className="relative z-10 flex flex-wrap items-start justify-center gap-5">
              <CalendarMock />
              <SlotsMock />
            </div>
          </div>
        </div>
      </Reveal>

      {/* footer */}
      <footer className="mt-auto border-t border-border/60 py-6">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-md bg-foreground text-background">
              <Zap className="size-3" />
            </div>
            <span className="text-[13px] font-semibold">FlashSlots</span>
          </div>
          <span className="text-[12px] text-muted-foreground">
            © 2026 FlashSlots
          </span>
        </div>
      </footer>
    </div>
  )
}