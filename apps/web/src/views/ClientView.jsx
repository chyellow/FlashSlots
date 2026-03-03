import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"

export function ClientView() {
  const [date, setDate] = useState(new Date())

  return (
    <div className="flex flex-col items-center justify-center flex-1 p-8">
      <h2 className="text-2xl font-semibold mb-4">Client View</h2>
      <p className="text-muted-foreground mb-6 max-w-md text-center">
        Browse and book last-minute openings from service providers.
      </p>
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-lg border"
      />
    </div>
  )
}
