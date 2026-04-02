import { useEffect, useState } from "react"
import { getOpenings, deleteOpening } from "@/lib/queries/openings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

export function VendorAppointmentsPage() {
  const [openings, setOpenings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const ops = await getOpenings(true) // mine=true
      if (Array.isArray(ops)) {
        setOpenings(ops.sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at)))
      } else {
        setOpenings([])
      }
    } catch (err) {
      console.error(err)
      setError(err.message || "Failed to load appointments")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCancelOpening = async (openingId) => {
    if (!window.confirm("Are you sure you want to cancel this listing?")) return
    try {
      await deleteOpening(openingId)
      loadData()
    } catch (err) {
      alert("Failed to cancel: " + err.message)
    }
  }

  if (loading) {
    return <div className="animate-pulse p-4 text-muted-foreground text-sm">Loading your schedule...</div>
  }

  if (error) {
    return <div className="p-4 text-red-500 text-sm">Error: {error}</div>
  }

  // Group openings safely
  const activeOpenings = openings.filter(o => o.status === 'OPEN' || o.status === 'ON_HOLD')
  const bookedOpenings = openings.filter(o => o.status === 'BOOKED')
  const pastOpenings = openings.filter(o => o.status === 'EXPIRED' || o.status === 'CANCELLED')

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Appointments</h1>
        <p className="mt-1 max-w-xl text-muted-foreground text-sm leading-relaxed">
          Manage your live listings and booked schedule.
        </p>
      </div>

      <Tabs defaultValue="booked" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="booked">Booked ({bookedOpenings.length})</TabsTrigger>
          <TabsTrigger value="active">Active Listings ({activeOpenings.length})</TabsTrigger>
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
                    <p>Price: ${op.listed_price}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {activeOpenings.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center border rounded-lg bg-card border-dashed">
              No active listings. Go to "Post appointment" to add some!
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {activeOpenings.map(op => (
                <div key={op.opening_id} className="rounded-lg border bg-card p-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg">{op.title || "Appointment"}</h3>
                      <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">
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
                    onClick={() => handleCancelOpening(op.opening_id)}
                    className="mt-4 text-xs font-medium text-red-600 hover:text-red-700 w-fit"
                  >
                    Cancel Listing
                  </button>
                </div>
              ))}
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
    </div>
  )
}