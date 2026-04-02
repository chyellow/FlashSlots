import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getMyProfile, updateMyProfile } from "@/lib/queries/profile"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

function ProfileView() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [phone, setPhone] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getMyProfile()
      .then((data) => {
        setProfile(data)
        setPhone(data.phone || "")
        setCity(data.city || "")
        setState(data.state || "")
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      const updated = await updateMyProfile({
        phone,
        city,
        state_region: state,
      })
      setProfile(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const initials = profile?.display_name
    ? profile.display_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?"

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
        {error}
      </div>
    )

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center px-4">
      <div className="absolute top-6 left-6">
        <Button asChild variant="outline" className="w-[42px]">
          <Link to={-1}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="w-full max-w-lg rounded-2xl border bg-card text-card-foreground shadow-sm overflow-hidden">

        {/* Avatar + Name */}
        <div className="flex flex-col items-center gap-5 px-10 pt-10 pb-8">
          <div className="h-24 w-24 rounded-full bg-primary/10 border border-border flex items-center justify-center">
            <span className="text-2xl font-semibold text-primary tracking-tight">
              {initials}
            </span>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              {profile.display_name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">@{profile.username}</p>
          </div>
        </div>

        <Separator />

        {/* Fields */}
        <div className="px-10 py-8 space-y-5">

          {/* Email — read only */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <p className="text-sm">{profile.email}</p>
          </div>

          {/* Phone — editable */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-muted-foreground">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 555-5555"
              className="border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* City — editable */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-muted-foreground">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="New Brunswick"
              className="border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* State — editable */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-muted-foreground">State</label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="NJ"
              className="border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 rounded-lg text-sm disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : saved ? "Saved ✓" : "Save changes"}
          </button>

        </div>
      </div>
    </div>
  )
}

export default ProfileView