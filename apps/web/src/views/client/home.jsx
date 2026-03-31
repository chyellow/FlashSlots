import { useEffect, useMemo, useState } from "react"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"

const initialOpenAppointments = [
  { id: "avail-1", title: "Haircut with Mia", time: "Today, 9:00 AM", location: "Downtown Salon" },
  { id: "avail-2", title: "Massage with Leo", time: "Today, 11:30 AM", location: "Center Spa" },
  { id: "avail-3", title: "Tattoo consultation", time: "Today, 2:00 PM", location: "Ink House" },
  { id: "avail-4", title: "Yoga session", time: "Today, 4:15 PM", location: "Studio Flex" },
]

function formatTimer(seconds) {
  const min = String(Math.floor(seconds / 60)).padStart(2, "0")
  const sec = String(seconds % 60).padStart(2, "0")
  return `${min}:${sec}`
}

export function ClientHomePage() {
  const [available, setAvailable] = useState(initialOpenAppointments)
  const [confirmed, setConfirmed] = useState([])
  const [pending, setPending] = useState(null)
  const [countdown, setCountdown] = useState(0)
  const [cancelTarget, setCancelTarget] = useState(null)

  const canSelect = pending === null && cancelTarget === null

  useEffect(() => {
    if (!pending) {
      return
    }

    const interval = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setPending(null)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [pending])

  const pendingMessage = useMemo(() => {
    if (!pending) return null
    return `Confirm ${pending.title} by ${formatTimer(countdown)} or it will expire` 
  }, [pending, countdown])

  const selectAppointment = (appointment) => {
    if (!canSelect) return
    setPending(appointment)
    setCountdown(300)
  }

  const confirmPending = () => {
    if (!pending) return
    setConfirmed((old) => [...old, pending])
    setAvailable((old) => old.filter((a) => a.id !== pending.id))
    setPending(null)
    setCountdown(0)
  }

  const cancelPending = () => {
    setPending(null)
    setCountdown(0)
  }

  const requestCancel = (appointment) => {
    setCancelTarget(appointment)
  }

  const confirmCancel = () => {
    if (!cancelTarget) return
    setConfirmed((old) => old.filter((a) => a.id !== cancelTarget.id))
    setAvailable((old) => [...old, cancelTarget])
    setCancelTarget(null)
  }

  const dismissCancel = () => {
    setCancelTarget(null)
  }

  return (
    <div className="relative flex h-[calc(100vh-4.75rem)] w-full flex-1 flex-col rounded-lg border bg-card p-4 shadow-sm">
      <header className="mb-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome, [username]</h1>
          <p className="text-sm text-muted-foreground">Manage your current appointments and view available slots.</p>
        </div>
      </header>

      <div className="h-full w-full overflow-hidden rounded-md border">
        <ResizablePanelGroup>
          <ResizablePanel className="flex h-full flex-col gap-4 overflow-auto p-4">
            <h2 className="text-lg font-semibold">Available Appointments</h2>
            {available.length === 0 ? (
              <p className="text-sm text-muted-foreground">No more open appointments are currently available.</p>
            ) : (
              <ul className="space-y-2">
                {available.map((item) => (
                  <li key={item.id} className="rounded-lg border p-3">
                    <div className="flex justify-between gap-3">
                      <div className="text-left">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.time} · {item.location}</p>
                      </div>
                      <button
                        className="rounded bg-primary px-3 py-1 text-xs text-white disabled:opacity-40"
                        onClick={() => selectAppointment(item)}
                        disabled={!canSelect}
                      >
                        Select
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel className="flex h-full flex-col gap-4 overflow-auto p-4">
            <h2 className="text-lg font-semibold">Your Confirmed Appointments</h2>
            {confirmed.length === 0 ? (
              <p className="text-sm text-muted-foreground">No appointments confirmed yet. Confirm one from the left panel.</p>
            ) : (
              <ul className="space-y-2">
                {confirmed.map((item) => (
                  <li key={item.id} className="rounded-lg border p-3 bg-background">
                    <div className="flex justify-between gap-3">
                      <div className="text-left">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.time} · {item.location}</p>
                      </div>
                      <button
                        className="rounded border border-red-400 px-2 py-1 text-xs text-red-600 hover:bg-red-100"
                        onClick={() => requestCancel(item)}
                      >
                        Cancel
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={cancelPending} />
          <div className="relative z-10 w-[min(90vw,420px)] rounded-xl border border-border bg-background p-6 shadow-xl">
            <h3 className="text-lg font-semibold">Confirm Appointment</h3>
            <p className="mt-2 text-sm text-muted-foreground">{pendingMessage}</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded px-3 py-1 border border-border text-sm text-muted-foreground hover:bg-muted/20"
                onClick={cancelPending}
              >
                Cancel
              </button>
              <button
                className="rounded px-3 py-1 bg-primary text-white hover:bg-primary/90"
                onClick={confirmPending}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={dismissCancel} />
          <div className="relative z-10 w-[min(90vw,420px)] rounded-xl border border-border bg-background p-6 shadow-xl">
            <h3 className="text-lg font-semibold">Are you sure?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Frequent cancellations may negatively impact your client rating.
            </p>
            <p className="mt-2 text-sm font-medium">{cancelTarget.title} - {cancelTarget.time}</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded px-3 py-1 border border-border text-sm text-muted-foreground hover:bg-muted/20"
                onClick={dismissCancel}
              >
                Keep
              </button>
              <button
                className="rounded px-3 py-1 bg-red-600 text-white hover:bg-red-700"
                onClick={confirmCancel}
              >
                Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
