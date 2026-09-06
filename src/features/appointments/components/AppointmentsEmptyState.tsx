import { CalendarClock } from "lucide-react";

import { AddActionButton } from "@/components/ui/app-buttons";

type AppointmentsEmptyStateProps = {
  onNewAppointment: () => void;
};

export function AppointmentsEmptyState({
  onNewAppointment,
}: AppointmentsEmptyStateProps) {
  return (
    <div
      className="flex min-h-[min(420px,calc(100vh-16rem))] flex-col items-center justify-center px-6 py-16 text-center"
      data-testid="appointments-empty-state"
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-50 text-brand-slate shadow-2xs ring-1 ring-slate-200/70">
        <CalendarClock className="size-7" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-lg font-semibold text-brand-navy">
        No appointments yet
      </h2>
      <p className="mt-2 max-w-sm text-sm text-brand-muted">
        Reserve clinic time for a client. Bookings will appear here in the list
        and calendar.
      </p>
      <AddActionButton
        label="Schedule appointment"
        className="mt-6"
        onClick={onNewAppointment}
        data-testid="schedule-first-appointment-button"
      />
    </div>
  );
}
