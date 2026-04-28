import { useState } from "react"
import { Availability } from "@/components/ui/availability"
import { Button } from "@/components/ui/button"
import { postOpening, deleteOpening } from "@/lib/queries/openings"
import { publishOpeningSlotsWithRollback } from "@/lib/vendorOpeningTimes"
import { useNavigate } from "react-router-dom"

export function VendorPostPage() {
  const [data, setData] = useState([])
  const [publishing, setPublishing] = useState(false)
  const navigate = useNavigate()

  const handlePublish = async () => {
    setPublishing(true)
    try {
      await publishOpeningSlotsWithRollback(data, postOpening, deleteOpening)

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
          mergeAdjacent={false}
        />
      </div>
    </div>
  )
}
