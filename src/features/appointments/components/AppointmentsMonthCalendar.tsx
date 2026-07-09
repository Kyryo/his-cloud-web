"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { addMonths, format, subMonths } from "date-fns";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import type { Appointment } from "@/features/appointments/types/appointment.types";
import {
  countAppointmentsByDay,
  formatAppointmentCountBadge,
  getCalendarMonthDays,
  isInVisibleMonth,
  isToday,
} from "@/features/appointments/utils/appointment-calendar-utils";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type AppointmentsMonthCalendarProps = {
  visibleMonth: Date;
  appointments: Appointment[];
  isLoading?: boolean;
  onVisibleMonthChange: (month: Date) => void;
  onDaySelect: (day: Date) => void;
};

export function AppointmentsMonthCalendar({
  visibleMonth,
  appointments,
  isLoading = false,
  onVisibleMonthChange,
  onDaySelect,
}: AppointmentsMonthCalendarProps) {
  const dayCounts = useMemo(
    () => countAppointmentsByDay(appointments),
    [appointments],
  );
  const calendarDays = useMemo(
    () => getCalendarMonthDays(visibleMonth),
    [visibleMonth],
  );

  return (
    <div className="space-y-4" data-testid="appointments-month-calendar">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-brand-navy">
          {format(visibleMonth, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 rounded-full"
            aria-label="Previous month"
            disabled={isLoading}
            onClick={() => onVisibleMonthChange(subMonths(visibleMonth, 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 rounded-full"
            aria-label="Next month"
            disabled={isLoading}
            onClick={() => onVisibleMonthChange(addMonths(visibleMonth, 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[42rem] rounded-2xl border border-brand-border bg-white p-3 shadow-sm">
          <div className="grid grid-cols-7 gap-2 pb-2">
            {WEEKDAY_LABELS.map((label) => (
              <div
                key={label}
                className="px-2 py-1 text-center text-xs font-medium uppercase tracking-wide text-brand-muted"
              >
                {label}
              </div>
            ))}
          </div>

          <div
            className={cn(
              "grid grid-cols-7 gap-2",
              isLoading && "opacity-60",
            )}
          >
            {calendarDays.map((day) => {
              const dayKey = format(day, "yyyy-MM-dd");
              const count = dayCounts.get(dayKey) ?? 0;
              const badge = formatAppointmentCountBadge(count);
              const inMonth = isInVisibleMonth(day, visibleMonth);
              const today = isToday(day);

              return (
                <button
                  key={dayKey}
                  type="button"
                  disabled={isLoading}
                  onClick={() => onDaySelect(day)}
                  className={cn(
                    "group relative flex min-h-24 flex-col rounded-xl border p-2 text-left transition-all",
                    "hover:border-brand-primary/30 hover:bg-brand-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40",
                    !inMonth && "border-transparent bg-brand-surface/50 text-brand-muted",
                    inMonth && "border-brand-border/70 bg-white",
                  )}
                  data-testid={`appointments-calendar-day-${dayKey}`}
                >
                  <span
                    className={cn(
                      "inline-flex size-7 items-center justify-center rounded-full text-sm font-medium",
                      today && "bg-brand-primary text-white",
                      !today && inMonth && "text-brand-navy",
                    )}
                  >
                    {format(day, "d")}
                  </span>

                  {badge ? (
                    <span className="mt-auto inline-flex w-fit max-w-full items-center rounded-full bg-brand-primary/10 px-2 py-0.5 text-xs font-medium text-brand-primary">
                      <span className="truncate">
                        {count === 1 ? "1 appointment" : `${badge} appointments`}
                      </span>
                    </span>
                  ) : inMonth ? (
                    <span className="mt-auto text-xs text-brand-muted/70">No appointments</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
