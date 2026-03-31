export function ClientAppointments() {
  return (
    <div className="flex w-full flex-col gap-3">
      <h1 className="text-2xl font-semibold tracking-tight">Your Appointments</h1>
      <p className="text-muted-foreground text-sm leading-relaxed">
        Client-side posting currently shows available slots and next actions. Coming soon: requests and saved preferences.
      </p>
    </div>
  )
}
