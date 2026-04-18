import { useEffect, useState } from "react"
import { getProfileByAccountId } from "@/lib/queries/profile"
import { getBusinessById } from "@/lib/queries/business"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, Phone, Mail, Building2, Clock, X } from "lucide-react"


export function ProfileModal({ accountId, businessId, onClose }) {
  const [profile, setProfile] = useState(null)
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!accountId) return

    setLoading(true)
    setError(null)
    setProfile(null)
    setBusiness(null)

    const fetchData = async () => {
      try {
        const [profileData, businessData] = await Promise.all([
          getProfileByAccountId(accountId),
          businessId ? getBusinessById(businessId) : Promise.resolve(null),
        ])
        setProfile(profileData)
        setBusiness(businessData)
      } catch (err) {
        setError(err.message || "Failed to load profile")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [accountId, businessId])

  if (!accountId) return null

  const initials = profile?.display_name
    ? profile.display_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-[min(90vw,440px)] max-h-[85vh] overflow-y-auto rounded-xl border border-border bg-background shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {loading ? (
          <div className="p-10 space-y-6">
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-px w-full" />
            <div className="space-y-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
            </div>
          </div>
        ) : error ? (
          <div className="p-10 text-center text-sm text-destructive">{error}</div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-4 px-10 pt-10 pb-6">
              <div className="h-20 w-20 rounded-full bg-primary/10 border border-border flex items-center justify-center">
                <span className="text-xl font-semibold text-primary tracking-tight">
                  {initials}
                </span>
              </div>
              <div className="text-center">
                <h2 className="text-xl font-semibold tracking-tight">
                  {profile.display_name}
                </h2>
                {profile.username && (
                  <p className="text-sm text-muted-foreground mt-0.5">@{profile.username}</p>
                )}
              </div>
            </div>

            <Separator />

            <div className="px-10 py-6 space-y-4">
              <ProfileField icon={Mail} label="Email" value={profile.email} />
              <ProfileField icon={Phone} label="Phone" value={profile.phone} />
              <ProfileField
                icon={MapPin}
                label="Location"
                value={[profile.city, profile.state_region].filter(Boolean).join(", ") || null}
              />
              <ProfileField
                icon={Clock}
                label="Member since"
                value={new Date(profile.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              />
            </div>

            {business && (
              <>
                <Separator />
                <div className="px-10 py-6 space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Business
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-base">{business.display_name}</p>
                      {business.description && (
                        <p className="text-sm text-muted-foreground mt-1">{business.description}</p>
                      )}
                    </div>
                    <ProfileField
                      icon={MapPin}
                      label="Address"
                      value={[
                        business.address_line1,
                        [business.city, business.state_region, business.postal_code].filter(Boolean).join(", "),
                      ].filter(Boolean).join("\n")}
                      multiline
                    />
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        business.verification_status === "VERIFIED"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200"
                      }`}>
                        {business.verification_status}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function ProfileField({ icon: Icon, label, value, multiline = false }) {
  if (!value) {
    return (
      <div className="flex items-start gap-3">
        <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-sm text-muted-foreground/60 italic">Not provided</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {multiline ? (
          value.split("\n").map((line, i) => (
            <p key={i} className="text-sm">{line}</p>
          ))
        ) : (
          <p className="text-sm">{value}</p>
        )}
      </div>
    </div>
  )
}
