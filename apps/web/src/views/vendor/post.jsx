import { useState } from "react"
import { Availability } from "@/components/ui/availability"
import { Button } from "@/components/ui/button"
import { postOpening } from "@/lib/queries/openings"
import { useNavigate } from "react-router-dom"

function getNextDateForDay(dayIndex, timeStr) {
  const now = new Date()
  const result = new Date(now)
  
  result.setDate(now.getDate() + ((dayIndex + 7 - now.getDay()) % 7))
  
  const [hours, minutes] = timeStr.split(':')
  result.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)

  if (result < now) {
    result.setDate(result.getDate() + 7)
  }
  
  return result
}

export function VendorPostPage() {
  const [data, setData] = useState([])
  const [publishing, setPublishing] = useState(false)
  const navigate = useNavigate()

  const handlePublish = async () => {
    setPublishing(true)
    try {
      await Promise.all(
        data.map(async (slot) => {
          const starts_at = getNextDateForDay(slot.week_day, slot.start_time)
          const ends_at = getNextDateForDay(slot.week_day, slot.end_time)

          // Safely parse the expiration duration from the modal
          const expireMins = slot.duration ? parseInt(slot.duration, 10) : 30
          const listing_expires_at = new Date(starts_at.getTime() - expireMins * 60000)

          await postOpening({
            title: slot.name || "Available Appointment",
            staff_name: slot.employee || null,
            starts_at: starts_at.toISOString(),
            ends_at: ends_at.toISOString(),
            listed_price: parseFloat(slot.price) || 0.00, // Hardcoded default for MVP, can be dynamic later
            payment_option: "BOTH",
            listing_expires_at: listing_expires_at.toISOString()
          })
        })
      )
      
      alert("Openings published successfully to the marketplace!")
      setData([]) // Clear the board
      navigate("/vendor/appointments") // Send them to see their live listings
    } catch (err) {
      alert("Error publishing openings: " + (err.message || "Unknown error"))
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Post appointment</h1>
          <p className="mt-1 max-w-xl text-muted-foreground text-sm leading-relaxed">
            Drag to publish open time so clients can book last-minute openings.
          </p>
        </div>
        <Button onClick={handlePublish} disabled={publishing || data.length === 0}>
          {publishing ? "Publishing..." : `Publish ${data.length} slot(s)`}
        </Button>
      </div>

      <div className="rounded-lg border bg-card p-4 shadow-xs">
        <Availability
          value={data}
          onValueChange={setData}
          startTime={5}
          endTime={24}
          useAmPm={true}
          timeIncrements={15}
        />
      </div>
    </div>
  )
}