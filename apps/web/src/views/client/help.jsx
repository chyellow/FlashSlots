import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const faqs = [
  {
    question: "How do I book an available appointment?",
    answer:
      "From the Home tab, choose an opening from the available appointments list and click Select. FlashSlots places a temporary hold on that opening so you can confirm it before it expires.",
  },
  {
    question: "What happens when an appointment is on hold?",
    answer:
      "A hold reserves the appointment for a short time while you decide whether to confirm it. If the timer expires or you cancel, the opening can become available again to the public.",
  },
  {
    question: "How can I learn more about a provider before booking?",
    answer:
      "Click the provider name on an appointment card to open the profile modal. There you can see profile details, ratings, and reviews when those are available.",
  },
  {
    question: "When can I leave a review?",
    answer:
      "Once an appointment is marked completed, it moves into your completed appointments section and the Review action becomes available if you have not already submitted feedback.",
  },
]

export function ClientHelpPage() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <div className="flex flex-col gap-8">
      <section className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Help Center
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Quick answers for booking and managing appointments.
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
          Use this page for common client questions about finding providers,
          confirming appointments, and leaving reviews after your visit.
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
          Sorry!
        </p>
      </section>
    </div>
  )
}
