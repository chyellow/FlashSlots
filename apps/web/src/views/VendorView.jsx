import { useState, useEffect } from "react"
import { Availability } from "@/components/availability"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { getMyProfile } from "@/lib/queries/profile"

export function VendorView() {
  const [data, setData] = useState([])
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
    <div className="w-full flex flex-col items-center justify-center flex-1 p-8">
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
        {profile ? `Welcome, ${profile.display_name}` : "Vendor View"}
      </h2>
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