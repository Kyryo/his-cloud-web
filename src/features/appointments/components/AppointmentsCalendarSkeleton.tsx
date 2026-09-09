import { format } from "date-fns";

import { Skeleton } from "@/components/ui/skeleton";
import { getCalendarMonthDays } from "@/features/appointments/utils/appointment-calendar-utils";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type AppointmentsCalendarSkeletonProps = {
  visibleMonth: Date;
};

export function AppointmentsCalendarSkeleton({
  visibleMonth,
}: AppointmentsCalendarSkeletonProps) {
  const calendarDays = getCalendarMonthDays(visibleMonth);

  return (
    <div
      className="space-y-4"
      aria-busy="true"
      data-testid="appointments-calendar-skeleton"
    >
      <span className="sr-only">Loading calendar</span>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-brand-navy">
          {format(visibleMonth, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-1">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="size-8 rounded-full" />
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

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day) => {
              const inMonth = day.getMonth() === visibleMonth.getMonth();

              return (
                <div
                  key={format(day, "yyyy-MM-dd")}
                  className={cn(
                    "flex min-h-24 flex-col rounded-xl border p-2",
                    inMonth
                      ? "border-brand-border/70 bg-white"
                      : "border-transparent bg-dash-canvas/80",
                  )}
                >
                  <Skeleton className="size-7 rounded-full" />
                  {inMonth ? (
                    <Skeleton className="mt-auto h-5 w-[4.5rem] rounded-full" />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
