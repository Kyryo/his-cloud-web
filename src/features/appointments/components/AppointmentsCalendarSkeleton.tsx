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
  const weekCount = Math.ceil(calendarDays.length / 7);

  return (
    <div
      className="-mx-4 flex min-h-0 flex-1 flex-col md:-mx-6"
      aria-busy="true"
      data-testid="appointments-calendar-skeleton"
    >
      <span className="sr-only">Loading calendar</span>
      <div className="grid min-h-0 grid-cols-1 border-y border-border bg-background xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 overflow-hidden">
          <div className="flex min-w-[700px] flex-col">
            <div className="flex min-h-16 items-center justify-between border-b border-border px-4 sm:px-6">
              <span className="text-lg font-semibold sm:text-xl">
                {format(visibleMonth, "MMMM yyyy")}
              </span>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16 rounded-md" />
                <Skeleton className="size-8 rounded-md" />
                <Skeleton className="size-8 rounded-md" />
              </div>
            </div>
            <div className="grid grid-cols-7 border-b border-border bg-muted/30">
              {WEEKDAY_LABELS.map((label) => (
                <div
                  key={label}
                  className="px-3 py-2.5 text-right text-[11px] font-semibold text-muted-foreground"
                >
                  {label}
                </div>
              ))}
            </div>
            <div
              className={cn(
                "grid grid-cols-7",
                weekCount === 6
                  ? "grid-rows-6"
                  : weekCount === 5
                    ? "grid-rows-5"
                    : "grid-rows-4",
              )}
            >
              {calendarDays.map((day) => {
                const inMonth = day.getMonth() === visibleMonth.getMonth();
                return (
                  <div
                    key={format(day, "yyyy-MM-dd")}
                    className={cn(
                      "min-h-[138px] border-r border-b border-border/70 px-2.5 py-2.5",
                      !inMonth && "opacity-35",
                    )}
                  >
                    <Skeleton className="size-7 rounded-full" />
                    {inMonth ? (
                      <Skeleton className="mt-3 h-3 w-full rounded-none" />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <aside className="hidden border-l border-border xl:block">
          <div className="flex min-h-16 items-center justify-between border-b border-border px-5">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28 rounded-none" />
              <Skeleton className="h-3 w-14 rounded-none" />
            </div>
            <Skeleton className="h-8 w-14 rounded-md" />
          </div>
          {[0, 1, 2].map((row) => (
            <div
              key={row}
              className="grid grid-cols-[3.25rem_minmax(0,1fr)] gap-3 border-b border-border px-5 py-4"
            >
              <Skeleton className="mt-1 h-3 w-10 rounded-none" />
              <div
                className="space-y-2 border-l border-border pl-3"
              >
                <Skeleton className="h-4 w-32 rounded-none" />
                <Skeleton className="h-3 w-24 rounded-none" />
                <Skeleton className="h-3 w-28 rounded-none" />
              </div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
