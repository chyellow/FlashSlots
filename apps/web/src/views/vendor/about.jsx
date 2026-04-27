export function VendorAboutPage() {
  const highlights = [
    {
      title: "Recover missed revenue",
      description:
        "FlashSlots turns last-minute cancellations into sellable openings instead of dead time on the schedule.",
    },
    {
      title: "Reach ready-to-book clients",
      description:
        "Open appointments are published in real time so clients can discover and claim them while the slot is still useful.",
    },
    {
      title: "Stay in control",
      description:
        "Vendors choose the appointment details, how long the listing stays live, and when to publish or remove availability.",
    },
  ]

  const steps = [
    {
      title: "Create a draft slot",
      description:
        "Select time directly on the calendar, then add the staff member, appointment type, expiration window, and price.",
    },
    {
      title: "Publish to the marketplace",
      description:
        "When the slot looks right, publish it so nearby clients can see the opening before it expires.",
    },
    {
      title: "Manage bookings from one place",
      description:
        "Track open, claimed, completed, and past appointments from the vendor dashboard and update appointments as needed.",
    },
  ]

  const features = [
    "Post newly opened appointment times without rebuilding your whole schedule.",
    "Keep booked and unclaimed appointments visible on the same calendar.",
    "Adjust listing details such as staff name and booking expiration timing.",
    "Mark completed appointments and manage active listings from the dashboard.",
  ]

  return (
    <div className="flex flex-col gap-8">
      <section className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          About FlashSlots
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          A marketplace for appointments that would otherwise go unused.
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
          FlashSlots helps service providers recover revenue from last-minute
          cancellations by instantly advertising newly opened time slots to
          clients who are ready to book. The vendor experience is built around
          speed: create a slot, publish it, and manage the response from one
          calendar-driven workflow.
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
            How the program works
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
            What vendors can do here
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
            This alpha focuses on real-time appointment posting and management
            for service businesses, starting with vendor scheduling needs.
          </p>
        </aside>
      </section>
    </div>
  )
}
