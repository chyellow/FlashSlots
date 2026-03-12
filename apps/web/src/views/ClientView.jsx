import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ChevronDownIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function ClientView() {
  const [date, setDate] = useState()

  return (
    <div className="flex flex-col items-center justify-center flex-1 p-8">
      <div className="absolute top-6 left-6">
        <Button asChild variant="outline"
          className="w-[42px] justify-between text-left font-normal data-[empty=true]:text-muted-foreground">
          <Link to="/FlashSlots/">
              <ArrowLeft className="mr-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="absolute top-6 right-6">
        <Avatar asChild size="lg" className="w-48 text-md">
          <Link to="/FlashSlots/profile/client">
          {/* The empty src tells the component to immediately trigger the fallback */}
          <AvatarImage src="" alt="Profile" />
          
          <AvatarFallback className="bg-gray-200 flex items-center justify-center">
            <User className="h-6 w-6 text-gray-500" />
          </AvatarFallback>
          </Link>
        </Avatar>
      </div>
      <h2 className="text-2xl font-semibold mb-4">Client View</h2>
      <p className="text-muted-foreground mb-6 max-w-md text-center">
        Browse and book last-minute openings from service providers.
      </p>
      <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!date}
          className="w-[212px] justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
        >
          {date ? format(date, "PPP") : <span>Pick a date</span>}
          <ChevronDownIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          defaultMonth={date}
        />
      </PopoverContent>
    </Popover>
    </div>
  )
}
