import { useEffect, useMemo, useState } from "react"
import { Availability } from "@/components/ui/availability"
import { Button } from "@/components/ui/button"
import { getOpenings, deleteOpening, patchOpening, postOpening } from "@/lib/queries/openings"
import { publishOpeningSlotsWithRollback } from "@/lib/vendorOpeningTimes"
import { getBusinessReservations, cancelReservation } from "@/lib/queries/reservations"
import { completeReservation } from "@/lib/queries/reviews"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileModal } from "@/components/ProfileModal"
import { Star, CheckCircle } from "lucide-react"

function formatTime(dateString) {
  if (!dateString) return "Unknown time"
  const d = new Date(dateString)
  return d.toLocaleString("en-US", {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

function toLocalTimeString(dateString) {
  const date = new Date(dateString)
  return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
}

function openingToCalendarEvent(opening) {
  const startsAt = new Date(opening.starts_at)
  const isClaimed = opening.status === "BOOKED"

  return {
    id: `opening-${opening.opening_id}`,
    week_day: startsAt.getDay(),
    start_time: toLocalTimeString(opening.starts_at),
    end_time: toLocalTimeString(opening.ends_at),
    name: opening.staff_name || "Unassigned",
    employee: opening.title || "",
    openingId: opening.opening_id,
    status: opening.status,
    startsAt: opening.starts_at,
    endsAt: opening.ends_at,
    listingExpiresAt: opening.listing_expires_at,
    className: isClaimed
      ? "bg-emerald-100 border-emerald-300 text-emerald-950 dark:bg-emerald-500/20 dark:border-emerald-400/50 dark:text-emerald-50"
      : "bg-amber-100 border-amber-300 text-amber-950 dark:bg-amber-500/20 dark:border-amber-400/50 dark:text-amber-50",
  }
}

const EXPIRATION_OPTIONS = ["0", "5", "10", "15", "20", "30", "40", "50", "60"]

function getExpirationMinutes(openingLike) {
  if (!openingLike?.startsAt || !openingLike?.listingExpiresAt) {
    return "30"
  }

  const startsAt = new Date(openingLike.startsAt).getTime()
  const listingExpiresAt = new Date(openingLike.listingExpiresAt).getTime()
  const diffMins = Math.max(0, Math.round((startsAt - listingExpiresAt) / 60000))
  return String(diffMins)
}

function buildListingExpiresAt(startsAt, expirationMinutes) {
  const mins = parseInt(expirationMinutes, 10) || 0
  return new Date(new Date(startsAt).getTime() - mins * 60000).toISOString()
}

export function VendorAppointmentsPage() {
  const [draftSlots, setDraftSlots] = useState([])
  const [openings, setOpenings] = useState([])
  const [reservations, setReservations] = useState([])
  const [publishing, setPublishing] = useState(false)
  const [loadingOpenings, setLoadingOpenings] = useState(true)
  const [error, setError] = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [editModalData, setEditModalData] = useState({
    name: "",
    duration: "",
    employee: "",
  })
  const [savingEdit, setSavingEdit] = useState(false)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [viewProfileTarget, setViewProfileTarget] = useState(null)

  const loadOpenings = async () => {
    setLoadingOpenings(true)
    setError(null)
    try {
      const [opsResult, resesResult] = await Promise.allSettled([
        getOpenings(true),
        getBusinessReservations(),
      ])

      const ops = opsResult.status === "fulfilled" && Array.isArray(opsResult.value)
        ? opsResult.value.sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))
        : []
      const reses = resesResult.status === "fulfilled" && Array.isArray(resesResult.value)
        ? resesResult.value
        : []

      setOpenings(ops)
      setReservations(reses)

      if (opsResult.status === "rejected") {
        throw opsResult.reason
      }
    } catch (err) {
      console.error(err)
      setError(err.message || "Failed to load appointments")
    } finally {
      setLoadingOpenings(false)
    }
  }

  useEffect(() => {
    loadOpenings()
  }, [])

  const handlePublish = async () => {
    setPublishing(true)
    try {
      await publishOpeningSlotsWithRollback(draftSlots, postOpening, deleteOpening)

      alert("Openings published successfully to the marketplace!")
      setDraftSlots([])
      loadOpenings()
    } catch (err) {
      alert("Error publishing openings: " + (err.message || "Unknown error"))
    } finally {
      setPublishing(false)
    }
  }

  const handleOpenAppointmentSettings = (event) => {
    setEditTarget(event)
    setEditModalData({
      name: event.name || "",
      duration: getExpirationMinutes(event),
      employee: event.employee || "",
    })
  }

  const handleCloseEditModal = () => {
    setEditTarget(null)
    setEditModalData({
      name: "",
      duration: "",
      employee: "",
    })
  }

  const handleSaveAppointment = async () => {
    if (!editTarget || !editModalData.name || !editModalData.duration) {
      return
    }

    setSavingEdit(true)
    try {
      await patchOpening(editTarget.openingId, {
        staff_name: editModalData.name,
        title: editModalData.employee || null,
        listing_expires_at: buildListingExpiresAt(editTarget.startsAt, editModalData.duration),
      })
      handleCloseEditModal()
      loadOpenings()
    } catch (err) {
      alert(err.message || "Failed to update appointment.")
    } finally {
      setSavingEdit(false)
    }
  }

  const requestCancelAppointment = () => {
    if (!editTarget) return
    setCancelTarget(editTarget)
    handleCloseEditModal()
  }

  const requestCancelForOpening = (opening) => {
    setCancelTarget(openingToCalendarEvent(opening))
  }

  const dismissCancel = () => {
    setCancelTarget(null)
  }

  const confirmCancelAppointment = async () => {
    if (!cancelTarget) return

    try {
      if (cancelTarget.status === "BOOKED") {
        const matchingReservation = reservations.find(
          (reservation) => reservation.opening_id === cancelTarget.openingId
        )

        if (!matchingReservation) {
          throw new Error("Could not find the reservation tied to this appointment.")
        }

        await cancelReservation(matchingReservation.reservation_id, "Business cancellation")
      } else {
        await deleteOpening(cancelTarget.openingId)
      }

      setCancelTarget(null)
      loadOpenings()
    } catch (err) {
      alert(err.message || "Failed to cancel appointment.")
    }
  }

  const handleComplete = async (opening) => {
    const res = reservations.find(r => r.opening_id === opening.opening_id && r.status === "CONFIRMED")
    if (!res) {
      alert("Could not find the reservation for this appointment.")
      return
    }

    try {
      await completeReservation(res.reservation_id)
      loadOpenings()
    } catch (err) {
      alert(err.message || "Failed to mark as complete.")
    }
  }

  const activeOpenings = openings.filter(o => o.status === 'OPEN' || o.status === 'ON_HOLD')
  const completedOpenings = openings.filter(o => o.status === 'COMPLETED')
  const bookedOpenings = openings.filter(o => o.status === 'BOOKED')
  const pastOpenings = openings.filter(o => o.status === 'EXPIRED' || o.status === 'CANCELLED')

  const calendarEvents = useMemo(() => {
    const now = new Date()
    const calendarWindowEnd = new Date(now)
    calendarWindowEnd.setDate(calendarWindowEnd.getDate() + 7)

    return openings
      .filter((opening) => {
        if (!["OPEN", "ON_HOLD", "BOOKED"].includes(opening.status)) {
          return false
        }

        const startsAt = new Date(opening.starts_at)
        const endsAt = new Date(opening.ends_at)
        return endsAt > now && startsAt < calendarWindowEnd
      })
      .map(openingToCalendarEvent)
  }, [openings])
  const editDurationOptions = useMemo(() => {
    if (!editModalData.duration || EXPIRATION_OPTIONS.includes(editModalData.duration)) {
      return EXPIRATION_OPTIONS
    }

    return [...EXPIRATION_OPTIONS, editModalData.duration].sort((a, b) => Number(a) - Number(b))
  }, [editModalData.duration])

  const loading = loadingOpenings

  if (loading) {
    return <div className="animate-pulse p-4 text-muted-foreground text-sm">Loading your schedule...</div>
  }

  if (error) {
    return <div className="p-4 text-red-500 text-sm">Error: {error}</div>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Appointments</h1>
          <p className="mt-1 max-w-xl text-muted-foreground text-sm leading-relaxed">
            Create new openings and see your upcoming week of claimed and unclaimed appointments on one calendar.
          </p>
        </div>
        <Button onClick={handlePublish} disabled={publishing || draftSlots.length === 0}>
          {publishing ? "Publishing..." : `Publish ${draftSlots.length} slot(s)`}
        </Button>
      </div>

      <div className="rounded-lg border bg-card p-4 shadow-xs">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3 text-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-amber-300 dark:bg-amber-400" />
              <span className="text-muted-foreground">Unclaimed</span>
            </div>
            <div className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-400 dark:bg-emerald-400" />
              <span className="text-muted-foreground">Claimed</span>
            </div>
          </div>
          {draftSlots.length > 0 && (
            <p className="max-w-xs text-right text-xs font-medium text-amber-700 dark:text-amber-300">
              You have {draftSlots.length} unpublished slot{draftSlots.length === 1 ? "" : "s"}. Hit Publish to make {draftSlots.length === 1 ? "it" : "them"} visible to clients.
            </p>
          )}
        </div>

        <Availability
          value={draftSlots}
          onValueChange={setDraftSlots}
          lockedEvents={calendarEvents}
          onLockedEventSelect={handleOpenAppointmentSettings}
          startTime={5}
          endTime={24}
          useAmPm={true}
          timeIncrements={15}
          mergeAdjacent={false}
        />
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="booked">Booked ({bookedOpenings.length})</TabsTrigger>
          <TabsTrigger value="active">Active Listings ({activeOpenings.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedOpenings.length})</TabsTrigger>
          <TabsTrigger value="past">Past / Cancelled ({pastOpenings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="booked" className="space-y-4">
          {bookedOpenings.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center border rounded-lg bg-card border-dashed">
              No appointments booked yet.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {bookedOpenings.map(op => (
                <div key={op.opening_id} className="rounded-lg border bg-card p-4 shadow-sm">
                  <h3 className="font-semibold text-lg">{op.title || "Appointment"}</h3>
                  <div className="mt-2 text-sm text-muted-foreground space-y-1">
                    <p>Time: <span className="text-foreground">{formatTime(op.starts_at)}</span></p>
                    <p>Staff: {op.staff_name || "N/A"}</p>
                    <p>Client: {op.client_name || "N/A"}</p>
                    {op.client_account_id && (
                      <button
                        className="text-xs text-primary hover:underline"
                        onClick={() => setViewProfileTarget({ accountId: op.client_account_id, businessId: null })}
                      >
                        View Client
                      </button>
                    )}
                    <p>Price: ${op.listed_price}</p>
                  </div>
                  <button
                    onClick={() => handleComplete(op)}
                    className="mt-3 flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    Mark Complete
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {activeOpenings.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center border rounded-lg bg-card border-dashed">
              No active listings. Use the calendar above to add some.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {activeOpenings.map(op => (
                <div key={op.opening_id} className="rounded-lg border bg-card p-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg">{op.title || "Appointment"}</h3>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-100">
                        {op.status}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground space-y-1">
                      <p>Time: <span className="text-foreground">{formatTime(op.starts_at)}</span></p>
                      <p>Staff: {op.staff_name || "N/A"}</p>
                      <p>Price: ${op.listed_price}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => requestCancelForOpening(op)}
                    className="mt-4 text-xs font-medium text-red-600 hover:text-red-700 w-fit"
                  >
                    Cancel Listing
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedOpenings.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center border rounded-lg bg-card border-dashed">
              No completed appointments yet.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {completedOpenings.map(op => {
                return (
                  <div key={op.opening_id} className="rounded-lg border bg-card p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg">{op.title || "Appointment"}</h3>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200">
                        Completed
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground space-y-1">
                      <p>Time: <span className="text-foreground">{formatTime(op.starts_at)}</span></p>
                      <p>Staff: {op.staff_name || "N/A"}</p>
                      <p>Client: {op.client_name || "N/A"}</p>
                      {op.client_account_id && (
                        <button
                          className="text-xs text-primary hover:underline"
                          onClick={() => setViewProfileTarget({ accountId: op.client_account_id, businessId: null })}
                        >
                          View Client
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastOpenings.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center border rounded-lg bg-card border-dashed">
              No past or cancelled appointments.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 opacity-75">
              {pastOpenings.map(op => (
                <div key={op.opening_id} className="rounded-lg border bg-card/50 p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold">{op.title || "Appointment"}</h3>
                    <span className="text-xs font-medium text-muted-foreground">{op.status}</span>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground space-y-1">
                    <p>Time: {formatTime(op.starts_at)}</p>
                    <p>Staff: {op.staff_name || "N/A"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={handleCloseEditModal} />
          <div className="relative z-10 w-[min(90vw,420px)] rounded-xl border border-border bg-background p-6 shadow-xl">
            <h3 className="text-lg font-semibold">Edit Appointment</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {formatTime(editTarget.startsAt)}
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSaveAppointment()
              }}
              className="mt-4 space-y-4"
            >
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Staff name *
                </label>
                <input
                  type="text"
                  value={editModalData.name}
                  onChange={(e) => setEditModalData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 font-sans text-foreground shadow-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Booking expiration (minutes before start) *
                </label>
                <select
                  value={editModalData.duration}
                  onChange={(e) => setEditModalData((prev) => ({ ...prev, duration: e.target.value }))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 font-sans text-foreground shadow-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select duration</option>
                  {editDurationOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === "0" ? "Until start time" : `${option} minutes`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Appointment Type (optional)
                </label>
                <input
                  type="text"
                  value={editModalData.employee}
                  onChange={(e) => setEditModalData((prev) => ({ ...prev, employee: e.target.value }))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 font-sans text-foreground shadow-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex flex-wrap justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={requestCancelAppointment}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                >
                  Cancel Appointment
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCloseEditModal}
                    className="rounded-md bg-muted px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/90"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    {savingEdit ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={dismissCancel} />
          <div className="relative z-10 w-[min(90vw,420px)] rounded-xl border border-border bg-background p-6 shadow-xl">
            <h3 className="text-lg font-semibold">Are you sure?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {cancelTarget.status === "BOOKED"
                ? "Cancelling this appointment will remove the client's booking and reopen the time if it is still upcoming."
                : "Cancelling this appointment will remove the listing from your schedule."}
            </p>
            <p className="mt-2 text-sm font-medium">
              {(cancelTarget.employee || "Appointment")} - {formatTime(cancelTarget.startsAt)}
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
                onClick={confirmCancelAppointment}
              >
                Cancel Appointment
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
    </div>
  )
}
