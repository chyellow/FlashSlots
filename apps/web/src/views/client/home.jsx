import { useEffect, useMemo, useState } from "react"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { getMyProfile } from "@/lib/queries/profile"
import { getOpenings, getOpening } from "@/lib/queries/openings"
import { getMyReservations, holdReservation, confirmReservation, cancelReservation } from "@/lib/queries/reservations"
import { getMyReviews } from "@/lib/queries/reviews"
import { ProfileModal } from "@/components/ProfileModal"
import { ReviewModal } from "@/components/ReviewModal"
import { Star } from "lucide-react"

function formatTimer(seconds) {
  const min = String(Math.floor(seconds / 60)).padStart(2, "0")
  const sec = String(seconds % 60).padStart(2, "0")
  return `${min}:${sec}`
}

function formatTime(dateString) {
  const d = new Date(dateString)
  return d.toLocaleString("en-US", {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

export function ClientHomePage() {
  const [available, setAvailable] = useState([])
  const [confirmed, setConfirmed] = useState([])
  const [completed, setCompleted] = useState([])
  const [pending, setPending] = useState(null)
  const [countdown, setCountdown] = useState(0)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [viewProfileTarget, setViewProfileTarget] = useState(null)
  const [reviewTarget, setReviewTarget] = useState(null)
  const [reviewedReservationIds, setReviewedReservationIds] = useState(new Set())

  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(true)

  const canSelect = pending === null && cancelTarget === null

  const loadData = async () => {
    setDataLoading(true)
    try {
      const [ops, reses] = await Promise.all([
        getOpenings(),
        getMyReservations(),
      ])

      try {
        const myReviews = await getMyReviews()
        setReviewedReservationIds(new Set(myReviews.map(r => r.reservation_id)))
      } catch {
        setReviewedReservationIds(new Set())
      }

      setAvailable(ops)

      const confirmedRes = reses.filter(r => r.status === 'CONFIRMED')
      const confirmedWithOpenings = await Promise.all(
        confirmedRes.map(async (r) => {
          const op = await getOpening(r.opening_id)
          return { reservation: r, opening: op }
        })
      )
      setConfirmed(confirmedWithOpenings)

      const completedRes = reses.filter(r => r.status === 'COMPLETED')
      const completedWithOpenings = await Promise.all(
        completedRes.map(async (r) => {
          const op = await getOpening(r.opening_id)
          return { reservation: r, opening: op }
        })
      )
      setCompleted(completedWithOpenings)

      const holdRes = reses.find(r => r.status === 'HOLD')
      if (holdRes && holdRes.hold_expires_at) {
        const expiresAt = new Date(holdRes.hold_expires_at).getTime()
        const now = Date.now()
        if (expiresAt > now) {
          const op = await getOpening(holdRes.opening_id)
          setPending({ reservation: holdRes, opening: op })
          setCountdown(Math.floor((expiresAt - now) / 1000))
          setAvailable(prev => prev.filter(a => a.opening_id !== holdRes.opening_id))
        }
      }
    } catch (err) {
      console.error("Failed to load data:", err)
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => {
    loadData()

    getMyProfile()
      .then((data) => setProfile(data))
      .catch((err) => console.error("Failed to load profile:", err))
      .finally(() => setProfileLoading(false))
  }, [])

  useEffect(() => {
    if (!pending) return

    const interval = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setPending(null)
          loadData()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [pending])

  const pendingMessage = useMemo(() => {
    if (!pending) return null
    return `Confirm ${pending.opening.title || 'Appointment'} by ${formatTimer(countdown)} or it will expire`
  }, [pending, countdown])

  const selectAppointment = async (opening) => {
    if (!canSelect) return
    try {
      const reservation = await holdReservation(opening.opening_id)
      const expiresAt = new Date(reservation.hold_expires_at).getTime()

      setPending({ reservation, opening })
      setCountdown(Math.floor((expiresAt - Date.now()) / 1000))
      setAvailable((old) => old.filter((a) => a.opening_id !== opening.opening_id))
    } catch (err) {
      alert(err.message || "Failed to place a hold on this appointment.")
    }
  }

  const confirmPending = async () => {
    if (!pending) return
    try {
      const confirmedRes = await confirmReservation(pending.reservation.reservation_id)
      setConfirmed((old) => [...old, { reservation: confirmedRes, opening: pending.opening }])
      setPending(null)
      setCountdown(0)
    } catch (err) {
      alert(err.message || "Failed to confirm reservation.")
    }
  }

  const cancelPending = async () => {
    if (!pending) return
    try {
      await cancelReservation(pending.reservation.reservation_id)
      setAvailable((old) => [...old, pending.opening].sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at)))
      setPending(null)
      setCountdown(0)
    } catch (err) {
      console.error(err)
    }
  }

  const requestCancel = (item) => {
    setCancelTarget(item)
  }

  const confirmCancel = async () => {
    if (!cancelTarget) return
    try {
      await cancelReservation(cancelTarget.reservation.reservation_id, "Client cancellation")
      setConfirmed((old) => old.filter((a) => a.reservation.reservation_id !== cancelTarget.reservation.reservation_id))
      setCancelTarget(null)
      loadData()
    } catch (err) {
      alert(err.message || "Failed to cancel reservation.")
    }
  }

  const dismissCancel = () => {
    setCancelTarget(null)
  }

  return (
    <div className="relative flex h-[calc(100vh-4.75rem)] w-full flex-1 flex-col rounded-lg border bg-card p-4 shadow-sm">
      <header className="mb-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome, {profileLoading ? "..." : (profile?.display_name?.split(' ')[0] || "User")}
          </h1>
          <p className="text-sm text-muted-foreground">Manage your current appointments and view available slots.</p>
        </div>
      </header>

      <div className="h-full w-full overflow-hidden rounded-md border">
        <ResizablePanelGroup>
          <ResizablePanel className="flex h-full flex-col gap-4 overflow-auto p-4">
            <h2 className="text-lg font-semibold">Available Appointments</h2>
            {dataLoading ? (
              <p className="text-sm text-muted-foreground animate-pulse">Loading openings...</p>
            ) : available.length === 0 ? (
              <p className="text-sm text-muted-foreground">No more open appointments are currently available.</p>
            ) : (
              <ul className="space-y-2">
                {available.map((item) => (
                  <li key={item.opening_id} className="rounded-lg border p-3">
                    <div className="flex justify-between gap-3">
                      <div className="text-left">
                        <p className="font-medium">{item.title || "Appointment"}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatTime(item.starts_at)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Price: ${item.listed_price} · Staff: {item.staff_name || "N/A"}
                        </p>
                        <button
                          className="text-xs text-primary hover:underline mt-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            setViewProfileTarget({
                              accountId: item.posted_by_account_id,
                              businessId: item.business_id,
                            })
                          }}
                        >
                          View Provider
                        </button>
                      </div>
                      <button
                        className="rounded bg-primary px-3 py-1 h-fit text-xs text-primary-foreground disabled:opacity-40"
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
            {dataLoading ? (
              <p className="text-sm text-muted-foreground animate-pulse">Loading reservations...</p>
            ) : confirmed.length === 0 ? (
              <p className="text-sm text-muted-foreground">No appointments confirmed yet. Confirm one from the left panel.</p>
            ) : (
              <ul className="space-y-2">
                {confirmed.map((item) => (
                  <li key={item.reservation.reservation_id} className="rounded-lg border p-3 bg-background">
                    <div className="flex justify-between gap-3">
                      <div className="text-left">
                        <p className="font-medium">{item.opening.title || "Appointment"}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatTime(item.opening.starts_at)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                           Status: {item.reservation.status}
                        </p>
                        <button
                          className="text-xs text-primary hover:underline mt-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            setViewProfileTarget({
                              accountId: item.opening.posted_by_account_id,
                              businessId: item.opening.business_id,
                            })
                          }}
                        >
                          View Provider
                        </button>
                      </div>
                      <button
                        className="rounded border border-red-400 px-2 py-1 h-fit text-xs text-red-600 hover:bg-red-100 dark:hover:bg-red-950"
                        onClick={() => requestCancel(item)}
                      >
                        Cancel
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {completed.length > 0 && (
              <>
                <h2 className="text-lg font-semibold mt-4">Completed Appointments</h2>
                <ul className="space-y-2">
                  {completed.map((item) => (
                    <li key={item.reservation.reservation_id} className="rounded-lg border p-3 bg-background">
                      <div className="flex justify-between gap-3">
                        <div className="text-left">
                          <p className="font-medium">{item.opening.title || "Appointment"}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatTime(item.opening.starts_at)}
                          </p>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                            Completed
                          </p>
                          <button
                            className="text-xs text-primary hover:underline mt-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              setViewProfileTarget({
                                accountId: item.opening.posted_by_account_id,
                                businessId: item.opening.business_id,
                              })
                            }}
                          >
                            View Provider
                          </button>
                        </div>
                        {!reviewedReservationIds.has(item.reservation.reservation_id) ? (
                          <button
                            className="flex items-center gap-1 rounded bg-amber-100 px-2 py-1 h-fit text-xs font-medium text-amber-900 hover:bg-amber-200 dark:bg-amber-500/20 dark:text-amber-100 dark:hover:bg-amber-500/30"
                            onClick={() => setReviewTarget(item)}
                          >
                            <Star className="h-3 w-3" />
                            Review
                          </button>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            Reviewed
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </>
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
                className="rounded px-3 py-1 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={confirmPending}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <ProfileModal
        accountId={viewProfileTarget?.accountId}
        businessId={viewProfileTarget?.businessId}
        onClose={() => setViewProfileTarget(null)}
      />

      {reviewTarget && (
        <ReviewModal
          reservationId={reviewTarget.reservation.reservation_id}
          appointmentTitle={reviewTarget.opening.title}
          onClose={() => setReviewTarget(null)}
          onReviewSubmitted={() => loadData()}
        />
      )}

      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={dismissCancel} />
          <div className="relative z-10 w-[min(90vw,420px)] rounded-xl border border-border bg-background p-6 shadow-xl">
            <h3 className="text-lg font-semibold">Are you sure?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Frequent cancellations may negatively impact your client rating.
            </p>
            <p className="mt-2 text-sm font-medium">
              {cancelTarget.opening.title || "Appointment"} - {formatTime(cancelTarget.opening.starts_at)}
            </p>
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
