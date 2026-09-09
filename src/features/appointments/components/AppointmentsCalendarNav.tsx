"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { addMonths, format, isSameMonth, startOfMonth, subMonths } from "date-fns";

import { Button } from "@/components/ui/button";

type AppointmentsCalendarNavProps = {
  visibleMonth: Date;
  isLoading?: boolean;
  onVisibleMonthChange: (month: Date) => void;
};

export function AppointmentsCalendarNav({
  visibleMonth,
  isLoading = false,
  onVisibleMonthChange,
}: AppointmentsCalendarNavProps) {
  const isCurrentMonth = isSameMonth(visibleMonth, new Date());

  return (
    <div className="flex min-h-16 items-center justify-between gap-4 border-b border-border bg-background px-4 sm:px-6">
      <h2 className="truncate text-lg font-semibold tracking-[-0.02em] text-foreground sm:text-xl">
        {format(visibleMonth, "MMMM yyyy")}
      </h2>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="hidden h-8 rounded-md border-border bg-background px-3 text-xs shadow-none sm:inline-flex"
          disabled={isLoading || isCurrentMonth}
          onClick={() => onVisibleMonthChange(startOfMonth(new Date()))}
        >
          Today
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 rounded-md border-border bg-background text-muted-foreground shadow-none hover:text-foreground"
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
          className="size-8 rounded-md border-border bg-background text-muted-foreground shadow-none hover:text-foreground"
          aria-label="Next month"
          disabled={isLoading}
          onClick={() => onVisibleMonthChange(addMonths(visibleMonth, 1))}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
