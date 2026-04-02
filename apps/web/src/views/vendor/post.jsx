import { useState } from "react"
import { Availability } from "@/components/ui/availability"

export function VendorPostPage() {
  const [data, setData] = useState([])

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Post appointment</h1>
        <p className="mt-1 max-w-xl text-muted-foreground text-sm leading-relaxed">
          Publish open time so clients can book last-minute openings.
        </p>
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
