import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const faqs = [
  {
    question: "How do I post a new opening?",
    answer:
      "Open the Appointments tab, drag on the calendar to create a time slot, fill in the appointment details, and then click Publish. Draft slots stay on your calendar until you publish them to the marketplace.",
  },
  {
    question: "What happens if I create a slot but do not publish it?",
    answer:
      "Unpublished slots remain as temporary openings that disappear unless confirmed and published. Clients cannot see or book them until you hit Publish, which gives you a chance to review the time, price, and expiration settings first.",
  },
  {
    question: "Can I edit or cancel an appointment after it is posted?",
    answer:
      "Yes. Published calendar listings can be opened from the schedule so you can adjust appointment details, and active listings can also be canceled from the dashboard if plans change.",
  },
  {
    question: "What do the appointment statuses mean?",
    answer:
      "Booked appointments have been claimed by a client, active listings are still available or on hold, completed appointments are finished services, and past or cancelled items are no longer open for booking.",
  },
]

export function VendorHelpPage() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <div className="flex flex-col gap-8">
      <section className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Help Center
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Quick answers for managing your FlashSlots vendor workflow.
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
          Use this page for common questions about creating openings,
          publishing availability, and managing appointments.
        </p>
      </section>

      <section className="grid gap-3">
        {faqs.map((item, index) => {
          const isOpen = openIndex === index

          return (
            <article
              key={item.question}
              className="overflow-hidden rounded-xl border bg-card shadow-sm"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={isOpen}
              >
                <span className="text-sm font-semibold sm:text-base">
                  {item.question}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                    isOpen && "rotate-180",
                  )}
                />
              </button>

              {isOpen && (
                <div className="border-t bg-background/60 px-5 py-4">
                  <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
                    {item.answer}
                  </p>
                </div>
              )}
            </article>
          )
        })}
      </section>

      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-semibold tracking-tight">Need more help?</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          You'll figure it out!
        </p>
      </section>
    </div>
  )
}
