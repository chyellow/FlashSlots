export function ClientAboutPage() {
  const highlights = [
    {
      title: "Find real openings fast",
      description:
        "FlashSlots helps clients discover last-minute appointment openings while they are still available to claim.",
    },
    {
      title: "Book around your schedule",
      description:
        "Instead of waiting days for a standard booking slot, clients can grab newly opened times that fit today or this week.",
    },
    {
      title: "Manage everything in one place",
      description:
        "From browsing providers to confirming appointments, completing visits, and leaving reviews, the client experience stays in one dashboard.",
    },
  ]

  const steps = [
    {
      title: "Browse available appointments",
      description:
        "View live openings from service providers, compare times, prices, and appointment types, and choose the option that fits your needs.",
    },
    {
      title: "Place a hold and confirm",
      description:
        "When you select an opening, FlashSlots temporarily holds it so you can confirm before someone else claims the same time.",
    },
    {
      title: "Return after the appointment",
      description:
        "After the service is completed, you can review the provider and keep a record of confirmed and completed visits in your account.",
    },
  ]

  const features = [
    "See provider names, appointment types, prices, and staff details before booking.",
    "Track available, confirmed, and completed appointments from the client home view.",
    "Open provider profiles to check ratings, reviews, and basic business details.",
    "Leave feedback after completed appointments to help future clients decide.",
  ]

  return (
    <div className="flex flex-col gap-8">
      <section className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          About FlashSlots
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          A faster way to book appointments that open up at the last minute.
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
          FlashSlots helps clients find time-sensitive openings from service
          providers in real time. Instead of missing out when schedules change,
          clients can browse newly available appointments, secure a spot
          quickly, and manage the full booking lifecycle from one place.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <article
            key={item.title}
            className="rounded-xl border bg-card p-5 shadow-sm"
          >
            <h2 className="text-base font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {item.description}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold tracking-tight">
            How booking works
          </h2>
          <div className="mt-5 space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="flex gap-4 rounded-lg border border-border/70 bg-background/70 p-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-sm font-semibold sm:text-base">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold tracking-tight">
            What clients can do here
          </h2>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-muted-foreground">
            {features.map((feature) => (
              <li
                key={feature}
                className="rounded-lg border border-border/70 bg-background/70 px-4 py-3"
              >
                {feature}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs leading-5 text-muted-foreground">
            This alpha focuses on helping clients claim last-minute openings
            from participating service providers and manage those bookings
            clearly.
          </p>
        </aside>
      </section>
    </div>
  )
}
