import { useState, useEffect } from "react"
import { useParams, Link, useLocation } from "react-router"
import { getProfile } from "@/lib/queries/profile"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { MapPin, Phone, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

function ProfileView() {
  const { username } = useParams()
  const location = useLocation()
  const backTo = location.state?.returnTo ?? "/FlashSlots/"
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    getProfile(username)
      .then((data) => {
        if (!cancelled) setProfile(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [username])

  if (loading)
    return (
      <div className="flex h-screen w-full items-center justify-center px-4">
        <div className="w-full max-w-lg space-y-8 rounded-2xl border bg-card p-10 shadow-sm">
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
      <div className="flex h-screen w-full items-center justify-center text-destructive">
        Profile Not Found!
      </div>
    )

  if (!profile)
    return (
      <div className="flex h-screen w-full items-center justify-center text-muted-foreground">
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
    <div className="my-10 flex h-screen w-full flex-col items-center justify-center px-4">
      <Button
        asChild
        variant="outline"
        className="my-10 w-[212px] justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
      >
        <Link to={backTo}>
          <ArrowLeft className="mr-2 h-4 w-4" />
        </Link>
      </Button>

      <div className="w-full max-w-lg overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col items-center gap-5 px-10 pt-10 pb-8">
          <div className="relative">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.display_name}
                className="h-24 w-24 rounded-full border border-border object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-border bg-primary/10">
                <span className="text-2xl font-semibold tracking-tight text-primary">
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

        <div className="space-y-5 px-10 py-8">
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-sm">
              {profile.city}, {profile.state}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-sm">{profile.phone}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileView
