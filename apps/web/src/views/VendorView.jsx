"use client"
import { useState } from "react"
import { Availability } from "@/components/availability"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button"

export function VendorView() {
  
  const [data, setData] = useState([])

  return (
    <div className="w-full flex flex-col items-center justify-center flex-1 p-8">
      <div className="absolute top-6 left-6">
        <Button asChild variant="outline"
          className="w-[42px] justify-between text-left font-normal data-[empty=true]:text-muted-foreground">
          <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <h2 className="text-2xl font-semibold mb-4">Vendor View</h2>
      <p className="text-muted-foreground max-w-md text-center">
        Manage your schedule and publish available time slots for clients to book.
      </p>
      <div className="absolute top-6 right-6">
        <Avatar asChild size="lg" className="w-48 text-md">
          <Link to="/profile/vendor">
          {/* The empty src tells the component to immediately trigger the fallback */}
          <AvatarImage src="" alt="Profile" />
          
          <AvatarFallback className="bg-gray-200 flex items-center justify-center">
            <User className="h-6 w-6 text-gray-500" />
          </AvatarFallback>
          </Link>
        </Avatar>
      </div>

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
