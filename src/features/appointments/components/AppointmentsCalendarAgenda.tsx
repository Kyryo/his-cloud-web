"use client";

import { format } from "date-fns";
import { CalendarDays, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AppointmentsClinicianChip } from "@/features/appointments/components/AppointmentsClinicianChip";
import type { Appointment } from "@/features/appointments/types/appointment.types";
import {
  APPOINTMENT_BOARD_LABELS,
  APPOINTMENT_STATUS_LINE,
  APPOINTMENT_STATUS_PILL,
} from "@/features/appointments/utils/appointment-board";
import { formatCalendarChipTime } from "@/features/appointments/utils/appointment-calendar-utils";
import { cn } from "@/lib/utils";

type AppointmentsCalendarAgendaProps = {
  day: Date;
  appointments: Appointment[];
  disabled: boolean;
  onSchedule: () => void;
  onAppointmentSelect?: (appointment: Appointment) => void;
};

export function AppointmentsCalendarAgenda({
  day,
  appointments,
  disabled,
  onSchedule,
  onAppointmentSelect,
}: AppointmentsCalendarAgendaProps) {
  const unassigned = appointments.filter(
    (appointment) =>
      !appointment.clinician &&
      ["scheduled", "confirmed", "rescheduled"].includes(
        appointment.status,
      ),
  ).length;

  return (
    <aside
      aria-label="Selected day agenda"
      className="flex h-full min-h-0 flex-col border-t border-border bg-white xl:border-t-0 xl:border-l-2 xl:border-l-brand-primary"
    >
      <div className="flex min-h-12 items-center justify-between gap-3 border-b border-border px-5">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold tracking-tight text-foreground">
            {format(day, "EEEE, d MMM")}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {appointments.length} {appointments.length === 1 ? "visit" : "visits"}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Find a time"
          disabled={disabled}
          onClick={onSchedule}
          className="h-8 shrink-0 gap-1.5 rounded-md px-2.5 text-xs text-brand-primary hover:bg-brand-primary/5 hover:text-brand-primary"
        >
          <Plus className="size-3.5" />
          Add
        </Button>
      </div>
      {unassigned > 0 ? (
        <p
          role="status"
          className="border-b border-amber-500/20 bg-amber-50/70 px-5 py-3 text-xs leading-relaxed text-amber-950"
        >
          {unassigned} {unassigned === 1 ? "visit needs" : "visits need"} a
          care provider.
        </p>
      ) : null}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {appointments.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-20 text-center">
            <CalendarDays
              className="mb-4 size-7 text-muted-foreground/50"
              strokeWidth={1.5}
            />
            <p className="text-sm font-medium">Open schedule</p>
            <p className="mt-2 max-w-48 text-xs leading-relaxed text-muted-foreground">
              There are no visits booked for this day.
            </p>
            <Button
              variant="link"
              size="sm"
              disabled={disabled}
              onClick={onSchedule}
              className="mt-3 h-auto px-0 text-xs text-brand-primary"
            >
              Find an available time
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {appointments.map((appointment) => (
              <button
                key={appointment.uuid}
                type="button"
                disabled={disabled}
                onClick={() =>
                  onAppointmentSelect
                    ? onAppointmentSelect(appointment)
                    : onSchedule()
                }
                className="group grid w-full grid-cols-[3.25rem_minmax(0,1fr)] gap-3 px-5 py-4 text-left transition-colors hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-primary disabled:opacity-50"
              >
                <span className="pt-0.5 text-xs font-semibold tabular-nums text-brand-navy">
                  {formatCalendarChipTime(appointment.scheduled_start)}
                </span>
                <span
                  className={cn(
                    "min-w-0 border-l-2 pl-3",
                    APPOINTMENT_STATUS_LINE[appointment.status],
                  )}
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-brand-navy group-hover:text-brand-primary">
                      {appointment.patient_name}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                        APPOINTMENT_STATUS_PILL[appointment.status],
                      )}
                    >
                      {APPOINTMENT_BOARD_LABELS[appointment.status]}
                    </span>
                  </span>
                  <span className="mt-1 block truncate text-xs text-brand-muted">
                    {appointment.department_name}
                  </span>
                  <AppointmentsClinicianChip
                    name={appointment.clinician_name}
                    className="mt-2"
                  />
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
