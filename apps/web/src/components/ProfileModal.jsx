import { useEffect, useState } from "react"
import { getProfileByAccountId } from "@/lib/queries/profile"
import { getBusinessById } from "@/lib/queries/business"
import { getBusinessRating, getBusinessReviews, getClientStats } from "@/lib/queries/reviews"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, Phone, Mail, Clock, Star, XCircle, X, ChevronDown } from "lucide-react"


export function ProfileModal({ accountId, businessId, onClose }) {
  const [profile, setProfile] = useState(null)
  const [rating, setRating] = useState(null)
  const [reviews, setReviews] = useState([])
  const [clientStats, setClientStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reviewsOpen, setReviewsOpen] = useState(false)

  useEffect(() => {
    if (!accountId) return

    setLoading(true)
    setError(null)
    setProfile(null)
    setRating(null)
    setReviews([])
    setClientStats(null)
    setReviewsOpen(false)

    const fetchData = async () => {
      try {
        const [profileData, businessData] = await Promise.all([
          getProfileByAccountId(accountId),
          businessId ? getBusinessById(businessId) : Promise.resolve(null),
        ])
        setProfile(profileData)

        if (businessData) {
          try {
            const [ratingData, reviewsData] = await Promise.all([
              getBusinessRating(businessData.business_id),
              getBusinessReviews(businessData.business_id),
            ])
            setRating(ratingData)
            setReviews(reviewsData)
          } catch {
            // reviews not available yet
          }
        } else {
          try {
            const statsData = await getClientStats(accountId)
            setClientStats(statsData)
          } catch {
            // stats not available yet
          }
        }
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

              {rating && (
                <div className="flex items-center gap-2">
                  {rating.average_rating ? (
                    <>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= Math.round(rating.average_rating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{rating.average_rating}</span>
                      <span className="text-xs text-muted-foreground">
                        ({rating.total_reviews} review{rating.total_reviews !== 1 ? "s" : ""})
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">No reviews yet</span>
                  )}
                </div>
              )}

              {clientStats && (
                <div className="flex items-center gap-2 text-sm">
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {clientStats.cancellation_count} cancellation{clientStats.cancellation_count !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
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


            {reviews.length > 0 && (
              <>
                <Separator />
                <div className="px-10 py-6">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 rounded-lg border border-border/70 bg-background/60 px-4 py-3 text-left"
                    onClick={() => setReviewsOpen((open) => !open)}
                    aria-expanded={reviewsOpen}
                  >
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                          Reviews
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {reviews.length} review{reviews.length === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${reviewsOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {reviewsOpen && (
                    <div className="mt-4 space-y-3">
                      {reviews.map((review) => (
                        <div key={review.review_id} className="rounded-lg border border-border p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{review.reviewer_name || "Client"}</span>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-3 w-3 ${
                                    star <= review.rating
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-muted-foreground/30"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>
                          )}
                          <p className="mt-1 text-xs text-muted-foreground/60">
                            {new Date(review.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function ProfileField({ icon, label, value, multiline = false }) {
  const Icon = icon

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
