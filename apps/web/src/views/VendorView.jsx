"use client"
import { useState } from "react"
import { Availability } from "@/components/availability"

export function VendorView() {
  
  const [data, setData] = useState([])

  return (
    <div className="w-full flex flex-col items-center justify-center flex-1 p-8">
      <h2 className="text-2xl font-semibold mb-4">Vendor View</h2>
      <p className="text-muted-foreground max-w-md text-center">
        Manage your schedule and publish available time slots for clients to book.
      </p>

      <div className="w-full max-w-5xl p-4 bg-background border rounded-lg mt-10">
      <Availability 
        value={data} 
        onValueChange={setData}
        startTime={0}
        endTime={24}
        useAmPm={true}
        timeIncrements={15}
      />
    </div>
  
    </div>
  )
}
