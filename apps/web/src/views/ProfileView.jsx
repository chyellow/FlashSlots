import { useState, useEffect } from "react"
import { useParams, Link} from "react-router"
import { getProfile } from "@/lib/queries/profile"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { MapPin, Phone, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

function ProfileView() {
  const { username } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
  let cancelled = false
  getProfile(username)
    .then((data) => { if (!cancelled) setProfile(data) })
    .catch((err) => { if (!cancelled) setError(err) })
    .finally(() => { if (!cancelled) setLoading(false) })
  return () => { cancelled = true }
}, [username])

  {/*Loading skeleton*/}
  if (loading)
    return (
      <div className="w-full h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-2xl border bg-card p-10 shadow-sm space-y-8">
          <div className="flex flex-col items-center gap-5">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-8 w-44" />
          </div>
          <Skeleton className="h-px w-full" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        </div>
      </div>
    )

  if (error)
    return (
      <div className="w-full h-screen flex items-center justify-center text-destructive">
        Something went wrong
      </div>
    )

  if (!profile)
    return (
      <div className="w-full h-screen flex items-center justify-center text-muted-foreground">
        Profile not found
      </div>
    )

  const initials = profile.display_name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center px-4 my-10">
      <Button
        asChild
        variant="outline"
        className="w-[212px] justify-between text-left font-normal data-[empty=true]:text-muted-foreground my-10">
        <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
        </Link>
        </Button>
      
      <div className="w-full max-w-lg rounded-2xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        {/* Header (Profile/Display Name) */}
        <div className="flex flex-col items-center gap-5 px-10 pt-10 pb-8">
          <div className="relative">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.display_name}
                className="h-24 w-24 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-primary/10 border border-border flex items-center justify-center">
                <span className="text-2xl font-semibold text-primary tracking-tight">
                  {initials}
                </span>
              </div>
            )}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {profile.display_name}
          </h1>
        </div>

        <Separator />

        {/* City/State */}
        <div className="px-10 py-8 space-y-5">
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm">
              {profile.city}, {profile.state}
            </span>
          </div>
          {/* Phone*/}
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm">{profile.phone}</span>
          </div>
        </div>
      </div>
    </div>
    
   
  )
}

export default ProfileView
