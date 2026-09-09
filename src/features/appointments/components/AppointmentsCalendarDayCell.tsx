"use client";

import { format } from "date-fns";

import type { Appointment } from "@/features/appointments/types/appointment.types";
import { APPOINTMENT_BOARD_ACCENT, APPOINTMENT_BOARD_LABELS } from "@/features/appointments/utils/appointment-board";
import { CALENDAR_DAY_VISIBLE_COUNT } from "@/features/appointments/utils/appointment-calendar.constants";
import {
  formatCalendarChipName,
  formatCalendarChipTime,
  getCalendarDayPreview,
} from "@/features/appointments/utils/appointment-calendar-utils";
import { cn } from "@/lib/utils";

const APPOINTMENT_ROW_STYLE: Record<Appointment["status"], string> = {
  scheduled: "border-stone-400 hover:bg-stone-50",
  confirmed: "border-brand-primary hover:bg-brand-primary/5",
  in_progress: "border-brand-amber hover:bg-amber-50/70",
  completed: "border-brand-green hover:bg-brand-green-tint",
  cancelled: "border-red-500 opacity-55 hover:bg-red-50/70",
  no_show: "border-rose-600 opacity-55 hover:bg-rose-50/70",
  rescheduled: "border-violet-500 hover:bg-violet-50/70",
};

type AppointmentsCalendarDayCellProps = {
  day: Date;
  appointments: Appointment[];
  inMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  selected?: boolean;
  disabled?: boolean;
  onDaySelect: (day: Date) => void;
  onAppointmentSelect?: (appointment: Appointment) => void;
};

export function AppointmentsCalendarDayCell({
  day,
  appointments,
  inMonth,
  isToday,
  isWeekend,
  disabled = false,
  selected = false,
  onDaySelect,
  onAppointmentSelect,
}: AppointmentsCalendarDayCellProps) {
  const dayKey = format(day, "yyyy-MM-dd");
  const preview = getCalendarDayPreview(appointments, CALENDAR_DAY_VISIBLE_COUNT);

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label={`${format(day, "EEEE, d MMMM yyyy")}, ${appointments.length} appointments`}
      aria-pressed={selected}
      data-testid={`appointments-calendar-day-${dayKey}`}
      className={cn(
        "group relative flex min-h-[138px] min-w-0 flex-col gap-2 border-r border-b border-border/60 bg-background p-2.5 text-left transition-colors last:border-r-0 [&:nth-child(7n)]:border-r-0",
        "focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-inset",
        !disabled && "hover:bg-slate-50/80",
        isWeekend && inMonth && "bg-muted/20",
        selected && "z-[1] bg-brand-primary/[0.055]",
        !inMonth && "bg-muted/30 text-muted-foreground opacity-45",
      )}
      onClick={() => {
        if (!disabled) {
          onDaySelect(day);
        }
      }}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget || disabled || (event.key !== "Enter" && event.key !== " ")) {
          return;
        }
        event.preventDefault();
        onDaySelect(day);
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex size-7 items-center justify-center rounded-full text-[13px] font-semibold tabular-nums",
            isToday && "bg-brand-primary text-white",
            !isToday && selected && "text-brand-primary",
            !isToday && !selected && "text-brand-navy",
          )}
        >
          {format(day, "d")}
        </span>
        {appointments.length > 0 ? (
          <span className="text-[10px] font-medium tabular-nums text-muted-foreground">
            {appointments.length}
          </span>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 space-y-1">
        {preview.visible.map((appointment) => (
          <button
            key={appointment.uuid}
            type="button"
            disabled={disabled}
            title={`${appointment.patient_name} · ${APPOINTMENT_BOARD_LABELS[appointment.status]} · ${appointment.clinician_name || "Unassigned"}`}
            className={cn(
              "flex w-full items-center gap-1.5 border-l-2 px-2 py-1 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary disabled:pointer-events-none",
              APPOINTMENT_ROW_STYLE[appointment.status],
            )}
            onClick={(event) => {
              event.stopPropagation();
              if (onAppointmentSelect) onAppointmentSelect(appointment);
              else onDaySelect(day);
            }}
          >
            <span
              aria-hidden="true"
              className={cn("size-1.5 shrink-0 rounded-full", APPOINTMENT_BOARD_ACCENT[appointment.status] ?? "bg-slate-300")}
            />
            <span className="shrink-0 text-[10px] font-medium tabular-nums text-slate-500">
              {formatCalendarChipTime(appointment.scheduled_start)}
            </span>
            <span className="min-w-0 truncate text-[11px] font-semibold text-brand-navy">
              {formatCalendarChipName(appointment.patient_name)}
            </span>
          </button>
        ))}
        {preview.overflow > 0 ? (
          <p className="px-1.5 pt-0.5 text-[10px] font-medium text-brand-primary">
            +{preview.overflow} more visits
          </p>
        ) : null}
      </div>
    </div>
  );
}
