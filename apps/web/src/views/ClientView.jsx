import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ChevronDownIcon, ArrowLeft } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Link } from "react-router-dom"
import { getMyProfile } from "@/lib/queries/profile"

export function ClientView() {
  const [date, setDate] = useState()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    getMyProfile()
      .then(setProfile)
      .catch(() => setProfile(null))
  }, [])

  const initials = profile?.display_name
    ? profile.display_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?"

  return (
    <div className="flex flex-col items-center justify-center flex-1 p-8">
      <div className="absolute top-6 left-6">
        <Button asChild variant="outline"
          className="w-[42px] justify-between text-left font-normal">
          <Link to="/FlashSlots/login">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="absolute top-6 right-6">
        <Avatar asChild className="h-10 w-10 cursor-pointer">
          <Link to={`/FlashSlots/profile/${profile?.username}`}>
            <AvatarImage src="" alt="Profile" />
            <AvatarFallback className="bg-gray-200 text-gray-700 font-medium">
              {initials}
            </AvatarFallback>
          </Link>
        </Avatar>
      </div>

      <h2 className="text-2xl font-semibold mb-4">
        {profile ? `Welcome, ${profile.display_name}` : "Client View"}
      </h2>
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